const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
// const Message = require('./models/message');
const appointmentRoutes = require('./routes/appointmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const sendAppointmentReminder = require("./utils/appointmentReminderEmail.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

sendAppointmentReminder();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/docmedaa_dummy';

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST"],
//   },
// });

if (process.env.NODE_ENV !== 'test') {
  connectDB(MONGO_URI).catch(err => {
    console.error('Failed to connect DB:', err);
    process.exit(1);
  });
}

app.use('/api/auth', authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/articles", articleRoutes);
app.get('/', (req, res) => res.send('DocMedaa API running'));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

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
