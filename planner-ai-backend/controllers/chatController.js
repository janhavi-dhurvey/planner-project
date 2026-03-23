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
   SYSTEM PROMPT
========================================= */
const buildSystemPrompt = (subjects = []) => {

  const now = new Date();
  const currentTime = formatTime(now);

  return {
    role: "system",
    content: `
You are a professional academic planner.

Current time: ${currentTime}

Create a clean, structured study plan.

FORMAT STRICTLY:
1. Subject - 09:30 PM - 60 minutes
2. Break - 10:30 PM - 15 minutes

RULES:
- Start from current time
- Maintain correct chronological order
- No explanations
- No JSON

Subjects: ${subjects.join(", ") || "General Study"}
`
  };
};

/* =========================================
   GOAL PARSER (🔥 NO SORTING)
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

    /* ❌ NO SORTING HERE */
    return goals.length ? goals : null;

  } catch (err) {
    console.error("Goal parse error:", err.message);
    return null;
  }
};

/* =========================================
   CLEAN REPLY
========================================= */
const cleanReply = (reply) => {
  return reply.replace(/```[\s\S]*?```/g, "").trim();
};

/* =========================================
   SEND MESSAGE (🔥 FINAL FIX)
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

    chatHistory.push({ role: "assistant", content: reply });

    /* SAVE CHAT */
    await Chat.create({
      userId,
      title: message.slice(0, 40),
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: reply }
      ]
    });

    let goals = null;

    /* =========================================
       SAVE GOALS (🔥 ORDER FIX)
    ========================================= */
    if (isPlannerRequest(message)) {

      goals = extractGoals(reply);

      if (Array.isArray(goals) && goals.length > 0) {

        await Goal.deleteMany({ userId });

        const safeGoals = goals.map((g, index) => ({
          userId,
          title: g.title || "Study",
          time: g.time || "",
          duration: Number(g.duration) || 60,
          category: g.category || "📘",
          color: g.color || "#89CFF0",
          status: "pending",
          order: index   // ✅ THIS IS THE ONLY ORDER SOURCE
        }));

        await Goal.insertMany(safeGoals);

        console.log("✅ Goals saved in PERFECT order");

      }
    }

    res.json({
      reply: cleanReply(reply),
      goals
    });

  } catch (err) {

    console.error("🔥 CHAT ERROR:", err.message);

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

  } catch {
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
  } catch {
    res.status(500).json({ error: "Failed" });
  }
};