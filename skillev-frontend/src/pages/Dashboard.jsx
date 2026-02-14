import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Code, ArrowRight, ArrowLeft, LogOut, User, CheckCircle, ExternalLink, Clock, Activity, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };
const API_BASE_URL = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [selectedDomain, setSelectedDomain] = useState(null); 
  const [userEmail, setUserEmail] = useState("Operator_Unknown");
  const [evidenceList, setEvidenceList] = useState([]); 
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(true);
  
  // --- NEW: MODE TOGGLE STATE ---
  // Default to 'learning' if not set
  const [mode, setMode] = useState(localStorage.getItem("skillev_mode") || "learning");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("skillev_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.sub || "Active_Operator");
        fetchMyEvidence(token);
      } catch (error) {
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, []);

  // Update localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem("skillev_mode", mode);
  }, [mode]);

  const fetchMyEvidence = async (token) => {
    setIsLoadingEvidence(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/my-evidence`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEvidenceList(data);
    } catch (err) {
      console.error("Sync error.");
    } finally {
      setIsLoadingEvidence(false);
    }
  };

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
        { id: "api-design", title: "REST API Architecture", level: "Beginner", time: "30m" },
        { id: "db-optimization", title: "Query Optimization", level: "Advanced", time: "40m" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/40 backdrop-blur-2xl px-10">
        <div className="max-w-7xl mx-auto h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-[10px]">SK</div>
            <span className="text-xs font-black tracking-[0.5em] uppercase text-white/90">Console</span>
          </div>

          {/* --- MODE TOGGLE UI --- */}
          <div className="hidden md:flex items-center gap-1 bg-[#0f0f0f] border border-white/10 p-1 rounded-xl">
            <button 
              onClick={() => setMode("learning")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "learning" ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white/40 hover:text-white"
              }`}
            >
              <GraduationCap size={14} /> Learning
            </button>
            <button 
              onClick={() => setMode("hiring")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "hiring" ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "text-white/40 hover:text-white"
              }`}
            >
              <Briefcase size={14} /> Hiring
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <User size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono lowercase tracking-wider text-emerald-400/80">
                  {userEmail}
                </span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={14} /> Terminate
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-40 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedDomain ? (
            <motion.div key="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={transition}>
              
              <div className="mb-20">
                <div className="inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase mb-6">
                  Select_Sector
                </div>
                <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-tight">The_Grid.</h1>
                
                {/* Mobile Toggle (Visible only on small screens) */}
                <div className="md:hidden flex mt-8 gap-2">
                    <button onClick={() => setMode("learning")} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border ${mode === 'learning' ? 'bg-emerald-500 text-black border-emerald-500' : 'border-white/10 text-white/40'}`}>Learning</button>
                    <button onClick={() => setMode("hiring")} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border ${mode === 'hiring' ? 'bg-red-500 text-white border-red-500' : 'border-white/10 text-white/40'}`}>Hiring</button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-32">
                {domains.map((domain) => (
                  <button key={domain.id} onClick={() => setSelectedDomain(domain)} className="group relative bg-[#080808] border border-white/10 rounded-[2.5rem] p-12 text-left transition-all hover:border-emerald-500/40">
                    <div className="relative z-10">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-8 border border-emerald-500/20">{domain.icon}</div>
                      <h3 className="text-3xl font-black italic uppercase mb-4 text-white">{domain.title}</h3>
                      <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xs">{domain.desc}</p>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        Enter Sector <ArrowRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* RECENT EVIDENCE */}
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/50 mb-10 flex items-center gap-4">
                  <div className="h-px w-12 bg-emerald-500/20" /> Captured_Signals
                </h2>
                
                <div className="grid gap-4 max-w-3xl">
                  {isLoadingEvidence ? (
                    <div className="p-8 border border-white/5 rounded-2xl flex items-center gap-4 text-white/20 animate-pulse font-mono text-[10px]">
                      <Activity size={18} /> SYNCING_RECORDS...
                    </div>
                  ) : evidenceList.length > 0 ? (
                    evidenceList.map((report) => (
                      <div key={report.id} className="group bg-[#080808] border border-white/10 rounded-2xl p-6 flex justify-between items-center hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {report.status === 'completed' ? <CheckCircle size={18} /> : <Activity size={18} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{report.task_id.replace("-", " ")}</h4>
                            <div className="flex gap-4 mt-1">
                              <span className="text-[9px] font-mono text-white/20 uppercase italic">
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/evidence/${report.task_id}`)} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white hover:text-black transition-all">
                          Inspect
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-white/20 font-mono text-[10px]">
                      ZERO_EVIDENCE_FOUND
                    </div>
                  )}
                </div>
              </motion.section>

            </motion.div>
          ) : (
            <motion.div key="tasks" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={transition}>
              <button onClick={() => setSelectedDomain(null)} className="flex items-center gap-2 text-white/40 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                <ArrowLeft size={14} /> Exit Sector
              </button>

              <div className="mb-16">
                <div className="inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase mb-6">
                  {selectedDomain.id} // <span className={mode === 'learning' ? 'text-emerald-400' : 'text-red-400'}>{mode.toUpperCase()}</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter italic uppercase text-white leading-none">{selectedDomain.title}</h1>
              </div>

              <div className="grid gap-4">
                {selectedDomain.tasks.map((task) => (
                  <div key={task.id} className="group bg-[#080808] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center transition-all hover:border-white/20">
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
                    {/* The mode is automatically used because it's stored in localStorage */}
                    <button onClick={() => navigate(`/workspace/${selectedDomain.id}/${task.id}`)} className={`mt-6 md:mt-0 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors ${
                        mode === 'learning' ? 'bg-white text-black hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'
                    }`}>
                      {mode === 'learning' ? 'Start_Learning' : 'Begin_Challenge'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* STATUS BAR */}
      <div className="fixed bottom-0 w-full border-t border-white/10 bg-black/60 backdrop-blur-xl p-4 flex justify-between items-center px-10 z-[100]">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'learning' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest italic">
            Protocol: {mode.toUpperCase()} // Node_01
          </span>
        </div>
        <div className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">SECURE_GRID_ACTIVE</div>
      </div>
    </div>
  );
}