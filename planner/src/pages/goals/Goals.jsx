import React, { useState } from "react";
import "../../App.css";
import "./Goals.css";
import Navbar from "../../components/Navbar";
import GoalForm from "./GoalForm";
import GoalTimer from "./GoalTimer"; // Import new component

const Goals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null); // Track clicked goal

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
    setIsFormOpen(false);
  };

  return (
    <div className="goals-page">
      <Navbar />
      <div className="goals-container">
        <div className="left-panel">
          <div className="planner-box"><p>Updated planner</p></div>
          <button className="fetch-btn">Fetch Recent Chat</button>
        </div>

        <div className="right-panel" style={{ padding: activeGoal ? "0" : "30px" }}>
          {activeGoal ? (
            <GoalTimer goal={activeGoal} onBack={() => setActiveGoal(null)} />
          ) : isFormOpen ? (
            <GoalForm onSave={handleAddGoal} onCancel={() => setIsFormOpen(false)} />
          ) : (
            <div className="goals-content">
              {goals.map((goal, index) => (
                <div 
                  key={index} 
                  className="goal-tab" 
                  style={{ backgroundColor: goal.color, cursor: "pointer" }}
                  onClick={() => setActiveGoal(goal)} // CLICK TO OPEN TIMER
                >
                  <div className="goal-icon-circle">{goal.category}</div>
                  <span className="goal-tab-title">{goal.title}</span>
                  <span className="goal-tab-time">{goal.time}</span>
                </div>
              ))}
              <button className="add-goal-btn" onClick={() => setIsFormOpen(true)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;