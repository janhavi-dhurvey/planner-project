import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  /* =========================================
     REDIRECT IF ALREADY LOGGED IN
  ========================================= */

  useEffect(()=>{

    const token = localStorage.getItem("token");

    if(token){
      navigate("/chatbot");
    }

  },[navigate]);

  /* =========================================
     HANDLE SIGNUP
  ========================================= */

  const handleSignup = async (e) => {

    if(e) e.preventDefault();
    if(loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    /* VALIDATION */

    if(!trimmedName || !trimmedEmail || !password || !confirmPassword){
      setError("Please fill all fields");
      return;
    }

    if(!trimmedEmail.includes("@")){
      setError("Please enter a valid email");
      return;
    }

    if(password.length < 6){
      setError("Password must be at least 6 characters");
      return;
    }

    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }

    try{

      setLoading(true);
      setError("");

      const res = await API.post("/auth/signup",{
        name: trimmedName,
        email: trimmedEmail,
        password
      });

      /* SAVE TOKEN */

      if(res?.data?.token){
        localStorage.setItem("token",res.data.token);
      }

      /* SAVE USER */

      if(res?.data?.user){
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );
      }

      navigate("/chatbot");

    }catch(err){

      console.error("Signup error:",err);

      setError(
        err?.response?.data?.error ||
        "Signup failed. Please try again."
      );

    }finally{

      setLoading(false);

    }

  };

  /* =========================================
     ENTER KEY SIGNUP
  ========================================= */

  const handleKeyPress = (e) => {

    if(e.key === "Enter"){
      handleSignup(e);
    }

  };

  /* =========================================
     UI
  ========================================= */

  return(

    <div style={pageStyle}>

      <form style={cardStyle} onSubmit={handleSignup}>

        <h2 style={titleStyle}>
          📝 Create Account
        </h2>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <input
          style={inputStyle}
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <input
          style={inputStyle}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <input
          style={inputStyle}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <input
          style={inputStyle}
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          style={buttonStyle}
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <p style={loginTextStyle}>

          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>
            Login
          </Link>

        </p>

      </form>

    </div>

  );

};

/* =========================================
   STYLES
========================================= */

const pageStyle = {

  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#dcd4c7"

};

const cardStyle = {

  background:"white",
  padding:"40px",
  borderRadius:"18px",
  width:"340px",
  boxShadow:"0 10px 25px rgba(0,0,0,0.1)",
  textAlign:"center"

};

const titleStyle = {
  marginBottom:"20px"
};

const inputStyle = {

  width:"100%",
  padding:"12px",
  marginBottom:"14px",
  borderRadius:"8px",
  border:"1px solid #ccc",
  fontSize:"14px"

};

const buttonStyle = {

  width:"100%",
  padding:"12px",
  background:"#6c7543",
  color:"white",
  border:"none",
  borderRadius:"8px",
  fontWeight:"600",
  cursor:"pointer",
  fontSize:"14px"

};

const errorStyle = {

  background:"#ffdede",
  padding:"10px",
  borderRadius:"6px",
  marginBottom:"14px",
  color:"#b30000",
  fontSize:"14px"

};

const loginTextStyle = {
  marginTop:"15px",
  fontSize:"14px"
};

const linkStyle = {
  color:"#6c7543",
  fontWeight:"600"
};

export default Signup;