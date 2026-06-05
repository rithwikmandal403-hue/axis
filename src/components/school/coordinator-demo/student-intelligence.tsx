"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentLookupPanel } from "./student-lookup-panel";

type SubjectKey = "physics" | "math" | "business" | "arts";

type SubjectDetail = {
  id: SubjectKey;
  name: string;
  enrolled: number;
  capacity: number;
  yearBreakdown: Record<string, number>;
  teachers: string[];
  sections: Record<string, number>;
};

export function StudentIntelligence({ 
  theme, 
  searchQuery,
  selectedStudentId,
  onClearSelectedStudent
}: { 
  theme: string; 
  searchQuery: string;
  selectedStudentId?: string | null;
  onClearSelectedStudent?: () => void;
}) {
  const [activeView, setActiveView] = useState<"overview" | "finder">("overview");
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetail | null>(null);

  // Switch to directory finder when selection is pushed from global search
  useEffect(() => {
    if (selectedStudentId) {
      setActiveView("finder");
    }
  }, [selectedStudentId]);

  // Core Statistics Data
  const programmes = [
    { name: "Diploma Programme (DP)", count: 184, color: "bg-cyan-500", pct: "29%" },
    { name: "Middle Years Programme (MYP)", count: 228, color: "bg-indigo-500", pct: "36%" },
    { name: "Career-related Programme (CP)", count: 72, color: "bg-purple-500", pct: "11%" },
    { name: "Primary Years Programme (PYP)", count: 154, color: "bg-emerald-500", pct: "24%" },
  ];

  const subjects: SubjectDetail[] = [
    {
      id: "physics",
      name: "Physics HL",
      enrolled: 126,
      capacity: 140,
      yearBreakdown: { "Grade 11": 68, "Grade 12": 58 },
      teachers: ["Aarav Chen", "Sarah Jenkins"],
      sections: { "Section A": 32, "Section B": 34, "Section C": 30, "Section D": 30 }
    },
    {
      id: "math",
      name: "Math AA HL",
      enrolled: 143,
      capacity: 150,
      yearBreakdown: { "Grade 11": 75, "Grade 12": 68 },
      teachers: ["Marcus Vance", "David Miller"],
      sections: { "Section A": 28, "Section B": 30, "Section C": 30, "Section D": 28, "Section E": 27 }
    },
    {
      id: "business",
      name: "Business Management HL",
      enrolled: 89,
      capacity: 100,
      yearBreakdown: { "Grade 11": 42, "Grade 12": 47 },
      teachers: ["Marcus Vance"],
      sections: { "Section A": 30, "Section B": 29, "Section C": 30 }
    },
    {
      id: "arts",
      name: "Visual Arts HL",
      enrolled: 22,
      capacity: 25,
      yearBreakdown: { "Grade 11": 10, "Grade 12": 12 },
      teachers: ["Clara Dupont"],
      sections: { "Section A": 22 }
    }
  ];

  const grades = [
    { grade: "Grade 12", count: 88 },
    { grade: "Grade 11", count: 96 },
    { grade: "Grade 10", count: 118 },
    { grade: "Grade 9", count: 110 },
    { grade: "Grade 6-8", count: 126 },
    { grade: "Grade 1-5", count: 154 }
  ];

  const styling = useMemo(() => {
    return {
      dark: {
        card: "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        border: "border-white/[0.06]",
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]"
      },
      light: {
        card: "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm text-zinc-900",
        textPrimary: "text-zinc-900",
        textSecondary: "text-zinc-500",
        border: "border-black/[0.08]",
        panelBg: "bg-white border-zinc-200 shadow-sm"
      },
      "high-contrast": {
        card: "bg-black border-2 border-white hover:bg-zinc-950 text-white",
        textPrimary: "text-white font-bold",
        textSecondary: "text-zinc-200",
        border: "border-2 border-white",
        panelBg: "bg-black border-2 border-white"
      },
      axis: {
        card: "bg-[#0A0D14]/80 border-cyan-950/80 hover:border-cyan-500/30 backdrop-blur-xl text-white",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        border: "border-white/[0.08]",
        panelBg: "bg-[#121417]/90 border-white/[0.08]"
      }
    }[theme] || {
      card: "bg-zinc-900/60 border-zinc-800",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      border: "border-white/[0.06]",
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]"
    };
  }, [theme]);

  return (
    <div className="space-y-6">
      
      {/* Selector toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
          <button
            onClick={() => {
              setActiveView("overview");
              setSelectedSubject(null);
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === "overview"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Program Distribution
          </button>
          <button
            onClick={() => setActiveView("finder")}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeView === "finder"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Student Directory
          </button>
        </div>
        <span className={`text-xs font-mono ${styling.textSecondary}`}>
          Total Student Roster: <strong>638 Students</strong>
        </span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: STUDENT INTELLIGENCE */}
        {activeView === "overview" && (
          <motion.div
            key="intel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            
            {/* Left Area: Distributions grids (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Program Distribution */}
              <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-4`}>
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Demographics</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Programme Distribution</h3>
                  <p className="text-[11px] text-white/35">Ratios of candidates enrolled across primary, middle, and senior streams.</p>
                </div>

                <div className="space-y-3 font-semibold text-xs">
                  {programmes.map((p, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">{p.name}</span>
                        <strong className="text-white">{p.count} Students ({p.pct})</strong>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${p.color} transition-all duration-500`}
                          style={{ width: p.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Distribution */}
              <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-4`}>
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Subject Enrollments</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Student Counts by Subject</h3>
                  <p className="text-[11px] text-white/35">Click any subject card to examine capacity ratios, class sections, and teacher assignments.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                        selectedSubject?.id === sub.id ? "border-cyan-500 bg-cyan-500/5" : styling.card
                      }`}
                    >
                      <div className="w-full flex justify-between items-start">
                        <span className="text-[8px] font-mono opacity-50 uppercase tracking-wider">{sub.id.toUpperCase()}</span>
                        <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/10">
                          {Math.round((sub.enrolled / sub.capacity) * 100)}% Density
                        </span>
                      </div>
                      
                      <div className="my-2">
                        <h4 className="text-xs font-bold text-white leading-tight">{sub.name}</h4>
                        <span className="text-[10px] text-white/40 block mt-1">Teachers: {sub.teachers.join(", ")}</span>
                      </div>

                      <div className="w-full space-y-1">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500"
                            style={{ width: `${(sub.enrolled / sub.capacity) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-white/35">
                          <span>Enrolled: {sub.enrolled}</span>
                          <span>Max Capacity: {sub.capacity}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Area: Grade summary / Subject Details (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <AnimatePresence mode="wait">
                {selectedSubject ? (
                  <motion.div
                    key={selectedSubject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`border ${styling.border} bg-[#0E0E10]/85 p-6 rounded-3xl space-y-6 backdrop-blur-xl shadow-lg`}
                  >
                    <div>
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Subject Details</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedSubject.name}</h3>
                      <p className="text-[10px] text-white/35 mt-0.5">Assigned Teachers: {selectedSubject.teachers.join(", ")}</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      {/* Year Breakdown */}
                      <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                        <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Grade level breakdown</span>
                        <div className="space-y-1.5 font-mono">
                          {Object.entries(selectedSubject.yearBreakdown).map(([grade, val]) => (
                            <div key={grade} className="flex justify-between text-xs font-medium">
                              <span className="text-white/60">{grade}</span>
                              <strong className="text-white">{val} Students</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sections capacity */}
                      <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                        <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Class Sections</span>
                        <div className="space-y-2">
                          {Object.entries(selectedSubject.sections).map(([sect, val]) => (
                            <div key={sect} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-sans text-white/60">
                                <span>{sect}</span>
                                <strong>{val} / 35 seats</strong>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${(val / 35) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-4`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Grade Distribution</h4>
                      <p className="text-[9px] text-white/30">Total student counts by grade level.</p>
                    </div>
                    <div className="space-y-2">
                      {grades.map((g, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs font-semibold">
                          <span className="text-white/80">{g.grade}</span>
                          <strong className="text-cyan-400 font-mono">{g.count} Students</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: STANDARD STUDENT DIRECTORY LIST */}
        {activeView === "finder" && (
          <motion.div
            key="finder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <StudentLookupPanel
              theme={theme}
              activeProgram="all"
              searchQuery={searchQuery}
              selectedStudentId={selectedStudentId}
              onClearSelectedStudent={onClearSelectedStudent}
            />
          </motion.div>
        )}

      </AnimatePresence>
      
    </div>
  );
}
