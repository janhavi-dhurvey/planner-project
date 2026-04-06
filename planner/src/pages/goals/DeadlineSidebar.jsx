import React, { useState, useEffect } from "react";
import API from "../../services/api";

const DeadlineSidebar = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: "", dueDate: "" });

  useEffect(() => {
    fetchDeadlines();

    const handleFocus = () => fetchDeadlines();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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
      await API.post("/deadlines", {
        ...newDeadline,
        dueDate: new Date(newDeadline.dueDate).toISOString()
      });
      
      setNewDeadline({ title: "", dueDate: "" });
      setShowModal(false);
      fetchDeadlines();
    } catch (err) {
      console.error("Add deadline error:", err);
      alert("Failed to add deadline.");
    }
  };

  const deleteDeadline = async (id) => {
    if (!window.confirm("Remove this deadline?")) return;
    try {
      await API.delete(`/deadlines/${id}`);
      fetchDeadlines();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div style={{ 
      padding: "24px 16px", 
      color: "#fff", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
      boxSizing: "border-box"
    }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        flexShrink: 0 
      }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", margin: 0, letterSpacing: "1px", color: "#ffffff", opacity: 0.9 }}>
          🔔 DEADLINES
        </h3>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#ffffff",
            borderRadius: "8px",
            width: "28px",
            height: "28px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
        >
          +
        </button>
      </div>

      {/* LIST AREA */}
      <div className="custom-sidebar-scroll" style={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingRight: "4px"
      }}>
        {loading && deadlines.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: "12px", textAlign: "center", marginTop: "20px" }}>Refreshing data...</p>
        ) : deadlines.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            marginTop: "20px", 
            padding: "24px 16px", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "16px",
            border: "1px dashed rgba(255,255,255,0.15)" 
          }}>
            <p style={{ fontSize: "12px", fontWeight: "500", opacity: 0.7, margin: 0 }}>No upcoming deadlines</p>
          </div>
        ) : (
          deadlines.map((d) => {
            const daysLeft = d.daysRemaining ?? calculateDaysLeft(d.dueDate);
            const isUrgent = daysLeft <= 3;

            return (
              <div 
                key={d._id}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  padding: "18px 16px",
                  borderRadius: "16px",
                  borderLeft: `5px solid ${isUrgent ? "#ff6b6b" : "#c2d6a3"}`,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  minHeight: "90px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* DELETE BUTTON */}
                <button 
                  onClick={() => deleteDeadline(d._id)}
                  style={{
                    position: "absolute", top: "8px", right: "8px",
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    cursor: "pointer", fontSize: "14px", padding: "4px"
                  }}
                  title="Remove Deadline"
                >
                  🗑
                </button>

                <div style={{ 
                  fontWeight: "700", 
                  fontSize: "13.5px", 
                  color: "#ffffff", 
                  marginBottom: "12px",
                  lineHeight: "1.3",
                  paddingRight: "20px",
                  wordBreak: "break-word", // Ensures text stays inside box
                  textTransform: "uppercase"
                }}>
                  {d.title}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", opacity: 0.8, background: "rgba(0,0,0,0.15)", padding: "4px 8px", borderRadius: "6px", letterSpacing: "0.5px" }}>
                    {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ 
                      fontSize: "18px", 
                      fontWeight: "900", 
                      color: isUrgent ? "#ff6b6b" : "#ffffff",
                      lineHeight: "1",
                      display: "block"
                    }}>
                      {daysLeft}
                    </span>
                    <span style={{ fontSize: "8px", fontWeight: "800", opacity: 0.5, textTransform: "uppercase" }}>
                      Days left
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); borderRadius: 10px; }
      `}</style>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999, padding: "20px"
        }}>
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "24px", width: "100%", maxWidth: "320px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h4 style={{ margin: "0 0 20px 0", textAlign: "center", color: "#4a7c59", fontWeight: "800" }}>New Deadline</h4>
            <form onSubmit={handleAddDeadline}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "10px", fontWeight: "900", color: "#999", display: "block", marginBottom: "6px" }}>TITLE</label>
                <input 
                  type="text" placeholder="Task Name" required
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f0f0f0", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "10px", fontWeight: "900", color: "#999", display: "block", marginBottom: "6px" }}>DUE DATE</label>
                <input 
                  type="date" required
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({...newDeadline, dueDate: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f0f0f0", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 1.5, padding: "14px", background: "#4a7c59", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "800" }}>Save</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "14px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlineSidebar;