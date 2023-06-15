const User = require("./user.model");
const catchAsyncError = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/ErrorHandler");
const crypto = require("crypto");
const sendToken = require("../../utils/jwtToken");
const {
  registerUserService,
  forgotPasswordService,
  loginUserService,
  updateUserProfile,
} = require("./user.service");

exports.registerUser = catchAsyncError(async (req, res) => {
  const userData = await registerUserService(req.body);
  sendToken(userData, 201, res);
});

exports.loginUser = catchAsyncError(async (req, res) => {
  const userData = await loginUserService(req.body);
  sendToken(userData, 200, res);
});

exports.logout = catchAsyncError(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), // Expires token immediately
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await forgotPasswordService(req.body.email, req.protocol);
  next();
  try {
    res.status(200).json({
      success: true,
      message: `email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

exports.getUserDetails = catchAsyncError(async (req, res) => {
  const user = await User.findById(req.user.id); // Will search from its own Id with the help of token and isAuthenticate Middleware

  res.status(200).json({
    status: true,
    user,
  });
});

exports.updateProfile = catchAsyncError(async (req, res) => {
  await updateUserProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("password reset token is invalid or has expired", 400)
    );
  }

  if (!req.body.password) {
    return next(new ErrorHandler("please provide password", 400));
  }
  if (!req.body.confirmPassword) {
    return next(new ErrorHandler("please provide confirm password", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("password and confirm password does not match", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  const userData = JSON.parse(JSON.stringify(user));
  delete userData.password;
  delete userData.role;
  sendToken(userData, 200, res);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();
  const userData = JSON.parse(JSON.stringify(user));
  delete userData.password;
  delete userData.role;
  sendToken(userData, 200, res);
});
