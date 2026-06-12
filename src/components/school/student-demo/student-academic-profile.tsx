"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

type SubjectTimelineEvent = {
  date: string;
  title: string;
  grade: string;
  type: "IA" | "Test" | "Quiz" | "Assignment";
};

type SubjectFeedback = {
  date: string;
  teacher: string;
  comment: string;
};

type Subject = {
  name: string;
  level: string;
  current: number;
  trend: "up" | "stable" | "down";
  classAvg: number;
  strongestCategory: string;
  feedbackTheme: string;
  growthPeriod: string;
  attendanceCorrelation: string;
  timeline: SubjectTimelineEvent[];
  trendData: number[];
  trendLabels: string[];
  teacherFeedback: SubjectFeedback[];
};

const subjects: Subject[] = [
  {
    name: "Physics",
    level: "HL",
    current: 5,
    trend: "up",
    classAvg: 5.2,
    strongestCategory: "Mechanics & Kinematics",
    feedbackTheme: "Explanation depth in error analysis",
    growthPeriod: "Term 2 Practical Cycle",
    attendanceCorrelation: "High (r = 0.68)",
    timeline: [
      { date: "May 15", title: "Physics IA Draft Phase 2", grade: "5/7", type: "IA" },
      { date: "Apr 22", title: "Electrodynamics Unit Test", grade: "6/7", type: "Test" },
      { date: "Mar 10", title: "Mechanics Investigation Log", grade: "5/7", type: "Assignment" },
    ],
    trendData: [4.8, 5.0, 5.1, 5.2, 5.0, 5.4],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 16", teacher: "Aarav Chen", comment: "Great application of SUVAT equations. Focus on explanation depth in error analysis." },
      { date: "Mar 12", teacher: "Aarav Chen", comment: "Excellent experimental setup. Data tables are clean, but needs a more rigorous conclusion." }
    ]
  },
  {
    name: "Math AA",
    level: "HL",
    current: 6,
    trend: "stable",
    classAvg: 5.8,
    strongestCategory: "Calculus & Limits",
    feedbackTheme: "Notation precision in mathematical induction",
    growthPeriod: "Term 1 Exam Cycle",
    attendanceCorrelation: "Moderate (r = 0.42)",
    timeline: [
      { date: "May 20", title: "Integration Quiz", grade: "6/7", type: "Quiz" },
      { date: "Apr 18", title: "Calculus Limits Exam", grade: "6/7", type: "Test" },
      { date: "Mar 05", title: "Function Mapping Project", grade: "7/7", type: "Assignment" },
    ],
    trendData: [5.6, 5.7, 5.7, 5.8, 5.8, 6.0],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 21", teacher: "Dr. Sarah Chen", comment: "Excellent integration technique. Minor notation errors in limits proof." },
      { date: "Mar 07", teacher: "Dr. Sarah Chen", comment: "Outstanding mathematical communication. Proof structures are elegant." }
    ]
  },
  {
    name: "English A",
    level: "HL",
    current: 5,
    trend: "up",
    classAvg: 5.5,
    strongestCategory: "Literary Commentary",
    feedbackTheme: "Textual evidence integration",
    growthPeriod: "Term 2 Mock",
    attendanceCorrelation: "Low (r = 0.15)",
    timeline: [
      { date: "May 18", title: "Poem Analysis Essay", grade: "5/7", type: "Assignment" },
      { date: "Apr 12", title: "Comparative Text Oral", grade: "6/7", type: "Test" },
      { date: "Feb 28", title: "Dystopian Literature Essay", grade: "5/7", type: "Assignment" },
    ],
    trendData: [5.0, 5.0, 5.2, 5.3, 5.4, 5.5],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 19", teacher: "James Morrison", comment: "Strong thesis statements. Develop your textual evidence further to secure a higher mark." },
      { date: "Apr 14", teacher: "James Morrison", comment: "Engaging oral delivery. Insightful analysis of tone and style motifs." }
    ]
  },
  {
    name: "Chemistry",
    level: "SL",
    current: 5,
    trend: "down",
    classAvg: 5.4,
    strongestCategory: "Stoichiometry & Kinetics",
    feedbackTheme: "Experimental error propagation",
    growthPeriod: "Term 1 Units",
    attendanceCorrelation: "Moderate (r = 0.48)",
    timeline: [
      { date: "May 12", title: "Stoichiometry Lab Log", grade: "5/7", type: "Assignment" },
      { date: "Mar 28", title: "Kinetics Unit Test", grade: "4/7", type: "Test" },
      { date: "Feb 15", title: "Atomic Bonding Quiz", grade: "5/7", type: "Quiz" },
    ],
    trendData: [5.5, 5.4, 5.3, 5.3, 5.4, 5.0],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 13", teacher: "Dr. Priya Sharma", comment: "Diligent lab practice. Focus on error propagation calculations." },
      { date: "Mar 30", teacher: "Dr. Priya Sharma", comment: "Kinetics concept is clear, but algebraic mistakes cost marks in exam section B." }
    ]
  },
  {
    name: "Psychology",
    level: "SL",
    current: 6,
    trend: "stable",
    classAvg: 5.7,
    strongestCategory: "Cognitive Approach",
    feedbackTheme: "Empirical study evaluation",
    growthPeriod: "Term 1",
    attendanceCorrelation: "Stable (r = 0.22)",
    timeline: [
      { date: "May 08", title: "Research Methods Test", grade: "6/7", type: "Test" },
      { date: "Apr 02", title: "Biological Approach Essay", grade: "6/7", type: "Assignment" },
    ],
    trendData: [5.5, 5.6, 5.6, 5.7, 5.7, 6.0],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 09", teacher: "Dr. Marcus Vance", comment: "Excellent analysis of empirical studies. Keep referencing standard models." },
      { date: "Apr 04", teacher: "Dr. Marcus Vance", comment: "Strong critical thinking shown in essay. Clear structure." }
    ]
  },
  {
    name: "Spanish B",
    level: "SL",
    current: 6,
    trend: "up",
    classAvg: 5.9,
    strongestCategory: "Oral Interaction & Fluency",
    feedbackTheme: "Subjunctive verb conjugation",
    growthPeriod: "Term 2 Oral Cycle",
    attendanceCorrelation: "High (r = 0.65)",
    timeline: [
      { date: "May 22", title: "Oral Presentation", grade: "6/7", type: "Test" },
      { date: "Apr 15", title: "Reading Comprehension", grade: "6/7", type: "Assignment" },
    ],
    trendData: [5.8, 5.8, 5.9, 5.9, 5.9, 6.0],
    trendLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    teacherFeedback: [
      { date: "May 23", teacher: "Señora Isabella Ruiz", comment: "Muy buena fluidez y vocabulario. Focus on subjunctive verb conjugations." },
      { date: "Apr 16", teacher: "Señora Isabella Ruiz", comment: "Great comprehension skills. Grammatical endings are improving." }
    ]
  },
];

type AxisInsight = {
  id: string;
  title: string;
  summary: string;
  dataUsed: string;
  whyExists: string;
  subjects: string[];
  timeframe: string;
  details: string;
  icon: string;
};

const axisInsights: AxisInsight[] = [
  {
    id: "insight-1",
    title: "Attendance Boost Correlation",
    summary: "Physics performance typically improves after periods of consistent attendance.",
    dataUsed: "Daily Homeroom register logs, Physics block attendance records, and network validation pings.",
    whyExists: "A statistical correlation (r = 0.68) exists between your consecutive attendance streaks of 10+ days and a +0.5 GPA increase in next-week Physics quizzes.",
    subjects: ["DP1 Physics HL", "Homeroom 11-F"],
    timeframe: "Term 1 & Term 2, 2026",
    details: "Maintaining high attendance rates ensures you participate in live lab demonstrations (e.g. pendulum damping experiments), which heavily contribute to your understanding of mechanics concepts.",
    icon: "📈"
  },
  {
    id: "insight-2",
    title: "Late Submission Performance Impact",
    summary: "Late submissions correlate with lower performance in essay-based subjects.",
    dataUsed: "Turnitin timestamp sync records, Google Classroom upload histories, and English A HL grade sheets.",
    whyExists: "Assignments submitted within 12 hours of the deadline or past the deadline show a 12% lower average score compared to drafts submitted 2+ days prior.",
    subjects: ["English A HL"],
    timeframe: "Last 6 Months",
    details: "Earlier submissions correlate with multiple rounds of revisions and drafting, leading to significantly deeper textual analysis and stronger thesis development.",
    icon: "⏳"
  },
  {
    id: "insight-3",
    title: "Workload Stress Resilience",
    summary: "Math AA HL performance remains highly stable regardless of external workload increases.",
    dataUsed: "Axis Task Manager deadline logs, homework completion rates, and Math AA HL unit exam grades.",
    whyExists: "Even during high-stress weeks (weeks with 4+ overlapping assignments/deadlines), your Math AA HL test scores varied by less than 0.2 points.",
    subjects: ["Math AA HL"],
    timeframe: "Academic Year 2025/2026",
    details: "This indicates strong foundational limits and calculus concepts, making your mathematics performance highly resilient to exam-week scheduling stresses.",
    icon: "🛡️"
  },
  {
    id: "insight-4",
    title: "Practical Assessment Growth Spurt",
    summary: "Chemistry grades show a marked improvement after hands-on practical assessments.",
    dataUsed: "Chemistry lab report grades, practical experiment evaluation logs, and term exams.",
    whyExists: "Your score averages rose by +0.8 points in Chemistry HL units following hands-on laboratory exercises compared to units taught purely via lecture slides.",
    subjects: ["Chemistry SL"],
    timeframe: "Term 2, 2026",
    details: "You show high aptitude for experiential learning and data gathering. Physical laboratory simulations (like calorimetry and bonding labs) reinforce core theoretical chemistry constructs.",
    icon: "🧪"
  }
];

const gpaData = [5.0, 5.1, 5.2, 5.3, 5.3, 5.4];
const gpaMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// 30 days: 29 present, 1 late (day index 12)
const correctedDays: ("present" | "late" | "absent" | "off")[] = (() => {
  const days: ("present" | "late" | "absent" | "off")[] = [];
  let lateInserted = false;
  for (let i = 0; i < 30; i++) {
    if (i % 7 === 5 || i % 7 === 6) {
      days.push("off");
    } else if (!lateInserted && i === 12) {
      days.push("late");
      lateInserted = true;
    } else {
      days.push("present");
    }
  }
  return days;
})();

export function StudentAcademicProfile({
  theme = "dark",
  initialSubTab = "performance",
  onSubTabChange,
  onNavigateToTab,
  onEmailCompose,
}: {
  theme?: Theme;
  initialSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onEmailCompose?: (composeData: {
    to: { email: string; name: string; role: string }[];
    subject: string;
    body: string;
  }) => void;
}) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [wifiVerifyStatus, setWifiVerifyStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [disputeStatus, setDisputeStatus] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState("DP1 Physics HL");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDate, setDisputeDate] = useState("2026-06-11");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AxisInsight | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: string) => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  const handleWifiVerify = () => {
    setWifiVerifyStatus("verifying");
    setTimeout(() => {
      setWifiVerifyStatus("success");
    }, 1500);
  };

  const handleRequestMedicalUpdate = () => {
    if (onEmailCompose && onNavigateToTab) {
      onEmailCompose({
        to: [{ email: "aarav.chen@school.edu", name: "Aarav Chen", role: "coordinator" }],
        subject: "Medical Record Update Request",
        body: "Hi Mr. Aarav Chen,\n\nI am writing to request an update to my official school medical records. [Please specify the required updates, corrections, or additions here]\n\nThank you,\nChloe Vance"
      });
      onNavigateToTab("email");
    }
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeStatus(`Dispute review request submitted successfully for ${disputeSubject} on ${disputeDate}.`);
    setIsDisputeModalOpen(false);
    setTimeout(() => setDisputeStatus(null), 5000);
  };


  const trendConfig = {
    up: { arrow: "↗", color: isLight ? "text-emerald-600" : "text-emerald-400", label: "Improving" },
    stable: { arrow: "→", color: isLight ? "text-black/40" : "text-white/40", label: "Stable" },
    down: { arrow: "↘", color: isLight ? "text-rose-600" : "text-rose-400", label: "Declining" },
  };

  const metrics = [
    { label: "GPA", value: "5.4", sub: "/ 7.0", accent: isLight ? "text-cyan-600" : "text-cyan-400" },
    { label: "Predicted IB", value: "36", sub: "/ 45", accent: isLight ? "text-cyan-600" : "text-cyan-400" },
    { label: "Attendance", value: "96.8", sub: "%", accent: isLight ? "text-emerald-600" : "text-emerald-400" },
    { label: "Subjects", value: "6", sub: "Enrolled", accent: isLight ? "text-purple-600" : "text-purple-400" },
  ];

  const attendanceColors = {
    present: isLight ? "bg-emerald-500/60" : "bg-emerald-500/70",
    late: isLight ? "bg-amber-500/60" : "bg-amber-500/70",
    absent: isLight ? "bg-rose-500/60" : "bg-rose-500/70",
    off: isLight ? "bg-black/[0.06]" : "bg-white/[0.06]",
  };

  // SVG chart dimensions
  const chartW = 560;
  const chartH = 180;
  const padX = 40;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;
  const yMin = 4;
  const yMax = 7;

  const points = gpaData.map((v, i) => {
    const x = padX + (i / (gpaData.length - 1)) * plotW;
    const y = padY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + plotH} L${points[0].x},${padY + plotH} Z`;

  return (
    <div className={`min-h-screen p-6 md:p-10 space-y-8 max-w-6xl mx-auto ${styles.bg} ${styles.textPrimary} transition-colors duration-200`}>
      {/* Profile Header */}
      <motion.div
        {...fadeUp(0)}
        className={`flex items-center gap-5 border rounded-2xl p-6 ${styles.cardBg}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
          isLight ? "bg-cyan-600/10 border-cyan-600/20 text-cyan-600" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        }`}>
          <span className="font-bold text-xl tracking-wide">CV</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className={`text-xl font-semibold tracking-tight ${styles.textPrimary}`}>Chloe Vance</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className={`text-sm ${styles.textSecondary} opacity-70`}>Grade 11-B</span>
            <span className={`w-1 h-1 rounded-full ${isLight ? "bg-black/20" : "bg-white/20"}`} />
            <span className={`text-sm ${styles.textSecondary} opacity-70`}>DP Programme</span>
            <span className={`w-1 h-1 rounded-full ${isLight ? "bg-black/20" : "bg-white/20"}`} />
            <span className={`text-sm ${styles.textSecondary} opacity-70`}>Homeroom 11-F</span>
          </div>
          <p className={`text-xs mt-1 ${styles.textSecondary} opacity-50`}>
            Advisor: <span className={styles.textPrimary}>Aarav Chen</span>
          </p>
        </div>
      </motion.div>

      {/* Sub-tab Navigation */}
      <div className={`flex items-center gap-1 rounded-xl border p-1 mb-6 ${styles.cardBg} max-w-2xl`}>
        {[
          { id: "performance", label: "Overall Performance" },
          { id: "predictions", label: "IB Predictions Breakdown" },
          { id: "attendance", label: "Attendance Analytics" },
          { id: "records", label: "Support & Medical" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSubTabChange(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex-1 text-center ${
              activeSubTab === tab.id ? styles.textPrimary : `${styles.textSecondary} opacity-50 hover:opacity-85`
            }`}
          >
            {activeSubTab === tab.id && (
              <motion.div
                layoutId="activeSubProfileTab"
                className={`absolute inset-0 rounded-lg ${
                  isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.07] border border-white/[0.08]"
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="space-y-8"
        >
          {activeSubTab === "performance" && (
            <>
              {/* Key Metrics */}
              <motion.div {...fadeUp(0.05)}>
                <p className={`text-[10px] uppercase tracking-widest mb-3 font-medium ${styles.textSecondary} opacity-50`}>
                  Key Metrics
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {metrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      {...fadeUp(0.08 + i * 0.04)}
                      className={`border rounded-2xl p-5 text-center ${styles.cardBg}`}
                    >
                      <p className={`text-[10px] uppercase tracking-widest mb-2 font-medium ${styles.textSecondary} opacity-50`}>
                        {m.label}
                      </p>
                      <p className="flex items-baseline justify-center gap-1">
                        <span className={`text-3xl font-bold ${m.accent}`}>{m.value}</span>
                        <span className={`text-sm font-medium ${styles.textSecondary} opacity-40`}>{m.sub}</span>
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Subject Performance */}
              <motion.div {...fadeUp(0.15)}>
                <p className={`text-[10px] uppercase tracking-widest mb-3 font-medium ${styles.textSecondary} opacity-50`}>
                  Subject Performance
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjects.map((s, i) => {
                    const trend = trendConfig[s.trend];
                    const diff = s.current - s.classAvg;
                    const diffLabel = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                    const diffColor = diff >= 0 
                      ? isLight ? "text-emerald-600" : "text-emerald-400"
                      : isLight ? "text-rose-600" : "text-rose-400";

                    return (
                      <motion.div
                        key={s.name}
                        {...fadeUp(0.18 + i * 0.04)}
                        onClick={() => setSelectedSubject(s)}
                        className={`border rounded-2xl p-5 flex items-center gap-4 ${styles.cardBg} cursor-pointer hover:border-cyan-500/30 transition-all hover:scale-[1.01]`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${styles.textPrimary}`}>{s.name}</p>
                            {s.level && (
                              <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                                isLight ? "bg-black/[0.04] text-black/50" : "bg-white/[0.04] text-white/45"
                              }`}>
                                {s.level}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs ${trend.color} font-medium`}>
                              {trend.arrow} {trend.label}
                            </span>
                            <span className={`text-[10px] ${isLight ? "text-black/20" : "text-white/20"}`}>•</span>
                            <span className={`text-xs ${styles.textSecondary} opacity-50`}>
                              Avg {s.classAvg}{" "}
                              <span className={`${diffColor} text-[10px] font-medium`}>({diffLabel})</span>
                            </span>
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                          isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.03] border-white/[0.06]"
                        }`}>
                          <span className={`text-2xl font-bold ${styles.textPrimary}`}>{s.current}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Performance Trend Chart */}
              <motion.div
                {...fadeUp(0.3)}
                className={`border rounded-2xl p-6 ${styles.cardBg}`}
              >
                <p className={`text-[10px] uppercase tracking-widest mb-5 font-medium ${styles.textSecondary} opacity-50`}>
                  GPA Trend — 2026
                </p>
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH + 10}`}
                    className="w-full max-w-[560px] mx-auto"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isLight ? "rgb(8,145,178)" : "rgb(6,182,212)"} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={isLight ? "rgb(8,145,178)" : "rgb(6,182,212)"} stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Y axis grid lines */}
                    {[4, 5, 6, 7].map((v) => {
                      const y = padY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
                      return (
                        <g key={v}>
                          <line
                            x1={padX}
                            y1={y}
                            x2={padX + plotW}
                            y2={y}
                            stroke={isLight ? "black" : "white"}
                            strokeOpacity={isLight ? 0.08 : 0.05}
                          />
                          <text
                            x={padX - 8}
                            y={y + 4}
                            textAnchor="end"
                            fill={isLight ? "black" : "white"}
                            fillOpacity={isLight ? 0.45 : 0.25}
                            fontSize={10}
                          >
                            {v}
                          </text>
                        </g>
                      );
                    })}

                    {/* X axis labels */}
                    {gpaMonths.map((m, i) => {
                      const x = padX + (i / (gpaMonths.length - 1)) * plotW;
                      return (
                        <text
                          key={m}
                          x={x}
                          y={chartH + 6}
                          textAnchor="middle"
                          fill={isLight ? "black" : "white"}
                          fillOpacity={isLight ? 0.45 : 0.25}
                          fontSize={10}
                        >
                          {m}
                        </text>
                      );
                    })}

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#gpaGrad)" />

                    {/* Line */}
                    <path d={linePath} fill="none" stroke={isLight ? "rgb(8,145,178)" : "rgb(6,182,212)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data points */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r={4} fill={isLight ? "#FFFFFF" : "#0E0E10"} stroke={isLight ? "rgb(8,145,178)" : "rgb(6,182,212)"} strokeWidth={2} />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill={isLight ? "rgb(8,145,178)" : "rgb(6,182,212)"}
                          fontSize={10}
                          fontWeight={600}
                        >
                          {gpaData[i].toFixed(1)}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </motion.div>

              {/* Axis Insights (Experimental) Panel */}
              <motion.div
                {...fadeUp(0.35)}
                className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Axis Insights
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold uppercase tracking-wider">
                        Experimental
                      </span>
                    </h3>
                    <p className={`text-[10px] ${styles.textSecondary} opacity-50 mt-1`}>
                      Long-term academic patterns, correlations, and behavior observations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {axisInsights.map((insight) => (
                    <div
                      key={insight.id}
                      onClick={() => setSelectedInsight(insight)}
                      className={`p-4 rounded-xl border ${
                        isLight ? "bg-black/[0.01] border-black/[0.06] hover:bg-black/[0.02]" : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03]"
                      } hover:border-cyan-400/35 cursor-pointer transition-all flex gap-3.5 items-start`}
                    >
                      <span className="text-2xl p-2 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {insight.icon}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white leading-normal">{insight.title}</h4>
                        <p className="text-[11px] text-white/50 leading-relaxed">{insight.summary}</p>
                        <span className="text-[9px] text-cyan-400/80 font-semibold inline-block pt-1 hover:underline">
                          View analytical data &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {activeSubTab === "predictions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score summary */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between items-center text-center lg:col-span-1 min-h-[220px]`}>
                  <div className="w-full">
                    <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Total Predicted IB Score</p>
                    <div className="mt-6 flex flex-col items-center">
                      <span className="text-6xl font-black text-cyan-400 select-none">36</span>
                      <span className={`text-xs font-semibold opacity-40 ${styles.textSecondary} mt-1.5`}>out of 45 points</span>
                    </div>
                  </div>
                  <div className={`mt-6 w-full border-t pt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"} text-[11px] leading-relaxed ${styles.textSecondary} opacity-60`}>
                    This score is sufficient for Imperial College London, University of Edinburgh, and University of Manchester typical offers.
                  </div>
                </div>

                {/* Subject Predictions Breakdown */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} lg:col-span-2 space-y-4`}>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Subject Predictions Breakdown</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { name: "DP1 Physics HL", grade: "5", max: "7", teacher: "Mr. Aarav Chen" },
                      { name: "Math AA HL", grade: "6", max: "7", teacher: "Dr. Sarah Chen" },
                      { name: "English A HL", grade: "5", max: "7", teacher: "James Morrison" },
                      { name: "Chemistry SL", grade: "5", max: "7", teacher: "Dr. Priya Sharma" },
                      { name: "Psychology SL", grade: "6", max: "7", teacher: "Dr. Marcus Vance" },
                      { name: "Spanish B SL", grade: "6", max: "7", teacher: "Señora Isabella Ruiz" },
                    ].map((s) => (
                      <div key={s.name} className={`flex items-center justify-between border-b pb-2.5 last:border-b-0 last:pb-0 ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                        <div>
                          <span className={`text-xs font-semibold ${styles.textPrimary}`}>{s.name}</span>
                          <span className={`block text-[9px] ${styles.textSecondary} opacity-50`}>{s.teacher}</span>
                        </div>
                        <span className="text-sm font-bold text-cyan-400">{s.grade} <span className={`text-[10px] font-normal ${styles.textSecondary} opacity-40`}>/ {s.max}</span></span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`border-t pt-3 flex items-center justify-between text-xs ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <span className={`font-semibold ${styles.textPrimary}`}>TOK & Extended Essay Core Points</span>
                    <span className="font-bold text-cyan-400">+3 <span className={`text-[10px] font-normal ${styles.textSecondary} opacity-40`}>/ 3</span></span>
                  </div>
                </div>
              </div>

              {/* Prediction History */}
              <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Prediction Update History</p>
                <div className="relative border-l pl-5 ml-2 space-y-5 border-cyan-500/20">
                  {[
                    { date: "Jun 12, 2026", title: "Predicted IB Updated to 36", desc: "Math AA HL prediction increased from 5 to 6 by Dr. Sarah Chen based on recent integration quiz performance.", badge: "Grade Upgrade" },
                    { date: "Apr 08, 2026", title: "Predicted IB Updated to 35", desc: "Physics HL prediction increased from 4 to 5 by Mr. Aarav Chen following improved IA draft work.", badge: "Grade Upgrade" },
                    { date: "Jan 15, 2026", title: "Initial Predictions Logged (34 points)", desc: "Baseline DP1 predictions established by the Academic Coordinator committee.", badge: "Baseline Setup" },
                  ].map((h, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500 border-2 border-white dark:border-[#0E0E10] shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                      <div>
                        <span className="text-[9px] font-semibold text-cyan-500">{h.date}</span>
                        <h4 className={`text-xs font-bold ${styles.textPrimary} mt-0.5`}>{h.title}</h4>
                        <p className={`text-xs ${styles.textSecondary} opacity-70 mt-1 max-w-2xl leading-relaxed`}>{h.desc}</p>
                        <span className={`inline-block mt-1.5 text-[8px] uppercase tracking-wider font-semibold border px-1.5 py-0.2 rounded ${
                          idx === 2 
                            ? isLight ? "border-black/[0.08] text-black/50" : "border-white/[0.08] text-white/35"
                            : "border-cyan-500/25 bg-cyan-500/[0.08] text-cyan-400"
                        }`}>{h.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "attendance" && (
            <div className="space-y-6">
              {/* Dispute & Network Status Toast Banners */}
              {disputeStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-2"
                >
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {disputeStatus}
                </motion.div>
              )}

              {/* Attendance Overview Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Metric Overview Card */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-emerald-500/20 transition-all`}>
                  <div>
                    <span className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Current Attendance %</p>
                    <div className="mt-4 flex flex-col">
                      <span className="text-5xl font-black text-emerald-400">96.8%</span>
                      <span className={`text-xs ${styles.textSecondary} opacity-60 mt-1`}>Very Strong · Exceeds IB threshold</span>
                    </div>
                  </div>
                  <div className={`space-y-2 border-t pt-4 mt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-[9px] text-emerald-400 font-semibold uppercase">Present</span>
                        <span className={`text-xs font-bold ${styles.textPrimary} mt-0.5`}>29 Days</span>
                      </div>
                      <div className="flex flex-col p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="text-[9px] text-amber-400 font-semibold uppercase">Late</span>
                        <span className={`text-xs font-bold ${styles.textPrimary} mt-0.5`}>1 Day</span>
                      </div>
                      <div className="flex flex-col p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                        <span className="text-[9px] text-rose-400 font-semibold uppercase">Absent</span>
                        <span className={`text-xs font-bold ${styles.textPrimary} mt-0.5`}>0 Days</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-2 pt-2 border-t border-white/[0.04] opacity-60">
                      <span>Excused: 1 Day</span>
                      <span>Unexcused: 0 Days</span>
                    </div>
                  </div>
                </div>

                {/* 2. Attendance Risk Tracker */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-cyan-500/20 transition-all`}>
                  <div>
                    <span className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Attendance Risk Tracker</p>
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold text-white">Low Risk</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase">Safe</span>
                      </div>
                      <p className={`text-xs ${styles.textSecondary} opacity-60 mt-1`}>Required minimum: <span className="font-semibold text-white">90%</span></p>
                    </div>
                  </div>

                  <div className={`border-t pt-4 mt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">Safe Absence Buffer</span>
                      <span className="text-lg font-black text-white block mt-0.5">12 Days Remaining</span>
                      <span className="text-[9px] text-white/30 block mt-0.5">Absences before falling below threshold</span>
                    </div>
                  </div>
                </div>

                {/* 3. Beta WiFi Self-Verification Card */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-blue-500/20 transition-all`}>
                  <div>
                    <span className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-center">
                      <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>WiFi Verification (Beta)</p>
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed mt-3">
                      Verify presence by connecting to verified school network <span className="font-mono text-cyan-400">AXIS-SECURE-NET</span>.
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
                    {wifiVerifyStatus === "idle" && (
                      <button
                        onClick={handleWifiVerify}
                        className="w-full py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.282 7.657C11.147 4.793 14.853 4.793 17.718 7.657M5.102 10.837C9.399 6.54 13.6 6.54 17.898 10.837M11.25 11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM1.92 14.02C8.38 7.56 12.62 7.56 19.08 14.02" />
                        </svg>
                        Verify Network Presence
                      </button>
                    )}
                    {wifiVerifyStatus === "verifying" && (
                      <div className="w-full py-2 bg-white/[0.04] border border-white/[0.08] text-white/70 font-semibold text-xs rounded-xl flex items-center justify-center gap-2">
                        <span className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Syncing credentials...
                      </div>
                    )}
                    {wifiVerifyStatus === "success" && (
                      <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        WiFi Presence Confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Permanent Calculation Section Banner */}
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.02] p-6 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1 bg-cyan-400" />
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Attendance Calculation System</h4>
                <p className="text-xs text-white/70 leading-relaxed mt-2.5">
                  Attendance is primarily recorded by teachers during homeroom and class periods. Teachers verify student presence in person and mark attendance within Axis.
                </p>
                <p className="text-xs text-white/50 leading-relaxed mt-2">
                  <span className="text-cyan-400/80 font-semibold">Beta Verification Layer:</span> Students can optionally verify their presence using device network syncing when connected to verified school access points. Note that WiFi verification does not replace direct teacher attendance logs but serves as an additional corroboration layer to eliminate recording discrepancies.
                </p>
              </div>

              {/* Class-by-Class Attendance Grid & Subject Overview */}
              <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Class-by-Class Attendance</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Homeroom 11-F", rate: "100%", p: 29, a: 0, l: 0, e: 0, teacher: "Aarav Chen" },
                    { name: "DP1 Physics HL", rate: "96.4%", p: 27, a: 0, l: 1, e: 0, teacher: "Aarav Chen" },
                    { name: "Math AA HL", rate: "96.4%", p: 27, a: 0, l: 0, e: 1, teacher: "Dr. Sarah Chen" },
                    { name: "Chemistry SL", rate: "96.0%", p: 24, a: 0, l: 1, e: 0, teacher: "Dr. Priya Sharma" },
                    { name: "English A HL", rate: "95.8%", p: 23, a: 0, l: 0, e: 1, teacher: "James Morrison" },
                    { name: "TOK", rate: "100%", p: 23, a: 0, l: 0, e: 0, teacher: "Michael Torres" },
                  ].map((c) => (
                    <div key={c.name} className={`p-4 rounded-xl border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"} flex flex-col justify-between`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs font-bold ${styles.textPrimary} block`}>{c.name}</span>
                          <span className={`text-[9px] ${styles.textSecondary} opacity-50`}>Teacher: {c.teacher}</span>
                        </div>
                        <span className="text-sm font-black text-emerald-400">{c.rate}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-4 text-center text-[9px] border-t border-white/[0.04] pt-2">
                        <div>
                          <span className="text-white/40 block">PRES</span>
                          <span className="font-bold text-emerald-400">{c.p}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block">ABS</span>
                          <span className="font-bold text-rose-500">{c.a}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block">LATE</span>
                          <span className="font-bold text-amber-500">{c.l}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block">EXC</span>
                          <span className="font-bold text-blue-400">{c.e}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDisputeSubject(c.name);
                          setIsDisputeModalOpen(true);
                        }}
                        className="w-full mt-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-semibold text-white/60 hover:text-white rounded-lg transition-all"
                      >
                        Request Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Trends, Remaining Days & Safety Map */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Trends */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} lg:col-span-2 space-y-4`}>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Monthly Trends & Academic Standing</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { month: "Jan", rate: "97.2%", status: "Excellent" },
                      { month: "Feb", rate: "96.8%", status: "Excellent" },
                      { month: "Mar", rate: "96.5%", status: "Good" },
                      { month: "Apr", rate: "96.9%", status: "Excellent" },
                      { month: "May", rate: "96.2%", status: "Good" },
                      { month: "Jun", rate: "96.8%", status: "Excellent" },
                    ].map((t) => (
                      <div key={t.month} className={`rounded-xl border p-3.5 text-center ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"}`}>
                        <span className={`text-[9px] uppercase tracking-wider block opacity-50 ${styles.textSecondary}`}>{t.month}</span>
                        <span className="text-sm font-bold text-emerald-400 block mt-1">{t.rate}</span>
                        <span className={`text-[8px] font-semibold mt-1 inline-block px-1 rounded bg-emerald-500/10 text-emerald-400`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Days remaining in year */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} lg:col-span-1 space-y-4 flex flex-col justify-between`}>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Academic Calendar Stats</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                      <span className="text-xs text-white/50">Days Remaining in Year</span>
                      <span className="text-xs font-bold text-white">42 Calendar Days</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                      <span className="text-xs text-white/50">Remaining School Days</span>
                      <span className="text-xs font-bold text-cyan-400">30 School Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/50">Projected Year End Attendance</span>
                      <span className="text-xs font-bold text-emerald-400">96.7%</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-white/30 leading-snug mt-2">
                    *Calculations based on 30 remaining academic days and historical attendance rates.
                  </div>
                </div>
              </div>

              {/* Attendance History Log Table */}
              <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
                <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${styles.textSecondary} opacity-50`}>Recorded Attendance History</p>
                  <span className="text-[9px] text-white/40">Showing last 6 sessions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-white/40 border-b border-white/[0.04]">
                        <th className="py-2.5 font-medium">Date</th>
                        <th className="py-2.5 font-medium">Class / Subject</th>
                        <th className="py-2.5 font-medium">Recorded Status</th>
                        <th className="py-2.5 font-medium">Teacher</th>
                        <th className="py-2.5 font-medium">Reason / Note</th>
                        <th className="py-2.5 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {[
                        { date: "June 11, 2026", subject: "DP1 Physics HL", status: "Present", teacher: "Aarav Chen", reason: "WiFi Verified" },
                        { date: "June 10, 2026", subject: "Math AA HL", status: "Excused", teacher: "Dr. Sarah Chen", reason: "College Fair representation" },
                        { date: "June 9, 2026", subject: "Chemistry SL", status: "Late", teacher: "Dr. Priya Sharma", reason: "Bus delayed" },
                        { date: "June 8, 2026", subject: "English A HL", status: "Present", teacher: "James Morrison", reason: "In-class registration" },
                        { date: "June 5, 2026", subject: "TOK", status: "Present", teacher: "Michael Torres", reason: "In-class registration" },
                        { date: "June 4, 2026", subject: "Homeroom 11-F", status: "Present", teacher: "Aarav Chen", reason: "Homeroom registration" },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-3 font-medium text-white/80">{item.date}</td>
                          <td className="py-3 font-semibold text-white">{item.subject}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              item.status === "Present" ? "bg-emerald-500/10 text-emerald-400" :
                              item.status === "Late" ? "bg-amber-500/10 text-amber-400" :
                              item.status === "Excused" ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 text-white/60">{item.teacher}</td>
                          <td className="py-3 text-white/40 italic">{item.reason}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setDisputeSubject(item.subject);
                                setDisputeDate(item.date);
                                setIsDisputeModalOpen(true);
                              }}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Dispute
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Dispute Modal */}
              <AnimatePresence>
                {isDisputeModalOpen && (
                  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsDisputeModalOpen(false)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className={`relative z-10 w-full max-w-md border rounded-2xl p-6 ${styles.cardBg} shadow-2xl text-left`}
                    >
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Request Attendance Review</h3>
                      <p className="text-xs text-white/50 mb-4 leading-normal">
                        Submit a correction dispute request if you believe attendance was recorded incorrectly. The coordinator will verify school access logs.
                      </p>
                      <form onSubmit={handleDisputeSubmit} className="space-y-4">
                        <div>
                          <label className="text-[10px] text-white/40 font-bold uppercase block mb-1">Subject</label>
                          <select
                            value={disputeSubject}
                            onChange={(e) => setDisputeSubject(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                          >
                            <option value="Homeroom 11-F">Homeroom 11-F</option>
                            <option value="DP1 Physics HL">DP1 Physics HL</option>
                            <option value="Math AA HL">Math AA HL</option>
                            <option value="Chemistry SL">Chemistry SL</option>
                            <option value="English A HL">English A HL</option>
                            <option value="TOK">TOK</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 font-bold uppercase block mb-1">Date</label>
                          <input
                            type="text"
                            value={disputeDate}
                            onChange={(e) => setDisputeDate(e.target.value)}
                            placeholder="e.g. June 11, 2026"
                            className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 font-bold uppercase block mb-1">Reason for Dispute</label>
                          <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={3}
                            placeholder="e.g., I was present in class, but was marked absent. WiFi log confirmed presence."
                            className="w-full bg-white/[0.02] border border-white/[0.08] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 resize-none"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsDisputeModalOpen(false)}
                            className="px-4 py-2 border border-white/[0.08] text-xs font-semibold text-white/60 hover:text-white rounded-xl hover:bg-white/[0.02]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/95 shadow-md"
                          >
                            Submit Dispute
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeSubTab === "records" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accommodations */}
              <motion.div
                {...fadeUp(0)}
                className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between`}
              >
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-4 font-medium ${styles.textSecondary} opacity-50`}>
                    IB Access Arrangements & Accommodations
                  </p>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b pb-2.5 border-black/[0.06] dark:border-white/[0.04]">
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>Accommodation Status</span>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold border px-2 py-0.5 rounded-md ${
                        isLight ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                        IB Verified Access Arrangement
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2.5 border-black/[0.06] dark:border-white/[0.04]">
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>Reason</span>
                      <span className={`text-xs font-semibold ${styles.textPrimary}`}>ADHD (Attention Deficit Disorder)</span>
                    </div>
                    <div className="space-y-1.5 border-b pb-2.5 border-black/[0.06] dark:border-white/[0.04]">
                      <span className={`text-xs block ${styles.textSecondary} opacity-60`}>Support Provided</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["25% Extra Time", "Separate Testing Environment", "Rest Breaks Permitted"].map((p) => (
                          <span
                            key={p}
                            className={`text-[10px] font-medium border px-2 py-1 rounded-md ${
                              isLight ? "text-black/60 bg-black/[0.02] border-black/[0.06]" : "text-white/60 bg-white/[0.04] border-white/[0.06]"
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2.5 border-black/[0.06] dark:border-white/[0.04]">
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>Approval Status</span>
                      <span className="text-xs font-semibold text-emerald-500">Approved by IB Cardiff</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2.5 border-black/[0.06] dark:border-white/[0.04]">
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>Verification Source</span>
                      <span className={`text-xs ${styles.textPrimary}`}>IB Assessment Center</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>Approval Date</span>
                      <span className={`text-xs ${styles.textPrimary}`}>August 2025</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.04] flex items-center justify-between text-[11px] opacity-40">
                  <span>Next Review: Oct 15, 2026</span>
                  <span>ID: IBIS-ARR-9482</span>
                </div>
              </motion.div>

              {/* Secure Medical records file */}
              <motion.div
                {...fadeUp(0.04)}
                className={`border rounded-2xl p-6 ${styles.cardBg} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-[10px] uppercase tracking-widest font-medium ${styles.textSecondary} opacity-50`}>
                      Secure Medical File
                    </p>
                    <span className={`size-6 rounded-full flex items-center justify-center border ${
                      isLight ? "bg-amber-500/10 border-amber-500/20 text-amber-700" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className={`text-base font-semibold ${styles.textPrimary}`}>Student Medical & Health Records</h3>
                    <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-60`}>
                      This section contains Chloe Vance's secure medical alerts, allergies, health conditions, and coordinator clinical notes.
                      Access is restricted to authorized personnel including the Student, Parents, Academic Supervisors, and Infirmary Staff.
                    </p>
                    
                    <div className={`rounded-xl border p-3.5 ${
                      isLight ? "bg-black/[0.01] border-black/[0.05]" : "bg-white/[0.01] border-white/[0.05]"
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wide">Critical Health Alert</h4>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${styles.textSecondary} opacity-85`}>
                        Severe Peanut Allergy (Anaphylaxis risk). EpiPen must be kept in student backpack and duplicate registered with Infirmary.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsMedicalModalOpen(true)}
                    className="w-full py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Access Secure Medical Records</span>
                  </button>
                </div>
              </motion.div>

              {/* Medical File Disclaimer Notice */}
              <motion.div
                {...fadeUp(0.06)}
                className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}
              >
                <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-70`}>
                  Medical records are managed by authorized school staff and cannot be edited directly by students. 
                  Requests for updates, corrections, or additional documentation should be submitted to your Programme 
                  Coordinator or designated school administrator through official Axis communication channels.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRequestMedicalUpdate}
                    className="px-4 py-2 border border-cyan-400/20 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-400 text-xs font-semibold rounded-xl transition-all"
                  >
                    Request Medical Record Update
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Medical Records Security Modal */}
      <AnimatePresence>
        {isMedicalModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setIsMedicalModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
                isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              {/* Top Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500" />
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Secure Health Directory</span>
                    <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                    Chloe Vance &bull; Secure Medical File
                  </h3>
                </div>
                <button
                  onClick={() => setIsMedicalModalOpen(false)}
                  className={`text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-5">
                {/* Critical Alerts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-rose-500/20 bg-rose-500/[0.03] p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Health Alerts & Allergies</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">&bull;</span>
                        <span><strong>Severe Peanut Allergy:</strong> Anaphylactic response. Avoid exposure to peanut oils, powders, and nuts.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">&bull;</span>
                        <span><strong>Penicillin Allergy:</strong> Moderate rash and systemic fever. Avoid administration.</span>
                      </li>
                    </ul>
                  </div>

                      <div className="border border-amber-500/20 bg-amber-500/[0.03] p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Conditions & Medications</h4>
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">&bull;</span>
                            <span><strong>Mild Asthma:</strong> Seasonal trigger. Inhaler kept in backpack.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">&bull;</span>
                            <span><strong>ADHD (Combined Type):</strong> Clinical diagnosis (2023).</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">&bull;</span>
                            <span><strong>Medication:</strong> Ritalin 10mg administered daily by School Nurse during lunch (12:30 PM).</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className={`border rounded-xl p-4 ${isLight ? "bg-black/[0.01]" : "bg-white/[0.01]"}`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${styles.textPrimary}`}>Emergency Contacts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="opacity-50 block text-[10px] uppercase font-semibold">Mother</span>
                          <span className="font-semibold block mt-0.5">Eleanor Vance</span>
                          <span className="opacity-60 block mt-0.5">+1 (555) 0198</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[10px] uppercase font-semibold">Father</span>
                          <span className="font-semibold block mt-0.5">Robert Vance</span>
                          <span className="opacity-60 block mt-0.5">+1 (555) 0199</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[10px] uppercase font-semibold">Family Physician</span>
                          <span className="font-semibold block mt-0.5">Dr. Elizabeth Thorne</span>
                          <span className="opacity-60 block mt-0.5">+1 (555) 0210</span>
                        </div>
                      </div>
                    </div>

                    {/* Learning Support & IB-Specific Section */}
                    <div className="border border-cyan-500/20 bg-cyan-500/[0.02] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest">IB Diploma Programme Accommodations</h4>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                          Fully Verified (IBIS)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="opacity-60 block text-[10px] uppercase font-semibold mb-1">Approved Accommodations</span>
                          <ul className="space-y-1.5 font-medium">
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-500">•</span>
                              <span>25% Extra Time (DP1 & DP2 Exams)</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-500">•</span>
                              <span>Separate Testing Room</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="text-cyan-500">•</span>
                              <span>Supervised Rest Breaks (10m / hr)</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <span className="opacity-60 block text-[10px] uppercase font-semibold mb-1">Coordinator Notes</span>
                          <p className="leading-relaxed opacity-85 text-[11px]">
                            Access Arrangements approved by the IB Assessment Center in Cardiff (August 2025). 
                            Verification logged under candidate record. Provisions apply to all external papers and formal internal mock examinations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-end">
                <button
                  onClick={() => setIsMedicalModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Close Secure Vault
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Detail Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedSubject(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
                isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500" />
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Subject Details</span>
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                    {selectedSubject.name} {selectedSubject.level} &bull; Overview
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
                >
                  ✕ Close
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-6 py-4 text-xs">
                
                {/* SVG Grade Progress Graph */}
                <div className={`p-4 rounded-xl border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"} space-y-3`}>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-50">Grade History (Terms & Mocks)</h4>
                  <div className="flex items-center justify-center py-2">
                    <svg viewBox="0 0 400 120" className="w-full max-w-[400px]">
                      <g stroke={isLight ? "black" : "white"} strokeOpacity={0.05} strokeWidth={1}>
                        {[4, 5, 6, 7].map((g, idx) => {
                          const y = 90 - ((g - 4) / 3) * 70;
                          return <line key={idx} x1="30" y1={y} x2="370" y2={y} />;
                        })}
                      </g>
                      {/* X axis labels */}
                      {selectedSubject.trendLabels.map((lbl, idx) => {
                        const x = 30 + (idx / (selectedSubject.trendLabels.length - 1)) * 340;
                        return (
                          <text key={idx} x={x} y="110" textAnchor="middle" fill={isLight ? "black" : "white"} fillOpacity={0.4} fontSize={9}>
                            {lbl}
                          </text>
                        );
                      })}
                      {/* Line connecting points */}
                      <path
                        d={selectedSubject.trendData.map((val, idx) => {
                          const x = 30 + (idx / (selectedSubject.trendData.length - 1)) * 340;
                          const y = 90 - ((val - 4) / 3) * 70;
                          return `${idx === 0 ? "M" : "L"}${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="rgb(6, 182, 212)"
                        strokeWidth={2}
                      />
                      {/* Dots on points */}
                      {selectedSubject.trendData.map((val, idx) => {
                        const x = 30 + (idx / (selectedSubject.trendData.length - 1)) * 340;
                        const y = 90 - ((val - 4) / 3) * 70;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r={3} fill={isLight ? "white" : "#0E0E10"} stroke="rgb(6, 182, 212)" strokeWidth={2} />
                            <text x={x} y={y - 8} textAnchor="middle" fill="rgb(6, 182, 212)" fontSize={9} fontWeight="bold">
                              {val}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject Timeline */}
                  <div className={`p-4 rounded-xl border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"} space-y-3`}>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-50">Assessment Timeline</h4>
                    <div className="space-y-3">
                      {selectedSubject.timeline.map((evt, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b border-white/[0.03] last:border-0 last:pb-0">
                          <div>
                            <span className="font-semibold block text-white/95">{evt.title}</span>
                            <span className="text-[9px] text-white/40 block mt-0.5">{evt.date} &bull; {evt.type}</span>
                          </div>
                          <span className="text-sm font-black text-cyan-400">{evt.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Feedback Logs */}
                  <div className={`p-4 rounded-xl border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"} space-y-3`}>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-50">Teacher Feedback Logs</h4>
                    <div className="space-y-3">
                      {selectedSubject.teacherFeedback.map((fb, idx) => (
                        <div key={idx} className="space-y-1 pb-2 border-b border-white/[0.03] last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white/80">{fb.teacher}</span>
                            <span className="text-[9px] text-white/30">{fb.date}</span>
                          </div>
                          <p className="text-white/50 italic leading-snug">&ldquo;{fb.comment}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject-Level Axis Insights (Experimental) */}
                <div className="border border-cyan-400/20 bg-cyan-500/[0.02] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                    <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
                      Axis Insights (Experimental)
                    </h4>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      Self-Understanding Layer
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                    <div>
                      <span className="opacity-55 block text-[10px] uppercase font-semibold">Strongest Category</span>
                      <span className="font-bold block text-white/95 mt-0.5">{selectedSubject.strongestCategory}</span>
                    </div>
                    <div>
                      <span className="opacity-55 block text-[10px] uppercase font-semibold">Common Feedback Theme</span>
                      <span className="font-bold block text-white/95 mt-0.5">{selectedSubject.feedbackTheme}</span>
                    </div>
                    <div>
                      <span className="opacity-55 block text-[10px] uppercase font-semibold">Highest Growth Period</span>
                      <span className="font-bold block text-white/95 mt-0.5">{selectedSubject.growthPeriod}</span>
                    </div>
                    <div>
                      <span className="opacity-55 block text-[10px] uppercase font-semibold">Attendance Correlation</span>
                      <span className="font-bold block text-cyan-400 mt-0.5">{selectedSubject.attendanceCorrelation}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-2.5 pt-2 border-t border-cyan-500/5">
                    *These observations are derived from historical patterns within Axis to encourage reflection, not standardized predictions or assessments.
                  </p>
                </div>

              </div>

              {/* Close Footer */}
              <div className="mt-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-end">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Close Detail Overview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insight Details Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedInsight(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
                isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Experimental Insight</span>
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                    {selectedInsight.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className={`text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4 text-xs">
                
                <div className="space-y-1">
                  <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider">Observation</span>
                  <p className="text-sm font-semibold text-white/95 leading-normal">{selectedInsight.summary}</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"} space-y-2.5`}>
                  <div>
                    <span className="opacity-40 text-[9px] uppercase font-bold block">Analysis Data Source</span>
                    <span className="font-semibold text-white/80 block mt-0.5">{selectedInsight.dataUsed}</span>
                  </div>
                  <div>
                    <span className="opacity-40 text-[9px] uppercase font-bold block">Correlation Details</span>
                    <span className="font-semibold text-white/80 block mt-0.5">{selectedInsight.whyExists}</span>
                  </div>
                  <div>
                    <span className="opacity-40 text-[9px] uppercase font-bold block">Contributing Subjects</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedInsight.subjects.map((sub, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-[9px] border border-cyan-500/20">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="opacity-40 text-[9px] uppercase font-bold block">Time Period Analyzed</span>
                    <span className="font-semibold text-white/80 block mt-0.5">{selectedInsight.timeframe}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider">Deconstructive Context</span>
                  <p className="text-white/60 leading-normal">{selectedInsight.details}</p>
                </div>

              </div>

              {/* Close Footer */}
              <div className="mt-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-end">
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Close Insight Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
