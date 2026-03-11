import React, { useState, useEffect } from "react";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {

  /* ------------------------------------------
     GOAL DURATION (minutes → seconds)
  ------------------------------------------ */

  const totalGoalSeconds = (goal?.duration || 60) * 60;

  const [seconds, setSeconds] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);

  /* ------------------------------------------
     RESET TIMER WHEN GOAL CHANGES
  ------------------------------------------ */

  useEffect(() => {

    setSeconds(0);
    setBreakTime(0);
    setIsRunning(false);
    setIsBreakMode(false);

  }, [goal]);

  /* ------------------------------------------
     TIMER ENGINE
  ------------------------------------------ */

  useEffect(() => {

    if (!isRunning) return;

    const interval = setInterval(() => {

      if (isBreakMode) {

        setBreakTime(prev => prev + 1);

      } else {

        setSeconds(prev => {

          if (prev >= totalGoalSeconds) {

            clearInterval(interval);

            setIsRunning(false);

            alert("🎉 Goal completed!");

            return prev;

          }

          return prev + 1;

        });

      }

    }, 1000);

    return () => clearInterval(interval);

  }, [isRunning, isBreakMode, totalGoalSeconds]);

  /* ------------------------------------------
     FORMAT TIME
  ------------------------------------------ */

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

  /* ------------------------------------------
     PROGRESS %
  ------------------------------------------ */

  const progress = totalGoalSeconds
    ? Math.min((seconds / totalGoalSeconds) * 100, 100).toFixed(0)
    : 0;

  /* ------------------------------------------
     TIMER CONTROLS
  ------------------------------------------ */

  const startTimer = () => {

    setIsBreakMode(false);
    setIsRunning(true);

  };

  const pauseTimer = () => {

    setIsRunning(false);

  };

  const startBreak = () => {

    setIsBreakMode(true);
    setIsRunning(true);

  };

  const resetTimer = () => {

    setSeconds(0);
    setBreakTime(0);
    setIsRunning(false);
    setIsBreakMode(false);

  };

  /* ------------------------------------------
     UI
  ------------------------------------------ */

  return (

    <div
      className="timer-view"
      style={{ backgroundColor: goal?.color || "#888" }}
    >

      {/* BACK */}

      <button
        className="back-arrow"
        onClick={onBack}
      >
        ←
      </button>

      {/* TITLE */}

      <h2 className="timer-goal-title">
        {goal?.title}
      </h2>

      {/* TIMER DISPLAY */}

      <div className="timer-circle-container">

        <div className="progress-badge">
          {progress}%
        </div>

        <div className="timer-display-main">

          <p className="goal-target-display">
            Start Time: {goal?.time}
          </p>

          <h1 className="current-timer">
            {formatTime(seconds)}
          </h1>

          {/* PLAY / PAUSE */}

          {!isRunning ? (

            <button
              className="play-pause-btn"
              onClick={startTimer}
            >
              ▶
            </button>

          ) : (

            <button
              className="play-pause-btn"
              onClick={pauseTimer}
            >
              ⏸
            </button>

          )}

          {/* BREAK INDICATOR */}

          <p className="break-counter">

            {isBreakMode
              ? `☕ Break: ${Math.floor(breakTime / 60)} min`
              : `Break: ${Math.floor(breakTime / 60)} min`}

          </p>

        </div>

      </div>

      {/* TIMER STATS */}

      <div className="timer-footer-stats">

        <div className="stat-box">

          <span>Goal Duration</span>

          <strong>
            {formatTime(totalGoalSeconds)}
          </strong>

        </div>

        <div className="stat-divider"></div>

        <div className="stat-box">

          <span>Break Time</span>

          <strong>
            {formatTime(breakTime)}
          </strong>

        </div>

      </div>

      {/* CONTROLS */}

      <button
        className="terminate-btn"
        onClick={startBreak}
      >
        Start Break
      </button>

      <button
        className="terminate-btn"
        onClick={resetTimer}
      >
        Reset Timer
      </button>

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