import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import { User, Phone, Mail, ShieldAlert, LogOut, CheckCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface ProfileViewProps {
  user: any;
  onLogout: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ProfileView({ user, onLogout, showToast }: ProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reset Password State
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/method/rule_management.rule_management.api.get_logged_in_staff_profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.data) {
          setProfile(data.data);
        } else {
          setProfile(user); // fallback to user state
        }
      })
      .catch((err) => {
        console.error(err);
        setProfile(user);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const activeProfile = profile || user;

  const handleLogoutAction = () => {
    onLogout();
    showToast("Successfully deauthorized and logged out.", "success");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setResetLoading(true);
    try {
      const res = await apiFetch("/api/method/rule_management.rule_management.api.reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Password reset successfully.", "success");
        setIsResetting(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.message || "Failed to reset password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b border-gray-900 pb-5">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Identity Verification</span>
        <h2 className="text-xl font-black text-white tracking-tight">Staff Account Profile</h2>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Decrypting profile...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold/15 bg-gradient-to-b from-[#161616] to-[#0f0f0f] overflow-hidden shadow-2xl glass-card"
        >
          {/* Cover Hero Banner */}
          <div className="h-24 bg-gradient-to-r from-gold/10 via-[#262626] to-gold/5 border-b border-gold/10 relative">
            <div className="absolute bottom-[-24px] left-8">
              <div className="w-16 h-16 rounded-2xl bg-[#141414] border-2 border-gold flex items-center justify-center text-gold font-sans font-black text-2xl shadow-lg shadow-black/80">
                {activeProfile.employee_name?.split(" ").map((n: string) => n[0]).join("")}
              </div>
            </div>
          </div>

          <div className="p-8 pt-10 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">{activeProfile.employee_name}</h3>
                <p className="text-xs text-gold font-mono flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span>Verified {activeProfile.role}</span>
                </p>
              </div>
              <div className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border border-gold/25 self-start sm:self-auto">
                {activeProfile.status || "ACTIVE"}
              </div>
            </div>

            {/* Fields parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-900 pt-6">
              {/* Login ID */}
              <div className="p-4 rounded-xl bg-premium-gray/60 border border-gray-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">System Login ID</span>
                  <span className="text-sm font-bold text-gray-200 font-mono">{activeProfile.login_id}</span>
                </div>
              </div>

              {/* Staff ID */}
              <div className="p-4 rounded-xl bg-premium-gray/60 border border-gray-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Authorized Staff ID</span>
                  <span className="text-sm font-bold text-gray-200 font-mono">{activeProfile.id || activeProfile.staff_id || "STF-001"}</span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl bg-premium-gray/60 border border-gray-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Email Address</span>
                  <span className="text-sm font-medium text-gray-200 truncate block max-w-[200px]">{activeProfile.email || "No email linked"}</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="p-4 rounded-xl bg-premium-gray/60 border border-gray-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Mobile Telephone</span>
                  <span className="text-sm font-medium text-gray-200 font-mono">{activeProfile.mobile_no || "No telephone linked"}</span>
                </div>
              </div>
            </div>

            {/* Reset Password Form */}
            <div className="pt-6 border-t border-gray-900">
              {!isResetting ? (
                <button
                  onClick={() => setIsResetting(true)}
                  className="text-gold text-xs font-bold uppercase tracking-wider hover:text-gold-light transition-colors duration-200"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 max-w-sm">
                  <h4 className="text-sm font-bold text-white mb-2">Change Password</h4>
                  <div>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-gold outline-none transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#1b1b1b] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-gold outline-none transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg shadow-lg shadow-gold/10 transition-all duration-300 disabled:opacity-50"
                    >
                      {resetLoading ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResetting(false)}
                      className="border border-gray-800 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Logout actions */}
            <div className="pt-6 border-t border-gray-900 flex justify-end">
              <button
                onClick={handleLogoutAction}
                className="flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold font-sans py-3 px-6 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
