import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, ArrowLeft, Loader2, Activity, Fingerprint,
  ShieldAlert, Wifi, CheckCircle, GraduationCap, Briefcase, EyeOff 
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Workspace() {
  const { domain, taskId } = useParams();
  const navigate = useNavigate();
  
  const currentMode = localStorage.getItem("skillev_mode") || "learning";
  
  const [loading, setLoading] = useState(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [containerData, setContainerData] = useState({ id: null, port: null });
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false); 
  
  // --- ANTI-CHEAT STATE ---
  const [keystrokeBuffer, setKeystrokeBuffer] = useState([]);
  const [focusEvents, setFocusEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Refs to prevent closure staleness in listeners
  const modeRef = useRef(currentMode);
  const isCompletedRef = useRef(false);
  const containerIdRef = useRef(null);

  // --- LAYER 1: KEYSTROKE & ANTI-PASTE ENGINE ---
  const recordKeystroke = useCallback((e) => {
    if (isCompletedRef.current) return;
    const timestamp = performance.now();
    setKeystrokeBuffer(prev => [...prev, {
        key: e.key,
        time: timestamp,
        type: e.type
    }]);
  }, []);

  const handlePaste = useCallback((e) => {
    if (modeRef.current === "hiring" && !isCompletedRef.current) {
      e.preventDefault();
      setLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        msg: "SECURITY_ALERT: External payload injection blocked. Manual entry required.", 
        type: "error" 
      }]);
    }
  }, []);

  // --- LAYER 2: TAB-FOCUS MONITORING ---
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !isCompletedRef.current && modeRef.current === "hiring") {
      const event = { time: new Date().toISOString(), type: "blur" };
      setFocusEvents(prev => [...prev, event]);
      setLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        msg: "INTEGRITY_WARNING: User exited terminal focus. Incident logged.", 
        type: "system" 
      }]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", recordKeystroke);
    window.addEventListener("paste", handlePaste, true); 
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("keydown", recordKeystroke);
      window.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [recordKeystroke, handlePaste, handleVisibilityChange]);

  // --- 3. ENVIRONMENT ORCHESTRATION ---
  useEffect(() => {
    let currentContainerId = null;
    modeRef.current = currentMode;

    const startEnvironment = async () => {
      setLoading(true);
      setError("");
      setIsIframeLoaded(false);
      setIsCompleted(false);
      isCompletedRef.current = false;
      setKeystrokeBuffer([]);
      setFocusEvents([]);
      
      setLogs([
        { time: new Date().toLocaleTimeString(), msg: `SYS_INIT: Starting protocol in ${currentMode.toUpperCase()} mode...`, type: "system" },
      ]);

      try {
        const token = localStorage.getItem("skillev_token");
        const res = await fetch(`${API_BASE_URL}/tasks/start/${domain}/${taskId}?mode=${currentMode}`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
        });
        
        const data = await res.json();

        if (res.ok) {
          currentContainerId = data.container_id;
          containerIdRef.current = data.container_id;
          setContainerData({ id: data.container_id, port: data.port });
          setLogs(prev => [...prev, 
            { time: new Date().toLocaleTimeString(), msg: `NODE_ALLOCATED: Port ${data.port} assigned.`, type: "success" },
            { time: new Date().toLocaleTimeString(), msg: `MODE_SET: ${currentMode.toUpperCase()} flags injected.`, type: "system" }
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
        const token = localStorage.getItem("skillev_token");
        fetch(`${API_BASE_URL}/tasks/stop/${currentContainerId}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        }).catch(err => console.error("Cleanup failed:", err));
      }
    };
  }, [domain, taskId, currentMode]);

  // --- 4. SUCCESS POLLING & FORENSIC SYNC ---
  useEffect(() => {
    let poller;
    if (isIframeLoaded && !isCompleted && containerData.id) {
      poller = setInterval(async () => {
        try {
          const token = localStorage.getItem("skillev_token");
          const res = await fetch(`${API_BASE_URL}/users/my-evidence`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const evidenceList = await res.json();
          
          const currentSessionReport = evidenceList.find(
            (report) => report.container_id === containerData.id
          );
          
          // CRITICAL: Ensure we found the CURRENT session report and it is marked completed
          if (currentSessionReport && currentSessionReport.status === "completed") {
            // STOP POLLING IMMEDIATELY
            clearInterval(poller);
            
            // SYNC FORENSIC DATA BEFORE SHOWING COMPLETION
            const syncRes = await fetch(`${API_BASE_URL}/users/sync-typing-profile`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({
                    report_id: currentSessionReport.id,
                    mode: currentMode,
                    keystrokes: keystrokeBuffer,
                    focus_violations: focusEvents 
                })
            });

            if (syncRes.ok) {
                isCompletedRef.current = true;
                setIsCompleted(true);
                setLogs(prev => [...prev, { 
                  time: new Date().toLocaleTimeString(), 
                  msg: "PROTOCOL_BREACH: Forensic audit sealed.", 
                  type: "success" 
                }]);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(poller);
  }, [isIframeLoaded, isCompleted, containerData.id, keystrokeBuffer, focusEvents, currentMode]);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans overflow-hidden flex flex-col relative">
      <AnimatePresence>
        {(!isIframeLoaded || loading) && !error && (
          <motion.div 
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center"
          >
            <Loader2 className="animate-spin text-emerald-500 mb-8" size={64} />
            <h2 className="text-2xl font-black italic tracking-[0.5em] text-white uppercase text-center">
              Initializing_{currentMode}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCompleted && (
          <motion.div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div className="bg-[#080808] border border-emerald-500/30 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
              <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black italic uppercase text-white mb-2">Protocol_Breached</h2>
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                  <Fingerprint size={14} /> Identity_Verified
                </div>
                {focusEvents.length > 0 && (
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-500">
                    <ShieldAlert size={14} /> {focusEvents.length}_Focus_Violations_Logged
                  </div>
                )}
              </div>
              <button onClick={() => navigate(`/dashboard`)} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-2xl">Return to Console</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-white/40 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Abort_Mission
          </button>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-[10px]">SK</div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/80">
               Sector: <span className="text-emerald-500">{domain}</span> / {taskId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
            currentMode === 'learning' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {currentMode === 'learning' ? <GraduationCap size={12}/> : <Briefcase size={12}/>}
            {currentMode.toUpperCase()}_MODE
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-white/10 p-6 bg-[#050505] overflow-y-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
            <ShieldAlert size={14} /> Mission_Brief
          </h3>
          <p className="text-xs text-white/50 leading-relaxed font-medium mb-8">
            Objective: Identifying entry points. Use <span className="text-white font-bold">SQL Injection</span> to bypass auth.
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
          {focusEvents.length > 0 && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
               <div className="flex items-center gap-2 text-red-400 mb-2">
                  <EyeOff size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Focus_Lost</span>
               </div>
               <p className="text-[10px] text-white/40 italic leading-relaxed">
                  Multiple tab switches detected. This session has been flagged for audit.
               </p>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-black relative flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: isIframeLoaded ? 1 : 0 }} className="w-full h-full rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#080808]">
            <iframe 
              src={`http://127.0.0.1:${containerData.port}?mode=${currentMode}`} 
              onLoad={() => { setIsIframeLoaded(true); setLoading(false); }}
              className="w-full h-full border-none"
              title="Skillev Lab Interface"
            />
          </motion.div>
        </section>

        <aside className="w-80 border-l border-white/10 bg-[#050505] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
              <Terminal size={14} /> Evidence_Log
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-3 bg-black/20 text-white/40">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                <span className={`${log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-400" : "text-white/40"}`}>
                  <span className="text-white/10 mr-1">$</span>{log.msg}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}