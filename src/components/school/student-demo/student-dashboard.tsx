"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

// ── Types ────────────────────────────────────────────────────────────────────

type ScheduleBlock = {
  id: string;
  label: string;
  subject: string;
  time: string;
  room?: string;
  type: "class" | "free" | "break";
  current?: boolean;
};

type Deadline = {
  id: string;
  title: string;
  subject: string;
  due: string;
  urgency: "red" | "amber" | "muted";
};

type FeedbackItem = {
  id: string;
  subject: string;
  assignment: string;
  grade: number;
  maxGrade: number;
  teacher: string;
  comment: string;
};

type Announcement = {
  id: string;
  title: string;
  date: string;
  priority: "normal" | "important";
};

// ── Mock Data ────────────────────────────────────────────────────────────────

const SCHEDULE: ScheduleBlock[] = [
  { id: "start", label: "School Starts", subject: "Morning Homeroom", time: "07:45 - 08:00", type: "break" },
  { id: "b1", label: "Block 1", subject: "DP1 Physics HL", time: "08:00 - 09:20", room: "Room S504", type: "class" },
  { id: "break-1", label: "Break", subject: "Morning Recess", time: "09:20 - 09:30", type: "break" },
  { id: "b2", label: "Block 2", subject: "Math AA HL", time: "09:30 - 10:50", room: "Room M302", type: "class", current: true },
  { id: "break-2", label: "Break", subject: "Short Break", time: "10:50 - 11:00", type: "break" },
  { id: "b3", label: "Block 3", subject: "Psychology SL", time: "11:00 - 12:20", room: "Room P104", type: "class" },
  { id: "lunch", label: "Lunch", subject: "Lunch Break", time: "12:20 - 13:10", type: "break" },
  { id: "b5", label: "Block 5", subject: "English A HL", time: "13:10 - 14:30", room: "Room E201", type: "class" },
  { id: "break-3", label: "Break", subject: "Afternoon Recess", time: "14:30 - 14:40", type: "break" },
  { id: "b6", label: "Block 6", subject: "Chemistry SL", time: "14:40 - 16:00", room: "Lab S102", type: "class" },
  { id: "end", label: "School Ends", subject: "End of Day Dismissal", time: "16:00", type: "break" },
];

const DEADLINES: Deadline[] = [
  { id: "d1", title: "Physics IA Draft Phase 2", subject: "Physics HL", due: "Tomorrow", urgency: "red" },
  { id: "d2", title: "Momentum Assignment", subject: "Physics HL", due: "In 3 days", urgency: "amber" },
  { id: "d3", title: "Poem Analysis Essay", subject: "English A HL", due: "In 4 days", urgency: "muted" },
  { id: "d4", title: "Stoichiometry Lab Report", subject: "Chemistry SL", due: "In 5 days", urgency: "muted" },
  { id: "d_psy", title: "Psychology IA Rough Draft", subject: "Psychology SL", due: "In 6 days", urgency: "muted" },
  { id: "d5", title: "Calculus Problem Set 7", subject: "Math AA HL", due: "In 7 days", urgency: "muted" },
];

const FEEDBACK: FeedbackItem[] = [
  { id: "f1", subject: "Physics HL", assignment: "Kinematics Test", grade: 5, maxGrade: 7, teacher: "Mr. Aarav Chen", comment: "Good application of SUVAT equations" },
  { id: "f2", subject: "Math AA HL", assignment: "Integration Quiz", grade: 6, maxGrade: 7, teacher: "Dr. Sarah Chen", comment: "Excellent technique, minor notation errors" },
  { id: "f3", subject: "English A HL", assignment: "Commentary Draft", grade: 5, maxGrade: 7, teacher: "James Morrison", comment: "Strong thesis, develop evidence further" },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "End of Term Schedule Changes", date: "Jun 10", priority: "important" },
  { id: "a2", title: "University Fair Registration Open", date: "Jun 8", priority: "normal" },
];

// ── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const urgencyColor = (u: Deadline["urgency"]) => {
  if (u === "red") return "text-rose-500 font-bold";
  if (u === "amber") return "text-amber-500 font-semibold";
  return "opacity-50";
};

const urgencyDot = (u: Deadline["urgency"]) => {
  if (u === "red") return "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  if (u === "amber") return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
  return "bg-current opacity-25";
};

const gradeColor = (g: number) => {
  if (g >= 6) return "text-emerald-500";
  if (g >= 5) return "text-cyan-500";
  return "text-amber-500";
};

const getSubjectColor = (subject: string) => {
  const sub = subject.toLowerCase();
  if (sub.includes("physics")) {
    return {
      dot: "bg-cyan-500",
      border: "border-cyan-500/70",
      text: "text-cyan-500 dark:text-cyan-400",
      bg: "bg-cyan-500/20",
    };
  }
  if (sub.includes("math")) {
    return {
      dot: "bg-purple-500",
      border: "border-purple-500/70",
      text: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/20",
    };
  }
  if (sub.includes("english")) {
    return {
      dot: "bg-amber-500",
      border: "border-amber-500/70",
      text: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/20",
    };
  }
  if (sub.includes("chemistry")) {
    return {
      dot: "bg-emerald-500",
      border: "border-emerald-500/70",
      text: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/20",
    };
  }
  if (sub.includes("psychology")) {
    return {
      dot: "bg-orange-500",
      border: "border-orange-500/70",
      text: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-500/20",
    };
  }
  if (sub.includes("spanish")) {
    return {
      dot: "bg-yellow-500",
      border: "border-yellow-500/70",
      text: "text-yellow-500 dark:text-yellow-400",
      bg: "bg-yellow-500/20",
    };
  }
  if (sub.includes("tok")) {
    return {
      dot: "bg-rose-500",
      border: "border-rose-500/70",
      text: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/20",
    };
  }
  return {
    dot: "bg-gray-400 dark:bg-gray-500",
    border: "border-gray-400/70 dark:border-gray-500/70",
    text: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-500/10",
  };
};

const mapSubjectToClassId = (sub: string): string => {
  const s = sub.toLowerCase();
  if (s.includes("physics")) return "physics";
  if (s.includes("math")) return "math";
  if (s.includes("english")) return "english";
  if (s.includes("chemistry")) return "chemistry";
  if (s.includes("psychology")) return "psychology";
  if (s.includes("spanish")) return "spanish";
  if (s.includes("tok")) return "tok-core";
  return "";
};

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, styles }: { title: string; subtitle?: string; styles: any }) {
  return (
    <div className="mb-3">
      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary} opacity-50`}>{title}</h3>
      {subtitle && <p className={`mt-0.5 text-xs ${styles.textSecondary} opacity-70`}>{subtitle}</p>}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function StudentDashboard({
  theme = "dark",
  onTabChange,
  onNavigateToTask,
  onNavigateToSnapshotDetail,
}: {
  theme?: Theme;
  onTabChange?: (tab: string) => void;
  onNavigateToTask?: (classId: string, tab: "assignments" | "resources" | "roadmap" | "members", taskId?: string) => void;
  onNavigateToSnapshotDetail?: (metric: "gpa" | "predictions" | "attendance" | "cas" | "ee" | "ia") => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const [time, setTime] = useState<Date | null>(null);
  const [selectedClass, setSelectedClass] = useState<ScheduleBlock | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatHours = time ? time.getHours().toString().padStart(2, "0") : "00";
  const formatMinutes = time ? time.getMinutes().toString().padStart(2, "0") : "00";
  const formatSeconds = time ? time.getSeconds().toString().padStart(2, "0") : "00";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDayName = time ? days[time.getDay()] : "";
  const currentMonthName = time ? months[time.getMonth()] : "";
  const currentDateNum = time ? time.getDate() : 1;
  const currentYear = time ? time.getFullYear() : 2026;

  const currentBlock = SCHEDULE.find((b) => b.current) || SCHEDULE[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`relative h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin ${isLight ? "scrollbar-thumb-black/[0.06] scrollbar-track-transparent" : "scrollbar-thumb-white/[0.06] scrollbar-track-transparent"}`}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Two-column dashboard grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* ─── Left Column (Main widgets) ─── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Clock & Active Block Banner */}
            <motion.section variants={itemVariants}>
              {!time ? (
                <div className={`h-[156px] w-full rounded-2xl border bg-white/[0.02] border-white/5 animate-pulse ${styles.cardBg}`} />
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl border p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] ${styles.cardBg}`}>
                  
                  {/* Left pane: Clock System */}
                  <div className="flex flex-col justify-center">
                    <div className={`flex items-baseline font-mono text-5xl font-light tracking-tighter select-none ${styles.textPrimary}`}>
                      <span>{formatHours}</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className={`mx-1 ${isLight ? "text-black/40" : "text-white/50"}`}
                      >
                        :
                      </motion.span>
                      <span>{formatMinutes}</span>
                      <span className={`ml-2 text-xs font-normal select-none tracking-widest uppercase ${isLight ? "text-black/20" : "text-white/20"}`}>
                        {formatSeconds}
                      </span>
                    </div>
                    <div className={`mt-3.5 flex flex-col items-start gap-0.5 border-t pt-3.5 ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                      <span className={`text-sm font-semibold tracking-tight ${styles.textPrimary}`}>
                        {currentDayName}
                      </span>
                      <span className={`text-xs tracking-normal ${styles.textSecondary} opacity-70`}>
                        {currentDateNum} {currentMonthName} {currentYear}
                      </span>
                    </div>
                  </div>

                  {/* Right pane: Active Block details */}
                  <div className={`flex flex-col justify-between pl-0 md:pl-5 border-t md:border-t-0 md:border-l pt-4 md:pt-0 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest">Active Block</span>
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500/30 opacity-75"></span>
                          <span className="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
                        </span>
                      </div>
                      
                      <h3 className={`mt-2 text-base font-bold tracking-tight ${styles.textPrimary}`}>{currentBlock.subject}</h3>
                      <p className={`text-xs ${styles.textSecondary} opacity-70 mt-0.5`}>
                        {currentBlock.time} &bull; {currentBlock.room || "Flexible"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="size-4 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] flex items-center justify-center font-bold">
                          AC
                        </div>
                        <span className={`text-[10px] ${styles.textSecondary} opacity-60`}>
                          {currentBlock.type === "class" ? "Aarav Chen (Teacher)" : "Self-directed"}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1.5 text-[9px] uppercase font-bold tracking-wider">
                        <span className={`${styles.textSecondary} opacity-40`}>Session Progress</span>
                        <span className="text-cyan-500 font-bold">45m elapsed &bull; 35m remaining</span>
                      </div>
                      <div className={`h-1.5 w-full overflow-hidden rounded-full ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "56%" }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </motion.section>

            {/* Two‑column: Deadlines + Feedback */}
            <div className="grid gap-5 md:grid-cols-2">
              
              {/* Upcoming Deadlines */}
              <motion.section variants={itemVariants}>
                <SectionHeader title="Upcoming Deadlines" subtitle="Next 7 days (Click for details)" styles={styles} />
                <div className={`rounded-2xl border ${styles.cardBg} divide-y ${isLight ? "divide-black/[0.06]" : "divide-white/[0.05]"}`}>
                  {DEADLINES.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDeadline(d)}
                      className="flex items-center gap-3 px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl hover:bg-black/[0.01] hover:dark:bg-white/[0.01] cursor-pointer transition-colors"
                    >
                      <span className={`size-1.5 flex-shrink-0 rounded-full ${urgencyDot(d.urgency)}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${styles.textPrimary} group-hover:text-cyan-400`}>{d.title}</p>
                        <p className={`text-[10px] ${styles.textSecondary} opacity-50`}>{d.subject}</p>
                      </div>
                      <span className={`flex-shrink-0 text-[11px] ${urgencyColor(d.urgency)}`}>
                        {d.due}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Recent Feedback */}
              <motion.section variants={itemVariants}>
                <SectionHeader title="Recent Feedback" subtitle="Graded submissions (Click to view task)" styles={styles} />
                <div className="space-y-2.5">
                  {FEEDBACK.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFeedback(f)}
                      className={`rounded-xl border p-3.5 transition-colors cursor-pointer ${styles.cardBg} hover:bg-black/[0.01] hover:dark:bg-white/[0.01]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>{f.subject}</span>
                          </div>
                          <p className={`mt-1 text-sm font-semibold ${styles.textPrimary} hover:text-cyan-400`}>{f.assignment}</p>
                          <p className={`mt-1.5 text-xs italic leading-relaxed ${styles.textSecondary} opacity-70`}>&ldquo;{f.comment}&rdquo;</p>
                          <p className={`mt-1 text-[10px] ${styles.textSecondary} opacity-40`}>{f.teacher}</p>
                        </div>
                        <div className={`flex-shrink-0 flex flex-col items-center rounded-lg border px-3 py-2 ${
                          isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.03] border-white/[0.06]"
                        }`}>
                          <span className={`text-xl font-bold leading-none ${gradeColor(f.grade)}`}>{f.grade}</span>
                          <span className={`mt-0.5 text-[9px] ${styles.textSecondary} opacity-40`}>/ {f.maxGrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
              
            </div>

            {/* Two-column: Announcements + University Readiness */}
            <div className="grid gap-5 md:grid-cols-2 mt-6">
              
              {/* Announcements Preview */}
              <motion.section variants={itemVariants}>
                <SectionHeader title="Announcements" styles={styles} />
                <div className="space-y-2.5">
                  {ANNOUNCEMENTS.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAnnouncement(a)}
                      className={`rounded-xl border px-4 py-3.5 cursor-pointer transition-all hover:border-cyan-500/30 hover:shadow-[0_0_12px_rgba(6,182,212,0.05)] ${styles.cardBg}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold leading-snug ${styles.textPrimary} hover:text-cyan-400 transition-colors`}>{a.title}</p>
                          <p className={`mt-1 text-[10px] ${styles.textSecondary} opacity-40`}>{a.date}</p>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                            a.priority === "important"
                              ? "border-amber-500/25 bg-amber-500/[0.08] text-amber-500"
                              : isLight 
                                ? "border-black/[0.08] bg-black/[0.04] text-black/50"
                                : "border-white/[0.08] bg-white/[0.04] text-white/35"
                          }`}
                        >
                          {a.priority === "important" ? "Important" : "Normal"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* University Readiness / AI Readiness (Beta) */}
              <motion.section variants={itemVariants}>
                <SectionHeader title="University Readiness" styles={styles} />
                <div
                  onClick={() => onTabChange && onTabChange("university")}
                  className={`rounded-2xl border p-5 cursor-pointer hover:border-cyan-500/30 hover:shadow-[0_0_12px_rgba(6,182,212,0.05)] transition-all ${styles.cardBg}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex size-14 flex-shrink-0 items-center justify-center rounded-xl border ${
                      isLight ? "border-cyan-600/20 bg-cyan-600/[0.06]" : "border-cyan-500/20 bg-cyan-500/[0.06]"
                    }`}>
                      <span className={`text-2xl font-bold ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>A</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${styles.textPrimary}`}>Strong</p>
                      <p className={`mt-0.5 text-xs ${styles.textSecondary} opacity-60 leading-relaxed`}>Well-positioned for target institutions</p>

                      {/* Profile Strength Bar */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${styles.textSecondary} opacity-50`}>Profile Strength</span>
                          <span className={`text-[10px] font-semibold ${styles.textSecondary} opacity-60`}>72%</span>
                        </div>
                        <div className={`h-1.5 w-full overflow-hidden rounded-full ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "72%" }}
                            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.6 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

            </div>

          </div>

          {/* ─── Right Column (Side awareness panels) ─── */}
          <div className="space-y-6">
            
            {/* Today's Schedule Overview */}
            <motion.section variants={itemVariants}>
              <SectionHeader title="Today's Schedule" subtitle="Thursday, June 12" styles={styles} />
              <div className={`rounded-2xl border p-5 relative overflow-hidden ${styles.cardBg}`}>
                
                {/* Vertical timeline line */}
                <div className={`absolute left-[23px] top-7 bottom-7 w-0.5 ${isLight ? "bg-black/[0.08]" : "bg-white/[0.08]"}`} />

                <div className="relative space-y-6">
                  {SCHEDULE.map((block) => {
                    const colors = getSubjectColor(block.subject);
                    const isClass = block.type === "class";
                    const isBookend = block.id === "start" || block.id === "end";
                    
                    return (
                      <div
                        key={block.id}
                        onClick={() => {
                          if (isClass) {
                            setSelectedClass(block);
                          }
                        }}
                        className={`
                          group relative flex items-start pl-9 transition-all duration-300
                          ${isClass ? "cursor-pointer" : "cursor-default"}
                        `}
                      >
                        {/* Timeline Node */}
                        <div className="absolute left-[23px] top-1.5 flex items-center justify-center -translate-x-1/2 z-10">
                          {block.current ? (
                            <div className="relative flex items-center justify-center size-5">
                              {/* Breathing outer glow */}
                              <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                                className={`absolute inset-0 rounded-full ${colors.bg}`}
                              />
                              <div className={`size-3 rounded-full border-2 ${colors.border} ${isLight ? "bg-white" : "bg-[#0e0e10]"} flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.25)]`}>
                                <div className={`size-1.5 rounded-full ${colors.dot}`} />
                              </div>
                            </div>
                          ) : isBookend ? (
                            <div className={`size-3 rounded-full border bg-white dark:bg-[#0e0e10] flex items-center justify-center ${
                              block.id === "start" 
                                ? "border-emerald-500" 
                                : "border-rose-500"
                            }`}>
                              <div className={`size-1.5 rounded-full ${
                                block.id === "start" ? "bg-emerald-500" : "bg-rose-500"
                              }`} />
                            </div>
                          ) : (
                            <div className={`size-2.5 rounded-full border bg-white dark:bg-[#0e0e10] transition-all group-hover:scale-125 ${
                              block.type === "class" 
                                ? `${colors.border} opacity-85` 
                                : `border-gray-300 dark:border-gray-700 opacity-60`
                            }`} />
                          )}
                        </div>

                        {/* Content Pane */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-mono text-[9px] uppercase tracking-wider font-semibold ${
                              block.current 
                                ? `${colors.text}` 
                                : isLight ? "text-black/45" : "text-white/45"
                            }`}>
                              {block.time}
                            </span>
                            
                            {block.room && (
                              <span className={`text-[9px] font-bold uppercase tracking-wider border px-1.5 py-0.2 rounded-md transition-colors ${
                                block.current
                                  ? isLight
                                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-700"
                                    : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                  : isLight
                                    ? "bg-black/[0.02] border-black/[0.06] text-black/50 group-hover:border-black/[0.1] group-hover:text-black/75"
                                    : "bg-white/[0.02] border-white/[0.06] text-white/50 group-hover:border-white/[0.1] group-hover:text-white/75"
                              }`}>
                                {block.room}
                              </span>
                            )}
                          </div>

                          <h4 className={`mt-0.5 text-sm font-semibold tracking-tight transition-colors ${
                            block.current ? `${colors.text} font-bold` : styles.textPrimary
                          } ${isClass ? "group-hover:text-cyan-400 group-hover:dark:text-cyan-300" : ""}`}>
                            {block.subject}
                          </h4>

                          {/* Block label indicator */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] uppercase tracking-widest font-extrabold ${
                              block.current ? "opacity-80" : "opacity-40"
                            } ${styles.textSecondary}`}>
                              {block.label}
                            </span>
                            
                            {block.current && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide">
                                Active Now
                              </span>
                            )}

                            {block.type !== "class" && !isBookend && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide ${
                                isLight ? "bg-black/[0.04] text-black/50" : "bg-white/[0.04] text-white/40"
                              }`}>
                                {block.type}
                              </span>
                            )}

                            {isBookend && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide ${
                                block.id === "start"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              }`}>
                                {block.id === "start" ? "Day Start" : "Day End"}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.section>
            
          </div>

        </div>

        {/* Academic Snapshot */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Academic Snapshot" styles={styles} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: "gpa" as const, label: "Current GPA", value: "5.4", unit: "/ 7.0", color: styles.textPrimary, tooltip: "View Academic Analytics" },
              { id: "predictions" as const, label: "Predicted IB", value: "36", unit: "/ 45", color: isLight ? "text-cyan-600" : "text-cyan-400", tooltip: "View Predicted Grades" },
              { id: "attendance" as const, label: "Attendance", value: "96.8", unit: "%", color: isLight ? "text-emerald-600" : "text-emerald-400", tooltip: "View Attendance Details" },
              { id: "cas" as const, label: "CAS Hours", value: "112", unit: "/ 150", color: isLight ? "text-purple-600" : "text-purple-400", tooltip: "Open CAS Progress" },
              { id: "ee" as const, label: "EE Status", value: "Done", unit: "", color: isLight ? "text-amber-600" : "text-amber-400", tooltip: "Open EE Workspace" },
              { id: "ia" as const, label: "IAs Submitted", value: "4", unit: "/ 6", color: isLight ? "text-rose-600" : "text-rose-400", tooltip: "Open IA Tracker" },
            ].map((m) => (
              <motion.div
                key={m.label}
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => onNavigateToSnapshotDetail?.(m.id)}
                className={`group relative rounded-2xl border px-4 py-4 text-center cursor-pointer transition-all duration-300 ${styles.cardBg} ${
                  isLight 
                    ? "hover:border-black/15 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:bg-[#fafafa]"
                    : "hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.12)] hover:bg-[#111113]"
                }`}
              >
                {/* Tooltip */}
                <div className={`pointer-events-none absolute bottom-[108%] left-1/2 mb-1 w-max -translate-x-1/2 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all duration-200 opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 shadow-lg border z-35 flex items-center gap-1 ${
                  isLight
                    ? "bg-[#0E0E10] border-white/10 text-white"
                    : "bg-[#F9FAFB] border-black/10 text-black"
                }`}>
                  <span>{m.tooltip}</span>
                  <span className={`text-[9px] ${isLight ? "text-cyan-400" : "text-cyan-600"}`}>→</span>
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${styles.textSecondary} opacity-50`}>{m.label}</p>
                <p className={`mt-2 text-3xl font-semibold leading-none tracking-tight ${m.color}`}>
                  {m.value}
                  {m.unit && (
                    <span className={`ml-1 text-sm font-normal ${styles.textSecondary} opacity-40`}>{m.unit}</span>
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* Class Overview Modal */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedClass(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
                isLight ? "bg-[#F9FAFB] border-black/10" : "bg-[#0E0E10] border-white/10"
              }`}
            >
              {/* Decorative accent card banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
              
              <button
                onClick={() => setSelectedClass(null)}
                className={`absolute top-4 right-4 text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
              >
                ✕
              </button>

              <div className="mt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">
                  Class Overview &bull; Enrolled
                </span>
                <h3 className={`text-xl font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                  {selectedClass.subject}
                </h3>
                <p className={`text-xs ${styles.textSecondary} opacity-60 mt-1`}>
                  {selectedClass.label} &bull; {selectedClass.time}
                </p>
              </div>

              <div className={`mt-5 space-y-4.5 border-t pt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-50 ${styles.textSecondary}`}>
                      Teacher
                    </span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>
                      {selectedClass.subject.includes("Physics") ? "Mr. Aarav Chen" :
                       selectedClass.subject.includes("Math") ? "Dr. Sarah Chen" :
                       selectedClass.subject.includes("English") ? "James Morrison" :
                       selectedClass.subject.includes("Chemistry") ? "Dr. Priya Sharma" : "Michael Torres"}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-50 ${styles.textSecondary}`}>
                      Location / Room
                    </span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>
                      {selectedClass.room || "Flexible"}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-50 ${styles.textSecondary}`}>
                      Active Tasks
                    </span>
                    <span className="text-sm font-semibold text-amber-500">
                      {selectedClass.subject.includes("Physics") ? "3 Tasks Pending" :
                       selectedClass.subject.includes("Math") ? "2 Tasks Pending" : "1 Task Pending"}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block opacity-50 ${styles.textSecondary}`}>
                      Syllabus Topic
                    </span>
                    <span className={`text-xs font-semibold truncate block ${styles.textPrimary}`}>
                      {selectedClass.subject.includes("Physics") ? "Mechanics & Kinematics" :
                       selectedClass.subject.includes("Math") ? "Calculus & Integration" : "Literary Analysis"}
                    </span>
                  </div>
                </div>

                {/* Additional quick notes */}
                <div className={`rounded-xl border p-3.5 ${isLight ? "bg-black/[0.01] border-black/[0.05]" : "bg-white/[0.01] border-white/[0.05]"}`}>
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500 mb-1">Next Class Agenda</h5>
                  <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-85`}>
                    {selectedClass.subject.includes("Physics") ? "We will review the final data coordinates for your Physics IA draft. Bring your raw laboratory logs and graph projections." :
                     selectedClass.subject.includes("Math") ? "Continuing our calculus workbook exercise sheet. We will tackle volumes of revolution and integration by parts." :
                     "Reviewing peer drafts for the upcoming literature commentary. Be prepared to share feedback on structural outlines."}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setSelectedClass(null)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isLight ? "hover:bg-black/5 border-black/10 text-black/70" : "hover:bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  Close
                </button>
                {onTabChange && (
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      onTabChange("class-space");
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                  >
                    Go to Class Space
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
                isLight ? "bg-[#F9FAFB] border-black/10" : "bg-[#0E0E10] border-white/10"
              }`}
            >
              {/* Decorative accent banner */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                selectedAnnouncement.priority === "important" ? "bg-amber-500" : "bg-cyan-500"
              }`} />
              
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className={`absolute top-4 right-4 text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
              >
                ✕
              </button>

              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    selectedAnnouncement.priority === "important" ? "text-amber-500" : "text-cyan-500"
                  }`}>
                    Notice &bull; {selectedAnnouncement.priority === "important" ? "Important" : "Normal"}
                  </span>
                  <span className={`text-[9px] ${styles.textSecondary} opacity-40 font-mono`}>
                    {selectedAnnouncement.date}
                  </span>
                </div>
                
                <h3 className={`text-lg font-bold tracking-tight mt-2 ${styles.textPrimary}`}>
                  {selectedAnnouncement.title}
                </h3>
              </div>

              <div className={`mt-4 space-y-4 border-t pt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] flex items-center justify-center font-bold">
                    IS
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${styles.textPrimary}`}>IB Diploma Programme Coordinator</h5>
                    <p className={`text-[9px] ${styles.textSecondary} opacity-40`}>Posted by Administration Office</p>
                  </div>
                </div>

                <div className={`text-xs leading-relaxed ${styles.textSecondary} opacity-90 space-y-2.5`}>
                  {selectedAnnouncement.title.includes("Schedule Changes") ? (
                    <>
                      <p>Dear DP1 and DP2 Candidates,</p>
                      <p>Please note that the schedule for the final week of term will be adjusted to accommodate exam reviews and CAS project presentations. Detailed class rosters and timing changes will be published in the timetable tomorrow.</p>
                      <p>Please ensure all outstanding assignments and laboratory books are submitted by Friday afternoon to allow teachers to process final semester grades.</p>
                    </>
                  ) : (
                    <>
                      <p>Hello Students,</p>
                      <p>Registration for the annual Axis University Fair is now officially open. Over 40 international institutions will be presenting. Attendance is mandatory for Grade 11 and 12 students.</p>
                      <p>Please register for your preferred presentation slots by the end of this week using the portal link or coordination desk resources.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Understood
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Deadline Detail Modal */}
      <AnimatePresence>
        {selectedDeadline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDeadline(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
                isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
              
              <button
                onClick={() => setSelectedDeadline(null)}
                className={`absolute top-4 right-4 text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
              >
                ✕
              </button>

              <div className="mt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">
                  Upcoming Deadline &bull; Due {selectedDeadline.due}
                </span>
                <h3 className={`text-lg font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                  {selectedDeadline.title}
                </h3>
                <p className={`text-xs ${styles.textSecondary} opacity-60 mt-0.5`}>
                  {selectedDeadline.subject}
                </p>
              </div>

              <div className={`mt-4 space-y-4 border-t pt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className={`opacity-50 block font-semibold ${styles.textSecondary}`}>Assessment Category</span>
                    <span className="font-semibold block mt-0.5">Internal Assessment / Written Task</span>
                  </div>
                  <div>
                    <span className={`opacity-50 block font-semibold ${styles.textSecondary}`}>Provisions Required</span>
                    <span className="font-semibold block mt-0.5">25% Extra Time Approved</span>
                  </div>
                </div>

                <div className={`rounded-xl border p-3.5 ${isLight ? "bg-black/[0.01] border-black/[0.05]" : "bg-white/[0.01] border-white/[0.05]"}`}>
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 mb-1">Details & Rationale</h5>
                  <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-85`}>
                    This task is logged within your active {selectedDeadline.subject} syllabus block. Aarav Chen has posted the reference guidelines in the connected class space resources. Complete the draft for reviews.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setSelectedDeadline(null)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isLight ? "hover:bg-black/5 border-black/10 text-black/70" : "hover:bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const classId = mapSubjectToClassId(selectedDeadline.subject);
                    if (onNavigateToTask) {
                      onNavigateToTask(classId, "assignments", selectedDeadline.id);
                    }
                    if (onTabChange) {
                      onTabChange("class-space");
                    }
                    setSelectedDeadline(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Go to Task
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Detail Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeedback(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
                isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-500" />
              
              <button
                onClick={() => setSelectedFeedback(null)}
                className={`absolute top-4 right-4 text-xs font-bold hover:opacity-100 transition-opacity ${styles.textSecondary} opacity-40`}
              >
                ✕
              </button>

              <div className="mt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-500">
                  Graded Submission Review &bull; {selectedFeedback.subject}
                </span>
                <h3 className={`text-lg font-bold tracking-tight mt-1 ${styles.textPrimary}`}>
                  {selectedFeedback.assignment}
                </h3>
                <p className={`text-xs ${styles.textSecondary} opacity-60 mt-0.5`}>
                  Graded by {selectedFeedback.teacher}
                </p>
              </div>

              <div className={`mt-4 space-y-4 border-t pt-4 ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                <div className="flex items-center justify-between border-b pb-3 border-black/[0.06] dark:border-white/[0.06]">
                  <span className={`text-xs ${styles.textSecondary} opacity-60`}>Syllabus Result Score</span>
                  <div className={`flex items-baseline gap-1 rounded-lg border px-3 py-1.5 ${
                    isLight ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-700" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  }`}>
                    <span className="text-xl font-bold leading-none">{selectedFeedback.grade}</span>
                    <span className="text-xs opacity-50">/ {selectedFeedback.maxGrade}</span>
                  </div>
                </div>

                <div className={`rounded-xl border p-3.5 ${isLight ? "bg-black/[0.01] border-black/[0.05]" : "bg-white/[0.01] border-white/[0.05]"}`}>
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500 mb-1">Teacher Remarks</h5>
                  <p className={`text-xs italic leading-relaxed ${styles.textSecondary} opacity-85`}>
                    &ldquo;{selectedFeedback.comment}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isLight ? "hover:bg-black/5 border-black/10 text-black/70" : "hover:bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const classId = mapSubjectToClassId(selectedFeedback.subject);
                    if (onNavigateToTask) {
                      onNavigateToTask(classId, "assignments", selectedFeedback.id);
                    }
                    if (onTabChange) {
                      onTabChange("class-space");
                    }
                    setSelectedFeedback(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
                >
                  Open in Class Space
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
