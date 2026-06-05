"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TimelineActivity = {
  periodId: string;
  subject: string;
  room: string;
  prog: string;
  teacher: string;
  type: "class" | "break" | "exam" | "sync" | "assembly";
  conflict?: string;
};

type Period = {
  id: string;
  name: string;
  time: string;
};

const PERIODS: Period[] = [
  { id: "p1", name: "Period 1", time: "08:30 - 09:30" },
  { id: "p2", name: "Period 2", time: "09:30 - 10:30" },
  { id: "break", name: "Morning Break", time: "10:30 - 10:50" },
  { id: "p3", name: "Period 3", time: "10:50 - 11:50" },
  { id: "lunch", name: "Lunch Block", time: "11:50 - 12:50" },
  { id: "p4", name: "Period 4", time: "12:50 - 13:50" },
  { id: "p5", name: "Period 5", time: "13:50 - 14:50" },
];

const MASTER_ACTIVITIES: TimelineActivity[] = [
  // Period 1
  { periodId: "p1", subject: "Grade 11 Physics SL", room: "Science Lab 3", prog: "dp1", teacher: "Aarav Chen", type: "class" },
  { periodId: "p1", subject: "Grade 12 Adv Calculus HL", room: "Room 204", prog: "dp2", teacher: "Marcus Vance", type: "class" },
  { periodId: "p1", subject: "MYP Chemistry Block", room: "Science Lab 2", prog: "myp5", teacher: "Ananya Rao", type: "class" },
  { periodId: "p1", subject: "DP Sports Science", room: "Football Field", prog: "dp1", teacher: "David Miller", type: "class", conflict: "Conflict: Football Field is double-booked for DP Sports Science and Grade 9 PE Soccer." },
  { periodId: "p1", subject: "Grade 9 PE Soccer", room: "Football Field", prog: "myp4", teacher: "David Miller", type: "class", conflict: "Conflict: Football Field is double-booked for Grade 9 PE Soccer and DP Sports Science." },
  { periodId: "p1", subject: "TOK Prep Seminar", room: "Auditorium", prog: "dp2", teacher: "Sarah Chen", type: "class" },
  { periodId: "p1", subject: "Grade 12 PE Practical", room: "Gymnasium", prog: "dp2", teacher: "Coach Phelps", type: "class" },

  // Period 2
  { periodId: "p2", subject: "Grade 11 Chemistry IA", room: "Science Lab 2", prog: "dp1", teacher: "Ananya Rao", type: "class" },
  { periodId: "p2", subject: "Grade 12 Physics HL Lab", room: "Science Lab 3", prog: "dp2", teacher: "Aarav Chen", type: "class" },
  { periodId: "p2", subject: "Grade 10 Algebra II", room: "Room 204", prog: "myp5", teacher: "Marcus Vance", type: "class" },
  { periodId: "p2", subject: "PYP Grade 5 PE", room: "Basketball Court", prog: "pyp", teacher: "David Miller", type: "class" },
  { periodId: "p2", subject: "MYP4 Dance & Movement", room: "Dance Studio", prog: "myp4", teacher: "Clara Dupont", type: "class" },

  // Break
  { periodId: "break", subject: "All-school Break & Recreation", room: "Central Atrium", prog: "all", teacher: "All Duty Staff", type: "break" },

  // Period 3
  { periodId: "p3", subject: "DP History Seminar", room: "Room 102", prog: "dp2", teacher: "Robert Blake", type: "class" },
  { periodId: "p3", subject: "Grade 11 CP Math SL", room: "Room 204", prog: "cp", teacher: "Marcus Vance", type: "class" },
  { periodId: "p3", subject: "Grade 11 CP Physical Rec", room: "Badminton Court", prog: "cp", teacher: "Coach Phelps", type: "class" },
  { periodId: "p3", subject: "Grade 11 DP1 Recreation", room: "Basketball Court", prog: "dp1", teacher: "David Miller", type: "class" },
  { periodId: "p3", subject: "Music Recital Practice", room: "Auditorium", prog: "myp3", teacher: "Robert Blake", type: "class" },

  // Lunch
  { periodId: "lunch", subject: "Dining Hall lunch service", room: "Central Cafeteria", prog: "all", teacher: "Duty Supervisors", type: "break" },

  // Period 4
  { periodId: "p4", subject: "DP Literature Seminars", room: "Room 3A", prog: "dp2", teacher: "Clara Dupont", type: "class" },
  { periodId: "p4", subject: "Grade 11 Chemistry SL", room: "Science Lab 2", prog: "dp1", teacher: "Ananya Rao", type: "class" },
  { periodId: "p4", subject: "Grade 9 PE Basketball", room: "Football Field", prog: "myp4", teacher: "David Miller", type: "class" },
  { periodId: "p4", subject: "Swim Team Trials", room: "Swimming Pool", prog: "dp1", teacher: "Coach Phelps", type: "class" },
  { periodId: "p4", subject: "Drama Performance Prep", room: "Auditorium", prog: "myp5", teacher: "Robert Blake", type: "class" },

  // Period 5
  { periodId: "p5", subject: "Extended Essay research", room: "Library", prog: "dp1", teacher: "Sarah Chen", type: "class" },
  { periodId: "p5", subject: "Grade 10 Language & Lit", room: "Room 3A", prog: "myp5", teacher: "Clara Dupont", type: "class" },
  { periodId: "p5", subject: "Swim Team Practice", room: "Swimming Pool", prog: "dp1", teacher: "Coach Phelps", type: "class" },
  { periodId: "p5", subject: "Faculty alignment briefing", room: "Multipurpose Hall", prog: "all", teacher: "Dr. Vance", type: "class" },
];

type FacilityInfo = {
  id: string;
  name: string;
  status: "Available" | "Occupied" | "Reserved" | "Under Maintenance";
  location: string;
};

const FACILITIES_LIST: FacilityInfo[] = [
  { id: "football", name: "Football Field", status: "Occupied", location: "Sports Complex" },
  { id: "gym", name: "Gymnasium", status: "Occupied", location: "Sports Complex" },
  { id: "badminton", name: "Badminton Court", status: "Available", location: "Sports Complex" },
  { id: "pool", name: "Swimming Pool", status: "Occupied", location: "Sports Complex" },
  { id: "basketball", name: "Basketball Court", status: "Reserved", location: "Sports Complex" },
  { id: "auditorium", name: "Auditorium", status: "Occupied", location: "Arts Wing" },
  { id: "multipurpose", name: "Multipurpose Hall", status: "Available", location: "Central Block" },
  { id: "dance", name: "Dance Studio", status: "Under Maintenance", location: "Arts Wing" },
];

export function AcademicScheduling({ theme }: { theme: string; activeProgramme?: string }) {
  const [activeTab, setActiveTab] = useState<"whole" | "prog" | "facility" | "teacher" | "class">("whole");

  // Selection states
  const [selectedProg, setSelectedProg] = useState<string>("dp1");
  const [selectedFac, setSelectedFac] = useState<string>("Football Field");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("Aarav Chen");
  const [selectedClass, setSelectedClass] = useState<string>("Grade 11 Physics SL");

  // Options list for selectors
  const programmeOptions = [
    { key: "dp1", label: "DP1" },
    { key: "dp2", label: "DP2" },
    { key: "myp5", label: "MYP5" },
    { key: "myp4", label: "MYP4" },
    { key: "myp3", label: "MYP3" },
    { key: "myp2", label: "MYP2" },
    { key: "myp1", label: "MYP1" },
    { key: "pyp", label: "PYP Years" },
    { key: "cp", label: "CP" },
  ];

  const teacherOptions = useMemo(() => {
    return Array.from(new Set(MASTER_ACTIVITIES.map(a => a.teacher))).filter(t => t !== "All Duty Staff" && t !== "Duty Supervisors");
  }, []);

  const classOptions = useMemo(() => {
    return Array.from(new Set(MASTER_ACTIVITIES.map(a => a.subject))).filter(s => !s.includes("Break") && !s.includes("Lunch") && !s.includes("briefing"));
  }, []);

  // Filter schedules based on navigation tab selection
  const getFilteredActivities = (periodId: string) => {
    const list = MASTER_ACTIVITIES.filter((a) => a.periodId === periodId);

    switch (activeTab) {
      case "whole":
        return list;
      case "prog":
        return list.filter((a) => a.prog === selectedProg || a.prog === "all");
      case "facility":
        // Map common facilities
        return list.filter((a) => a.room === selectedFac || a.prog === "all");
      case "teacher":
        return list.filter((a) => a.teacher === selectedTeacher || a.prog === "all");
      case "class":
        return list.filter((a) => a.subject === selectedClass || a.prog === "all");
      default:
        return list;
    }
  };

  // Check if a period has any conflicts in the active filter
  const getPeriodConflicts = (periodId: string) => {
    const list = getFilteredActivities(periodId);
    return list.filter((a) => a.conflict);
  };

  const styling = useMemo(() => {
    return {
      card: theme === "light" ? "bg-white border-zinc-200 shadow-sm" : "bg-[#0A0D14]/80 border-cyan-950/80 backdrop-blur-xl",
      textPrimary: theme === "light" ? "text-zinc-900" : "text-cyan-50",
      textSecondary: theme === "light" ? "text-zinc-500" : "text-cyan-200/60",
      border: theme === "light" ? "border-zinc-200" : "border-cyan-950/40",
      bgPanel: theme === "light" ? "bg-zinc-50" : "bg-[#05080E]/70",
    };
  }, [theme]);

  // Tab configurations
  const tabs = [
    { id: "whole", label: "🌐 Whole School" },
    { id: "prog", label: "🎓 Programmes" },
    { id: "facility", label: "🏟️ Facilities" },
    { id: "teacher", label: "👩‍🏫 Teachers" },
    { id: "class", label: "📚 Classes" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-start">
      {/* ─── LEFT SIDEBAR SELECTORS (4 COLS) ─────────────────────────────────── */}
      <div className="xl:col-span-4 space-y-4">
        {/* Navigation Sidebar Selector */}
        <div className={`p-5 rounded-3xl border ${styling.card} space-y-4`}>
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
              Schedule Workspace
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">Navigation Context</h4>
          </div>

          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_4px_12px_rgba(6,182,212,0.2)]"
                    : "text-white/60 border-transparent hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Selector Controls */}
        <AnimatePresence mode="wait">
          {activeTab === "prog" && (
            <motion.div
              key="prog-sel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-5 rounded-3xl border ${styling.card} space-y-3`}
            >
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                Select Programme
              </span>
              <div className="grid grid-cols-3 gap-2">
                {programmeOptions.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedProg(p.key)}
                    className={`py-2 px-1 text-[9px] font-extrabold uppercase rounded-lg border text-center transition-all ${
                      selectedProg === p.key
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "facility" && (
            <motion.div
              key="fac-sel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-5 rounded-3xl border ${styling.card} space-y-3`}
            >
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                Facilities availability status
              </span>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {FACILITIES_LIST.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFac(fac.name)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                      selectedFac === fac.name
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold"
                        : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-[10px]">
                      <div className="font-bold text-white">{fac.name}</div>
                      <div className="text-[9px] text-white/30">{fac.location}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        fac.status === "Available"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : fac.status === "Occupied"
                          ? "bg-rose-500/10 text-rose-400"
                          : fac.status === "Reserved"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {fac.status}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "teacher" && (
            <motion.div
              key="tch-sel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-5 rounded-3xl border ${styling.card} space-y-3`}
            >
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                Select Faculty Lead
              </span>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {teacherOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTeacher(t)}
                    className={`w-full p-2 rounded-xl border text-[10px] text-left transition-all font-bold ${
                      selectedTeacher === t
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                    }`}
                  >
                    👩‍🏫 {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "class" && (
            <motion.div
              key="cls-sel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-5 rounded-3xl border ${styling.card} space-y-3`}
            >
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                Select Class / Subject
              </span>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {classOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    className={`w-full p-2 rounded-xl border text-[10px] text-left transition-all font-bold ${
                      selectedClass === c
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                    }`}
                  >
                    📚 {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── RIGHT MASTER SCHEDULE CALENDAR (8 COLS) ─────────────────────────── */}
      <div className="xl:col-span-8 space-y-4">
        {/* TIMETABLE WRAPPER */}
        <div className={`p-6 rounded-3xl border ${styling.card} space-y-5`}>
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                Master school schedule
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5 uppercase tracking-wider">
                {activeTab === "whole" && "Universal School Timetable"}
                {activeTab === "prog" && `Programme Schedule: ${selectedProg.toUpperCase()}`}
                {activeTab === "facility" && `Facility Booking: ${selectedFac}`}
                {activeTab === "teacher" && `Faculty Schedule: ${selectedTeacher}`}
                {activeTab === "class" && `Subject Roster: ${selectedClass}`}
              </h3>
            </div>
            <span className="text-[9px] bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-800/20 uppercase">
              Period View
            </span>
          </div>

          {/* Conflict warnings banner */}
          {MASTER_ACTIVITIES.some((a) => a.conflict) && activeTab === "whole" && (
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/80 rounded-xl text-[10px] space-y-1 font-semibold">
              <span className="font-bold">⚠️ Timetable Conflict Detected:</span>
              <p>Period 1: Football Field has a double booking overlap between Grade 9 PE and DP Sports Science.</p>
            </div>
          )}

          {/* TIMELINE LIST */}
          <div className="space-y-4">
            {PERIODS.map((period) => {
              const activities = getFilteredActivities(period.id);
              const conflicts = getPeriodConflicts(period.id);

              return (
                <div
                  key={period.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    conflicts.length > 0 && (activeTab === "whole" || (activeTab === "facility" && selectedFac === "Football Field"))
                      ? "border-yellow-500/40 bg-yellow-500/[0.01]"
                      : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Period Header */}
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{period.name}</span>
                      <span className="text-[10px] text-white/35 font-mono">({period.time})</span>
                    </div>
                    {conflicts.length > 0 && (activeTab === "whole" || (activeTab === "facility" && selectedFac === "Football Field")) && (
                      <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider animate-pulse">
                        Conflict Alert
                      </span>
                    )}
                  </div>

                  {/* Activities Row */}
                  <div className="space-y-2.5">
                    {activities.length === 0 ? (
                      <div className="py-3 text-center text-white/30 text-[10px] font-bold">
                        🟢 Vacant / Available space
                      </div>
                    ) : (
                      activities.map((act, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border border-white/[0.04] bg-[#0E0E10]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                            act.type === "break" ? "border-l-4 border-amber-500" : "border-l-4 border-cyan-500"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h4 className="font-black text-white">{act.subject}</h4>
                              <span className="px-1.5 py-0.2 bg-white/5 rounded border border-white/10 text-[8px] font-extrabold uppercase text-cyan-400">
                                {act.prog.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 text-[10px] text-white/40 font-medium">
                              <span>🚪 Room: <strong className="text-cyan-400/80 font-mono">{act.room}</strong></span>
                              <span>👩‍🏫 Supervisor: <strong className="text-white/80">{act.teacher}</strong></span>
                            </div>
                          </div>

                          {act.conflict && (activeTab === "whole" || (activeTab === "facility" && selectedFac === "Football Field")) && (
                            <span className="text-[9px] text-yellow-400 font-bold bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/10">
                              ⚠️ Double Booked
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
