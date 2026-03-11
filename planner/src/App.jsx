import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Goals from "./pages/goals/Goals";
import Chatbot from "./pages/chatbot/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Home Page */}
        <Route path="/" element={<Chatbot />} />

        {/* Chatbot Page */}
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Goals Page */}
        <Route path="/goals" element={<Goals />} />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;