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

  /* =========================================
      LOCAL DATE HELPER (IST/Local Sync)
  ========================================= */
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
      
      // Handle Midnight (12:00 AM) as the end of the day sequence
      if (period === "AM" && hour === 12) {
        hour = 24; 
      } else if (period === "PM" && hour < 12) {
        hour += 12;
      }
      
      return hour * 60 + minute;
    } catch {
      return 0;
    }
  };

  /* =========================================
      LOAD GOALS
  ========================================= */
  const loadGoals = useCallback(async () => {
    try {
      const today = getLocalDate();
      const res = await API.get(`/goals?date=${today}`);
      let goalData = Array.isArray(res.data) ? res.data : [];

      // SORTING FIX: Primarily use the "order" from Chatbot sequence, 
      // fallback to numeric time calculation.
      goalData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
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
    window.addEventListener("focus", loadGoals);
    return () => window.removeEventListener("focus", loadGoals);
  }, [loadGoals]);

  const handleRestartTimeline = async () => {
    if (!window.confirm("This will clear today's plan. Continue?")) return;
    try {
      const today = getLocalDate();
      await API.delete(`/goals/daily?date=${today}`);
      await loadGoals();
    } catch (err) {
      alert("Reset failed");
    }
  };

  const handleAddGoal = async (newGoal) => {
    try {
      await API.post("/goals", {
        ...newGoal,
        date: getLocalDate() 
      });
      await loadGoals();
      setIsFormOpen(false);
    } catch (err) {
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
      await API.put(`/goals/${goal._id}`, { title: newTitle.trim() });
      await loadGoals();
    } catch {
      alert("Edit failed");
    }
  };

  const formatDuration = (d) => {
    if (!d) return "";
    return d >= 60 ? `${Math.floor(d / 60)}h ${d % 60 || ""}`.trim() : `${d}m`;
  };

  return (
    <div className="goals-page" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="goals-container" style={{ flex: 1, display: "flex", padding: "20px", gap: "20px", overflow: "hidden" }}>
        
        {/* LEFT PANEL */}
        <div className="left-panel" style={{ width: "300px", display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="planner-box" style={{ 
            padding: "0", background: "#6c7543", borderRadius: "24px",
            flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <DeadlineSidebar />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={`right-panel ${!activeGoal && !isFormOpen ? "scroll-enabled" : ""}`}
          style={{ flex: 1, overflowY: "auto", maxHeight: "100%", paddingRight: "10px" }}>
          
          {!activeGoal && !isFormOpen && (
            <div style={{ position: "relative" }}>
               {goals.length > 0 && (
                 <button 
                  onClick={handleRestartTimeline}
                  style={{
                    position: "absolute", top: "10px", right: "10px", zIndex: 10,
                    background: "rgba(255, 107, 107, 0.1)", color: "#ff6b6b", border: "1px solid #ff6b6b",
                    padding: "6px 12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "700"
                  }}>
                  🔄 Restart Today
                 </button>
               )}
               <ProductivityDashboard goals={goals} />
            </div>
          )}

          {activeGoal ? (
            <GoalTimer goal={activeGoal} onBack={() => setActiveGoal(null)} />
          ) : isFormOpen ? (
            <div className="goal-form-wrapper">
              <button style={{ marginBottom: "15px", background: "#6c7543", color: "white", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}
                onClick={() => setIsFormOpen(false)}> ← Back </button>
              <GoalForm onSave={handleAddGoal} onCancel={() => setIsFormOpen(false)} />
            </div>
          ) : (
            <div className="goals-content" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {loading ? (
                <div className="empty-state">Loading your daily plan...</div>
              ) : goals.length === 0 ? (
                <div className="empty-state">
                  📭 No goals for today ({getLocalDate()})<br />
                  <span>Use the Chatbot to generate your optimized schedule!</span>
                </div>
              ) : (
                <div className="timeline-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {goals.map((goal) => (
                    <div key={goal._id} className="goal-tab"
                      style={{ background: goal.color, borderRadius: "20px", boxShadow: "0 6px 12px rgba(0,0,0,0.08)", marginBottom: "4px" }}
                      onClick={() => setActiveGoal(goal)}>
                      <div className="goal-icon-circle">{goal.category}</div>
                      <div className="goal-info">
                        <span className="goal-tab-title">{goal.title}</span>
                        <span className="goal-tab-time">{goal.time} • {formatDuration(goal.duration)}</span>
                      </div>
                      <div className="goal-actions">
                        <button onClick={(e) => editGoal(goal, e)}>✏</button>
                        <button onClick={(e) => deleteGoal(goal._id, e)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="add-goal-btn" onClick={() => setIsFormOpen(true)} style={{ marginTop: "10px" }}> + </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;