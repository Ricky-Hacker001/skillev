import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import EvidenceReport from "./pages/EvidenceReport"; // <--- New Import

/**
 * PROTECTED ROUTE MIDDLEWARE
 * Only allows authenticated users to access Dashboard and Workspace.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("skillev_token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      {/* Selection color set to emerald to match Skillev branding 
      */}
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
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

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