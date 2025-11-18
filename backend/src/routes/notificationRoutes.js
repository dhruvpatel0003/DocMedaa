const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  clearAllNotifications
}=require("../controllers/notificationController.js");
const authMiddleware = require("../middleware/auth.js");


router.post("/new", authMiddleware, createNotification);
router.get("/", authMiddleware, getUserNotifications);
router.put("/:id/read", authMiddleware, markNotificationAsRead);
router.delete("/clear", authMiddleware, clearAllNotifications);

module.exports = router;
