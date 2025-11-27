const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require("./models/User");
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const findDoctorRoutes = require('./routes/doctorRoutes');
const historyRoutes = require('./routes/historyRoutes');  
const Channel = require("./models/channel");
const Message = require("./models/message");
const healthTracker = require("./routes/healthTrackerRoutes");
const session = require("express-session");
const crypto = require("crypto");
const userRoutes = require('./routes/userRoutes');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Generate a secure random session secret (for dev/local, regenerate on each startup)
const secretKey = crypto.randomBytes(32).toString("hex");

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // 'secure: true' only works if running HTTPS
}));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/docmedaa_dummy';
const JWT_SECRET = process.env.JWT_SECRET || 'docmedaa_secret_dummy';

// DB connect
if (process.env.NODE_ENV !== 'test') {
  connectDB(MONGO_URI).catch(err => {
    console.error('Failed to connect DB:', err);
    process.exit(1);
  });
}

// REST routes
app.use('/api/auth', authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/findDoctor", findDoctorRoutes);
app.use("/api/history",historyRoutes);
app.use("/api/health-tracker", healthTracker);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => res.send('DocMedaa API running') );

// ---- HTTP server + Socket.IO ----
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",         // put your frontend URL here in prod
    methods: ["GET", "POST"],
  },
});

// ---- Socket auth (JWT from auth.token or Authorization header) ----
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("No auth token"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

// ---- Socket events ----
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "userId:", socket.user?.id);

  // Join a channel room for real-time messages
  socket.on("joinChannel", async (channelId) => {
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) return;

      const isDoctor = String(channel.doctor) === String(socket.user.id);
      const isMember = channel.members.some(
        (m) => String(m.user) === String(socket.user.id) && m.status === "approved"
      );
      if (!isDoctor && !isMember) return;

      socket.join(channelId.toString());
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    } catch (err) {
      console.error("joinChannel error:", err);
    }
  });

  // Leave a channel room
  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId.toString());
    console.log(`Socket ${socket.id} left channel ${channelId}`);
  });

  // Real-time send message (parallel to REST /send-message)
  socket.on("sendMessage", async ({ channelId, message }) => {
    try {
      if (!message || !channelId) return;

      const channel = await Channel.findById(channelId);
      if (!channel) return;

      const isDoctor = String(channel.doctor) === String(socket.user.id);
      const isMember = channel.members.some(
        (m) => String(m.user) === String(socket.user.id) && m.status === "approved"
      );
      if (!isDoctor && !isMember) return;

      const newMsg = await Message.create({
        channel: channelId,
        sender: socket.user.id,
        message,
      });

      const populated = await Message.findById(newMsg._id).populate(
        "sender",
        "fullName role"
      );

      // Broadcast to everyone in this channel
      io.to(channelId.toString()).emit("newMessage", populated);
    } catch (err) {
      console.error("sendMessage socket error:", err);
    }
  });

  // Real-time channel membership status updates
  // Call this from backend OR frontend after REST actions like approve / request / cancel
  socket.on("joinRequestUpdate", ({ channelId, patientId, status }) => {
    if (!channelId || !patientId || !status) return;
    io.to(channelId.toString()).emit("channelMemberStatusChanged", {
      channelId,
      patientId,
      status,        // "pending", "approved", "removed"
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ---- Start combined HTTP + WebSocket server ----
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

//NEEDS TO CHECK ONCE FRONTEND IS READY ////////////////////////
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("joinConversation", (conversationId) => {
//     socket.join(conversationId);
//     console.log(`User joined conversation: ${conversationId}`);
//   });

//   socket.on("sendMessage", async ({ conversationId, senderId, message }) => {
//     try {
//       const newMessage = await Message.create({
//         conversationId,
//         senderId,
//         message,
//       });

//       io.to(conversationId).emit("receiveMessage", newMessage);
//       console.log("Message sent:", newMessage);
//     } catch (err) {
//       console.error("Error saving message:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


module.exports = app;
