import React, { useState } from "react";
import "../../App.css";
import "./Goals.css";
import Navbar from "../../components/Navbar";
import GoalForm from "./GoalForm";
import GoalTimer from "./GoalTimer";

const Goals = () => {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);

  /* SAVE GOALS */

  const saveGoals = (updatedGoals) => {

    setGoals(updatedGoals);

    localStorage.setItem(
      "plannerGoals",
      JSON.stringify(updatedGoals)
    );

  };

  /* ADD GOAL */

  const handleAddGoal = (newGoal) => {

    const updatedGoals = [...goals, newGoal];

    saveGoals(updatedGoals);

    setIsFormOpen(false);

  };

  /* DELETE GOAL */

  const deleteGoal = (index, e) => {

    e.stopPropagation();

    const updatedGoals = goals.filter((_, i) => i !== index);

    saveGoals(updatedGoals);

  };

  /* EDIT GOAL */

  const editGoal = (index, e) => {

    e.stopPropagation();

    const newTitle = prompt("Edit goal title:", goals[index].title);
    const newTime = prompt("Edit goal time:", goals[index].time);

    if (!newTitle || !newTime) return;

    const updatedGoals = [...goals];

    updatedGoals[index] = {
      ...updatedGoals[index],
      title: newTitle,
      time: newTime
    };

    saveGoals(updatedGoals);

  };

  /* FETCH AI PLANNER */

  const fetchRecentChat = () => {

    const sessionFlag = sessionStorage.getItem("plannerSession");

    if (!sessionFlag) {
      alert("Please generate a planner using the Chatbot first.");
      return;
    }

    const storedGoals = localStorage.getItem("plannerGoals");

    if (!storedGoals) {
      alert("No planner data found.");
      return;
    }

    try {

      const parsedGoals = JSON.parse(storedGoals);

      if (Array.isArray(parsedGoals)) {
        setGoals(parsedGoals);
      }

    } catch {

      alert("Planner data corrupted.");

    }

  };

  return (

    <div className="goals-page">

      <Navbar />

      <div className="goals-container">

        {/* LEFT PANEL */}

        <div className="left-panel">

          <div className="planner-box">
            <p>AI Planner</p>
          </div>

          <button
            className="fetch-btn"
            onClick={fetchRecentChat}
          >
            Fetch Recent Chat
          </button>

        </div>

        {/* RIGHT PANEL */}

        <div
          className="right-panel"
          style={{ padding: activeGoal ? "0" : "30px" }}
        >

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

              {goals.length === 0 ? (

                <div style={{ textAlign: "center", opacity: 0.6 }}>
                  Click "Fetch Recent Chat" to load your AI planner.
                </div>

              ) : (

                goals.map((goal, index) => (

                  <div
                    key={index}
                    className="goal-tab"
                    style={{ backgroundColor: goal.color }}
                    onClick={() => setActiveGoal(goal)}
                  >

                    <div className="goal-icon-circle">
                      {goal.category}
                    </div>

                    <span className="goal-tab-title">
                      {goal.title}
                    </span>

                    <span className="goal-tab-time">
                      {goal.time}
                    </span>

                    <div className="goal-actions">

                      <button
                        className="goal-edit"
                        onClick={(e) => editGoal(index, e)}
                      >
                        ✏
                      </button>

                      <button
                        className="goal-delete"
                        onClick={(e) => deleteGoal(index, e)}
                      >
                        🗑
                      </button>

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