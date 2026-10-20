const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// =====================================================
// CREATE HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make Socket.IO available inside routes
app.set("io", io);

// =====================================================
// SOCKET.IO CONNECTION
// =====================================================

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("welcome", {
    message: "Welcome to Campus Event Management real-time server"
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "Secure Campus Event REST API is running",
    websocket: "Socket.IO is enabled"
  });
});

// =====================================================
// ROUTES
// =====================================================

const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// =====================================================
// MONGODB CONNECTION
// =====================================================

const PORT = process.env.PORT || 5000;

// Start HTTP + Socket.IO server
server.listen(PORT, () => {
  console.log(`Secure REST & WebSocket server running on port ${PORT}`);
});

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB connected successfully");
    await mongoose.connection.db.admin().ping();
    console.log("MongoDB Atlas ping successful");
  } catch (error) {
    console.error("MongoDB Atlas connection notice:", error.message);
    console.log("Tip: Ensure current IP is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.");
  }
};

connectDB();