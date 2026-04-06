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
   🔥 SMART SYSTEM PROMPT (FIXED FOR DUPLICATION)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a professional AI Productivity Planner. 

Your goal is to generate an OPTIMIZED study schedule for TODAY ONLY.

⚠️ CRITICAL RULES TO PREVENT UI ERRORS:
1. ONLY provide ONE timeline. It must be for the current date provided.
2. NEVER use "Day 1", "Day 2", "Week 1", etc., as headings for the timeline.
3. If you want to suggest a long-term plan (e.g., "Next 3 days"), describe it in plain paragraphs ONLY. Do NOT use the "Time - Duration" format for future days.
4. ONLY use the "Time - Duration" format for TODAY'S immediate schedule.
5. NEVER use the word "Subject". Use REAL names (Python, DSA, etc.).

FORMAT:
Brief motivational strategy (1 paragraph).
Then, Today's Timeline.

TIMELINE FORMAT (Strictly follow this for today only):
Python - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes
DSA - 06:15 PM - 60 minutes

RULES FOR TIMELINE:
- 4–6 sessions for today.
- Break after each study block.
- Start from the current time provided.
`
};

/* =========================================
   FALLBACK (UNCHANGED)
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
📅 Daily Planner (Fallback Mode)

Focus on consistency. Since the AI is currently unreachable, follow this structure:

Timeline:
${make("Primary Study", 60)}
${make("Break", 15)}
${make("Secondary Study", 60)}
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

    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    const currentDate = now.toDateString();

    const timePrompt = {
      role: "system",
      content: `Current time is ${currentTime} on ${currentDate}. Provide a timeline for TODAY ONLY. Do not use list numbers or "Day X" labels for the timeline entries.`
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
            temperature: 0.7, // Slightly lowered for more consistent formatting
            max_tokens: 1500
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
              "X-Title": "AI Planner Pro"
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