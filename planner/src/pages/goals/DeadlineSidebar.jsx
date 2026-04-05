import React, { useState, useEffect } from "react";
import API from "../../services/api";

const DeadlineSidebar = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: "", dueDate: "" });

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const res = await API.get("/deadlines");
      setDeadlines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching deadlines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    try {
      // Ensure the date is treated as a valid Date object before sending
      await API.post("/deadlines", {
        ...newDeadline,
        dueDate: new Date(newDeadline.dueDate).toISOString()
      });
      
      setNewDeadline({ title: "", dueDate: "" });
      setShowModal(false);
      fetchDeadlines();
    } catch (err) {
      console.error("Add deadline error:", err);
      alert("Failed to add deadline. Please check if the server is running.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "#fff", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0, color: "#ffffff" }}>🔔 Deadlines</h3>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: "rgba(255,255,255,0.3)",
            border: "none",
            color: "white",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          +
        </button>
      </div>

      {loading ? (
        <p style={{ opacity: 0.8, fontSize: "14px" }}>Loading deadlines...</p>
      ) : deadlines.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "40px", padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>No active deadlines.</p>
          <p style={{ fontSize: "12px", opacity: 0.8 }}>Add one manually or tell the AI about your exams!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {deadlines.map((d) => (
            <div 
              key={d._id}
              style={{
                background: "rgba(255, 255, 255, 0.25)",
                padding: "15px",
                borderRadius: "15px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ fontWeight: "800", marginBottom: "8px", fontSize: "15px", color: "#ffffff" }}>
                {d.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>
                  {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ 
                  fontSize: "18px", 
                  fontWeight: "900", 
                  color: d.daysRemaining <= 3 ? "#ff4d4d" : "#ffffff",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                }}>
                  {d.daysRemaining} <small style={{ fontSize: "10px", fontWeight: "600" }}>days left</small>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOR ADDING DEADLINES */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999, color: "#333"
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "320px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h4 style={{ marginBottom: "20px", textAlign: "center", fontWeight: "700" }}>Add New Deadline</h4>
            <form onSubmit={handleAddDeadline}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "5px" }}>TITLE</label>
                <input 
                  type="text" placeholder="e.g. Finals or Project" required
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "25px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "5px" }}>DUE DATE</label>
                <input 
                  type="date" required
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({...newDeadline, dueDate: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#4a7c59", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Save</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "#f0f0f0", color: "#666", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlineSidebar;