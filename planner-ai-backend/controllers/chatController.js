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
   🔥 EXTRACT SUBJECTS FROM USER INPUT (NEW)
========================================= */
const extractSubjects = (message) => {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ");

  // remove common words
  const ignore = ["give", "me", "a", "planner", "for", "and", "plan"];

  return words.filter(w => w && !ignore.includes(w));
};

/* =========================================
   PROMPT (UNCHANGED)
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
   GOAL EXTRACTION (FIXED)
========================================= */
const extractGoals = (reply, subjects = []) => {

  try {

    const lines = reply.split("\n");
    const goals = [];
    let subjectIndex = 0;

    lines.forEach(line => {

      const match = line.match(
        /(.*?)-\s*(\d{1,2}:\d{2}\s?(AM|PM))\s*-\s*(\d+)/
      );

      if (match) {

        let title = match[1].trim();

        /* 🔥 FIX: replace "Subject" with real subject */
        if (
          title.toLowerCase() === "subject" &&
          subjects.length > 0
        ) {
          title = subjects[subjectIndex % subjects.length];
          subjectIndex++;
        }

        goals.push({
          title,
          time: match[2].trim(),
          duration: Number(match[4]) || 60,
          category: title.toLowerCase().includes("break") ? "☕" : "📘",
          color: title.toLowerCase().includes("break") ? "#FFD93D" : "#89CFF0"
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
  if (!reply || typeof reply !== "string") return "";
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

    if (!reply || typeof reply !== "string") {
      console.error("Invalid AI reply");
      return res.status(500).json({ error: "No AI response" });
    }

    const cleanedReply = cleanReply(reply);

    /* 🔥 EXTRACT SUBJECTS */
    const subjects = extractSubjects(message);

    /* 🔥 EXTRACT GOALS */
    let goals = [];

    if (isPlannerRequest(message)) {
      goals = extractGoals(cleanedReply, subjects); // ✅ updated
    }

    /* SAVE CHAT (SAFE) */
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