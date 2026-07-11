import { apiFetch } from "../api";
import React, { useState } from "react";
import Logo from "./Logo";
import { LogIn, KeyRound, User, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function LoginView({ onLoginSuccess, showToast }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("Please enter both login ID and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/method/rule_management.rule_management.api.login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_id: username,
          password: password,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        showToast("Welcome back! Credentials verified.", "success");
        onLoginSuccess(data.data);
      } else {
        showToast(data.message || "Invalid credentials.", "error");
      }
    } catch (err) {
      showToast("Could not connect to the API server.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0f0f0f] relative overflow-hidden">
      {/* Decorative Golden Ambient Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl border border-gold/15 bg-gradient-to-b from-[#161616] to-[#0f0f0f] p-8 shadow-2xl relative z-10 glass-card"
      >
        {/* Sleek SVG Logo */}
        <Logo size="xl" className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Username */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-gold font-bold font-sans">
              Login ID / Employee ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter login ID..."
                className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 font-sans tracking-wide transition-all duration-300 gold-glow-focus"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-gold font-bold font-sans">
                Security Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-gray-500 font-sans tracking-wide transition-all duration-300 gold-glow-focus"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gold transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-light hover:to-gold-dark text-black font-sans font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 text-black" />
                <span className="tracking-wider uppercase text-xs font-black">Login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-gray-900 pt-6">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            🔐 Secured Core System • v2.6.1
          </p>
        </div>
      </motion.div>
    </div>
  );
}
