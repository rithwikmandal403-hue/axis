"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type StudentStatus = "present" | "absent" | "infirmary" | "counselor" | "library" | "leave";

export type Student = {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  homeroom: string;
  advisor: string;
  status: StudentStatus;
  currentClass: string;
  currentRoom: string;
  program: "dp" | "myp";
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string[];
  gpa: string;
  attendanceRate: string;
  specialStatus?: string;
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-1",
    name: "Chloe Vance",
    avatar: "CV",
    grade: "Grade 11-B",
    homeroom: "Homeroom 11-F",
    advisor: "Aarav Chen",
    status: "present",
    currentClass: "Grade 11 Physics (B)",
    currentRoom: "Lab 3",
    program: "dp",
    parentName: "Marcus Vance",
    parentEmail: "m.vance@family.com",
    parentPhone: "+1 (555) 012-9844",
    emergencyContact: "Elena Vance (Mother)",
    emergencyPhone: "+1 (555) 012-9845",
    notes: ["Chloe checked into counseling regarding IB workload stress.", "Physics IA proposal approved."],
    gpa: "3.85",
    attendanceRate: "97.4%",
  },
  {
    id: "std-2",
    name: "Lucas Gray",
    avatar: "LG",
    grade: "Grade 11-B",
    homeroom: "Homeroom 11-F",
    advisor: "Ananya Rao",
    status: "infirmary",
    currentClass: "Library Study (Self)",
    currentRoom: "Infirmary Room",
    program: "dp",
    parentName: "Sarah Gray",
    parentEmail: "s.gray@family.com",
    parentPhone: "+1 (555) 234-9081",
    emergencyContact: "Robert Gray (Father)",
    emergencyPhone: "+1 (555) 234-9082",
    specialStatus: "Fever checking. Checked in 10:15 AM by Nurse Linda.",
    notes: ["Dismissal requested for Period 5 due to fever.", "Math exam make-up pending."],
    gpa: "3.20",
    attendanceRate: "91.2%",
  },
  {
    id: "std-3",
    name: "Dilan Patel",
    avatar: "DP",
    grade: "Grade 11-A",
    homeroom: "Homeroom 11-F",
    advisor: "Aarav Chen",
    status: "library",
    currentClass: "Independent Research",
    currentRoom: "Main Library",
    program: "dp",
    parentName: "Rajesh Patel",
    parentEmail: "r.patel@family.com",
    parentPhone: "+1 (555) 345-0987",
    emergencyContact: "Rajesh Patel (Father)",
    emergencyPhone: "+1 (555) 345-0987",
    notes: ["Syllabus checklist for DP Chemistry completed.", "Library workspace reserved for EE research."],
    gpa: "3.90",
    attendanceRate: "98.5%",
  },
  {
    id: "std-4",
    name: "Emma Watson",
    avatar: "EW",
    grade: "Grade 11-A",
    homeroom: "Homeroom 11-F",
    advisor: "Sarah Chen",
    status: "counselor",
    currentClass: "Pastoral Review",
    currentRoom: "Room 102 (Guidance)",
    program: "dp",
    parentName: "John Watson",
    parentEmail: "j.watson@family.com",
    parentPhone: "+1 (555) 456-1234",
    emergencyContact: "Mary Watson (Mother)",
    emergencyPhone: "+1 (555) 456-1235",
    specialStatus: "IB Core Extended Essay consultation in progress.",
    notes: ["EE Draft review scheduled.", "Guidance counselor suggested study calendar adjustments."],
    gpa: "3.65",
    attendanceRate: "95.0%",
  },
  {
    id: "std-5",
    name: "Bruce Wayne",
    avatar: "BW",
    grade: "Grade 12-A",
    homeroom: "Homeroom 12-H",
    advisor: "Marcus Vance",
    status: "present",
    currentClass: "Advanced Calculus",
    currentRoom: "Room 204",
    program: "dp",
    parentName: "Alfred Pennyworth",
    parentEmail: "alfred@wayne.corp",
    parentPhone: "+1 (555) 900-1939",
    emergencyContact: "Alfred Pennyworth (Guardian)",
    emergencyPhone: "+1 (555) 900-1939",
    notes: ["Late arrival logged due to family commitments.", "Leadership program approval granted."],
    gpa: "4.00",
    attendanceRate: "99.1%",
  },
  {
    id: "std-6",
    name: "Zoe Kravitz",
    avatar: "ZK",
    grade: "Grade 10-A",
    homeroom: "Homeroom 10-M",
    advisor: "Clara Dupont",
    status: "present",
    currentClass: "MYP Language & Lit",
    currentRoom: "Room 3A",
    program: "myp",
    parentName: "Lenny Kravitz",
    parentEmail: "lenny@kravitz.net",
    parentPhone: "+1 (555) 789-0123",
    emergencyContact: "Lisa Bonet (Mother)",
    emergencyPhone: "+1 (555) 789-0124",
    notes: ["Active participation in MYP drama showcase.", "Personal project proposal review complete."],
    gpa: "3.45",
    attendanceRate: "93.8%",
  },
  {
    id: "std-7",
    name: "Peter Parker",
    avatar: "PP",
    grade: "Grade 10-B",
    homeroom: "Homeroom 10-M",
    advisor: "Marcus Vance",
    status: "present",
    currentClass: "Algebra II",
    currentRoom: "Room 4B",
    program: "myp",
    parentName: "May Parker",
    parentEmail: "may@parker.org",
    parentPhone: "+1 (555) 500-1962",
    emergencyContact: "May Parker (Aunt)",
    emergencyPhone: "+1 (555) 500-1962",
    notes: ["Chemistry lab reports are exceptional.", "Frequent tardiness noted for Period 1."],
    gpa: "3.75",
    attendanceRate: "92.0%",
  },
  {
    id: "std-8",
    name: "Miles Morales",
    avatar: "MM",
    grade: "Grade 10-B",
    homeroom: "Homeroom 10-M",
    advisor: "David Miller",
    status: "present",
    currentClass: "Physical Education",
    currentRoom: "Gymnasium",
    program: "myp",
    parentName: "Jefferson Davis",
    parentEmail: "j.davis@family.com",
    parentPhone: "+1 (555) 488-2011",
    emergencyContact: "Rio Morales (Mother)",
    emergencyPhone: "+1 (555) 488-2012",
    notes: ["Excellence in athletic agility tests.", "Personal Project focuses on city murals."],
    gpa: "3.50",
    attendanceRate: "94.2%",
  },
  {
    id: "std-9",
    name: "Gwen Stacy",
    avatar: "GS",
    grade: "Grade 10-A",
    homeroom: "Homeroom 10-M",
    advisor: "David Miller",
    status: "present",
    currentClass: "Physical Education",
    currentRoom: "Gymnasium",
    program: "myp",
    parentName: "George Stacy",
    parentEmail: "g.stacy@family.com",
    parentPhone: "+1 (555) 616-1965",
    emergencyContact: "George Stacy (Father)",
    emergencyPhone: "+1 (555) 616-1965",
    notes: ["MYP Science design cycle outstanding.", "Student Council rep."],
    gpa: "3.95",
    attendanceRate: "98.9%",
  },
  {
    id: "std-10",
    name: "Harry Osborn",
    avatar: "HO",
    grade: "Grade 10-B",
    homeroom: "Homeroom 10-M",
    advisor: "Clara Dupont",
    status: "leave",
    currentClass: "Dismissed (Parent Picked)",
    currentRoom: "Checked Out",
    program: "myp",
    parentName: "Norman Osborn",
    parentEmail: "norman@oscorp.com",
    parentPhone: "+1 (555) 100-3940",
    emergencyContact: "Norman Osborn (Father)",
    emergencyPhone: "+1 (555) 100-3940",
    specialStatus: "Authorized Early Dismissal. Picked up by Norman Osborn.",
    notes: ["Dentist appointment. Check-out logged by front desk at 12:45 PM.", "Make-up task for Literature submitted."],
    gpa: "3.10",
    attendanceRate: "89.4%",
  },
];

type StudentLookupPanelProps = {
  theme: string;
  activeProgram: "dp" | "myp" | "all";
  searchQuery: string;
};

export function StudentLookupPanel({ theme, activeProgram, searchQuery }: StudentLookupPanelProps) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newNoteText, setNewNoteText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  const styles = useMemo(() => {
    return {
      dark: {
        card: "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        badge: {
          present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          absent: "bg-red-500/10 text-red-400 border-red-500/20",
          infirmary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          counselor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          library: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          leave: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
        },
        panelBg: "bg-[#0E0E10]/95 border-l border-zinc-800",
        input: "bg-zinc-950 border-zinc-800 focus:border-cyan-500 text-white",
        button: "bg-cyan-500 text-black hover:bg-cyan-400",
        buttonSec: "border-zinc-800 hover:bg-zinc-800 text-zinc-300",
      },
      light: {
        card: "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm",
        textPrimary: "text-zinc-900",
        textSecondary: "text-zinc-500",
        badge: {
          present: "bg-emerald-50 text-emerald-700 border-emerald-200",
          absent: "bg-red-50 text-red-700 border-red-200",
          infirmary: "bg-amber-50 text-amber-700 border-amber-200",
          counselor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          library: "bg-cyan-50 text-cyan-700 border-cyan-200",
          leave: "bg-zinc-100 text-zinc-700 border-zinc-200",
        },
        panelBg: "bg-white border-l border-zinc-200 shadow-2xl",
        input: "bg-zinc-50 border-zinc-200 focus:border-cyan-600 text-zinc-900",
        button: "bg-cyan-600 text-white hover:bg-cyan-500",
        buttonSec: "border-zinc-300 hover:bg-zinc-100 text-zinc-700",
      },
      "high-contrast": {
        card: "bg-black border-2 border-white hover:bg-zinc-950",
        textPrimary: "text-white font-bold",
        textSecondary: "text-zinc-200",
        badge: {
          present: "border border-white text-white bg-black",
          absent: "border-2 border-white text-white bg-black font-extrabold",
          infirmary: "border border-white text-white bg-black",
          counselor: "border border-white text-white bg-black",
          library: "border border-white text-white bg-black",
          leave: "border border-white text-white bg-black",
        },
        panelBg: "bg-black border-l-4 border-white text-white",
        input: "bg-black border-2 border-white focus:outline-none focus:ring-2 focus:ring-white text-white",
        button: "bg-white text-black font-extrabold border-2 border-white hover:bg-zinc-200",
        buttonSec: "border-2 border-white bg-black text-white hover:bg-zinc-900",
      },
      axis: {
        card: "bg-[#0A0D14]/80 border-cyan-950/80 hover:border-cyan-500/30 backdrop-blur-xl",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        badge: {
          present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          absent: "bg-red-500/10 text-red-400 border-red-500/20",
          infirmary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          counselor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          library: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
          leave: "bg-zinc-500/10 text-cyan-200/60 border-cyan-950/40",
        },
        panelBg: "bg-[#05080E]/95 border-l border-cyan-950/80 shadow-[0_0_50px_rgba(6,182,212,0.15)]",
        input: "bg-[#05080E] border-cyan-950/80 focus:border-cyan-400 text-cyan-100",
        button: "bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]",
        buttonSec: "border-cyan-400/20 hover:bg-cyan-400/5 text-cyan-300",
      },
    }[theme as "dark" | "light" | "high-contrast" | "axis"] || {
      card: "bg-zinc-900/60 border-zinc-800",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      badge: {
        present: "bg-emerald-500/10 text-emerald-400",
        absent: "bg-red-500/10 text-red-400",
        infirmary: "bg-amber-500/10 text-amber-400",
        counselor: "bg-indigo-500/10 text-indigo-400",
        library: "bg-cyan-500/10 text-cyan-400",
        leave: "bg-zinc-500/10 text-zinc-400",
      },
      panelBg: "bg-zinc-950 border-l border-zinc-800",
      input: "bg-zinc-950 border-zinc-800 focus:border-cyan-500",
      button: "bg-cyan-500 text-black",
      buttonSec: "border-zinc-800 text-zinc-300",
    };
  }, [theme]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Program filter
      if (activeProgram !== "all" && student.program !== activeProgram) {
        return false;
      }
      // 2. Status filter
      if (statusFilter !== "all" && student.status !== statusFilter) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.grade.toLowerCase().includes(query) ||
          student.currentClass.toLowerCase().includes(query) ||
          student.currentRoom.toLowerCase().includes(query) ||
          student.advisor.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [students, activeProgram, statusFilter, searchQuery]);

  const handleAddNote = (studentId: string) => {
    if (!newNoteText.trim()) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            notes: [newNoteText.trim(), ...s.notes],
          };
        }
        return s;
      })
    );
    // Keep sidebar updated
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [newNoteText.trim(), ...prev.notes],
        };
      });
    }
    setNewNoteText("");
  };

  const statusLabel = (status: StudentStatus) => {
    switch (status) {
      case "present": return "Present in Class";
      case "absent": return "Absent";
      case "infirmary": return "In Infirmary";
      case "counselor": return "With Counselor";
      case "library": return "Study in Library";
      case "leave": return "Early Dismissal / Out";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search status filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Students" },
            { id: "present", label: "In Classroom" },
            { id: "infirmary", label: "Infirmary" },
            { id: "counselor", label: "Counseling Office" },
            { id: "library", label: "Library Sessions" },
            { id: "absent", label: "Absent" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                statusFilter === filter.id
                  ? theme === "light" ? "bg-cyan-600 text-white border-cyan-600" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  : theme === "light" ? "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50" : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Directory views selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-semibold text-white/30">
            {(["grid", "list", "compact"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all ${
                  viewMode === mode
                    ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className={`text-xs font-mono ${styles.textSecondary}`}>
            {filteredStudents.length} of {students.filter(s => activeProgram === "all" || s.program === activeProgram).length} students
          </span>
        </div>
      </div>

      {/* View modes rendering */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <span className="text-xl">🔍</span>
          <h4 className={`text-sm font-semibold mt-2 ${styles.textPrimary}`}>No students matching criteria</h4>
          <p className={`text-xs mt-1 ${styles.textSecondary}`}>Refine your search parameters or program context filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 ${styles.card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400">
                    {student.avatar}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold tracking-tight ${styles.textPrimary}`}>{student.name}</h4>
                    <span className={`text-[10px] uppercase font-semibold tracking-wider text-cyan-400`}>
                      {student.grade} · {student.program.toUpperCase()}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[student.status]}`}>
                  {student.status}
                </span>
              </div>

              <div className="border-t border-white/[0.03] pt-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className={styles.textSecondary}>Current Class:</span>
                  <span className={`font-semibold ${styles.textPrimary} max-w-[150px] truncate`}>
                    {student.currentClass}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={styles.textSecondary}>Location / Room:</span>
                  <span className={`font-mono text-[11px] text-cyan-400 font-bold`}>
                    {student.currentRoom}
                  </span>
                </div>
                {student.specialStatus && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400 font-medium">
                    ⚠️ {student.specialStatus}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[9px] font-bold text-white/40 uppercase tracking-widest">
                <th className="p-4">Student</th>
                <th className="p-4">Grade & Prog</th>
                <th className="p-4">Advisor</th>
                <th className="p-4">Current Subject</th>
                <th className="p-4">Room</th>
                <th className="p-4 font-mono">GPA</th>
                <th className="p-4 font-mono">Attendance</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-white flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-[9px] text-cyan-400">
                      {student.avatar}
                    </div>
                    {student.name}
                  </td>
                  <td className="p-4 text-cyan-200/60 font-semibold">
                    {student.grade} <span className="text-[9px] px-1 py-0.2 bg-white/5 rounded border border-white/10 ml-1 font-bold text-cyan-400">{student.program.toUpperCase()}</span>
                  </td>
                  <td className="p-4 text-white/70 font-medium">{student.advisor}</td>
                  <td className="p-4 font-medium text-white/90">{student.currentClass}</td>
                  <td className="p-4 font-mono font-bold text-cyan-400">{student.currentRoom}</td>
                  <td className="p-4 font-mono text-cyan-300 font-bold">{student.gpa}</td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">{student.attendanceRate}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border ${styles.badge[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[8px] font-extrabold text-white/30 uppercase tracking-widest">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3 font-mono">GPA</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[11px] font-semibold text-white/70">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-white">{student.name}</td>
                  <td className="py-2 px-3 text-white/50">{student.grade} ({student.program.toUpperCase()})</td>
                  <td className="py-2 px-3 truncate max-w-[180px]">{student.currentClass}</td>
                  <td className="py-2 px-3 font-mono text-cyan-400/80">{student.currentRoom}</td>
                  <td className="py-2 px-3 font-mono font-bold text-cyan-300">{student.gpa}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider border ${styles.badge[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Side-Sheet Panel */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md p-6 overflow-y-auto flex flex-col justify-between ${styles.panelBg}`}
            >
              {/* Profile body content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Student Position Telemetry
                  </span>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textSecondary} hover:${styles.textPrimary}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Profile Identity Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="size-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl font-bold text-cyan-400">
                    {selectedStudent.avatar}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-base font-black tracking-tight ${styles.textPrimary}`}>{selectedStudent.name}</h3>
                    <p className={`text-xs ${styles.textSecondary}`}>
                      {selectedStudent.grade} · Homeroom: <strong>{selectedStudent.homeroom}</strong>
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      IB {selectedStudent.program.toUpperCase()} STUDENT
                    </span>
                  </div>
                </div>

                {/* Live position and class info */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Live Location Log</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Presence Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[selectedStudent.status]}`}>
                        {statusLabel(selectedStudent.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Active Subject:</span>
                      <span className={`font-semibold ${styles.textPrimary}`}>{selectedStudent.currentClass}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Assigned Room:</span>
                      <span className={`font-mono text-cyan-400 font-bold`}>{selectedStudent.currentRoom}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Academic Advisor:</span>
                      <span className={`font-semibold ${styles.textPrimary}`}>{selectedStudent.advisor}</span>
                    </div>

                    {selectedStudent.specialStatus && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] leading-relaxed text-amber-400 font-semibold">
                        ⚠️ SPECIAL STATUS NOTE: <br />
                        <span className="font-normal block mt-0.5 text-white/80">{selectedStudent.specialStatus}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics overview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Academic GPA</span>
                    <h5 className="text-xl font-black text-cyan-400 font-mono">{selectedStudent.gpa}</h5>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Attendance Rate</span>
                    <h5 className="text-xl font-black text-cyan-400 font-mono">{selectedStudent.attendanceRate}</h5>
                  </div>
                </div>

                {/* Parent & Emergency Contacts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Family & Emergency Contacts</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`font-semibold ${styles.textPrimary}`}>Parent: {selectedStudent.parentName}</span>
                        <span className={styles.textSecondary}>{selectedStudent.parentPhone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] ${styles.textSecondary}`}>{selectedStudent.parentEmail}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`Initiating mock SMS message to parent ${selectedStudent.parentName} (${selectedStudent.parentPhone})...`)}
                            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold uppercase hover:bg-white/10 text-white/80 hover:text-white"
                          >
                            SMS
                          </button>
                          <button
                            onClick={() => alert(`Initiating call simulation to parent ${selectedStudent.parentName} (${selectedStudent.parentPhone})...`)}
                            className="px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20 text-[9px] font-bold uppercase text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all"
                          >
                            Call
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-red-400">Emergency: {selectedStudent.emergencyContact}</span>
                        <span className={styles.textSecondary}>{selectedStudent.emergencyPhone}</span>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => alert(`ALERT: Simulating emergency contact phone trigger to ${selectedStudent.emergencyContact}...`)}
                          className="px-3.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-[9px] font-bold uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all animate-pulse"
                        >
                          Trigger Emergency Call
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and logs */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Activity Notes</h4>
                  
                  {/* Note Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add administrative coordination log..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
                    />
                    <button
                      onClick={() => handleAddNote(selectedStudent.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold ${styles.button}`}
                    >
                      Add Note
                    </button>
                  </div>

                  {/* Note logs list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedStudent.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs leading-relaxed text-white/70">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="pt-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider border font-bold ${styles.buttonSec}`}
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
