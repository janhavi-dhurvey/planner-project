import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import SelectedDateView from "./SelectedDateView";
import "./Calendar.css";

const Calendar = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================
      LOCAL DATE INITIALIZATION (IST FIX)
  ========================================= */
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  /* =========================================
      HELPER: LATE NIGHT SORTING LOGIC
  ========================================= */
  const parseTimeForSort = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const [time, period] = timeStr.split(" ");
      let [hour, minute] = time.split(":").map(Number);
      
      // LOGIC FIX: Treat 12:00 AM as the end of the day cycle (24:00)
      if (period === "AM" && hour === 12) {
        hour = 24; 
      } else if (period === "PM" && hour < 12) {
        hour += 12;
      }
      
      return hour * 60 + minute;
    } catch {
      return 0;
    }
  };

  /* =========================================
      LOAD GOALS (FETCH BY DATE)
  ========================================= */

  useEffect(() => {
    loadGoals(selectedDate);
  }, [selectedDate]);

  const loadGoals = async (date) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/goals?date=${date}`);
      const data = Array.isArray(res.data) ? res.data : [];

      // SORTING FIX: Use numeric calculation to handle AM/PM correctly
      const sorted = [...data].sort((a, b) => {
        // First try sorting by the 'order' property assigned by Chatbot
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // Fallback to numeric time sorting
        return parseTimeForSort(a.time) - parseTimeForSort(b.time);
      });

      setGoals(sorted);
    } catch (err) {
      console.error("Calendar load error:", err);
      setError("Failed to load planner for this date.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#dcd4c7",
        paddingTop: "100px",
        paddingBottom: "50px"
      }}
    >
      <Navbar />

      <div style={{ width: "85%", margin: "auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px", fontWeight: "700" }}>
          📅 AI Timeline Planner
        </h2>

        {/* DATE SELECTOR */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ marginBottom: "10px", opacity: 0.8, fontWeight: "600" }}>
            Select a Date to View Plan
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input-field"
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              cursor: "pointer",
              outline: "none",
              fontFamily: "inherit"
            }}
          />
        </div>

        {/* TIMELINE VIEW COMPONENT */}
        <SelectedDateView 
          goals={goals} 
          loading={loading} 
          error={error} 
          selectedDate={selectedDate} 
        />
        
      </div>
    </div>
  );
};

export default Calendar;