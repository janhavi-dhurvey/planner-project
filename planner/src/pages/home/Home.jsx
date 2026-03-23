import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Home = () => {

  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [stats, setStats] = useState({
    goals: 0,
    chats: 0,
    completed: 0
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name || "User";

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const goalsRes = await API.get("/goals");
      const chatsRes = await API.get("/chats");

      const goals = goalsRes.data || [];

      const completed = goals.filter(g => g.completed).length;

      setStats({
        goals: goals.length,
        chats: chatsRes.data?.length || 0,
        completed
      });

    } catch {
      console.log("Stats error");
    }
  };

  const progress =
    stats.goals === 0
      ? 0
      : Math.round((stats.completed / stats.goals) * 100);

  const theme = dark ? darkTheme : lightTheme;

  return (
    <div style={{ ...container, ...theme.bg }}>

      {/* HEADER */}
      <div style={topBar}>
        <h2>AI Planner</h2>

        <button style={toggleBtn} onClick={() => setDark(!dark)}>
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      <h1 style={{ ...title, ...theme.text }}>
        👋 Hello, {name}
      </h1>

      <p style={{ ...subtitle, ...theme.subtext }}>
        Here's your productivity dashboard
      </p>

      {/* STATS */}
      <div style={statsGrid}>

        <Card theme={theme}>
          <h3>🎯 Goals</h3>
          <h1>{stats.goals}</h1>
        </Card>

        <Card theme={theme}>
          <h3>✅ Completed</h3>
          <h1>{stats.completed}</h1>
        </Card>

        <Card theme={theme}>
          <h3>💬 Chats</h3>
          <h1>{stats.chats}</h1>
        </Card>

      </div>

      {/* PROGRESS BAR */}
      <div style={{ ...progressBox, ...theme.card }}>
        <h3>📊 Goal Progress</h3>

        <div style={progressBar}>
          <div
            style={{
              ...progressFill,
              width: `${progress}%`
            }}
          />
        </div>

        <p>{progress}% completed</p>
      </div>

      {/* ACTIONS */}
      <div style={grid}>
        <ActionCard
          title="🤖 Chat"
          desc="Talk with AI"
          onClick={() => navigate("/chatbot")}
          theme={theme}
        />

        <ActionCard
          title="🎯 Goals"
          desc="Manage goals"
          onClick={() => navigate("/goals")}
          theme={theme}
        />

        <ActionCard
          title="📅 Calendar"
          desc="Plan schedule"
          onClick={() => navigate("/calendar")}
          theme={theme}
        />
      </div>

      {/* AI CTA */}
      <div style={{ ...aiBox, ...theme.card }}>
        <h2>🧠 AI Planner</h2>
        <p>Let AI generate your perfect study plan</p>

        <button
          style={aiBtn}
          onClick={() => navigate("/chatbot")}
        >
          Generate Plan
        </button>
      </div>

    </div>
  );
};

/* ================= COMPONENTS ================= */

const Card = ({ children, theme }) => (
  <div style={{ ...card, ...theme.card }}>
    {children}
  </div>
);

const ActionCard = ({ title, desc, onClick, theme }) => {

  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        ...actionCard,
        ...theme.card,
        transform: hover ? "scale(1.05)" : "scale(1)"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  );
};

/* ================= THEMES ================= */

const lightTheme = {
  bg: { background: "#f5f1ea" },
  text: { color: "#222" },
  subtext: { color: "#666" },
  card: {
    background: "white",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
  }
};

const darkTheme = {
  bg: { background: "#1e1e1e" },
  text: { color: "#fff" },
  subtext: { color: "#aaa" },
  card: {
    background: "#2c2c2c",
    boxShadow: "0 6px 15px rgba(0,0,0,0.4)"
  }
};

/* ================= STYLES ================= */

const container = {
  padding: "30px",
  minHeight: "100vh"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px"
};

const toggleBtn = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer"
};

const title = {
  fontSize: "28px"
};

const subtitle = {
  marginBottom: "20px"
};

const statsGrid = {
  display: "flex",
  gap: "20px",
  marginBottom: "25px"
};

const card = {
  padding: "20px",
  borderRadius: "12px",
  width: "180px",
  textAlign: "center"
};

const progressBox = {
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "30px"
};

const progressBar = {
  height: "10px",
  background: "#ddd",
  borderRadius: "10px",
  marginTop: "10px",
  overflow: "hidden"
};

const progressFill = {
  height: "100%",
  background: "#6c7543"
};

const grid = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap"
};

const actionCard = {
  padding: "25px",
  borderRadius: "16px",
  width: "240px",
  cursor: "pointer",
  transition: "0.2s"
};

const aiBox = {
  marginTop: "40px",
  padding: "25px",
  borderRadius: "12px",
  textAlign: "center"
};

const aiBtn = {
  marginTop: "15px",
  padding: "12px 20px",
  background: "#6c7543",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default Home;