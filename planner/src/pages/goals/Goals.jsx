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

  /* -----------------------------------------
     SAVE GOALS
  ----------------------------------------- */

  const saveGoals = (updatedGoals) => {

    setGoals(updatedGoals);

    localStorage.setItem(
      "plannerGoals",
      JSON.stringify(updatedGoals)
    );

  };

  /* -----------------------------------------
     ADD GOAL
  ----------------------------------------- */

  const handleAddGoal = (newGoal) => {

    const updatedGoals = [...goals, newGoal];

    saveGoals(updatedGoals);

    setIsFormOpen(false);

  };

  /* -----------------------------------------
     DELETE GOAL
  ----------------------------------------- */

  const deleteGoal = (index, e) => {

    e.stopPropagation();

    const updatedGoals = goals.filter((_, i) => i !== index);

    saveGoals(updatedGoals);

  };

  /* -----------------------------------------
     EDIT GOAL
  ----------------------------------------- */

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

  /* -----------------------------------------
     FETCH AI PLANNER
  ----------------------------------------- */

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

  /* -----------------------------------------
     FORMAT TIME (24h → 12h)
  ----------------------------------------- */

  const formatTime = (time) => {

    if (!time) return "";

    const [hours, minutes] = time.split(":");

    let h = parseInt(hours);

    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12;

    return `🕒 ${h}:${minutes} ${ampm}`;

  };

  /* -----------------------------------------
     FORMAT DURATION
  ----------------------------------------- */

  const formatDuration = (duration) => {

    if (!duration) return "";

    if (duration >= 60) {

      const hrs = Math.floor(duration / 60);

      const mins = duration % 60;

      if (mins === 0) return `${hrs}h`;

      return `${hrs}h ${mins}m`;

    }

    return `${duration}m`;

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
          style={{ padding: activeGoal ? "0" : "25px" }}
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

                <div
                  style={{
                    textAlign: "center",
                    opacity: 0.6,
                    paddingTop: "40px"
                  }}
                >
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

                    {/* TIME + DURATION */}

                    <span className="goal-tab-time">

                      {formatTime(goal.time)}

                      {goal.duration && (

                        <span
                          style={{
                            marginLeft: "6px",
                            opacity: 0.8
                          }}
                        >
                          • {formatDuration(goal.duration)}
                        </span>

                      )}

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

              {/* ADD GOAL BUTTON */}

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