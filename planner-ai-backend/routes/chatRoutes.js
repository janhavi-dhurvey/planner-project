import express from "express";

import {
  sendMessage,
  getChats,
  resetChat
} from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   CHAT ROUTES (ALL PROTECTED)
   BASE PATH: /api/chat
========================================= */

/* -----------------------------------------
   SEND MESSAGE TO AI
   POST /api/chat
----------------------------------------- */
router.post("/", authMiddleware, sendMessage);

/* -----------------------------------------
   GET CHAT HISTORY
   GET /api/chat
----------------------------------------- */
router.get("/", authMiddleware, getChats);

/* -----------------------------------------
   RESET CHAT SESSION
   POST /api/chat/reset
----------------------------------------- */
router.post("/reset", authMiddleware, resetChat);

/* =========================================
   EXPORT ROUTER
========================================= */

export default router;