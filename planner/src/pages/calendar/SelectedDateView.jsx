import React from "react";

const SelectedDateView = ({ goals, loading, error, selectedDate }) => {
  
  /* =========================================
      FORMAT DURATION
  ========================================= */
  const formatDuration = (duration) => {
    const d = Number(duration) || 0;
    if (d >= 60) {
      const hrs = Math.floor(d / 60);
      const mins = d % 60;
      return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
    }
    return `${d}m`;
  };

  /* =========================================
      TIMELINE BAR WIDTH
  ========================================= */
  const getBarWidth = (duration) => {
    const d = Number(duration) || 0;
    const base = 140; // Minimum width
    return `${base + d * 2}px`;
  };

  /* =========================================
      STATUS BADGE
  ========================================= */
  const getStatusBadge = (status) => {
    if (status === "completed") return "✅";
    if (status === "skipped") return "⏭";
    return "";
  };

  /* =========================================
      RENDER LOGIC
  ========================================= */

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner"></div>
        <p style={{ fontWeight: "600", opacity: 0.7 }}>Loading your optimized schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        color: "#d9534f", 
        padding: "20px", 
        background: "rgba(217, 83, 79, 0.1)", 
        borderRadius: "15px",
        margin: "20px 0"
      }}>
        {error}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div
        className="empty-state-container"
        style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.4)",
          padding: "60px 20px",
          borderRadius: "24px",
          border: "2px dashed rgba(0,0,0,0.15)",
          marginTop: "20px"
        }}
      >
        <h3 style={{ marginBottom: "10px", color: "#4a4a4a" }}>No plans for this date yet! 🏜️</h3>
        <p style={{ opacity: 0.7, maxWidth: "400px", margin: "auto", lineHeight: "1.6" }}>
          You don't have any goals scheduled for <strong>{new Date(selectedDate).toDateString()}</strong>.
          <br />
          Head over to the <strong>Chatbot</strong> to generate a high-performance plan!
        </p>
      </div>
    );
  }

  return (
    <div className="timeline-container" style={{ marginTop: "30px", animation: "fadeIn 0.5s ease" }}>
      <h3 style={{ marginBottom: "25px", opacity: 0.8, fontSize: "1.2rem" }}>
        Timeline for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
      </h3>
      
      {goals.map((goal) => (
        <div
          key={goal._id}
          className="timeline-item"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
            transition: "transform 0.2s ease"
          }}
        >
          {/* TIME STAMP */}
          <div style={{ 
            width: "110px", 
            fontWeight: "700", 
            fontSize: "15px", 
            color: "#4a4a4a",
            letterSpacing: "0.5px"
          }}>
            {goal?.time || "Anytime"}
          </div>

          {/* GOAL CARD / BAR */}
          <div
            className="timeline-bar"
            style={{
              display: "flex",
              alignItems: "center",
              background: goal?.color || "#fff",
              padding: "16px 22px",
              borderRadius: "20px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
              width: getBarWidth(goal?.duration),
              border: "1px solid rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ flex: 1, fontWeight: "600", fontSize: "16px" }}>
              {goal?.title || "Untitled Task"}
            </div>

            <div style={{ marginRight: "12px", fontSize: "18px" }}>
              {getStatusBadge(goal?.status)}
            </div>

            <div style={{ 
              fontSize: "13px", 
              fontWeight: "700", 
              opacity: 0.6, 
              background: "rgba(0,0,0,0.05)",
              padding: "4px 8px",
              borderRadius: "8px"
            }}>
              {formatDuration(goal?.duration)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectedDateView;