import express from "express";

import {
  sendMessage,
  getChats,
  resetChat
} from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   DEBUG LOGGER (VERY HELPFUL)
========================================= */
router.use((req, res, next) => {
  console.log(`➡️ ${req.method} /api/chat${req.path}`);
  next();
});

/* =========================================
   CHAT ROUTES (PROTECTED)
========================================= */

/* -----------------------------------------
   SEND MESSAGE
   POST /api/chat
----------------------------------------- */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    await sendMessage(req, res);
  } catch (err) {
    console.error("Route sendMessage error:", err.message);
    res.status(500).json({ error: "Failed to process message" });
  }
});

/* -----------------------------------------
   GET CHAT HISTORY
   GET /api/chat
----------------------------------------- */
router.get("/", authMiddleware, async (req, res) => {
  try {
    await getChats(req, res);
  } catch (err) {
    console.error("Route getChats error:", err.message);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

/* -----------------------------------------
   RESET CHAT
   POST /api/chat/reset
----------------------------------------- */
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    await resetChat(req, res);
  } catch (err) {
    console.error("Route resetChat error:", err.message);
    res.status(500).json({ error: "Failed to reset chat" });
  }
});

/* =========================================
   EXPORT
========================================= */
export default router;