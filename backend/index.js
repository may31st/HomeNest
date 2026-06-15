require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const sequelize = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const postRoutes = require("./routes/postRoutes");
// const startBrowser = require('./crawl_data/browser');
// const scrapeController = require('./crawl_data/scrapeController');
// const importRooms = require('./crawl_data/importRoom');

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 8080;

// Khởi tạo HTTP server với Express
const server = createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

// Định nghĩa route
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/contract", require("./routes/contractRoutes"));
app.use("/api/message", require("./routes/messages"));

// Kết nối database
const db = require("./models");
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await db.sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Maps user email -> socket.id
let onlineUsers = new Map();

// Lắng nghe kết nối từ client qua Socket.IO
io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  socket.on("join", (email) => {
    if (email) {
      onlineUsers.set(email, socket.id);
      console.log(`👤 User joined: ${email} with socket ${socket.id}`);
    }
  });

  socket.on("sendMessage", (data) => {
    const { senderEmail, receiverEmail, text } = data;
    console.log(`✉️ Message from ${senderEmail} to ${receiverEmail}: ${text}`);
    
    // Broadcast to receiver if online
    const receiverSocketId = onlineUsers.get(receiverEmail);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("getMessage", {
        senderEmail,
        receiverEmail,
        text,
        createdAt: new Date()
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`❌ User disconnected: ${key}`);
      }
    });
  });
});

// Error handling middleware - đặt trước server.listen
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Có lỗi xảy ra trong quá trình xử lý",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Chạy server
server.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${port}`);
  // let browser = startBrowser();
  // scrapeController(browser);
  // importRooms();
});

