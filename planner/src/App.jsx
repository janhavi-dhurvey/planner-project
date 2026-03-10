import { BrowserRouter, Routes, Route } from "react-router-dom";
import Goals from "./pages/goals/Goals";
import Chatbot from "./pages/chatbot/Chatbot"; // We'll create this next

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Goals />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/chatbot" element={<Chatbot />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;