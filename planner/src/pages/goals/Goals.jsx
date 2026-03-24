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
     LOAD GOALS
  ========================================= */
  const loadGoals = useCallback(async () => {
    try {
      const res = await API.get("/goals");

      let goalData = Array.isArray(res.data) ? res.data : [];

      goalData.sort((a, b) => {
        if (a.order != null && b.order != null) {
          return a.order - b.order;
        }
        return new Date(`1970 ${a.time}`) - new Date(`1970 ${b.time}`);
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

  useEffect(() => {
    const handleFocus = () => loadGoals();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadGoals]);

  /* =========================================
     ADD GOAL (🔥 FIXED)
  ========================================= */
  const handleAddGoal = async (newGoal) => {
    try {

      const payload = {
        title: newGoal.title,
        time: newGoal.time,
        duration: Number(newGoal.duration),
        category: newGoal.category || "📘",
        color: newGoal.color || "#89CFF0"
      };

      await API.post("/goals", payload);

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
        ...goal,
        title: newTitle.trim()
      });
      await loadGoals();
    } catch {
      alert("Edit failed");
    }
  };

  /* =========================================
     FORMAT
  ========================================= */
  const formatDuration = (d) => {
    if (!d) return "";
    return d >= 60
      ? `${Math.floor(d / 60)}h ${d % 60 || ""}`.trim()
      : `${d}m`;
  };

  /* =========================================
     ACTIVE GOAL
  ========================================= */
  const getCurrentGoalId = () => {
    const now = new Date();

    for (let g of goals) {
      const start = new Date(`1970 ${g.time}`);
      const end = new Date(start.getTime() + g.duration * 60000);

      if (now >= start && now <= end) return g._id;
    }
    return null;
  };

  const currentGoalId = getCurrentGoalId();

  return (
    <div className="goals-page">

      <Navbar />

      <div className="goals-container">

        {/* LEFT */}
        <div className="left-panel">
          <div className="planner-box">
            <p>AI Planner</p>
          </div>
        </div>

        {/* RIGHT */}
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
                <div className="empty-state">Loading...</div>
              ) : goals.length === 0 ? (
                <div className="empty-state">
                  📭 No planner found<br />
                  <span>Go to Chatbot and create one</span>
                </div>
              ) : (

                goals.map((goal) => {

                  const isActive = goal._id === currentGoalId;

                  return (
                    <div
                      key={goal._id}
                      className="goal-tab"
                      style={{
                        background: goal.color,
                        border: isActive ? "3px solid #2ecc71" : "none"
                      }}
                      onClick={() => setActiveGoal(goal)}
                    >

                      {/* LEFT ICON */}
                      <div className="goal-icon-circle">
                        {goal.category}
                      </div>

                      {/* CENTER INFO */}
                      <div className="goal-info">
                        <span className="goal-tab-title">
                          {goal.title}
                        </span>

                        <span className="goal-tab-time">
                          {goal.time} • {formatDuration(goal.duration)}
                        </span>
                      </div>

                      {/* RIGHT ACTIONS */}
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