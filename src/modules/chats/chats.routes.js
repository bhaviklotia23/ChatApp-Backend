const express = require("express");
const { isAuthenticUser } = require("../../middleware/auth");

const { accessChat, fetchChats } = require("./chats.controller");

const router = express.Router();

router.route("/").post(isAuthenticUser, accessChat);
router.route("/").get(isAuthenticUser, fetchChats);

module.exports = router;
