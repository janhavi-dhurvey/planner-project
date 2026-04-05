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
   🔥 SMART SYSTEM PROMPT (UPDATED FOR DEADLINES)
========================================= */

const systemPrompt = {
  role: "system",
  content: `
You are a professional AI Productivity Planner. 

Your goal is to generate OPTIMIZED study schedules based on the user's subjects and DEADLINES.

INSTRUCTIONS:
1. Explain clearly like a high-performance coach.
2. If the user mentions a DEADLINE (exam date, project due date), acknowledge it and prioritize those subjects.
3. If a deadline is very close (less than 7 days), make the schedule more intensive.
4. Use light emojis for clarity.

⚠️ CRITICAL RULE:
- NEVER use the word "Subject".
- ALWAYS use REAL subject names from user input (e.g., Python, Physics, DSA).

FORMAT:
Include a brief motivational strategy, then the timeline.

TIMELINE FORMAT:
Python - 05:00 PM - 60 minutes
Break - 06:00 PM - 15 minutes
Physics - 06:15 PM - 60 minutes

RULES FOR TIMELINE:
- 4–6 sessions.
- Break after each study block.
- Start from the current time provided in the prompt.
- Ensure the plan is realistic and optimized for the upcoming deadlines.
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

Focus on consistency. Since the AI is currently unreachable, follow this balanced structure:

Timeline:
${make("Primary Subject", 60)}
${make("Break", 15)}
${make("Secondary Subject", 60)}
${make("Break", 15)}
${make("Revision/Practice", 45)}
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
    
    // Added current date so AI can calculate days remaining until a deadline
    const currentDate = now.toDateString();

    const timePrompt = {
      role: "system",
      content: `Current time is ${currentTime} on ${currentDate}. If the user mentions a deadline, calculate the remaining days from today and optimize the plan accordingly.`
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
            temperature: 0.8,
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