const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const chatController = require("../controllers/chatController");

// All chat routes require authentication
router.post("/create-conversation", authMiddleware, chatController.createConversation);
router.post("/send-message", authMiddleware, chatController.sendMessage);
router.get("/messages/:conversationId", authMiddleware, chatController.getMessages);

module.exports = router;
