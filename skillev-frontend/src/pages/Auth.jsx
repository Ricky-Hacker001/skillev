import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

// Unique transition physics for a "robotic/precise" feel
const formTransition = { type: "spring", stiffness: 300, damping: 30 };

const inputVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. PROTOCOL BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d2d1f_0%,transparent_70%)] opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
      </div>

      {/* 2. NAVIGATION */}
      <button 
        onClick={() => navigate("/")}
        className="fixed top-10 left-10 z-50 flex items-center gap-3 text-white/60 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
      >
        <ArrowLeft size={16} /> Protocol Home
      </button>

      <motion.div 
        layout // Smoothly animates the container height change
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* LOGO & HEADER */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="inline-flex w-14 h-14 bg-emerald-500 rounded-2xl items-center justify-center font-black text-black text-lg mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            SK
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter italic text-white uppercase italic">
            {isLogin ? "Identity_Verify" : "Register_ID"}
          </h2>
          <p className="text-white/60 text-[10px] mt-3 font-mono uppercase tracking-[0.3em]">
            {isLogin ? "CREDENTIALS_REQUIRED" : "NEW_PROTOCOL_SEQUENCE"}
          </p>
        </div>

        {/* AUTH CARD */}
        <motion.div 
          layout
          className="bg-[#080808] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
        >
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="popLayout" initial={false}>
              
              {/* REGISTER ONLY: Name Field */}
              {!isLogin && (
                <motion.div key="name" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input type="text" placeholder="Rick Sanchez" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20" />
                  </div>
                </motion.div>
              )}

              {/* SHARED: Email/Phone Field */}
              <motion.div key="contact" layout className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">
                  {isLogin ? "Email or Phone" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input type="text" placeholder={isLogin ? "Email or +91..." : "name@citadel.io"} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20" />
                </div>
              </motion.div>

              {/* REGISTER ONLY: Phone Field */}
              {!isLogin && (
                <motion.div key="phone" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input type="tel" placeholder="+91 00000 00000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20" />
                  </div>
                </motion.div>
              )}

              {/* SHARED: Password Field */}
              <motion.div key="pass" layout className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4 italic">Master Key</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20" />
                </div>
              </motion.div>

              {/* REGISTER ONLY: Confirm Password */}
              {!isLogin && (
                <motion.div key="confirm" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">Confirm Key</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <motion.button 
              layout
              onClick={() => navigate("/dashboard")} 
              className="w-full mt-4 py-5 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 text-white shadow-xl shadow-emerald-900/20"
            >
              {isLogin ? "Execute Login" : "Initialize ID"}
              <ArrowRight size={18} />
            </motion.button>
          </form>
        </motion.div>

        {/* TOGGLE BUTTON */}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-emerald-400 transition-all text-center"
        >
          {isLogin ? "New user? Create Profile" : "Existing ID? Log in"}
        </button>
      </motion.div>

      {/* FOOTER DECOR */}
      <div className="fixed bottom-8 text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
        Status: Secure_Protocol_v4.2 // Node_Active
      </div>
    </div>
  );
}