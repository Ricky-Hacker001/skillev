import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, ArrowLeft, Loader2, Activity, Fingerprint,
  ShieldAlert, Wifi, CheckCircle, GraduationCap, Briefcase, 
  EyeOff, Info, Clock, AlertTriangle, Camera, Target
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Workspace() {
  const { domain, taskId } = useParams();
  const navigate = useNavigate();
  
  const currentMode = localStorage.getItem("skillev_mode") || "learning";
  
  const [loading, setLoading] = useState(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [containerData, setContainerData] = useState({ id: null, port: null });
  const [activeReportId, setActiveReportId] = useState(null);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false); 
  
  const [keystrokeBuffer, setKeystrokeBuffer] = useState([]);
  const [focusEvents, setFocusEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const modeRef = useRef(currentMode);
  const isCompletedRef = useRef(false);
  const containerIdRef = useRef(null);

  // --- DYNAMIC CONTENT ENGINE ---
  const getTaskMetadata = () => {
    const registry = {
      "sql-injection": {
        title: "SQL Injection",
        objective: "Utilize payload injection techniques to bypass the database authentication layer and retrieve administrative credentials.",
        requirement: "SQL Syntax Knowledge",
        iconColor: "text-emerald-400"
      },
      "broken-auth": {
        title: "Broken Authentication",
        objective: "Identify flaws in session token generation. Manipulate browser cookies to escalate privileges from 'guest' to 'admin'.",
        requirement: "Session/Cookie Mastery",
        iconColor: "text-red-400"
      },
      "idor": {
        title: "Insecure Direct Object Reference",
        objective: "Manipulate resource identifiers in URL parameters to access unauthorized user data nodes.",
        requirement: "Parameter Tampering",
        iconColor: "text-amber-400"
      }
    };
    return registry[taskId] || { 
      title: taskId.replace(/-/g, ' '), 
      objective: "Complete the forensic laboratory task.", 
      requirement: "General Cybersecurity",
      iconColor: "text-emerald-400"
    };
  };

  const meta = getTaskMetadata();

  // --- VISUAL SURVEILLANCE ENGINE ---
  const captureVisualEvidence = async (type) => {
    if (modeRef.current !== "hiring" || isCompletedRef.current || !activeReportId) return;

    setLogs(prev => [...prev, { 
      time: new Date().toLocaleTimeString(), 
      msg: `SYSCALL: Initiating ${type} integrity capture...`, 
      type: "system" 
    }]);

    try {
      let stream;
      if (type === "webcam") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      }

      const video = document.createElement("video");
      video.srcObject = stream;
      await new Promise((resolve) => (video.onloadedmetadata = resolve));
      video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      setTimeout(async () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.6);
        stream.getTracks().forEach(track => track.stop());

        const token = localStorage.getItem("skillev_token");
        await fetch(`${API_BASE_URL}/evidence/upload-visual`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ report_id: activeReportId, type: type, image: base64Image })
        });

        setLogs(prev => [...prev, { 
          time: new Date().toLocaleTimeString(), 
          msg: `SUCCESS: ${type.toUpperCase()} frame hashed and sealed.`, 
          type: "success" 
        }]);
      }, 500);
    } catch (err) {
      setLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        msg: `CRITICAL: Visual capture denied or failed.`, 
        type: "error" 
      }]);
    }
  };

  // --- INPUT HANDLERS ---
  const recordKeystroke = useCallback((e) => {
    if (isCompletedRef.current) return;
    setKeystrokeBuffer(prev => [...prev, { key: e.key, time: performance.now(), type: e.type }]);
  }, []);

  const handlePaste = useCallback((e) => {
    if (modeRef.current === "hiring" && !isCompletedRef.current) {
      e.preventDefault();
      setLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        msg: "BLOCK: External payload injection denied.", 
        type: "error" 
      }]);
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !isCompletedRef.current && modeRef.current === "hiring") {
      setFocusEvents(prev => [...prev, { time: new Date().toISOString(), type: "blur" }]);
      setLogs(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        msg: "WARNING: Focus lost. Integrity check logged.", 
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

  // --- LIFECYCLE ---
  useEffect(() => {
    let currentContainerId = null;
    modeRef.current = currentMode;

    const startEnvironment = async () => {
      setLoading(true);
      setError("");
      setLogs([{ time: new Date().toLocaleTimeString(), msg: `Initializing ${currentMode} environment...`, type: "system" }]);

      try {
        const token = localStorage.getItem("skillev_token");
        const res = await fetch(`${API_BASE_URL}/tasks/start/${domain}/${taskId}?mode=${currentMode}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (res.ok) {
          currentContainerId = data.container_id;
          containerIdRef.current = data.container_id;
          setContainerData({ id: data.container_id, port: data.port });
          
          const evidenceRes = await fetch(`${API_BASE_URL}/users/my-evidence`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const evidenceList = await evidenceRes.json();
          const currentSession = evidenceList.find(r => r.container_id === data.container_id);
          if (currentSession) setActiveReportId(currentSession.id);

          setLogs(prev => [...prev, 
            { time: new Date().toLocaleTimeString(), msg: `Node allocated on port ${data.port}.`, type: "success" }
          ]);
        } else {
          setError(data.detail || "Node Allocation Failed");
          setLoading(false);
        }
      } catch (err) {
        setError("Connection Error: Backend Unreachable");
        setLoading(false);
      }
    };

    startEnvironment();
    return () => {
      if (currentContainerId) {
        const token = localStorage.getItem("skillev_token");
        fetch(`${API_BASE_URL}/tasks/stop/${currentContainerId}`, { 
          method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
        }).catch(err => console.error("Cleanup failed:", err));
      }
    };
  }, [domain, taskId, currentMode]);

  useEffect(() => {
    if (currentMode === "hiring" && activeReportId && isIframeLoaded) {
      const captureBaseline = async () => {
        await captureVisualEvidence("webcam");
        await captureVisualEvidence("screen");
      };
      captureBaseline();
      const surveillanceInterval = setInterval(() => {
        if (isCompletedRef.current) return clearInterval(surveillanceInterval);
        captureVisualEvidence(Math.random() > 0.5 ? "webcam" : "screen");
      }, 120000);
      return () => clearInterval(surveillanceInterval);
    }
  }, [activeReportId, isIframeLoaded, currentMode]);

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
          const currentSessionReport = evidenceList.find(r => r.container_id === containerData.id);
          
          if (currentSessionReport && currentSessionReport.status === "completed") {
            clearInterval(poller);
            const syncRes = await fetch(`${API_BASE_URL}/users/sync-typing-profile`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
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
            }
          }
        } catch (err) { console.error("Sync error:", err); }
      }, 3000);
    }
    return () => clearInterval(poller);
  }, [isIframeLoaded, isCompleted, containerData.id, keystrokeBuffer, focusEvents, currentMode]);

  return (
    <div className="h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col antialiased">
      
      <AnimatePresence>
        {(!isIframeLoaded || loading) && !error && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-widest text-white uppercase mb-2">Deploying Workspace</h2>
              <p className="text-white/40 font-mono text-xs uppercase tracking-tighter">Setting up secure node: {domain}/{taskId}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f0f0f] border border-white/10 p-10 rounded-3xl text-center max-w-sm shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete</h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">Forensic integrity check passed. Data has been cryptographically sealed to your profile.</p>
              <button onClick={() => navigate(`/dashboard`)} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-[11px] tracking-widest rounded-xl transition-colors">Return to Dashboard</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-14 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
               Sector: <span className="text-emerald-400">{domain}</span> <span className="text-white/20 mx-1">/</span> {taskId}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            {currentMode === 'hiring' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                    <Camera size={12} /> Visual_Sync_Active
                </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${
              currentMode === 'learning' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {currentMode === 'learning' ? <GraduationCap size={14}/> : <Briefcase size={14}/>}
              {currentMode} Mode
            </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: MISSION BRIEF */}
        <aside className="w-72 border-r border-white/10 p-6 bg-[#080808] flex flex-col shrink-0">
          <div className={`flex items-center gap-2 mb-6 ${meta.iconColor} uppercase font-bold text-[11px] tracking-widest`}>
            <ShieldAlert size={16} /> Briefing: {meta.title}
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            <section>
              <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Objective</h4>
              <p className="text-sm text-white/80 leading-relaxed">
                {meta.objective}
              </p>
            </section>

            <section className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-white/30 text-[9px] font-bold uppercase mb-3">
                <Target size={12} /> Priority Focus
              </div>
              <p className="text-[11px] text-emerald-400 font-mono italic">
                {meta.requirement}
              </p>
            </section>

            <section className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-white/30 text-[9px] font-bold uppercase mb-3">
                <Wifi size={12} /> Connection Details
              </div>
              <code className="text-[11px] text-emerald-400 font-mono block break-all bg-black/40 p-2 rounded">
                {isIframeLoaded ? `http://localhost:${containerData.port}` : "Connecting..."}
              </code>
            </section>

            {focusEvents.length > 0 && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                 <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-[10px] uppercase">
                    <AlertTriangle size={14} /> Alert
                 </div>
                 <p className="text-[10px] text-white/50 italic leading-snug">
                    Unauthorized tab switching detected. Integrity score reduced.
                 </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase">
               <Clock size={12} /> Session Active
             </div>
          </div>
        </aside>

        {/* CENTER: THE LAB ENVIRONMENT */}
        <section className="flex-1 bg-black p-4 relative">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#000]">
            {error ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Environment Crash</h3>
                <p className="text-white/40 text-sm mb-6 max-w-xs">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 rounded-lg text-xs font-bold uppercase">Retry Connection</button>
              </div>
            ) : (
              <iframe 
                src={`http://127.0.0.1:${containerData.port}?mode=${currentMode}`} 
                onLoad={() => { setIsIframeLoaded(true); setLoading(false); }}
                className="w-full h-full border-none"
                title="Lab Workspace"
              />
            )}
          </div>
        </section>

        {/* RIGHT SIDEBAR: LOGS */}
        <aside className="w-80 border-l border-white/10 bg-[#080808] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Terminal size={14} /> Telemetry
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] bg-black/30">
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-white/20 shrink-0">[{log.time.split(' ')[0]}]</span>
                  <span className={`${
                    log.type === "success" ? "text-emerald-400" : 
                    log.type === "error" ? "text-red-400" : "text-white/60"
                  }`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              {logs.length === 0 && <div className="text-white/10 italic">Waiting for connection...</div>}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}