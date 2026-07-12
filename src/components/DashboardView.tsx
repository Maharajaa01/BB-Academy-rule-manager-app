import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import {
  Users,
  FolderLock,
  ArrowRight,
  Clock,
  Sparkles,
  Bell,
  Calendar,
  FileText
} from "lucide-react";
import { motion } from "motion/react";
import { StaffDashboardData, AdminDashboardData } from "../types";

interface DashboardViewProps {
  user: any;
  setView: (v: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  onSelectBook: (id: string) => void;
}

export default function DashboardView({ user, setView, showToast, onSelectBook }: DashboardViewProps) {
  const isAdmin = user.role === "Administrator";
  const [staffStats, setStaffStats] = useState<StaffDashboardData | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayBooks, setTodayBooks] = useState<any[]>([]);

  // Greeting helper
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Check if a date is today
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const bookDate = new Date(dateString);
    const today = new Date();
    return (
      bookDate.getFullYear() === today.getFullYear() &&
      bookDate.getMonth() === today.getMonth() &&
      bookDate.getDate() === today.getDate()
    );
  };

  // Format time from date string
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsUrl = isAdmin
          ? "/api/method/rule_management.rule_management.api.admin_dashboard"
          : "/api/method/rule_management.rule_management.api.get_staff_dashboard";

        const statsRes = await apiFetch(statsUrl);
        const statsData = await statsRes.json();

        if (statsData.status === "success") {
          if (isAdmin) {
            setAdminStats(statsData.data);
          } else {
            setStaffStats(statsData.data);
          }
        } else {
          showToast(statsData.message || "Failed to load dashboard metrics.", "error");
        }

        // Fetch rule books and filter those created today
        const booksRes = await apiFetch("/api/method/rule_management.rule_management.api.get_rule_books");
        const booksData = await booksRes.json();
        if (booksData.status === "success") {
          // Filter books created today (using 'creation' field from Frappe)
          const booksCreatedToday = booksData.data.filter((book: any) =>
            isToday(book.creation)
          );
          setTodayBooks(booksCreatedToday);
        }
      } catch (err) {
        console.error(err);
        showToast("Error retrieving dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 shadow-xl overflow-hidden glass"
      >
        <div className="absolute right-[-5%] top-[-30%] w-48 h-48 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Secure Network Access</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
              {getGreeting()}, <span className="text-gold">{user.employee_name}</span>
            </h2>
            <p className="text-xs text-zinc-450 font-sans max-w-lg">
              You are signed in as <span className="font-bold text-gray-200">{user.role}</span>. Review guidelines, execute protocols, and ensure absolute standard operational compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right font-mono text-[11px] text-gray-500 hidden sm:block">
              <div className="flex items-center gap-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>2026 Shift Schedule</span>
              </div>
              <div className="mt-1">SYS ID: {user.staff_id || "STF-001"}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-mono font-bold text-lg">
              {user.employee_name?.split(" ").map((n: string) => n[0]).join("")}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading Block */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Encrypting stream...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin ? (
              <>
                {/* Metric: Total Staff */}
                <motion.div
                  onClick={() => setView("admin-staff")}
                  className="p-5 rounded-2xl cursor-pointer flex items-center justify-between group glass stat-card border-l-4 border-l-gold"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold font-display">Registered Staff</span>
                    <h3 className="text-4xl font-display font-black text-white">{adminStats?.total_staff}</h3>
                    <p className="text-[10px] text-gold flex items-center gap-1 font-sans font-semibold">
                      <span>Manage employee database</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shadow-inner group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <Users className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Metric: Total Categories */}
                <motion.div
                  onClick={() => setView("admin-categories")}
                  className="p-5 rounded-2xl cursor-pointer flex items-center justify-between group glass stat-card"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold font-display">Rule Categories</span>
                    <h3 className="text-4xl font-display font-black text-white">{adminStats?.total_categories}</h3>
                    <p className="text-[10px] text-gold flex items-center gap-1 font-sans font-semibold">
                      <span>Organize handbook structure</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shadow-inner group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    <FolderLock className="w-5 h-5" />
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                {/* Staff: Assigned Categories */}
                <div className="p-5 rounded-2xl flex items-center justify-between glass stat-card border-l-4 border-l-gold sm:col-span-2">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold font-display">Your Categories</span>
                    <h3 className="text-4xl font-display font-black text-white">{staffStats?.total_assigned_categories}</h3>
                    <p className="text-[10px] text-zinc-500 font-sans">Active operational branches assigned to you</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shadow-inner">
                    <FolderLock className="w-5 h-5" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Updates Section */}
          <div className="space-y-4 pt-2">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-4 h-4 text-gold" />
                  {todayBooks.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <h4 className="text-xs uppercase tracking-widest text-gold font-bold font-sans">
                  Recent Updates
                </h4>
                {todayBooks.length > 0 && (
                  <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono font-semibold border border-green-500/30">
                    {todayBooks.length} New Today
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            {/* Today's Books Grid */}
            {todayBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {todayBooks.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelectBook(book.id || book.book_title)}
                    className="relative p-5 rounded-2xl transition-all duration-300 cursor-pointer group overflow-hidden glass glass-card-hover border border-green-500/20 hover:border-green-500/40"
                  >
                    {/* New badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[8px] uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-mono font-bold border border-green-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        New
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Category tag */}
                      <span className="text-[9px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded font-mono border border-gold/15 inline-block">
                        {book.rule_category}
                      </span>

                      {/* Book title */}
                      <h5 className="font-display font-bold text-zinc-200 group-hover:text-gold transition-colors text-sm line-clamp-2 pr-12">
                        {book.book_title}
                      </h5>

                      {/* Meta info */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {book.rules?.length || 0} Rules
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(book.creation)}
                          </span>
                        </div>
                        <span className="text-gold flex items-center gap-1 text-[10px] font-mono group-hover:translate-x-1 transition-transform">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State - No books created today */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 rounded-2xl border border-dashed border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-950/50 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-600" />
                </div>
                <h5 className="text-sm font-display font-bold text-gray-400 mb-1">No Updates Today</h5>
                <p className="text-xs text-gray-600 font-mono max-w-xs mx-auto">
                  New rule books created today will appear here automatically.
                </p>
              </motion.div>
            )}

            {/* View All Categories Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setView("categories")}
              className="w-full py-3.5 border border-dashed border-gold/20 hover:border-gold/50 rounded-xl flex items-center justify-center gap-2 text-gold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer bg-gold/5 hover:bg-gold/10"
            >
              <span>Browse All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
