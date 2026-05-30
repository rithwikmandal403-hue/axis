"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  name: string;
  avatar: string;
  status: "present" | "late" | "excused" | "absent";
  deviceSynced: boolean;
  proximityVerified: boolean;
};

type ClassRoster = {
  [className: string]: {
    subject: string;
    roster: Student[];
    automatedActive: boolean;
  };
};

const INITIAL_ROSTERS: ClassRoster = {
  "Grade 11 Physics (B)": {
    subject: "Grade 11 Physics (Section B)",
    automatedActive: true,
    roster: [
      { id: "std-1", name: "Chloe Vance", avatar: "CV", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-2", name: "Dilan Patel", avatar: "DP", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-3", name: "Emma Watson", avatar: "EW", status: "late", deviceSynced: true, proximityVerified: false },
      { id: "std-4", name: "Lucas Gray", avatar: "LG", status: "absent", deviceSynced: false, proximityVerified: false },
      { id: "std-5", name: "Aria Thorne", avatar: "AT", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-6", name: "Jin Woo", avatar: "JW", status: "excused", deviceSynced: false, proximityVerified: false },
    ],
  },
  "Grade 12 Adv Physics (A)": {
    subject: "Grade 12 Advanced Physics (Section A)",
    automatedActive: true,
    roster: [
      { id: "std-7", name: "Alex Mercer", avatar: "AM", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-8", name: "Nisha Rao", avatar: "NR", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-9", name: "Oliver Queen", avatar: "OQ", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-10", name: "Selina Kyle", avatar: "SK", status: "absent", deviceSynced: false, proximityVerified: false },
      { id: "std-11", name: "Bruce Wayne", avatar: "BW", status: "excused", deviceSynced: true, proximityVerified: false },
    ],
  },
  "Homeroom 11-F": {
    subject: "Homeroom Advisory Group (11-F)",
    automatedActive: false,
    roster: [
      { id: "std-12", name: "Caleb Sterling", avatar: "CS", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-13", name: "Zoe Kravitz", avatar: "ZK", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-14", name: "Miles Morales", avatar: "MM", status: "late", deviceSynced: true, proximityVerified: false },
      { id: "std-15", name: "Gwen Stacy", avatar: "GS", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-16", name: "Peter Parker", avatar: "PP", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-17", name: "Harry Osborn", avatar: "HO", status: "absent", deviceSynced: false, proximityVerified: false },
    ],
  },
};

export type AttendanceWorkspaceProps = {
  rosters?: ClassRoster;
  selectedClass?: string;
  setSelectedClass?: (className: string) => void;
  onStatusChange?: (studentId: string, status: Student["status"]) => void;
  onToggleAutoAttendance?: () => void;
  onSubmitRollCall?: () => void;
};

export function AttendanceWorkspace({
  rosters: propsRosters,
  selectedClass: propsSelectedClass,
  setSelectedClass: propsSetSelectedClass,
  onStatusChange,
  onToggleAutoAttendance,
  onSubmitRollCall,
}: AttendanceWorkspaceProps) {
  const [localRosters, setLocalRosters] = useState<ClassRoster>(INITIAL_ROSTERS);
  const [localSelectedClass, setLocalSelectedClass] = useState("Grade 11 Physics (B)");
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "late">("all");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const rosters = propsRosters !== undefined ? propsRosters : localRosters;
  const selectedClass = propsSelectedClass !== undefined ? propsSelectedClass : localSelectedClass;

  const activeClassData = rosters[selectedClass];

  const handleStatusChange = (studentId: string, newStatus: Student["status"]) => {
    if (onStatusChange) {
      onStatusChange(studentId, newStatus);
    } else {
      const updatedRoster = activeClassData.roster.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: newStatus,
            proximityVerified: newStatus === "present" || newStatus === "late" ? s.proximityVerified : false,
          };
        }
        return s;
      });

      setLocalRosters({
        ...localRosters,
        [selectedClass]: {
          ...activeClassData,
          roster: updatedRoster,
        },
      });
    }
  };

  const handleToggleAutoAttendance = () => {
    if (onToggleAutoAttendance) {
      onToggleAutoAttendance();
    } else {
      setLocalRosters({
        ...localRosters,
        [selectedClass]: {
          ...activeClassData,
          automatedActive: !activeClassData.automatedActive,
        },
      });
    }
  };

  const submitRollCall = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      if (onSubmitRollCall) onSubmitRollCall();
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1200);
  };


  const filteredRoster = activeClassData.roster.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const presentCount = activeClassData.roster.filter((s) => s.status === "present" || s.status === "late").length;
  const totalCount = activeClassData.roster.length;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-safe-lg shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] md:p-safe-xl">
      <div className="flex flex-col gap-safe-lg">
        {/* Header */}
        <div className="flex flex-col gap-safe-md md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">
              Ecosystem Presence
            </span>
            <h3 className="text-xl font-medium tracking-tight text-white mt-1">Attendance Workspace</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(rosters).map((className) => {
              const isSelected = selectedClass === className;
              return (
                <button
                  key={className}
                  onClick={() => {
                    if (propsSetSelectedClass) {
                      propsSetSelectedClass(className);
                    } else {
                      setLocalSelectedClass(className);
                    }
                    setFilter("all");
                  }}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold tracking-tight transition-all ${
                    isSelected
                      ? "bg-white text-[#0A0A0B] border-white"
                      : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20"
                  }`}
                >
                  {className}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div className="grid grid-cols-1 gap-safe-md rounded-xl border border-white/[0.04] bg-white/[0.01] p-safe-md sm:grid-cols-3">
          <div>
            <span className="text-[10px] text-white/35 uppercase">Active Class</span>
            <p className="mt-1 text-sm font-semibold text-white">{activeClassData.subject}</p>
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase">Roster Verification</span>
            <p className="mt-1 text-sm font-semibold text-white">
              {presentCount} / {totalCount} Checked ({Math.round((presentCount / totalCount) * 100)}%)
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/35 uppercase">Automated Sync</span>
              <p className="mt-1 text-xs text-white/60">
                {activeClassData.automatedActive ? "Wi-Fi Proximity AP Active" : "Disabled (Manual)"}
              </p>
            </div>
            <button
              onClick={handleToggleAutoAttendance}
              className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition-all ${
                activeClassData.automatedActive
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {activeClassData.automatedActive ? "Disable" : "Enable"}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-safe-md border-b border-white/[0.06] pb-safe-md">
          <div className="flex items-center gap-1.5">
            {(["all", "present", "late", "absent"] as const).map((f) => {
              const isSelected = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1 text-xs capitalize transition-colors ${
                    isSelected ? "bg-white/[0.06] text-white" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <button
            onClick={submitRollCall}
            disabled={submitting}
            className="rounded-xl bg-white text-black px-5 py-2.5 text-xs font-bold shadow-soft hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting Broadcast..." : "Submit Roster Broadcast"}
          </button>
        </div>

        {/* Roster list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] uppercase tracking-wider text-white/30">
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3 text-center">Device Linked</th>
                <th className="pb-3 text-center">AP Proximity</th>
                <th className="pb-3 text-right">Roster Status Ledger</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {filteredRoster.map((student) => (
                  <tr key={student.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 pl-2 flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-white/70">
                        {student.avatar}
                      </div>
                      <span className="text-xs font-medium text-white/90">{student.name}</span>
                    </td>
                    <td className="py-3.5 text-center text-xs">
                      <span className={`inline-block size-1.5 rounded-full ${student.deviceSynced ? "bg-white/60" : "bg-white/10"}`} />
                    </td>
                    <td className="py-3.5 text-center text-xs">
                      {student.proximityVerified ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/20 font-medium">Unreached</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex rounded-lg bg-white/[0.02] border border-white/[0.05] p-0.5">
                        {(["present", "late", "excused", "absent"] as const).map((status) => {
                          const isSelected = student.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`rounded px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                                isSelected
                                  ? status === "present"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : status === "late"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : status === "excused"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-red-500/20 text-red-400"
                                  : "text-white/20 hover:text-white/50"
                              }`}
                            >
                              {status.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Success Alert */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-safe-lg right-safe-lg z-50 flex items-center gap-safe-sm rounded-2xl border border-white/[0.08] bg-[#0E0E12] px-safe-md py-safe-sm shadow-[0_16px_48px_rgba(0,0,0,0.8)]"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/[0.1] border border-emerald-500/20 text-emerald-400">
              ✓
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-tight text-white">Roster Broadcast Sent</span>
              <span className="text-[10px] text-white/40 mt-0.5">Presence logs synced to Coordinator and Student devices.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

