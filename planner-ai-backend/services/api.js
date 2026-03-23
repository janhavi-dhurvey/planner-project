import axios from "axios";

/* =========================================
   CONFIG
========================================= */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* 🔥 DEBUG MODE (turn off in production) */
const DEBUG = true;

/* =========================================
   CREATE AXIOS INSTANCE
========================================= */

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================================
   REQUEST INTERCEPTOR
========================================= */

API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /* 🔥 DEBUG LOG */
    if (DEBUG) {
      console.log(
        "🚀 API REQUEST:",
        config.method?.toUpperCase(),
        `${config.baseURL}${config.url}`
      );
    }

    return config;

  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

API.interceptors.response.use(
  (response) => {

    if (DEBUG) {
      console.log("✅ API RESPONSE:", response.data);
    }

    return response;
  },

  (error) => {

    if (!error.response) {
      console.error("🌐 Network error:", error.message);

      alert("⚠️ Cannot connect to server. Make sure backend is running.");

      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response.data?.error ||
      error.response.data?.message ||
      "Something went wrong";

    console.error("❌ API ERROR:", message);

    /* 🔐 AUTH ERROR */
    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }

    /* 🚫 SERVER ERROR */
    if (status === 500) {
      alert("⚠️ Server error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default API;