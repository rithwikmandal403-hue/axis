"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type Announcement = {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
  priority: "normal" | "important" | "urgent";
  audiences: string[];
  saved: boolean;
};

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "End of Term Schedule Changes",
    message: "Please note that from June 15th onwards, all DP classes will follow a modified examination preparation schedule. Regular timetables will be suspended. Check your updated schedule in My Schedule for the revised block assignments.",
    date: "Jun 10, 2026",
    author: "IB Programme Coordinator",
    priority: "important",
    audiences: ["All Students", "DP1", "DP2"],
    saved: false,
  },
  {
    id: "ann-2",
    title: "University Fair Registration Now Open",
    message: "The annual Axis University Fair will be held on June 20th in the Main Hall. Over 40 universities from 12 countries will be represented. Registration is mandatory for all DP1 and DP2 students. Sign up through the link below.",
    date: "Jun 8, 2026",
    author: "College Counseling Office",
    priority: "important",
    audiences: ["DP1", "DP2"],
    saved: false,
  },
  {
    id: "ann-3",
    title: "Science Department Lab Access Update",
    message: "Labs S102, S104, and S504 will be available for supervised independent work every Tuesday and Thursday from 16:00-17:30. Students must register with the lab technician at least 24 hours in advance.",
    date: "Jun 5, 2026",
    author: "Science Department",
    priority: "normal",
    audiences: ["All Students"],
    saved: false,
  },
  {
    id: "ann-4",
    title: "CAS Portfolio Submission Deadline Reminder",
    message: "All DP2 students are reminded that the final CAS portfolio submission deadline is June 30th. Incomplete portfolios will result in a delay of your IB diploma certification. Please ensure all reflections, evidence, and supervisor endorsements are uploaded.",
    date: "Jun 3, 2026",
    author: "CAS Coordinator",
    priority: "urgent",
    audiences: ["DP2"],
    saved: false,
  },
  {
    id: "ann-5",
    title: "Library Extended Hours During Exam Period",
    message: "The school library will extend its hours during the examination period (June 15-28). New hours: Monday-Friday 07:00-20:00, Saturday 09:00-17:00. Quiet study zones will be enforced throughout.",
    date: "Jun 1, 2026",
    author: "Library Services",
    priority: "normal",
    audiences: ["All Students"],
    saved: false,
  },
];

export function StudentAnnouncements({ theme = "dark" }: { theme?: Theme }) {
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<"all" | "important" | "urgent">("all");

  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || a.priority === filterPriority || (filterPriority === "important" && a.priority === "urgent");
    return matchesSearch && matchesPriority;
  });

  const toggleSave = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a))
    );
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${styles.textPrimary}`}>
      {/* Header */}
      <div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>
          School Communications
        </span>
        <h2 className={`text-xl font-medium tracking-tight mt-1 ${styles.textPrimary}`}>Announcements</h2>
        <p className={`text-xs mt-1 ${styles.textSecondary} opacity-60`}>Stay informed about school updates and important notices.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${styles.textSecondary} opacity-40`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${
              isLight
                ? "border-black/[0.08] bg-black/[0.01] text-black placeholder-black/35 focus:border-cyan-600/30"
                : "border-white/[0.06] bg-white/[0.02] text-white placeholder-white/20 focus:border-white/15"
            }`}
          />
        </div>
        <div className={`flex rounded-xl p-1 border ${
          isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.05]"
        }`}>
          {(["all", "important", "urgent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterPriority(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                filterPriority === f
                  ? isLight ? "bg-black/[0.06] text-black" : "bg-white/[0.06] text-white"
                  : `${styles.textSecondary} opacity-50 hover:opacity-85`
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAnnouncements.map((ann, i) => {
            const isExpanded = expandedId === ann.id;
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${styles.cardBg} ${
                  isLight ? "hover:bg-black/[0.01]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div className={`mt-1 shrink-0 size-2 rounded-full ${
                    ann.priority === "urgent" ? "bg-rose-500 animate-pulse" :
                    ann.priority === "important" ? "bg-amber-500" :
                    isLight ? "bg-black/20" : "bg-white/20"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`text-sm font-semibold ${styles.textPrimary}`}>{ann.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] ${styles.textSecondary} opacity-50`}>{ann.date}</span>
                          <span className={`text-[10px] ${styles.textSecondary} opacity-30`}>·</span>
                          <span className={`text-[10px] ${styles.textSecondary} opacity-50`}>{ann.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ann.priority !== "normal" && (
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                            ann.priority === "urgent"
                              ? isLight ? "text-rose-700 border-rose-500/25 bg-rose-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5"
                              : isLight ? "text-amber-700 border-amber-500/25 bg-amber-500/5" : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                          }`}>
                            {ann.priority}
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(ann.id); }}
                          className="transition-all"
                          title={ann.saved ? "Unsave" : "Save"}
                        >
                          <svg
                            className={`size-4 transition-all ${ann.saved ? "text-cyan-400 fill-cyan-400/80" : isLight ? "text-black/20 hover:text-black/50" : "text-white/20 hover:text-white/50"}`}
                            fill={ann.saved ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499c.174-.347.674-.347.848 0l2.4 4.859a.5.5 0 00.377.275l5.358.779c.383.056.537.525.26.801l-3.878 3.78a.5.5 0 00-.144.444l.917 5.337c.066.383-.336.674-.68.492l-4.795-2.52a.5.5 0 00-.47 0l-4.795 2.52c-.344.183-.746-.109-.68-.492l.917-5.337a.5.5 0 00-.144-.444L3.982 11.21c-.277-.276-.123-.745.26-.801l5.358-.779a.5.5 0 00.377-.275l2.4-4.859z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {!isExpanded && (
                      <p className={`text-xs mt-2 line-clamp-1 ${styles.textSecondary} opacity-60`}>{ann.message}</p>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 ml-6 space-y-3">
                        <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-80`}>{ann.message}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-50`}>Audience:</span>
                          {ann.audiences.map((a) => (
                            <span key={a} className={`text-[9px] px-1.5 py-0.5 rounded border ${
                              isLight ? "text-black/50 bg-black/[0.02] border-black/[0.06]" : "text-white/45 bg-white/[0.03] border-white/[0.06]"
                            }`}>
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <span className={`text-xs ${styles.textSecondary} opacity-40`}>No announcements match your search.</span>
          </div>
        )}
      </div>
    </div>
  );
}
