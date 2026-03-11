import React, { useState } from "react";
import "./Goals.css";

const GoalForm = ({ onSave, onCancel }) => {

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("00:00");
  const [selectedCategory, setSelectedCategory] = useState("🎯");
  const [selectedColor, setSelectedColor] = useState("#C5B4E3");

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

  const handleSave = () => {

    if (!title) {
      alert("Please enter a title!");
      return;
    }

    onSave({
      title,
      time,
      category: selectedCategory,
      color: selectedColor
    });

  };

  return (

    <div className="goal-form">

      {/* TITLE */}

      <label>Title</label>

      <input
        type="text"
        placeholder="Goal Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
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
                  ? "scale(1.3)"
                  : "scale(1)"
            }}
          >
            {icon}
          </span>

        ))}

      </div>

      {/* TIME */}

      <label>Daily Goal Time</label>

      <input
        type="time"
        value={time}
        onChange={(e)=>setTime(e.target.value)}
      />

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
                  : "none"
            }}
          />

        ))}

      </div>

      {/* SAVE */}

      <button
        className="save-goal-btn"
        onClick={handleSave}
      >
        Save Goal
      </button>

    </div>

  );

};

export default GoalForm;