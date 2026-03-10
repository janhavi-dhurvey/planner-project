import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [isPlanGenerated, setIsPlanGenerated] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------
     FILE UPLOAD
  --------------------------------------------- */

  const handleFileUpload = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [
      ...prev,
      { type: "user", text: `Uploaded file: ${file.name}` }
    ]);

    const reader = new FileReader();

    reader.onload = (evt) => {

      const wb = XLSX.read(evt.target.result, { type: "binary" });

      const data = XLSX.utils.sheet_to_json(
        wb.Sheets[wb.SheetNames[0]]
      );

      setMessages(prev => [
        ...prev,
        {
          type: "bot",
          text:
            "Timetable uploaded successfully. I will consider this data when generating planners."
        }
      ]);
    };

    reader.readAsBinaryString(file);

    setShowUploadMenu(false);
  };

  /* ---------------------------------------------
     SEND MESSAGE → AI
  --------------------------------------------- */

  const handleSend = async (text = input) => {

    if (!text.trim()) return;

    const userMessage = { type: "user", text };

    setMessages(prev => [...prev, userMessage]);

    setInput("");

    try {

      const response = await fetch("http://localhost:5000/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: text
        })

      });

      const data = await response.json();

      const botMessage = {
        type: "bot",
        text: data.reply
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          type: "bot",
          text: "AI server not responding."
        }
      ]);

    }
  };

  /* ---------------------------------------------
     NEW CHAT
  --------------------------------------------- */

  const startNewChat = () => {

    if (messages.length > 0) {

      const summary =
        messages.find(m => m.type === "user")?.text.substring(0, 20) || "Chat";

      setHistory([
        { id: Date.now(), title: summary, msgs: messages },
        ...history
      ]);
    }

    setMessages([]);
  };

  const loadPastChat = (chat) => {
    setMessages(chat.msgs);
  };

  /* ---------------------------------------------
     UI
  --------------------------------------------- */

  return (
    <div className="chatbot-page-wrapper">

      <Navbar />

      <div className="chatbot-content-centerer">

        <div className="chatbot-main-layout">

          {/* SIDEBAR */}

          <aside className="ai-sidebar">

            <button className="new-chat-btn" onClick={startNewChat}>
              + New Chat
            </button>

            <div className="sidebar-history-container">

              <span className="section-label">
                CHAT HISTORY
              </span>

              {history.map(chat => (

                <div
                  key={chat.id}
                  className="history-item clickable"
                  onClick={() => loadPastChat(chat)}
                >
                  💬 {chat.title}
                </div>

              ))}

              {history.length === 0 && (
                <div className="history-item">
                  No previous sessions
                </div>
              )}

              {isPlanGenerated && (

                <button
                  className="dl-btn-sidebar professional"
                  onClick={() => {

                    const doc = new jsPDF();

                    doc.setFontSize(16);

                    doc.text("AI Productivity Report", 10, 15);

                    const splitText = doc.splitTextToSize(
                      messages[messages.length - 1].text,
                      180
                    );

                    doc.setFontSize(10);

                    doc.text(splitText, 10, 25);

                    doc.save("Productivity_Report.pdf");

                  }}
                >
                  📥 Download Report
                </button>

              )}

            </div>

            <div className="sidebar-footer">

              <div className="user-profile-card">

                <div className="avatar-circle">G</div>

                <div>

                  <span className="user-name">
                    Guest User
                  </span>

                  <span className="user-status">
                    ○ Guest Mode
                  </span>

                </div>

              </div>

            </div>

          </aside>

          {/* CHAT AREA */}

          <main className="ai-viewport">

            <div className="chat-container-box">

              <h2 className="system-title">
                Academic AI GPT
              </h2>

              <div className="chat-scroll-window">

                {messages.length === 0 ? (

                  <div className="welcome-ui">

                    <div className="suggestion-row">

                      <button
                        onClick={() =>
                          handleSend("Create a productivity plan for today")
                        }
                      >
                        📅 Optimize Today
                      </button>

                      <button
                        onClick={() =>
                          handleSend("Analyze my timetable")
                        }
                      >
                        📊 Precision Analysis
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="message-list">

                    {messages.map((msg, i) => (

                      <div key={i} className={`msg-row ${msg.type}`}>

                        <div className="msg-bubble">

                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>

                        </div>

                      </div>

                    ))}

                    <div ref={chatEndRef} />

                  </div>

                )}

              </div>

              {/* INPUT */}

              <div className="input-section">

                <div className="input-field-container">

                  <div className="upload-wrapper">

                    <button
                      className="plus-icon"
                      onClick={() =>
                        setShowUploadMenu(!showUploadMenu)
                      }
                    >
                      +
                    </button>

                    {showUploadMenu && (

                      <div className="upload-popover">

                        <input
                          type="file"
                          id="up-file"
                          hidden
                          onChange={handleFileUpload}
                        />

                        <button
                          onClick={() =>
                            document
                              .getElementById("up-file")
                              .click()
                          }
                        >
                          📂 Upload File
                        </button>

                      </div>

                    )}

                  </div>

                  <input
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value)
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSend()
                    }
                  />

                  <button
                    className="send-btn"
                    onClick={() => handleSend()}
                  >
                    ➤
                  </button>

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>

    </div>
  );
};

export default Chatbot;