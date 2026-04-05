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

  const scrollRef = useRef(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
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
      const user = JSON.parse(localStorage.getItem("user"));
      setUserName(user?.name || "User");
    } catch {
      setUserName("User");
    }
  };

  const loadChats = async () => {
    try {
      const res = await API.get("/chat");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Chat history error:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const cleanAIResponse = (text) => {
    if (!text) return "";
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/#+/g, "")
      .replace(/\*\*/g, "")
      .trim();
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.toLowerCase().includes("planner") || line.toLowerCase().includes("tips")) {
        return <h4 key={i}>{line}</h4>;
      }
      return <p key={i}>{line}</p>;
    });
  };

  /* =========================================
      PRO AUTO-PARSER (FOR GOALS & DEADLINES)
  ========================================= */
  const autoSyncData = async (aiText, userInput) => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Extract Goals (Format: Subject - Time - Duration)
    const lines = aiText.split("\n");
    for (const line of lines) {
      if (line.includes(" - ") && (line.includes("AM") || line.includes("PM"))) {
        const parts = line.split(" - ");
        if (parts.length >= 3) {
          try {
            await API.post("/goals", {
              title: parts[0].trim(),
              time: parts[1].trim(),
              duration: parseInt(parts[2]) || 60,
              date: today // CRITICAL: Fixes Goal Tab visibility
            });
          } catch (e) { console.error("Goal Sync Error", e); }
        }
      }
    }

    // 2. Extract Deadlines (If user mentioned a date/deadline)
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("deadline") || lowerInput.includes("before") || lowerInput.includes("by")) {
       // Extracting a rough title from input
       const title = userInput.split("planner for ")[1]?.split("...")[0] || "New Deadline";
       
       // Simple Logic: If "April ends", set to April 30
       let dueDate = new Date();
       if(lowerInput.includes("april")) dueDate = new Date(2026, 3, 30);
       
       try {
         await API.post("/deadlines", {
           title: `Finish ${title}`,
           dueDate: dueDate,
           priority: "High"
         });
       } catch (e) { console.error("Deadline Sync Error", e); }
    }
  };

  const sendMessage = async (customInput = null) => {
    const messageToSend = customInput || input.trim();
    if (!messageToSend || loading) return;

    setMessages(prev => [...prev, { role: "user", text: messageToSend }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat", { message: messageToSend });
      const replyRaw = res?.data?.reply;

      if (!replyRaw || typeof replyRaw !== "string") throw new Error("Invalid AI response");

      const reply = cleanAIResponse(replyRaw);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);

      // FIRE AND FORGET: Sync goals and deadlines to DB
      autoSyncData(reply, messageToSend);

      loadChats();
    } catch (err) {
      console.error("CHAT ERROR:", err);
      setMessages(prev => [...prev, { role: "assistant", text: "⚠️ Something went wrong. Please try again." }]);
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
          <div className="ai-sidebar">
            <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
            <div className="sidebar-history-container">
              <span className="section-label">CHAT HISTORY</span>
              {sessions.length === 0 ? (
                <div className="history-item">No conversations yet</div>
              ) : (
                sessions.map((s) => (
                  <div key={s._id} className="history-item clickable" onClick={() => openSession(s)}>
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

          <div className="ai-viewport">
            <div className="chat-container-box">
              <h2 className="system-title">Academic Assistant AI</h2>
              <div className="chat-scroll-window" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="welcome-ui">
                    <h3>👋 Welcome!</h3>
                    <p>Ask me to create a smart study plan.</p>
                    <button onClick={() => sendMessage("Give me a planner for DSA, Aptitude and CN")}>
                      📅 Create Study Plan
                    </button>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={`msg-row ${msg.role === "user" ? "user" : "bot"}`}>
                    <div className="msg-bubble">{formatMessage(msg.text)}</div>
                  </div>
                ))}
                {loading && (
                  <div className="msg-row bot">
                    <div className="msg-bubble typing">Thinking...</div>
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
                  disabled={loading}
                />
                <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>➤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;