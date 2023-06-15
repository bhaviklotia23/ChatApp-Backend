const catchAsyncError = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/ErrorHandler");
const Chat = require("../chats/chats.model");
const User = require("../user/user.model");
const Message = require("../messages/messages.model");

exports.allMessages = catchAsyncError(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "userName email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    return next(new ErrorHandler("No data found", 400));
  }
});

exports.sendMessage = catchAsyncError(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(new ErrorHandler("Message cannot be empty", 400));
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

   message = await Message.populate(message, {
     path: "sender",
     select: "userName",
   });
   message = await Chat.populate(message, { path: "chat" });
   message = await User.populate(message, {
     path: "chat.users",
     select: "userName email",
   });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
