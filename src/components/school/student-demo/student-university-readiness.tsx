"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

type RankTier = {
  letter: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
};

const getRankScale = (isLight: boolean): RankTier[] => [
  {
    letter: "S",
    label: "Exceptional",
    color: isLight ? "text-indigo-600" : "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/10",
  },
  {
    letter: "A",
    label: "Strong",
    color: isLight ? "text-cyan-600" : "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "shadow-cyan-500/10",
  },
  {
    letter: "B",
    label: "Developing",
    color: isLight ? "text-emerald-600" : "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  {
    letter: "C",
    label: "Attention Needed",
    color: isLight ? "text-amber-600" : "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  {
    letter: "D",
    label: "Critical",
    color: isLight ? "text-rose-600" : "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/10",
  },
];

const currentRank = "A";

type Strength = {
  label: string;
  value: number;
  color: string;
  trackColor: string;
  note?: string;
};

const getStrengths = (isLight: boolean): Strength[] => [
  { label: "Academic Record", value: 78, color: "bg-cyan-500", trackColor: isLight ? "bg-cyan-500/10" : "bg-cyan-500/10" },
  { label: "Extracurriculars", value: 65, color: "bg-emerald-500", trackColor: isLight ? "bg-emerald-500/10" : "bg-emerald-500/10" },
  { label: "CAS Portfolio", value: 72, color: "bg-violet-500", trackColor: isLight ? "bg-violet-500/10" : "bg-violet-500/10" },
  {
    label: "Extended Essay",
    value: 45,
    color: "bg-amber-500",
    trackColor: isLight ? "bg-amber-500/10" : "bg-amber-500/10",
    note: "Needs Attention",
  },
  { label: "TOK", value: 80, color: "bg-cyan-500", trackColor: isLight ? "bg-cyan-500/10" : "bg-cyan-500/10" },
];

type ChecklistItem = {
  label: string;
  status: "complete" | "pending" | "in-progress" | "not-started";
  detail: string;
};

const checklist: ChecklistItem[] = [
  { label: "Personal Statement Draft", status: "complete", detail: "Complete" },
  { label: "Teacher References Requested", status: "complete", detail: "Complete" },
  { label: "SAT/ACT Score Upload", status: "pending", detail: "Pending" },
  { label: "Portfolio Compilation", status: "in-progress", detail: "In Progress" },
  { label: "University Shortlist Created", status: "complete", detail: "Complete" },
  { label: "Financial Aid Research", status: "not-started", detail: "Not Started" },
];

const getStatusConfig = (isLight: boolean) => ({
  complete: {
    icon: "✓",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    iconColor: isLight ? "text-emerald-600" : "text-emerald-400",
    badgeColor: isLight
      ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  pending: {
    icon: "○",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    iconColor: isLight ? "text-amber-600" : "text-amber-400",
    badgeColor: isLight
      ? "text-amber-700 bg-amber-500/10 border-amber-500/20"
      : "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  "in-progress": {
    icon: "◐",
    iconBg: "bg-cyan-500/10",
    iconBorder: "border-cyan-500/20",
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    badgeColor: isLight
      ? "text-cyan-700 bg-cyan-500/10 border-cyan-500/20"
      : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  "not-started": {
    icon: "○",
    iconBg: isLight ? "bg-black/[0.04]" : "bg-white/[0.04]",
    iconBorder: isLight ? "border-black/[0.06]" : "border-white/[0.06]",
    iconColor: isLight ? "text-black/30" : "text-white/20",
    badgeColor: isLight
      ? "text-black/40 bg-black/[0.04] border-black/[0.06]"
      : "text-white/30 bg-white/[0.04] border-white/[0.06]",
  },
});

type University = {
  name: string;
  match: "Strong Match" | "Reach";
  matchColorClass: string;
  matchBgClass: string;
  matchBorderClass: string;
  note: string;
};

const getUniversities = (isLight: boolean): University[] => [
  {
    name: "Imperial College London",
    match: "Strong Match",
    matchColorClass: isLight ? "text-cyan-700" : "text-cyan-400",
    matchBgClass: "bg-cyan-500/10",
    matchBorderClass: "border-cyan-500/20",
    note: "Predicted meets typical offer",
  },
  {
    name: "University of Edinburgh",
    match: "Strong Match",
    matchColorClass: isLight ? "text-cyan-700" : "text-cyan-400",
    matchBgClass: "bg-cyan-500/10",
    matchBorderClass: "border-cyan-500/20",
    note: "Predicted meets typical offer",
  },
  {
    name: "MIT",
    match: "Reach",
    matchColorClass: isLight ? "text-amber-700" : "text-amber-400",
    matchBgClass: "bg-amber-500/10",
    matchBorderClass: "border-amber-500/20",
    note: "Predicted slightly below typical offer",
  },
];

export function StudentUniversityReadiness({ theme = "dark" }: { theme?: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const rankScale = getRankScale(isLight);
  const strengths = getStrengths(isLight);
  const statusConfig = getStatusConfig(isLight);
  const universities = getUniversities(isLight);

  // AI chat advisor state
  type Message = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: string;
  };

  type QuickReply = {
    label: string;
    question: string;
    response: string;
  };

  const quickReplies: QuickReply[] = [
    {
      label: "Improve EE Score",
      question: "How do I improve my Extended Essay score?",
      response: "To boost your Extended Essay (currently at 45% progress) to a Level 7 grade:\n\n1. **Finalize Draft**: Aim to complete the remaining sections of your Physics EE and refine the bibliography.\n2. **Primary Sources**: Ensure your analysis relies on primary data. Good secondary references can supplement this.\n3. **Reflections**: Use the researcher's reflection space to prepare for the viva voce interview."
    },
    {
      label: "MIT ECs Alignment",
      question: "What extracurriculars should I add for MIT?",
      response: "MIT looks for deep passion and initiative ('maker' mentality). Since you teach Physics HL and Math AA HL, you could:\n\n1. **Axis Assembly Engine**: Compile your coding projects or lab simulations into a digital portfolio.\n2. **Leadership**: Start a peer tutoring circle or coordinate a school-wide science hackathon.\n3. **Outreach**: Offer physics mentoring to lower grade levels."
    },
    {
      label: "Imperial Checklist",
      question: "Give me a checklist for Imperial College admissions",
      response: "For Imperial College London (Physics HL & Math AA HL target):\n\n1. **Academic Standing**: Maintain your predicted 38+ points (current predicted: 36).\n2. **Admission Test**: Prepare for the ESAT (Engineering and Science Admissions Test).\n3. **Personal Statement**: Ensure 80% is focused on academic passion for Physics, linking to your IA research on Centripetal Forces."
    }
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "ai",
      text: "Hello Chloe! I've analyzed your target universities (Imperial, Edinburgh, MIT) and your profile metrics. Let's make your applications perfect. Here are the key gaps I see:\n\n1. **Extended Essay**: Your EE progress is at 45%. Since Imperial and MIT highly value independent research, we should aim to complete your draft and refine the bibliography.\n\n2. **Extracurriculars**: You're at 65%. For MIT, adding a leadership role or highlighting technical side projects would significantly improve alignment.\n\n3. **SAT/ACT Scores**: Your checklist shows this is pending. If you're submitting scores to MIT, uploading them will finalize your readiness.\n\nHow would you like to proceed? Click a suggestion below or ask me anything!",
      timestamp: "13:24",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (text = inputValue) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userMessage: Message = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let aiReplyText = "That's an excellent question, Chloe. To make your application perfect, I recommend linking your Class Space assignments (like the [Physics IA Draft](file:///c:/Users/ADMIN/Desktop/Axis/src/components/school/student-demo/student-class-space.tsx)) directly to your Personal Statement in the [Application Maker](file:///c:/Users/ADMIN/Desktop/Axis/src/components/school/student-demo/student-application-maker.tsx) as a showcase of your quantitative research skills. This will bridge the gap between your coursework and target admissions.";

      const query = cleanText.toLowerCase();
      if (query.includes("essay") || query.includes("ee")) {
        aiReplyText = "To boost your Extended Essay (currently at 45% progress) to a Level 7 grade:\n\n1. **Finalize Draft**: Aim to complete the remaining sections of your Physics EE and refine the bibliography.\n2. **Primary Sources**: Ensure your analysis relies on primary data. Good secondary references can supplement this.\n3. **Reflections**: Use the researcher's reflection space to prepare for the viva voce interview.";
      } else if (query.includes("mit") || query.includes("extra") || query.includes("leadership")) {
        aiReplyText = "MIT looks for deep passion and initiative ('maker' mentality). Since you teach Physics HL and Math AA HL, you could:\n\n1. **Axis Assembly Engine**: Compile your coding projects or lab simulations into a digital portfolio.\n2. **Leadership**: Start a peer tutoring circle or coordinate a school-wide science hackathon.\n3. **Outreach**: Offer physics mentoring to lower grade levels.";
      } else if (query.includes("imperial") || query.includes("london") || query.includes("checklist")) {
        aiReplyText = "For Imperial College London (Physics HL & Math AA HL target):\n\n1. **Academic Standing**: Maintain your predicted 38+ points (current predicted: 36).\n2. **Admission Test**: Prepare for the ESAT (Engineering and Science Admissions Test).\n3. **Personal Statement**: Ensure 80% is focused on academic passion for Physics, linking to your IA research on Centripetal Forces.";
      } else if (query.includes("sat") || query.includes("act") || query.includes("score")) {
        aiReplyText = "For MIT, standardized test scores (SAT/ACT) are required. If you have taken them, upload the scores via the [Application Maker](file:///c:/Users/ADMIN/Desktop/Axis/src/components/school/student-demo/student-application-maker.tsx) under the test score section. Standardized scores are a crucial part of MIT's quantitative validation.";
      }

      const aiMessage: Message = {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickReply = (qr: QuickReply) => {
    handleSendMessage(qr.question);
  };

  return (
    <div className={`min-h-screen p-6 md:p-10 space-y-8 max-w-5xl mx-auto ${styles.bg} ${styles.textPrimary} transition-colors duration-200`}>
      {/* Overall Readiness Rank */}
      <motion.div
        {...fadeUp(0)}
        className={`relative border rounded-2xl p-10 text-center overflow-hidden ${styles.cardBg}`}
      >
        {/* Ambient glow behind rank */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-cyan-500/[0.04] blur-xl" />
        </div>

        <p className={`text-[10px] uppercase tracking-widest mb-6 font-medium relative z-10 ${styles.textSecondary} opacity-50`}>
          University Readiness Rank
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 mb-5"
        >
          <span className={`text-[120px] leading-none font-black ${isLight ? "text-cyan-600" : "text-cyan-400"} drop-shadow-[0_0_40px_rgba(6,182,212,0.25)]`}>
            A
          </span>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="relative z-10 space-y-2">
          <p className={`text-lg font-semibold tracking-tight ${styles.textPrimary}`}>
            Strong — Well-positioned for target institutions
          </p>
          <p className={`text-sm max-w-lg mx-auto leading-relaxed ${styles.textSecondary} opacity-60`}>
            An A rank indicates strong academic fundamentals and good extracurricular engagement.
            Your profile is competitive for most target institutions, with specific areas to
            strengthen for reach applications.
          </p>
        </motion.div>
      </motion.div>

      {/* College Readiness Explanation Section */}
      <motion.div
        {...fadeUp(0.08)}
        className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.02] p-6 relative overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-cyan-400" />
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">College Readiness Engine & Context Analysis</h4>
        <p className="text-xs text-white/70 leading-relaxed mt-2.5">
          The College Readiness System analyzes academic records, extracurricular achievements, portfolio materials, application content, and historical admissions data associated with selected institutions.
        </p>
        <p className="text-xs text-white/50 leading-relaxed mt-2">
          The system attempts to identify similarities and gaps between the student's profile and previously successful applicants. Results are intended for guidance only, not admissions predictions or guarantees.
        </p>
      </motion.div>

      {/* Rank Scale Reference */}
      <motion.div
        {...fadeUp(0.15)}
        className={`border rounded-2xl p-6 ${styles.cardBg}`}
      >
        <p className={`text-[10px] uppercase tracking-widest mb-5 font-medium ${styles.textSecondary} opacity-50`}>
          Rank Scale
        </p>
        <div className="flex items-stretch gap-2">
          {rankScale.map((tier, i) => {
            const isCurrent = tier.letter === currentRank;
            return (
              <motion.div
                key={tier.letter}
                {...fadeUp(0.18 + i * 0.04)}
                className={`flex-1 rounded-xl p-4 text-center border transition-all ${
                  isCurrent
                    ? `${tier.bg} ${tier.border} shadow-lg ${tier.glow} ring-1 ring-cyan-500/10`
                    : isLight 
                      ? "bg-black/[0.01] border-black/[0.04]" 
                      : "bg-white/[0.02] border-white/[0.04]"
                }`}
              >
                <p
                  className={`text-2xl font-black mb-1 ${
                    isCurrent ? tier.color : isLight ? "text-black/15" : "text-white/15"
                  }`}
                >
                  {tier.letter}
                </p>
                <p
                  className={`text-[10px] font-medium ${
                    isCurrent ? styles.textPrimary : isLight ? "text-black/30" : "text-white/20"
                  }`}
                >
                  {tier.label}
                </p>
                {isCurrent && (
                  <div className="mt-2">
                    <span className={`text-[8px] uppercase tracking-wider font-semibold border px-2 py-0.5 rounded-full ${
                      isLight ? "text-cyan-700 bg-cyan-500/10 border-cyan-500/20" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                    }`}>
                      Current
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Profile Strength Indicators */}
      <motion.div
        {...fadeUp(0.25)}
        className={`border rounded-2xl p-6 ${styles.cardBg}`}
      >
        <p className={`text-[10px] uppercase tracking-widest mb-5 font-medium ${styles.textSecondary} opacity-50`}>
          Profile Strength
        </p>
        <div className="space-y-5">
          {strengths.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(0.28 + i * 0.04)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${styles.textPrimary}`}>{s.label}</span>
                  {s.note && (
                    <span className={`text-[8px] uppercase tracking-wider font-semibold border px-2 py-0.5 rounded-full ${
                      isLight ? "text-amber-700 bg-amber-500/10 border-amber-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {s.note}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium tabular-nums ${styles.textSecondary} opacity-60`}>{s.value}%</span>
              </div>
              <div className={`h-2 rounded-full ${s.trackColor} overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`h-full rounded-full ${s.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Application Readiness Checklist */}
      <motion.div
        {...fadeUp(0.4)}
        className={`border rounded-2xl p-6 ${styles.cardBg}`}
      >
        <p className={`text-[10px] uppercase tracking-widest mb-5 font-medium ${styles.textSecondary} opacity-50`}>
          Application Readiness
        </p>
        <div className="space-y-1">
          {checklist.map((item, i) => {
            const cfg = statusConfig[item.status];
            return (
              <motion.div
                key={item.label}
                {...fadeUp(0.43 + i * 0.03)}
                className={`flex items-center gap-4 py-3 px-3 rounded-xl transition-colors ${
                  isLight ? "hover:bg-black/[0.01]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`text-xs font-bold ${cfg.iconColor}`}>{cfg.icon}</span>
                </div>
                <span className={`flex-1 text-sm font-medium ${styles.textPrimary}`}>{item.label}</span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg border ${cfg.badgeColor}`}
                >
                  {item.detail}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Two Column Section for Target University Alignment & Axis AI Counsel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Target University Alignment */}
        <motion.div {...fadeUp(0.52)} className="space-y-3">
          <p className={`text-[10px] uppercase tracking-widest mb-1 font-medium ${styles.textSecondary} opacity-50`}>
            Target University Alignment
          </p>
          <div className="grid gap-3">
            {universities.map((uni, i) => (
              <motion.div
                key={uni.name}
                {...fadeUp(0.55 + i * 0.05)}
                className={`border rounded-2xl p-5 flex items-center gap-4 ${styles.cardBg}`}
              >
                {/* University icon */}
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                  isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.03] border-white/[0.06]"
                }`}>
                  <svg
                    className={`w-5 h-5 ${isLight ? "text-black/30" : "text-white/20"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${styles.textPrimary}`}>{uni.name}</p>
                  <p className={`text-xs mt-0.5 ${styles.textSecondary} opacity-60`}>{uni.note}</p>
                </div>

                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg border flex-shrink-0 ${uni.matchColorClass} ${uni.matchBgClass} ${uni.matchBorderClass}`}
                >
                  {uni.match}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Axis AI Counsel Chat Window */}
        <motion.div {...fadeUp(0.6)} className="space-y-3">
          <p className={`text-[10px] uppercase tracking-widest mb-1 font-medium ${styles.textSecondary} opacity-50`}>
            Axis AI Counsel — Profile Improver
          </p>
          <div className={`border rounded-2xl flex flex-col h-[380px] overflow-hidden ${styles.cardBg} ${
            isLight ? "border-black/[0.08] shadow-lg bg-white" : "border-white/[0.08] shadow-2xl bg-[#0e0e10]/60"
          }`}>
            {/* Chat Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isLight ? "border-black/[0.06] bg-black/[0.01]" : "border-white/[0.06] bg-white/[0.01]"}`}>
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <div className="size-6 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full border border-[#0A0A0C] animate-pulse" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${styles.textPrimary}`}>Axis AI Counsel</h4>
                  <p className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wider">Application Advisor</p>
                </div>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                isLight ? "bg-black/[0.03] border-black/[0.06] text-black/40" : "bg-white/[0.03] border-white/[0.06] text-white/40"
              }`}>
                Beta
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none text-xs">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 border whitespace-pre-line leading-relaxed ${
                    m.sender === "user"
                      ? isLight
                        ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-800"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                      : isLight
                        ? "bg-black/[0.02] border-black/[0.06] text-black/80"
                        : "bg-white/[0.02] border-white/[0.06] text-white/85"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-3.5 py-2.5 border flex items-center gap-1 ${
                    isLight ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"
                  }`}>
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested quick answers */}
            <div className={`px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-none shrink-0 ${
              isLight ? "border-black/[0.05] bg-black/[0.005]" : "border-white/[0.05] bg-white/[0.005]"
            }`}>
              {quickReplies.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => handleQuickReply(qr)}
                  disabled={isTyping}
                  className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-[10px] font-medium transition-all hover:scale-102 hover:-translate-y-0.5 disabled:opacity-50 disabled:scale-100 disabled:translate-y-0 ${
                    isLight
                      ? "border-black/[0.08] bg-white text-black/60 hover:bg-black/[0.02] hover:text-black/80"
                      : "border-white/[0.08] bg-[#0E0E10] text-white/55 hover:bg-white/[0.02] hover:text-white/75"
                  }`}
                >
                  {qr.label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className={`p-3 border-t flex items-center gap-2 shrink-0 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !isTyping) handleSendMessage(); }}
                disabled={isTyping}
                placeholder="Ask how to improve your application..."
                className={`flex-1 text-xs rounded-xl px-3.5 py-2 outline-none transition-all focus:ring-1 focus:ring-cyan-500/30 ${
                  isLight
                    ? "bg-black/[0.04] border border-black/[0.08] placeholder:text-black/35 text-black"
                    : "bg-white/[0.04] border border-white/[0.08] placeholder:text-white/20 text-white"
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping || !inputValue.trim()}
                className="size-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shrink-0 disabled:opacity-30 disabled:hover:bg-cyan-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Connected Portfolio Achievements (Personal Database Sync) */}
      <motion.div
        {...fadeUp(0.65)}
        className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Portfolio Achievements & Credentials
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold uppercase tracking-wider">
                Personal Database Sync
              </span>
            </h3>
            <p className={`text-[10px] ${styles.textSecondary} opacity-50 mt-1`}>
              Synchronized and indexed documents contributing to your overall application readiness scores.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "damping_calculations.xlsx", size: "124 KB", date: "June 11", type: "Academic Evidence", desc: "Physics HL IA supplementary datasets and calculations.", status: "Verified & Scored" },
            { name: "personal_statement_draft.docx", size: "45 KB", date: "June 10", type: "Application Material", desc: "Target Statement of Purpose draft v2 for review.", status: "Under Review" },
            { name: "cas_reflection_volunteer.txt", size: "4 KB", date: "June 8", type: "CAS Portfolio Evidence", desc: "Community garden leadership log & advisor signoff sheet.", status: "Approved" },
            { name: "physics_olympiad_cert.pdf", size: "2.1 MB", date: "June 2", type: "Personal Achievement", desc: "National Olympiad Certificate - Gold Distinction Award.", status: "Verified" },
            { name: "infinitesimal_calculus_notes.pdf", size: "420 KB", date: "May 28", type: "Academic Evidence", desc: "Extension research essay on infinite limits.", status: "Indexed" },
            { name: "recommendation_req_form.pdf", size: "88 KB", date: "May 15", type: "Reference Materials", desc: "Math department reference template packet.", status: "Completed" }
          ].map((file, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"
              } space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="text-[9px] bg-white/5 border border-white/15 text-white/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider truncate max-w-[150px]">
                    {file.type}
                  </span>
                  <span className="text-[8px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    {file.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{file.name}</h4>
                <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{file.desc}</p>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.03] text-[9px] text-white/30">
                <span>Size: {file.size}</span>
                <span>Synced {file.date}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
