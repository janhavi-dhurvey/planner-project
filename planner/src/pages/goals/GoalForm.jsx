import React, { useState } from "react";
import "./Goals.css";

const GoalForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("00:00");
  const [selectedCategory, setSelectedCategory] = useState("🎯");
  const [selectedColor, setSelectedColor] = useState("#C5B4E3");

  const categories = ["📖", "✏️", "🎧", "💻", "🎯", "🏃‍♀️", "🔍"];
  const colors = ["#d4e0ad", "#C5B4E3", "#B3E5FC", "#FFD93D", "#FF6B6B"];

  const handleSave = () => {
    if (!title) return alert("Please enter a title!");
    onSave({ title, time, category: selectedCategory, color: selectedColor });
  };

  return (
    <div className="goal-form-container">
      <h3>Title</h3>
      <input 
        type="text" 
        placeholder="Goal Title" 
        className="goal-input" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <h3>Category</h3>
      <div className="category-icons">
        {categories.map((icon) => (
          <span
            key={icon}
            onClick={() => setSelectedCategory(icon)}
            className={selectedCategory === icon ? "icon-active" : ""}
          >{icon}</span>
        ))}
      </div>

      <h3>Daily Goal Time</h3>
      <input 
        type="time" 
        className="goal-input" 
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <h3>Color</h3>
      <div className="color-dots">
        {colors.map((color) => (
          <span
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{ 
              background: color, 
              border: selectedColor === color ? "3px solid #6c7543" : "none" 
            }}
          ></span>
        ))}
      </div>

      <button className="save-btn" onClick={handleSave}>
        <div className="check-icon">✓</div>
      </button>
    </div>
  );
};

export default GoalForm;