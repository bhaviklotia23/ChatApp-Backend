const express = require("express");
const { isAuthenticUser } = require("../../middleware/auth");

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  getUserDetails,
  updateProfile,
  resetPassword,
  updatePassword,
} = require("./user.controller");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgotpassword").post(forgotPassword);

router.route("/logout").get(logout);
router.route("/me").get(isAuthenticUser, getUserDetails);

router.route("/me/update").put(isAuthenticUser, updateProfile);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticUser, updatePassword);

module.exports = router;
