import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Code, ArrowRight, ArrowLeft, LogOut, User, CheckCircle, Activity, GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const transition = { duration: 0.5, ease: "easeInOut" };
const API_BASE_URL = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [selectedDomain, setSelectedDomain] = useState(null); 
  const [userEmail, setUserEmail] = useState("Operator_Unknown");
  const [evidenceList, setEvidenceList] = useState([]); 
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(true);
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
      title: "Cyber Security",
      icon: <Shield className="text-emerald-400" size={28} />,
      desc: "Protect critical systems. Master vulnerability research and defensive protocols.",
      tasks: [
        { id: "sql-injection", title: "SQL Injection", level: "Beginner", time: "20m" },
        { id: "broken-auth", title: "Broken Authentication", level: "Intermediate", time: "30m" },
        { id: "idor", title: "IDOR Bypass", level: "Advanced", time: "45m" },
        { id: "input-validation", title: "Validation Bypass", level: "Beginner", time: "15m" },
        { id: "secure-fix", title: "Secure Fix Verification", level: "Intermediate", time: "20m" }
      ]
    },
    {
      id: "fullstack",
      title: "Full Stack Dev",
      icon: <Code className="text-emerald-400" size={28} />,
      desc: "Build the future. Architecting scalable systems and secure backend middleware.",
      tasks: [
        { id: "api-design", title: "REST API Architecture", level: "Beginner", time: "30m" }, 
        { id: "fullstack-link", title: "API Integration Link", level: "Intermediate", time: "25m" },
        { id: "task-manager", title: "Task Manager Dashboard", level: "Intermediate", time: "60m" },
        { id: "task-management-api", title: "Task Management API", level: "Intermediate", time: "30m" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 selection:text-white antialiased">
      
      {/* IMPROVED NAVIGATION */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center font-bold text-black text-[10px]">SK</div>
            <span className="text-xs font-bold tracking-widest uppercase opacity-90">Skill_Grid</span>
          </div>

          {/* CENTRAL MODE TOGGLE */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg">
            <button 
              onClick={() => setMode("learning")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                mode === "learning" ? "bg-emerald-500 text-black shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <GraduationCap size={14} /> Learning
            </button>
            <button 
              onClick={() => setMode("hiring")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all ${
                mode === "hiring" ? "bg-red-600 text-white shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <Briefcase size={14} /> Hiring
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/10">
                <User size={12} className="text-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-100/70">{userEmail}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedDomain ? (
            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={transition}>
              
              <div className="mb-12">
                <span className="text-emerald-500 text-[11px] font-bold tracking-[0.3em] uppercase mb-2 block">System Dashboard</span>
                <h1 className="text-5xl font-black tracking-tight text-white mb-4">Choose Your <span className="text-emerald-500 italic">Sector</span></h1>
                <p className="text-white/60 max-w-xl text-base">Select a specialized domain to begin your training or demonstrate your skills for hiring.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-20">
                {domains.map((domain) => (
                  <button key={domain.id} onClick={() => setSelectedDomain(domain)} className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 text-left transition-all hover:border-emerald-500/50 hover:bg-[#0d0d0d] hover:translate-y-[-2px] shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-6">{domain.icon}</div>
                      <ChevronRight className="text-white/20 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{domain.title}</h3>
                    <p className="text-white/50 text-sm mb-8 leading-relaxed line-clamp-2">{domain.desc}</p>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-500 group-hover:gap-4 transition-all">
                      Access Database <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              {/* RECENT EVIDENCE - Simplified List */}
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Recent Activity Log</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                
                <div className="grid gap-3 max-w-4xl">
                  {isLoadingEvidence ? (
                    <div className="p-6 border border-white/5 rounded-xl flex items-center gap-4 text-white/30 animate-pulse font-mono text-xs uppercase tracking-widest">
                      <Activity size={16} className="animate-spin" /> Fetching secure records...
                    </div>
                  ) : evidenceList.length > 0 ? (
                    evidenceList.map((report) => (
                      <div key={report.id} className="group bg-[#080808] border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            report.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {report.status === 'completed' ? <CheckCircle size={16} /> : <Activity size={16} />}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-white/90 uppercase">{report.task_id.replace("-", " ")}</h4>
                            <span className="text-[10px] font-mono text-white/40">{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/evidence/${report.task_id}`)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all">
                          Review
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center text-white/30 font-mono text-xs uppercase">
                      No evidence records found in this node.
                    </div>
                  )}
                </div>
              </motion.section>

            </motion.div>
          ) : (
            <motion.div key="tasks" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              <button onClick={() => setSelectedDomain(null)} className="group flex items-center gap-2 text-white/50 hover:text-emerald-400 transition-colors text-[11px] font-bold uppercase tracking-widest mb-10">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sectors
              </button>

              <div className="mb-12">
                <div className="inline-flex px-3 py-1 rounded-md border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {selectedDomain.id} / <span className={mode === 'learning' ? 'text-emerald-400' : 'text-red-500'}>{mode}</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white uppercase italic">{selectedDomain.title}</h1>
              </div>

              <div className="grid gap-3 max-w-5xl">
                {selectedDomain.tasks.map((task) => (
                  <div key={task.id} className="group bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center transition-all hover:border-emerald-500/30 hover:bg-[#0d0d0d]">
                    <div className="flex items-center gap-6 w-full">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-mono text-[10px] text-white/40 border border-white/5">
                        {task.id.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{task.title}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] font-bold text-emerald-500/70 uppercase">Difficulty: {task.level}</span>
                          <span className="text-[10px] font-bold text-white/30 uppercase">Time: {task.time}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/workspace/${selectedDomain.id}/${task.id}`)} 
                      className={`mt-4 sm:mt-0 w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${
                        mode === 'learning' 
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                          : 'bg-red-600 text-white hover:bg-red-500'
                      }`}
                    >
                      {mode === 'learning' ? 'Start Session' : 'Begin Challenge'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER STATUS */}
      <div className="fixed bottom-0 w-full border-t border-white/5 bg-black/80 backdrop-blur-md p-3 flex justify-between items-center px-8 z-[100]">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'learning' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
            {mode} Mode Active // Local_Host
          </span>
        </div>
        <div className="hidden sm:block text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">SkillGrid Encryption Active</div>
      </div>
    </div>
  );
}