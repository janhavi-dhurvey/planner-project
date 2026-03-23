import axios from "axios";

/* =========================================
   CREATE AXIOS INSTANCE
========================================= */

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================================
   ATTACH JWT TOKEN TO REQUESTS
========================================= */

API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================
   HANDLE RESPONSE ERRORS
========================================= */

API.interceptors.response.use(

  (response) => response,

  (error) => {

    console.error("API Error:", error);

    if (error.response) {

      /* Unauthorized → logout */

      if (error.response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }

      /* Server error */

      if (error.response.status >= 500) {
        console.error("Server error:", error.response.data);
      }

    } else {

      console.error("Network error: Backend not reachable");

    }

    return Promise.reject(error);

  }

);

export default API;