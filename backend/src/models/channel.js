const mongoose = require("mongoose");
const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "approved"], default: "pending" }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Channel", channelSchema);
