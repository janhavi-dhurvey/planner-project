import React from "react";

const ProductivityDashboard = ({ goals = [] }) => {

  /* =========================================
     SAFE GOALS ARRAY
  ========================================= */

  const safeGoals = Array.isArray(goals) ? goals : [];

  /* =========================================
     BREAK DETECTION
  ========================================= */

  const isBreak = (goal) => {
    const title = (goal?.title || "").toLowerCase();
    return title.includes("break");
  };

  /* =========================================
     TOTAL MINUTES
  ========================================= */

  const totalMinutes = safeGoals.reduce(
    (sum, g) => sum + (Number(g?.duration) || 0),
    0
  );

  /* =========================================
     STUDY MINUTES
  ========================================= */

  const studyMinutes = safeGoals
    .filter(g => !isBreak(g))
    .reduce((sum, g) => sum + (Number(g?.duration) || 0), 0);

  /* =========================================
     BREAK MINUTES
  ========================================= */

  const breakMinutes = safeGoals
    .filter(g => isBreak(g))
    .reduce((sum, g) => sum + (Number(g?.duration) || 0), 0);

  /* =========================================
     BREAK COUNT
  ========================================= */

  const breakCount = safeGoals.filter(g => isBreak(g)).length;

  /* =========================================
     PRODUCTIVITY SCORE
  ========================================= */

  const productivityScore =
    totalMinutes > 0
      ? Math.min(Math.round((studyMinutes / totalMinutes) * 100), 100)
      : 0;

  /* =========================================
     COMPLETED GOALS (supports status schema)
  ========================================= */

  const completedGoals = safeGoals.filter(
    g => g?.status === "completed"
  ).length;

  const completionRate =
    safeGoals.length > 0
      ? Math.round((completedGoals / safeGoals.length) * 100)
      : 0;

  /* =========================================
     AVERAGE SESSION
  ========================================= */

  const avgSession =
    safeGoals.length > 0
      ? Math.round(totalMinutes / safeGoals.length)
      : 0;

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (minutes) => {

    const m = Number(minutes) || 0;

    const h = Math.floor(m / 60);
    const rem = m % 60;

    if (m === 0) return "0m";
    if (h === 0) return `${rem}m`;
    if (rem === 0) return `${h}h`;

    return `${h}h ${rem}m`;

  };

  /* =========================================
     DASHBOARD UI
  ========================================= */

  return (

    <div style={dashboardStyle}>

      <h2 style={titleStyle}>
        📊 Productivity Dashboard
      </h2>

      <div style={gridStyle}>

        <DashboardCard
          title="Study Time"
          value={formatTime(studyMinutes)}
        />

        <DashboardCard
          title="Break Time"
          value={formatTime(breakMinutes)}
        />

        <DashboardCard
          title="Break Sessions"
          value={breakCount}
        />

        <DashboardCard
          title="Productivity"
          value={`${productivityScore}%`}
        />

        <DashboardCard
          title="Goal Completion"
          value={`${completionRate}%`}
        />

        <DashboardCard
          title="Total Tasks"
          value={safeGoals.length}
        />

        <DashboardCard
          title="Avg Session"
          value={formatTime(avgSession)}
        />

      </div>

    </div>

  );

};

/* =========================================
   DASHBOARD CARD
========================================= */

const DashboardCard = ({ title, value }) => {

  return (

    <div style={cardStyle}>

      <h4 style={{ marginBottom: "6px" }}>
        {title}
      </h4>

      <p style={valueStyle}>
        {value}
      </p>

    </div>

  );

};

/* =========================================
   STYLES
========================================= */

const dashboardStyle = {

  background: "#ffffff",
  padding: "26px",
  borderRadius: "22px",
  marginBottom: "22px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.08)"

};

const titleStyle = {

  marginBottom: "20px",
  fontSize: "22px",
  fontWeight: "700"

};

const gridStyle = {

  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: "16px"

};

const cardStyle = {

  background: "#f6f6f6",
  borderRadius: "16px",
  padding: "16px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "16px",
  transition: "0.25s",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"

};

const valueStyle = {

  fontSize: "18px",
  fontWeight: "700"

};

export default ProductivityDashboard;