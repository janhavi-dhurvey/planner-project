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
   🔥 SMART SYSTEM PROMPT (MATCHES CONTROLLER)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a helpful academic assistant like ChatGPT.

Your responses should feel natural, friendly, and useful.

IMPORTANT:

- Explain clearly (like a mentor)
- Give structured sections
- Be practical (not generic)
- Use light emojis for clarity
- Keep it readable (not too long, not too short)

ALSO IMPORTANT:

At the END of your response, ALWAYS include a clean time-based study timeline in this format:

Subject - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes
Subject - 06:15 PM - 60 minutes

RULES FOR TIMELINE:
- 4–6 sessions
- Break after each study
- Start from given time
- Keep realistic

Do NOT skip the timeline.
`
};

/* =========================================
   FALLBACK (SMART + COMPATIBLE)
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
📅 Daily Planner

Start with your most important subject first, then rotate to avoid fatigue.

⏱ Total Time: ~3 hours

Focus on consistency rather than perfection.

Timeline:

${make("Study", 60)}
${make("Break", 15)}
${make("Study", 60)}
${make("Break", 15)}
${make("Revision", 45)}
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
      content: `Current time is ${currentTime}. Start the timeline from this time.`
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
            temperature: 0.8,   // 🔥 more creative like ChatGPT
            max_tokens: 1500    // 🔥 allows full structured response
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