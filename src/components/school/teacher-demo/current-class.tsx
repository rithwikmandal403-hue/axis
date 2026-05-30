"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ReminderItem = {
  id: string;
  text: string;
  status: "active" | "snoozed" | "archived";
  targetType: "class" | "room" | "group" | "slot";
  targetName: string;
};

type CurrentClassCardProps = {
  reminders: ReminderItem[];
  onAddReminder: (text: string, targetType: "class" | "room" | "group" | "slot", targetName: string) => void;
  onSnoozeReminder: (id: string) => void;
  onArchiveReminder: (id: string) => void;
  attendanceVerified: boolean;
  onVerifyAttendance: () => void;
  lastVerifiedTime: string | null;
  overrideCount: number;
  totalStudents: number;
  verifiedCount: number;
};

export function CurrentClassCard({
  reminders,
  onAddReminder,
  onSnoozeReminder,
  onArchiveReminder,
  attendanceVerified,
  onVerifyAttendance,
  lastVerifiedTime,
  overrideCount,
  totalStudents,
  verifiedCount,
}: CurrentClassCardProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [newReminderText, setNewReminderText] = useState("");
  const [reminderTarget, setReminderTarget] = useState<"class" | "room">("class");

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const targetName = reminderTarget === "class" ? "Grade 11 Physics (B)" : "Lab 3";
    onAddReminder(newReminderText.trim(), reminderTarget, targetName);
    setNewReminderText("");
    setActiveModal(null);
  };

  // Filter active reminders related to current class or room
  const classReminders = reminders.filter(
    (r) => r.status === "active" && (r.targetName === "Grade 11 Physics (B)" || r.targetName === "Lab 3")
  );

  return (
    <>
      <div className="relative flex flex-col gap-0 select-none">
        
        {/* NOW: CURRENT CLASS CARD */}
        <div className="relative rounded-t-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-safe-lg md:p-safe-xl shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute right-0 top-0 size-48 rounded-full bg-white/[0.01] blur-3xl" />

          <div className="flex flex-col gap-safe-lg">
            <div className="flex items-start justify-between gap-safe-md">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/55">
                    Now
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] text-amber-500 font-semibold bg-amber-500/[0.06] border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Room Adjusted
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-medium tracking-tight text-white md:text-3xl">
                  Grade 11 Physics (IB DP)
                </h2>
              </div>
              
              {/* Premium Period Block Badge */}
              <div className="flex flex-col items-end gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 shadow-sm text-right flex-shrink-0">
                <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">Period 2</span>
                <span className="block text-xs text-white/60 font-semibold tracking-tight whitespace-nowrap">08:30 - 09:50</span>
              </div>
            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-2 gap-safe-md border-y border-white/[0.06] py-safe-lg md:grid-cols-4">
              <div>
                <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider">Location</span>
                <p className="mt-1 text-xs font-semibold text-white flex items-center gap-1.5">
                  Lab 3
                  <span className="text-xs text-white/20 line-through font-normal">Lab 1</span>
                </p>
              </div>
              <div>
                <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider">Section</span>
                <p className="mt-1 text-xs font-semibold text-white">Section B</p>
              </div>
              <div>
                <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider">Attendance State</span>
                <div className="mt-1 text-xs font-semibold text-white">
                  {attendanceVerified ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      ✓ Sync Complete
                    </span>
                  ) : (
                    <span className="text-white/60">Ready for Sync</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider">Verification Sync</span>
                <p className="mt-1 text-[11px] text-white/40 font-medium leading-none">
                  {lastVerifiedTime ? (
                    <span>Verified {lastVerifiedTime}</span>
                  ) : (
                    <span>No active logs</span>
                  )}
                  {overrideCount > 0 && <span className="block mt-0.5 text-amber-500 font-semibold">{overrideCount} Overrides</span>}
                </p>
              </div>
            </div>

            {/* Reminders with Snooze/Archive lifecycle */}
            {classReminders.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">
                  Active Reminders ({classReminders.length})
                </span>
                <div className="space-y-1.5">
                  {classReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="group/rem flex items-center justify-between text-xs text-white/70 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg hover:border-white/[0.1] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-sky-400" />
                        <span>{rem.text}</span>
                        <span className="text-[8px] text-white/25 border border-white/5 px-1.5 py-0.5 rounded capitalize">
                          {rem.targetType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover/rem:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSnoozeReminder(rem.id)}
                          className="rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[10px] text-white/60 hover:text-white"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => onArchiveReminder(rem.id)}
                          className="rounded bg-white/10 hover:bg-white/25 px-2 py-0.5 text-[10px] text-white"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions button bar */}
            <div className="flex flex-wrap gap-safe-sm pt-safe-sm">
              <button
                onClick={() => setActiveModal("attendance")}
                className="rounded-xl bg-white text-black px-4 py-2.5 text-xs font-bold shadow-soft hover:opacity-90 transition-all"
              >
                Verify Attendance
              </button>
              <button
                onClick={() => setActiveModal("notes")}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-white/80 hover:bg-white/[0.04] transition-all"
              >
                View Lesson Notes
              </button>
              <button
                onClick={() => setActiveModal("message")}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-white/80 hover:bg-white/[0.04] transition-all"
              >
                Message Class
              </button>
              <button
                onClick={() => setActiveModal("reminder")}
                className="rounded-xl border border-dashed border-white/[0.12] bg-transparent px-4 py-2.5 text-xs font-medium text-white/50 hover:bg-white/[0.02] hover:text-white/80 transition-all"
              >
                + Capture Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Transition vertical indicator connector line */}
        <div className="relative flex justify-center h-8 select-none">
          <div className="w-px bg-gradient-to-b from-white/20 via-white/15 to-white/10 h-full" />
          <div className="absolute top-1/2 -translate-y-1/2 rounded bg-[#0A0A0B] border border-white/10 px-2 py-0.5 text-[8px] font-bold text-white/35 uppercase tracking-widest">
            Transition Flow
          </div>
        </div>

        {/* NEXT: UP NEXT CARD */}
        <div className="relative rounded-b-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-safe-md">
            <div className="flex items-start justify-between gap-safe-md">
              <div>
                <span className="rounded-full bg-white/[0.03] border border-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white/35">
                  Up Next
                </span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-white/90">
                  Grade 12 Advanced Physics
                </h3>
              </div>
              
              {/* Premium Period Block Badge */}
              <div className="flex flex-col items-end gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 shadow-sm text-right flex-shrink-0">
                <span className="text-[9px] font-bold tracking-wider text-white/35 uppercase">Period 4</span>
                <span className="block text-[10px] text-white/50 font-semibold mt-0.5 whitespace-nowrap">11:30 - 12:50</span>
              </div>
            </div>

            {/* Preparation / Context Alert */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 text-xs text-white/50 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">
                  Preparation Alerts
                </span>
                <span className="text-white/60">Lab setup required for photo-electric simulation.</span>
              </div>
              <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/[0.08] border border-sky-500/20 px-2.5 py-1 rounded-lg">
                Projector Active in Room B12
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal overlays */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-[#000]/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E0E10] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.9)] text-white"
            >
              {activeModal === "attendance" && (
                <div>
                  <h3 className="text-lg font-medium tracking-tight">Roster Presence Synced</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Proximity hardware has completed sync operations. You can override or adjust roster status lists.
                  </p>
                  <div className="mt-5 space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Proximity check-ins:</span>
                      <span className="text-emerald-400 font-semibold">{verifiedCount} / {totalStudents} students</span>
                    </div>
                    {overrideCount > 0 && (
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Active manual overrides:</span>
                        <span className="text-amber-400 font-semibold">{overrideCount} students</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Last system stamp:</span>
                      <span className="text-white/45 font-medium">{lastVerifiedTime || "Unverified"}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl border border-white/[0.08] bg-transparent px-4.5 py-2 text-xs text-white/60 hover:text-white"
                    >
                      Close Window
                    </button>
                    <button
                      onClick={() => {
                        onVerifyAttendance();
                        setActiveModal(null);
                      }}
                      className="rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold shadow-soft"
                    >
                      Re-Verify Ledger
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "notes" && (
                <div>
                  <h3 className="text-lg font-medium tracking-tight">Lesson Plan & Board Notes</h3>
                  <div className="mt-4 space-y-3.5">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5">
                      <span className="text-[9px] text-white/35 font-semibold uppercase">Topic</span>
                      <p className="mt-1 text-sm font-semibold">Light Refraction & Wave Index</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5">
                      <span className="text-[9px] text-white/35 font-semibold uppercase">Key Formulas</span>
                      <p className="mt-1 font-mono text-xs text-white/75 bg-black/35 p-2 rounded">
                        {"Snell's Law: n₁ sin(θ₁) = n₂ sin(θ₂)"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold shadow-soft"
                    >
                      Close Notes
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "message" && (
                <div>
                  <h3 className="text-lg font-medium tracking-tight">Broadcast to Grade 11 Physics</h3>
                  <p className="mt-2 text-xs text-white/50">
                    Sends an ambient contextual notification directly to all enrolled student interfaces and parent summaries.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Enter classroom notice..."
                    className="mt-4 w-full rounded-xl border border-white/[0.08] bg-black/40 p-3 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
                  />
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4.5 py-2 text-xs text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold shadow-soft"
                    >
                      Broadcast Message
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "reminder" && (
                <form onSubmit={handleAddReminder}>
                  <h3 className="text-lg font-medium tracking-tight">Create Contextual Reminder</h3>
                  <p className="mt-2 text-xs text-white/50">
                    Specify a task or reminder attached to this specific class slot or room location.
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <input
                      type="text"
                      required
                      value={newReminderText}
                      onChange={(e) => setNewReminderText(e.target.value)}
                      placeholder="e.g. Gather refraction worksheets..."
                      className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
                      autoFocus
                    />

                    <div className="space-y-1">
                      <label className="text-[9px] text-white/35 font-semibold uppercase">Attach to Scope</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setReminderTarget("class")}
                          className={`flex-1 py-2 rounded-lg border text-xs font-semibold tracking-tight transition-colors ${
                            reminderTarget === "class"
                              ? "bg-white text-black border-white"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          Grade 11 Physics
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderTarget("room")}
                          className={`flex-1 py-2 rounded-lg border text-xs font-semibold tracking-tight transition-colors ${
                            reminderTarget === "room"
                              ? "bg-white text-black border-white"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          Lab 3 (Room)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl border border-white/[0.08] bg-transparent px-4.5 py-2 text-xs text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold shadow-soft"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

