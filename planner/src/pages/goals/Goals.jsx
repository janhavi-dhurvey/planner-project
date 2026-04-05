import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import "../../App.css";
import "./Goals.css";
import Navbar from "../../components/Navbar";
import GoalForm from "./GoalForm";
import GoalTimer from "./GoalTimer";
import ProductivityDashboard from "../../components/ProductivityDashboard";
import DeadlineSidebar from "./DeadlineSidebar"; 

const Goals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get local YYYY-MM-DD (prevents UTC date shifts)
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const [time, period] = timeStr.split(" ");
      let [hour, minute] = time.split(":").map(Number);
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      return hour * 60 + minute;
    } catch {
      return 0;
    }
  };

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      // SYNC FIX: Using local date instead of ISO string to match Calendar logic
      const today = getLocalDate();
      const res = await API.get(`/goals?date=${today}`);

      let goalData = Array.isArray(res.data) ? res.data : [];

      goalData.sort((a, b) => {
        if (a.order != null && b.order != null) {
          return a.order - b.order;
        }
        return parseTime(a.time) - parseTime(b.time);
      });

      setGoals(goalData);
    } catch (err) {
      console.error("Goals loading error:", err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleAddGoal = async (newGoal) => {
    try {
      await API.post("/goals", {
        title: newGoal.title,
        time: newGoal.time,
        duration: Number(newGoal.duration),
        category: newGoal.category || "📘",
        color: newGoal.color || "#89CFF0",
        // SYNC FIX: Attach local date
        date: getLocalDate() 
      });

      await loadGoals();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add goal");
    }
  };

  const deleteGoal = async (goalId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this goal?")) return;
    try {
      await API.delete(`/goals/${goalId}`);
      await loadGoals();
    } catch {
      alert("Delete failed");
    }
  };

  const editGoal = async (goal, e) => {
    e.stopPropagation();
    const newTitle = prompt("Edit goal title:", goal.title);
    if (!newTitle) return;
    try {
      await API.put(`/goals/${goal._id}`, {
        title: newTitle.trim()
      });
      await loadGoals();
    } catch {
      alert("Edit failed");
    }
  };

  const formatDuration = (d) => {
    if (!d) return "";
    return d >= 60
      ? `${Math.floor(d / 60)}h ${d % 60 || ""}`.trim()
      : `${d}m`;
  };

  return (
    <div className="goals-page">
      <Navbar />

      <div className="goals-container">
        <div className="left-panel">
          <div className="planner-box" style={{ padding: "0", overflowY: "auto", background: "#6c7543" }}>
            <DeadlineSidebar />
          </div>
        </div>

        <div
          className={`right-panel ${!activeGoal && !isFormOpen ? "scroll-enabled" : ""}`}
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 80px)"
          }}
        >
          {!activeGoal && !isFormOpen && (
            <ProductivityDashboard goals={goals} />
          )}

          {activeGoal ? (
            <div className="goal-timer-wrapper">
              <GoalTimer
                goal={activeGoal}
                onBack={() => setActiveGoal(null)}
              />
            </div>
          ) : isFormOpen ? (
            <div className="goal-form-wrapper">
              <button
                style={{
                  marginBottom: "15px",
                  background: "#6c7543",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
                onClick={() => setIsFormOpen(false)}
              >
                ← Back
              </button>
              <GoalForm
                onSave={handleAddGoal}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          ) : (
            <div className="goals-content">
              {loading ? (
                <div className="empty-state">Loading planner...</div>
              ) : goals.length === 0 ? (
                <div className="empty-state">
                  📭 No goals found for today ({getLocalDate()})<br />
                  <span>Go to Chatbot and create one</span>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal._id}
                    className="goal-tab"
                    style={{ background: goal.color }}
                    onClick={() => setActiveGoal(goal)}
                  >
                    <div className="goal-icon-circle">
                      {goal.category}
                    </div>
                    <div className="goal-info">
                      <span className="goal-tab-title">
                        {goal.title}
                      </span>
                      <span className="goal-tab-time">
                        {goal.time} • {formatDuration(goal.duration)}
                      </span>
                    </div>
                    <div className="goal-actions">
                      <button onClick={(e) => editGoal(goal, e)}>✏</button>
                      <button onClick={(e) => deleteGoal(goal._id, e)}>🗑</button>
                    </div>
                  </div>
                ))
              )}

              <button
                className="add-goal-btn"
                onClick={() => setIsFormOpen(true)}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;