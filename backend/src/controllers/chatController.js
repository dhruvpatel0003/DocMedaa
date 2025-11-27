const Channel = require("../models/channel");
const Message = require("../models/message");

// Doctor: Create a channel
exports.createChannel = async (req, res) => {
  if (req.user.role !== "Doctor")
    return res.status(403).json({ message: "Doctors only" });
  const { name } = req.body;
  try {
    const channel = await Channel.create({
      name,
      doctor: req.user.id,
      members: []
    });
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ message: "Error creating channel", error: err });
  }
};

// Doctor: Delete a channel
exports.deleteChannel = async (req, res) => {
  const { channelId } = req.params;
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    if (String(channel.doctor) !== String(req.user.id)) 
      return res.status(403).json({ message: "Not authorized" });
    await Message.deleteMany({ channel: channelId });
    await channel.deleteOne();
    res.json({ success: true, message: "Channel deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting channel", error: err });
  }
};

// Patient: Request to join a channel
exports.requestToJoin = async (req, res) => {
  const { channelId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    const exists = channel.members.find(m => String(m.user) === String(req.user.id));
    if (exists) return res.status(400).json({ message: "Already requested or joined" });
    channel.members.push({ user: req.user.id, status: "pending" });
    await channel.save();
    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: "Error joining channel", error: err });
  }
};

// Patient: Cancel join request (while pending)
exports.cancelRequest = async (req, res) => {
  const { channelId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    channel.members = channel.members.filter(
      m => !(String(m.user) === String(req.user.id) && m.status === "pending")
    );
    await channel.save();
    res.json({ success: true, message: "Request canceled" });
  } catch (err) {
    res.status(500).json({ message: "Error canceling request", error: err });
  }
};

// Doctor: Approve patient
exports.approveMember = async (req, res) => {
  const { channelId, patientId } = req.body;
<<<<<<< HEAD
  console.log("Approving patient:", patientId, "for channel:", channelId);
=======
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
  try {
    const channel = await Channel.findById(channelId);
    if (String(channel.doctor) !== String(req.user.id))
      return res.status(403).json({ message: "Not channel owner" });
    const member = channel.members.find(m => String(m.user) === String(patientId));
    if (!member) return res.status(404).json({ message: "Member not found" });
    member.status = "approved";
    await channel.save();
    res.json({ message: "Patient approved" });
  } catch (err) {
    res.status(500).json({ message: "Error approving member", error: err });
  }
};


// Doctor or Patient: Remove member (doctor removes, or patient leaves)
exports.removeMember = async (req, res) => {
  const { channelId, patientId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    const isDoctor = String(channel.doctor) === String(req.user.id);
    const isPatient = String(req.user.id) === String(patientId);
    if (!isDoctor && !isPatient)
      return res.status(403).json({ message: "Not authorized" });

    const origLength = channel.members.length;
    channel.members = channel.members.filter(m => String(m.user) !== String(patientId));
    if (channel.members.length === origLength)
      return res.status(404).json({ message: "User not found in channel" });
    await channel.save();
    res.json({ success: true, message: "Member removed from channel" });
  } catch (err) {
    res.status(500).json({ message: "Error removing member", error: err });
  }
};

// Get channel info by ID
exports.getChannelById = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate("doctor", "fullName");
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: "Error fetching channel", error: err });
  }
};

// List channels (doctors see theirs, patients see all)
exports.getChannels = async (req, res) => {
  try {
    let channels;
    if (req.user.role === "Doctor") {
      channels = await Channel.find({ doctor: req.user.id });
    } else {
      channels = await Channel.find();
<<<<<<< HEAD
      console.log("Fetched channels for patient:", channels.length,channels);
=======
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
    }
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: "Error fetching channels", error: err });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { channelId, message } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    const isDoctor = String(channel.doctor) === String(req.user.id);
    const isMember = channel.members.some(
      m => String(m.user) === String(req.user.id) && m.status === "approved"
    );
    if (!isDoctor && !isMember)
      return res.status(403).json({ message: "Not a member of channel." });

    const newMsg = await Message.create({
      channel: channelId,
      sender: req.user.id,
      message
    });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err });
  }
};

// Get messages for a channel
<<<<<<< HEAD
// exports.getMessages = async (req, res) => {
//   const { channelId } = req.params;
//   try {
//     const channel = await Channel.findById(channelId);
//     const isDoctor = String(channel.doctor) === String(req.user.id);
//     const isMember = channel.members.some(
//       m => String(m.user) === String(req.user.id) && m.status === "approved"
//     );
//     if (!isDoctor && !isMember)
//       return res.status(403).json({ message: "Not a member." });
//     const messages = await Message.find({ channel: channelId }).populate(
//       "sender",
//       "fullName role"
//     );
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages", error: err });
//   }
// };
// GET /api/chat/messages/:channelId?page=1&limit=20
exports.getMessages = async (req, res) => {
  const { channelId } = req.params;
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const skip = (page - 1) * limit;

  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const isDoctor = String(channel.doctor) === String(req.user.id);
    const isMember = channel.members.some(
      (m) => String(m.user) === String(req.user.id) && m.status === "approved"
    );
    if (!isDoctor && !isMember)
      return res.status(403).json({ message: "Not a member." });

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "fullName role");

    const total = await Message.countDocuments({ channel: channelId });

    res.json({
      total,
      page,
      limit,
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
=======
exports.getMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const channel = await Channel.findById(channelId);
    const isDoctor = String(channel.doctor) === String(req.user.id);
    const isMember = channel.members.some(
      m => String(m.user) === String(req.user.id) && m.status === "approved"
    );
    if (!isDoctor && !isMember)
      return res.status(403).json({ message: "Not a member." });
    const messages = await Message.find({ channel: channelId }).populate(
      "sender",
      "fullName role"
    );
    res.json(messages);
  } catch (err) {
>>>>>>> 2416d6078d2dedfc4cbf677465fca63a637bf410
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
};

// Delete message (only sender)
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ message: "Not found" });
  if (String(msg.sender) !== String(req.user.id)) return res.status(403).json({ message: "Forbidden" });
  await msg.deleteOne();
  res.json({ success: true });
};
