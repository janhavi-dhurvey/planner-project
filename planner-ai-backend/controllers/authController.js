import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================================
   GENERATE JWT TOKEN
========================================= */

const generateToken = (userId) => {

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

};


/* =========================================
   SIGNUP
========================================= */

export const signup = async (req, res) => {

  try {

    let { name, email, password } = req.body;

    /* VALIDATION */

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    /* CHECK EXISTING USER */

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "User already exists"
      });
    }

    /* HASH PASSWORD */

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* CREATE USER */

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    /* GENERATE TOKEN */

    const token = generateToken(user._id);

    /* RESPONSE */

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.error("🔥 Signup error:", error);

    return res.status(500).json({
      error: "Signup failed"
    });

  }

};


/* =========================================
   LOGIN
========================================= */

export const login = async (req, res) => {

  try {

    let { email, password } = req.body;

    /* VALIDATION */

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    email = email.trim().toLowerCase();

    /* FIND USER WITH PASSWORD */

    const user = await User
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    /* CHECK PASSWORD */

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    /* GENERATE TOKEN */

    const token = generateToken(user._id);

    /* RESPONSE */

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.error("🔥 Login error:", error);

    return res.status(500).json({
      error: "Login failed"
    });

  }

};