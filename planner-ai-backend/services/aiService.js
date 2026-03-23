import axios from "axios";

/* =========================================
   OPENROUTER CONFIG
========================================= */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/* 🔥 BEST MODEL */
const DEFAULT_MODEL =
  process.env.AI_MODEL || "openai/gpt-4o-mini";

/* =========================================
   AXIOS CLIENT
========================================= */

const aiClient = axios.create({
  baseURL: OPENROUTER_URL,
  timeout: 60000
});

/* =========================================
   RETRY CONFIG
========================================= */

const MAX_RETRIES = 2;

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================
   🔥 SYSTEM PROMPT (FINAL FIX)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a friendly academic planner AI.

Create a clean, structured, and practical study plan.

IMPORTANT RULES:

- DO NOT write long paragraphs
- DO NOT explain theory
- DO NOT include JSON or technical output
- DO NOT say "let’s assume time"
- ALWAYS start from current real-world time
- Keep tone simple, human, and motivating

FORMAT STRICTLY:

📅 Study Planner
⏰ Total Time: X hours

🔹 Session 1
Subject - Time - Duration

🔹 Session 2
Break - Time - Duration

🔹 Session 3
Subject - Time - Duration

Continue logically.

OPTIONAL:
Add 2-3 short tips at the end.

DO NOT:
- Add "Raw JSON"
- Add explanations
- Add unnecessary text

Keep it clean like ChatGPT.
`
};

/* =========================================
   FALLBACK (REAL-TIME BASED)
========================================= */

const fallbackPlanner = () => {

  const now = new Date();

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

  let current = new Date(now);

  const make = (title, duration) => {
    const time = formatTime(current);
    current.setMinutes(current.getMinutes() + duration);
    return `${title} - ${time} - ${duration} minutes`;
  };

  return `
📅 Study Planner
⏰ Total Time: ~3 hours

🔹 Session 1
${make("Study", 60)}

🔹 Session 2
${make("Break", 15)}

🔹 Session 3
${make("Study", 60)}

🔹 Session 4
${make("Break", 15)}

🔹 Session 5
${make("Revision", 45)}

Stay consistent and avoid burnout 💪
`;
};

/* =========================================
   ASK AI FUNCTION
========================================= */

export const askAI = async (messages) => {

  try {

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("❌ OPENROUTER_API_KEY missing");
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("❌ Messages array required");
    }

    /* 🔥 ADD REAL-TIME CONTEXT */
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const timePrompt = {
      role: "system",
      content: `Current time is ${currentTime}. Start plan from this time.`
    };

    /* ✅ FINAL MESSAGE STACK */
    const safeMessages = [
      systemPrompt,
      timePrompt,
      ...messages.slice(-6)
    ];

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

      try {

        console.log(`🧠 AI Request (Attempt ${attempt + 1})`);
        console.log("🤖 Model:", DEFAULT_MODEL);

        const response = await aiClient.post(
          "",
          {
            model: DEFAULT_MODEL,
            messages: safeMessages,
            temperature: 0.7,
            max_tokens: 1200
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
              "X-Title": "AI Planner"
            }
          }
        );

        const aiReply =
          response?.data?.choices?.[0]?.message?.content ||
          response?.data?.choices?.[0]?.text ||
          "";

        if (!aiReply || aiReply.trim() === "") {
          throw new Error("Empty AI response");
        }

        console.log("✅ AI SUCCESS");

        return aiReply.trim();

      } catch (err) {

        lastError = err;

        console.error(`❌ Attempt ${attempt + 1} failed`);

        if (err.response) {
          console.error("API ERROR:", err.response.data);
        } else {
          console.error("ERROR:", err.message);
        }

        if (attempt < MAX_RETRIES) {
          await delay(1000);
        }
      }
    }

    throw lastError;

  } catch (error) {

    console.error("🔥 FINAL AI ERROR:", error.message);

    return fallbackPlanner();
  }
};