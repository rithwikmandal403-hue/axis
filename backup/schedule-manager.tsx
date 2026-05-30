"use client";

import { useState, useMemo } from "react";

type Period = {
  id: string;
  name: string;
  regularTime: string;
  halfDayTime: string;
  delayedTime: string;
  status: "active" | "cancelled";
};

const INITIAL_PERIODS: Period[] = [
  { id: "p-1", name: "Period 1", regularTime: "08:30 - 09:30", halfDayTime: "08:30 - 09:10", delayedTime: "10:00 - 10:45", status: "active" },
  { id: "p-2", name: "Period 2", regularTime: "09:35 - 10:35", halfDayTime: "09:15 - 09:55", delayedTime: "10:50 - 11:35", status: "active" },
  { id: "p-3", name: "Period 3", regularTime: "10:40 - 11:40", halfDayTime: "10:00 - 10:40", delayedTime: "11:40 - 12:25", status: "active" },
  { id: "p-4", name: "Period 4", regularTime: "11:45 - 12:45", halfDayTime: "10:45 - 11:25", delayedTime: "12:30 - 01:15", status: "active" },
  { id: "p-5", name: "Period 5", regularTime: "01:30 - 02:30", halfDayTime: "11:30 - 12:10", delayedTime: "02:00 - 02:45", status: "active" },
  { id: "p-6", name: "Period 6", regularTime: "02:35 - 03:35", halfDayTime: "12:15 - 12:30 (Advisory)", delayedTime: "02:50 - 03:35", status: "active" },
];

type ScheduleManagerProps = {
  theme: string;
  onRoomOverride: (className: string, oldRoom: string, newRoom: string) => void;
  onScheduleCutApplied: (type: string, isAnnouncementChecked: boolean) => void;
};

export function ScheduleManager({ theme, onRoomOverride, onScheduleCutApplied }: ScheduleManagerProps) {
  const [scheduleType, setScheduleType] = useState<"regular" | "half-day" | "delayed">("regular");
  const [sendAnnouncement, setSendAnnouncement] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Grade 11 Physics (B)");
  const [oldRoom, setOldRoom] = useState("Lab 3");
  const [newRoom, setNewRoom] = useState("Lab 4");

  const styles = useMemo(() => {
    return {
      dark: {
        card: "bg-zinc-900/60 border-zinc-800",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        input: "bg-zinc-950 border-zinc-800 focus:border-cyan-500 text-white",
        button: "bg-cyan-500 text-black hover:bg-cyan-400 font-bold",
        buttonSec: "border-zinc-800 hover:bg-zinc-800 text-zinc-300",
      },
      light: {
        card: "bg-white border-zinc-200 shadow-sm",
        textPrimary: "text-zinc-900",
        textSecondary: "text-zinc-500",
        input: "bg-zinc-50 border-zinc-200 focus:border-cyan-600 text-zinc-900",
        button: "bg-cyan-600 text-white hover:bg-cyan-500 font-bold",
        buttonSec: "border-zinc-300 hover:bg-zinc-100 text-zinc-700",
      },
      "high-contrast": {
        card: "bg-black border-2 border-white",
        textPrimary: "text-white font-bold",
        textSecondary: "text-zinc-200",
        input: "bg-black border-2 border-white focus:outline-none text-white",
        button: "bg-white text-black font-extrabold border-2 border-white hover:bg-zinc-200",
        buttonSec: "border-2 border-white bg-black text-white hover:bg-zinc-900",
      },
      axis: {
        card: "bg-[#0A0D14]/80 border-cyan-950/80 backdrop-blur-xl",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        input: "bg-[#05080E] border-cyan-950/80 focus:border-cyan-400 text-cyan-100",
        button: "bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]",
        buttonSec: "border-cyan-400/20 hover:bg-cyan-400/5 text-cyan-300",
      },
    }[theme as "dark" | "light" | "high-contrast" | "axis"] || {
      card: "bg-zinc-900/60 border-zinc-800",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      input: "bg-zinc-950 border-zinc-800",
      button: "bg-cyan-500 text-black",
      buttonSec: "border-zinc-800 text-zinc-300",
    };
  }, [theme]);

  const activePeriods = useMemo(() => {
    return INITIAL_PERIODS.map((period) => {
      let timeStr = period.regularTime;
      const status: "active" | "cancelled" = "active";
      if (scheduleType === "half-day") {
        timeStr = period.halfDayTime;
      } else if (scheduleType === "delayed") {
        timeStr = period.delayedTime;
      }
      return {
        ...period,
        timeStr,
        status,
      };
    });
  }, [scheduleType]);

  const handleApplySchedule = (type: "regular" | "half-day" | "delayed") => {
    setScheduleType(type);
    onScheduleCutApplied(type, sendAnnouncement);
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !oldRoom || !newRoom) return;
    onRoomOverride(selectedClass, oldRoom, newRoom);
    alert(`Ecosystem Override: ${selectedClass} has been re-routed from Room ${oldRoom} to Room ${newRoom}. Notifications broadcasted.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* ─── SECTION 1: GLOBAL SCHEDULE CONTROLS (8 COLS) ───────────────────────── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Schedule Toggles */}
        <div className={`p-6 rounded-3xl border ${styles.card} space-y-6`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Universal Schedule Config</span>
            <h3 className={`text-base font-bold tracking-tight ${styles.textPrimary}`}>Special Day Operations Selector</h3>
            <p className={`text-xs ${styles.textSecondary}`}>
              Alter the global school timing structure. Axis updates all student schedules, teacher availability maps, and parent displays instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "regular", label: "Regular Day", desc: "08:30 AM - 03:30 PM" },
              { id: "half-day", label: "Half-Day Schedule", desc: "08:30 AM - 12:30 PM" },
              { id: "delayed", label: "Delayed Start", desc: "10:00 AM - 03:30 PM" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleApplySchedule(opt.id as "regular" | "half-day" | "delayed")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-300 ${
                  scheduleType === opt.id
                    ? theme === "light"
                      ? "bg-cyan-600 border-cyan-600 text-white shadow-md"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : theme === "light"
                      ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                <span className="text-[10px] opacity-70 font-mono font-medium">{opt.desc}</span>
              </button>
            ))}
          </div>

          {/* Half-Day Broadcast Option */}
          {scheduleType !== "regular" && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-sm">⚠️</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Timetable Contraction Triggered</h4>
                  <p className={`text-[11px] ${styles.textSecondary}`}>
                    Class periods contracted to 40-minute teaching intervals. Standard lunch breaks canceled.
                  </p>
                </div>
              </div>
              <div className="h-px bg-white/[0.04] my-2" />
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendAnnouncement}
                  onChange={(e) => setSendAnnouncement(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 focus:outline-none size-4"
                />
                <span className={`text-xs font-semibold ${styles.textPrimary}`}>
                  Also send automated announcement broadcast to all affected students, faculty, and families
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Dynamic Class Timings Table */}
        <div className={`p-6 rounded-3xl border ${styles.card} space-y-4`}>
          <div>
            <h4 className={`text-sm font-bold tracking-tight ${styles.textPrimary}`}>Recalculated Timeline Outlook</h4>
            <p className={`text-xs ${styles.textSecondary}`}>Active class period divisions under current configuration.</p>
          </div>

          <div className="space-y-2">
            {activePeriods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  <span className={styles.textPrimary}>{period.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] ${styles.textSecondary}`}>{period.timeStr}</span>
                  <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20 uppercase tracking-widest">
                    {period.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── SECTION 2: ROOM RE-ROUTING OVERRIDES (4 COLS) ─────────────────────── */}
      <div className="lg:col-span-4">
        <div className={`p-6 rounded-3xl border ${styles.card} space-y-4`}>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Room Manager</span>
            <h3 className={`text-base font-bold tracking-tight ${styles.textPrimary}`}>Class Re-Routing</h3>
            <p className={`text-xs ${styles.textSecondary}`}>
              Force a room override for any active class timetable block. Updates live maps instantly.
            </p>
          </div>

          <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs font-medium">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase tracking-wider text-zinc-500`}>Select Class Block</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
              >
                <option value="Grade 11 Physics (B)">Grade 11 Physics (Section B)</option>
                <option value="Grade 12 Adv Physics (A)">Grade 12 Advanced Physics (Section A)</option>
                <option value="Algebra II">Algebra II (Section B)</option>
                <option value="MYP Language & Lit">MYP Language & Lit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={`text-[10px] uppercase tracking-wider text-zinc-500`}>From Room</label>
                <input
                  type="text"
                  value={oldRoom}
                  onChange={e => setOldRoom(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] uppercase tracking-wider text-zinc-500`}>To Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl uppercase tracking-wider text-xs transition-all ${styles.button}`}
            >
              Apply Room Override
            </button>
          </form>

          <div className="h-px bg-white/[0.05] my-2" />

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Active overrides log</span>
            <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-[10px] leading-relaxed text-cyan-400 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Refraction Lab B</span>
                <span>Lab 3 → Lab 4</span>
              </div>
              <p className={`text-[9px] ${styles.textSecondary}`}>Period 2 block · Synced 10 minutes ago by Coordinator</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
