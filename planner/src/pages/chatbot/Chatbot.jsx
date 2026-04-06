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
      SMART AUTO-PARSER (STRICT ORDERING)
  ========================================= */
  const autoSyncData = async (aiText, userInput) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 1. CLEAR PREVIOUS RECORDS FOR TODAY ONLY
    try {
      await API.delete(`/goals/daily?date=${todayStr}`);
    } catch (e) {
      console.error("Reset Error:", e);
    }

    // 2. PARSE WITH EXPLICIT ORDER INDEX
    const lines = aiText.split("\n");
    let sequenceIndex = 0; // Tracks the visual order from AI text

    for (const line of lines) {
      if (line.includes(" - ") && (line.includes("AM") || line.includes("PM"))) {
        const parts = line.split(" - ");
        if (parts.length >= 3) {
          const rawTitle = parts[0].replace(/^-?\s*/, "").trim();
          const isBreak = rawTitle.toLowerCase().includes("break");

          try {
            await API.post("/goals", {
              title: rawTitle,
              time: parts[1].trim(),
              duration: parseInt(parts[2]) || 60,
              date: todayStr,
              color: isBreak ? "#FFD966" : "#89CFF0",
              category: isBreak ? "☕" : "📘",
              order: sequenceIndex // CRITICAL: Forces visual sequence in DB
            });
            sequenceIndex++; 
          } catch (e) { console.error("Goal Sync Error", e); }
        }
      }
    }

    // 3. SMART DEADLINE DETECTION
    const lowerInput = userInput.toLowerCase();
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    let detectedDate = null;

    const dateRegex = /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{1,2})/i;
    const match = userInput.match(dateRegex);

    if (match) {
      const day = parseInt(match[1] || match[4]);
      const monthStr = (match[2] || match[3]).toLowerCase().substring(0, 3);
      const monthIdx = months.indexOf(monthStr);
      detectedDate = new Date(2026, monthIdx, day);
    } else if (lowerInput.includes("april ends")) {
      detectedDate = new Date(2026, 3, 30);
    }

    if (detectedDate && !isNaN(detectedDate.getTime())) {
      try {
        const subjects = userInput.match(/(DAA|LPCC|EH|DSA|Python|Java|Aptitude|DSML|CN|AWS)/gi) || ["Exam"];
        const uniqueSubjects = [...new Set(subjects.map(s => s.toUpperCase()))];
        
        await API.post("/deadlines", {
          title: `${uniqueSubjects.join(" & ")} Prep`,
          dueDate: detectedDate.toISOString(),
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

      await autoSyncData(reply, messageToSend);
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