import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

/* =========================================
   VALIDATION MIDDLEWARE
========================================= */

const validateSignup = (req, res, next) => {

  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email and password are required"
    });
  }

  name = name.trim();
  email = email.trim().toLowerCase();

  if (name.length < 2) {
    return res.status(400).json({
      error: "Name must be at least 2 characters"
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Invalid email address"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters"
    });
  }

  next();
};

const validateLogin = (req, res, next) => {

  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required"
    });
  }

  email = email.trim().toLowerCase();

  if (!email.includes("@")) {
    return res.status(400).json({
      error: "Invalid email address"
    });
  }

  next();
};

/* =========================================
   AUTH ROUTES
========================================= */

/* SIGNUP */
router.post(
  "/signup",
  validateSignup,
  signup
);

/* LOGIN */
router.post(
  "/login",
  validateLogin,
  login
);

/* =========================================
   EXPORT ROUTER
========================================= */

export default router;