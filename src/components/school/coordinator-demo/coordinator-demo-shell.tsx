"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { StudentLookupPanel } from "./student-lookup-panel";
import { TeacherLookupPanel } from "./teacher-lookup-panel";
import { ScheduleManager } from "./schedule-manager";

type CoordinatorRole = "dp" | "myp" | "admin";

type Announcement = {
  id: string;
  title: string;
  type: "notice" | "emergency" | "delay" | "room-change" | "policy";
  audience: string;
  author: string;
  date: string;
  content: string;
};

type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  meta: string;
  urgency: "low" | "medium" | "high";
};

type SubstitutionNeed = {
  id: string;
  absentTeacher: string;
  classCover: string;
  period: string;
  room: string;
  assignedTeacher: string | null;
  status: "pending" | "assigned";
};

export function CoordinatorDemoShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [activeRole, setActiveRole] = useState<CoordinatorRole>("dp");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Emergency States
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Substitution state
  const [substitutions, setSubstitutions] = useState<SubstitutionNeed[]>([
    { id: "sub-1", absentTeacher: "Robert Blake", classCover: "DP History Grade 12", period: "Period 3", room: "Room 202", assignedTeacher: null, status: "pending" },
    { id: "sub-2", absentTeacher: "Ananya Rao", classCover: "Grade 11 Chemistry (A)", period: "Period 4", room: "Lab 2", assignedTeacher: "Aarav Chen", status: "assigned" },
  ]);

  // Announcements list
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "ann-1",
      title: "Science Lab room assignment adjustments",
      type: "room-change",
      audience: "Science Department",
      author: "Ananya Rao (Science Lead)",
      date: "10 mins ago",
      content: "Due to ventilation updates in Refraction Lab B, all Grade 11 Physics classes will route to Lab 4 for Period 2 blocks."
    },
    {
      id: "ann-2",
      title: "IB DP Extended Essay deadline extension",
      type: "notice",
      audience: "Grade 11 Students & Advisors",
      author: "Ananya Rao (DP Coordinator)",
      date: "2 hours ago",
      content: "The rough draft deadline for the Extended Essay has been extended by 3 days. Please adjust advisor reviews accordingly."
    },
  ]);

  // Sync theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(localStorage.getItem("axis-theme") || "dark");
      const handleThemeChange = () => {
        setTheme(localStorage.getItem("axis-theme") || "dark");
      };
      window.addEventListener("axis-theme-change", handleThemeChange);
      return () => window.removeEventListener("axis-theme-change", handleThemeChange);
    }
  }, []);

  // Compute live school snapshot statistics based on the selected Coordinator Role
  const telemetry = useMemo(() => {
    const data = {
      dp: {
        roleLabel: "IB DP Coordinator",
        studentsPresent: "184 / 190",
        studentsPresentPct: "96.8%",
        teachersPresent: "12 / 12",
        activeClasses: "8 Classes",
        activeMeetings: "2 Active",
        infirmaryCount: "1 in Infirmary",
        counselorCount: "1 in Counseling",
        roomsAffected: "1 affected",
        pendingSubstitutions: 1,
        logs: [
          { id: "log-dp-1", time: "10:15 AM", text: "Lucas Gray checked into Infirmary (Fever). Nurse Linda logged.", type: "medical" },
          { id: "log-dp-2", time: "09:40 AM", text: "Emma Watson checked into Guidance counselor office (EE block).", type: "pastoral" },
          { id: "log-dp-3", time: "09:10 AM", text: "Grade 11 Physics room change approved: Lab 3 to Lab 4.", type: "operations" },
        ]
      },
      myp: {
        roleLabel: "IB MYP Coordinator",
        studentsPresent: "228 / 234",
        studentsPresentPct: "97.4%",
        teachersPresent: "15 / 16",
        activeClasses: "12 Classes",
        activeMeetings: "1 Active",
        infirmaryCount: "0 in Infirmary",
        counselorCount: "0 in Counseling",
        roomsAffected: "0 affected",
        pendingSubstitutions: 1,
        logs: [
          { id: "log-myp-1", time: "12:45 PM", text: "Harry Osborn authorized early dismissal (Dentist appointment).", type: "leave" },
          { id: "log-myp-2", time: "11:15 AM", text: "Physical Ed PE cover request issued for Period 5 (Miller teaching).", type: "operations" },
        ]
      },
      admin: {
        roleLabel: "Head of School / Academy",
        studentsPresent: "642 / 680",
        studentsPresentPct: "94.4%",
        teachersPresent: "48 / 50",
        activeClasses: "32 Classes",
        activeMeetings: "6 Active",
        infirmaryCount: "2 in Infirmary",
        counselorCount: "3 in Counseling",
        roomsAffected: "3 affected",
        pendingSubstitutions: 2,
        logs: [
          { id: "log-adm-1", time: "12:45 PM", text: "Harry Osborn authorized early dismissal.", type: "leave" },
          { id: "log-adm-2", time: "10:15 AM", text: "Lucas Gray checked into Infirmary.", type: "medical" },
          { id: "log-adm-3", time: "09:40 AM", text: "Emma Watson logged in Room 102.", type: "pastoral" },
          { id: "log-adm-4", time: "08:30 AM", text: "Evacuation drill calibration scheduled for next Wednesday.", type: "operations" },
        ]
      }
    };
    return data[activeRole];
  }, [activeRole]);

  // Timeline events feed based on role
  const timelineEvents = useMemo(() => {
    const events: Record<CoordinatorRole, TimelineEvent[]> = {
      dp: [
        { id: "ev-dp-1", time: "10:30 AM", title: "Snell's Law laser refraction quiz due", meta: "Grade 11 Physics (A)", urgency: "low" },
        { id: "ev-dp-2", time: "11:00 AM", title: "Extended Essay draft coordination brief", meta: "DP Advisors meeting", urgency: "medium" },
        { id: "ev-dp-3", time: "02:15 PM", title: "Urgent sub coverage: Period 5 Physics B", meta: "Teacher Chen requested", urgency: "high" },
      ],
      myp: [
        { id: "ev-myp-1", time: "09:30 AM", title: "MYP Personal Project display setup check", meta: "Science Atrium", urgency: "medium" },
        { id: "ev-myp-2", time: "11:30 AM", title: "Algebra class room validation check", meta: "Room 4B coordinator override", urgency: "low" },
        { id: "ev-myp-3", time: "02:00 PM", title: "Sports Science equipment review block", meta: "Gymnasium", urgency: "low" },
      ],
      admin: [
        { id: "ev-adm-1", time: "11:00 AM", title: "Coordination Board executive council meeting", meta: "Admin board room", urgency: "high" },
        { id: "ev-adm-2", time: "01:30 PM", title: "SSO Active Directory sync confirmation check", meta: "IT Services", urgency: "medium" },
        { id: "ev-adm-3", time: "03:45 PM", title: "Safety audit report submission target", meta: "Operations Dept", urgency: "high" },
      ],
    };
    return events[activeRole];
  }, [activeRole]);

  // Handle schedule cut applied
  const handleScheduleCutApplied = (type: string, isAnnouncementChecked: boolean) => {
    if (isAnnouncementChecked) {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: `URGENT: ${type === "half-day" ? "Half-Day Schedule Cut Applied" : "Delayed School Start Configuration"}`,
        type: "delay",
        audience: "Whole School Ecosystem",
        author: `${telemetry.roleLabel}`,
        date: "Just now",
        content: `Attention all teachers, students, and parents. Axis has successfully synced coordinates for a ${
          type === "half-day" ? "Half-Day timeline (closing 12:30 PM)" : "Delayed start schedule (opening 10:00 AM)"
        }. Classes recalculated automatically.`
      };
      setAnnouncements(prev => [newAnn, ...prev]);
    }
  };

  // Handle room override
  const handleRoomOverrideApplied = (className: string, oldRoom: string, newRoom: string) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: `Timetable Overrides: Room Sync for ${className}`,
      type: "room-change",
      audience: "Affected classes",
      author: `${telemetry.roleLabel}`,
      date: "Just now",
      content: `${className} has been re-routed from Room ${oldRoom} to Room ${newRoom} for coordination purposes. Devices synced.`
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  // Trigger substitution allocation
  const handleTriggerSubstitution = (teacherName: string, classCoverName: string) => {
    // Add to substitutions array if not already present
    setSubstitutions(prev => {
      const exists = prev.some(s => s.absentTeacher === teacherName && s.classCover === classCoverName);
      if (exists) return prev;
      return [
        {
          id: `sub-${Date.now()}`,
          absentTeacher: teacherName,
          classCover: classCoverName,
          period: "Next Period",
          room: "Assigned Room",
          assignedTeacher: null,
          status: "pending"
        },
        ...prev
      ];
    });
    setActiveTab("teachers");
    alert(`Substitution coverage request logged for ${teacherName}'s class: ${classCoverName}.`);
  };

  // Assign substitute teacher
  const handleAssignSubstitute = (subId: string, subName: string) => {
    setSubstitutions(prev =>
      prev.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            assignedTeacher: subName,
            status: "assigned" as const
          };
        }
        return s;
      })
    );
    alert(`Ecosystem Sync: assigned ${subName} to substitute class.`);
  };

  // Handle emergency broadcast
  const handleTriggerEmergency = (type: string, message: string) => {
    setEmergencyActive(true);
    setEmergencyMsg(`${type.toUpperCase()} ALERT: ${message}`);
    setShowEmergencyModal(false);

    // Append to announcements list
    const emergencyAnn: Announcement = {
      id: `ann-em-${Date.now()}`,
      title: `🚨 EMERGENCY EXECUTIVE ANNOUNCEMENT: ${type.toUpperCase()}`,
      type: "emergency",
      audience: "ALL CAMPUS SYSTEM LAYERS",
      author: `${telemetry.roleLabel}`,
      date: "Just now",
      content: message
    };
    setAnnouncements(prev => [emergencyAnn, ...prev]);
  };

  const shellBgClass = {
    dark: "bg-[#0A0A0B] text-white",
    light: "bg-[#F3F4F6] text-black",
    "high-contrast": "bg-[#09090b] text-[#f4f4f5] border-2 border-zinc-800",
    axis: "bg-[#050607] text-white",
  }[theme] || "bg-[#0A0A0B] text-white";

  const cardStyle = {
    dark: "bg-zinc-900/60 border-zinc-800",
    light: "bg-white border-zinc-200 shadow-sm text-zinc-900",
    "high-contrast": "bg-black border-2 border-white",
    axis: "bg-[#0A0D14]/80 border-cyan-950/80 backdrop-blur-xl",
  }[theme] || "bg-zinc-900/60 border-zinc-800";

  return (
    <div className={`relative flex min-h-screen w-full ${shellBgClass} overflow-hidden antialiased transition-colors duration-500`}>
      
      {/* ─── EMERGENCY BROADCAST BANNER ─────────────────────────────────────────── */}
      {emergencyActive && (
        <div className="fixed top-0 inset-x-0 z-[150] bg-red-600 border-b border-red-500 text-white font-extrabold text-xs uppercase py-3.5 px-6 flex justify-between items-center shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span>🚨</span>
            <span className="tracking-wide">{emergencyMsg}</span>
          </div>
          <button
            onClick={() => setEmergencyActive(false)}
            className="px-3 py-1 rounded bg-black/30 border border-white/20 hover:bg-black/50 text-[10px] uppercase font-bold"
          >
            Cancel Alert
          </button>
        </div>
      )}

      {/* ─── COORDINATOR SIDEBAR ────────────────────────────────────────────────── */}
      <motion.aside
        className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-[#0A0A0B]/85 shadow-[24px_0_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        initial={{ width: "72px" }}
        animate={{ width: isSidebarHovered ? "260px" : "72px" }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Brand logo */}
        <div className="flex h-24 items-center px-5">
          <div className="flex items-center gap-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A0A0B] font-extrabold text-lg shadow-md">
              A
            </div>
            {isSidebarHovered && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wide text-white uppercase">Axis</span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Coordinator</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-none">
          {[
            { id: "home", label: "Overview", icon: "🌐", sub: "Operational snapshot" },
            { id: "students", label: "Student Finder", icon: "🔍", sub: "Locate & status maps" },
            { id: "teachers", label: "Faculty Directory", icon: "👥", sub: "Coverage & assignments" },
            { id: "schedule", label: "Schedule Control", icon: "📅", sub: "Special day timing cuts" },
            { id: "announcements", label: "Broadcaster", icon: "📢", sub: "Emergency & audience alerts" },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex w-full items-center h-10 px-2 rounded-xl text-left transition-all duration-200 outline-none select-none border border-transparent ${
                  isActive
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-100 shadow-md"
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="coordActiveIndicator"
                    className="absolute left-[3px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="size-8 flex items-center justify-center shrink-0 text-base">{item.icon}</div>
                {isSidebarHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col ml-3 min-w-0"
                  >
                    <span className="text-[13px] font-semibold leading-none">{item.label}</span>
                    <span className="mt-1 text-[9px] font-normal leading-none opacity-45 truncate">{item.sub}</span>
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-white/[0.06] px-5 py-4 text-center">
          {isSidebarHovered ? (
            <div className="flex flex-col text-[10px] text-white/30">
              <span>v0.4.8-alpha</span>
              <span className="font-bold uppercase text-cyan-400">Control Room</span>
            </div>
          ) : (
            <span className="text-[9px] text-white/20 font-bold">C</span>
          )}
        </div>
      </motion.aside>

      {/* ─── MAIN PORT CONTAINER ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col h-screen pl-[72px] overflow-hidden ${emergencyActive ? "pt-[45px]" : ""}`}>
        
        {/* Top Header */}
        <header className="relative z-20 flex h-24 items-center justify-between border-b border-white/[0.05] px-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Link href="/school/experience" className="text-xs text-white/40 hover:text-white transition-colors">
                ← Exit Console
              </Link>
              <span className="size-1 rounded-full bg-white/20" />
              <span className="text-[9px] font-extrabold text-cyan-400 tracking-widest uppercase">
                Axis Executive Suite
              </span>
            </div>
            
            <div className="mt-2 flex items-baseline gap-2.5">
              <h1 className="text-sm font-semibold tracking-tight text-white/90">
                School Operations Control Panel
              </h1>
              <span className="text-xs text-white/35 font-normal tracking-tight">
                Monday, August 28 · Live campus status maps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Role Adaptation Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {[
                { id: "dp", label: "DP Coord" },
                { id: "myp", label: "MYP Coord" },
                { id: "admin", label: "Head of School" },
              ].map((roleOpt) => (
                <button
                  key={roleOpt.id}
                  onClick={() => setActiveRole(roleOpt.id as CoordinatorRole)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeRole === roleOpt.id
                      ? "bg-cyan-500 text-black font-extrabold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {roleOpt.label}
                </button>
              ))}
            </div>

            <span className="h-4 w-px bg-white/10" />

            {/* Emergency Broadcast Trigger */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all animate-pulse"
            >
              🚨 Emergency
            </button>
          </div>
        </header>

        {/* Live Search overlay bar */}
        <div className="px-6 py-3 border-b border-white/[0.03] bg-white/[0.01] flex items-center gap-3">
          <span className="text-xs">🔍</span>
          <input
            type="text"
            placeholder="Global search student name, teacher, room class, parent contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-white/80 placeholder-white/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] uppercase font-bold text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* ─── SCROLLABLE CONTENT VIEWPORT ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <AnimatePresence mode="wait">
            
            {/* ─── TAB 1: OVERVIEW HOME ─────────────────────────────────────────── */}
            {activeTab === "home" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12"
              >
                
                {/* Left Area: Live Counters & Status timelines (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Telemetry statistics card layout */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-6`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Campus Pulse</span>
                        <h2 className="text-lg font-black tracking-tight text-white mt-0.5">Live School Snapshot</h2>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {telemetry.roleLabel} Scope
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { title: "Students Present", val: telemetry.studentsPresent, sub: telemetry.studentsPresentPct, color: "text-emerald-400" },
                        { title: "Teachers Present", val: telemetry.teachersPresent, sub: "Available leads", color: "text-cyan-400" },
                        { title: "Active Classes", val: telemetry.activeClasses, sub: "Continuous learning", color: "text-white" },
                        { title: "Active Meetings", val: telemetry.activeMeetings, sub: "Academic coordination", color: "text-indigo-400" },
                        { title: "Infirmary Logs", val: telemetry.infirmaryCount, sub: "Special attention needed", color: "text-amber-400" },
                        { title: "Counselor Status", val: telemetry.counselorCount, sub: "Pastoral reviews active", color: "text-indigo-400" },
                        { title: "Rooms Affected", val: telemetry.roomsAffected, sub: "Overrides complete", color: "text-rose-400" },
                        { title: "Pending Substitutions", val: telemetry.pendingSubstitutions, sub: "Coverages outstanding", color: "text-amber-400" },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1">
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">{stat.title}</span>
                          <h4 className={`text-base font-black ${stat.color} font-mono`}>{stat.val}</h4>
                          <span className="text-[9px] text-white/40 block font-sans">{stat.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Status timeline feed */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-4`}>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live System Logs</h3>
                      <p className="text-[11px] text-white/35">Real-time coordinates verification feed from all campus nodes.</p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {telemetry.logs.map((log) => (
                        <div key={log.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-2.5">
                            <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                            <p className="text-white/80 font-medium">{log.text}</p>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400/70">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Area: Timelines & Substitution requests (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Timeline disruptions */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-4`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Today&apos;s High-Priority Timeline</h4>
                      <p className="text-[9px] text-white/30">Target coordinator interventions logs.</p>
                    </div>

                    <div className="space-y-3">
                      {timelineEvents.map((ev) => (
                        <div key={ev.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1.5 text-xs font-medium">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-cyan-400 font-bold">{ev.time}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              ev.urgency === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-white/50"
                            }`}>
                              {ev.urgency}
                            </span>
                          </div>
                          <h5 className="text-white/80 font-bold leading-tight">{ev.title}</h5>
                          <span className="text-[9px] text-white/35 block font-sans">{ev.meta}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Substitution requests */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-4`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Substitution Manager</h4>
                      <p className="text-[9px] text-white/30">Allocate coverages for absent faculty members.</p>
                    </div>

                    <div className="space-y-3">
                      {substitutions.map((sub) => (
                        <div key={sub.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-2.5 text-xs font-medium">
                          <div className="flex justify-between items-center">
                            <span className="text-red-400 font-bold">{sub.absentTeacher} (Away)</span>
                            <span className="text-white/35 font-mono font-medium">{sub.period}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-white/80 font-bold leading-none">{sub.classCover}</p>
                            <span className="text-[9px] text-white/35 block">Location: {sub.room}</span>
                          </div>

                          {sub.status === "pending" ? (
                            <div className="space-y-2 pt-2 border-t border-white/[0.03]">
                              <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Assign Available Staff:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {["Aarav Chen", "Sarah Chen"].map((availName) => (
                                  <button
                                    key={availName}
                                    onClick={() => handleAssignSubstitute(sub.id, availName)}
                                    className="px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20 text-[9px] font-bold text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all"
                                  >
                                    + {availName.split(" ")[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-white/[0.03] flex justify-between items-center text-[10px]">
                              <span className="text-white/40">Cover assigned:</span>
                              <span className="text-emerald-400 font-bold">✓ {sub.assignedTeacher}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* ─── TAB 2: STUDENT FINDER ────────────────────────────────────────── */}
            {activeTab === "students" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <StudentLookupPanel
                  theme={theme}
                  activeProgram={activeRole === "admin" ? "all" : activeRole}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {/* ─── TAB 3: FACULTY & ASSIGNMENT DIRECTORY ────────────────────────── */}
            {activeTab === "teachers" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <TeacherLookupPanel
                  theme={theme}
                  searchQuery={searchQuery}
                  onTriggerSubstitution={handleTriggerSubstitution}
                />
              </motion.div>
            )}

            {/* ─── TAB 4: SCHEDULE COORDINATION ─────────────────────────────────── */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <ScheduleManager
                  theme={theme}
                  onRoomOverride={handleRoomOverrideApplied}
                  onScheduleCutApplied={handleScheduleCutApplied}
                />
              </motion.div>
            )}

            {/* ─── TAB 5: BROADCASTER & ALERTS ───────────────────────────────────── */}
            {activeTab === "announcements" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                
                {/* Announcement Composer */}
                <div className={`p-6 rounded-3xl border ${cardStyle} space-y-6`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Executive Broadcaster</span>
                    <h3 className="text-base font-bold tracking-tight text-white">Compose School Announcement</h3>
                    <p className="text-xs text-white/40">Select targets and dispatch policy updates, room overrides, weather delay advisories, or general exam reminders.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const titleInput = form.elements.namedItem("annTitle") as HTMLInputElement;
                      const audSelect = form.elements.namedItem("annAudience") as HTMLSelectElement;
                      const contentText = form.elements.namedItem("annContent") as HTMLTextAreaElement;
                      
                      if (!titleInput.value || !contentText.value) return;

                      const newAnn: Announcement = {
                        id: `ann-custom-${Date.now()}`,
                        title: titleInput.value,
                        type: "notice",
                        audience: audSelect.value,
                        author: `${telemetry.roleLabel}`,
                        date: "Just now",
                        content: contentText.value,
                      };
                      setAnnouncements(prev => [newAnn, ...prev]);
                      titleInput.value = "";
                      contentText.value = "";
                      alert("Executive announcement successfully transmitted to target client groups.");
                    }}
                    className="space-y-4 text-xs font-semibold text-white/80"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500">Announcement Title</label>
                        <input
                          name="annTitle"
                          required
                          type="text"
                          placeholder="e.g. IB DP Mock Exam timing changes"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500">Target Audience</label>
                        <select
                          name="annAudience"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                        >
                          <option value="Whole School">Whole School Ecosystem</option>
                          <option value="DP Grade 11 & 12">Grade 11 & 12 (Diploma Program)</option>
                          <option value="MYP Year 4 & 5">MYP Students</option>
                          <option value="Faculty Only">Teachers & Staff Only</option>
                          <option value="Parents List">Parents Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500">Message Content</label>
                      <textarea
                        name="annContent"
                        required
                        rows={4}
                        placeholder="Detail specific scheduling offsets or guidelines here..."
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                    >
                      Transmit Broadcast Announcement
                    </button>
                  </form>
                </div>

                {/* Dispatch logs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dispatched Alerts History</h4>
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className={`p-5 rounded-2xl border ${cardStyle} space-y-2 text-xs`}>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {ann.type.toUpperCase()}
                            </span>
                            <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                          </div>
                          <span className="text-[10px] font-mono text-white/30">{ann.date}</span>
                        </div>
                        <p className="text-white/60 leading-relaxed font-medium">{ann.content}</p>
                        <div className="pt-2 border-t border-white/[0.03] flex justify-between text-[9px] text-white/35">
                          <span>Target: <strong>{ann.audience}</strong></span>
                          <span>Author: <strong>{ann.author}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* ─── EMERGENCY BROADCAST MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setShowEmergencyModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0E0E10]/95 p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-white space-y-5 text-left z-10"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                <span className="text-2xl animate-pulse">🚨</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">Critical Emergency dispatcher</h3>
                  <p className="text-[9px] text-white/35">Dispatch priority alarms across all campus networks.</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const typeSel = form.elements.namedItem("emType") as HTMLSelectElement;
                  const textVal = form.elements.namedItem("emMessage") as HTMLTextAreaElement;
                  
                  if (!textVal.value) return;

                  handleTriggerEmergency(typeSel.value, textVal.value);
                }}
                className="space-y-4 text-xs font-semibold text-white/80"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Alert Classification</label>
                  <select
                    name="emType"
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-red-500"
                  >
                    <option value="lockdown">Critical Lockdown / Shelter in Place</option>
                    <option value="evacuation">Campus Evacuation Notice</option>
                    <option value="dismissal">Weather Dismissal / Early Exit</option>
                    <option value="critical">Urgent Staff Assistance Request</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Alarm Message Broadcast</label>
                  <textarea
                    name="emMessage"
                    required
                    rows={3}
                    placeholder="Enter evacuation corridors, checkout rules, or assistance guidelines..."
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase text-white/60 transition-all text-center"
                  >
                    Cancel Dispatch
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] text-center"
                  >
                    Transmit Alarm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
