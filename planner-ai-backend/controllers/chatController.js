import Chat from "../models/Chat.js";
import Goal from "../models/Goal.js";
import { askAI } from "../services/aiService.js";

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
   🔥 SIMPLE + STABLE PROMPT
========================================= */
const buildPrompt = (message) => {

  const currentTime = formatTime(new Date());

  return [
    {
      role: "system",
      content: `
You are a smart academic planner.

Give a clean, helpful response like ChatGPT.

First explain briefly how to study.

Then give a structured plan.

At the end, give a simple timeline in this exact format:

Subject - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes

Start from ${currentTime}.

Do NOT use ### or markdown.
Keep it clean and readable.
`
    },
    {
      role: "user",
      content: message
    }
  ];
};

/* =========================================
   SAFE GOAL EXTRACTION (🔥 FIXED)
========================================= */
const extractGoals = (reply) => {

  try {

    const lines = reply.split("\n");
    const goals = [];

    lines.forEach(line => {

      const match = line.match(
        /(.*?)-\s*(\d{1,2}:\d{2}\s?(AM|PM))\s*-\s*(\d+)/
      );

      if (match) {
        goals.push({
          title: match[1].trim(),
          time: match[2],
          duration: Number(match[4]) || 60,
          category: match[1].toLowerCase().includes("break") ? "☕" : "📘",
          color: match[1].toLowerCase().includes("break") ? "#FFD93D" : "#89CFF0"
        });
      }

    });

    return goals.length ? goals : [];

  } catch (err) {
    console.error("Goal parse error:", err.message);
    return [];
  }
};

/* =========================================
   CLEAN RESPONSE
========================================= */
const cleanReply = (reply) => {
  return reply
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*/g, "")
    .trim();
};

/* =========================================
   SEND MESSAGE
========================================= */
export const sendMessage = async (req, res) => {

  try {

    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    /* 🔥 CALL AI */
    const reply = await askAI(buildPrompt(message));

    if (!reply) {
      return res.status(500).json({ error: "No AI response" });
    }

    const cleanedReply = cleanReply(reply);

    /* 🔥 EXTRACT GOALS SAFELY */
    let goals = [];

    if (isPlannerRequest(message)) {
      goals = extractGoals(cleanedReply);
    }

    /* SAVE CHAT */
    try {
      await Chat.create({
        userId,
        title: message.slice(0, 40),
        messages: [
          { role: "user", content: message },
          {
            role: "assistant",
            content: cleanedReply,
            structuredData: goals
          }
        ]
      });
    } catch (err) {
      console.error("Chat save error:", err.message);
    }

    /* SAVE GOALS */
    if (goals.length > 0) {
      try {

        await Goal.deleteMany({ userId });

        const safeGoals = goals.map((g, index) => ({
          userId,
          title: g.title,
          time: g.time,
          duration: g.duration,
          category: g.category,
          color: g.color,
          status: "pending",
          order: index
        }));

        await Goal.insertMany(safeGoals);

        console.log("✅ Planner saved");

      } catch (err) {
        console.error("Goal save error:", err.message);
      }
    }

    return res.json({
      reply: cleanedReply
    });

  } catch (err) {

    console.error("🔥 CHAT ERROR:", err.message);

    return res.status(500).json({
      error: "Something went wrong"
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
    res.json({ message: "Chat reset" });
  } catch (err) {
    console.error("Reset error:", err.message);
    res.status(500).json({ error: "Failed" });
  }
};