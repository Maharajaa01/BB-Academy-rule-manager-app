import { apiFetch } from "../api";
import React, { useEffect, useState } from "react";
import {
  FolderLock, BookOpen, ChevronRight, Search, HelpCircle, ArrowLeft,
  Briefcase, Crown, ClipboardList, Users, Star, Upload, FileText,
  Shield, Settings, Calendar, Clock, Sun, GraduationCap, BookOpenCheck,
  Calculator, Ruler, Flower2, CircleUserRound, Dumbbell, Building2,
  Instagram, Facebook, MessageCircle, Hash, Home, Heart, Backpack, Pencil,
  Folder, Sparkles, Rocket, Coffee, Laptop, Award, Target, Zap,
  PartyPopper, Music, Gamepad2, Camera, Palette, Trophy, Brain,
  HeartHandshake, Baby, UserCircle2, School, PenTool, Presentation,
  BadgeCheck, Gem, TrendingUp, Globe, Lightbulb
} from "lucide-react";
import { motion } from "motion/react";
import { RuleCategory, RuleBook, ViewType } from "../types";

// ============================================================================
// PREDEFINED CATEGORY CONFIGURATIONS
// Each category has its own unique visual identity
// ============================================================================

interface CategoryDesign {
  gradient: string;
  gradientHover: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  decorativeElements?: React.ReactNode;
  badge?: string;
  pattern?: string;
}

const CATEGORY_DESIGNS: Record<string, CategoryDesign> = {
  // ==================== MANAGEMENT ====================

  // Manager - Royal Purple & Gold with Crown
  "manager": {
    gradient: "from-purple-600 via-violet-600 to-indigo-700",
    gradientHover: "from-purple-500 via-violet-500 to-indigo-600",
    icon: <Crown className="w-7 h-7" />,
    iconBg: "bg-yellow-400/30",
    iconColor: "text-yellow-300",
    borderColor: "border-yellow-400/40",
    glowColor: "shadow-purple-500/40",
    accentColor: "text-yellow-300",
    badge: "👑 Boss",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-30">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-20">
          <Crown className="w-14 h-14 text-yellow-300" />
        </div>
        <div className="absolute top-3 right-12 text-yellow-400/30 text-2xl">✨</div>
      </>
    ),
    pattern: "radial-gradient(circle at 80% 20%, rgba(250, 204, 21, 0.25) 0%, transparent 50%)"
  },

  // Assistance Manager - Electric Blue
  "assistance manager": {
    gradient: "from-blue-500 via-cyan-500 to-teal-600",
    gradientHover: "from-blue-400 via-cyan-400 to-teal-500",
    icon: <ClipboardList className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-cyan-300/40",
    glowColor: "shadow-cyan-500/40",
    accentColor: "text-cyan-200",
    badge: "⚡ Helper",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-20">
          <Star className="w-10 h-10 text-cyan-200" />
        </div>
        <div className="absolute top-2 right-2 text-cyan-300/40 text-xl">💫</div>
      </>
    ),
    pattern: "radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)"
  },

  // HR - Vibrant Pink & Purple
  "hr": {
    gradient: "from-pink-500 via-rose-500 to-fuchsia-600",
    gradientHover: "from-pink-400 via-rose-400 to-fuchsia-500",
    icon: <Users className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-pink-300/40",
    glowColor: "shadow-pink-500/40",
    accentColor: "text-pink-200",
    badge: "💝 People",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-30">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <Heart className="w-8 h-8 text-pink-200 fill-pink-200/30" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-20">
          <Users className="w-10 h-10 text-rose-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-pink-300/40 text-xl">💕</div>
      </>
    ),
    pattern: "radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)"
  },

  // Team Lead - Bright Orange & Yellow
  "team lead": {
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    gradientHover: "from-orange-400 via-amber-400 to-yellow-400",
    icon: <Star className="w-7 h-7" />,
    iconBg: "bg-white/25",
    iconColor: "text-white",
    borderColor: "border-yellow-300/50",
    glowColor: "shadow-orange-500/40",
    accentColor: "text-yellow-100",
    badge: "⭐ Leader",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Star className="w-10 h-10 text-yellow-200 fill-yellow-200/40" />
        </div>
        <div className="absolute bottom-3 right-4 text-yellow-200/40 text-2xl">🌟</div>
        <div className="absolute top-10 right-10 text-amber-200/30 text-lg">✨</div>
      </>
    ),
    pattern: "radial-gradient(circle at 70% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)"
  },

  // ==================== TEACHING STAFF ====================

  // Higher Posting Staff - Professional Navy & Gold
  "higher posting staff": {
    gradient: "from-indigo-600 via-blue-700 to-slate-800",
    gradientHover: "from-indigo-500 via-blue-600 to-slate-700",
    icon: <Award className="w-7 h-7" />,
    iconBg: "bg-amber-400/25",
    iconColor: "text-amber-300",
    borderColor: "border-amber-400/40",
    glowColor: "shadow-indigo-500/40",
    accentColor: "text-amber-300",
    badge: "🏆 Senior",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <BadgeCheck className="w-10 h-10 text-amber-300" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-20">
          <Gem className="w-8 h-8 text-amber-200" />
        </div>
        <div className="absolute bottom-8 right-10 text-amber-300/30 text-xl">💎</div>
      </>
    ),
    pattern: "radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 50%)"
  },

  // Posting Staff - Teacher Theme (Chalk & Blackboard)
  "posting staff": {
    gradient: "from-teal-500 via-emerald-600 to-green-700",
    gradientHover: "from-teal-400 via-emerald-500 to-green-600",
    icon: <Presentation className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-emerald-300/40",
    glowColor: "shadow-emerald-500/40",
    accentColor: "text-emerald-200",
    badge: "📚 Teacher",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full blur-xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <School className="w-10 h-10 text-emerald-200" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-20">
          <PenTool className="w-8 h-8 text-teal-200" />
        </div>
        <div className="absolute bottom-8 right-10 text-emerald-200/30 text-lg">✏️</div>
        <div className="absolute top-10 right-4 text-teal-200/25 text-xl">📖</div>
      </>
    ),
    pattern: "radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)"
  },

  // Admin Incharge - Cool Blue & Silver
  "admin incharge": {
    gradient: "from-slate-600 via-blue-700 to-indigo-800",
    gradientHover: "from-slate-500 via-blue-600 to-indigo-700",
    icon: <Shield className="w-7 h-7" />,
    iconBg: "bg-cyan-400/25",
    iconColor: "text-cyan-300",
    borderColor: "border-cyan-400/40",
    glowColor: "shadow-blue-500/40",
    accentColor: "text-cyan-300",
    badge: "🛡️ Admin",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <Shield className="w-10 h-10 text-cyan-300" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-15">
          <Settings className="w-10 h-10 text-blue-300 animate-spin" style={{ animationDuration: '15s' }} />
        </div>
        <div className="absolute bottom-10 right-10 text-cyan-300/30 text-lg">⚙️</div>
      </>
    ),
    pattern: "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)"
  },

  // ==================== TIME-BASED ====================

  // Schedule In Charge - Vibrant Cyan & Purple
  "schedule in charge": {
    gradient: "from-cyan-500 via-blue-500 to-violet-600",
    gradientHover: "from-cyan-400 via-blue-400 to-violet-500",
    icon: <Calendar className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-violet-300/40",
    glowColor: "shadow-violet-500/40",
    accentColor: "text-violet-200",
    badge: "📅 Schedule",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-30">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-400 to-blue-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <Clock className="w-10 h-10 text-violet-200" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-20">
          <Calendar className="w-8 h-8 text-cyan-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-violet-200/40 text-xl">⏰</div>
      </>
    ),
    pattern: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, transparent 50%)"
  },

  // Morning In Charge - Sunrise Gradient
  "morning in charge": {
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    gradientHover: "from-yellow-300 via-orange-400 to-red-400",
    icon: <Sun className="w-7 h-7" />,
    iconBg: "bg-white/25",
    iconColor: "text-white",
    borderColor: "border-yellow-300/50",
    glowColor: "shadow-orange-500/50",
    accentColor: "text-yellow-100",
    badge: "🌅 Morning",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-40">
          <div className="w-28 h-28 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Sun className="w-12 h-12 text-yellow-200" />
        </div>
        <div className="absolute bottom-2 right-8 text-orange-200/50 text-2xl">☀️</div>
        <div className="absolute top-10 right-4 text-yellow-200/40 text-lg">🌤️</div>
      </>
    ),
    pattern: "radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.35) 0%, transparent 60%)"
  },

  // ==================== ACADEMIC ====================

  // 9th Std In Charge - Fresh Green Academic
  "9th std in charge": {
    gradient: "from-green-500 via-emerald-500 to-teal-600",
    gradientHover: "from-green-400 via-emerald-400 to-teal-500",
    icon: <GraduationCap className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-green-300/40",
    glowColor: "shadow-green-500/40",
    accentColor: "text-green-200",
    badge: "🎓 Grade 9",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <BookOpenCheck className="w-10 h-10 text-green-200" />
        </div>
        <div className="absolute bottom-2 right-8 opacity-20">
          <Pencil className="w-8 h-8 text-emerald-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-green-200/40 text-xl">📝</div>
      </>
    ),
    pattern: "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)"
  },

  // Maths In Charge - Cool Teal with Math Symbols
  "maths in charge": {
    gradient: "from-teal-500 via-cyan-600 to-blue-700",
    gradientHover: "from-teal-400 via-cyan-500 to-blue-600",
    icon: <Calculator className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-teal-300/40",
    glowColor: "shadow-teal-500/40",
    accentColor: "text-teal-200",
    badge: "🔢 Maths",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-25">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-1 right-1 text-teal-200/40 font-mono text-3xl font-bold">π</div>
        <div className="absolute top-10 right-10 text-cyan-200/35 font-mono text-2xl font-bold">Σ</div>
        <div className="absolute bottom-2 right-2 text-blue-200/40 font-mono text-3xl font-bold">√</div>
        <div className="absolute bottom-10 right-14 text-teal-200/30 font-mono text-xl font-bold">x²</div>
        <div className="absolute top-14 right-2 opacity-15">
          <Ruler className="w-8 h-8 text-cyan-200" />
        </div>
      </>
    ),
    pattern: "radial-gradient(circle at 90% 90%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)"
  },

  // ==================== GENDER SECTIONS ====================

  // Girls In Charge - Beautiful Pink & Purple
  "girls in charge": {
    gradient: "from-pink-400 via-rose-500 to-purple-600",
    gradientHover: "from-pink-300 via-rose-400 to-purple-500",
    icon: <Flower2 className="w-7 h-7" />,
    iconBg: "bg-white/25",
    iconColor: "text-white",
    borderColor: "border-pink-300/50",
    glowColor: "shadow-pink-500/50",
    accentColor: "text-pink-200",
    badge: "🌸 Girls",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Flower2 className="w-10 h-10 text-pink-200" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-25">
          <Heart className="w-8 h-8 text-rose-200 fill-rose-200/30" />
        </div>
        <div className="absolute bottom-2 right-2 text-pink-200/50 text-xl">💖</div>
        <div className="absolute top-10 right-4 text-rose-200/40 text-lg">✨</div>
      </>
    ),
    pattern: "radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)"
  },

  // Boys In Charge - Cool Blue & Cyan
  "boys in charge": {
    gradient: "from-blue-500 via-sky-500 to-cyan-600",
    gradientHover: "from-blue-400 via-sky-400 to-cyan-500",
    icon: <Rocket className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-sky-300/40",
    glowColor: "shadow-blue-500/40",
    accentColor: "text-sky-200",
    badge: "🚀 Boys",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-30">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-25">
          <Rocket className="w-10 h-10 text-sky-200" />
        </div>
        <div className="absolute bottom-2 right-8 opacity-20">
          <Zap className="w-8 h-8 text-cyan-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-sky-200/50 text-xl">⚡</div>
        <div className="absolute top-10 right-4 text-blue-200/40 text-lg">💪</div>
      </>
    ),
    pattern: "radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.25) 0%, transparent 50%)"
  },

  // ==================== SUPPORT ====================

  // Non Teaching In Charge - Warm Gray & Blue
  "non teaching in charge": {
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    gradientHover: "from-slate-400 via-gray-500 to-zinc-600",
    icon: <Building2 className="w-7 h-7" />,
    iconBg: "bg-blue-400/25",
    iconColor: "text-blue-300",
    borderColor: "border-blue-300/40",
    glowColor: "shadow-slate-500/40",
    accentColor: "text-blue-300",
    badge: "🏢 Support",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-20">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-slate-500 rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-20">
          <Building2 className="w-12 h-12 text-blue-300" />
        </div>
        <div className="absolute top-2 right-2 text-blue-300/30 text-lg">🔧</div>
      </>
    ),
    pattern: "radial-gradient(circle at 50% 50%, rgba(100, 116, 139, 0.15) 0%, transparent 50%)"
  },

  // ==================== SOCIAL & MEDIA ====================

  // Social Media In Charge - Rainbow Gradient
  "social media in charge": {
    gradient: "from-pink-500 via-purple-500 to-indigo-600",
    gradientHover: "from-pink-400 via-purple-400 to-indigo-500",
    icon: <Camera className="w-7 h-7" />,
    iconBg: "bg-gradient-to-br from-pink-400/30 to-purple-400/30",
    iconColor: "text-white",
    borderColor: "border-purple-300/50",
    glowColor: "shadow-purple-500/50",
    accentColor: "text-purple-200",
    badge: "📱 Social",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Instagram className="w-8 h-8 text-pink-200" />
        </div>
        <div className="absolute top-10 right-8 opacity-25">
          <Facebook className="w-6 h-6 text-blue-300" />
        </div>
        <div className="absolute bottom-3 right-3 opacity-30">
          <MessageCircle className="w-7 h-7 text-green-300" />
        </div>
        <div className="absolute bottom-8 right-10 text-purple-200/40 text-xl">📸</div>
        <div className="absolute top-3 right-14 text-pink-200/30 text-lg">❤️</div>
      </>
    ),
    pattern: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(99, 102, 241, 0.2) 100%)"
  },

  // ==================== FAMILY ====================

  // Parent - Warm Family Theme with Hearts
  "parent": {
    gradient: "from-rose-500 via-pink-500 to-orange-500",
    gradientHover: "from-rose-400 via-pink-400 to-orange-400",
    icon: <HeartHandshake className="w-7 h-7" />,
    iconBg: "bg-white/25",
    iconColor: "text-white",
    borderColor: "border-rose-300/50",
    glowColor: "shadow-rose-500/50",
    accentColor: "text-rose-200",
    badge: "👨‍👩‍👧 Family",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-28 h-28 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Heart className="w-10 h-10 text-rose-200 fill-rose-200/40" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-25">
          <Home className="w-9 h-9 text-pink-200" />
        </div>
        <div className="absolute top-10 right-4 text-rose-200/50 text-xl">💕</div>
        <div className="absolute bottom-2 right-2 text-orange-200/40 text-lg">🏠</div>
        <div className="absolute top-3 right-14 text-pink-200/35 text-lg">👨</div>
        <div className="absolute bottom-10 right-4 text-rose-200/35 text-lg">👩</div>
      </>
    ),
    pattern: "radial-gradient(circle at 80% 80%, rgba(251, 113, 133, 0.3) 0%, transparent 50%)"
  },

  // ==================== STUDENTS ====================

  // Student - Super Vibrant & Fun
  "student": {
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    gradientHover: "from-green-300 via-emerald-400 to-teal-400",
    icon: <Backpack className="w-7 h-7" />,
    iconBg: "bg-yellow-400/30",
    iconColor: "text-yellow-200",
    borderColor: "border-green-300/50",
    glowColor: "shadow-green-500/50",
    accentColor: "text-green-200",
    badge: "🎒 Student",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <BookOpen className="w-10 h-10 text-green-200" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-25">
          <Pencil className="w-7 h-7 text-emerald-200" />
        </div>
        <div className="absolute top-10 right-4 opacity-25">
          <GraduationCap className="w-8 h-8 text-teal-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-green-200/50 text-xl">📚</div>
        <div className="absolute top-3 right-14 text-emerald-200/40 text-lg">✏️</div>
        <div className="absolute bottom-10 right-4 text-teal-200/35 text-lg">🌟</div>
      </>
    ),
    pattern: "radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.3) 0%, transparent 50%)"
  },

  // ==================== NEW CATEGORIES ====================

  // Part Time Job - Energetic Orange & Yellow
  "part time job": {
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    gradientHover: "from-orange-300 via-amber-400 to-yellow-400",
    icon: <Coffee className="w-7 h-7" />,
    iconBg: "bg-white/25",
    iconColor: "text-white",
    borderColor: "border-amber-300/50",
    glowColor: "shadow-amber-500/50",
    accentColor: "text-amber-200",
    badge: "💼 Part-Time",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <Briefcase className="w-10 h-10 text-amber-200" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-25">
          <Clock className="w-8 h-8 text-yellow-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-amber-200/50 text-xl">⏰</div>
        <div className="absolute top-10 right-4 text-orange-200/40 text-lg">💰</div>
        <div className="absolute top-3 right-14 text-yellow-200/35 text-lg">☕</div>
      </>
    ),
    pattern: "radial-gradient(circle at 70% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)"
  },

  // Internship - Fresh & Modern
  "internship": {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    gradientHover: "from-violet-400 via-purple-400 to-fuchsia-500",
    icon: <Rocket className="w-7 h-7" />,
    iconBg: "bg-white/20",
    iconColor: "text-white",
    borderColor: "border-violet-300/50",
    glowColor: "shadow-violet-500/50",
    accentColor: "text-violet-200",
    badge: "🚀 Intern",
    decorativeElements: (
      <>
        <div className="absolute top-0 right-0 opacity-35">
          <div className="w-28 h-28 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-2 right-2 opacity-30">
          <TrendingUp className="w-10 h-10 text-violet-200" />
        </div>
        <div className="absolute bottom-3 right-8 opacity-25">
          <Lightbulb className="w-8 h-8 text-purple-200" />
        </div>
        <div className="absolute top-10 right-4 opacity-25">
          <Target className="w-7 h-7 text-fuchsia-200" />
        </div>
        <div className="absolute bottom-2 right-2 text-violet-200/50 text-xl">💡</div>
        <div className="absolute top-3 right-14 text-purple-200/40 text-lg">📈</div>
        <div className="absolute bottom-10 right-4 text-fuchsia-200/35 text-lg">🎯</div>
      </>
    ),
    pattern: "radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)"
  }
};

// Default design for unknown categories - Colorful default
const DEFAULT_DESIGN: CategoryDesign = {
  gradient: "from-slate-600 via-gray-600 to-zinc-700",
  gradientHover: "from-slate-500 via-gray-500 to-zinc-600",
  icon: <Folder className="w-7 h-7" />,
  iconBg: "bg-blue-400/25",
  iconColor: "text-blue-300",
  borderColor: "border-blue-400/40",
  glowColor: "shadow-slate-500/40",
  accentColor: "text-blue-300",
  badge: "📂 Category",
  decorativeElements: (
    <>
      <div className="absolute top-0 right-0 opacity-20">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-slate-500 rounded-full blur-xl" />
      </div>
      <div className="absolute bottom-2 right-2 opacity-20">
        <Folder className="w-12 h-12 text-blue-300" />
      </div>
    </>
  ),
  pattern: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)"
};

// Get design for a category - checks predefined list, falls back to default
const getCategoryDesign = (name: string): CategoryDesign => {
  const normalizedName = name.toLowerCase().trim();

  // Check for exact match first
  if (CATEGORY_DESIGNS[normalizedName]) {
    return CATEGORY_DESIGNS[normalizedName];
  }

  // Check for partial matches
  for (const [key, design] of Object.entries(CATEGORY_DESIGNS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return design;
    }
  }

  return DEFAULT_DESIGN;
};

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================

interface CategoryCardProps {
  category: RuleCategory;
  bookCount: number;
  subCategoryCount: number;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  bookCount,
  subCategoryCount,
  onClick
}) => {
  const design = getCategoryDesign(category.category_name);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden
        p-5 sm:p-6 rounded-2xl sm:rounded-3xl
        bg-gradient-to-br ${design.gradient}
        border ${design.borderColor}
        cursor-pointer
        transition-all duration-300 ease-out
        hover:shadow-xl hover:${design.glowColor}
        group
        min-h-[160px] sm:min-h-[180px]
      `}
      style={{
        backgroundImage: design.pattern
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Decorative elements */}
      {design.decorativeElements}

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-2xl sm:rounded-3xl`} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top section */}
        <div className="space-y-3">
          {/* Icon and Badge row */}
          <div className="flex items-start justify-between">
            <motion.div
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl
                ${design.iconBg} ${design.iconColor}
                flex items-center justify-center
                border ${design.borderColor}
                shadow-lg
                group-hover:scale-110 group-hover:rotate-3
                transition-all duration-300
              `}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {design.icon}
            </motion.div>

            {/* Badge */}
            <span className={`
              text-[9px] sm:text-[10px] uppercase tracking-wider font-bold
              px-2 py-1 rounded-full
              bg-white/10 ${design.accentColor}
              border border-white/10
            `}>
              {design.badge}
            </span>
          </div>

          {/* Category name */}
          <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight line-clamp-2 group-hover:text-white/90 transition-colors">
            {category.category_name}
          </h3>
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between mt-4">
          {/* Count info */}
          <div className={`text-xs font-mono font-semibold ${design.accentColor} uppercase tracking-wider`}>
            {subCategoryCount > 0 ? (
              <span>{subCategoryCount} Sub-Categories</span>
            ) : (
              <span>{bookCount} Handbooks</span>
            )}
          </div>

          {/* Arrow button */}
          <motion.div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-xl
              bg-white/10 backdrop-blur-sm
              flex items-center justify-center
              ${design.accentColor}
              border border-white/10
              group-hover:bg-white/20 group-hover:border-white/20
              transition-all duration-300
            `}
            whileHover={{ x: 3 }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
        </div>
      </div>

      {/* Ripple effect overlay */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-white/10 transition-opacity duration-150" />
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CategoriesViewProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  onSelectBook: (id: string) => void;
  user: any;
  setView: (view: ViewType) => void;
}

export default function CategoriesView({ showToast, onSelectBook, user, setView }: CategoriesViewProps) {
  const isAdmin = user?.role === "Administrator";
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [books, setBooks] = useState<RuleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Drill-down states
  const [path, setPath] = useState<RuleCategory[]>([]);
  const currentCategory = path.length > 0 ? path[path.length - 1] : null;

  const handleBack = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await apiFetch("/api/method/rule_management.rule_management.api.get_assigned_rule_categories");
        const catData = await catRes.json();
        if (catData.status === "success") {
          setCategories(catData.data);
        } else {
          showToast(catData.message || "Failed to load categories.", "error");
        }

        const booksRes = await apiFetch("/api/method/rule_management.rule_management.api.get_rule_books");
        const booksData = await booksRes.json();
        if (booksData.status === "success") {
          setBooks(booksData.data);
        }
      } catch (err) {
        console.error(err);
        showToast("Error retrieving categories list.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter books inside current category
  const filteredBooks = currentCategory
    ? books.filter((b) => b.rule_category === currentCategory.category_name)
    : [];

  const subCategories = currentCategory
    ? categories.filter((c) => c.parent_category === currentCategory.category_name)
    : [];

  const topCategories = categories.filter((c) => c.is_parent === 1);

  // Global search through all books
  const searchedBooks = searchQuery.trim()
    ? books.filter(
        (b) =>
          b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.rule_category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-900 pb-5">
        <div className="flex items-center gap-3">
          {currentCategory && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">
              {currentCategory ? currentCategory.category_name : "Operational Directory"}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
              {currentCategory ? (subCategories.length > 0 ? "Sub Categories" : "Training Handbooks") : "Rule Book Categories"}
            </h2>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="relative max-w-xs w-full sm:w-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search all rule books..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentCategory) setPath([]);
            }}
            className="w-full sm:w-64 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 font-sans tracking-wide transition-all duration-300 gold-glow-focus shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gold/15"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Loading rules database...</p>
        </div>
      ) : searchQuery.trim() ? (
        /* Render Search Results */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gold">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Search Results ({searchedBooks.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchedBooks.map((book) => {
              const design = getCategoryDesign(book.rule_category);
              return (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectBook(book.id)}
                  className={`
                    p-5 rounded-2xl
                    bg-gradient-to-br ${design.gradient}
                    border ${design.borderColor}
                    cursor-pointer transition-all duration-300
                    flex items-center justify-between group
                    shadow-lg hover:shadow-xl
                  `}
                >
                  <div className="space-y-2 flex-1 pr-4">
                    <span className={`text-[9px] uppercase tracking-wider ${design.accentColor} bg-white/10 px-2 py-0.5 rounded-full font-mono font-semibold inline-block`}>
                      {book.rule_category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-white group-hover:text-white/90 transition-colors line-clamp-1 leading-snug">
                      {book.book_title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">{book.rules?.length || 0} Rule clauses</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${design.accentColor} group-hover:bg-white/20 transition-all duration-300 shadow-lg`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>
              );
            })}

            {searchedBooks.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-950/50">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-mono">No matching rule books discovered.</p>
              </div>
            )}
          </div>
        </div>
      ) : currentCategory && subCategories.length === 0 ? (
        /* Render Books inside Selected Category */
        <div className="space-y-6">
          {/* Category header */}
          {(() => {
            const design = getCategoryDesign(currentCategory.category_name);
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  relative overflow-hidden
                  p-4 sm:p-5 rounded-2xl
                  bg-gradient-to-br ${design.gradient}
                  border ${design.borderColor}
                  flex gap-4 items-center
                  shadow-xl
                `}
                style={{ backgroundImage: design.pattern }}
              >
                {design.decorativeElements}
                <div className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${design.iconBg} border ${design.borderColor} flex items-center justify-center ${design.iconColor} shrink-0 shadow-lg`}>
                  {design.icon}
                </div>
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-display font-bold text-white">{currentCategory.category_name}</h4>
                    <span className={`text-[9px] uppercase tracking-wider ${design.accentColor} bg-white/10 px-2 py-0.5 rounded-full font-mono font-semibold`}>
                      {filteredBooks.length} Books
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBooks.map((book, index) => {
              const design = getCategoryDesign(currentCategory.category_name);
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectBook(book.id)}
                  className={`
                    p-5 rounded-2xl
                    bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950
                    border border-gray-800 hover:${design.borderColor}
                    cursor-pointer transition-all duration-300
                    flex items-center justify-between group
                    shadow-lg hover:shadow-xl
                  `}
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <h4 className={`font-display font-bold text-sm text-gray-200 group-hover:${design.accentColor} transition-colors line-clamp-1 leading-snug`}>
                      {book.book_title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">{book.rules?.length || 0} Rule clauses defined</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 group-hover:${design.iconBg} group-hover:${design.iconColor} transition-all duration-300 shadow`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </motion.div>
              );
            })}

            {filteredBooks.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-950/50">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-mono">No rule books listed in this category yet.</p>
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView("admin-books")}
                    className="mt-4 px-5 py-2.5 bg-gradient-to-r from-gold/20 to-amber-500/20 hover:from-gold hover:to-amber-500 text-gold hover:text-black rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 border border-gold/30 hover:border-transparent shadow-lg"
                  >
                    + Create Rule Book
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Render Categories Grid - 2 Column Layout */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5"
        >
          {(currentCategory ? subCategories : topCategories).map((cat, index) => {
            const catBookCount = books.filter((b) => b.rule_category === cat.category_name).length;
            const catSubCount = categories.filter((c) => c.parent_category === cat.category_name).length;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryCard
                  category={cat}
                  bookCount={catBookCount}
                  subCategoryCount={catSubCount}
                  onClick={() => setPath((prev) => [...prev, cat])}
                />
              </motion.div>
            );
          })}

          {(currentCategory ? subCategories : topCategories).length === 0 && (
            <div className="col-span-2 py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-950/50">
              <FolderLock className="w-14 h-14 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-mono">No categories found.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
