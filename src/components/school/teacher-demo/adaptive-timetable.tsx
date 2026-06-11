"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReminderItem } from "./current-class";

type TimelineEvent = {
  id: string;
  block: number;
  time: string;
  durationMin: number;
  type: "class" | "sync" | "free" | "break" | "meeting" | "prep" | "homeroom";
  title?: string;
  room?: string;
  students?: number;
  adjustment?: string;
  details?: string;
};

type TimelineSchedule = {
  [day: string]: TimelineEvent[];
};

const WEEK_SCHEDULE: TimelineSchedule = {
  Monday: [
    { id: "ev-1", block: 1, time: "08:00  -  09:20", durationMin: 80, type: "class", title: "DP2 Physics HL", room: "Room B204", students: 24, details: "Core IB Physics Curriculum. Focus on Quantum Phenomena." },
    { id: "ev-2", block: 2, time: "09:30  -  10:50", durationMin: 80, type: "free", title: "Free Block", details: "No scheduled class. Available for grading." },
    { id: "ev-3", block: 3, time: "11:00  -  12:20", durationMin: 80, type: "class", title: "DP1 Physics HL", room: "Science Lab 2", students: 18, details: "Introduction to Kinematics. Lab equipment required." },
    { id: "ev-break", block: 4, time: "12:20  -  13:10", durationMin: 50, type: "break", title: "Lunch Break", details: "Staff lunch." },
    { id: "ev-4", block: 5, time: "13:10  -  14:30", durationMin: 80, type: "meeting", title: "Department Planning", room: "Science Office", details: "Weekly physics department synchronization." },
    { id: "ev-5", block: 6, time: "14:40  -  16:00", durationMin: 80, type: "class", title: "DP2 Physics HL", room: "Room B204", students: 24, details: "Problem solving session." },
    { id: "ev-6", block: 7, time: "16:10  -  17:00", durationMin: 50, type: "free", title: "Preparation Period", details: "Lesson prep for tomorrow." },
  ],
  Tuesday: [
    { id: "ev-t1", block: 1, time: "08:00  -  08:30", durationMin: 30, type: "homeroom", title: "Homeroom Advisory", room: "Room B204", students: 22, details: "Morning check-in." },
    { id: "ev-t2", block: 2, time: "08:30  -  09:50", durationMin: 80, type: "class", title: "DP1 Physics HL", room: "Science Lab 2", students: 18, details: "Kinematics." },
    { id: "ev-t3", block: 3, time: "10:05  -  11:20", durationMin: 75, type: "free", title: "Free Block", details: "Planning time." },
    { id: "ev-t4", block: 4, time: "11:30  -  12:50", durationMin: 80, type: "class", title: "MYP Physics", room: "Room B204", students: 26, details: "Energy and work." },
    { id: "ev-t5", block: 5, time: "12:50  -  13:40", durationMin: 50, type: "break", title: "Lunch Break", details: "Lunch." },
    { id: "ev-t6", block: 6, time: "13:40  -  15:00", durationMin: 80, type: "meeting", title: "Grade Level Meeting", room: "Staff Room", details: "Student welfare discussion." },
  ],
  Wednesday: [
    { id: "ev-w1", block: 1, time: "08:00  -  09:20", durationMin: 80, type: "prep", title: "Preparation Period", details: "Lab setup for chemistry." },
    { id: "ev-w2", block: 2, time: "09:30  -  10:50", durationMin: 80, type: "class", title: "DP2 Physics HL", room: "Room B204", students: 24, details: "Practical investigations." },
    { id: "ev-w3", block: 3, time: "11:00  -  12:20", durationMin: 80, type: "class", title: "DP1 Chemistry SL", room: "Science Lab 1", students: 20, details: "Stoichiometry." },
    { id: "ev-w4", block: 4, time: "12:20  -  13:10", durationMin: 50, type: "break", title: "Lunch Break", details: "Lunch." },
    { id: "ev-w5", block: 5, time: "13:10  -  14:30", durationMin: 80, type: "free", title: "Free Block", details: "Marking." },
    { id: "ev-w6", block: 6, time: "14:40  -  16:00", durationMin: 80, type: "class", title: "MYP Physics", room: "Room B204", students: 26, details: "Thermal physics." },
  ],
  Thursday: [
    { id: "ev-th1", block: 1, time: "08:00  -  09:20", durationMin: 80, type: "class", title: "DP1 Physics HL", room: "Science Lab 2", students: 18, details: "Momentum." },
    { id: "ev-th2", block: 2, time: "09:30  -  10:50", durationMin: 80, type: "class", title: "MYP Physics", room: "Room B204", students: 26, details: "Thermal physics." },
    { id: "ev-th3", block: 3, time: "11:00  -  12:20", durationMin: 80, type: "free", title: "Free Block", details: "Admin." },
    { id: "ev-th4", block: 4, time: "12:20  -  13:10", durationMin: 50, type: "break", title: "Lunch Break", details: "Lunch." },
    { id: "ev-th5", block: 5, time: "13:10  -  14:30", durationMin: 80, type: "meeting", title: "Subject Leads Alignment", room: "Conference Room A", details: "Curriculum mapping." },
    { id: "ev-th6", block: 6, time: "14:40  -  16:00", durationMin: 80, type: "class", title: "DP2 Physics HL", room: "Room B204", students: 24, details: "Review session." },
  ],
  Friday: [
    { id: "ev-f1", block: 1, time: "08:00  -  08:30", durationMin: 30, type: "homeroom", title: "Homeroom Advisory", room: "Room B204", students: 22, details: "Weekly wrap-up." },
    { id: "ev-f2", block: 2, time: "08:30  -  09:50", durationMin: 80, type: "class", title: "DP1 Chemistry SL", room: "Science Lab 1", students: 20, details: "Lab reports." },
    { id: "ev-f3", block: 3, time: "10:05  -  11:20", durationMin: 75, type: "prep", title: "Preparation Period", details: "Next week planning." },
    { id: "ev-f4", block: 4, time: "11:30  -  12:50", durationMin: 80, type: "class", title: "MYP Physics", room: "Room B204", students: 26, details: "Assessment." },
    { id: "ev-f5", block: 5, time: "12:50  -  13:40", durationMin: 50, type: "break", title: "Lunch Break", details: "Lunch." },
    { id: "ev-f6", block: 6, time: "13:40  -  15:00", durationMin: 80, type: "free", title: "Free Block", details: "Early finish." },
  ],
};

type AdaptiveTimetableProps = {
  reminders: ReminderItem[];
  onAddReminder: (text: string, targetType: "class" | "room" | "group" | "slot", targetName: string) => void;
  onSnoozeReminder: (id: string) => void;
  onArchiveReminder: (id: string) => void;
};

const GRADES = ["PYP Grade 1", "PYP Grade 2", "PYP Grade 3", "PYP Grade 4", "PYP Grade 5", "MYP Grade 6", "MYP Grade 7", "MYP Grade 8", "MYP Grade 9", "MYP Grade 10", "DP Grade 11", "DP Grade 12", "CP Grade 11", "CP Grade 12"];

export function AdaptiveTimetable({
  reminders,
  onAddReminder,
  onSnoozeReminder,
  onArchiveReminder,
}: AdaptiveTimetableProps) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedGrade, setSelectedGrade] = useState("DP Grade 11");
  const [expandedId, setExpandedId] = useState<string | null>("ev-2");
  const [activeAddingId, setActiveAddingId] = useState<string | null>(null);
  const [reminderText, setReminderText] = useState("");
  const [reminderScope, setReminderScope] = useState<"class" | "room" | "slot">("class");
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Helper to check where the teacher is within the day (simulated for Monday Period 2)
  const getPeriodState = (day: string, evId: string): "past" | "current" | "future" => {
    if (day !== "Monday") return "future";
    if (evId === "ev-1") return "past";
    if (evId === "ev-2") return "current";
    return "future";
  };

  const handleAddReminder = (evId: string, eventBlock: number) => {
    if (!reminderText.trim()) return;

    let targetType: ReminderItem["targetType"] = "class";
    let targetName = `Block ${eventBlock}`;

    if (reminderScope === "slot") {
      targetType = "slot";
      targetName = `Block ${eventBlock}`;
    }

    onAddReminder(reminderText.trim(), targetType, targetName);
    setReminderText("");
    setActiveAddingId(null);
  };

  const triggerPDFExport = () => {
    setShowExportSuccess(true);
    setTimeout(() => {
      setShowExportSuccess(false);
    }, 3200);
  };

  const getBlockLabel = (block: number): string => {
    if (block === 5) return "Lunch Block";
    return `Block ${block}`;
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/30 p-6 shadow-[0_12px_64px_rgba(0,0,0,0.7)] backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                School Schedule
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium text-emerald-400">Universal Time Blocks</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-white mt-1">Your Timetable</h3>
            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-500/50" />
                Classes Today: {WEEK_SCHEDULE[selectedDay]?.filter(e => e.type === "class").length || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-500/50" />
                Free Blocks: {WEEK_SCHEDULE[selectedDay]?.filter(e => e.type === "free" || e.type === "prep").length || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-500/50" />
                Meetings: {WEEK_SCHEDULE[selectedDay]?.filter(e => e.type === "meeting").length || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-white/[0.02] border border-white/[0.05] p-1">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  viewMode === "day"
                    ? "bg-white/[0.06] text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                Day View
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  viewMode === "week"
                    ? "bg-white/[0.06] text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                Week View
              </button>
            </div>

            {/* Grade Selector for PDF */}
            <div className="relative">
              <button
                onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/80 hover:bg-white/[0.04] transition-all"
              >
                <svg
                  className="size-4 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </button>

              {showGradeDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0A0A0B] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2">
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider block mb-2">Select Grade</span>
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => {
                          setSelectedGrade(grade);
                          setShowGradeDropdown(false);
                          triggerPDFExport();
                        }}
                        className="w-full px-3 py-2 text-left text-[10px] text-white/80 hover:bg-white/[0.05] rounded-lg transition-all"
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Navigator - Only show in day view */}
        {viewMode === "day" && (
          <div className="flex rounded-xl bg-white/[0.02] border border-white/[0.05] p-1 select-none">
            {days.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setExpandedId(null);
                  }}
                  className="relative flex-1 py-2.5 text-xs font-semibold tracking-tight text-center rounded-lg focus:outline-none"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="timelineDayBG"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isSelected ? "text-white" : "text-white/45 hover:text-white/80"}`}>
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Horizontal Spatial Timetable List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode === "day" ? selectedDay : "week"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {viewMode === "day" ? (
                // Day View
                WEEK_SCHEDULE[selectedDay].map((item) => {
                  const isExpanded = expandedId === item.id;
                  const isAdding = activeAddingId === item.id;
                  const state = getPeriodState(selectedDay, item.id);

                  // Fetch reminders attached to this block
                  const eventReminders = reminders.filter(
                    (r) =>
                      (r.targetName === `Block ${item.block}` ||
                        r.targetName === getBlockLabel(item.block)) &&
                      r.status !== "archived"
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer select-none ${
                        state === "past"
                          ? "opacity-45 border-white/[0.02] bg-white/[0.005] hover:opacity-60"
                          : state === "current"
                          ? "border-white/20 bg-gradient-to-r from-white/[0.04] to-white/[0.01] shadow-[0_8px_32px_-6px_rgba(0,0,0,0.6)] scale-[1.008]"
                          : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"
                      }`}
                    >
                      {/* Subtle Breathing Glow for Current Active Period */}
                      {state === "current" && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none rounded-2xl border border-white/20"
                          animate={{ opacity: [0.2, 0.6, 0.2] }}
                          transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        />
                      )}

                      {/* Main Split Layout: Left Info Block, Right Venue block */}
                      <div className="flex flex-col md:flex-row md:items-stretch min-h-[80px]">
                        
                        {/* Left Block (Time, Block) */}
                        <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                          <div className="flex flex-wrap items-baseline gap-3">
                            <span className="font-mono text-xs font-semibold text-white/35">
                              {item.time}
                            </span>
                            <span className="text-[10px] text-white/20">({item.durationMin}m)</span>
                            <span className="text-[9px] font-semibold text-white/55 bg-white/[0.05] px-1.5 py-0.5 rounded">
                              {getBlockLabel(item.block)}
                            </span>
                            <h4 className="text-sm font-semibold tracking-tight text-white/90">
                              {item.title || (item.type === "break" ? "Break" : "Academic Period")}
                            </h4>
                          </div>

                          {/* Sub-info for classes */}
                          {item.students && (
                            <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
                              <span>{item.students} Students</span>
                            </div>
                          )}

                          {/* Middle Info & Indicators */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30 border border-white/10 bg-white/[0.02] px-1.5 py-0.5 rounded">
                              {item.type === "class" ? "Teaching" : item.type === "free" ? "Free" : item.type === "meeting" ? "Meeting" : item.type === "prep" ? "Planning" : item.type === "homeroom" ? "Homeroom" : "Break"}
                            </span>
                            {item.adjustment && (
                              <span className="rounded bg-amber-500/[0.06] border border-amber-500/20 px-2 py-0.5 text-[8px] font-semibold text-amber-400">
                                {item.adjustment}
                              </span>
                            )}
                            {eventReminders.length > 0 && (
                              <span className="text-[9px] text-sky-400/80 font-medium">
                                • {eventReminders.length} Active Reminders
                              </span>
                            )}
                          </div>

                          {/* Current Period visual timeline progression marker */}
                          {state === "current" && (
                            <div className="mt-3 space-y-1.5 pr-6">
                              <div className="flex items-center justify-between text-[8px] font-semibold text-white/30 uppercase tracking-widest leading-none">
                                <span>Active Period Progression</span>
                                <span>~52% Elapsed (42m remaining)</span>
                              </div>
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-white"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "52%" }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Block (Venue / Location) */}
                        <div className="w-full md:w-44 shrink-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-white/[0.005] p-5 flex flex-col justify-center items-start md:items-end">
                          <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider mb-1">
                            Location
                          </span>
                          <span className="text-xl font-bold text-white/95 text-right leading-tight truncate w-full md:text-right">
                            {item.room || "Flexible"}
                          </span>
                          <span className="text-[10px] text-white/40 mt-1 leading-none text-right">
                            {item.type === "class" ? "Classroom" : item.type === "free" ? "Free Space" : item.type === "break" ? "Break Area" : item.type === "meeting" ? "Meeting Room" : item.type === "prep" ? "Prep Area" : "Homeroom"}
                          </span>
                        </div>

                      </div>

                      {/* Expandable Context/Reminder Editor */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-white/[0.05] bg-black/[0.15] p-5 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
                              {item.details || "No additional details for this block."}
                            </p>

                            {/* Reminders section with full lifecycles */}
                            <div className="space-y-3 max-w-2xl">
                              <span className="text-[8px] text-white/35 font-bold uppercase tracking-widest block">
                                Block Reminders
                              </span>

                              {eventReminders.length > 0 && (
                                <div className="space-y-2">
                                  {eventReminders.map((rem) => (
                                    <div
                                      key={rem.id}
                                      className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-lg border ${
                                        rem.status === "snoozed"
                                          ? "bg-white/[0.005] border-white/5 text-white/30"
                                          : "bg-white/[0.01] border-white/10 text-white/70"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`size-1 rounded-full ${rem.status === "snoozed" ? "bg-white/20" : "bg-sky-400"}`} />
                                        <span className={rem.status === "snoozed" ? "line-through" : ""}>
                                          {rem.text}
                                        </span>
                                        {rem.status === "snoozed" && (
                                          <span className="text-[8px] text-white/25 italic border border-white/5 px-1 rounded">
                                            Snoozed
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {rem.status !== "snoozed" && (
                                          <button
                                            onClick={() => onSnoozeReminder(rem.id)}
                                            className="rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[9px] text-white/50"
                                          >
                                            Snooze
                                          </button>
                                        )}
                                        <button
                                          onClick={() => onArchiveReminder(rem.id)}
                                          className="rounded bg-white/10 hover:bg-white/25 px-2 py-0.5 text-[9px] text-white"
                                        >
                                          Resolve
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {isAdding ? (
                                <div className="space-y-3 border border-white/5 rounded-xl p-3 bg-black/40">
                                  <input
                                    type="text"
                                    placeholder="Type task or reminder note..."
                                    value={reminderText}
                                    onChange={(e) => setReminderText(e.target.value)}
                                    className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-1.5 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleAddReminder(item.id, item.block);
                                    }}
                                  />
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                      {(["class", "slot"] as const).map((scope) => (
                                        <button
                                          key={scope}
                                          type="button"
                                          onClick={() => setReminderScope(scope)}
                                          className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                                            reminderScope === scope
                                              ? "bg-white text-black"
                                              : "bg-white/[0.02] border border-white/5 text-white/40 hover:text-white"
                                          }`}
                                        >
                                          {scope}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAddReminder(item.id, item.block)}
                                        className="rounded-lg bg-white px-3 py-1 text-[10px] font-bold text-black hover:opacity-90"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setActiveAddingId(null)}
                                        className="rounded-lg border border-white/[0.08] px-3 py-1 text-[10px] text-white/60 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveAddingId(item.id);
                                    setReminderText("");
                                    setReminderScope("class");
                                  }}
                                  className="text-[9px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
                                >
                                  + Attach Reminder
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                // Week View
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left p-3 text-white/40 font-semibold">Block</th>
                        {days.map((day) => (
                          <th key={day} className="text-center p-3 text-white/40 font-semibold">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((block) => (
                        <tr key={block} className="border-b border-white/[0.04]">
                          <td className="p-3 font-semibold text-white/90">
                            {getBlockLabel(block)}
                          </td>
                          {days.map((day) => {
                            const event = WEEK_SCHEDULE[day].find((e) => e.block === block);
                            return (
                              <td key={day} className="p-3 text-center">
                                {event ? (
                                  <div className="text-white/70">
                                    <span className="font-mono text-[10px] text-white/40 block">{event.time}</span>
                                    <span className="text-[9px]">{event.type === "break" ? "Lunch" : "Class"}</span>
                                  </div>
                                ) : (
                                  <span className="text-white/20">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Export success banner */}
      <AnimatePresence>
        {showExportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0E0E10] px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.8)]"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/[0.1] border border-emerald-500/20 text-emerald-400">
              ✓
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-tight text-white">Timetable Exported</span>
              <span className="text-[10px] text-white/40 mt-0.5">{selectedGrade} timetable compiled to PDF.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

