"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type StudentStatus = "present" | "absent" | "infirmary" | "counselor" | "library" | "leave";

export type Guardian = {
  name: string;
  relationship: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
};

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
  program: "dp" | "myp" | "cp";
  guardians: Guardian[];
  emergencyContact: string;
  emergencyPhone: string;
  notes: string[];
  gpa: string;
  attendanceRate: string;
  specialStatus?: string;
  email: string;
  phone: string;
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
    guardians: [
      { name: "Marcus Vance", relationship: "Father", email: "m.vance@family.com", phone: "+1 (555) 012-9844", isPrimary: true },
      { name: "Elena Vance", relationship: "Mother", email: "e.vance@family.com", phone: "+1 (555) 012-9845" }
    ],
    emergencyContact: "Elena Vance (Mother)",
    emergencyPhone: "+1 (555) 012-9845",
    notes: ["Chloe checked into counseling regarding IB workload stress.", "Physics IA proposal approved."],
    gpa: "3.85",
    attendanceRate: "97.4%",
    email: "chloe.vance@student.edu",
    phone: "+1 (555) 012-9840"
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
    guardians: [
      { name: "Sarah Gray", relationship: "Mother", email: "s.gray@family.com", phone: "+1 (555) 234-9081", isPrimary: true },
      { name: "Robert Gray", relationship: "Father", email: "r.gray@family.com", phone: "+1 (555) 234-9082" }
    ],
    emergencyContact: "Robert Gray (Father)",
    emergencyPhone: "+1 (555) 234-9082",
    specialStatus: "Fever checking. Checked in 10:15 AM by Nurse Linda.",
    notes: ["Dismissal requested for Period 5 due to fever.", "Math exam make-up pending."],
    gpa: "3.20",
    attendanceRate: "91.2%",
    email: "lucas.gray@student.edu",
    phone: "+1 (555) 234-9080"
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
    guardians: [
      { name: "Rajesh Patel", relationship: "Father", email: "r.patel@family.com", phone: "+1 (555) 345-0987", isPrimary: true }
    ],
    emergencyContact: "Rajesh Patel (Father)",
    emergencyPhone: "+1 (555) 345-0987",
    notes: ["Syllabus checklist for DP Chemistry completed.", "Library workspace reserved for EE research."],
    gpa: "3.90",
    attendanceRate: "98.5%",
    email: "dilan.patel@student.edu",
    phone: "+1 (555) 345-0980"
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
    guardians: [
      { name: "John Watson", relationship: "Father", email: "j.watson@family.com", phone: "+1 (555) 456-1234", isPrimary: true },
      { name: "Mary Watson", relationship: "Mother", email: "m.watson@family.com", phone: "+1 (555) 456-1235" }
    ],
    emergencyContact: "Mary Watson (Mother)",
    emergencyPhone: "+1 (555) 456-1235",
    specialStatus: "IB Core Extended Essay consultation in progress.",
    notes: ["EE Draft review scheduled.", "Guidance counselor suggested study calendar adjustments."],
    gpa: "3.65",
    attendanceRate: "95.0%",
    email: "emma.watson@student.edu",
    phone: "+1 (555) 456-1230"
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
    guardians: [
      { name: "Alfred Pennyworth", relationship: "Legal Guardian", email: "alfred@wayne.corp", phone: "+1 (555) 900-1939", isPrimary: true }
    ],
    emergencyContact: "Alfred Pennyworth (Guardian)",
    emergencyPhone: "+1 (555) 900-1939",
    notes: ["Late arrival logged due to family commitments.", "Leadership program approval granted."],
    gpa: "4.00",
    attendanceRate: "99.1%",
    email: "bruce.wayne@student.edu",
    phone: "+1 (555) 900-1930"
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
    guardians: [
      { name: "Lenny Kravitz", relationship: "Father", email: "lenny@kravitz.net", phone: "+1 (555) 789-0123", isPrimary: true },
      { name: "Lisa Bonet", relationship: "Mother", email: "lisa@bonet.net", phone: "+1 (555) 789-0124" }
    ],
    emergencyContact: "Lisa Bonet (Mother)",
    emergencyPhone: "+1 (555) 789-0124",
    notes: ["Active participation in MYP drama showcase.", "Personal project proposal review complete."],
    gpa: "3.45",
    attendanceRate: "93.8%",
    email: "zoe.kravitz@student.edu",
    phone: "+1 (555) 789-0120"
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
    guardians: [
      { name: "May Parker", relationship: "Grandparent", email: "may@parker.org", phone: "+1 (555) 500-1962", isPrimary: true }
    ],
    emergencyContact: "May Parker (Aunt)",
    emergencyPhone: "+1 (555) 500-1962",
    notes: ["Chemistry lab reports are exceptional.", "Frequent tardiness noted for Period 1."],
    gpa: "3.75",
    attendanceRate: "92.0%",
    email: "peter.parker@student.edu",
    phone: "+1 (555) 500-1960"
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
    guardians: [
      { name: "Jefferson Davis", relationship: "Father", email: "j.davis@family.com", phone: "+1 (555) 488-2011", isPrimary: true },
      { name: "Rio Morales", relationship: "Mother", email: "r.morales@family.com", phone: "+1 (555) 488-2012" }
    ],
    emergencyContact: "Rio Morales (Mother)",
    emergencyPhone: "+1 (555) 488-2012",
    notes: ["Excellence in athletic agility tests.", "Personal Project focuses on city murals."],
    gpa: "3.50",
    attendanceRate: "94.2%",
    email: "miles.morales@student.edu",
    phone: "+1 (555) 488-2010"
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
    guardians: [
      { name: "George Stacy", relationship: "Father", email: "g.stacy@family.com", phone: "+1 (555) 616-1965", isPrimary: true }
    ],
    emergencyContact: "George Stacy (Father)",
    emergencyPhone: "+1 (555) 616-1965",
    notes: ["MYP Science design cycle outstanding.", "Student Council rep."],
    gpa: "3.95",
    attendanceRate: "98.9%",
    email: "gwen.stacy@student.edu",
    phone: "+1 (555) 616-1960"
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
    guardians: [
      { name: "Norman Osborn", relationship: "Father", email: "norman@oscorp.com", phone: "+1 (555) 100-3940", isPrimary: true }
    ],
    emergencyContact: "Norman Osborn (Father)",
    emergencyPhone: "+1 (555) 100-3940",
    specialStatus: "Authorized Early Dismissal. Picked up by Norman Osborn.",
    notes: ["Dentist appointment. Check-out logged by front desk at 12:45 PM.", "Make-up task for Literature submitted."],
    gpa: "3.10",
    attendanceRate: "89.4%",
    email: "harry.osborn@student.edu",
    phone: "+1 (555) 100-3940"
  },
  {
    id: "std-11",
    name: "Clark Kent",
    avatar: "CK",
    grade: "Grade 12-B",
    homeroom: "Homeroom 12-H",
    advisor: "Marcus Vance",
    status: "present",
    currentClass: "CP Agricultural Science",
    currentRoom: "Greenhouse B",
    program: "cp",
    guardians: [
      { name: "Martha Kent", relationship: "Mother", email: "martha@kentfarm.org", phone: "+1 (555) 762-1938", isPrimary: true },
      { name: "Jonathan Kent", relationship: "Father", email: "jonathan@kentfarm.org", phone: "+1 (555) 762-1939" }
    ],
    emergencyContact: "Martha Kent (Mother)",
    emergencyPhone: "+1 (555) 762-1938",
    notes: ["Clark is coordinating the school agricultural expo project.", "Excellent leadership skills logged in Career Portfolio."],
    gpa: "3.92",
    attendanceRate: "99.4%",
    email: "clark.kent@student.edu",
    phone: "+1 (555) 762-1930"
  },
  {
    id: "std-12",
    name: "Bruce Banner",
    avatar: "BB",
    grade: "Grade 11-A",
    homeroom: "Homeroom 11-F",
    advisor: "Ananya Rao",
    status: "present",
    currentClass: "CP Bio-Technology",
    currentRoom: "Lab 5",
    program: "cp",
    guardians: [
      { name: "Rebecca Banner", relationship: "Caregiver", email: "rebecca@banner.org", phone: "+1 (555) 284-1962", isPrimary: true }
    ],
    emergencyContact: "Rebecca Banner (Aunt)",
    emergencyPhone: "+1 (555) 284-1962",
    notes: ["Bruce requested library access for research projects.", "Safety briefing completed for chemistry lab."],
    gpa: "3.78",
    attendanceRate: "94.5%",
    email: "bruce.banner@student.edu",
    phone: "+1 (555) 284-1960"
  }
];

type StudentLookupPanelProps = {
  theme: string;
  activeProgram: "dp" | "myp" | "all";
  searchQuery: string;
  selectedStudentId?: string | null;
  onClearSelectedStudent?: () => void;
  onViewStatistics?: (studentId: string) => void;
};

export type RecipientType = {
  name: string;
  email: string;
  phone: string;
  relationship?: string;
  type: "student" | "guardian" | "teacher";
};

export function StudentLookupPanel({ 
  theme, 
  searchQuery,
  selectedStudentId,
  onClearSelectedStudent,
  onViewStatistics
}: StudentLookupPanelProps) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [programFilter, setProgramFilter] = useState<string>("dp1");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newNoteText, setNewNoteText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  // Handle outside selection from Universal Search
  useEffect(() => {
    if (selectedStudentId) {
      const found = students.find((s) => s.id === selectedStudentId);
      if (found) {
        setSelectedStudent(found);
        onClearSelectedStudent?.();
      }
    }
  }, [selectedStudentId, students, onClearSelectedStudent]);

  // Generic messaging & calling targets
  const [activeChatRecipient, setActiveChatRecipient] = useState<RecipientType | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [mockMessages, setMockMessages] = useState<string[]>([]);
  const [activeCallRecipient, setActiveCallRecipient] = useState<RecipientType | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleEmailRecipient = (email: string) => {
    if (typeof window !== "undefined") {
      const win = window as typeof window & {
        pendingComposeEmail?: { to: string; subject: string; body: string };
      };
      win.pendingComposeEmail = {
        to: email,
        subject: "",
        body: ""
      };
    }
    window.dispatchEvent(new CustomEvent("axis-compose-email", {
      detail: {
        to: email,
        subject: "",
        body: ""
      }
    }));
    window.dispatchEvent(new CustomEvent("axis-navigate-tab", {
      detail: { tab: "email" }
    }));
  };

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
        button: "bg-cyan-50 text-black hover:bg-cyan-200",
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
    return students
      .filter((student) => {
        // 1. Program filter
        if (programFilter === "dp1") {
          if (student.program !== "dp" || !student.grade.includes("Grade 11")) return false;
        } else if (programFilter === "dp2") {
          if (student.program !== "dp" || !student.grade.includes("Grade 12")) return false;
        } else if (programFilter === "cp1") {
          if (student.program !== "cp" || !student.grade.includes("Grade 11")) return false;
        } else if (programFilter === "cp2") {
          if (student.program !== "cp" || !student.grade.includes("Grade 12")) return false;
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
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, programFilter, statusFilter, searchQuery]);

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
      {/* Program Cohort Filters */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
        {[
          { id: "dp1", label: "DP1" },
          { id: "dp2", label: "DP2" },
          { id: "cp1", label: "CP1" },
          { id: "cp2", label: "CP2" },
          { id: "all", label: "All Students" }
        ].map((prog) => (
          <button
            key={prog.id}
            onClick={() => setProgramFilter(prog.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              programFilter === prog.id
                ? theme === "light"
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : theme === "light"
                  ? "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {prog.label}
          </button>
        ))}
      </div>

      {/* Search status filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Statuses" },
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
            {filteredStudents.length} of {students.length} students
          </span>
        </div>
      </div>

      {/* View modes rendering */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <svg className="size-6 text-zinc-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
              <div className="flex items-start justify-between gap-3 text-left">
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

              <div className="border-t border-white/[0.03] pt-3.5 space-y-2 text-left">
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
                  <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400 font-medium flex items-start gap-1">
                    <svg className="size-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{student.specialStatus}</span>
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
              <div className="space-y-6 text-left">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Student Position Telemetry
                  </span>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${styles.textSecondary} hover:${styles.textPrimary}`}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
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

                {/* Academic Profile Redirect */}
                {onViewStatistics && (
                  <button
                    onClick={() => {
                      onViewStatistics(selectedStudent.id);
                      setSelectedStudent(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/25 text-cyan-400 font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>View Academic Statistics Profile</span>
                  </button>
                )}

                {/* Student direct communications */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Student Contact Actions</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEmailRecipient(selectedStudent.email)}
                      className={theme === "light"
                        ? "flex-1 py-1.5 px-3 rounded-xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                        : "flex-1 py-1.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                      }
                    >
                      <svg className="size-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span>Email</span>
                    </button>
                    <button
                      onClick={() => {
                        setMockMessages([]);
                        setActiveChatRecipient({ name: selectedStudent.name, email: selectedStudent.email, phone: selectedStudent.phone, type: "student" });
                      }}
                      className={theme === "light"
                        ? "flex-1 py-1.5 px-3 rounded-xl bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                        : "flex-1 py-1.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                      }
                    >
                      <svg className="size-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setActiveCallRecipient({ name: selectedStudent.name, email: selectedStudent.email, phone: selectedStudent.phone, type: "student" })}
                      className={theme === "light"
                        ? "flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-600 hover:text-cyan-700 flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                        : "flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 text-[10px] font-semibold transition-all"
                      }
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622c0-1.03.837-1.868 1.868-1.868h3.354c.49 0 .935.293 1.13.742l1.378 3.149c.195.446.068.966-.312 1.276L7.333 11.1c.884 1.784 2.33 3.23 4.114 4.114l1.176-1.341c.31-.38.83-.507 1.276-.312l3.149 1.378c.449.195.742.64.742 1.13v3.354c0 1.03-.837 1.868-1.868 1.868A15.897 15.897 0 012.25 6.622z" />
                      </svg>
                      <span>Call</span>
                    </button>
                  </div>
                </div>

                {/* Guardians Contacts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Guardians & Emergency Contacts</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4 text-xs">
                    {selectedStudent.guardians.map((guardian, index) => (
                      <div key={index} className="space-y-2.5">
                        {index > 0 && <div className="h-px bg-white/[0.05] my-2" />}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`font-semibold ${styles.textPrimary} block`}>
                              {guardian.name}
                            </span>
                            <span className="text-[10px] text-white/40 block mt-0.5 font-medium">
                              {guardian.relationship}
                            </span>
                          </div>
                          <span className={`${styles.textSecondary} font-mono`}>{guardian.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] ${styles.textSecondary}`}>{guardian.email}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEmailRecipient(guardian.email)}
                              className={theme === "light"
                                ? "py-1 px-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                                : "py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                              }
                            >
                              <svg className="size-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                              <span>Email</span>
                            </button>
                            <button
                              onClick={() => {
                                setMockMessages([]);
                                setActiveChatRecipient({ name: guardian.name, email: guardian.email, phone: guardian.phone, relationship: guardian.relationship, type: "guardian" });
                              }}
                              className={theme === "light"
                                ? "py-1 px-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                                : "py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                              }
                            >
                              <svg className="size-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                              </svg>
                              <span>Message</span>
                            </button>
                            <button
                              onClick={() => setActiveCallRecipient({ name: guardian.name, email: guardian.email, phone: guardian.phone, relationship: guardian.relationship, type: "guardian" })}
                              className={theme === "light"
                                ? "py-1 px-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-600 hover:text-cyan-700 flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                                : "py-1 px-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                              }
                            >
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622c0-1.03.837-1.868 1.868-1.868h3.354c.49 0 .935.293 1.13.742l1.378 3.149c.195.446.068.966-.312 1.276L7.333 11.1c.884 1.784 2.33 3.23 4.114 4.114l1.176-1.341c.31-.38.83-.507 1.276-.312l3.149 1.378c.449.195.742.64.742 1.13v3.354c0 1.03-.837 1.868-1.868 1.868A15.897 15.897 0 012.25 6.622z" />
                              </svg>
                              <span>Call</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="h-px bg-white/[0.05]" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-red-400/90 font-semibold">
                        <span>Emergency: {selectedStudent.emergencyContact}</span>
                        <span className={styles.textSecondary}>{selectedStudent.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Advisor Contact Actions */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Academic Advisor</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between text-xs">
                    <div>
                      <span className={`font-semibold ${styles.textPrimary} block`}>{selectedStudent.advisor}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">Faculty Advisor</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const email = `${selectedStudent.advisor.toLowerCase().replace(" ", ".")}@school.edu`;
                          handleEmailRecipient(email);
                        }}
                        className={theme === "light"
                          ? "py-1 px-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                          : "py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                        }
                      >
                        <svg className="size-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>Email</span>
                      </button>
                      <button
                        onClick={() => {
                          setMockMessages([]);
                          const phone = "+1 (555) 019-2834";
                          const email = `${selectedStudent.advisor.toLowerCase().replace(" ", ".")}@school.edu`;
                          setActiveChatRecipient({ name: selectedStudent.advisor, email, phone, type: "teacher" });
                        }}
                        className={theme === "light"
                          ? "py-1 px-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] hover:bg-black/[0.05] text-black/70 hover:text-black flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                          : "py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/70 hover:text-white flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                        }
                      >
                        <svg className="size-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span>Message</span>
                      </button>
                      <button
                        onClick={() => {
                          const email = `${selectedStudent.advisor.toLowerCase().replace(" ", ".")}@school.edu`;
                          const phone = "+1 (555) 019-2834";
                          setActiveCallRecipient({ name: selectedStudent.advisor, email, phone, type: "teacher" });
                        }}
                        className={theme === "light"
                          ? "py-1 px-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-600 hover:text-cyan-700 flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                          : "py-1 px-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 text-[9px] font-semibold transition-all"
                        }
                      >
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622c0-1.03.837-1.868 1.868-1.868h3.354c.49 0 .935.293 1.13.742l1.378 3.149c.195.446.068.966-.312 1.276L7.333 11.1c.884 1.784 2.33 3.23 4.114 4.114l1.176-1.341c.31-.38.83-.507 1.276-.312l3.149 1.378c.449.195.742.64.742 1.13v3.354c0 1.03-.837 1.868-1.868 1.868A15.897 15.897 0 012.25 6.622z" />
                        </svg>
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                </div>

                {selectedStudent.specialStatus && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed text-amber-400 font-semibold flex items-start gap-2">
                    <svg className="size-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-amber-400/60 tracking-wider">Special Status Note</span>
                      <span className="font-normal block mt-1 text-white/80">{selectedStudent.specialStatus}</span>
                    </div>
                  </div>
                )}

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

            {/* Contextual Messaging Slide-Out Panel */}
            <AnimatePresence>
              {activeChatRecipient && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveChatRecipient(null)}
                    className="fixed inset-0 z-45 bg-black"
                  />
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    className={`fixed right-[448px] top-0 bottom-0 z-50 w-full max-w-sm p-5 border-r border-white/10 flex flex-col justify-between ${styles.panelBg}`}
                    style={{ boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.5)" }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
                        <div className="text-left">
                          <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">Direct Channel</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {activeChatRecipient.name}
                            {activeChatRecipient.type === "guardian" && activeChatRecipient.relationship && (
                              <span className="text-[9px] text-white/40 block mt-0.5 normal-case font-medium">({activeChatRecipient.relationship})</span>
                            )}
                            {activeChatRecipient.type === "student" && (
                              <span className="text-[9px] text-white/40 block mt-0.5 normal-case font-medium">(Student)</span>
                            )}
                            {activeChatRecipient.type === "teacher" && (
                              <span className="text-[9px] text-white/40 block mt-0.5 normal-case font-medium">(Advisor)</span>
                            )}
                          </h4>
                        </div>
                        <button
                          onClick={() => setActiveChatRecipient(null)}
                          className="text-white/40 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Chat History */}
                      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 select-none scrollbar-none text-left">
                        <div className="text-[10px] text-white/35 font-bold uppercase tracking-widest text-center py-2">
                          Beginning of Conversation with {activeChatRecipient.name}
                        </div>
                        <div className="flex flex-col gap-1.5 items-end">
                          <div className="p-3 rounded-2xl bg-cyan-500 text-black text-xs font-medium max-w-[85%] rounded-tr-sm text-left">
                            Hi {activeChatRecipient.name}, just wanted to check in.
                          </div>
                          <span className="text-[8px] text-white/30 font-bold uppercase font-mono mr-1">Delivered</span>
                        </div>
                        {/* Mock sent message */}
                        {mockMessages.map((m, idx) => (
                          <div key={idx} className="flex flex-col gap-1.5 items-end">
                            <div className="p-3 rounded-2xl bg-cyan-500 text-black text-xs font-medium max-w-[85%] rounded-tr-sm text-left">
                              {m}
                            </div>
                            <span className="text-[8px] text-white/30 font-bold uppercase font-mono mr-1">Sent</span>
                          </div>
                        ))}
                      </div>

                      {/* Message Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (chatInput.trim()) {
                            setMockMessages(prev => [...prev, chatInput.trim()]);
                            setChatInput("");
                          }
                        }}
                        className="flex gap-2 pt-3 border-t border-white/[0.06] shrink-0"
                      >
                        <input
                          type="text"
                          placeholder="Type message..."
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs rounded-xl border bg-black/45 border-white/[0.08] text-white outline-none focus:border-cyan-500/50`}
                        />
                        <button
                          type="submit"
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold ${styles.button}`}
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Call Option Modal */}
            <AnimatePresence>
              {activeCallRecipient && (
                <div className="fixed inset-0 z-[260] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm select-none">
                  <div className="fixed inset-0" onClick={() => setActiveCallRecipient(null)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-[#0E0E10] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl z-10 text-white text-left"
                  >
                    <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Communication Link</span>
                      </div>
                      <button onClick={() => setActiveCallRecipient(null)} className="text-white/40 hover:text-white">✕</button>
                    </div>
                    
                    <div className="text-center space-y-2 py-2">
                      <h4 className="text-sm font-black text-white">{activeCallRecipient.name}</h4>
                      <p className="text-[11px] text-white/45 uppercase tracking-wider font-semibold">
                        {activeCallRecipient.type === "guardian" && activeCallRecipient.relationship ? activeCallRecipient.relationship : activeCallRecipient.type.toUpperCase()}
                      </p>
                      <p className="text-lg font-mono font-bold text-cyan-400 tracking-wide mt-1.5">{activeCallRecipient.phone}</p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          alert(`Initiating encrypted Axis Audio Call to ${activeCallRecipient.name}...`);
                          setActiveCallRecipient(null);
                        }}
                        className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      >
                        Axis Call
                      </button>
                      {isMobile && (
                        <a
                          href={`tel:${activeCallRecipient.phone}`}
                          onClick={() => setActiveCallRecipient(null)}
                          className="w-full py-2.5 text-center bg-white/5 hover:bg-white/10 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all border border-white/10"
                        >
                          Phone Call
                        </a>
                      )}
                      <button
                        onClick={() => setActiveCallRecipient(null)}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all border border-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
