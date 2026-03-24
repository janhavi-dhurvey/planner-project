import React, { useState, useEffect, useRef } from "react";
import "../../App.css";
import "./Chatbot.css";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {

  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [userName, setUserName] = useState("User");

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadUser();
    loadChats();
  }, [navigate]);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed?.name || "User");
      }
    } catch {
      setUserName("User");
    }
  };

  const loadChats = async () => {
    try {
      const res = await API.get("/chat");
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (error) {
      console.error("Chat history error:", error);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* CLEAN RESPONSE */
  const cleanAIResponse = (text) => {
    if (!text) return "";

    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/#+/g, "")
      .replace(/\*\*/g, "")
      .trim();
  };

  /* =========================================
     🔥 UPDATED SEND MESSAGE (FINAL CLEAN)
  ========================================= */
  const sendMessage = async (customInput = null) => {

    const messageToSend = customInput || input.trim();
    if (!messageToSend || loading) return;

    setMessages(prev => [...prev, { role: "user", text: messageToSend }]);
    setInput("");
    setLoading(true);

    try {

      const res = await API.post("/chat", {
        message: messageToSend
      });

      const reply = res?.data?.reply || "";

      /* ✅ ONLY TEXT (NO PLANNER UI) */
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: cleanAIResponse(reply)
        }
      ]);

      loadChats();

    } catch (error) {

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠️ Server error" }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async () => {
    setMessages([]);
    try {
      await API.post("/chat/reset");
      loadChats();
    } catch {}
  };

  /* 🔥 FIX SESSION LOAD (TEXT ONLY) */
  const openSession = (session) => {
    if (!session?.messages) return;

    const formatted = session.messages.map(msg => ({
      role: msg.role,
      text: cleanAIResponse(msg.content)
    }));

    setMessages(formatted);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const avatar = userName.charAt(0).toUpperCase();

  return (
    <div className="chatbot-page-wrapper">

      <Navbar />

      <div className="chatbot-content-centerer">

        <div className="chatbot-main-layout">

          {/* SIDEBAR */}
          <div className="ai-sidebar">

            <button className="new-chat-btn" onClick={startNewChat}>
              + New Chat
            </button>

            <div className="sidebar-history-container">
              <span className="section-label">CHAT HISTORY</span>

              {sessions.length === 0 ? (
                <div className="history-item">No conversations yet</div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    className="history-item clickable"
                    onClick={() => openSession(s)}
                  >
                    {s.title}
                  </div>
                ))
              )}
            </div>

            <div className="sidebar-footer">
              <div className="user-profile-card">
                <div className="avatar-circle">{avatar}</div>
                <span className="user-name">{userName}</span>
              </div>
            </div>

          </div>

          {/* CHAT AREA */}
          <div className="ai-viewport">

            <div className="chat-container-box">

              <h2 className="system-title">Academic Assistant AI</h2>

              <div className="chat-scroll-window" ref={scrollContainerRef}>

                {messages.length === 0 && (
                  <div className="welcome-ui">
                    <button onClick={() => sendMessage("Create a study plan for today")}>
                      📅 Create Study Plan
                    </button>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`msg-row ${msg.role === "user" ? "user" : "bot"}`}
                  >
                    <div className="msg-bubble">
                      {msg.text?.split("\n").map((line, i) => (
                        <p key={i} className="chat-line">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="msg-row bot">
                    <div className="msg-bubble typing">
                      Thinking...
                    </div>
                  </div>
                )}

              </div>

              <div className="input-section">

                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />

                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                >
                  ➤
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Chatbot;