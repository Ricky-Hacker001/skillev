import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import EvidenceReport from "./pages/EvidenceReport"; 
import FlexboxLab from './pages/labs/FlexboxLab';

/**
 * PROTECTED ROUTE MIDDLEWARE
 * Checks if a token exists. If not, redirects user to /login.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("skillev_token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      {/* Selection color set to emerald to match Skillev branding */}
      <div className="selection:bg-emerald-500/30">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* RECRUITER ACCESS: This route is public. 
              Recruiters can view proof via a shared link without an account.
          */}
          <Route path="/evidence/:taskId" element={<EvidenceReport />} />

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

          {/* 2. Specific Labs (Defined BEFORE the generic workspace) */}
          <Route 
            path="/workspace/fullstack/flexbox-lab" 
            element={
              <ProtectedRoute>
                <FlexboxLab />
              </ProtectedRoute>
            } 
          />

          {/* 3. Generic Workspace (Captures all other tasks) */}
          {/* Example: /workspace/cybersecurity/sql-injection */}
          <Route 
            path="/workspace/:domain/:taskId" 
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } 
          />

          {/* --- FALLBACKS --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;