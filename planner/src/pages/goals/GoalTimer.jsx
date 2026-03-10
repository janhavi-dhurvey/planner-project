import React, { useState, useEffect } from "react";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  // Convert "HH:MM" goal time to total seconds for the progress circle calculation
  const goalParts = goal.time.split(":");
  const totalGoalSeconds = parseInt(goalParts[0]) * 3600 + parseInt(goalParts[1]) * 60;

  useEffect(() => {
    let interval = null;
    if (isActive && !isBreak) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isBreak) {
      interval = setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isBreak]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const progress = Math.min((seconds / totalGoalSeconds) * 100, 100).toFixed(0);

  return (
    <div className="timer-view" style={{ backgroundColor: goal.color }}>
      <button className="back-arrow" onClick={onBack}>←</button>
      <h2 className="timer-goal-title">{goal.title}</h2>

      <div className="timer-circle-container">
        <div className="progress-badge">{progress}%</div>
        <div className="timer-display-main">
          <p className="goal-target-display">{goal.time}:00</p>
          <h1 className="current-timer">{formatTime(seconds)}</h1>
          <button 
            className="play-pause-btn" 
            onClick={() => {
              setIsActive(!isActive);
              if (isActive) setIsBreak(true);
              else setIsBreak(false);
            }}
          >
            {isActive ? "⏸" : "▶"}
          </button>
          <p className="break-counter">Break : {Math.floor(breakTime / 60)} time</p>
        </div>
      </div>

      <div className="timer-footer-stats">
        <div className="stat-box">
          <span>Goal time</span>
          <strong>{goal.time}:00</strong>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <span>Break Time</span>
          <strong>{formatTime(breakTime)}</strong>
        </div>
      </div>

      <button className="terminate-btn" onClick={onBack}>Terminate Goal</button>
    </div>
  );
};

export default GoalTimer;