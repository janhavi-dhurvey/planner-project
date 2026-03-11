import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ------------------------------------------------
   API KEY
------------------------------------------------ */

const API_KEY = process.env.OPENROUTER_API_KEY;

/* ------------------------------------------------
   SYSTEM PROMPT
------------------------------------------------ */

const systemPrompt = {
  role: "system",
  content: `
You are an AI Academic Planner that creates optimized study schedules.

IMPORTANT RULES:

1. Always generate realistic study schedules.

2. Time MUST ALWAYS be in 12-hour format with AM/PM.

Correct examples:
08:00 AM
09:30 AM
12:00 PM
01:30 PM
02:00 PM

Never output:
13:00
14:00
15:00

3. Study sessions should be 60-90 minutes.

4. Breaks should be 15-30 minutes.

5. Lunch should be 30-60 minutes.

6. Maximum 8 tasks.

7. If the user specifies a time limit (example: "I have 5 hours"),
the total duration MUST NOT exceed that limit.

Example:

08:00 AM — DSA Practice 📘
09:30 AM — Break ☕
10:00 AM — Aptitude Practice 📊
11:30 AM — Break ☕
12:00 PM — Lunch 🍽
01:00 PM — GATE Study 📚
02:30 PM — Break ☕
03:00 PM — Mock Test 📝

After the explanation include JSON exactly like this:

JSON:
[
 { "title":"DSA Practice","time":"08:00 AM","duration":90,"category":"📘","color":"#9ecae1" },
 { "title":"Break","time":"09:30 AM","duration":20,"category":"☕","color":"#FFD93D" }
]

JSON RULES:
• Valid JSON array
• time must include AM/PM
• duration must be minutes
• include title,time,duration,category,color
• maximum 8 tasks

Keep explanation short.
`
};

/* ------------------------------------------------
   CHAT MEMORY
------------------------------------------------ */

let chatHistory = [systemPrompt];

/* ------------------------------------------------
   NORMALIZE TIME FORMAT
------------------------------------------------ */

function normalizeTime(time) {

  if (!time) return time;

  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  const parts = time.split(":");
  if (parts.length !== 2) return time;

  let hour = parseInt(parts[0]);
  const minute = parts[1];

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return hour + ":" + minute + " " + ampm;
}

/* ------------------------------------------------
   LIMIT PLAN BY USER TIME
------------------------------------------------ */

function enforceTimeLimit(goals, message) {

  const match = message.match(/(\d+)\s*hour/);

  if (!match) return goals;

  const maxMinutes = parseInt(match[1]) * 60;

  let total = 0;
  const filtered = [];

  for (const g of goals) {

    if (total + g.duration > maxMinutes) break;

    filtered.push(g);
    total += g.duration;

  }

  return filtered;
}

/* ------------------------------------------------
   CHAT ENDPOINT
------------------------------------------------ */

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    chatHistory.push({
      role: "user",
      content: message
    });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: chatHistory
      },
      {
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Academic Planner"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    chatHistory.push({
      role: "assistant",
      content: reply
    });

    /* ------------------------------------------------
       EXTRACT JSON
    ------------------------------------------------ */

    let goals = null;
    let cleanReply = reply;

    try {

      const jsonMatch = reply.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {

        goals = JSON.parse(jsonMatch[0]);

        /* normalize time */

        goals = goals.map(g => ({
          ...g,
          time: normalizeTime(g.time)
        }));

        /* enforce user time limit */

        goals = enforceTimeLimit(goals, message);

        /* remove JSON from visible reply */

        cleanReply = reply
          .replace(jsonMatch[0], "")
          .replace(/JSON:/gi, "")
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

      }

    } catch (err) {

      console.log("JSON parse failed:", err);
      goals = null;

    }

    res.json({
      reply: cleanReply,
      goals
    });

  } catch (error) {

    console.error("AI error:", error.response?.data || error);

    res.json({
      reply: "AI server error.",
      goals: null
    });

  }

});

/* ------------------------------------------------
   RESET CHAT
------------------------------------------------ */

app.post("/reset-chat", (req, res) => {

  chatHistory = [systemPrompt];

  res.json({
    message: "Chat history cleared."
  });

});

/* ------------------------------------------------
   START SERVER
------------------------------------------------ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log("AI server running on port " + PORT);

});