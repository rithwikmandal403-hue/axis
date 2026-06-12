"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  settings: (
    <svg className="size-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  analytics: (
    <svg className="size-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  time: (
    <svg className="size-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export default function AdoptPage() {
  const [theme, setTheme] = useState("dark");
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    role: "",
    email: "",
    studentCount: "",
    country: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const trialRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Sync theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("axis-theme") || "dark";
      setTheme(savedTheme);
    }
  }, []);

  const styling = useMemo(() => {
    return {
      dark: {
        bg: "bg-[#0A0A0B]",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        cardBg: "bg-zinc-900/60 border-zinc-800 backdrop-blur-xl",
        highlightCardBg: "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)]",
        highlightText: "text-cyan-400",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        border: "border-zinc-800",
        inputBg: "bg-zinc-950 border-zinc-800 focus:border-cyan-500",
        buttonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold",
        buttonSecondary: "border-zinc-800 hover:bg-zinc-800 text-zinc-300",
        tableHeader: "bg-zinc-900/80 text-zinc-200 border-zinc-800",
        tableRowEven: "bg-zinc-900/20",
      },
      light: {
        bg: "bg-[#F9FAFB]",
        textPrimary: "text-zinc-900",
        textSecondary: "text-zinc-500",
        cardBg: "bg-white border-zinc-200 shadow-sm",
        highlightCardBg: "bg-white border-cyan-500 shadow-md ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.08)]",
        highlightText: "text-cyan-600",
        badge: "bg-cyan-50/70 text-cyan-700 border-cyan-500/20",
        border: "border-zinc-200",
        inputBg: "bg-zinc-50 border-zinc-200 focus:border-cyan-500 text-zinc-900",
        buttonPrimary: "bg-cyan-600 hover:bg-cyan-500 text-white font-bold",
        buttonSecondary: "border-zinc-300 hover:bg-zinc-100 text-zinc-700",
        tableHeader: "bg-zinc-100 text-zinc-800 border-zinc-200",
        tableRowEven: "bg-zinc-50/50",
      },
      "high-contrast": {
        bg: "bg-black",
        textPrimary: "text-white",
        textSecondary: "text-zinc-300",
        cardBg: "bg-black border-2 border-white",
        highlightCardBg: "bg-black border-4 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]",
        highlightText: "text-white font-bold",
        badge: "border border-white text-white bg-black",
        border: "border-2 border-white",
        inputBg: "bg-black border-2 border-white focus:ring-2 focus:ring-white focus:outline-none text-white",
        buttonPrimary: "bg-white hover:bg-zinc-200 text-black font-extrabold border-2 border-white",
        buttonSecondary: "border-2 border-white bg-black hover:bg-zinc-950 text-white font-bold",
        tableHeader: "bg-zinc-950 text-white border-2 border-white",
        tableRowEven: "bg-zinc-950/40",
      },
      axis: {
        bg: "bg-[#050607]",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        cardBg: "bg-[#0A0D14]/80 border-cyan-950/80 backdrop-blur-xl",
        highlightCardBg: "bg-[#091522]/90 border-cyan-400/40 shadow-[0_0_60px_rgba(34,211,238,0.25)]",
        highlightText: "text-cyan-400",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        border: "border-cyan-950/40",
        inputBg: "bg-[#05080E] border-cyan-950/80 focus:border-cyan-400 text-cyan-100",
        buttonPrimary: "bg-cyan-400 hover:bg-cyan-300 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]",
        buttonSecondary: "border-cyan-400/20 hover:bg-cyan-400/5 text-cyan-300",
        tableHeader: "bg-[#0D121B] text-cyan-200 border-cyan-950/40",
        tableRowEven: "bg-[#0D121B]/40",
      },
    }[theme as "dark" | "light" | "high-contrast" | "axis"] || {
      bg: "bg-[#0A0A0B]",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      cardBg: "bg-zinc-900/60 border-zinc-800 backdrop-blur-xl",
      highlightCardBg: "bg-cyan-950/20 border-cyan-500/40",
      highlightText: "text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      border: "border-zinc-800",
      inputBg: "bg-zinc-950 border-zinc-800 focus:border-cyan-500",
      buttonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold",
      buttonSecondary: "border-zinc-800 hover:bg-zinc-800 text-zinc-300",
      tableHeader: "bg-zinc-900/80 text-zinc-200 border-zinc-800",
      tableRowEven: "bg-zinc-900/20",
    };
  }, [theme]);

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement | null>, planName?: string) => {
    if (planName) {
      setSelectedPlan(planName);
      setFormData(prev => ({
        ...prev,
        message: `Hi, we would like to activate a trial for the ${planName}.`,
      }));
    }
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.institution || !formData.email || !formData.studentCount) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1500);
  };

  const comparisonFeatures = [
    { name: "Messaging", core: "✓ Basic Channels", school: "✓ Connected Channels", enterprise: "✓ Unlimited + Audited" },
    { name: "Meetings", core: "✓ Standard Call (40m)", school: "✓ Dedicated Virtual Rooms", enterprise: "✓ Enterprise Broadcast" },
    { name: "Attendance", core: "✓ Manual Entry", school: "✓ Bluetooth Attendance Sync", enterprise: "✓ Direct SIS Writeback" },
    { name: "Calendar", core: "✓ Basic View", school: "✓ Connected Class Schedules", enterprise: "✓ Multi-campus Sync" },
    { name: "Announcements", core: "✓ Basic Feed", school: "✓ Targeted Announcements", enterprise: "✓ Multi-tier Hierarchy" },
    { name: "Workspace", core: "—", school: "✓ Co-authoring Drafts", enterprise: "✓ District-wide Workspace" },
    { name: "Tasks & Notes", core: "—", school: "✓ Private Task List & Notes", enterprise: "✓ Managed Campus Spaces" },
    { name: "Attention", core: "—", school: "✓ Daily Notifications & Updates", enterprise: "✓ Full Coordination Map" },
    { name: "Resources", core: "—", school: "✓ Google & Microsoft Integration", enterprise: "✓ Custom API / SIS Integration" },
    { name: "Campus Maps", core: "—", school: "✓ Basic Room Database", enterprise: "✓ Custom Room Mapping" },
    { name: "Advanced Reporting", core: "—", school: "✓ Department Metrics", enterprise: "✓ Custom District Dashboards" },
    { name: "Enterprise Support", core: "—", school: "—", enterprise: "✓ Dedicated Account SLA" },
    { name: "Integrations", core: "Google / MS Basics", school: "Standard LMS / SIS", enterprise: "Custom API & SSO" },
  ];

  return (
    <div className={`min-h-screen w-full font-sans antialiased transition-colors duration-500 pb-24 ${styling.bg} ${styling.textPrimary}`}>
      
      {/* ─── STICKY HEADER & CALL TO ACTIONS BAR ─────────────────────────────────── */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
        theme === "light" ? "bg-white/80 border-zinc-200" : "bg-[#0A0A0B]/80 border-white/5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/school/experience/demo?role=teacher" 
              className={`text-xs flex items-center gap-1.5 transition-colors ${styling.textSecondary} hover:${styling.textPrimary}`}
            >
              ← Back to Demo Console
            </Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Adoption Center</span>
          </div>

          {/* PERSISTENT ACTIONS BAR */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScrollTo(trialRef)}
              className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white"
            >
              Request Trial
            </button>
            <button
              onClick={() => handleScrollTo(demoRef)}
              className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white"
            >
              Schedule Demo
            </button>
            <button
              onClick={() => handleScrollTo(contactRef)}
              className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all"
            >
              Contact Specialist
            </button>
          </div>
        </div>
      </header>

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 h-[600px]"
        style={{
          background: "radial-gradient(circle 800px at 50% -200px, rgba(34,211,238,0.04) 0%, transparent 80%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-12 space-y-24">
        
        {/* ─── SECTION 1: HERO HEADER ───────────────────────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="space-y-4">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${styling.badge}`}>
              Institutional Adoption Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Bring Axis To Your School
            </h1>
            <p className={`text-base md:text-lg leading-relaxed ${styling.textSecondary}`}>
              Explore how Axis can support your entire school in one connected workspace.
            </p>
          </div>
        </section>

        {/* ─── SECTION 2: WHY SCHOOLS ADOPT AXIS ─────────────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-wider">Why Schools Adopt Axis</h2>
            <p className={`text-xs ${styling.textSecondary}`}>
              How Axis helps coordinators, teachers, and school leadership work together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Connected Workflows",
                subtitle: "Everything in one place",
                desc: "Instead of jumping between isolated grading, messaging, and scheduling systems, teachers coordinate everything inside a single workspace.",
                metric: "-40%",
                metricLabel: "Staff Tool Switching",
                icon: "settings"
              },
              {
                title: "Coordinator Overview",
                subtitle: "Real-time campus updates",
                desc: "School coordinators and leadership gain instant visibility into room changes, attendance updates, and coverage schedules without manual checks.",
                metric: "100%",
                metricLabel: "On-Time Coordination",
                icon: "analytics"
              },
              {
                title: "Automated Daily Tasks",
                subtitle: "Bluetooth & schedule sync",
                desc: "Axis connects room bookings and class timetables automatically. Teachers can verify student attendance in seconds using Bluetooth sync.",
                metric: "15 min",
                metricLabel: "Saved Per Class Daily",
                icon: "time"
              }
            ].map((card, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border ${styling.cardBg} flex flex-col justify-between space-y-6`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl flex items-center justify-center">{PLAN_ICONS[card.icon]}</span>
                    <span className="text-xs text-cyan-400 font-mono tracking-widest font-bold">0{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">{card.title}</h3>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">{card.subtitle}</p>
                  </div>
                  <p className={`text-xs leading-relaxed ${styling.textSecondary}`}>{card.desc}</p>
                </div>

                <div className="pt-4 border-t border-white/[0.04] flex items-baseline gap-2">
                  <span className="text-2xl font-black text-cyan-400 tracking-tight">{card.metric}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${styling.textSecondary}`}>{card.metricLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 3: PRICING PLANS ─────────────────────────────────────────── */}
        <section className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-wider">Deployment Tiers</h2>
            <p className={`text-xs ${styling.textSecondary}`}>
              Standardized tiers to match the operational size and requirements of your institution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch px-2">
            {/* AXIS CORE */}
            <div className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.01] ${styling.cardBg}`}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Plan 01</span>
                  <h3 className="text-lg font-bold">AXIS CORE PLAN</h3>
                  <p className={`text-xs ${styling.textSecondary}`}>Connected messaging, calendar, attendance, and announcements.</p>
                </div>

                <div className="py-2 border-y border-white/[0.04] flex items-baseline gap-1">
                  <span className="text-2xl font-black">₹499</span>
                  <span className={`text-xs ${styling.textSecondary}`}>/ Student / Year</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs font-medium text-white/70">
                  {["✓ Messaging Channels", "✓ Virtual Rooms & Calls", "✓ Basic Attendance Logs", "✓ Announcements Feed", "✓ Notifications & Alerts", "✓ Basic Reporting", "✓ Guided Onboarding", "✓ Google Workspace Integration"].map(feat => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className={theme === "light" ? "text-zinc-700" : "text-zinc-300"}>{feat.replace("✓ ", "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <div className="text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">14-Day Free Trial</div>
                <button
                  onClick={() => handleScrollTo(trialRef, "Axis Core Plan")}
                  className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider border font-bold ${styling.buttonSecondary}`}
                >
                  Start Trial
                </button>
              </div>
            </div>

            {/* AXIS SCHOOL (MIDDLE - HIGHLIGHTED) */}
            <div className={`rounded-3xl border p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.02] md:-translate-y-2 relative z-10 ${styling.highlightCardBg}`}>
              <div className="absolute top-0 right-6 -translate-y-1/2 flex items-center gap-1.5">
                <span className="bg-cyan-500 text-black font-black uppercase text-[8px] tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </span>
                <span className="bg-white text-black font-black uppercase text-[8px] tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Plan 02</span>
                  <h3 className="text-xl font-black tracking-tight">AXIS SCHOOL PLAN</h3>
                  <p className={`text-xs ${styling.textSecondary}`}>Complete connected workspace with messaging, Bluetooth attendance, custom scheduling, and parent views.</p>
                </div>

                <div className="py-2 border-y border-cyan-500/10 flex items-baseline gap-1">
                  <span className="text-3xl font-black">₹999</span>
                  <span className={`text-xs ${styling.textSecondary}`}>/ Student / Year</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs font-semibold">
                  {[
                    "✓ Everything in Core Plan",
                    "✓ Private Tasks & Notes",
                    "✓ Co-authoring Drafts",
                    "✓ Bluetooth Attendance Sync",
                    "✓ Daily Updates & Announcements",
                    "✓ School Room Scheduling",
                    "✓ Department Workloads & Rosters",
                    "✓ LMS & Calendar Sync",
                    "✓ Resource Usage Reports",
                  ].map(feat => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="text-cyan-400">✓</span>
                      <span className={theme === "light" ? "text-cyan-900" : "text-cyan-200"}>{feat.replace("✓ ", "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <div className="text-center text-[10px] text-cyan-400 font-bold uppercase tracking-wider">30-Day Free Trial</div>
                <button
                  onClick={() => handleScrollTo(trialRef, "Axis School Plan")}
                  className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-102 font-bold ${styling.buttonPrimary}`}
                >
                  Start School Trial
                </button>
              </div>
            </div>

            {/* AXIS NETWORK */}
            <div className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.01] ${styling.cardBg}`}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Plan 03</span>
                  <h3 className="text-lg font-bold">AXIS NETWORK PLAN</h3>
                  <p className={`text-xs ${styling.textSecondary}`}>Custom deployment plans for multi-campus networks, groups, and districts.</p>
                </div>

                <div className="py-2 border-y border-white/[0.04] flex items-baseline gap-1">
                  <span className="text-2xl font-black">Custom Pricing</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs font-medium text-white/70">
                  {["✓ Multi-Campus Dashboard", "✓ District Analytics System", "✓ Custom SIS / LMS Connectors", "✓ Active Directory / SSO", "✓ Dedicated Customer Success", "✓ Custom Evaluation Setup", "✓ White-Glove Data Load", "✓ 24/7 Priority Support SLA"].map(feat => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className={theme === "light" ? "text-zinc-700" : "text-zinc-300"}>{feat.replace("✓ ", "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <div className="text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">60-Day Evaluation Trial</div>
                <button
                  onClick={() => handleScrollTo(trialRef, "Axis Network Plan")}
                  className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider border font-bold ${styling.buttonSecondary}`}
                >
                  Request Consultation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: FEATURE COMPARISON MATRIX ─────────────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-wider">Feature Comparison Matrix</h2>
            <p className={`text-xs ${styling.textSecondary}`}>
              A comprehensive breakdown of specific workspace tools and automation layers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${styling.border} ${styling.tableHeader}`}>
                  <th className="p-4 font-bold">Capabilities</th>
                  <th className="p-4 font-bold text-center">Axis Core Plan</th>
                  <th className="p-4 font-bold text-center text-cyan-400">Axis School Plan</th>
                  <th className="p-4 font-bold text-center">Axis Network Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {comparisonFeatures.map((feat, index) => (
                  <tr key={index} className={index % 2 === 0 ? styling.tableRowEven : ""}>
                    <td className="p-4 font-semibold text-white/80">{feat.name}</td>
                    <td className="p-4 text-center text-white/60 font-sans">{feat.core}</td>
                    <td className="p-4 text-center text-cyan-400 font-bold font-sans">{feat.school}</td>
                    <td className="p-4 text-center text-white/70 font-sans">{feat.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── SECTION 5: TRIAL PROGRAM FORM ───────────────────────────────────────── */}
        <section ref={trialRef} className={`max-w-2xl mx-auto p-8 rounded-3xl border bg-white/[0.01] ${styling.border} space-y-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 size-48 bg-cyan-500/5 blur-[50px] pointer-events-none rounded-full" />
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Trial Evaluation Program</h2>
            <p className={`text-xs ${styling.textSecondary}`}>
              No credit card required. Evaluate Axis using realistic school workflows and sample datasets.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!submitSuccess ? (
              <motion.form
                key="trial-form"
                onSubmit={handleFormSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {selectedPlan && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex justify-between items-center text-cyan-400">
                    <span>Selected Plan Option: <strong>{selectedPlan}</strong></span>
                    <button type="button" onClick={() => setSelectedPlan(null)} className="text-[10px] hover:underline">Clear selection</button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Aarav Chen"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.institution}
                      onChange={e => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="e.g. Axis International School"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Role / Designation *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    >
                      <option value="" disabled>Select your role</option>
                      <option value="Teacher">Educator / Master Teacher</option>
                      <option value="Coordinator">Department Coordinator</option>
                      <option value="Head of School">Head of School / Director</option>
                      <option value="IT Manager">IT Administrator</option>
                      <option value="Other">Other Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. aarav.chen@school.edu"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Student Count *</label>
                    <input
                      type="number"
                      required
                      value={formData.studentCount}
                      onChange={e => setFormData(prev => ({ ...prev, studentCount: e.target.value }))}
                      placeholder="e.g. 500"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g. India"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all ${styling.inputBg}`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Message / Trial Scope (Optional)</label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe any custom SIS integrations or timetable constraints you would like to evaluate."
                    rows={4}
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none transition-all resize-none ${styling.inputBg}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 mt-2 flex items-center justify-center gap-2 ${styling.buttonPrimary}`}
                >
                  {isSubmitting ? "Processing Request..." : "Request Trial Activation"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                className="text-center py-12 px-6 space-y-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400 mx-auto">✓</div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold">Request Received.</h4>
                  <p className={`text-xs ${styling.textSecondary} leading-relaxed max-w-sm mx-auto`}>
                    An Axis specialist will contact you at <strong>{formData.email}</strong> to set up a personalized evaluation environment for <strong>{formData.institution}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({ name: "", institution: "", role: "", email: "", studentCount: "", country: "", message: "" });
                    setSelectedPlan(null);
                  }}
                  className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase border ${styling.buttonSecondary}`}
                >
                  Submit Another Request
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─── SECTION 6: GUIDED DEMONSTRATION ───────────────────────────────────── */}
        <section ref={demoRef} className={`max-w-4xl mx-auto p-8 rounded-3xl border bg-white/[0.01] ${styling.border} grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-center`}>
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Expert Demonstration</span>
            <h2 className="text-xl font-bold tracking-tight">Schedule A Guided Demonstration</h2>
            <p className={`text-xs leading-relaxed ${styling.textSecondary}`}>
              Work 1-on-1 with a school implementation specialist to walk through classroom scheduling, room setup, attendance updates, parent notifications, and campus overview tools.
            </p>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="flex items-center gap-2">
                <svg className="size-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.64-.5-8.143-1.418m16.286 0A11.95 11.95 0 0012 10.5c2.905 0 5.64.5 8.143 1.418m-16.286 0C5.07 10.2 8.4 10 12 10s6.93.2 8.143.418" />
                </svg>
                <span>Live SIS / Active Directory setup advice</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5a1.5 1.5 0 011.5 1.5V21a1.5 1.5 0 01-1.5 1.5H10.5A1.5 1.5 0 019 21V3a1.5 1.5 0 011.5-1.5z" />
                </svg>
                <span>Sandbox roster uploading verification</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>Privacy and security compliance walkthrough</span>
              </li>
            </ul>
          </div>
          
          <div className={`p-6 rounded-2xl border ${styling.cardBg} text-center space-y-4`}>
            <p className="text-xs font-semibold">Ready to review Axis with your leadership team?</p>
            <button
              onClick={() => alert("Redirecting to the expert meeting booking system...")}
              className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${styling.buttonPrimary}`}
            >
              Book 1-on-1 Demonstration
            </button>
            <p className={`text-[9px] ${styling.textSecondary}`}>Slots available Monday - Friday · 30-minute block</p>
          </div>
        </section>

        {/* ─── SECTION 7: CONTACT AN AXIS SPECIALIST ───────────────────────────────── */}
        <section ref={contactRef} className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold uppercase tracking-wider">Contact An Axis Specialist</h2>
            <p className={`text-xs ${styling.textSecondary}`}>
              Get assistance with security audits, licensing proposals, custom district integrations, or compliance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { title: "SSO & IT Support", desc: "Consult on AD, SAML, and student databases.", label: "Read Tech Spec", action: () => alert("Opening SSO spec portal...") },
              { title: "District Sales", desc: "Request volume proposals for multi-campus groups.", label: "Contact Sales", action: () => alert("Connecting with District Sales...") },
              { title: "Compliance Check", desc: "Review COPPA, FERPA, GDPR, and security rules.", label: "View Policy", action: () => alert("Opening compliance documentation...") },
              { title: "General Inquiry", desc: "Speak directly with an Axis integration coordinator.", label: "Consult Coordinator", action: () => alert("Opening consultation request chat...") },
            ].map((box, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border text-left ${styling.cardBg} flex flex-col justify-between h-40`}>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-400">{box.title}</h4>
                  <p className={`text-[10px] leading-relaxed ${styling.textSecondary}`}>{box.desc}</p>
                </div>
                <button
                  onClick={box.action}
                  className={`w-full py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${styling.buttonSecondary}`}
                >
                  {box.label}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
