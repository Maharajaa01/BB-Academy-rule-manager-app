import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Layers, 
  User, 
  ShieldAlert, 
  Users, 
  FolderLock, 
  BookOpen, 
  Download, 
  LogOut, 
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ViewType, Staff, RuleCategory, RuleBook } from "./types";
import Logo from "./components/Logo";
import ToastContainer, { ToastMessage } from "./components/Toast";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import CategoriesView from "./components/CategoriesView";
import ProfileView from "./components/ProfileView";
import AdminStaffView from "./components/AdminStaffView";
import AdminCategoriesView from "./components/AdminCategoriesView";
import AdminBooksView from "./components/AdminBooksView";
import RuleBookDetailModal from "./components/RuleBookDetailModal";

export default function App() {
  // Session Authentication
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<ViewType>("dashboard");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  // Admin sub-view state (staff | categories | books) when on "admin" tab
  const [adminSubTab, setAdminSubTab] = useState<"staff" | "categories" | "books">("staff");

  // Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Load session from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem("bb_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("bb_session");
      }
    }

    // Register Service Worker if supported
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
          .catch((err) => console.log("Service Worker registration failed:", err));
      });
    }

    // Listen for PWA installer prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("bb_session", JSON.stringify(userData));
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("bb_session");
    setView("dashboard");
    setSelectedBookId(null);
  };

  // Toast dispatch helpers
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trigger PWA installation
  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      showToast("BB Rule Manager added to Home Screen!", "success");
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  if (!user) {
    return (
      <>
        <LoginView onLoginSuccess={handleLogin} showToast={showToast} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  const isAdmin = user.role === "Administrator";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col md:flex-row font-sans overflow-x-hidden select-none">
      {/* Decorative BG element */}
      <div className="fixed top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gold/3 blur-[180px] pointer-events-none z-0" />

      {/* --- DESKTOP SIDE NAVIGATION PANEL --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-yellow-500/10 p-6 space-y-8 z-10 shrink-0 relative glass">
        {/* Core Branding */}
        <Logo size="md" className="flex-row gap-2.5 justify-start text-left" />
        <div className="border-b border-yellow-500/10 pb-2">
          <span className="text-[10px] uppercase font-display tracking-widest text-gold font-bold">Menu Navigation</span>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="flex-1 space-y-1.5">
          {/* Dashboard */}
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
              view === "dashboard"
                ? "bg-gold/10 text-gold border-gold"
                : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>

          {/* Categories Catalogue */}
          <button
            onClick={() => setView("categories")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
              view === "categories"
                ? "bg-gold/10 text-gold border-gold"
                : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            <span>Rule Categories</span>
          </button>

          {/* Administrator Panel Tabs */}
          {isAdmin && (
            <div className="space-y-1 pt-4">
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 font-bold block px-4 mb-2">
                System Admin
              </span>
              
              {/* Manage Staff */}
              <button
                onClick={() => setView("admin-staff")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
                  view === "admin-staff"
                    ? "bg-gold/10 text-gold border-gold"
                    : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Staff Database</span>
              </button>

              {/* Manage Categories */}
              <button
                onClick={() => setView("admin-categories")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
                  view === "admin-categories"
                    ? "bg-gold/10 text-gold border-gold"
                    : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
                }`}
              >
                <FolderLock className="w-4.5 h-4.5" />
                <span>Category Editor</span>
              </button>

              {/* Manage Books */}
              <button
                onClick={() => setView("admin-books")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
                  view === "admin-books"
                    ? "bg-gold/10 text-gold border-gold"
                    : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
                }`}
              >
                <BookOpen className="w-4.5 h-4.5" />
                <span>Book Publisher</span>
              </button>
            </div>
          )}

          {/* Profile Details */}
          <button
            onClick={() => setView("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-r-3 cursor-pointer ${
              view === "profile"
                ? "bg-gold/10 text-gold border-gold"
                : "text-zinc-400 border-transparent hover:bg-gold/10 hover:text-gold hover:border-gold"
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile ID</span>
          </button>
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="pt-4 border-t border-gray-900 space-y-3">
          {showInstallBtn && (
            <button
              onClick={triggerInstall}
              className="w-full py-2.5 px-4 rounded-xl border border-gold/30 bg-gold/5 text-gold hover:bg-gold hover:text-black hover:border-gold font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install PWA</span>
            </button>
          )}

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-mono font-bold text-xs shrink-0">
              {user.employee_name?.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-white truncate leading-tight">{user.employee_name}</h5>
              <span className="text-[10px] text-gray-500 font-mono block truncate">{user.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE VIEWPORTS HEADER --- */}
      <header className="md:hidden w-full bg-[#141414] border-b border-gold/10 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-2">
          {/* Custom CSS/SVG Crown Logo */}
          <Logo size="sm" />
          <h1 className="text-xs font-black tracking-widest text-gold uppercase">BB RULE MANAGER</h1>
        </div>

        {/* PWA Direct Download */}
        <div className="flex items-center gap-2">
          {showInstallBtn && (
            <button
              onClick={triggerInstall}
              className="p-2 rounded-lg bg-gold/10 border border-gold/20 text-gold flex items-center justify-center cursor-pointer transition-all active:scale-90"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-mono font-bold text-xs border border-gold/15">
            {user.employee_name?.split(" ").map((n: string) => n[0]).join("")}
          </div>
        </div>
      </header>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full z-10 pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (view === "admin-staff" ? adminSubTab : "")} // animate switch on tab change
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* View Dispatcher */}
            {view === "dashboard" && (
              <DashboardView
                user={user}
                setView={setView}
                showToast={showToast}
                onSelectBook={setSelectedBookId}
              />
            )}

            {view === "categories" && (
              <CategoriesView 
                showToast={showToast} 
                onSelectBook={setSelectedBookId} 
              />
            )}

            {view === "profile" && (
              <ProfileView 
                user={user} 
                onLogout={handleLogout} 
                showToast={showToast} 
              />
            )}

            {view === "admin-staff" && (
              <AdminStaffView showToast={showToast} />
            )}

            {view === "admin-categories" && (
              <AdminCategoriesView showToast={showToast} />
            )}

            {view === "admin-books" && (
              <AdminBooksView showToast={showToast} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- MOBILE STYLISH BOTTOM NAVIGATION BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#141414]/90 border-t border-gold/10 backdrop-blur-md z-30 flex items-center justify-around px-4">
        {/* Nav Home (Dashboard) */}
        <button
          onClick={() => setView("dashboard")}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-all duration-300 ${
            view === "dashboard" ? "text-gold" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider font-sans">Home</span>
        </button>

        {/* Nav Categories */}
        <button
          onClick={() => setView("categories")}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-all duration-300 ${
            view === "categories" ? "text-gold" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider font-sans">Books</span>
        </button>

        {/* Nav Admin Portal (Only shown for administrators) */}
        {isAdmin && (
          <button
            onClick={() => {
              // Directs to admin staff by default, easily togglable
              setView("admin-staff");
            }}
            className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-all duration-300 ${
              view === "admin-staff" || view === "admin-categories" || view === "admin-books"
                ? "text-gold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wider font-sans">Admin</span>
          </button>
        )}

        {/* Nav Profile */}
        <button
          onClick={() => setView("profile")}
          className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-all duration-300 ${
            view === "profile" ? "text-gold" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider font-sans">Profile</span>
        </button>
      </nav>

      {/* --- NESTED SUB-TAB SELECTION FOR ADMINISTRATORS ON MOBILE --- */}
      {isAdmin && (view === "admin-staff" || view === "admin-categories" || view === "admin-books") && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 h-10 bg-[#0f0f0f] border-t border-gold/10 z-20 flex items-center justify-center gap-2 p-1 bg-opacity-95">
          <button
            onClick={() => setView("admin-staff")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
              view === "admin-staff"
                ? "bg-gold text-black font-extrabold"
                : "text-gray-400 bg-premium-light"
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setView("admin-categories")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
              view === "admin-categories"
                ? "bg-gold text-black font-extrabold"
                : "text-gray-400 bg-premium-light"
            }`}
          >
            Folders
          </button>
          <button
            onClick={() => setView("admin-books")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
              view === "admin-books"
                ? "bg-gold text-black font-extrabold"
                : "text-gray-400 bg-premium-light"
            }`}
          >
            Manuals
          </button>
        </div>
      )}

      {/* --- DETAIL RULES BOOK COMPONENT (MODAL PLAYER OVERLAY) --- */}
      <AnimatePresence>
        {selectedBookId && (
          <RuleBookDetailModal
            bookId={selectedBookId}
            onClose={() => setSelectedBookId(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* --- TOAST CONTAINER OVERLAYS --- */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
