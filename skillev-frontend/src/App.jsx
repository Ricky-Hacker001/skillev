import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard"; // <--- Updated Import
import Workspace from "./pages/Workspace";

/**
 * PROTECTED ROUTE MIDDLEWARE
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
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* Protected Dashboard Route */}
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

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;