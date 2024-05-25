const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const tokenExpired = (token) => {
  const decodedToken = jwt.decode(token);
  return decodedToken.exp < Date.now() / 1000;
};

const isAuthentic = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({
      success: false,
      msg: "Pleease login to access the resource",
    });
  }

  // Check if the token is expired
  const isExpired = tokenExpired(token);
  if (isExpired) {
    return res.json({
      success: false,
      msg: "Token has expired, please relogin",
    });
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const userData = await userModel.findById(decodedData.userId);
  req.user = userData;
  next();
};

module.exports = isAuthentic;
