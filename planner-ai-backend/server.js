import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

// 🔑 Paste your OpenRouter API key
const API_KEY = "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";

/* ------------------------------------------------
   SYSTEM PROMPT
------------------------------------------------ */

const systemPrompt = {
  role: "system",
  content: `
You are an AI Productivity Planner that helps students and professionals manage their day.

RULES:

1. If the user asks to plan their day, create a study routine, or organize tasks:
   - First explain the plan in natural language.
   - Then internally include a JSON block of tasks.

Example response format:

Here is a simple plan for your day:

• 08:00 — DSA Study 📘  
• 10:00 — Gym Workout 🏃‍♀️  
• 11:00 — Project Work 💻  

JSON:
[
 { "title": "DSA Study", "time": "08:00", "category": "📘", "color": "#B3E5FC" },
 { "title": "Gym Workout", "time": "10:00", "category": "🏃‍♀️", "color": "#FFD93D" },
 { "title": "Project Work", "time": "11:00", "category": "💻", "color": "#FFAB91" }
]

2. If the user asks normal questions, respond naturally like a helpful AI assistant.

Always keep responses clear, friendly, and professional.
`
};

/* ------------------------------------------------
   CHAT MEMORY
------------------------------------------------ */

let chatHistory = [systemPrompt];

/* ------------------------------------------------
   CHAT ENDPOINT
------------------------------------------------ */

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    // Save user message
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
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    // Save AI reply
    chatHistory.push({
      role: "assistant",
      content: reply
    });

    /* ------------------------------------------------
       EXTRACT JSON FROM AI RESPONSE
    ------------------------------------------------ */

    let goals = null;
    let cleanReply = reply;

    try {

      const jsonMatch = reply.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {

        goals = JSON.parse(jsonMatch[0]);

        // remove JSON from visible chat
        cleanReply = reply
          .replace(jsonMatch[0], "")
          .replace("JSON:", "")
          .trim();

      }

    } catch (err) {

      goals = null;

    }

    /* ------------------------------------------------
       SEND RESPONSE
    ------------------------------------------------ */

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
   SERVER START
------------------------------------------------ */

app.listen(5000, () => {
  console.log("AI server running on port 5000");
});