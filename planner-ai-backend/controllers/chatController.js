import Chat from "../models/Chat.js";
import Goal from "../models/Goal.js";
import { askAI } from "../services/aiService.js";

const userChats = {};

/* =========================================
   SUBJECT EXTRACTION
========================================= */
const extractSubjects = (text) => {
  return text
    .toLowerCase()
    .replace(/give me|plan|planner|schedule|for/g, "")
    .split(/,|and|\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
};

/* =========================================
   FORMAT TIME
========================================= */
const formatTime = (date) => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

/* =========================================
   DETECT PLANNER
========================================= */
const isPlannerRequest = (text) => {
  return ["plan", "planner", "schedule"].some(word =>
    text.toLowerCase().includes(word)
  );
};

/* =========================================
   🔥 CLEAN SYSTEM PROMPT (STRICT FORMAT)
========================================= */
const buildSystemPrompt = (subjects = []) => {

  const currentTime = formatTime(new Date());

  return {
    role: "system",
    content: `
You are an academic planner AI.

Generate a clean and professional study plan.

STRICT RULES:

- NO markdown (no ###, no **, no symbols)
- NO long explanations
- NO paragraphs
- ONLY structured clean output

FORMAT:

Study Planner

Total Time: X hours

1. Subject - ${currentTime} - 60 minutes
2. Break - time - 15 minutes
3. Subject - time - 60 minutes

Rules:
- 4 to 6 sessions only
- Break after each session
- Keep it realistic

Subjects: ${subjects.join(", ") || "General Study"}
`
  };
};

/* =========================================
   EXTRACT GOALS
========================================= */
const extractGoals = (reply) => {
  try {

    const lines = reply.split("\n");

    const goals = [];

    lines.forEach(line => {
      const match = line.match(
        /(.*?)-\s*(\d{1,2}:\d{2}\s?[APMapm]{2})\s*-\s*(\d+)/
      );

      if (match) {
        goals.push({
          title: match[1].trim(),
          time: match[2].toUpperCase(),
          duration: Number(match[3]),
          category: match[1].toLowerCase().includes("break") ? "☕" : "📘",
          color: match[1].toLowerCase().includes("break") ? "#FFD93D" : "#89CFF0"
        });
      }
    });

    return goals.length ? goals : null;

  } catch (err) {
    console.error("Parse error:", err.message);
    return null;
  }
};

/* =========================================
   CLEAN RESPONSE (REMOVE GARBAGE)
========================================= */
const cleanReply = (reply) => {
  return reply
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#+/g, "")
    .replace(/\*\*/g, "")
    .trim();
};

/* =========================================
   SEND MESSAGE (🔥 FINAL CLEAN VERSION)
========================================= */
export const sendMessage = async (req, res) => {

  try {

    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const subjects = extractSubjects(message);

    userChats[userId] = [buildSystemPrompt(subjects)];
    const chatHistory = userChats[userId];

    chatHistory.push({ role: "user", content: message });

    const reply = await askAI(chatHistory);

    /* 🔥 ONLY EXTRACT GOALS IF NEEDED */
    let goals = null;

    if (isPlannerRequest(message)) {
      goals = extractGoals(reply);
    }

    /* ✅ SAVE CHAT */
    try {
      await Chat.create({
        userId,
        title: message.slice(0, 40),
        messages: [
          { role: "user", content: message },
          {
            role: "assistant",
            content: cleanReply(reply),
            structuredData: Array.isArray(goals) ? goals : []
          }
        ]
      });
    } catch (err) {
      console.error("Chat save error:", err.message);
    }

    /* ✅ SAVE GOALS (ONLY FOR PLANNER) */
    if (Array.isArray(goals) && goals.length > 0) {
      try {

        await Goal.deleteMany({ userId });

        const safeGoals = goals.map((g, index) => ({
          userId,
          title: g.title || "Study",
          time: g.time || "",
          duration: g.duration || 60,
          category: g.category || "📘",
          color: g.color || "#89CFF0",
          status: "pending",
          order: index
        }));

        await Goal.insertMany(safeGoals);

        console.log("✅ Planner saved");

      } catch (err) {
        console.error("Goal save error:", err.message);
      }
    }

    /* 🔥 IMPORTANT: DO NOT SEND GOALS TO FRONTEND */
    res.json({
      reply: cleanReply(reply)
    });

  } catch (err) {

    console.error("🔥 CHAT ERROR:", err);

    res.status(500).json({
      error: "AI server error"
    });
  }
};

/* =========================================
   GET CHATS
========================================= */
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(chats);
  } catch (err) {
    console.error("Fetch chats error:", err.message);
    res.status(500).json({ error: "Failed" });
  }
};

/* =========================================
   RESET CHAT
========================================= */
export const resetChat = async (req, res) => {
  try {
    userChats[req.userId] = [];
    res.json({ message: "Chat reset" });
  } catch (err) {
    console.error("Reset error:", err.message);
    res.status(500).json({ error: "Failed" });
  }
};