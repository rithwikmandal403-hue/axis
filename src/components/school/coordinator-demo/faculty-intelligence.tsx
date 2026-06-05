"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeacherLookupPanel } from "./teacher-lookup-panel";

type DeptKey = "math" | "science" | "humanities" | "languages" | "arts";

type DeptDetail = {
  id: DeptKey;
  name: string;
  teachersCount: number;
  studentsCount: number;
  ratio: number;
  leadName: string;
  leadRole: string;
  members: { name: string; role: string; load: string; status: "available" | "teaching" | "meeting" | "away" }[];
};

export function FacultyIntelligence({
  theme,
  searchQuery,
  onTriggerSubstitution,
  selectedTeacherId,
  onClearSelectedTeacher
}: {
  theme: string;
  searchQuery: string;
  onTriggerSubstitution: (teacherName: string, classCoverName: string) => void;
  selectedTeacherId?: string | null;
  onClearSelectedTeacher?: () => void;
}) {
  const [activeView, setActiveView] = useState<"overview" | "finder">("overview");
  const [selectedDept, setSelectedDept] = useState<DeptDetail | null>(null);

  // Switch to directory finder when selection is pushed from global search
  useEffect(() => {
    if (selectedTeacherId) {
      setActiveView("finder");
    }
  }, [selectedTeacherId]);

  const departments: DeptDetail[] = [
    {
      id: "math",
      name: "Mathematics Department",
      teachersCount: 9,
      studentsCount: 310,
      ratio: 34.4,
      leadName: "Marcus Vance",
      leadRole: "Mathematics Head",
      members: [
        { name: "Marcus Vance", role: "Department Head", load: "18 periods / week", status: "teaching" },
        { name: "Sarah Chen", role: "Algebra Specialist", load: "20 periods / week", status: "available" },
        { name: "David Miller", role: "Statistics teacher", load: "16 periods / week", status: "teaching" },
      ]
    },
    {
      id: "science",
      name: "Science Department",
      teachersCount: 12,
      studentsCount: 280,
      ratio: 23.3,
      leadName: "Ananya Rao",
      leadRole: "Science Department Lead",
      members: [
        { name: "Ananya Rao", role: "Department Lead & Chemistry", load: "14 periods / week", status: "meeting" },
        { name: "Aarav Chen", role: "Physics Lead teacher", load: "18 periods / week", status: "available" },
        { name: "Dilan Patel", role: "Biology Specialist", load: "20 periods / week", status: "teaching" },
      ]
    },
    {
      id: "humanities",
      name: "Humanities & History",
      teachersCount: 6,
      studentsCount: 190,
      ratio: 31.6,
      leadName: "Robert Blake",
      leadRole: "Humanities Advisor",
      members: [
        { name: "Robert Blake", role: "Humanities Lead teacher", load: "16 periods / week", status: "away" },
        { name: "Claire DuPont", role: "Geography teacher", load: "18 periods / week", status: "teaching" },
      ]
    },
    {
      id: "languages",
      name: "Modern Languages",
      teachersCount: 5,
      studentsCount: 120,
      ratio: 24.0,
      leadName: "Claire DuPont",
      leadRole: "Modern Languages Head",
      members: [
        { name: "Claire DuPont", role: "French Lead teacher", load: "18 periods / week", status: "teaching" },
        { name: "Robert Blake", role: "Spanish Instructor", load: "12 periods / week", status: "away" },
      ]
    },
    {
      id: "arts",
      name: "Performing & Visual Arts",
      teachersCount: 3,
      studentsCount: 45,
      ratio: 15.0,
      leadName: "Clara Dupont",
      leadRole: "Arts Center Lead",
      members: [
        { name: "Clara Dupont", role: "Visual Arts Coordinator", load: "16 periods / week", status: "teaching" },
        { name: "Sarah Chen", role: "Music Instructor", load: "14 periods / week", status: "available" },
      ]
    }
  ];

  const styling = useMemo(() => {
    return {
      dark: {
        card: "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        border: "border-white/[0.06]",
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        badge: {
          available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          teaching: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          meeting: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          away: "bg-red-500/10 text-red-400 border-red-500/20",
        }
      },
      light: {
        card: "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm text-zinc-900",
        textPrimary: "text-zinc-900",
        textSecondary: "text-zinc-500",
        border: "border-black/[0.08]",
        panelBg: "bg-white border-zinc-200 shadow-sm",
        badge: {
          available: "bg-emerald-50 text-emerald-700 border-emerald-200",
          teaching: "bg-blue-50 text-blue-700 border-blue-200",
          meeting: "bg-indigo-50 text-indigo-700 border-indigo-200",
          away: "bg-red-50 text-red-700 border-red-200",
        }
      },
      "high-contrast": {
        card: "bg-black border-2 border-white hover:bg-zinc-950 text-white",
        textPrimary: "text-white font-bold",
        textSecondary: "text-zinc-200",
        border: "border-2 border-white",
        panelBg: "bg-black border-2 border-white",
        badge: {
          available: "border border-white text-white bg-black",
          teaching: "border border-white text-white bg-black",
          meeting: "border border-white text-white bg-black",
          away: "border border-white text-white bg-black",
        }
      },
      axis: {
        card: "bg-[#0A0D14]/80 border-cyan-950/80 hover:border-cyan-500/30 backdrop-blur-xl text-white",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        border: "border-white/[0.08]",
        panelBg: "bg-[#121417]/90 border-white/[0.08]",
        badge: {
          available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          teaching: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          meeting: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          away: "bg-red-500/10 text-red-400 border-red-500/20",
        }
      }
    }[theme] || {
      card: "bg-zinc-900/60 border-zinc-800",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      border: "border-white/[0.06]",
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      badge: {
        available: "bg-emerald-500/10 text-emerald-400",
        teaching: "bg-blue-500/10 text-blue-400",
        meeting: "bg-indigo-500/10 text-indigo-400",
        away: "bg-red-500/10 text-red-400",
      }
    };
  }, [theme]);

  return (
    <div className="space-y-6">
      
      {/* View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
          <button
            onClick={() => {
              setActiveView("overview");
              setSelectedDept(null);
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === "overview"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Subject Groups & Workloads
          </button>
          <button
            onClick={() => setActiveView("finder")}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === "finder"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Faculty Directory
          </button>
        </div>
        <span className={`text-xs font-mono ${styling.textSecondary}`}>
          Total Faculty: <strong>45 teachers</strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: FACULeY INeELLIGENCE SUMMARY */}
        {activeView === "overview" && (
          <motion.div
            key="intel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            
            {/* Left Hand: Ratios and stats (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-6`}>
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Subject Group Sizes & Ratios</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subject Group Rosters & Workloads</h3>
                  <p className="text-[11px] text-white/35">Click any subject-group card to view specific faculty loads, course responsibilities, and contacts.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDept(dept)}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all cursor-pointer ${
                        selectedDept?.id === dept.id ? "border-cyan-500 bg-cyan-500/5 shadow-md" : styling.card
                      }`}
                    >
                      <div className="w-full flex justify-between items-start">
                        <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/30 px-2.5 py-0.5 rounded border border-cyan-800/10">
                          {dept.ratio} Student Ratio
                        </span>
                      </div>
                      
                      <div className="my-2">
                        <h4 className="text-xs font-bold text-white leading-tight">{dept.name}</h4>
                        <span className="text-[9px] text-white/40 block mt-1">Head: {dept.leadName}</span>
                      </div>

                      <div className="w-full flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-[10px] opacity-50">{dept.teachersCount} teachers</span>
                        <span className="text-[10px] opacity-70 font-bold">{dept.studentsCount} Students Enrolled</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Hand: Detailed Department Slide-Over (4 cols) */}
            <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                {selectedDept ? (
                  <motion.div
                    key={selectedDept.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`border ${styling.border} bg-[#0E0E10]/85 p-6 rounded-3xl space-y-6 backdrop-blur-xl shadow-lg`}
                  >
                    <div>
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">{selectedDept.name}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedDept.leadName}</h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-white/50 border border-white/10 uppercase font-mono mt-1 inline-block">
                        {selectedDept.leadRole}
                      </span>
                    </div>

                    {/* Faculty members and loads */}
                    <div className="space-y-4 text-xs font-semibold">
                      <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Subject Group Members & Workloads</span>
                      <div className="space-y-2">
                        {selectedDept.members.map((member, idx) => (
                          <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong className="text-white/95">{member.name}</strong>
                                <span className="text-[9px] text-white/40 block mt-0.5">{member.role}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${styling.badge[member.status]}`}>
                                {member.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-white/35">
                              <span>Weekly Load: <strong>{member.load}</strong></span>
                              <div className="flex gap-2">
                                <button onClick={() => alert(`Calling ${member.name}...`)} className="text-[9px] text-cyan-400 uppercase font-bold hover:underline">Call</button>
                                <span className="opacity-20">|</span>
                                <button onClick={() => alert(`Direct chat panel open with ${member.name}.`)} className="text-[9px] text-cyan-400 uppercase font-bold hover:underline">Message</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className={`p-6 rounded-3xl border ${styling.panelBg} text-center py-16 flex flex-col justify-center items-center text-xs text-white/30 space-y-2 h-[320px]`}>
                    <span className="text-2xl opacity-40"></span>
                    <h4 className="font-bold text-white/60">No Subject Group Selected</h4>
                    <p className="max-w-[200px] leading-relaxed mx-auto">Select any subject-group card in the grid to inspect staff lists and teaching loadings.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: FACULeY ROSeER SEARCH FINDER */}
        {activeView === "finder" && (
          <motion.div
            key="finder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TeacherLookupPanel
              theme={theme}
              searchQuery={searchQuery}
              onTriggerSubstitution={onTriggerSubstitution}
              selectedTeacherId={selectedTeacherId}
              onClearSelectedTeacher={onClearSelectedTeacher}
            />
          </motion.div>
        )}

      </AnimatePresence>
      
    </div>
  );
}
