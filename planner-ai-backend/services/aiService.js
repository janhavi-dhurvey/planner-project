import axios from "axios";

/* =========================================
   CONFIG
========================================= */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_MODEL || "openai/gpt-4o-mini";

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
   🔥 STRICT SYSTEM PROMPT (FINAL FIX)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a professional academic planner.

Your job is to generate a CLEAN and SIMPLE study plan.

STRICT RULES:

- NO markdown (no ###, no **, no symbols)
- NO long explanations
- NO paragraphs
- NO extra text
- ONLY clean structured output

FORMAT STRICTLY:

Study Planner

Total Time: X hours

1. Subject - 05:00 PM - 60 minutes
2. Break - 06:00 PM - 15 minutes
3. Subject - 06:15 PM - 60 minutes
4. Break - 07:15 PM - 15 minutes
5. Subject - 07:30 PM - 60 minutes

Tips:
- Stay consistent
- Take proper breaks

IMPORTANT:
- Keep output professional and minimal
- Do not add anything extra
`
};

/* =========================================
   FALLBACK (CLEAN FORMAT)
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
Study Planner

Total Time: ~3 hours

1. ${make("Study", 60)}
2. ${make("Break", 15)}
3. ${make("Study", 60)}
4. ${make("Break", 15)}
5. ${make("Revision", 45)}

Tips:
- Stay focused
- Avoid distractions
`;
};

/* =========================================
   ASK AI FUNCTION
========================================= */

export const askAI = async (messages) => {

  try {

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY missing");
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array required");
    }

    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const timePrompt = {
      role: "system",
      content: `Current time is ${currentTime}. Start plan from this exact time.`
    };

    /* ✅ FINAL MESSAGE STACK */
    const safeMessages = [
      systemPrompt,
      timePrompt,
      ...messages.slice(-5)
    ];

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

      try {

        console.log(`🧠 AI Request (Attempt ${attempt + 1})`);

        const response = await aiClient.post(
          "",
          {
            model: DEFAULT_MODEL,
            messages: safeMessages,
            temperature: 0.5, // 🔥 more deterministic
            max_tokens: 800   // 🔥 prevents long paragraphs
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
          null;

        if (!aiReply || typeof aiReply !== "string") {
          throw new Error("Invalid AI response");
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