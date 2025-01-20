import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "*", // Restrict CORS to frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/users", userRoutes);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: Token missing"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach decoded user info to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid or expired token"));
  }
});

// Socket.IO Chat Handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  // Join a room (job-specific chat room)
  socket.on("joinRoom", async ({ jobId }) => {
    try {
      const job = await mongoose.model("Job").findById(jobId);
      if (!job) return socket.emit("error", { message: "Job not found" });

      const isAuthorized =
        job.employer.toString() === socket.user.id || 
        job.applicants.some((applicant) => applicant.user.toString() === socket.user.id);

      if (!isAuthorized) return socket.emit("error", { message: "Unauthorized access to chat room" });

      socket.join(jobId);
      console.log(`User ${socket.user.id} joined room ${jobId}`);
    } catch (error) {
      console.error("joinRoom error:", error.message);
    }
  });

  // Handle message sending
  socket.on("sendMessage", async ({ jobId, sender, receiver, content }) => {
    if (!jobId || !sender || !receiver || !content) return;

    try {
      const message = await mongoose.model("Message").create({ jobId, sender, receiver, content });
      io.to(jobId).emit("receiveMessage", message); // Emit message to room
    } catch (error) {
      console.error("Error saving message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
