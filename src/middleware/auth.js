const User = require("../modules/user/user.model");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticUser = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization; // check cookies from frontend
  console.log(token);
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id); // Verify token through userID

  next();
});
