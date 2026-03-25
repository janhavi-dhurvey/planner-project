import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {

  const totalGoalSeconds = (goal?.duration || 60) * 60;

  const [seconds, setSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);
  }, [goal]);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {

      if (isBreakMode) {
        setBreakSeconds(prev => prev + 1);
      } else {
        setSeconds(prev => {

          const next = prev + 1;

          if (next >= totalGoalSeconds) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleGoalCompletion();
            alert("🎉 Goal completed!");
            return totalGoalSeconds;
          }

          return next;
        });
      }

    }, 1000);

    return () => clearInterval(timerRef.current);

  }, [isRunning, isBreakMode, totalGoalSeconds]);

  const handleGoalCompletion = async () => {
    try {
      if (goal?._id) {
        await API.put(`/goals/${goal._id}`, {
          ...goal,
          status: "completed"
        });
      }
    } catch {}

    try {
      const completed =
        JSON.parse(localStorage.getItem("completedGoals")) || [];

      completed.push({
        title: goal?.title || "Goal",
        duration: goal?.duration || 0,
        date: new Date().toLocaleDateString()
      });

      localStorage.setItem(
        "completedGoals",
        JSON.stringify(completed)
      );
    } catch {}
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;
  };

  const remainingSeconds = Math.max(totalGoalSeconds - seconds, 0);

  const progress =
    totalGoalSeconds > 0
      ? Math.min((seconds / totalGoalSeconds) * 100, 100)
      : 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  const startTimer = () => {
    if (isRunning) return;
    setIsBreakMode(false);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const startBreak = () => {
    clearInterval(timerRef.current);
    setIsBreakMode(true);
    setIsRunning(true);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);
  };

  const terminateGoal = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    onBack();
  };

  return (
    <div
      className="timer-view"
      style={{ backgroundColor: goal?.color || "#888" }}
    >

      <button className="back-btn-clean" onClick={terminateGoal}>
        ← Back
      </button>

      <div className="timer-inner">

        <h2 className="timer-goal-title">{goal?.title}</h2>

        {/* ✅ FIXED CIRCLE ALIGNMENT */}
        <div className="timer-circle-wrapper">

          <svg width="260" height="260"> {/* MATCHED WITH CSS */}

            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke="#ffffff40"
              strokeWidth="10"
              fill="none"
            />

            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke="#ffffff"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 130 130)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />

          </svg>

          {/* CENTER CONTENT */}
          <div className="timer-content">

            <p className="goal-target-display">
              Start Time: {goal?.time || "Now"}
            </p>

            <h1 className="current-timer">
              {formatTime(seconds)}
            </h1>

            <p className="remaining-text">
              Remaining: {formatTime(remainingSeconds)}
            </p>

            {!isRunning ? (
              <button className="play-btn" onClick={startTimer}>▶</button>
            ) : (
              <button className="play-btn" onClick={pauseTimer}>⏸</button>
            )}

            {isBreakMode && (
              <p className="break-counter">
                ☕ Break: {Math.floor(breakSeconds / 60)} min
              </p>
            )}

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
            <strong>{formatTime(breakSeconds)}</strong>
          </div>
        </div>

        <div className="timer-buttons">
          <button onClick={startBreak}>Start Break</button>
          <button onClick={resetTimer}>Reset Timer</button>
          <button onClick={terminateGoal}>Terminate Goal</button>
        </div>

      </div>
    </div>
  );
};

export default GoalTimer;