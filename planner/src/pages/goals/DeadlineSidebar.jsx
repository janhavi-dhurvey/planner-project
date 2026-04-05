import React, { useState, useEffect } from "react";
import API from "../../services/api";

const DeadlineSidebar = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ title: "", dueDate: "" });

  useEffect(() => {
    fetchDeadlines();

    // REFRESH TRIGGER: Sync data when user returns to this tab
    window.addEventListener("focus", fetchDeadlines);
    return () => window.removeEventListener("focus", fetchDeadlines);
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
      // Immediate refresh after manual add
      fetchDeadlines();
    } catch (err) {
      console.error("Add deadline error:", err);
      alert("Failed to add deadline.");
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
      padding: "24px 20px", 
      color: "#fff", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "25px",
        flexShrink: 0 
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, letterSpacing: "0.5px", color: "#ffffff" }}>
          🔔 DEADLINES
        </h3>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: "#ffffff",
            border: "none",
            color: "#6c7543",
            borderRadius: "10px",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontWeight: "900",
            fontSize: "18px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.2s"
          }}
        >
          +
        </button>
      </div>

      {/* LIST AREA */}
      <div style={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingBottom: "20px"
      }}>
        {loading ? (
          <p style={{ opacity: 0.6, fontSize: "13px", fontWeight: "500" }}>Updating tracking...</p>
        ) : deadlines.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            marginTop: "30px", 
            padding: "20px", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "16px",
            border: "1px dashed rgba(255,255,255,0.2)" 
          }}>
            <p style={{ fontSize: "13px", fontWeight: "600", opacity: 0.8 }}>No Deadlines Tracked</p>
          </div>
        ) : (
          deadlines.map((d) => {
            const daysLeft = d.daysRemaining ?? calculateDaysLeft(d.dueDate);
            const isUrgent = daysLeft <= 3;

            return (
              <div 
                key={d._id}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  padding: "16px",
                  borderRadius: "14px",
                  borderLeft: `4px solid ${isUrgent ? "#ff6b6b" : "#a3b18a"}`,
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease"
                }}
              >
                <div style={{ 
                  fontWeight: "700", 
                  fontSize: "14px", 
                  color: "#ffffff", 
                  marginBottom: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {d.title}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", opacity: 0.7, letterSpacing: "0.3px" }}>
                    {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>

                  <div style={{ textAlign: "right", display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ 
                      fontSize: "22px", 
                      fontWeight: "900", 
                      color: isUrgent ? "#ff6b6b" : "#ffffff",
                      lineHeight: "1"
                    }}>
                      {daysLeft}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: "800", opacity: 0.6, textTransform: "uppercase" }}>
                      Days
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999, padding: "20px"
        }}>
          <div style={{ 
            background: "#ffffff", 
            padding: "28px", 
            borderRadius: "24px", 
            width: "100%", 
            maxWidth: "320px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <h4 style={{ margin: "0 0 20px 0", textAlign: "center", color: "#4a7c59", fontWeight: "800" }}>Set New Deadline</h4>
            <form onSubmit={handleAddDeadline}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "10px", fontWeight: "900", color: "#999", display: "block", marginBottom: "6px" }}>DEADLINE TITLE</label>
                <input 
                  type="text" placeholder="e.g. Physics Final" required
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f0f0f0", outline: "none", fontSize: "14px" }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "10px", fontWeight: "900", color: "#999", display: "block", marginBottom: "6px" }}>TARGET DATE</label>
                <input 
                  type="date" required
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({...newDeadline, dueDate: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f0f0f0", outline: "none", fontSize: "14px" }}
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