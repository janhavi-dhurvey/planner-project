import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

// Paste your OpenRouter API key here
const API_KEY = "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";

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a smart academic productivity assistant."
          },
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {

    console.error("AI error:", error.response?.data || error);

    res.json({
      reply: "AI server error."
    });

  }

});

app.listen(5000, () => {
  console.log("AI server running on port 5000");
});