import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./Goals.css";

const GoalTimer = ({ goal, onBack }) => {

  const totalGoalSeconds = (goal?.duration || 60) * 60;

  const [seconds,setSeconds] = useState(0);
  const [breakSeconds,setBreakSeconds] = useState(0);
  const [isRunning,setIsRunning] = useState(false);
  const [isBreakMode,setIsBreakMode] = useState(false);

  const timerRef = useRef(null);

  /* =========================================
     RESET TIMER WHEN GOAL CHANGES
  ========================================= */

  useEffect(()=>{

    clearInterval(timerRef.current);

    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);

  },[goal]);

  /* =========================================
     TIMER ENGINE
  ========================================= */

  useEffect(()=>{

    if(!isRunning) return;

    timerRef.current = setInterval(()=>{

      if(isBreakMode){

        setBreakSeconds(prev => prev + 1);

      }else{

        setSeconds(prev => {

          const next = prev + 1;

          if(next >= totalGoalSeconds){

            clearInterval(timerRef.current);

            setIsRunning(false);

            handleGoalCompletion();

            alert("🎉 Goal completed!");

            return totalGoalSeconds;

          }

          return next;

        });

      }

    },1000);

    return () => clearInterval(timerRef.current);

  },[isRunning,isBreakMode,totalGoalSeconds]);

  /* =========================================
     SAVE GOAL COMPLETION
  ========================================= */

  const handleGoalCompletion = async () => {

    try{

      if(goal?._id){

        await API.put(`/goals/${goal._id}`,{
          ...goal,
          status:"completed"
        });

      }

    }catch(err){

      console.log("Goal completion API failed");

    }

    /* local fallback */

    try{

      const completed =
        JSON.parse(localStorage.getItem("completedGoals")) || [];

      completed.push({

        title:goal?.title || "Goal",
        duration:goal?.duration || 0,
        date:new Date().toLocaleDateString()

      });

      localStorage.setItem(
        "completedGoals",
        JSON.stringify(completed)
      );

    }catch{

      console.log("Local completion save error");

    }

  };

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (totalSeconds)=>{

    const hrs = Math.floor(totalSeconds/3600)
      .toString()
      .padStart(2,"0");

    const mins = Math.floor((totalSeconds%3600)/60)
      .toString()
      .padStart(2,"0");

    const secs = (totalSeconds%60)
      .toString()
      .padStart(2,"0");

    return `${hrs}:${mins}:${secs}`;

  };

  /* =========================================
     REMAINING TIME
  ========================================= */

  const remainingSeconds = Math.max(
    totalGoalSeconds - seconds,
    0
  );

  /* =========================================
     PROGRESS %
  ========================================= */

  const progress =
    totalGoalSeconds > 0
      ? Math.min((seconds / totalGoalSeconds) * 100,100)
      : 0;

  /* =========================================
     TIMER CONTROLS
  ========================================= */

  const startTimer = ()=>{

    if(isRunning) return;

    setIsBreakMode(false);
    setIsRunning(true);

  };

  const pauseTimer = ()=>{

    setIsRunning(false);

  };

  const startBreak = ()=>{

    clearInterval(timerRef.current);

    setIsBreakMode(true);
    setIsRunning(true);

  };

  const resetTimer = ()=>{

    clearInterval(timerRef.current);

    setSeconds(0);
    setBreakSeconds(0);
    setIsRunning(false);
    setIsBreakMode(false);

  };

  const terminateGoal = ()=>{

    clearInterval(timerRef.current);

    setIsRunning(false);

    onBack();

  };

  return(

    <div
      className="timer-view"
      style={{backgroundColor:goal?.color || "#888"}}
    >

      {/* BACK BUTTON */}

      <button
        className="back-arrow"
        onClick={terminateGoal}
      >
        ←
      </button>

      {/* TITLE */}

      <h2 className="timer-goal-title">
        {goal?.title}
      </h2>

      {/* TIMER */}

      <div className="timer-circle-container">

        <div className="progress-badge">
          {Math.round(progress)}%
        </div>

        <div className="timer-display-main">

          <p className="goal-target-display">
            Start Time: {goal?.time || "Now"}
          </p>

          <h1 className="current-timer">
            {formatTime(seconds)}
          </h1>

          <p style={{fontSize:"13px"}}>
            Remaining: {formatTime(remainingSeconds)}
          </p>

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

          {isBreakMode && (

            <p className="break-counter">
              ☕ Break: {Math.floor(breakSeconds/60)} min
            </p>

          )}

        </div>

      </div>

      {/* STATS */}

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
            {formatTime(breakSeconds)}
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
        onClick={terminateGoal}
      >
        Terminate Goal
      </button>

    </div>

  );

};

export default GoalTimer;