import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, ArrowLeft, ArrowRight, ShieldCheck, Key, RefreshCw, Loader2 } from "lucide-react";

// Replace with your actual Railway/Render/Local URL
const API_BASE_URL = "http://localhost:8000"; 

const inputVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function Auth() {
  const [mode, setMode] = useState("login"); // login, register, verify, forgot, reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    new_password: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ---------------- API HANDLERS ---------------- */

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) setMode("verify");
      else setError(data.detail || "Registration failed");
    } catch (err) { setError("Server unreachable"); }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      if (res.ok) setMode("login");
      else setError("Invalid OTP");
    } catch (err) { setError("Verification failed"); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("skillev_token", data.access_token);
        navigate("/dashboard");
      } else setError("Invalid Credentials");
    } catch (err) { setError("Login error"); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      setMode("reset");
    } catch (err) { setError("Recovery failed"); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp, 
          new_password: formData.new_password 
        }),
      });
      if (res.ok) setMode("login");
      else setError("Reset failed. Check OTP.");
    } catch (err) { setError("Error resetting password"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#F5F5F5] font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d2d1f_0%,transparent_70%)] opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
      </div>

      <motion.div layout className="relative z-10 w-full max-w-[440px]">
        {/* LOGO & ERROR MSG */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-emerald-500 rounded-2xl items-center justify-center font-black text-black text-lg mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">SK</div>
          <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white">
            {mode === "login" && "Identity_Verify"}
            {mode === "register" && "Register_ID"}
            {mode === "verify" && "OTP_Verify"}
            {mode === "forgot" && "Reset_Request"}
            {mode === "reset" && "Update_Key"}
          </h2>
          {error && <p className="text-red-500 text-[10px] mt-2 font-mono uppercase tracking-widest">{error}</p>}
        </div>

        <motion.div layout className="bg-[#080808] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              
              {/* LOGIN / REGISTER / FORGOT PHASE: Email Input */}
              {(mode === "login" || mode === "register" || mode === "forgot" || mode === "reset") && (
                <motion.div key="email" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="rick@citadel.io" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                </motion.div>
              )}

              {/* LOGIN / REGISTER PHASE: Password Input */}
              {(mode === "login" || mode === "register") && (
                <motion.div key="pass" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 italic">Master Key</label>
                    {mode === "login" && <button onClick={() => setMode("forgot")} className="text-[9px] font-black text-emerald-500/60 uppercase">Lost Key?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                </motion.div>
              )}

              {/* VERIFY / RESET PHASE: OTP Input */}
              {(mode === "verify" || mode === "reset") && (
                <motion.div key="otp" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">Enter OTP</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input name="otp" value={formData.otp} onChange={handleChange} type="text" placeholder="123456" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                </motion.div>
              )}

              {/* RESET PHASE: New Password */}
              {mode === "reset" && (
                <motion.div key="new-pass" variants={inputVariants} initial="hidden" animate="visible" exit="exit" className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 ml-4">New Master Key</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input name="new_password" value={formData.new_password} onChange={handleChange} type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* ACTION BUTTONS */}
            <button 
              disabled={loading}
              onClick={() => {
                if (mode === "login") handleLogin();
                if (mode === "register") handleRegister();
                if (mode === "verify") handleVerify();
                if (mode === "forgot") handleForgotPassword();
                if (mode === "reset") handleResetPassword();
              }}
              className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : mode === "login" ? "Verify Access" : "Initialize"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </motion.div>

        {/* MODE SWITCHER */}
        <button 
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-emerald-400 text-center"
        >
          {mode === "login" ? "No ID? Create Profile" : "Existing ID? Log in"}
        </button>
      </motion.div>
    </div>
  );
}