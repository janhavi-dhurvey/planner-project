import React, { useState } from "react";
import "./Goals.css";

const GoalForm = ({ onSave, onCancel }) => {

  const [title,setTitle] = useState("");
  const [startTime,setStartTime] = useState("");
  const [duration,setDuration] = useState(60);
  const [selectedCategory,setSelectedCategory] = useState("🎯");
  const [selectedColor,setSelectedColor] = useState("#C5B4E3");

  const [error,setError] = useState("");
  const [saving,setSaving] = useState(false);

  const categories = ["📖","✏️","🎧","💻","🎯","🏃‍♀️","🔍"];

  const colors = [
    "#C5B4E3",
    "#FF6B6B",
    "#FFD93D",
    "#F6C177",
    "#A8E063",
    "#9ECae1",
    "#8E7DBE"
  ];

  /* =========================================
     FORMAT TIME
  ========================================= */

  const formatTime = (time) => {

    if(!time) return "";

    const [hours,minutes] = time.split(":");

    let h = parseInt(hours);

    const ampm = h >= 12 ? "PM":"AM";

    h = h % 12;
    h = h ? h : 12;

    return `${h}:${minutes} ${ampm}`;

  };

  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {

    setTitle("");
    setStartTime("");
    setDuration(60);
    setSelectedCategory("🎯");
    setSelectedColor("#C5B4E3");
    setError("");

  };

  /* =========================================
     HANDLE SAVE
  ========================================= */

  const handleSave = async () => {

    if(saving) return;

    const trimmedTitle = title.trim();

    if(!trimmedTitle){

      setError("Please enter a goal title");
      return;

    }

    if(!startTime){

      setError("Please select a start time");
      return;

    }

    const durationMin = parseInt(duration);

    if(!durationMin || durationMin <= 0){

      setError("Duration must be greater than 0");
      return;

    }

    if(durationMin > 600){

      setError("Duration too long");
      return;

    }

    const newGoal = {

      title: trimmedTitle,

      time: formatTime(startTime),

      duration: durationMin,

      category: selectedCategory,

      color: selectedColor

    };

    try{

      setSaving(true);

      await onSave(newGoal);

      resetForm();

    }catch{

      setError("Failed to save goal");

    }finally{

      setSaving(false);

    }

  };

  /* =========================================
     ENTER KEY SUBMIT
  ========================================= */

  const handleKeyPress = (e) => {

    if(e.key === "Enter"){

      e.preventDefault();
      handleSave();

    }

  };

  return(

    <div className="goal-form">

      <h3 style={{marginBottom:"10px"}}>
        ➕ Add New Goal
      </h3>

      {error && (

        <div
          style={{
            color:"red",
            marginBottom:"10px",
            fontSize:"14px"
          }}
        >
          {error}
        </div>

      )}

      {/* TITLE */}

      <label>Goal Title</label>

      <input
        type="text"
        placeholder="Example: Study DSA"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        onKeyDown={handleKeyPress}
      />

      {/* START TIME */}

      <label>Start Time</label>

      <input
        type="time"
        value={startTime}
        onChange={(e)=>setStartTime(e.target.value)}
      />

      {/* DURATION */}

      <label>Duration (minutes)</label>

      <input
        type="number"
        value={duration}
        min="10"
        max="600"
        step="5"
        onChange={(e)=>setDuration(e.target.value)}
      />

      {/* CATEGORY */}

      <label>Category</label>

      <div className="category-icons">

        {categories.map(icon => (

          <span
            key={icon}
            onClick={()=>setSelectedCategory(icon)}
            style={{
              transform:
                selectedCategory === icon
                  ? "scale(1.35)"
                  : "scale(1)",
              transition:"0.2s"
            }}
          >
            {icon}
          </span>

        ))}

      </div>

      {/* COLOR */}

      <label>Color</label>

      <div className="color-options">

        {colors.map(color => (

          <div
            key={color}
            className="color-circle"
            onClick={()=>setSelectedColor(color)}
            style={{
              background:color,
              border:
                selectedColor === color
                  ? "3px solid #6c7543"
                  : "none",
              transform:
                selectedColor === color
                  ? "scale(1.15)"
                  : "scale(1)",
              transition:"0.2s"
            }}
          />

        ))}

      </div>

      {/* BUTTONS */}

      <div
        style={{
          marginTop:"25px",
          display:"flex",
          gap:"10px"
        }}
      >

        <button
          className="save-goal-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Goal"}
        </button>

        {onCancel && (

          <button
            className="save-goal-btn"
            style={{background:"#999"}}
            onClick={onCancel}
          >
            Cancel
          </button>

        )}

      </div>

    </div>

  );

};

export default GoalForm;