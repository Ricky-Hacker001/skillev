import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Terminal, Shield, Clock, CheckCircle, GraduationCap, Briefcase,
  Share2, ArrowLeft, Activity, AlertTriangle, Lock, Fingerprint, 
  Cpu, Zap, ShieldCheck, ShieldAlert, EyeOff, Search, Sparkles, Camera, Monitor, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EvidenceReport() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For Lightbox
  
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchTaskHistory = async () => {
      try {
        const token = localStorage.getItem("skillev_token");
        const res = await fetch(`http://localhost:8000/evidence/task-history/${taskId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const sorted = data.sort((a, b) => (a.mode === 'learning' ? -1 : 1));
          setHistory(sorted);
        } else setError(true);
      } catch (err) { setError(true); }
      finally { setIsLoading(false); }
    };
    fetchTaskHistory();
  }, [taskId]);

  const cleanMessage = (msg) => msg.replace(/\u001b\[[0-9;]*m/g, "").replace(/\[MODE:.*?\]\s?/, "").replace("EVIDENCE_LOG: ", "");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runAIAnalysis = async (reportId) => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    try {
      const token = localStorage.getItem("skillev_token");
      const res = await fetch(`http://localhost:8000/evidence/ai-analysis/${reportId}`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAiAnalysis(data.ai_insight);
      } else {
        setAiAnalysis("ERR: Analysis node unreachable.");
      }
    } catch (err) {
      setAiAnalysis("AI_OFFLINE: Could not establish forensic link.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono text-emerald-500 uppercase tracking-widest animate-pulse">Initializing_Audit_Vault...</div>;

  if (error || history.length === 0) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white p-6">
      <AlertTriangle className="text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-black uppercase italic tracking-widest">Protocol_Not_Found</h2>
      <button onClick={() => navigate("/dashboard")} className="mt-8 px-8 py-3 bg-white text-black font-black uppercase text-[10px] rounded-full">Return to Console</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] font-sans selection:bg-emerald-500/30">
      
      {/* 1. LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-10 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 text-white/50 hover:text-white"><X size={32}/></button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={selectedImage} 
              className="max-w-full max-h-full rounded-2xl border border-white/10 shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl px-10 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-400 transition-all">
          <ArrowLeft size={14} /> Back_to_Console
        </button>
        <div className="flex items-center gap-4">
           <Fingerprint size={16} className="text-emerald-500" />
           <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-[0.3em]">Protocol_Audit_v3.1_Forensic_Visuals</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto pt-32 pb-40 px-10">
        
        {/* 3. AUDIT HEADER */}
        <header className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                   Forensic Integrity Chain
                </div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
                   {taskId.replace(/-/g, " ")}<span className="text-emerald-500">.</span>
                </h1>
                <p className="text-white/40 text-sm font-medium tracking-wide max-w-xl">
                   Comprehensive audit log aggregating technical logs, behavioral keystroke rhythm, and visual surveillance snapshots.
                </p>
             </div>
             <button onClick={handleShare} 
               className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95">
                {copied ? <CheckCircle size={16} /> : <Share2 size={16} />}
                {copied ? "Link_Sealed" : "Generate_Public_Audit"}
             </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
             {[
               { icon: <Clock size={14}/>, label: "Total_Phases", val: history.length },
               { icon: <Activity size={14}/>, label: "Visual_Caps", val: history.reduce((acc, curr) => acc + (curr.visual_evidence?.length || 0), 0) },
               { icon: <Cpu size={14}/>, label: "Node_Type", val: "Isolated_Docker" },
               { icon: <ShieldCheck size={14}/>, label: "Audit_AI", val: "Phi-3_Engine" },
             ].map((s, i) => (
               <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/30">
                    {s.icon} <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-tight">{s.val}</span>
               </div>
             ))}
          </div>
        </header>

        {/* 4. AI FORENSIC INSIGHTS */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-32 p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border border-emerald-500/20 relative overflow-hidden shadow-3xl"
        >
            <div className="flex items-center gap-6 mb-10">
                <div className="p-4 bg-emerald-500 rounded-3xl text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <Sparkles size={28} className={isAnalyzing ? "animate-spin" : ""} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">Neural_Forensic_Summary</h2>
                    <p className="text-[10px] text-emerald-500/60 font-mono tracking-widest">LLM PROFILING • MULTI-MODAL LOG ANALYSIS</p>
                </div>
                <button 
                    onClick={() => runAIAnalysis(history[0]?.id)} 
                    disabled={isAnalyzing || !history.length}
                    className="px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all active:scale-95"
                >
                    {isAnalyzing ? "Processing..." : "Run_AI_Audit"}
                </button>
            </div>

            <div className="min-h-[120px] bg-black/40 rounded-3xl p-8 border border-white/5 font-mono text-sm leading-relaxed text-emerald-100/80">
                {isAnalyzing ? (
                  <div className="flex items-center gap-4 text-emerald-500/40 animate-pulse">
                    <Activity size={18} />
                    <span>Analyzing injection signatures and behavioral visual artifacts...</span>
                  </div>
                ) : aiAnalysis ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap border-l-2 border-emerald-500/30 pl-6">
                    {aiAnalysis}
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-4 text-white/10 italic">
                    <Search size={18} />
                    <span>Awaiting command to generate behavioral proficiency profile.</span>
                  </div>
                )}
            </div>
        </motion.div>

        {/* 5. MULTI-PHASE TIMELINE */}
        <div className="space-y-32">
          {history.map((report, idx) => {
            const isLearning = report.mode === "learning";
            const isVerified = report.identity_verified;
            const violations = report.logs?.filter(l => l.message.includes("Integrity_Violation")).length || 0;

            return (
              <section key={report.id} className="relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-2xl ${
                      isLearning ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}>
                      {isLearning ? <GraduationCap size={32} /> : <Briefcase size={32} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isLearning ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isLearning ? "Phase_01: Behavioral_Baseline" : "Phase_02: Forensic_Audit"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                          isLearning ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {report.mode}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Node_Ref: {report.container_id?.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="space-y-1">
                        <span className="block text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Integrity</span>
                        <span className={`text-sm font-mono font-bold ${report.integrity_score > 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {(report.integrity_score * 100).toFixed(1)}%
                        </span>
                    </div>
                  </div>
                </div>

                {/* 6. VISUAL EVIDENCE GALLERY (NEW) */}
                {!isLearning && report.visual_evidence?.length > 0 && (
                  <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {report.visual_evidence.map((img, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02, translateY: -5 }}
                        className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in shadow-xl"
                        onClick={() => setSelectedImage(img.data)}
                      >
                        <img src={img.data} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Surveillance" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                           {img.type === 'webcam' ? <Camera size={10} className="text-emerald-500" /> : <Monitor size={10} className="text-emerald-500" />}
                           <span className="text-[8px] font-mono font-bold text-white/80 uppercase tracking-widest">{img.type}</span>
                        </div>
                        <div className="absolute top-3 right-3 text-[8px] font-mono text-white/20">{new Date(img.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  {/* ... Logs Section remains similar to your existing clean design ... */}
                  <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                    <span>Audit_Trace_Sequence</span>
                    <span>Outcome</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {report.logs?.filter(l => l.message.includes("SUCCESS") || l.message.includes("EVIDENCE_LOG")).map((log, i) => {
                      const isSuccess = log.message.includes("SUCCESS");
                      const isViolation = log.message.includes("Integrity_Violation");
                      return (
                        <div key={i} className={`flex items-start gap-8 px-8 py-8 transition-colors ${isViolation ? 'bg-red-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                          <div className="w-20 flex-shrink-0 pt-1 text-[10px] font-mono text-white/20">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : isViolation ? 'bg-red-500' : 'bg-white/20'}`} />
                               <span className={`text-[10px] font-black uppercase tracking-widest ${isSuccess ? 'text-emerald-500' : isViolation ? 'text-red-500' : 'text-white/40'}`}>
                                  {isSuccess ? 'Critical_Success' : isViolation ? 'Security_Alert' : 'Interaction'}
                               </span>
                            </div>
                            <div className={`font-mono text-sm leading-relaxed p-5 rounded-2xl border ${isSuccess ? 'bg-emerald-500/5 border-emerald-500/20 text-white' : isViolation ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-black border-white/5 text-white/70'}`}>
                               {cleanMessage(log.message)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-40 pt-20 border-t border-white/10 text-center flex flex-col items-center">
           <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/20 mb-8">
              <Lock size={24} />
           </div>
           <h4 className="text-sm font-black italic uppercase tracking-[0.4em] text-white">Cryptographically Sealed Audit</h4>
           <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mt-4 max-w-sm leading-relaxed">Verified by Skillev Behavioral Engine. Visual snapshots hashed for integrity.</p>
        </footer>
      </div>
    </div>
  );
}