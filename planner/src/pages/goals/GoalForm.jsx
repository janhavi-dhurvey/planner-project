import React, { useState } from "react";
import "./Goals.css";

const GoalForm = ({ onSave, onCancel }) => {

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState("📘");
  const [color, setColor] = useState("#89CFF0");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = ["📘","✏️","🎧","💻","🎯","🏃‍♀️","🔍"];

  const colors = [
    "#C5B4E3",
    "#FF6B6B",
    "#FFD93D",
    "#F6C177",
    "#A8E063",
    "#9ECae1",
    "#8E7DBE"
  ];

  /* ================= FORMAT TIME ================= */
  const formatTime = (time) => {
    if (!time) return "";

    const [h, m] = time.split(":");
    let hour = parseInt(h);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${m} ${ampm}`;
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {

    if (saving) return;

    if (!title.trim()) {
      setError("Enter a goal title");
      return;
    }

    if (!startTime) {
      setError("Select start time");
      return;
    }

    if (duration <= 0) {
      setError("Invalid duration");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        title: title.trim(),
        time: formatTime(startTime),
        duration: Number(duration),
        category,
        color
      });

      setTitle("");
      setStartTime("");
      setDuration(60);
      setError("");

    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="goal-form-old">

      <h2 className="goal-form-title">+ Add New Goal</h2>

      {error && <p className="goal-error">{error}</p>}

      {/* TITLE */}
      <div className="goal-input-group">
        <label>Goal Title</label>
        <input
          type="text"
          placeholder="Example: Study DSA"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* TIME */}
      <div className="goal-input-group">
        <label>Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      {/* DURATION */}
      <div className="goal-input-group">
        <label>Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {/* CATEGORY */}
      <div className="goal-input-group">
        <label>Category</label>
        <div className="category-icons">
          {categories.map((c) => (
            <span
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? "active-icon" : ""}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* COLOR */}
      <div className="goal-input-group">
        <label>Color</label>
        <div className="color-options">
          {colors.map((clr) => (
            <div
              key={clr}
              className={`color-circle ${color === clr ? "active-color" : ""}`}
              style={{ background: clr }}
              onClick={() => setColor(clr)}
            />
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="goal-form-actions">
        <button className="goal-save" onClick={handleSave}>
          {saving ? "Saving..." : "Save"}
        </button>

        <button className="goal-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

    </div>
  );
};

export default GoalForm;