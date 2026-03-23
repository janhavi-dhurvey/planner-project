import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import "../../App.css";
import "./Goals.css";
import Navbar from "../../components/Navbar";
import GoalForm from "./GoalForm";
import GoalTimer from "./GoalTimer";
import ProductivityDashboard from "../../components/ProductivityDashboard";

const Goals = () => {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================
     LOAD GOALS (🔥 FINAL FIX)
  ========================================= */
  const loadGoals = useCallback(async () => {
    try {
      const res = await API.get("/goals");

      let goalData = Array.isArray(res.data) ? res.data : [];

      /* ✅ STRONG SORT (ORDER + TIME FALLBACK) */
      goalData.sort((a, b) => {
        if (a.order != null && b.order != null) {
          return a.order - b.order;
        }

        const timeA = new Date(`1970 ${a.time}`);
        const timeB = new Date(`1970 ${b.time}`);
        return timeA - timeB;
      });

      setGoals(goalData);

    } catch (err) {
      console.error("Goals loading error:", err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================
     INITIAL LOAD ONLY (❌ NO AUTO REFRESH)
  ========================================= */
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  /* =========================================
     REFRESH ON TAB FOCUS
  ========================================= */
  useEffect(() => {
    const handleFocus = () => loadGoals();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadGoals]);

  /* =========================================
     ADD GOAL
  ========================================= */
  const handleAddGoal = async (newGoal) => {
    try {
      await API.post("/goals", newGoal);
      await loadGoals();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add goal");
    }
  };

  /* =========================================
     DELETE GOAL
  ========================================= */
  const deleteGoal = async (goalId, e) => {
    e.stopPropagation();

    if (!window.confirm("Delete this goal?")) return;

    try {
      await API.delete(`/goals/${goalId}`);
      await loadGoals();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  /* =========================================
     EDIT GOAL
  ========================================= */
  const editGoal = async (goal, e) => {
    e.stopPropagation();

    const newTitle = prompt("Edit goal title:", goal.title);
    if (!newTitle || newTitle.trim() === "") return;

    try {
      await API.put(`/goals/${goal._id}`, {
        title: newTitle.trim(),
        time: goal.time,
        duration: goal.duration,
        category: goal.category,
        color: goal.color
      });

      await loadGoals();
    } catch (error) {
      console.error(error);
      alert("Edit failed");
    }
  };

  /* =========================================
     FORMAT
  ========================================= */
  const formatTime = (time) => time ? `🕒 ${time}` : "";

  const formatDuration = (duration) => {
    if (!duration) return "";

    if (duration >= 60) {
      const hrs = Math.floor(duration / 60);
      const mins = duration % 60;
      return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
    }
    return `${duration}m`;
  };

  /* =========================================
     CURRENT ACTIVE GOAL
  ========================================= */
  const getCurrentGoalId = () => {
    const now = new Date();

    for (let i = 0; i < goals.length; i++) {
      const start = new Date(`1970 ${goals[i].time}`);
      const end = new Date(start.getTime() + goals[i].duration * 60000);

      if (now >= start && now <= end) {
        return goals[i]._id;
      }
    }

    return null;
  };

  const currentGoalId = getCurrentGoalId();

  return (
    <div className="goals-page">

      <Navbar />

      <div className="goals-container">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="planner-box">
            <p>AI Planner</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          {!activeGoal && !isFormOpen && (
            <ProductivityDashboard goals={goals} />
          )}

          {activeGoal ? (
            <GoalTimer
              goal={activeGoal}
              onBack={() => setActiveGoal(null)}
            />
          ) : isFormOpen ? (
            <GoalForm
              onSave={handleAddGoal}
              onCancel={() => setIsFormOpen(false)}
            />
          ) : (
            <div className="goals-content">

              {loading ? (
                <div style={{ textAlign: "center" }}>
                  Loading goals...
                </div>
              ) : goals.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  opacity: 0.6,
                  paddingTop: "40px"
                }}>
                  No planner found. Generate one in Chatbot.
                </div>
              ) : (

                goals.map((goal, index) => {

                  const isActive = goal._id === currentGoalId;

                  return (
                    <div
                      key={`${goal._id}-${goal.order}-${index}`}  // 🔥 FIXED KEY
                      className="goal-tab"
                      style={{
                        backgroundColor: goal.color,
                        border: isActive ? "3px solid #2ecc71" : "none"
                      }}
                      onClick={() => setActiveGoal(goal)}
                    >

                      <div className="goal-icon-circle">
                        {goal.category}
                      </div>

                      <span className="goal-tab-title">
                        {goal.title}
                      </span>

                      <span className="goal-tab-time">
                        {formatTime(goal.time)}
                        {goal.duration && (
                          <span style={{ marginLeft: "6px" }}>
                            • {formatDuration(goal.duration)}
                          </span>
                        )}
                      </span>

                      <div className="goal-actions">
                        <button onClick={(e) => editGoal(goal, e)}>✏</button>
                        <button onClick={(e) => deleteGoal(goal._id, e)}>🗑</button>
                      </div>

                    </div>
                  );
                })

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