
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("welcome", {
    message: "Welcome to Campus Event Management real-time server"
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Secure Campus Event REST API is running",
    websocket: "Socket.IO is enabled"
  });
});

// Import routes
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");

// Validate imported routers
console.log("Event routes type:", typeof eventRoutes);
console.log("Auth routes type:", typeof authRoutes);

if (typeof eventRoutes !== "function") {
  throw new Error("eventRoutes is not a valid Express router. Check routes/eventRoutes.js export.");
}

if (typeof authRoutes !== "function") {
  throw new Error("authRoutes is not a valid Express router. Check routes/authRoutes.js export.");
}

// Register routes
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;

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
    console.error("MongoDB connection error:", error.message);
  }
};

// Start server
server.listen(PORT, () => {
  console.log(`Secure REST & WebSocket server running on port ${PORT}`);
});

connectDB();
