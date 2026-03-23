import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";

/* =========================================
   LOAD ENV
========================================= */
dotenv.config();

/* =========================================
   VALIDATE ENV
========================================= */
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "OPENROUTER_API_KEY"];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

/* =========================================
   INIT APP
========================================= */
const app = express();

/* =========================================
   CONNECT DATABASE
========================================= */
connectDB();

/* =========================================
   MIDDLEWARE
========================================= */
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================
   REQUEST LOGGER
========================================= */
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================================
   ROUTES
========================================= */

/* AUTH */
app.use("/api/auth", authRoutes);

/* CHAT (IMPORTANT) */
app.use("/api/chat", chatRoutes);

/* GOALS */
app.use("/api/goals", goalRoutes);

/* =========================================
   HEALTH CHECK
========================================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server running ✅",
    time: new Date()
  });
});

/* =========================================
   404 HANDLER
========================================= */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

/* =========================================
   START SERVER
========================================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("🧠 AI Planner Ready");
  console.log("=================================");
});

/* =========================================
   HANDLE CRASHES
========================================= */
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED PROMISE:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err.message);
});

/* =========================================
   GRACEFUL SHUTDOWN
========================================= */
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");

  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});