import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Code, ArrowUpRight, Lock, Terminal, Eye, Zap, Database, Share2 } from "lucide-react";

/* ---------------- ANIMATION CONSTANTS ---------------- */
const transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };

/* ---------------- COMPONENTS ---------------- */

const ParallaxCard = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: smoothY }}>
      {children}
    </motion.div>
  );
};

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/80 backdrop-blur-sm p-8 transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.2), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  
  // Parallax for the Background orbs
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 1000], [0, 400]);
  const orbRotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="bg-[#030303] text-[#F5F5F5] selection:bg-emerald-500/30 font-sans antialiased overflow-x-hidden">
      
      {/* 1. ANIMATED BACKGROUND ORBS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ y: orbY, rotate: orbRotate }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] brightness-150 mix-blend-overlay" />
      </div>

      {/* 2. NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-[12px] shadow-[0_0_20px_rgba(16,185,129,0.5)]">SK</div>
            <span className="text-xs font-black tracking-[0.5em] uppercase text-white">Skillev</span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-12">
            {["Protocol", "Domains", "Security", "Evidence"].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-[10px] uppercase tracking-[0.3em] text-white/70 hover:text-emerald-400 transition-all hover:translate-y-[-1px]">
                {link}
              </a>
            ))}
            <button 
              onClick={() => navigate("/login")}
              className="bg-white text-black px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all active:scale-95"
            >
              Console Access
            </button>
          </div>
        </div>
      </nav>

      <main ref={targetRef} className="relative z-10">

        {/* 3. HERO SECTION (With Parallax Headlines) */}
        <section className="min-h-screen flex items-center justify-center text-center px-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={transition}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10 inline-flex px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase"
            >
              Proof Infrastructure // v3.0
            </motion.div>

            <motion.h1 
              style={{ y: useTransform(scrollY, [0, 500], [0, 100]) }}
              className="text-[12vw] md:text-[9.5rem] font-black leading-[0.75] tracking-tighter mb-12 text-white"
            >
              PROOF BY DOING.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-700">NOT CLAIMS.</span>
            </motion.h1>

            <motion.p 
              style={{ y: useTransform(scrollY, [0, 500], [0, 50]) }}
              className="max-w-2xl mx-auto text-white/80 text-lg md:text-xl mb-14 leading-relaxed"
            >
              Skillev transforms real task execution into verifiable hiring evidence.
              <br />
              <span className="text-emerald-400 font-bold italic">No certificates. No MCQs. Just proof.</span>
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="px-12 py-5 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
              >
                Start Proving
              </motion.button>
              <button className="px-12 py-5 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-white hover:border-emerald-500/50">
                View Evidence
              </button>
            </div>
          </motion.div>
        </section>

        {/* 4. THE PROBLEM (Floating Parallax) */}
        <section className="py-60 px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={transition}
            >
              <h2 className="text-7xl font-black tracking-tighter mb-10 italic text-white leading-none">Hiring is<br/><span className="text-emerald-500">Broken.</span></h2>
              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Resumes are exaggerated. Certificates are faked. Recruiter trust is at an all-time low.
              </p>
              <div className="h-1 w-20 bg-emerald-500 rounded-full mb-8" />
              <p className="text-white/60 font-mono text-sm uppercase tracking-widest leading-loose">
                Source: SK_Identity_Report_2026
              </p>
            </motion.div>
            
            <ParallaxCard offset={80}>
              <SpotlightCard className="py-20 text-center border-emerald-500/20 bg-emerald-500/[0.03]">
                <p className="text-3xl text-emerald-400 leading-tight italic font-black">
                  "Can this person actually do the job?"
                </p>
                <p className="mt-6 text-white/40 text-[10px] uppercase tracking-[0.4em]">Skillev answers with data</p>
              </SpotlightCard>
            </ParallaxCard>
          </div>
        </section>

        {/* 5. PROTOCOL STEPS (Staggered Reveal) */}
        <section id="protocol" className="py-40 bg-white/[0.02] border-y border-white/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500 mb-24 text-center">The Evidence Protocol</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: <Zap size={28}/>, t: "Real Execution", d: "Tasks run in isolated, timed Docker containers." },
                { icon: <Terminal size={28}/>, t: "Log Capture", d: "Automatic recording of commands, files, and fixes." },
                { icon: <Database size={28}/>, t: "Chain Verification", d: "SHA-256 integrity checks seal your evidence." },
                { icon: <Share2 size={28}/>, t: "Proof Link", d: "Share read-only timelines directly with hiring teams." }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <SpotlightCard className="h-full">
                    <div className="text-emerald-500 mb-8 p-3 bg-emerald-500/10 rounded-xl w-fit">{step.icon}</div>
                    <h4 className="text-lg font-black mb-4 text-white uppercase italic tracking-tighter">{step.t}</h4>
                    <p className="text-sm text-white/60 leading-relaxed font-medium">{step.d}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. DOMAINS (Parallax Scroll) */}
        <section id="domains" className="py-60 px-8">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
                <h2 className="text-8xl font-black tracking-tighter italic text-white leading-none">Live<br/>Domains.</h2>
                <p className="text-emerald-500 font-mono text-sm uppercase tracking-[0.3em] font-bold">Protocol_Update: [ACTIVE]</p>
             </div>

             <div className="grid lg:grid-cols-2 gap-16">
                <ParallaxCard offset={40}>
                   <SpotlightCard>
                      <div className="flex items-center gap-4 mb-10">
                         <Shield className="text-emerald-500" size={40} />
                         <h3 className="text-4xl font-black italic text-white uppercase">Cyber</h3>
                      </div>
                      <div className="space-y-2">
                        {["SQLi Defense", "JWT Security", "IDOR Patching", "XSS Mitigation"].map(task => (
                          <div key={task} className="flex justify-between items-center py-5 border-t border-white/10 group cursor-pointer">
                             <span className="text-white/70 text-lg font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{task}</span>
                             <ArrowUpRight size={20} className="text-white/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                   </SpotlightCard>
                </ParallaxCard>

                <ParallaxCard offset={-40}>
                   <SpotlightCard>
                      <div className="flex items-center gap-4 mb-10">
                         <Code className="text-emerald-500" size={40} />
                         <h3 className="text-4xl font-black italic text-white uppercase">Dev</h3>
                      </div>
                      <div className="space-y-2">
                        {["API Pipeline", "DB Optimization", "Secure Middleware", "Auth Logic"].map(task => (
                          <div key={task} className="flex justify-between items-center py-5 border-t border-white/10 group cursor-pointer">
                             <span className="text-white/70 text-lg font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{task}</span>
                             <ArrowUpRight size={20} className="text-white/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                   </SpotlightCard>
                </ParallaxCard>
             </div>
          </div>
        </section>

        {/* 7. EVIDENCE PREVIEW (Sticky Scroll Effect) */}
        <section id="evidence" className="py-40 bg-emerald-500/[0.02] border-y border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
            <ParallaxCard offset={100}>
              <div className="relative group p-1 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[2.5rem]">
                <div className="relative aspect-video bg-[#0A0A0A] rounded-[2.4rem] p-10 flex flex-col justify-between shadow-2xl overflow-hidden border border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                    <div className="w-3 h-3 rounded-full bg-green-500/40" />
                  </div>
                  <div className="space-y-4 font-mono text-[14px]">
                    <p className="text-emerald-500/90 font-bold">[09:12] AUTH_TASK: START</p>
                    <p className="text-white/50">[09:14] $ curl -v -X POST /api/login</p>
                    <p className="text-white/50">[09:15] # Patching SQL Injection bug...</p>
                    <motion.p 
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-emerald-400 font-black"
                    >
                      [09:18] STATUS: VERIFIED_PROOF_GEN
                    </motion.p>
                  </div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.5em] pt-6 border-t border-white/10 flex justify-between">
                    <span>Verifiable Playback</span>
                    <span>98.2% Accuracy</span>
                  </div>
                </div>
              </div>
            </ParallaxCard>

            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-6xl font-black tracking-tighter mb-8 italic text-white uppercase leading-none"
              >
                The Proof <br/><span className="text-emerald-500 underline decoration-emerald-900 underline-offset-8">Signal.</span>
              </motion.h2>
              <p className="text-white/80 text-xl leading-relaxed mb-10">
                Traditional hiring is based on claims. Skillev is based on execution. Watch how candidates actually solve problems.
              </p>
              <button className="flex items-center gap-4 text-emerald-500 font-black uppercase tracking-[0.3em] text-xs group">
                Watch Demo Playback 
                <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <ArrowUpRight size={16} />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA (Impactful Reveal) */}
        <section className="py-80 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-emerald-500/5 blur-[180px] rounded-full" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-8xl md:text-[11rem] font-black tracking-tighter mb-20 text-white leading-[0.8] uppercase italic">
              STOP CLAIMING.<br />
              <span className="text-emerald-500">START PROVING.</span>
            </h2>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#10b981" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/register")}
              className="px-24 py-8 bg-white text-black rounded-3xl font-black uppercase tracking-[0.4em] text-[13px] shadow-[0_20px_80px_rgba(16,185,129,0.2)] transition-colors"
            >
              Deploy Your ID
            </motion.button>
            <p className="mt-14 text-white/30 text-[11px] uppercase tracking-[0.5em] font-mono italic">
               ID_PROXIED: 2026_VERSION_BETA
            </p>
          </motion.div>
        </section>
      </main>

      <footer className="p-20 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 border border-white/20 rounded-xl flex items-center justify-center font-black text-white text-[12px]">SK</div>
            <span className="text-[11px] font-black tracking-[0.5em] uppercase text-white/40">Skillev Protocol</span>
          </div>
          <div className="text-[11px] tracking-[0.2em] text-white/30 uppercase font-mono">
             "Trust execution, not documentation."
          </div>
          <div className="flex gap-10">
             {["X", "Discord", "GitHub"].map(social => (
               <span key={social} className="text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-emerald-500 cursor-pointer transition-colors font-black">{social}</span>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}