import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

/**
 * PROTECTED ROUTE MIDDLEWARE
 * Checks if a 'skillev_token' exists in local storage.
 * If not, it forces a redirect to the login identity verification page.
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
          
          {/* Both /login and /register use the same Auth component.
              The component internally handles state switching.
          */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* Protected Dashboard Route
              Prevents access unless the user has successfully logged in via the API.
          */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="bg-[#030303] min-h-screen text-white p-20 font-sans selection:bg-emerald-500/30">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-10 inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase">
                      Console_Active
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter italic mb-6">
                      WELCOME_TO_THE_<span className="text-emerald-500">GRID.</span>
                    </h1>
                    <p className="text-white/60 font-mono text-sm uppercase tracking-widest leading-relaxed">
                      Your session is authenticated. Dashboard modules are currently initializing.
                    </p>
                    
                    <button 
                      onClick={() => {
                        localStorage.removeItem("skillev_token");
                        window.location.href = "/login";
                      }}
                      className="mt-20 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 transition-colors"
                    >
                      Terminating Session (Logout)
                    </button>
                  </div>
                </div>
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