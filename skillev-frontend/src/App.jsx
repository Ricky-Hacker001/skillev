import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth"; // Import the new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        {/* Placeholder for the dashboard */}
        <Route path="/dashboard" element={<div className="bg-[#030303] min-h-screen text-white p-20">Dashboard Under Construction</div>} />
      </Routes>
    </Router>
  );
}

export default App;