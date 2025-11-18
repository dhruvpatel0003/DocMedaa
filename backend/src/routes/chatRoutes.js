const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const chatController = require("../controllers/chatController");

router.post("/create-channel", authMiddleware, chatController.createChannel); // Doctor only
router.delete("/channel/:channelId", authMiddleware, chatController.deleteChannel); // Doctor only
router.post("/request-join", authMiddleware, chatController.requestToJoin); // Patient
router.post("/cancel-request", authMiddleware, chatController.cancelRequest); // Patient cancel join
router.post("/approve-member", authMiddleware, chatController.approveMember); // Doctor
router.post("/remove-member", authMiddleware, chatController.removeMember); // Doctor or patient
router.get("/channels", authMiddleware, chatController.getChannels); // All channels
router.get("/channel/:channelId", authMiddleware, chatController.getChannelById);
router.post("/send-message", authMiddleware, chatController.sendMessage);
router.get("/messages/:channelId", authMiddleware, chatController.getMessages);
router.delete("/message/:messageId", authMiddleware, chatController.deleteMessage);

module.exports = router;
