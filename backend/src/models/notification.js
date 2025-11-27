<<<<<<< HEAD
const mongoose = require('mongoose');
=======
import mongoose from "mongoose";
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["Appointment", "Message", "System"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

<<<<<<< HEAD
module.exports = mongoose.model("Notification", notificationSchema);
=======
export default mongoose.model("Notification", notificationSchema);
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
