import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ArrowLeft, Loader2, Activity, ShieldAlert, Wifi, Code, ChevronRight } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Workspace() {
  const { domain, taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true); // Tracking API request
  const [isIframeLoaded, setIsIframeLoaded] = useState(false); // Tracking Lab render
  const [containerData, setContainerData] = useState({ id: null, port: null });
  const [error, setError] = useState("");
  
  // LIVE LOGS SIMULATION (Connect to WebSocket later for real data)
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "SYS_INIT: Requesting isolated sandbox...", type: "system" },
  ]);

  useEffect(() => {
    let currentContainerId = null;

    const startEnvironment = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("skillev_token");
        const res = await fetch(`${API_BASE_URL}/tasks/start/${domain}/${taskId}?user_id=1`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
        });
        
        const data = await res.json();

        if (res.ok) {
          currentContainerId = data.container_id;
          setContainerData({ id: data.container_id, port: data.port });
          
          setLogs(prev => [...prev, 
            { time: new Date().toLocaleTimeString(), msg: `NODE_ALLOCATED: Port ${data.port} assigned.`, type: "success" },
            { time: new Date().toLocaleTimeString(), msg: "NET_BRIDGE: Establishing 127.0.0.1 link...", type: "system" }
          ]);
        } else {
          setError(data.detail || "Node Allocation Failed");
          setLoading(false);
        }
      } catch (err) {
        setError("Protocol Error: Backend Unreachable");
        setLoading(false);
      }
    };

    startEnvironment();

    return () => {
      if (currentContainerId) {
        fetch(`${API_BASE_URL}/tasks/stop/${currentContainerId}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("skillev_token")}` }
        }).catch(err => console.error("Cleanup failed:", err));
      }
    };
  }, [domain, taskId]);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* 🚀 DYNAMIC LOADER OVERLAY */}
      <AnimatePresence>
        {(!isIframeLoaded || loading) && !error && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center"
          >
            <div className="relative mb-8">
                <Loader2 className="animate-spin text-emerald-500" size={64} />
                <div className="absolute inset-0 blur-3xl bg-emerald-500/20 animate-pulse" />
            </div>
            <motion.h2 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xl font-black italic tracking-[0.5em] text-white uppercase text-center"
            >
              Initializing_Sandbox
            </motion.h2>
            <p className="text-[10px] text-white/30 mt-6 font-mono uppercase tracking-[0.3em] text-center">
                Allocating Node // Mapping Port {containerData.port || "TBD"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="group flex items-center gap-2 text-white/40 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Abort_Mission
          </button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.3)]">SK</div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/80">
              Sector: <span className="text-emerald-500">{domain}</span> / {taskId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isIframeLoaded && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
              <Activity size={10} className="animate-pulse" /> Live_Evidence_Capture
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT: BRIEFING */}
        <aside className="w-72 border-r border-white/10 p-6 overflow-y-auto hidden lg:block bg-[#050505]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
            <ShieldAlert size={14} /> Mission_Brief
          </h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium mb-8">
            Objective: Identify the entry point in the target login form. 
            Use <span className="text-white font-bold">SQL Injection</span> to bypass authentication.
          </p>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-mono text-white/30 uppercase block mb-2">Target_Access</span>
            <div className="flex items-center gap-2">
              <Wifi size={12} className="text-emerald-500" />
              <code className="text-[11px] text-emerald-400 font-mono">
                {isIframeLoaded ? `127.0.0.1:${containerData.port}` : "Establishing..."}
              </code>
            </div>
          </div>
        </aside>

        {/* CENTER: THE LAB */}
        <section className="flex-1 bg-black relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d2d1f_0%,transparent_100%)] opacity-20 pointer-events-none" />
          
          {error ? (
            <div className="text-center max-w-md">
              <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
              <h2 className="text-xl font-black uppercase text-white mb-2">Node_Allocation_Error</h2>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 mt-4 transition-all">Retry_Sequence</button>
            </div>
          ) : (
            containerData.port && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: isIframeLoaded ? 1 : 0 }} 
                className="w-full h-full rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#080808]"
              >
                <iframe 
                  src={`http://127.0.0.1:${containerData.port}`} 
                  onLoad={() => {
                    setIsIframeLoaded(true);
                    setLoading(false);
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "HANDSHAKE: Sandbox connection established.", type: "success" }]);
                  }}
                  className="w-full h-full border-none"
                  title="Skillev Lab Interface"
                />
              </motion.div>
            )
          )}
        </section>

        {/* RIGHT: EVIDENCE LOG */}
        <aside className="w-80 border-l border-white/10 bg-[#050505] flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
              <Terminal size={14} /> Evidence_Log
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-3 bg-black/20">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                <span className={`${log.type === "success" ? "text-emerald-400" : "text-white/40"}`}>
                  <span className="text-white/10 mr-1">$</span>{log.msg}
                </span>
              </div>
            ))}
            {isIframeLoaded && (
               <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-emerald-500/50 italic flex items-center gap-2">
                 <ChevronRight size={12} /> listening_for_traffic...
               </motion.div>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}