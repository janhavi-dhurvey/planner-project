import React, { useState } from "react";
import API from "../../services/api";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    if (e) e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email: trimmedEmail,
        password
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );
      }

      /* ✅ CORRECT REDIRECT (FIXED) */
      navigate("/chatbot");

    } catch (err) {

      console.error("LOGIN ERROR:", err);

      setError(
        err?.response?.data?.error ||
        "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ENTER KEY SUPPORT */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div style={pageStyle}>

      <form style={cardStyle} onSubmit={handleLogin}>

        <h2>🔐 Login</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          style={buttonStyle}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link to="/signup">Signup</Link>
        </p>

      </form>

    </div>
  );
};

/* STYLES */

const pageStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#dcd4c7"
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "18px",
  width: "320px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#6c7543",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const errorStyle = {
  background: "#ffdede",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "10px",
  color: "#b30000"
};

export default Login;