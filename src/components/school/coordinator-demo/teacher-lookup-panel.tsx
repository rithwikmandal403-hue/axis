"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TeacherStatus = "available" | "teaching" | "meeting" | "away";

export type Teacher = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  status: TeacherStatus;
  currentRoom: string;
  email: string;
  phone: string;
  assignedClasses: string[];
  designation: string;
  notes: string[];
  meetingAvailability?: string;

  // Multi-role model
  roles: string[];
  isHeadOfDept?: boolean;
  isCasAdvisor?: boolean;
  isEeSupervisor?: boolean;
  isTokTeacher?: boolean;
  isCounselor?: boolean;
  isRecentContact?: boolean;

  // Detailed fields for Detail Panel
  subjectsTaught?: string[];
  homeroomAssignments?: string[];
  casAssignments?: string[];
  eeSupervision?: string[];
  tokResponsibilities?: string[];
  deptLeadership?: string[];
  studentAllocations?: string[];
};

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    name: "Aarav Chen",
    avatar: "AC",
    role: "Guidance Counselor & Advisor",
    department: "Pastoral",
    status: "available",
    currentRoom: "Room 102",
    email: "aarav.chen@school.edu",
    phone: "+1 (555) 019-2834",
    assignedClasses: ["Pastoral review 11-F", "Workload Counseling"],
    designation: "Guidance Counselor",
    roles: ["Counselor", "TOK Teacher", "CAS Advisor", "Homeroom Advisor"],
    isCounselor: true,
    isTokTeacher: true,
    isCasAdvisor: true,
    isRecentContact: false,
    meetingAvailability: "Daily, Period 2",
    subjectsTaught: ["Pastoral Review", "Stress Management"],
    homeroomAssignments: ["Grade 11-F Advisor"],
    casAssignments: ["Student Welfare Committee Mentor"],
    eeSupervision: ["2 Students (World Studies EE)"],
    tokResponsibilities: ["Theory of Knowledge Section A Tutor"],
    deptLeadership: [],
    studentAllocations: ["45 Students (Welfare & Academic Support)"],
    notes: ["Counseling roster expanded for DP1 Candidates.", "Discussed study skills with 11-F class."]
  },
  {
    id: "tch-2",
    name: "Ananya Rao",
    avatar: "AR",
    role: "Chemistry Specialist & College Counselor",
    department: "Science",
    status: "meeting",
    currentRoom: "Conference Hall B",
    email: "ananya.rao@school.edu",
    phone: "+1 (555) 019-2835",
    assignedClasses: ["Grade 11 Chemistry (A)", "Grade 12 DP Chemistry"],
    designation: "Senior College Counselor",
    roles: ["Chemistry Teacher", "College Counselor", "EE Supervisor", "CAS Advisor"],
    isCounselor: true,
    isEeSupervisor: true,
    isCasAdvisor: true,
    isRecentContact: true,
    meetingAvailability: "Wednesdays, Period 3",
    subjectsTaught: ["Grade 11 Chemistry HL", "Grade 12 Chemistry SL"],
    homeroomAssignments: [],
    casAssignments: ["Career Guidance Club Support"],
    eeSupervision: ["3 Students (Chemistry/Materials Science EE)"],
    tokResponsibilities: [],
    deptLeadership: [],
    studentAllocations: ["60 Students (College Applications Guide)"],
    notes: ["Oversight meeting scheduled for Next Tuesday.", "Science lab budget review complete."]
  },
  {
    id: "tch-3",
    name: "Marcus Vance",
    avatar: "MV",
    role: "Head of Math & Calculus Expert",
    department: "Mathematics",
    status: "teaching",
    currentRoom: "Room 204",
    email: "marcus.vance@school.edu",
    phone: "+1 (555) 019-2836",
    assignedClasses: ["Grade 12 Calculus", "Grade 10 Algebra II"],
    designation: "Head of Mathematics",
    roles: ["Math Teacher", "Head of Department", "EE Supervisor"],
    isHeadOfDept: true,
    isEeSupervisor: true,
    isRecentContact: true,
    meetingAvailability: "Mondays, Period 4",
    subjectsTaught: ["Grade 12 Calculus HL", "Grade 10 Algebra II"],
    homeroomAssignments: [],
    casAssignments: [],
    eeSupervision: ["2 Students (Math EE)"],
    tokResponsibilities: [],
    deptLeadership: ["Mathematics Department Head"],
    studentAllocations: ["12 Students (Extended Math IA support)"],
    notes: ["Math AA HL curriculum mapping verified.", "Sub cover request approved for Period 4."]
  },
  {
    id: "tch-4",
    name: "Sarah Chen",
    avatar: "SC",
    role: "Head of Science & Physics Master",
    department: "Science",
    status: "available",
    currentRoom: "Lab 3",
    email: "sarah.chen@school.edu",
    phone: "+1 (555) 019-2837",
    assignedClasses: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
    designation: "Head of Science Department",
    roles: ["Physics Teacher", "Head of Department", "TOK Teacher", "EE Supervisor", "CAS Advisor"],
    isHeadOfDept: true,
    isCasAdvisor: true,
    isEeSupervisor: true,
    isTokTeacher: true,
    isRecentContact: true,
    meetingAvailability: "Tuesdays & Thursdays, Period 5",
    subjectsTaught: ["Physics HL", "Physics SL"],
    homeroomAssignments: ["Grade 12 Science Homeroom"],
    casAssignments: ["Eco-Club Mentor", "CAS Portfolio Reviewer"],
    eeSupervision: ["4 Students (Physics IA/EE)"],
    tokResponsibilities: ["Theory of Knowledge Section B Tutor"],
    deptLeadership: ["Science Department Head"],
    studentAllocations: ["15 Students (Academic & IA Advising)"],
    notes: ["TOK supervisor assignments confirmed.", "Discussed CAS portfolio checklist deadlines."]
  },
  {
    id: "tch-5",
    name: "David Miller",
    avatar: "DM",
    role: "Athletics Coach & CAS Advisor",
    department: "Physical Ed",
    status: "teaching",
    currentRoom: "Gymnasium",
    email: "david.miller@school.edu",
    phone: "+1 (555) 019-2838",
    assignedClasses: ["MYP PE Grade 10", "DP Sports Science"],
    designation: "Sports Activities Lead",
    roles: ["Sports Science Teacher", "CAS Advisor", "Homeroom Advisor"],
    isCasAdvisor: true,
    isRecentContact: false,
    meetingAvailability: "Fridays, Period 6",
    subjectsTaught: ["MYP PE Grade 10", "DP Sports Science"],
    homeroomAssignments: ["Grade 10 Sports Homeroom Advisor"],
    casAssignments: ["School Sports Teams Coordinator", "Outdoor Adventure CAS Mentor"],
    eeSupervision: [],
    tokResponsibilities: [],
    deptLeadership: [],
    studentAllocations: ["20 Students (Sports Science IA)"],
    notes: ["Athletics coordination schedule updated.", "MYP PE checklist submitted."]
  },
  {
    id: "tch-6",
    name: "Clara Dupont",
    avatar: "CD",
    role: "Literature HoD & TOK Teacher",
    department: "English",
    status: "teaching",
    currentRoom: "Room 3A",
    email: "clara.dupont@school.edu",
    phone: "+1 (555) 019-2839",
    assignedClasses: ["MYP Language & Lit Grade 10", "DP English A1"],
    designation: "Head of English Department",
    roles: ["English Teacher", "Head of Department", "EE Supervisor", "TOK Teacher"],
    isHeadOfDept: true,
    isEeSupervisor: true,
    isTokTeacher: true,
    isRecentContact: false,
    meetingAvailability: "Thursdays, Period 4",
    subjectsTaught: ["MYP Language & Lit Grade 10", "DP English A1"],
    homeroomAssignments: [],
    casAssignments: [],
    eeSupervision: ["5 Students (English Lit EE)"],
    tokResponsibilities: ["TOK Essay Tutor (Languages & Lit)"],
    deptLeadership: ["English Department Head"],
    studentAllocations: ["18 Students (English A1 Portfolios)"],
    notes: ["English literature syllabus updates published.", "EE supervisor loadings adjusted."]
  },
  {
    id: "tch-7",
    name: "Robert Blake",
    avatar: "RB",
    role: "History Teacher & TOK Coordinator",
    department: "Humanities",
    status: "away",
    currentRoom: "Home (Sick)",
    email: "robert.blake@school.edu",
    phone: "+1 (555) 019-2840",
    assignedClasses: ["MYP History Grade 9", "DP History Grade 12"],
    designation: "History Specialist",
    roles: ["History Teacher", "TOK Coordinator", "TOK Teacher", "EE Supervisor"],
    isTokTeacher: true,
    isEeSupervisor: true,
    isRecentContact: false,
    meetingAvailability: "Mondays, Period 6",
    subjectsTaught: ["MYP History Grade 9", "DP History Grade 12"],
    homeroomAssignments: [],
    casAssignments: [],
    eeSupervision: ["4 Students (History EE)"],
    tokResponsibilities: ["TOK Coordinator", "Theory of Knowledge Moderation Lead"],
    deptLeadership: [],
    studentAllocations: ["25 Students (History IA / TOK Exhibitions)"],
    notes: ["Sick leave logged for Friday; cover requested.", "History research projects review pending."]
  },
  {
    id: "tch-8",
    name: "Dilan Patel",
    avatar: "DP",
    role: "Biology Specialist & CP Coordinator",
    department: "Science",
    status: "teaching",
    currentRoom: "Lab 1",
    email: "dilan.patel@school.edu",
    phone: "+1 (555) 019-2841",
    assignedClasses: ["Grade 11 Biology (A)", "Grade 12 Biology HL"],
    designation: "Biology Specialist",
    roles: ["Biology Teacher", "CP Coordinator", "EE Supervisor", "CAS Advisor"],
    isEeSupervisor: true,
    isCasAdvisor: true,
    isRecentContact: false,
    meetingAvailability: "Mondays, Period 5",
    subjectsTaught: ["Grade 11 Biology (A)", "Grade 12 Biology HL"],
    homeroomAssignments: [],
    casAssignments: ["Eco-Club Mentor"],
    eeSupervision: ["3 Students (Biology EE)"],
    tokResponsibilities: [],
    deptLeadership: [],
    studentAllocations: ["14 Students (CP Reflective Projects / Biology IA)"],
    notes: ["Biology IA draft reviews completed.", "Eco-club recycling project approved."]
  },
  {
    id: "tch-9",
    name: "Claire DuPont",
    avatar: "CD",
    role: "Modern Languages HoD & DP Coordinator",
    department: "Languages",
    status: "teaching",
    currentRoom: "Room 108",
    email: "claire.dupont@school.edu",
    phone: "+1 (555) 019-2842",
    assignedClasses: ["Grade 11 French B SL", "Grade 12 French A HL"],
    designation: "Head of Languages Department",
    roles: ["French Teacher", "Head of Department", "DP Coordinator", "EE Supervisor"],
    isHeadOfDept: true,
    isEeSupervisor: true,
    isRecentContact: false,
    meetingAvailability: "Wednesdays, Period 4",
    subjectsTaught: ["Grade 11 French B SL", "Grade 12 French A HL"],
    homeroomAssignments: [],
    casAssignments: ["Language Week Organiser"],
    eeSupervision: ["2 Students (French B EE)"],
    tokResponsibilities: [],
    deptLeadership: ["Languages Department Head"],
    studentAllocations: ["10 Students (DP Coordinator Advising / French Orals)"],
    notes: ["Modern languages oral exams timetable scheduled.", "French B SL portfolio checklists locked."]
  }
];

type TeacherLookupPanelProps = {
  theme: string;
  searchQuery: string;
  onTriggerSubstitution: (teacherName: string, classCoverName: string) => void;
  selectedTeacherId?: string | null;
  onClearSelectedTeacher?: () => void;
};

export function TeacherLookupPanel({ 
  theme, 
  searchQuery, 
  onTriggerSubstitution,
  selectedTeacherId,
  onClearSelectedTeacher 
}: TeacherLookupPanelProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newNoteText, setNewNoteText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");

  // Handle outside selection from Universal Search
  useEffect(() => {
    if (selectedTeacherId) {
      const found = teachers.find((t) => t.id === selectedTeacherId);
      if (found) {
        setSelectedTeacher(found);
        onClearSelectedTeacher?.();
      }
    }
  }, [selectedTeacherId, teachers, onClearSelectedTeacher]);

  const [activeChatTeacher, setActiveChatTeacher] = useState<Teacher | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [mockMessages, setMockMessages] = useState<string[]>([]);
  const [activeCallTeacher, setActiveCallTeacher] = useState<Teacher | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleEmailTeacher = (email: string) => {
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

  const handleAddNote = (teacherId: string) => {
    if (!newNoteText.trim()) return;
    setTeachers(prev =>
      prev.map(t => {
        if (t.id === teacherId) {
          return {
            ...t,
            notes: [newNoteText.trim(), ...t.notes],
          };
        }
        return t;
      })
    );
    if (selectedTeacher && selectedTeacher.id === teacherId) {
      setSelectedTeacher(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [newNoteText.trim(), ...prev.notes],
        };
      });
    }
    setNewNoteText("");
  };

  const styles = useMemo(() => {
    return {
      dark: {
        card: "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700",
        textPrimary: "text-white",
        textSecondary: "text-zinc-400",
        badge: {
          available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          teaching: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          meeting: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          away: "bg-red-500/10 text-red-400 border-red-500/20",
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
          available: "bg-emerald-50 text-emerald-700 border-emerald-200",
          teaching: "bg-blue-50 text-blue-700 border-blue-200",
          meeting: "bg-indigo-50 text-indigo-700 border-indigo-200",
          away: "bg-red-50 text-red-700 border-red-200",
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
          available: "border border-white text-white bg-black",
          teaching: "border border-white text-white bg-black font-extrabold",
          meeting: "border border-white text-white bg-black",
          away: "border-2 border-white text-white bg-black",
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
          available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          teaching: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          meeting: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          away: "bg-red-500/10 text-red-400 border-red-500/20",
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
        available: "bg-emerald-500/10 text-emerald-400",
        teaching: "bg-blue-500/10 text-blue-400",
        meeting: "bg-indigo-500/10 text-indigo-400",
        away: "bg-red-500/10 text-red-400",
      },
      panelBg: "bg-zinc-950 border-l border-zinc-800",
      input: "bg-zinc-950 border-zinc-800 focus:border-cyan-500",
      button: "bg-cyan-500 text-black",
      buttonSec: "border-zinc-800 text-zinc-300",
    };
  }, [theme]);

  const filteredTeachers = useMemo(() => {
    return teachers
      .filter((teacher) => {
        // 1. Role Filter
        if (roleFilter === "heads-of-dept") {
          if (!teacher.isHeadOfDept) return false;
        } else if (roleFilter === "tok-teachers") {
          if (!teacher.isTokTeacher) return false;
        } else if (roleFilter === "ee-supervisors") {
          if (!teacher.isEeSupervisor) return false;
        } else if (roleFilter === "cas-advisors") {
          if (!teacher.isCasAdvisor) return false;
        } else if (roleFilter === "counselors") {
          if (!teacher.isCounselor) return false;
        } else if (roleFilter === "recent-contacts") {
          if (!teacher.isRecentContact) return false;
        }
        // 2. Status Filter
        if (statusFilter !== "all" && teacher.status !== statusFilter) {
          return false;
        }
        // 3. Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            teacher.name.toLowerCase().includes(query) ||
            teacher.role.toLowerCase().includes(query) ||
            teacher.department.toLowerCase().includes(query) ||
            teacher.designation.toLowerCase().includes(query) ||
            teacher.currentRoom.toLowerCase().includes(query) ||
            teacher.roles.some(r => r.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teachers, roleFilter, statusFilter, searchQuery]);

  const statusLabel = (status: TeacherStatus) => {
    switch (status) {
      case "available": return "Available for Cover";
      case "teaching": return "Currently Teaching";
      case "meeting": return "In Coordinator Meeting";
      case "away": return "Absent / Sick Leave";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Cohort Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
        {[
          { id: "all", label: "All Faculty" },
          { id: "heads-of-dept", label: "Heads of Dept" },
          { id: "cas-advisors", label: "CAS Advisors" },
          { id: "ee-supervisors", label: "EE Supervisors" },
          { id: "tok-teachers", label: "TOK Teachers" },
          { id: "counselors", label: "Counselors" },
          { id: "recent-contacts", label: "Recent Contacts" }
        ].map((role) => (
          <button
            key={role.id}
            onClick={() => setRoleFilter(role.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              roleFilter === role.id
                ? theme === "light"
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : theme === "light"
                  ? "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      {/* Search status filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Statuses" },
            { id: "available", label: "Available" },
            { id: "teaching", label: "Currently Teaching" },
            { id: "meeting", label: "In Meeting" },
            { id: "away", label: "Absent / Away" },
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
            {filteredTeachers.length} of {teachers.length} faculty
          </span>
        </div>
      </div>

      {/* View modes rendering */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <svg className="size-6 text-zinc-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h4 className={`text-sm font-semibold mt-2 ${styles.textPrimary}`}>No faculty matching criteria</h4>
          <p className={`text-xs mt-1 ${styles.textSecondary}`}>Refine your search parameters or role context filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => setSelectedTeacher(teacher)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 ${styles.card}`}
            >
              <div className="flex items-start justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400">
                    {teacher.avatar}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold tracking-tight ${styles.textPrimary}`}>{teacher.name}</h4>
                    <span className={`text-[10px] uppercase font-semibold tracking-wider text-cyan-400 block mt-0.5`}>
                      {teacher.role}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-[210px]">
                      {teacher.roles.map((r, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded border border-cyan-500/25 text-[7px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/5"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[teacher.status]}`}>
                  {teacher.status}
                </span>
              </div>

              <div className="border-t border-white/[0.03] pt-3.5 space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className={styles.textSecondary}>Dept:</span>
                  <span className={`font-semibold ${styles.textPrimary}`}>{teacher.department}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={styles.textSecondary}>Room / Location:</span>
                  <span className={`font-mono text-[11px] text-cyan-400 font-bold`}>
                    {teacher.currentRoom}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={styles.textSecondary}>Email:</span>
                  <span className={`text-[10px] text-zinc-450 truncate max-w-[160px] font-medium`}>
                    {teacher.email}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[9px] font-bold text-white/40 uppercase tracking-widest">
                <th className="p-4">Faculty</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Email</th>
                <th className="p-4">Room</th>
                <th className="p-4">Responsibilities</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-white flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-[9px] text-cyan-400">
                      {teacher.avatar}
                    </div>
                    {teacher.name}
                  </td>
                  <td className="p-4 text-cyan-200/60 font-semibold">{teacher.role}</td>
                  <td className="p-4 text-white/70 font-medium">{teacher.department}</td>
                  <td className="p-4 font-medium text-white/90">{teacher.email}</td>
                  <td className="p-4 font-mono font-bold text-cyan-400">{teacher.currentRoom}</td>
                  <td className="p-4 font-medium text-zinc-400">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {teacher.roles.map((r, i) => (
                        <span key={i} className="px-1 py-0.2 rounded bg-zinc-800/40 border border-zinc-700/60 text-[7.5px] font-bold uppercase tracking-wider text-zinc-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border ${styles.badge[teacher.status]}`}>
                      {teacher.status}
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
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-[11px] font-semibold text-white/70">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                    {teacher.name}
                    {teacher.isHeadOfDept && (
                      <span title="Department Head" className="text-cyan-400 text-[8px] font-bold"> (HoD)</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-white/50">{teacher.role}</td>
                  <td className="py-2 px-3">{teacher.department}</td>
                  <td className="py-2 px-3 font-mono text-cyan-400/80">{teacher.currentRoom}</td>
                  <td className="py-2 px-3 text-zinc-400">{teacher.email}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider border ${styles.badge[teacher.status]}`}>
                      {teacher.status}
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
        {selectedTeacher && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
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
                    Faculty Position Overview
                  </span>
                  <button
                    onClick={() => setSelectedTeacher(null)}
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
                    {selectedTeacher.avatar}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-base font-black tracking-tight ${styles.textPrimary}`}>{selectedTeacher.name}</h3>
                    <p className={`text-xs ${styles.textSecondary}`}>
                      Primary Role: <strong>{selectedTeacher.role}</strong>
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {selectedTeacher.designation}
                    </span>
                  </div>
                </div>

                {/* Live position and Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Contact & Availability</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Availability Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[selectedTeacher.status]}`}>
                        {statusLabel(selectedTeacher.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Assigned Room:</span>
                      <span className={`font-mono text-cyan-400 font-bold`}>{selectedTeacher.currentRoom}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Primary Email:</span>
                      <span className={`font-semibold ${styles.textPrimary}`}>{selectedTeacher.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Phone Contact:</span>
                      <span className={`font-mono ${styles.textSecondary}`}>{selectedTeacher.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Meeting Availability:</span>
                      <span className="font-semibold text-cyan-400">{selectedTeacher.meetingAvailability || "By Appointment"}</span>
                    </div>
                  </div>
                </div>

                {/* Subjects Taught & Active Responsibilities */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Subjects & Responsibilities</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3.5 text-xs">
                    {/* Subjects Taught */}
                    {selectedTeacher.subjectsTaught && selectedTeacher.subjectsTaught.length > 0 && (
                      <div className="space-y-1">
                        <span className={`text-[10px] ${styles.textSecondary} block`}>Subjects Taught:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedTeacher.subjectsTaught.map((sub, idx) => (
                            <span key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-white">
                              📚 {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Responsibilities */}
                    {selectedTeacher.roles && selectedTeacher.roles.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                        <span className={`text-[10px] ${styles.textSecondary} block`}>Current Responsibilities:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedTeacher.roles.map((r, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-cyan-950/20 border border-cyan-500/10 text-[9.5px] font-semibold text-cyan-400">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Details (Homeroom, CAS, EE, TOK, Dept Leadership, Student Allocations) */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Operational Allocations</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3.5 text-xs">
                    {/* Homeroom Assignments */}
                    {selectedTeacher.homeroomAssignments && selectedTeacher.homeroomAssignments.length > 0 && (
                      <div className="flex justify-between items-start gap-4">
                        <span className={styles.textSecondary}>Homeroom:</span>
                        <div className="text-right font-semibold text-white">
                          {selectedTeacher.homeroomAssignments.map((hr, idx) => (
                            <div key={idx}>🏡 {hr}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CAS Assignments */}
                    {selectedTeacher.casAssignments && selectedTeacher.casAssignments.length > 0 && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-white/[0.04]">
                        <span className={styles.textSecondary}>CAS Assignments:</span>
                        <div className="text-right font-semibold text-white">
                          {selectedTeacher.casAssignments.map((cas, idx) => (
                            <div key={idx}>🎯 {cas}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EE Supervision */}
                    {selectedTeacher.eeSupervision && selectedTeacher.eeSupervision.length > 0 && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-white/[0.04]">
                        <span className={styles.textSecondary}>EE Supervision:</span>
                        <div className="text-right font-semibold text-white">
                          {selectedTeacher.eeSupervision.map((ee, idx) => (
                            <div key={idx}>📝 {ee}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TOK Responsibilities */}
                    {selectedTeacher.tokResponsibilities && selectedTeacher.tokResponsibilities.length > 0 && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-white/[0.04]">
                        <span className={styles.textSecondary}>TOK Responsibilities:</span>
                        <div className="text-right font-semibold text-white">
                          {selectedTeacher.tokResponsibilities.map((tok, idx) => (
                            <div key={idx}>💡 {tok}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Department Leadership */}
                    {selectedTeacher.deptLeadership && selectedTeacher.deptLeadership.length > 0 && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-white/[0.04]">
                        <span className={styles.textSecondary}>Department Leadership:</span>
                        <div className="text-right font-semibold text-cyan-400">
                          {selectedTeacher.deptLeadership.map((leader, idx) => (
                            <div key={idx}>👑 {leader}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relevant Student Allocations */}
                    {selectedTeacher.studentAllocations && selectedTeacher.studentAllocations.length > 0 && (
                      <div className="flex justify-between items-start gap-4 pt-2 border-t border-white/[0.04]">
                        <span className={styles.textSecondary}>Student Allocations:</span>
                        <div className="text-right font-semibold text-white">
                          {selectedTeacher.studentAllocations.map((alloc, idx) => (
                            <div key={idx}>👥 {alloc}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Communication Actions */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Communication Actions</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEmailTeacher(selectedTeacher.email)}
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
                        setActiveChatTeacher(selectedTeacher);
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
                      onClick={() => setActiveCallTeacher(selectedTeacher)}
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
                    <button
                      onClick={() => {
                        if (selectedTeacher.assignedClasses.length > 0) {
                          onTriggerSubstitution(selectedTeacher.name, selectedTeacher.assignedClasses[0]);
                          setSelectedTeacher(null);
                        } else {
                          alert(`${selectedTeacher.name} has no classes assigned to substitute.`);
                        }
                      }}
                      className="flex-1 py-1.5 rounded-xl border border-cyan-500/20 text-[10px] font-bold uppercase text-cyan-400 bg-cyan-950/10 hover:bg-cyan-500/10 transition-all text-center"
                    >
                      Cover
                    </button>
                  </div>
                </div>

                {/* Coordination Log Notes */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Coordination Activity Log</h4>
                  
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
                      onClick={() => handleAddNote(selectedTeacher.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold ${styles.button}`}
                    >
                      Add Note
                    </button>
                  </div>

                  {/* Note logs list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedTeacher.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs leading-relaxed text-white/70">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Profile Footer */}
              <div className="pt-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider border font-bold ${styles.buttonSec}`}
                >
                  Close Profile
                </button>
              </div>
            </motion.div>

            {/* Contextual Messaging Slide-Out Panel */}
            <AnimatePresence>
              {activeChatTeacher && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveChatTeacher(null)}
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
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{activeChatTeacher.name}</h4>
                        </div>
                        <button
                          onClick={() => setActiveChatTeacher(null)}
                          className="text-white/40 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Chat History */}
                      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 select-none scrollbar-none text-left">
                        <div className="text-[10px] text-white/35 font-bold uppercase tracking-widest text-center py-2">Beginning of Conversation with {selectedTeacher.name}</div>
                        <div className="flex flex-col gap-1.5 items-end">
                          <div className="p-3 rounded-2xl bg-cyan-500 text-black text-xs font-medium max-w-[85%] rounded-tr-sm text-left">
                            Hi {activeChatTeacher.name}, just wanted to check in regarding school coordination schedule today.
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
              {activeCallTeacher && (
                <div className="fixed inset-0 z-[260] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm select-none">
                  <div className="fixed inset-0" onClick={() => setActiveCallTeacher(null)} />
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
                      <button onClick={() => setActiveCallTeacher(null)} className="text-white/40 hover:text-white">✕</button>
                    </div>
                    
                    <div className="text-center space-y-2 py-2">
                      <h4 className="text-sm font-black text-white">{activeCallTeacher.name}</h4>
                      <p className="text-[11px] text-white/45 uppercase tracking-wider font-semibold">{activeCallTeacher.role}</p>
                      <p className="text-lg font-mono font-bold text-cyan-400 tracking-wide mt-1.5">{activeCallTeacher.phone}</p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => {
                          alert(`Initiating encrypted Axis Audio Call to ${activeCallTeacher.name}...`);
                          setActiveCallTeacher(null);
                        }}
                        className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      >
                        Axis Call
                      </button>
                      {isMobile && (
                        <a
                          href={`tel:${activeCallTeacher.phone}`}
                          onClick={() => setActiveCallTeacher(null)}
                          className="w-full py-2.5 text-center bg-white/5 hover:bg-white/10 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all border border-white/10"
                        >
                          Phone Call
                        </a>
                      )}
                      <button
                        onClick={() => setActiveCallTeacher(null)}
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
