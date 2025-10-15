const Conversation = require("../models/conversation");
const Message = require("../models/message");

exports.createConversation = async (req, res) => {
  const { receiverId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
      });
    }

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Error creating conversation", error: err });
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId, message } = req.body;

  try {
    const newMessage = await Message.create({
      conversationId,
      senderId: req.user.id,
      message,
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId }).populate("senderId", "fullName role");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
};
