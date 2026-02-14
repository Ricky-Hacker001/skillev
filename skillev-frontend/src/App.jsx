import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard"; 
import Workspace from "./pages/Workspace";
import FlexboxLab from './pages/labs/FlexboxLab'; // Import your lab

/**
 * PROTECTED ROUTE MIDDLEWARE
 * Checks if a token exists. If not, kicks user to /login.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("skillev_token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="selection:bg-emerald-500/30">
        <Routes>
          
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* --- PROTECTED ROUTES --- */}
          
          {/* 1. Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* 2. Specific Labs (Define these BEFORE the generic workspace) */}
          <Route 
            path="/workspace/fullstack/flexbox-lab" 
            element={
              <ProtectedRoute>
                <FlexboxLab />
              </ProtectedRoute>
            } 
          />

          {/* 3. Generic Workspace (Captures all other tasks) */}
          {/* This handles: /workspace/cybersecurity/sql-injection, etc. */}
          <Route 
            path="/workspace/:domain/:taskId" 
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } 
          />

          {/* --- CATCH-ALL --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;