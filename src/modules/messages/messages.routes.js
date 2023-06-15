const express = require("express");
const { isAuthenticUser } = require("../../middleware/auth");

const { allMessages, sendMessage } = require("./messages.controller");

const router = express.Router();

router.route("/:chatId").get(isAuthenticUser, allMessages);
router.route("/").post(isAuthenticUser, sendMessage);

module.exports = router;
