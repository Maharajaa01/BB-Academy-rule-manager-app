import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-20 md:bottom-auto md:top-6 right-6 left-6 md:left-auto z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { key?: string; toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = toast.type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-card shadow-lg ${
        isSuccess
          ? "border-gold/30 bg-[#141414]/90"
          : "border-red-500/30 bg-[#1c1212]/95"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-gold drop-shadow-[0_0_4px_rgba(255,215,0,0.5)]" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
