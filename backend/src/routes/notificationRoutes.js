const express = require("express");
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
}=require("../controllers/notificationController.js");
const authMiddleware = require("../middleware/auth.js");


router.post("/new", authMiddleware, createNotification);
router.get("/", authMiddleware, getUserNotifications);
router.put("/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
