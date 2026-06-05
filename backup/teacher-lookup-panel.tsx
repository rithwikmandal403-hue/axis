"use client";

import { useState, useMemo } from "react";
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
  leadershipRole?: string;
};

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    name: "Aarav Chen",
    avatar: "AC",
    role: "Physics Master Teacher",
    department: "Science",
    status: "available",
    currentRoom: "Lab 3",
    email: "aarav.chen@school.edu",
    phone: "+1 (555) 019-2834",
    assignedClasses: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
    designation: "Subject Lead & Advisor",
    leadershipRole: "CAS Coordinator",
  },
  {
    id: "tch-2",
    name: "Ananya Rao",
    avatar: "AR",
    role: "Chemistry Specialist",
    department: "Science",
    status: "meeting",
    currentRoom: "Conference Hall B",
    email: "ananya.rao@school.edu",
    phone: "+1 (555) 019-2835",
    assignedClasses: ["Grade 11 Chemistry (A)", "Grade 12 DP Chemistry"],
    designation: "Science Department Lead",
    leadershipRole: "Science Department Lead",
  },
  {
    id: "tch-3",
    name: "Marcus Vance",
    avatar: "MV",
    role: "Advanced Calculus Expert",
    department: "Mathematics",
    status: "teaching",
    currentRoom: "Room 204",
    email: "marcus.vance@school.edu",
    phone: "+1 (555) 019-2836",
    assignedClasses: ["Grade 12 Calculus", "Grade 10 Algebra II"],
    designation: "Head of Math & Grade Lead",
    leadershipRole: "Head of Mathematics & Grade Level Lead",
  },
  {
    id: "tch-4",
    name: "Sarah Chen",
    avatar: "SC",
    role: "Guidance Counselor",
    department: "Pastoral",
    status: "available",
    currentRoom: "Room 102",
    email: "sarah.chen@school.edu",
    phone: "+1 (555) 019-2837",
    assignedClasses: ["Pastoral review 11-F", "Workload Counseling"],
    designation: "Pastoral Lead Coordinator",
    leadershipRole: "DP Coordinator & EE Coordinator",
  },
  {
    id: "tch-5",
    name: "David Miller",
    avatar: "DM",
    role: "Athletics Coach",
    department: "Physical Ed",
    status: "teaching",
    currentRoom: "Gymnasium",
    email: "david.miller@school.edu",
    phone: "+1 (555) 019-2838",
    assignedClasses: ["MYP PE Grade 10", "DP Sports Science"],
    designation: "Sports Activities Lead",
    leadershipRole: "MYP Coordinator & PE Lead",
  },
  {
    id: "tch-6",
    name: "Clara Dupont",
    avatar: "CD",
    role: "Literature Specialist",
    department: "English",
    status: "teaching",
    currentRoom: "Room 3A",
    email: "clara.dupont@school.edu",
    phone: "+1 (555) 019-2839",
    assignedClasses: ["MYP Language & Lit Grade 10", "DP English A1"],
    designation: "Subject Lead English",
    leadershipRole: "English Department Lead",
  },
  {
    id: "tch-7",
    name: "Robert Blake",
    avatar: "RB",
    role: "History Teacher",
    department: "Humanities",
    status: "away",
    currentRoom: "Home (Sick)",
    email: "robert.blake@school.edu",
    phone: "+1 (555) 019-2840",
    assignedClasses: ["MYP History Grade 9", "DP History Grade 12"],
    designation: "Humanities Advisor",
    leadershipRole: "Grade Level Lead (Grade 12)",
  },
];

type TeacherLookupPanelProps = {
  theme: string;
  searchQuery: string;
  onTriggerSubstitution: (teacherName: string, classCoverName: string) => void;
};

export function TeacherLookupPanel({ theme, searchQuery, onTriggerSubstitution }: TeacherLookupPanelProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Communications Dialog state
  const [commType, setCommType] = useState<"message" | "call" | "designation" | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [tempDesignation, setTempDesignation] = useState("");

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
        button: "bg-cyan-500 text-black hover:bg-cyan-400",
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
    return teachers.filter((teacher) => {
      // 1. Status Filter
      if (statusFilter !== "all" && teacher.status !== statusFilter) {
        return false;
      }
      // 2. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(query) ||
          teacher.role.toLowerCase().includes(query) ||
          teacher.department.toLowerCase().includes(query) ||
          teacher.designation.toLowerCase().includes(query) ||
          teacher.currentRoom.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [teachers, statusFilter, searchQuery]);

  const handleUpdateDesignation = (teacherId: string) => {
    if (!tempDesignation.trim()) return;
    setTeachers(prev =>
      prev.map(t => {
        if (t.id === teacherId) {
          return {
            ...t,
            designation: tempDesignation.trim(),
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
          designation: tempDesignation.trim(),
        };
      });
    }
    setCommType(null);
    setTempDesignation("");
    alert("Faculty designation successfully updated inside the Axis Organization Directory.");
  };

  const handleSendMessage = (name: string) => {
    if (!chatMessage.trim()) return;
    alert(`Ecosystem Message Broadcasted to ${name} (${selectedTeacher?.phone}):\n"${chatMessage}"`);
    setChatMessage("");
    setCommType(null);
  };

  const handleStartCall = () => {
    setCallActive(true);
    setTimeout(() => {
      setCallActive(false);
      setCommType(null);
      alert("Audio call successfully ended.");
    }, 4000);
  };

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
      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Faculty" },
            { id: "available", label: "Available" },
            { id: "teaching", label: "Teaching" },
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
        <span className={`text-xs font-mono ${styles.textSecondary}`}>
          {filteredTeachers.length} of {teachers.length} faculty leads found
        </span>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            onClick={() => {
              setSelectedTeacher(teacher);
              setTempDesignation(teacher.designation);
            }}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 ${styles.card}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400">
                  {teacher.avatar}
                </div>
                <div>
                  <h4 className={`text-sm font-bold tracking-tight ${styles.textPrimary}`}>{teacher.name}</h4>
                  <div className="flex flex-col items-start gap-1 mt-0.5">
                    <span className={`text-[10px] font-semibold text-cyan-400 uppercase`}>
                      {teacher.role}
                    </span>
                    {teacher.leadershipRole && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-[8px] font-black uppercase tracking-wider text-cyan-300">
                        👑 {teacher.leadershipRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[teacher.status]}`}>
                {teacher.status}
              </span>
            </div>

            <div className="border-t border-white/[0.03] pt-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={styles.textSecondary}>Designation:</span>
                <span className={`font-semibold ${styles.textPrimary} max-w-[170px] truncate`}>
                  {teacher.designation}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={styles.textSecondary}>Dept / Room:</span>
                <span className={`font-mono text-cyan-400 text-[11px] font-bold`}>
                  {teacher.department} · {teacher.currentRoom}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {selectedTeacher && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedTeacher(null);
                setCommType(null);
              }}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md p-6 overflow-y-auto flex flex-col justify-between ${styles.panelBg}`}
            >
              {/* Main side profile body */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Faculty Coordinator Panel
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTeacher(null);
                      setCommType(null);
                    }}
                    className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${styles.textSecondary} hover:${styles.textPrimary}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Identity header card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                  <div className="size-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl font-bold text-cyan-400">
                    {selectedTeacher.avatar}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-base font-black tracking-tight ${styles.textPrimary}`}>{selectedTeacher.name}</h3>
                    <p className={`text-xs ${styles.textSecondary}`}>
                      {selectedTeacher.role} · <strong>{selectedTeacher.department} Dept</strong>
                    </p>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {selectedTeacher.designation}
                    </span>
                  </div>
                </div>

                {selectedTeacher.leadershipRole && (
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">Leadership Role</span>
                      <span className="text-sm font-black text-cyan-100">{selectedTeacher.leadershipRole}</span>
                    </div>
                    <div className="size-8 rounded-xl bg-cyan-400/15 flex items-center justify-center text-base">👑</div>
                  </div>
                )}

                {/* Details layout */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest font-sans">Ecosystem Details</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Availability Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${styles.badge[selectedTeacher.status]}`}>
                        {statusLabel(selectedTeacher.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Email Address:</span>
                      <span className={`font-semibold ${styles.textPrimary}`}>{selectedTeacher.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={styles.textSecondary}>Active Room:</span>
                      <span className="font-mono text-cyan-400 font-bold">{selectedTeacher.currentRoom}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className={styles.textSecondary}>Teaching Blocks:</span>
                      <div className="flex flex-col gap-1 items-end text-right font-medium">
                        {selectedTeacher.assignedClasses.map((cl, i) => (
                          <span key={i} className={styles.textPrimary}>{cl}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordination Triggers */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest font-sans">Operational Triggers</h4>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <button
                      onClick={() => setCommType("message")}
                      className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold transition-all ${styles.buttonSec}`}
                    >
                      💬 <span>Send Message</span>
                    </button>
                    <button
                      onClick={() => setCommType("call")}
                      className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold transition-all ${styles.buttonSec}`}
                    >
                      📞 <span>Voice Call</span>
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
                      className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold transition-all ${styles.buttonSec} text-cyan-400 border-cyan-400/20`}
                    >
                      🔄 <span>Request Cover</span>
                    </button>
                    <button
                      onClick={() => setCommType("designation")}
                      className={`py-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold transition-all ${styles.buttonSec}`}
                    >
                      👑 <span>Designation</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Actions Interface */}
                <AnimatePresence mode="wait">
                  {commType === "message" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3"
                    >
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Compose Message</span>
                      <textarea
                        rows={3}
                        placeholder={`Message ${selectedTeacher.name}...`}
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border resize-none outline-none ${styles.input}`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCommType(null)}
                          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-white/60"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendMessage(selectedTeacher.name)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase ${styles.button}`}
                        >
                          Send SMS/Chat
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {commType === "call" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-center space-y-4"
                    >
                      <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
                        <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-cyan-400/20 opacity-75"></span>
                        <div className="size-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl text-cyan-400">
                          📞
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-bold block text-white/80">Calling: {selectedTeacher.name}</span>
                        <span className="text-[10px] text-white/40 block">Phone Channel: {selectedTeacher.phone}</span>
                      </div>

                      {callActive ? (
                        <div className="text-xs text-emerald-400 font-extrabold animate-pulse uppercase tracking-wider">
                          Connection Established · Simulating Speech...
                        </div>
                      ) : (
                        <button
                          onClick={handleStartCall}
                          className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold uppercase transition-all"
                        >
                          Establish Audio Channel
                        </button>
                      )}
                    </motion.div>
                  )}

                  {commType === "designation" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3"
                    >
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Edit Designation / Role</span>
                      <input
                        type="text"
                        placeholder="e.g. Subject Lead Mathematics"
                        value={tempDesignation}
                        onChange={e => setTempDesignation(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCommType(null)}
                          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-white/60"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateDesignation(selectedTeacher.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase ${styles.button}`}
                        >
                          Save Assignment
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close Button Footer */}
              <div className="pt-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setCommType(null);
                  }}
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
