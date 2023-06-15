const ErrorHandler = require("../../utils/ErrorHandler");
const sendEmail = require("../../utils/sendEmail");
const User = require("./user.model");

// Register User Service        --------------------------->>

exports.registerUserService = async (payload) => {
  const user = await User.create(payload);
  const userData = JSON.parse(JSON.stringify(user));
  delete userData.password;
  return userData;
};

// Login User Service           --------------------------->>

exports.loginUserService = async ({ email, password }) => {
  if (!email || !password) {
    throw new ErrorHandler("please provide email and password", 400);
  }
  const user = await User.findOne({ email }).select("+password"); // Check if user exist or not through email
  if (!user) {
    throw new ErrorHandler("email or password is incorrect", 400);
  }
  const isPasswordMatch = await user.comparePassword(password); // Compare Password method from user modal to check password.
  if (!isPasswordMatch) {
    throw new ErrorHandler("email or password is incorrect", 400);
  }
  const userData = JSON.parse(JSON.stringify(user));
  delete userData.password;
  return userData;
};

// Forgot Password Service      --------------------------->>

exports.forgotPasswordService = async (email, protocol) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorHandler("Email not found", 404);
  }
  const resetToken = await user.getResetPasswordToken(); // Reset Password method from modal
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${protocol}://localhost:3000/auth/password/reset/${resetToken}`;
  const message = `Your password reset token is - \n\n  ${resetPasswordUrl} \n\n if you are not requested ignore it`;
  await sendEmail({
    email: user.email,
    subject: "Password reset token",
    message,
  });
  return user;
};

exports.updateUserProfile = async (_id, { userName, email }) => {
  const user = await User.findByIdAndUpdate(
    { _id },
    { userName, email },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  return user;
};
