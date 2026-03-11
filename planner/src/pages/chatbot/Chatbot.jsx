import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../App.css";
import "./Chatbot.css";
import Navbar from "../../components/Navbar";

const Chatbot = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  /* ---------------------------------------
     LOAD CHAT HISTORY
  --------------------------------------- */

  useEffect(() => {

    const savedChat = localStorage.getItem("chatHistory");

    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    }

  }, []);

  /* ---------------------------------------
     SAVE CHAT HISTORY
  --------------------------------------- */

  useEffect(() => {

    localStorage.setItem("chatHistory", JSON.stringify(messages));

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  /* ---------------------------------------
     CLEAN AI RESPONSE
  --------------------------------------- */

  const cleanAIResponse = (text) => {

    if (!text) return "";

    let cleaned = text;

    try {

      /* remove markdown JSON blocks */

      cleaned = cleaned.replace(/```json[\s\S]*?```/gi, "");

      /* remove raw JSON arrays */

      cleaned = cleaned.replace(/\[[\s\S]*?\]/g, "");

    } catch {}

    return cleaned
      .replace(/JSON:/gi, "")
      .replace(/\*\*/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

  };

  /* ---------------------------------------
     SEND MESSAGE
  --------------------------------------- */

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);

    const userInput = input;

    setInput("");

    setLoading(true);

    try {

      const response = await axios.post(
        "http://localhost:5000/chat",
        { message: userInput }
      );

      const cleanedReply = cleanAIResponse(response.data.reply);

      const aiMessage = {
        role: "assistant",
        text: cleanedReply || "I generated a planner for you."
      };

      setMessages(prev => [...prev, aiMessage]);

      /* ---------------------------------------
         SAVE AI GENERATED PLANNER
      --------------------------------------- */

      if (response.data.goals && response.data.goals.length > 0) {

        const planner = response.data.goals;

        localStorage.setItem(
          "plannerGoals",
          JSON.stringify(planner)
        );

        sessionStorage.setItem("plannerSession", "active");

        console.log("Planner saved:", planner);

      }

    } catch (error) {

      console.error("AI server error:", error);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ AI server error. Please try again."
        }
      ]);

    }

    setLoading(false);

  };

  /* ---------------------------------------
     START NEW CHAT
  --------------------------------------- */

  const startNewChat = async () => {

    setMessages([]);

    localStorage.removeItem("chatHistory");
    localStorage.removeItem("plannerGoals");

    sessionStorage.removeItem("plannerSession");

    try {

      await axios.post("http://localhost:5000/reset-chat");

    } catch {}

  };

  /* ---------------------------------------
     ENTER KEY SEND
  --------------------------------------- */

  const handleKeyPress = (e) => {

    if (e.key === "Enter" && !loading) {
      sendMessage();
    }

  };

  return (

    <div className="chatbot-page-wrapper">

      <Navbar />

      <div className="chatbot-content-centerer">

        <div className="chatbot-main-layout">

          {/* SIDEBAR */}

          <div className="ai-sidebar">

            <button
              className="new-chat-btn"
              onClick={startNewChat}
            >
              + New Chat
            </button>

            <div className="sidebar-history-container">

              <span className="section-label">
                CHAT HISTORY
              </span>

              {messages.length === 0 ? (

                <div className="history-item">
                  No previous sessions
                </div>

              ) : (

                <div className="history-item clickable">
                  Current Session
                </div>

              )}

            </div>

            <button className="dl-btn-sidebar professional">
              📥 Download Report
            </button>

            <div className="sidebar-footer">

              <div className="user-profile-card">

                <div className="avatar-circle">
                  G
                </div>

                <div>
                  <span className="user-name">
                    Guest User
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* CHAT AREA */}

          <div className="ai-viewport">

            <div className="chat-container-box">

              <h2 className="system-title">
                Academic Assistant AI
              </h2>

              <div className="chat-scroll-window">

                {messages.length === 0 && (

                  <div className="welcome-ui">

                    <div className="suggestion-row">

                      <button
                        onClick={() =>
                          setInput("Plan my study day for DSA, Aptitude, and my AI project")
                        }
                      >
                        📅 Plan My Day
                      </button>

                      <button
                        onClick={() =>
                          setInput("Analyze my academic productivity")
                        }
                      >
                        📊 Productivity Analysis
                      </button>

                    </div>

                  </div>

                )}

                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={`msg-row ${msg.role === "user" ? "user" : "bot"}`}
                  >

                    <div className="msg-bubble ai-format">

                      {msg.text.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}

                    </div>

                  </div>

                ))}

                {loading && (

                  <div className="msg-row bot">

                    <div className="msg-bubble typing">
                      AI is thinking...
                    </div>

                  </div>

                )}

                <div ref={messagesEndRef}></div>

              </div>

              {/* INPUT */}

              <div className="input-section">

                <div className="input-field-container">

                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />

                  <button
                    className="send-btn"
                    onClick={sendMessage}
                  >
                    ➤
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Chatbot;