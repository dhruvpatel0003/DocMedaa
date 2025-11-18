import Notification from "../models/notification.js";

export const createNotification = async (req, res) => {
  try {
    const { sender,recipient, type, title, message } = req.body;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    const notifications = await Notification.find({ recipient: userId })
    //   .populate("sender", "fullName email role")
    //   .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/notificationController.js
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ recipient: userId });
    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
