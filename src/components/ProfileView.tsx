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

  useEffect(() => {
    fetch("/api/method/rule_management.rule_management.api.get_logged_in_staff_profile")
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

            {/* Logout actions */}
            <div className="pt-6 border-t border-gray-900 flex justify-end">
              <button
                onClick={handleLogoutAction}
                className="flex items-center justify-center gap-2 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold font-sans py-3 px-6 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                <span>Revoke Session Authorization</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
