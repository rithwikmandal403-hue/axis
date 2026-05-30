"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReminderItem } from "./current-class";

type TimelineEvent = {
  id: string;
  time: string;
  durationMin: number;
  subject: string;
  room: string;
  type: "class" | "sync" | "free" | "break";
  adjustment?: string;
  details?: string;
  occupancy?: string;
  opportunity?: string;
  section?: string;
};

type TimelineSchedule = {
  [day: string]: TimelineEvent[];
};

const WEEK_SCHEDULE: TimelineSchedule = {
  Monday: [
    {
      id: "ev-1",
      time: "08:00  -  08:30",
      durationMin: 30,
      subject: "Homeroom Advisory Roster",
      room: "Room 102",
      type: "class",
      section: "11-F",
      occupancy: "18/22 Synced",
      details: "Routine morning announcement sync & roster broadcast. Wi-Fi AP is tracking proximity verification.",
    },
    {
      id: "ev-2",
      time: "08:30  -  09:50",
      durationMin: 80,
      subject: "Grade 11 Physics (IB DP)",
      room: "Lab 3",
      type: "class",
      section: "DP1-B",
      adjustment: "Room reassigned (original: Lab 1)",
      occupancy: "22/22 Occupied",
      details: "Topic: Refraction & wave index principles. Laser refraction equipment is prepped in Lab 3.",
    },
    {
      id: "ev-3",
      time: "10:05  -  11:20",
      durationMin: 75,
      subject: "Counselor Sync & Timetable Prep",
      room: "Faculty Hub 4",
      type: "sync",
      section: "Coordination",
      opportunity: "Counselor Sarah Chen is available nearby in Room 102.",
      details: "Open workspace layer. Available for parent-teacher coordination or curriculum planning.",
    },
    {
      id: "ev-4",
      time: "11:30  -  12:50",
      durationMin: 80,
      subject: "Grade 12 Advanced Physics",
      room: "Lab 3",
      type: "class",
      section: "DP2-A",
      details: "Topic: Quantum mechanics & photo-electric variables. Workspace assignment checklist submission is active.",
    },
    {
      id: "ev-5",
      time: "12:50  -  13:40",
      durationMin: 50,
      subject: "Ecosystem Lunch Interval",
      room: "Faculty Lounge",
      type: "break",
      details: "Central school assembly adjustments active. Extended advisory schedule overlays will follow.",
    },
    {
      id: "ev-6",
      time: "13:40  -  15:00",
      durationMin: 80,
      subject: "Free Operational Window",
      room: "Room 4B",
      type: "free",
      section: "Self-study",
      adjustment: "Essential Space Available",
      opportunity: "Physics lab nearby is currently unused. 3 students are waiting for IA drafting feedback.",
      details: "No class assigned. Axis has released Room 4B as an 'Essential Space' to the student dashboard.",
    },
  ],
  Tuesday: [
    { id: "ev-7", time: "08:00  -  08:30", durationMin: 30, subject: "Homeroom Advisory Roster", room: "Room 102", type: "class", section: "11-F" },
    { id: "ev-8", time: "08:30  -  09:50", durationMin: 80, subject: "Grade 12 Advanced Physics", room: "Lab 3", type: "class", section: "DP2-A" },
    { id: "ev-9", time: "10:05  -  11:20", durationMin: 75, subject: "Free Operational Window", room: "Lab 3", type: "free", section: "Self-study" },
    { id: "ev-10", time: "11:30  -  12:50", durationMin: 80, subject: "Grade 11 Physics", room: "Lab 3", type: "class", section: "DP1-B" },
    { id: "ev-11", time: "12:50  -  13:40", durationMin: 50, subject: "Ecosystem Lunch Interval", room: "Faculty Lounge", type: "break" },
  ],
  Wednesday: [
    { id: "ev-12", time: "08:00  -  08:30", durationMin: 30, subject: "Homeroom Advisory Roster", room: "Room 102", type: "class", section: "11-F" },
    { id: "ev-13", time: "08:30  -  09:50", durationMin: 80, subject: "Grade 11 Physics", room: "Lab 3", type: "class", section: "DP1-B" },
    { id: "ev-14", time: "10:05  -  11:20", durationMin: 75, subject: "Counselor Sync & Prep", room: "Prep Room 4", type: "sync", section: "Coordination" },
    { id: "ev-15", time: "11:30  -  12:50", durationMin: 80, subject: "Grade 12 Advanced Physics", room: "Lab 3", type: "class", section: "DP2-A" },
  ],
  Thursday: [
    { id: "ev-16", time: "08:00  -  08:30", durationMin: 30, subject: "Homeroom Advisory Roster", room: "Room 102", type: "class", section: "11-F" },
    { id: "ev-17", time: "08:30  -  09:50", durationMin: 80, subject: "Grade 12 Advanced Physics", room: "Lab 3", type: "class", section: "DP2-A" },
    { id: "ev-18", time: "10:05  -  11:20", durationMin: 75, subject: "Free Operational Window", room: "Room 4B", type: "free", section: "Self-study" },
  ],
  Friday: [
    { id: "ev-19", time: "08:00  -  08:30", durationMin: 30, subject: "Homeroom Advisory Roster", room: "Room 102", type: "class", section: "11-F" },
    { id: "ev-20", time: "08:30  -  09:50", durationMin: 80, subject: "Grade 11 Physics", room: "Lab 3", type: "class", section: "DP1-B" },
    { id: "ev-21", time: "10:05  -  11:20", durationMin: 75, subject: "Staff Council assembly Sync", room: "Faculty Hub 4", type: "sync", section: "Coordination" },
  ],
};

type AdaptiveTimetableProps = {
  reminders: ReminderItem[];
  onAddReminder: (text: string, targetType: "class" | "room" | "group" | "slot", targetName: string) => void;
  onSnoozeReminder: (id: string) => void;
  onArchiveReminder: (id: string) => void;
};

export function AdaptiveTimetable({
  reminders,
  onAddReminder,
  onSnoozeReminder,
  onArchiveReminder,
}: AdaptiveTimetableProps) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [expandedId, setExpandedId] = useState<string | null>("ev-2"); // Default expand Period 2
  const [activeAddingId, setActiveAddingId] = useState<string | null>(null);
  const [reminderText, setReminderText] = useState("");
  const [reminderScope, setReminderScope] = useState<"class" | "room" | "slot">("class");
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Helper to check where the teacher is within the day (simulated for Monday Period 2)
  const getPeriodState = (day: string, evId: string): "past" | "current" | "future" => {
    if (day !== "Monday") return "future";
    if (evId === "ev-1") return "past";
    if (evId === "ev-2") return "current";
    return "future";
  };

  const handleAddReminder = (evId: string, eventSubject: string, eventRoom: string) => {
    if (!reminderText.trim()) return;

    let targetType: ReminderItem["targetType"] = "class";
    let targetName = eventSubject;

    if (reminderScope === "room") {
      targetType = "room";
      targetName = eventRoom;
    } else if (reminderScope === "slot") {
      targetType = "slot";
      targetName = evId === "ev-2" ? "Period 2" : evId === "ev-3" ? "Period 3" : "Timetable Slot";
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

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/30 p-6 shadow-[0_12px_64px_rgba(0,0,0,0.7)] backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                Ecosystem Chronometer
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium text-emerald-400">Horizontal Flow Active</span>
            </div>
            <h3 className="text-xl font-medium tracking-tight text-white mt-1">Spatial Timetable</h3>
          </div>

          <button
            onClick={triggerPDFExport}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/80 hover:bg-white/[0.04] transition-all self-start sm:self-auto"
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
            Export Flow Ledgers
          </button>
        </div>

        {/* Day Navigator */}
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

        {/* Horizontal Spatial Timetable List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {WEEK_SCHEDULE[selectedDay].map((item) => {
                const isExpanded = expandedId === item.id;
                const isAdding = activeAddingId === item.id;
                const state = getPeriodState(selectedDay, item.id);

                // Fetch reminders attached to this class or room or slot
                const eventReminders = reminders.filter(
                  (r) =>
                    (r.targetName === item.subject ||
                      r.targetName === item.room ||
                      (item.id === "ev-2" && r.targetName === "Period 2")) &&
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
                      
                      {/* Left Block (Time, Subject, Group) */}
                      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <span className="font-mono text-xs font-semibold text-white/35">
                            {item.time}
                          </span>
                          <span className="text-[10px] text-white/20">({item.durationMin}m)</span>
                          {item.section && (
                            <span className="text-[9px] font-semibold text-white/55 bg-white/[0.05] px-1.5 py-0.5 rounded">
                              {item.section}
                            </span>
                          )}
                          <h4 className="text-sm font-semibold tracking-tight text-white/90">
                            {item.subject}
                          </h4>
                        </div>

                        {/* Middle Info & Indicators */}
                        <div className="flex flex-wrap items-center gap-3">
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
                          {item.opportunity && (
                            <span className="text-[9px] text-emerald-400/80 font-medium truncate max-w-sm">
                              Opportunity: {item.opportunity.slice(0, 50)}...
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

                      {/* Right Venue Block (Visually separated) */}
                      <div className="w-full md:w-44 shrink-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-white/[0.005] p-5 flex flex-col justify-center items-start md:items-end">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider mb-1">
                          Room/Venue
                        </span>
                        <span className="text-lg font-medium text-white/95">{item.room}</span>
                        {item.occupancy && (
                          <span className="text-[10px] text-white/40 mt-1 leading-none">
                            {item.occupancy}
                          </span>
                        )}
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
                          onClick={(e) => e.stopPropagation()} // Prevent closing card on click
                        >
                          <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
                            {item.details || "No additional workflow specs registered for this event."}
                          </p>

                          {item.opportunity && (
                            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-3 text-xs text-emerald-400/90 leading-relaxed max-w-2xl">
                              <span className="text-[8px] font-bold text-emerald-400 block uppercase tracking-widest mb-1.5">
                                Ambient Opportunity
                              </span>
                              {item.opportunity}
                            </div>
                          )}

                          {/* Reminders section with full lifecycles */}
                          <div className="space-y-3 max-w-2xl">
                            <span className="text-[8px] text-white/35 font-bold uppercase tracking-widest block">
                              Timetable Slot Reminders
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
                                    if (e.key === "Enter") handleAddReminder(item.id, item.subject, item.room);
                                  }}
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    {(["class", "room", "slot"] as const).map((scope) => (
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
                                      onClick={() => handleAddReminder(item.id, item.subject, item.room)}
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
              })}
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
              <span className="text-xs font-semibold tracking-tight text-white">Flow Ledgers Exported</span>
              <span className="text-[10px] text-white/40 mt-0.5">Timetable flow ledgers successfully compiled to PDF.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

