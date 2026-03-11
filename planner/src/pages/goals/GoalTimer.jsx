import React, { useState, useEffect } from "react";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {

  /* USE AI SUGGESTED DURATION */

  const totalGoalSeconds = (goal.duration || 60) * 60;

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  /* TIMER ENGINE */

  useEffect(() => {

    let interval = null;

    if (isActive && !isBreak) {

      interval = setInterval(() => {

        setSeconds(prev => {

          if (prev >= totalGoalSeconds) {
            clearInterval(interval);
            setIsActive(false);
            return prev;
          }

          return prev + 1;

        });

      }, 1000);

    }

    if (isBreak) {

      interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);

    }

    return () => clearInterval(interval);

  }, [isActive, isBreak, totalGoalSeconds]);

  /* FORMAT TIME */

  const formatTime = (totalSeconds) => {

    const hrs = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");

    const mins = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    const secs = (totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;

  };

  /* PROGRESS */

  const progress = Math.min(
    (seconds / totalGoalSeconds) * 100,
    100
  ).toFixed(0);

  /* START / PAUSE */

  const toggleTimer = () => {

    if (!isActive) {

      setIsActive(true);
      setIsBreak(false);

    } else {

      setIsActive(false);
      setIsBreak(true);

    }

  };

  return (

    <div
      className="timer-view"
      style={{ backgroundColor: goal.color }}
    >

      <button
        className="back-arrow"
        onClick={onBack}
      >
        ←
      </button>

      <h2 className="timer-goal-title">
        {goal.title}
      </h2>

      <div className="timer-circle-container">

        <div className="progress-badge">
          {progress}%
        </div>

        <div className="timer-display-main">

          <p className="goal-target-display">
            Start Time: {goal.time}
          </p>

          <h1 className="current-timer">
            {formatTime(seconds)}
          </h1>

          <button
            className="play-pause-btn"
            onClick={toggleTimer}
          >
            {isActive ? "⏸" : "▶"}
          </button>

          <p className="break-counter">
            Break: {Math.floor(breakTime / 60)} min
          </p>

        </div>

      </div>

      <div className="timer-footer-stats">

        <div className="stat-box">
          <span>Goal Duration</span>
          <strong>{formatTime(totalGoalSeconds)}</strong>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-box">
          <span>Break Time</span>
          <strong>{formatTime(breakTime)}</strong>
        </div>

      </div>

      <button
        className="terminate-btn"
        onClick={onBack}
      >
        Terminate Goal
      </button>

    </div>

  );

};

export default GoalTimer;