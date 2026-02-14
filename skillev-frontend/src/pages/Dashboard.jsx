import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Code, ArrowRight, ArrowLeft, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };

export default function Dashboard() {
  const [selectedDomain, setSelectedDomain] = useState(null); 
  const [userEmail, setUserEmail] = useState("Operator_Unknown");
  const navigate = useNavigate();

  // --- EXTRACT USER EMAIL FROM JWT ---
  useEffect(() => {
    const token = localStorage.getItem("skillev_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // FastAPI typically stores the email/username in 'sub'
        setUserEmail(decoded.sub || "Active_Operator");
      } catch (error) {
        console.error("Session integrity check failed.");
        setUserEmail("Guest_Node");
      }
    }
  }, []);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem("skillev_token"); 
    navigate("/login"); 
  };

  const domains = [
    {
      id: "cybersecurity",
      title: "Cyber_Security",
      icon: <Shield className="text-emerald-500" size={32} />,
      desc: "Vulnerability research and defensive security protocols.",
      tasks: [
        { id: "sql-injection", title: "SQL Injection", level: "Beginner", time: "20m" },
        { id: "broken-auth", title: "Broken Authentication", level: "Intermediate", time: "30m" },
        { id: "idor", title: "IDOR Bypass", level: "Advanced", time: "45m" }
      ]
    },
    {
      id: "fullstack",
      title: "Full_Stack_Dev",
      icon: <Code className="text-emerald-500" size={32} />,
      desc: "Architecting scalable systems and secure middleware.",
      tasks: [
        // 👇 NEW LAB ADDED HERE
        { id: "flexbox-lab", title: "CSS Flexbox Repair", level: "Beginner", time: "15m" }, 
        
        { id: "api-design", title: "REST API Architecture", level: "Beginner", time: "30m" },
        { id: "db-optimization", title: "Query Optimization", level: "Advanced", time: "40m" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/40 backdrop-blur-2xl px-10">
        <div className="max-w-7xl mx-auto h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-[10px]">SK</div>
            <span className="text-xs font-black tracking-[0.5em] uppercase text-white/90">Console</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <User size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono lowercase tracking-wider text-emerald-400/80">
                  {userEmail}
                </span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut size={14} /> Terminate_Session
            </button>
          </div>
        </div>
      </nav>

      {/* BACKGROUND ORBS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto px-8 py-40 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedDomain ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={transition}
            >
              <div className="mb-20">
                <div className="inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase mb-6">
                  Select_Domain
                </div>
                <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white">The_Grid.</h1>
                <p className="text-white/50 font-mono text-xs mt-4 uppercase tracking-widest leading-relaxed">Select a specialized sector to begin evidence capture.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {domains.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain)}
                    className="group relative bg-[#080808] border border-white/10 rounded-[2.5rem] p-12 text-left transition-all hover:border-emerald-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-8 border border-emerald-500/20">
                        {domain.icon}
                      </div>
                      <h3 className="text-3xl font-black italic uppercase mb-4 text-white">{domain.title}</h3>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xs">{domain.desc}</p>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        Enter Room <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={transition}
            >
              <button
                onClick={() => setSelectedDomain(null)}
                className="flex items-center gap-2 text-white/40 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-12"
              >
                <ArrowLeft size={14} /> Back to Grid
              </button>

              <div className="mb-16">
                <div className="inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase mb-6">
                  {selectedDomain.id}
                </div>
                <h1 className="text-6xl font-black tracking-tighter italic uppercase text-white">{selectedDomain.title}</h1>
              </div>

              <div className="grid gap-4">
                {selectedDomain.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-[#080808] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center transition-all hover:border-white/20"
                  >
                    <div className="flex items-center gap-8 w-full">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-mono text-xs text-white/20">
                        ID_{task.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1 text-white">{task.title}</h4>
                        <div className="flex gap-4">
                          <span className="text-[10px] font-mono text-emerald-500/60 uppercase">Complexity: {task.level}</span>
                          <span className="text-[10px] font-mono text-white/20 uppercase">Limit: {task.time}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/workspace/${selectedDomain.id}/${task.id}`)}
                      className="mt-6 md:mt-0 px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-colors"
                    >
                      Start_Execution
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SESSION STATUS BAR */}
      <div className="fixed bottom-0 w-full border-t border-white/10 bg-black/60 backdrop-blur-xl p-4 flex justify-between items-center px-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest italic leading-relaxed">User_Session: Active // Node_01</span>
        </div>
        <div className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em] leading-relaxed">
          AES-256 Enabled
        </div>
      </div>
    </div>
  );
}