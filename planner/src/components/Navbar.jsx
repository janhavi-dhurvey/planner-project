import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

  const navigate = useNavigate();

  /* =========================================
     READ TOKEN
  ========================================= */

  const token = localStorage.getItem("token");

  /* =========================================
     READ USER SAFELY (OPTIMIZED)
  ========================================= */

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("User parse error:", err);
      return null;
    }
  }, []);

  /* =========================================
     AVATAR
  ========================================= */

  const avatar = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "👤";

  /* =========================================
     HANDLERS
  ========================================= */

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileClick = () => {
    try {
      if (!user) {
        alert("User not found");
        return;
      }

      const name = user?.name || "User";
      const email = user?.email || "No email";

      alert(`Logged in as:\n\n${name}\n${email}`);

    } catch (err) {
      console.error("Profile error:", err);
      alert("Error reading user data");
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (

    <nav className="navbar">

      {/* LEFT MENU */}
      <div className="nav-left">

        <NavLink to="/" className="nav-item">
          Home
        </NavLink>

        <NavLink to="/goals" className="nav-item">
          Goals
        </NavLink>

        <NavLink to="/chatbot" className="nav-item">
          Chatbot
        </NavLink>

        <NavLink to="/calendar" className="nav-item">
          Calendar
        </NavLink>

      </div>

      {/* RIGHT MENU */}
      <div className="nav-right">

        {!token ? (
          <>
            <span
              className="login-text"
              onClick={handleLogin}
            >
              Login
            </span>

            <button
              className="signup-btn"
              onClick={handleSignup}
            >
              Signup
            </button>
          </>
        ) : (
          <>
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

            <div
              className="profile-icon"
              onClick={handleProfileClick}
              title="User profile"
            >
              {avatar}
            </div>
          </>
        )}

      </div>

    </nav>

  );

};

export default Navbar;