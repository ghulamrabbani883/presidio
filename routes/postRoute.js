const express = require("express");
const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const isAuthentic = require("../config/auth");
const { sendEmail } = require("../config/utils");
const postRoute = express.Router();

// Sellers especific endpoints

// Create post as seller
postRoute.post("/seller/create", isAuthentic, async (req, res) => {
  const { place, bedroom, bathroom, area, nearby } = req.body;
  try {
    if (!place || !bedroom || !bathroom || !area || !nearby) {
      return res.json({ success: false, msg: "Please add all fields" });
    }
    const newPost = new postModel({
      place,
      area,
      bedroom,
      bathroom,
      nearby,
      user: req.user,
    });
    const post = await newPost.save();
    return res.json({ success: true, post });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Update a post by ID
postRoute.put("/seller/posts/:id", isAuthentic, async (req, res) => {
  const id = req.params.id;
  try {
    let post = await postModel.findById(id);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }

    post = await postModel.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, msg: "Post updated", post });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// / Delete a post by ID
postRoute.delete("/seller/posts/:id", isAuthentic, async (req, res) => {
  const id = req.params.id;
  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }
    const deleted = await postModel.findByIdAndDelete(id);
    return res.json({ success: true, msg: "Post removed", deleted });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Common endpoints

// Get all post
postRoute.get("/allpost", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    const filt = req.query.filter;
    let filterCriterai = {};
    if (filt) {
      filterCriterai.area = filt;
    }
    const posts = await postModel.aggregate([
      { $match: filterCriterai },
      { $skip: skip },
      { $limit: limit },
    ]);
    const [total, areas] = await Promise.all([
      postModel.countDocuments(),
      postModel.find().select("area"),
    ]);

    return res.json({
      success: true,
      posts,
      areas,
      pages: parseInt(total / limit) + 1,
    });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Get a post by ID
postRoute.get("/posts/:id", async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }
    return res.json({ success: true, post });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Buyer Specific endpoints
// Get a post by ID on Inrerest shown
postRoute.get("/posts/details/:id", async (req, res) => {
  try {
    const { userid } = req.headers;
    const postid = req.params.id;
    const post = await postModel.findById(postid);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }
    const [user, seller] = await Promise.all([
      userModel.findById(userid).select("-passwor"),
      userModel.findById(post.user).select("-passwor"),
    ]);
    // Sending email to seller
    const sellerSubject = `A new interest request from ${user.firstname} ${user.lastname}`;
    const sellerContent = `Dear ${seller.firstname} ${seller.lastname} A new interest request is made by ${user.firstname} ${user.lastname}
    User Details,
    Name: ${user.firstname} ${user.lastname},
    Email:${user.email},
    Phone:${user.phone}
    `;
    sendEmail(seller.email, sellerSubject, sellerContent);
    // Sending Email to User
    const userSubject = `Thanks for showing interest at ${post.place}`;
    const userContent = `Dear ${user.firstname} ${user.lastname} Thanks for showing interest at ${post.place} 
    Our Property Details,

    Place: ${post.place},
    Area: ${post.area},
    Bedroom: ${post.bedroom},
    Bathroom: ${post.bathroom}

    Seller Details,

    Name: ${seller.firstname} ${seller.lastname},
    Email:${seller.email},
    Phone:${seller.phone}
    
    Thanks again 
    ${seller.firstname} ${seller.lastname}
    `;
    sendEmail(user.email, userSubject, userContent);

    return res.json({ success: true, post });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Like a post
postRoute.put("/buyer/posts/like/:id", isAuthentic, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }

    // Check if the post has already been liked by this user
    if (post.likes.includes(req.user._id)) {
      return res.json({ success: false, msg: "Post already liked" });
    }

    post.likes.push(req.user._id);
    await post.save();

    return res.json({ success: true, likes: post.likes });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// Unlike a post
postRoute.put("/buyer/posts/unlike/:id", isAuthentic, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.json({ success: false, msg: "Post not found" });
    }

    // Check if the post has not yet been liked by this user
    if (!post.likes.includes(req.user._id)) {
      return res.json({ success: false, msg: "Post has not yet been liked" });
    }

    post.likes = post.likes.filter(
      (like) => like.toString() !== String(req.user._id)
    );
    await post.save();

    return res.json({ success: true, likes: post.likes });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

module.exports = postRoute;
