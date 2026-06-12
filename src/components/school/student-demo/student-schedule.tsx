"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type BlockType = "class" | "free" | "break" | "event";

type ScheduleBlock = {
  id: string;
  block: number;
  time: string;
  title: string;
  room?: string;
  type: BlockType;
  isOverride?: boolean;
  overrideLabel?: string;
  /** Maps a class title to the class-space ID */
  classId?: string;
};

type WeekSchedule = {
  [day: string]: ScheduleBlock[];
};

// class title → class-space id mapping
const CLASS_ID_MAP: Record<string, string> = {
  "DP1 Physics HL": "physics",
  "Math AA HL": "math",
  "English A HL": "english",
  "Chemistry SL": "chemistry",
  "Spanish B SL": "spanish",
  "Psychology SL": "psychology",
};

const WEEK_SCHEDULE: WeekSchedule = {
  Monday: [
    { id: "mon-1", block: 1, time: "08:00 – 09:20", title: "DP1 Physics HL", room: "Room S504", type: "class", classId: "physics" },
    { id: "mon-2", block: 2, time: "09:30 – 10:50", title: "Math AA HL", room: "Room M302", type: "class", classId: "math" },
    { id: "mon-3", block: 3, time: "11:00 – 12:20", title: "Psychology SL", room: "Room S402", type: "class", classId: "psychology" },
    { id: "mon-brk", block: 0, time: "12:20 – 13:10", title: "Lunch Break", type: "break" },
    { id: "mon-5", block: 5, time: "13:10 – 14:30", title: "English A HL", room: "Room E201", type: "class", classId: "english" },
    { id: "mon-6", block: 6, time: "14:40 – 16:00", title: "Chemistry SL", room: "Lab S102", type: "class", classId: "chemistry" },
  ],
  Tuesday: [
    { id: "tue-1", block: 1, time: "08:00 – 09:20", title: "Math AA HL", room: "Room M302", type: "class", classId: "math" },
    { id: "tue-2", block: 2, time: "09:30 – 10:50", title: "Spanish B SL", room: "Room L105", type: "class", classId: "spanish" },
    { id: "tue-3", block: 3, time: "11:00 – 12:20", title: "DP1 Physics HL", room: "Room S504", type: "class", classId: "physics" },
    { id: "tue-brk", block: 0, time: "12:20 – 13:10", title: "Lunch Break", type: "break" },
    { id: "tue-5", block: 5, time: "13:10 – 14:30", title: "Psychology SL", room: "Room S402", type: "class", classId: "psychology" },
    { id: "tue-6", block: 6, time: "14:40 – 16:00", title: "English A HL", room: "Room E201", type: "class", classId: "english" },
  ],
  Wednesday: [
    { id: "wed-1", block: 1, time: "08:00 – 09:20", title: "Chemistry SL", room: "Lab S102", type: "class", classId: "chemistry" },
    { id: "wed-2", block: 2, time: "09:30 – 10:50", title: "Math AA HL", room: "Room M302", type: "class", classId: "math" },
    { id: "wed-3", block: 3, time: "11:00 – 12:20", title: "University Admissions Workshop", room: "Main Hall", type: "event", isOverride: true, overrideLabel: "Schedule Override" },
    { id: "wed-brk", block: 0, time: "12:20 – 13:10", title: "Lunch Break", type: "break" },
    { id: "wed-5", block: 5, time: "13:10 – 14:30", title: "Spanish B SL", room: "Room L105", type: "class", classId: "spanish" },
    { id: "wed-6", block: 6, time: "14:40 – 16:00", title: "DP1 Physics HL", room: "Room S504", type: "class", classId: "physics" },
  ],
  Thursday: [
    { id: "thu-1", block: 1, time: "08:00 – 09:20", title: "DP1 Physics HL", room: "Room S504", type: "class", classId: "physics" },
    { id: "thu-2", block: 2, time: "09:30 – 10:50", title: "Math AA HL", room: "Room M302", type: "class", classId: "math" },
    { id: "thu-3", block: 3, time: "11:00 – 12:20", title: "Psychology SL", room: "Room S402", type: "class", classId: "psychology" },
    { id: "thu-brk", block: 0, time: "12:20 – 13:10", title: "Lunch Break", type: "break" },
    { id: "thu-5", block: 5, time: "13:10 – 14:30", title: "English A HL", room: "Room E201", type: "class", classId: "english" },
    { id: "thu-6", block: 6, time: "14:40 – 16:00", title: "Chemistry SL", room: "Lab S102", type: "class", classId: "chemistry" },
  ],
  Friday: [
    { id: "fri-1", block: 1, time: "08:00 – 09:20", title: "Spanish B SL", room: "Room L105", type: "class", classId: "spanish" },
    { id: "fri-2", block: 2, time: "09:30 – 10:50", title: "Chemistry SL", room: "Lab S102", type: "class", classId: "chemistry" },
    { id: "fri-3", block: 3, time: "11:00 – 12:20", title: "Psychology SL", room: "Room S402", type: "class", classId: "psychology" },
    { id: "fri-brk", block: 0, time: "12:20 – 13:10", title: "Lunch Break", type: "break" },
    { id: "fri-5", block: 5, time: "13:10 – 14:30", title: "Math AA HL", room: "Room M302", type: "class", classId: "math" },
    { id: "fri-6", block: 6, time: "14:40 – 16:00", title: "Free Block", type: "free" },
  ],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const BLOCKS_TIME = ["08:00 – 09:20", "09:30 – 10:50", "11:00 – 12:20", "12:20 – 13:10", "13:10 – 14:30", "14:40 – 16:00"];

const TYPE_BADGE = {
  class: { label: "Class", bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400", dot: "bg-cyan-500" },
  free:  { label: "Free",  bg: "bg-white/[0.04] border-white/[0.06]", text: "text-white/40", dot: "bg-white/30" },
  break: { label: "Break", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" },
  event: { label: "Event", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" },
};

const getBlockState = (day: string, blockId: string): "past" | "current" | "future" => {
  if (day !== "Monday") return "future";
  if (blockId === "mon-1") return "past";
  if (blockId === "mon-2") return "current";
  return "future";
};

const getDaySummary = (day: string) => {
  const blocks = WEEK_SCHEDULE[day] || [];
  return {
    classes: blocks.filter((b) => b.type === "class").length,
    free: blocks.filter((b) => b.type === "free").length,
    events: blocks.filter((b) => b.type === "event").length,
  };
};

type Reminder = { id: number; text: string; time: string };

function AxisReminderIcon({ className = "w-2.5 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" className="animate-pulse" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  theme?: Theme;
  onNavigateToClass?: (classId: string) => void;
};

export function StudentSchedule({ theme = "dark", onNavigateToClass }: Props) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  // ─── Reminder state ───────────────────────────────────────────────────────
  // blockId → list of reminders
  const [reminders, setReminders] = useState<Record<string, Reminder[]>>({});
  // which block is showing the quick-actions panel
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  // reminder modal
  const [reminderModalBlock, setReminderModalBlock] = useState<ScheduleBlock | null>(null);
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [addedToast, setAddedToast] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const summary = getDaySummary(selectedDay);

  // ─── Reminder helpers ─────────────────────────────────────────────────────
  const openReminderModal = (block: ScheduleBlock) => {
    setReminderModalBlock(block);
    setReminderText("");
    setReminderTime("08:00");
    setActiveMenuId(null);
  };

  const addReminder = () => {
    if (!reminderModalBlock || !reminderText.trim()) return;
    const newR: Reminder = { id: Date.now(), text: reminderText.trim(), time: reminderTime };
    setReminders((prev) => ({
      ...prev,
      [reminderModalBlock.id]: [...(prev[reminderModalBlock.id] || []), newR],
    }));
    setReminderText("");
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const removeReminder = (blockId: string, reminderId: number) => {
    setReminders((prev) => ({
      ...prev,
      [blockId]: (prev[blockId] || []).filter((r) => r.id !== reminderId),
    }));
  };

  // ─── PDF download ─────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 32px; }
        h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #777; margin-bottom: 24px; letter-spacing: 0.08em; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f4f4f5; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 10px; border: 1px solid #e4e4e7; color: #555; }
        td { padding: 8px 10px; border: 1px solid #e4e4e7; font-size: 11px; vertical-align: top; }
        .time-col { color: #777; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .class-cell { font-weight: 700; color: #06b6d4; }
        .free-cell  { color: #aaa; }
        .break-cell { color: #10b981; font-weight: 600; }
        .event-cell { color: #f59e0b; font-weight: 700; }
        .room { font-size: 9px; color: #999; margin-top: 2px; font-weight: 400; }
        .footer { margin-top: 20px; font-size: 9px; color: #bbb; text-align: right; }
      </style>
    `;

    const tableRows = BLOCKS_TIME.map((timeRange, index) => {
      const cells = DAYS.map((day) => {
        const event = (WEEK_SCHEDULE[day] || [])[index];
        if (!event) return "<td></td>";
        const typeClass = `${event.type}-cell`;
        return `<td><span class="${typeClass}">${event.title}</span>${event.room ? `<div class="room">${event.room}</div>` : ""}</td>`;
      }).join("");
      return `<tr><td class="time-col">${timeRange}</td>${cells}</tr>`;
    }).join("");

    const headCells = DAYS.map((d) => `<th>${d}</th>`).join("");

    const html = `<!DOCTYPE html><html><head><title>Weekly Schedule – Chloe Vance</title>${printStyles}</head><body>
      <h1>My Weekly Schedule</h1>
      <div class="subtitle">Chloe Vance · DP1 · Axis International School · Week of Jun 12, 2026</div>
      <table>
        <thead><tr><th>Time</th>${headCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Generated by Axis School Platform · ${new Date().toLocaleDateString()}</div>
    </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={printRef}
        className={`rounded-2xl border p-6 backdrop-blur-md md:p-8 ${styles.cardBg} ${
          isLight ? "shadow-[0_12px_64px_rgba(0,0,0,0.08)]" : "shadow-[0_12px_64px_rgba(0,0,0,0.7)]"
        }`}
      >
        <div className="flex flex-col gap-6">

          {/* ─── Header ─── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>
                Personal Schedule
              </span>
              <h3 className={`text-xl font-bold tracking-tight mt-1 ${styles.textPrimary}`}>My Schedule</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                title="Download weekly schedule as PDF"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${
                  isLight
                    ? "bg-black/[0.03] border-black/[0.08] text-black/60 hover:bg-black/[0.06]"
                    : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export PDF
              </button>

              {/* View Mode Toggle */}
              <div className={`flex rounded-xl p-1 border ${
                isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.05]"
              }`}>
                {(["day", "week"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                      viewMode === mode
                        ? isLight ? "bg-black text-white" : "bg-white/[0.06] text-white"
                        : "text-inherit opacity-50 hover:opacity-80"
                    }`}
                  >
                    {mode === "day" ? "Day View" : "Week View"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Day Navigator (day view only) ─── */}
          {viewMode === "day" && (
            <>
              <div className={`flex rounded-xl p-1 select-none border ${
                isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.05]"
              }`}>
                {DAYS.map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className="relative flex-1 py-2.5 text-xs font-bold tracking-tight text-center rounded-lg focus:outline-none"
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="studentScheduleDayBG"
                          className={`absolute inset-0 rounded-lg border ${
                            isLight
                              ? "bg-white border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                              : "bg-white/[0.06] border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 ${
                        isSelected ? styles.textPrimary + " font-bold" : `${styles.textSecondary} opacity-60 hover:opacity-100`
                      }`}>
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Summary Strip */}
              <div className={`flex items-center gap-4 text-xs font-semibold ${styles.textSecondary} opacity-60`}>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-500/50" />Classes: {summary.classes}</span>
                <span className="opacity-20">|</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-zinc-500/50" />Free Blocks: {summary.free}</span>
                <span className="opacity-20">|</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500/50" />Events: {summary.events}</span>
              </div>
            </>
          )}

          {/* ─── Schedule Content ─── */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode === "day" ? selectedDay : "week-grid"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {viewMode === "day" ? (
                  /* ─────── Day View ─────── */
                  WEEK_SCHEDULE[selectedDay].map((item) => {
                    const state = getBlockState(selectedDay, item.id);
                    const badge = TYPE_BADGE[item.type];
                    const isOverride = item.isOverride;
                    const blockReminders = reminders[item.id] || [];
                    const isMenuOpen = activeMenuId === item.id;
                    const isClass = item.type === "class";

                    return (
                      <div key={item.id} className="relative">
                        <div
                          className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${
                            state === "past"
                              ? `opacity-40 ${styles.border} ${isLight ? "bg-black/[0.01]" : "bg-white/[0.005]"}`
                              : state === "current"
                                ? `border-cyan-500/30 ${isLight ? "bg-gradient-to-r from-cyan-500/[0.05] to-cyan-500/[0.01]" : "bg-gradient-to-r from-white/[0.04] to-white/[0.01]"} shadow-[0_8px_32px_rgba(0,0,0,0.15)] scale-[1.005]`
                                : isOverride
                                  ? "border-amber-500/25 bg-amber-500/[0.02]"
                                  : `${styles.border} ${isLight ? "bg-white hover:bg-black/[0.01]" : "bg-white/[0.01] hover:border-white/[0.08]"}`
                          }`}
                        >
                          {/* Current-block breathing glow */}
                          {state === "current" && (
                            <motion.div
                              className="absolute inset-0 pointer-events-none rounded-2xl border border-cyan-500/30"
                              animate={{ opacity: [0.2, 0.6, 0.2] }}
                              transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            />
                          )}
                          {/* Override glow */}
                          {isOverride && state !== "past" && (
                            <motion.div
                              className="absolute inset-0 pointer-events-none rounded-2xl border border-amber-500/30"
                              animate={{ opacity: [0.15, 0.4, 0.15] }}
                              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            />
                          )}

                          {/* Main row */}
                          <div className="flex flex-col md:flex-row md:items-stretch min-h-[76px]">
                            {/* Left */}
                            <div className="flex-1 p-5 flex flex-col justify-center gap-2.5">
                              <div className="flex flex-wrap items-baseline gap-3">
                                <span className={`font-mono text-xs font-semibold ${styles.textSecondary} opacity-60`}>{item.time}</span>
                                {item.block > 0 && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    isLight ? "bg-black/[0.03] border-black/[0.06] text-black/50" : "bg-white/[0.05] border-white/[0.06] text-white/55"
                                  }`}>
                                    Block {item.block}
                                  </span>
                                )}
                              </div>

                              <h4 className={`text-sm font-bold tracking-tight ${styles.textPrimary}`}>{item.title}</h4>

                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                                {isOverride && item.overrideLabel && (
                                  <span className="rounded bg-amber-500/[0.08] border border-amber-500/25 px-2 py-0.5 text-[8px] font-bold text-amber-500 uppercase tracking-wide">
                                    {item.overrideLabel}
                                  </span>
                                )}
                                {blockReminders.length > 0 && (
                                  <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    isLight ? "bg-violet-500/10 border-violet-500/20 text-violet-600" : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                  }`}>
                                    <AxisReminderIcon className="w-2.5 h-2.5" />
                                    {blockReminders.length} reminder{blockReminders.length > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Right — Location + Actions */}
                            <div className={`w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l p-4 flex flex-col justify-center items-start md:items-end gap-3 ${
                              isLight ? "border-black/[0.05] bg-black/[0.002]" : "border-white/[0.05] bg-white/[0.005]"
                            }`}>
                              <div className="flex flex-col items-end gap-0.5">
                                <span className={`text-[9px] uppercase font-bold tracking-wider ${styles.textSecondary} opacity-50`}>Venue</span>
                                <span className={`text-xs font-bold ${item.room ? styles.textPrimary : styles.textSecondary + " opacity-60"}`}>
                                  {item.room || "Flexible"}
                                </span>
                              </div>

                              {/* Action buttons — only for interactable blocks */}
                              {(isClass || item.type === "event") && (
                                <div className="flex items-center gap-1.5">
                                  {/* Reminder button */}
                                  <button
                                    onClick={() => openReminderModal(item)}
                                    title="Set reminder"
                                    className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border transition-all hover:scale-105 ${
                                      isLight
                                        ? "bg-violet-500/10 border-violet-500/20 text-violet-600 hover:bg-violet-500/20"
                                        : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20"
                                    }`}
                                  >
                                    <AxisReminderIcon className="w-2.5 h-2.5" />
                                    Remind
                                  </button>

                                  {/* Go to Class Space — only if we have a mapping */}
                                  {isClass && item.classId && onNavigateToClass && (
                                    <button
                                      onClick={() => onNavigateToClass(item.classId!)}
                                      title="Go to class space"
                                      className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border transition-all hover:scale-105 ${
                                        isLight
                                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 hover:bg-cyan-500/20"
                                          : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
                                      }`}
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                      </svg>
                                      Class Space
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reminders list (inline, collapsible) */}
                          <AnimatePresence>
                            {blockReminders.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className={`overflow-hidden border-t ${isLight ? "border-black/[0.05]" : "border-white/[0.05]"}`}
                              >
                                <div className={`px-5 py-3 space-y-1.5 ${isLight ? "bg-violet-500/[0.02]" : "bg-violet-500/[0.02]"}`}>
                                  <p className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40 mb-2`}>Reminders</p>
                                  {blockReminders.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <AxisReminderIcon className="w-3 h-3 text-violet-400 shrink-0" />
                                        <span className={`text-xs ${styles.textPrimary}`}>{r.text}</span>
                                        <span className={`text-[9px] font-mono ${styles.textSecondary} opacity-50`}>@ {r.time}</span>
                                      </div>
                                      <button
                                        onClick={() => removeReminder(item.id, r.id)}
                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-all hover:scale-105 ${
                                          isLight
                                            ? "border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                                            : "border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                                        }`}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* ─────── Week View ─────── */
                  <div className={`w-full overflow-x-auto rounded-2xl border ${styles.border}`}>
                    <table className="w-full min-w-[600px] border-collapse text-left">
                      <thead>
                        <tr className={`border-b ${isLight ? "border-black/[0.08] bg-black/[0.01]" : "border-white/[0.08] bg-white/[0.01]"}`}>
                          <th className={`p-3 text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50 w-24`}>Time</th>
                          {DAYS.map((d) => (
                            <th key={d} className={`p-3 text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? "divide-black/[0.05]" : "divide-white/[0.05]"}`}>
                        {BLOCKS_TIME.map((timeRange, index) => {
                          const isBreak = index === 3;
                          return (
                            <tr key={timeRange} className={`transition-colors ${isBreak ? "opacity-60" : ""}`}>
                              <td className={`p-3 font-mono text-[10px] font-semibold ${styles.textSecondary} opacity-60`}>{timeRange}</td>
                              {DAYS.map((day) => {
                                const event = (WEEK_SCHEDULE[day] || [])[index];
                                if (!event) return <td key={day} className="p-3" />;
                                const abbrev = event.title.split(" ").slice(0, 2).join(" ");
                                const blockRems = reminders[event.id] || [];
                                return (
                                  <td key={day} className="p-2">
                                    <div className={`relative rounded-xl border p-2.5 text-center min-h-[52px] flex flex-col justify-center transition-all ${
                                      event.type === "class" && event.classId && onNavigateToClass
                                        ? "cursor-pointer hover:scale-[1.03]"
                                        : ""
                                    } ${TYPE_BADGE[event.type].bg}`}
                                      onClick={() => {
                                        if (event.type === "class" && event.classId && onNavigateToClass) {
                                          onNavigateToClass(event.classId);
                                        }
                                      }}
                                    >
                                      <span className="block text-[10px] font-bold leading-none">{abbrev}</span>
                                      {event.room && <span className="block text-[8px] mt-1 opacity-60 leading-none">{event.room}</span>}
                                      {blockRems.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5"><AxisReminderIcon className="w-2.5 h-2.5 text-violet-400" /></span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="flex items-center gap-4 mt-4 px-3 pb-3">
                      {(["class", "free", "event", "break"] as BlockType[]).map((t) => (
                        <span key={t} className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-60`}>
                          <span className={`size-2 rounded-full ${TYPE_BADGE[t].dot}`} />
                          {TYPE_BADGE[t].label}
                        </span>
                      ))}
                      {onNavigateToClass && (
                        <span className={`text-[9px] ${styles.textSecondary} opacity-40 ml-auto`}>Click a class cell to open Class Space</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Reminder Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reminderModalBlock && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setReminderModalBlock(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`relative z-10 w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
                isLight ? "bg-white border-black/[0.08]" : "bg-[#0e0e10] border-white/[0.08]"
              }`}
            >
              {/* Modal header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? "border-black/[0.07]" : "border-white/[0.07]"}`}>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${styles.textPrimary}`}><AxisReminderIcon className="w-4 h-4 text-violet-400" />Set Reminder</h3>
                  <p className={`text-[10px] mt-0.5 ${styles.textSecondary} opacity-50`}>{reminderModalBlock.title} · {reminderModalBlock.time}</p>
                </div>
                <button onClick={() => setReminderModalBlock(null)} className={`text-xs ${styles.textSecondary} opacity-40 hover:opacity-80 transition-opacity`}>✕</button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Add new reminder */}
                <div className="space-y-3">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>Add Reminder</p>
                  <input
                    type="text"
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addReminder(); }}
                    placeholder="e.g. Bring IA draft, revise kinematics..."
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-violet-500/30 transition-all ${
                      isLight
                        ? "bg-black/[0.04] border border-black/[0.08] placeholder:text-black/30 text-black/80"
                        : "bg-white/[0.04] border border-white/[0.08] placeholder:text-white/20 text-white/80"
                    }`}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <p className={`text-[9px] uppercase tracking-wider font-semibold ${styles.textSecondary} opacity-40`}>Reminder Time</p>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className={`w-full text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-violet-500/30 transition-all ${
                          isLight
                            ? "bg-black/[0.04] border border-black/[0.08] text-black/80"
                            : "bg-white/[0.04] border border-white/[0.08] text-white/80"
                        }`}
                      />
                    </div>
                    <button
                      onClick={addReminder}
                      disabled={!reminderText.trim()}
                      className="mt-5 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition-all hover:scale-105"
                    >
                      Add
                    </button>
                  </div>

                  {/* Toast */}
                  <AnimatePresence>
                    {addedToast && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-emerald-400 font-semibold"
                      >
                        ✓ Reminder added
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Existing reminders */}
                {(reminders[reminderModalBlock.id] || []).length > 0 && (
                  <div className={`rounded-2xl border p-4 space-y-2 ${isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.05]"}`}>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-40`}>
                      Active Reminders ({reminders[reminderModalBlock.id].length})
                    </p>
                    {(reminders[reminderModalBlock.id] || []).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <AxisReminderIcon className="w-3 h-3 text-violet-400 shrink-0" />
                          <span className={`text-xs truncate ${styles.textPrimary}`}>{r.text}</span>
                          <span className={`text-[9px] font-mono shrink-0 ${styles.textSecondary} opacity-50`}>@ {r.time}</span>
                        </div>
                        <button
                          onClick={() => removeReminder(reminderModalBlock.id, r.id)}
                          className={`shrink-0 text-[9px] px-2 py-0.5 rounded-lg border transition-all hover:scale-105 ${
                            isLight
                              ? "border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                              : "border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t ${isLight ? "border-black/[0.07]" : "border-white/[0.07]"} flex justify-end`}>
                <button
                  onClick={() => setReminderModalBlock(null)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                    isLight ? "bg-black/[0.05] text-black/60 hover:bg-black/[0.1]" : "bg-white/[0.05] text-white/50 hover:bg-white/[0.1]"
                  }`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
