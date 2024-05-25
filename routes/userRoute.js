const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { generateToken } = require("../config/utils");
const isAuthentic = require("../config/auth");
const userRoute = express.Router();

// Register
userRoute.post("/register", async (req, res) => {
  const { firstname, lastname, email, phone, role, password } = req.body;

  try {
    // check if all fields are there
    if (!firstname || !lastname || !email || !phone || !password || !role) {
      return res.json({ success: false, msg: "Please add all fields" });
    }
    let user = await userModel.findOne({ email });
    if (user) {
      return res.json({ success: false, msg: "User already exists" });
    }

    user = new userModel({ firstname, lastname, email, phone, role, password });
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(password, salt);
    const token = generateToken({ userId: user._id });

    await user.save();
    console.log(token);

    return res.json({ success: true, user, token });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// / Login
userRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if all fields are there
    if (!email || !password) {
      return res.json({ success: false, msg: "Please add email and password" });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, msg: "Invalid Credentials" });
    }
    const token = generateToken({ userId: user._id });
    return res.json({ success: true, user, token });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, msg: "Server error" });
  }
});

// get user data
userRoute.get("/me", isAuthentic, async (req, res) => {
  try {
    let user = await userModel.findById(req.user._id);
    if (!user) {
      return res.json({ success: false, msg: "User Not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, msg: "Server error" });

  }
});

module.exports = userRoute;
