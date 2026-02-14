import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Terminal, Shield, Clock, CheckCircle, GraduationCap, Briefcase,
  Share2, ArrowLeft, Activity, AlertTriangle, Lock, Fingerprint, 
  Cpu, Zap, ShieldCheck, ShieldAlert, EyeOff, Search
} from "lucide-react";
import { motion } from "framer-motion";

export default function EvidenceReport() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

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
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl px-10 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-400 transition-all">
          <ArrowLeft size={14} /> Back_to_Console
        </button>
        <div className="flex items-center gap-4">
           <Fingerprint size={16} className="text-emerald-500" />
           <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-[0.3em]">Protocol_Audit_v2.0</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto pt-32 pb-40 px-10">
        
        {/* 2. AUDIT HEADER */}
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
                   Comprehensive audit log aggregating technical evidence, behavioral keystroke rhythm, and focus monitoring for hiring compliance.
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
               { icon: <Zap size={14}/>, label: "Integrity", val: "SHA-256" },
               { icon: <Cpu size={14}/>, label: "Node_Type", val: "Isolated_Docker" },
               { icon: <ShieldCheck size={14}/>, label: "Trust_Status", val: "Certified" },
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

        {/* 3. MULTI-PHASE TIMELINE */}
        <div className="space-y-32">
          {history.map((report, idx) => {
            const isLearning = report.mode === "learning";
            const isVerified = report.identity_verified;
            const violations = report.logs?.filter(l => l.message.includes("Integrity_Violation")).length || 0;

            return (
              <section key={report.id} className="relative">
                {idx !== 0 && (
                   <div className="absolute -top-20 left-10 w-px h-20 bg-gradient-to-b from-white/0 via-white/10 to-white/0" />
                )}

                {/* Phase Identity & Forensic Summary */}
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
                          isLearning 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {report.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">
                          Node_Ref: {report.container_id?.slice(0, 8)}
                        </span>
                        {!isLearning && (
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border ${isVerified ? 'border-emerald-500/20 text-emerald-500' : 'border-red-500/20 text-red-500'}`}>
                            {isVerified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                            <span className="text-[8px] font-black uppercase tracking-widest">
                              {isVerified ? 'Biometric_Match' : 'Identity_Mismatch'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right flex items-center gap-10">
                    <div className="space-y-1">
                        <span className="block text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Integrity</span>
                        <span className={`text-sm font-mono font-bold ${report.integrity_score > 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {(report.integrity_score * 100).toFixed(1)}%
                        </span>
                    </div>
                    {violations > 0 && (
                        <div className="space-y-1">
                            <span className="block text-[9px] font-black text-red-500/40 uppercase tracking-[0.3em]">Violations</span>
                            <span className="text-sm font-mono font-bold text-red-500">{violations}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Log Audit Container */}
                <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                    <span>Audit_Trace_Sequence</span>
                    <div className="flex gap-10">
                      <span>Rhythm_Analysis</span>
                      <span>Outcome</span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {report.logs?.filter(l => 
                        l.message.includes("SUCCESS") || 
                        l.message.includes("EVIDENCE_LOG")
                    ).map((log, i) => {
                      const isSuccess = log.message.includes("SUCCESS");
                      const isViolation = log.message.includes("Integrity_Violation");

                      return (
                        <div key={i} className={`group flex items-start gap-8 px-8 py-8 transition-colors ${
                            isViolation ? 'bg-red-500/[0.03]' : 'hover:bg-white/[0.02]'
                        }`}>
                          <div className="w-20 flex-shrink-0 pt-1 text-[10px] font-mono text-white/20">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                   isSuccess ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
                                   isViolation ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white/20'
                               }`} />
                               <span className={`text-[10px] font-black uppercase tracking-widest ${
                                   isSuccess ? 'text-emerald-500' : 
                                   isViolation ? 'text-red-500' : 'text-white/40'
                               }`}>
                                  {isSuccess ? 'Critical_Success' : isViolation ? 'Security_Alert' : 'User_Interaction'}
                               </span>
                            </div>
                            <div className={`font-mono text-sm leading-relaxed p-5 rounded-2xl border ${
                              isSuccess ? 'bg-emerald-500/5 border-emerald-500/20 text-white' : 
                              isViolation ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-black border-white/5 text-white/70'
                            }`}>
                               <span className="text-white/20 mr-3">{isViolation ? '!' : '$'}</span>
                               {cleanMessage(log.message)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 pt-1">
                             <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                               isSuccess 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                               isViolation ? 'bg-red-500/10 text-red-500 border-red-500/20'
                               : 'bg-white/5 text-white/40 border-white/5'
                             }`}>
                               {isSuccess ? 'Verified' : isViolation ? 'Flagged' : 'Capture'}
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

        {/* 4. FINAL SEAL FOOTER */}
        <footer className="mt-40 pt-20 border-t border-white/10 text-center flex flex-col items-center">
           <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/20 mb-8">
              <Lock size={24} />
           </div>
           <h4 className="text-sm font-black italic uppercase tracking-[0.4em] text-white">Cryptographically Sealed Audit</h4>
           <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mt-4 max-w-sm leading-relaxed text-center">
             Verified by Skillev Behavioral Engine. Tab focus violations and biometric anomalies are logged with sub-millisecond precision.
           </p>
        </footer>
      </div>
    </div>
  );
}