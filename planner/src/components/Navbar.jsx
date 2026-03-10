import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/goals" className="nav-item" style={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/goals" className="nav-item" style={{ textDecoration: 'none' }}>
          Goals
        </Link>
        <Link to="/chatbot" className="nav-item" style={{ textDecoration: 'none' }}>
          Chatbot
        </Link>
        <Link to="/goals" className="nav-item" style={{ textDecoration: 'none' }}>
          Calendar
        </Link>
      </div>

      <div className="nav-right">
        <span className="login-text">Login/Signup</span>
        <div className="profile-icon">👤</div>
      </div>
    </nav>
  );
};

export default Navbar;