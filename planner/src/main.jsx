import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/* =========================================
ERROR BOUNDARY (PREVENT BLANK SCREEN)
========================================= */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("React App Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            fontFamily: "sans-serif",
          }}
        >
          <h2>⚠️ Something went wrong</h2>
          <p>Check console (F12) for details</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =========================================
ROOT ELEMENT
========================================= */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

/* =========================================
CREATE ROOT
========================================= */

const root = ReactDOM.createRoot(rootElement);

/* =========================================
RENDER APPLICATION
========================================= */

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);