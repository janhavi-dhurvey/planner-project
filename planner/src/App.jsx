import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* =========================================
LAZY LOAD PAGES
========================================= */

const Home = lazy(() => import("./pages/home/Home"));
const Chatbot = lazy(() => import("./pages/chatbot/Chatbot"));
const Goals = lazy(() => import("./pages/goals/Goals"));
const Calendar = lazy(() => import("./pages/calendar/Calendar"));

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));

/* =========================================
AUTH CHECK
========================================= */

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/* =========================================
PROTECTED ROUTE
========================================= */

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

/* =========================================
PUBLIC ROUTE
========================================= */

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/chatbot" replace />;
};

/* =========================================
LOADING SCREEN
========================================= */

const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "600",
    }}
  >
    Loading...
  </div>
);

/* =========================================
APP
========================================= */

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>

        {/* ✅ FIXED: removed overflow hidden */}
        <div style={{ height: "100vh" }}>

          <Routes>

            {/* PUBLIC ROUTES */}
            <Route
              path="/login"
              element={<PublicRoute><Login /></PublicRoute>}
            />

            <Route
              path="/signup"
              element={<PublicRoute><Signup /></PublicRoute>}
            />

            {/* PROTECTED ROUTES */}

            <Route
              path="/"
              element={<ProtectedRoute><Home /></ProtectedRoute>}
            />

            <Route
              path="/chatbot"
              element={<ProtectedRoute><Chatbot /></ProtectedRoute>}
            />

            <Route
              path="/goals"
              element={<ProtectedRoute><Goals /></ProtectedRoute>}
            />

            <Route
              path="/calendar"
              element={<ProtectedRoute><Calendar /></ProtectedRoute>}
            />

            {/* DEFAULT */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

        </div>

      </Suspense>
    </BrowserRouter>
  );
}

export default App;