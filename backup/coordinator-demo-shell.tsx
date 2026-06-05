"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { StudentIntelligence } from "./student-intelligence";
import { FacultyIntelligence } from "./faculty-intelligence";
import { NavigationItem } from "@/components/school/navigation-item";
import { AcademicScheduling } from "./academic-scheduling";
import { SchoolMap } from "./school-map";
import { EventsInitiatives } from "./events-initiatives";
import { SchoolAnalytics } from "./school-analytics";
import { SettingsPanel } from "./settings-panel";

type AcademicProgramme = "pyp" | "myp" | "dp" | "cp";

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

type FacilityKey = "students" | "staff" | "rooms" | "infirmary" | "cafeteria" | "sports" | "maintenance" | "library" | "auditorium" | "admin";

type SearchItem = {
  id: string;
  type: "Student" | "Teacher" | "Class" | "Department" | "Facility" | "Room" | "Event" | "Announcement" | "Programme";
  title: string;
  subtitle: string;
  meta?: string;
  avatar?: string;
  targetTab?: string;
  actionData?: any;
};

const SEARCH_ITEMS: SearchItem[] = [
  { id: "std-1", type: "Student", title: "Chloe Vance", subtitle: "Grade 11-B · DP", avatar: "CV", targetTab: "students", actionData: { id: "std-1" } },
  { id: "std-2", type: "Student", title: "Lucas Gray", subtitle: "Grade 11-B · DP · Infirmary", avatar: "LG", targetTab: "students", actionData: { id: "std-2" } },
  { id: "std-3", type: "Student", title: "Dilan Patel", subtitle: "Grade 11-A · DP · Library", avatar: "DP", targetTab: "students", actionData: { id: "std-3" } },
  { id: "std-4", type: "Student", title: "Emma Watson", subtitle: "Grade 11-A · DP · Counselor", avatar: "EW", targetTab: "students", actionData: { id: "std-4" } },
  { id: "std-5", type: "Student", title: "Leo Sterling", subtitle: "Grade 10-C · MYP", avatar: "LS", targetTab: "students", actionData: { id: "std-5" } },
  { id: "std-6", type: "Student", title: "Sophia Alpin", subtitle: "Grade 12-A · DP", avatar: "SA", targetTab: "students", actionData: { id: "std-6" } },
  { id: "std-7", type: "Student", title: "Marcus Aurelius", subtitle: "Grade 9-B · MYP", avatar: "MA", targetTab: "students", actionData: { id: "std-7" } },

  { id: "tch-1", type: "Teacher", title: "Aarav Chen", subtitle: "Physics Master Teacher · CAS Coordinator", avatar: "AC", targetTab: "teachers", actionData: { id: "tch-1" } },
  { id: "tch-2", type: "Teacher", title: "Ananya Rao", subtitle: "Chemistry Specialist · Science Department Lead", avatar: "AR", targetTab: "teachers", actionData: { id: "tch-2" } },
  { id: "tch-3", type: "Teacher", title: "Marcus Vance", subtitle: "Advanced Calculus Expert · Head of Mathematics", avatar: "MV", targetTab: "teachers", actionData: { id: "tch-3" } },
  { id: "tch-4", type: "Teacher", title: "Sarah Chen", subtitle: "Guidance Counselor · DP Coordinator", avatar: "SC", targetTab: "teachers", actionData: { id: "tch-4" } },
  { id: "tch-5", type: "Teacher", title: "David Miller", subtitle: "Athletics Coach · MYP Coordinator", avatar: "DM", targetTab: "teachers", actionData: { id: "tch-5" } },
  { id: "tch-6", type: "Teacher", title: "Clara Dupont", subtitle: "Literature Specialist · English Department Lead", avatar: "CD", targetTab: "teachers", actionData: { id: "tch-6" } },
  { id: "tch-7", type: "Teacher", title: "Robert Blake", subtitle: "History Teacher · Grade Level Lead", avatar: "RB", targetTab: "teachers", actionData: { id: "tch-7" } },

  { id: "cls-1", type: "Class", title: "Grade 11 Physics (B)", subtitle: "Taught by Aarav Chen · Lab 3", targetTab: "schedule" },
  { id: "cls-2", type: "Class", title: "Grade 12 Adv Physics (A)", subtitle: "Taught by Aarav Chen · Lab 3", targetTab: "schedule" },
  { id: "cls-3", type: "Class", title: "Grade 11 Chemistry (A)", subtitle: "Taught by Ananya Rao · Lab 2", targetTab: "schedule" },
  { id: "cls-4", type: "Class", title: "Grade 12 DP Chemistry", subtitle: "Taught by Ananya Rao · Lab 2", targetTab: "schedule" },
  { id: "cls-5", type: "Class", title: "Grade 12 Calculus", subtitle: "Taught by Marcus Vance · Room 204", targetTab: "schedule" },
  { id: "cls-6", type: "Class", title: "Grade 10 Algebra II", subtitle: "Taught by Marcus Vance · Room 204", targetTab: "schedule" },
  { id: "cls-7", type: "Class", title: "MYP PE Grade 10", subtitle: "Taught by David Miller · Gymnasium", targetTab: "schedule" },
  { id: "cls-8", type: "Class", title: "DP Sports Science", subtitle: "Taught by David Miller · Football Field", targetTab: "schedule" },

  { id: "dept-1", type: "Department", title: "Science Department", subtitle: "Lead: Ananya Rao · 8 Teachers", targetTab: "teachers" },
  { id: "dept-2", type: "Department", title: "Mathematics Department", subtitle: "Lead: Marcus Vance · 6 Teachers", targetTab: "teachers" },
  { id: "dept-3", type: "Department", title: "English Department", subtitle: "Lead: Clara Dupont · 5 Teachers", targetTab: "teachers" },
  { id: "dept-4", type: "Department", title: "Humanities Department", subtitle: "Lead: Robert Blake · 4 Teachers", targetTab: "teachers" },
  { id: "dept-5", type: "Department", title: "Physical Ed Department", subtitle: "Lead: David Miller · 3 Coaches", targetTab: "teachers" },

  { id: "fac-1", type: "Facility", title: "Football Field", subtitle: "Status: Occupied · Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-2", type: "Facility", title: "Gymnasium", subtitle: "Status: Occupied · Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-3", type: "Facility", title: "Badminton Court", subtitle: "Status: Available · Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-4", type: "Facility", title: "Swimming Pool", subtitle: "Status: Occupied · Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-5", type: "Facility", title: "Basketball Court", subtitle: "Status: Reserved · Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-6", type: "Facility", title: "Auditorium", subtitle: "Status: Occupied · Arts Wing", targetTab: "map", actionData: { facility: "auditorium" } },
  { id: "fac-7", type: "Facility", title: "Multipurpose Hall", subtitle: "Status: Available · Central Wing", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-8", type: "Facility", title: "Dance Studio", subtitle: "Status: Occupied · Arts Wing", targetTab: "map", actionData: { facility: "sports" } },
  { id: "fac-9", type: "Room", title: "Science Lab 3", subtitle: "Status: Occupied · Physics Practical", targetTab: "map", actionData: { facility: "rooms" } },
  { id: "fac-10", type: "Room", title: "Science Lab 2", subtitle: "Status: Occupied · Chemistry IA", targetTab: "map", actionData: { facility: "rooms" } },
  { id: "fac-11", type: "Room", title: "Main Library", subtitle: "Status: Occupied · Research Study", targetTab: "map", actionData: { facility: "library" } },

  { id: "evt-1", type: "Event", title: "Theory of Knowledge (TOK) Exhibition", subtitle: "15:30 Today · Library", targetTab: "events" },
  { id: "evt-2", type: "Event", title: "DP Music Concert", subtitle: "15:00 Today · Main Auditorium", targetTab: "events" },
  { id: "evt-3", type: "Event", title: "Varsity Basketball Game", subtitle: "17:00 Today · Gym Hall", targetTab: "events" },
  { id: "evt-4", type: "Event", title: "Executive Board Budget Review", subtitle: "16:00 Today · Boardroom", targetTab: "events" },

  { id: "ann-1", type: "Announcement", title: "Science Lab room assignment adjustments", subtitle: "10 mins ago · Science Department", targetTab: "events" },
  { id: "ann-2", type: "Announcement", title: "DP Extended Essay draft checklist deadline", subtitle: "2 hours ago · DP Cohort", targetTab: "events" },
  { id: "ann-3", type: "Announcement", title: "Inter-school sports logistics finalized", subtitle: "1 day ago · Whole School", targetTab: "events" },

  { id: "prg-1", type: "Programme", title: "Primary Years Programme (PYP)", subtitle: "Inquiry-based primary curriculum", targetTab: "home" },
  { id: "prg-2", type: "Programme", title: "Middle Years Programme (MYP)", subtitle: "Grades 6-10 curriculum framework", targetTab: "home" },
  { id: "prg-3", type: "Programme", title: "Diploma Programme (DP)", subtitle: "Grades 11-12 rigorous pre-university curriculum", targetTab: "home" },
  { id: "prg-4", type: "Programme", title: "Career-related Programme (CP)", subtitle: "Vocational and career pathway curriculum", targetTab: "home" },
];

export function CoordinatorDemoShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [activeProgramme, setActiveProgramme] = useState<AcademicProgramme>("dp");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Search overlay & suggest states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Chloe Vance",
    "Football Field",
    "Science Lab 3",
    "Music Concert",
  ]);
  const [frequentlyAccessed, setFrequentlyAccessed] = useState<SearchItem[]>([
    { id: "tch-1", type: "Teacher", title: "Aarav Chen", subtitle: "Physics Master Teacher · CAS Coordinator", avatar: "AC", targetTab: "teachers", actionData: { id: "tch-1" } },
    { id: "std-2", type: "Student", title: "Lucas Gray", subtitle: "Grade 11-B · DP · Infirmary", avatar: "LG", targetTab: "students", actionData: { id: "std-2" } },
    { id: "fac-1", type: "Facility", title: "Football Field", subtitle: "Sports Complex", targetTab: "map", actionData: { facility: "sports" } },
  ]);

  const [searchSelectedStudent, setSearchSelectedStudent] = useState<any | null>(null);
  const [searchSelectedTeacher, setSearchSelectedTeacher] = useState<any | null>(null);

  // Facility Overlay Modals
  const [activeFacilityModal, setActiveFacilityModal] = useState<FacilityKey | null>(null);

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
      author: "Dr. Alistair Vance (Director)",
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

  // Compute live school snapshot statistics
  const telemetry = useMemo(() => {
    const defaultData = {
      roleLabel: "Principal & School Leadership",
      studentsPresent: "614 / 638",
      studentsPresentPct: "96.2%",
      teachersPresent: "44 / 45",
      activeClasses: "22 Classes",
      activeMeetings: "4 Active",
      infirmaryCount: "2 in Infirmary",
      counselorCount: "1 in Counseling",
      roomsAffected: "1 affected",
      pendingSubstitutions: 1,
      logs: [
        { id: "log-pyp-1", time: "10:15 AM", text: "Lucas Gray checked into Infirmary (Fever). Nurse Linda logged.", type: "medical" },
        { id: "log-pyp-2", time: "09:40 AM", text: "Emma Watson checked into Guidance counselor office (Pastoral block).", type: "pastoral" },
        { id: "log-pyp-3", time: "09:10 AM", text: "Science Lab room change approved: Lab 3 to Lab 4.", type: "operations" },
      ]
    };
    return defaultData;
  }, []);

  // Context Proactive Insights (Surfacing UI alerts based on curriculum status)
  const proactiveInsights = useMemo(() => {
    return [
      { id: "ins-1", text: "Extended Essay submissions are lagging in DP (rough drafts at 72%).", type: "warning" },
      { id: "ins-2", text: "Personal Project proposals are behind target in MYP (G10 submissions at 70%).", type: "attention" },
      { id: "ins-3", text: "Sports Complex booking conflict detected next week (Grade 9 PE vs Swim Team).", type: "conflict" },
      { id: "ins-4", text: "Three major events overlap on Friday (Sports Day prep, Mock exams, Open House).", type: "conflict" },
      { id: "ins-5", text: "Infirmary staffing is below normal levels tomorrow (Nurse Linda away).", type: "warning" }
    ];
  }, []);

  // Timeline events feed
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [
      { id: "ev-adm-1", time: "11:00 AM", title: "Coordination Board executive council meeting", meta: "Admin board room", urgency: "high" },
      { id: "ev-adm-2", time: "01:30 PM", title: "School Map active database check", meta: "IT Services Office", urgency: "medium" },
      { id: "ev-adm-3", time: "03:45 PM", title: "Safety audit report submission target", meta: "Operations Dept", urgency: "high" },
    ];
    return events;
  }, []);

  // Filtered search items
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return SEARCH_ITEMS.filter((item) => 
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Trigger substitution allocation
  const handleTriggerSubstitution = (teacherName: string, classCoverName: string) => {
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
  };

  // Handle emergency broadcast
  const handleTriggerEmergency = (type: string, message: string) => {
    setEmergencyActive(true);
    setEmergencyMsg(`${type.toUpperCase()} ALERT: ${message}`);
    setShowEmergencyModal(false);

    const emergencyAnn: Announcement = {
      id: `ann-em-${Date.now()}`,
      title: `🚨 EMERGENCY EXECUTIVE ANNOUNCEMENT: ${type.toUpperCase()}`,
      type: "emergency",
      audience: "ALL CAMPUS SYSTEM LAYERS",
      author: "Dr. Alistair Vance (Director)",
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

      {/* ─── SCHOOL LEADERSHIP SIDEBAR ───────────────────────────────────────────── */}
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
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Leadership Console</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-none">
          {[
            {
              id: "home",
              label: "Overview",
              sub: "Campus dashboard overview",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )
            },
            {
              id: "students",
              label: "Students",
              sub: "Demographics & rosters",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )
            },
            {
              id: "teachers",
              label: "Teachers",
              sub: "Department workloads & directories",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.902 0-5.54-1.088-7.54-2.881.346-1.3.83-2.522 1.435-3.63a3.75 3.75 0 017.153-1.755 4.887 4.887 0 00-2.231 4.17M6.75 7.5a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM19.5 8.25a2.25 2.25 0 120-4.5 2.25 2.25 0 020 4.5z" />
                </svg>
              )
            },
            {
              id: "schedule",
              label: "Schedule",
              sub: "Timetable presets & calendar",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              id: "map",
              label: "Campus Map",
              sub: "Interactive room finder",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6.75V15m-10.5-3h15M3 5.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25z" />
                </svg>
              )
            },
            {
              id: "analytics",
              label: "Analytics",
              sub: "Enrollment trends & class sizes",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125 1.125 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              )
            },
            {
              id: "events",
              label: "Events & Booking",
              sub: "Space requests & calendar",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              )
            },
            {
              id: "announcements",
              label: "Announcements",
              sub: "Notice & broadcast logs",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )
            },
            {
              id: "settings",
              label: "Settings",
              sub: "School configurations",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <NavigationItem
                key={item.id}
                id={item.id}
                label={item.label}
                subLabel={item.sub}
                icon={item.icon}
                isActive={isActive}
                onClick={() => setActiveTab(item.id)}
                isCollapsed={!isSidebarHovered}
                layoutId="coordActiveHighlight"
                theme="dark"
              />
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-white/[0.06] px-5 py-4 text-center">
          {isSidebarHovered ? (
            <div className="flex flex-col text-[10px] text-white/30">
              <span>v0.5.2-alpha</span>
              <span className="font-bold uppercase text-cyan-400 font-mono">Strategic Center</span>
            </div>
          ) : (
            <span className="text-[9px] text-white/20 font-bold">L</span>
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
                School Leadership Command Cockpit
              </span>
            </div>
            
            <div className="mt-2 flex items-baseline gap-2.5">
              <h1 className="text-sm font-semibold tracking-tight text-white/90">
                Director & Executive Control Center
              </h1>
              <span className="text-xs text-white/35 font-normal tracking-tight">
                Monday, August 28 · Roster and facility sync verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Highly Visible Academic Programme Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-white/30">
              {(["pyp", "myp", "dp", "cp"] as AcademicProgramme[]).map((prog, idx) => (
                <div key={prog} className="flex items-center">
                  {idx > 0 && <span className="mx-1.5 opacity-20 text-white select-none">|</span>}
                  <button
                    onClick={() => setActiveProgramme(prog)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                      activeProgramme === prog
                        ? "bg-cyan-500 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {prog.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>

            <span className="h-4 w-px bg-white/10" />

            {/* Emergency Dispatch */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all animate-pulse"
            >
              🚨 Emergency Alert
            </button>
          </div>
        </header>

        {/* Global search overlay bar */}
        <div className="relative px-6 py-3 border-b border-white/[0.03] bg-white/[0.01] flex items-center gap-3 z-30">
          <span className="text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search students, faculty profiles, physical campus areas, proposed bookings, notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
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

          {/* Absolute Search Suggestions Panel */}
          {isSearchFocused && (
            <>
              {/* Clicking outside overlay */}
              <div 
                className="fixed inset-0 top-[141px] z-40 bg-black/60 backdrop-blur-sm cursor-default"
                onClick={() => setIsSearchFocused(false)}
              />
              
              {/* Dropdown Card */}
              <div className="absolute top-full left-6 right-6 mt-1 z-50 bg-[#0A0D14] border border-cyan-950/80 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white text-left max-h-[500px] overflow-y-auto space-y-4">
                {searchQuery.trim() === "" ? (
                  // Suggested / Recent State
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    {/* Recent Searches */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/35 block">Recent Searches</span>
                      <div className="space-y-1.5">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(term)}
                            className="w-full text-left p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10 transition-all font-semibold text-white/80 flex items-center justify-between"
                          >
                            <span>🕒 {term}</span>
                            <span className="text-[9px] opacity-35 font-bold">Search</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Results */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/35 block">Suggested Resources</span>
                      <div className="space-y-1.5">
                        {[
                          { title: "Gymnasium Timeline", targetTab: "schedule" },
                          { title: "Science Lab 3 Roster", targetTab: "map" },
                          { title: "TOK Exhibition Event", targetTab: "events" },
                          { title: "Diploma Programme (DP)", targetTab: "home" },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setActiveTab(item.targetTab);
                            }}
                            className="w-full text-left p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10 transition-all font-semibold text-cyan-400 flex items-center justify-between"
                          >
                            <span>💡 {item.title}</span>
                            <span className="text-[9px] opacity-50 font-bold">Go</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequently Accessed Profiles */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/35 block">Frequently Accessed Profiles</span>
                      <div className="space-y-2">
                        {frequentlyAccessed.map((profile) => (
                          <div
                            key={profile.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              if (profile.type === "Student") {
                                setSearchSelectedStudent(profile);
                              } else {
                                setSearchSelectedTeacher(profile);
                              }
                            }}
                            className="p-2 rounded-lg bg-cyan-950/15 border border-cyan-950/45 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <div className="size-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                              {profile.avatar}
                            </div>
                            <div className="text-[11px]">
                              <div className="font-bold text-white leading-none">{profile.title}</div>
                              <div className="text-[9px] text-zinc-400 mt-0.5">{profile.subtitle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Quick Search Results State
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/30">Quick Search Results matching "{searchQuery}"</span>
                      <span className="text-[9px] font-mono text-cyan-400">{filteredSearchItems.length} items found</span>
                    </div>

                    {filteredSearchItems.length === 0 ? (
                      <div className="py-8 text-center text-xs text-white/35">
                        No matches found for "{searchQuery}". Check spelling or try searching departments/facilities.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                        {filteredSearchItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              if (item.type === "Student") {
                                // Find full student details in mock list
                                setSearchSelectedStudent(item);
                              } else if (item.type === "Teacher") {
                                setSearchSelectedTeacher(item);
                              } else if (item.type === "Facility" && item.actionData?.facility) {
                                setActiveFacilityModal(item.actionData.facility as any);
                              } else {
                                setActiveTab(item.targetTab || "home");
                              }
                            }}
                            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              {item.avatar ? (
                                <div className="size-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                                  {item.avatar}
                                </div>
                              ) : (
                                <div className="size-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs">
                                  {item.type === "Class" && "📚"}
                                  {item.type === "Department" && "🏢"}
                                  {item.type === "Facility" && "🏟️"}
                                  {item.type === "Room" && "🚪"}
                                  {item.type === "Event" && "📅"}
                                  {item.type === "Announcement" && "📢"}
                                  {item.type === "Programme" && "🎓"}
                                </div>
                              )}
                              <div className="text-xs">
                                <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</div>
                                <div className="text-[10px] text-white/40">{item.subtitle}</div>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase bg-white/5 border border-white/10 text-white/60 px-1.5 py-0.5 rounded">
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ─── SCROLLABLE CONTENT VIEWPORT ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <AnimatePresence mode="wait">
            
            {/* ─── TAB 1: OVERVIEW COCKPIT ──────────────────────────────────────── */}
            {activeTab === "home" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12"
              >
                
                {/* Left Area: Snapshot Cards & Programme Details (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Clickable Campus Overview Grid */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-6`}>
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Campus Overview</span>
                      <h2 className="text-lg font-black tracking-tight text-white mt-0.5">Live Operations Board</h2>
                      <p className="text-[11px] text-white/35 mt-0.5">Click any operational facility card to open direct monitoring panel and supervisor hotline.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { key: "students", title: "Active Students", val: telemetry.studentsPresent, sub: telemetry.studentsPresentPct, color: "text-emerald-400" },
                        { key: "staff", title: "Active Staff", val: telemetry.teachersPresent, sub: "All rosters synchronized", color: "text-cyan-400" },
                        { key: "rooms", title: "Rooms In Use", val: "18 Classrooms", sub: "3 lecture halls open", color: "text-white" },
                        { key: "admin", title: "Administration Block", val: "14 / 30 Seated", sub: "Briefing active", color: "text-purple-400" },
                        { key: "infirmary", title: "Infirmary Activity", val: telemetry.infirmaryCount, sub: "Special attention logs active", color: "text-amber-400" },
                        { key: "cafeteria", title: "Cafeteria Activity", val: "220 / 400 Seated", sub: "Lunch service transition", color: "text-indigo-400" },
                        { key: "sports", title: "Sports Complex", val: "3 Facilities Active", sub: "Gym, Pool, Track active", color: "text-cyan-400" },
                        { key: "library", title: "Library & Study Hall", val: "48 / 150 Seated", sub: "TOK Exhibition setup", color: "text-emerald-400" },
                        { key: "auditorium", title: "Main Auditorium", val: "24 / 600 Seated", sub: "Music concert prep", color: "text-blue-400" },
                        { key: "maintenance", title: "Active Maintenance", val: "2 Jobs Dispatched", sub: "Clean buffers in progress", color: "text-yellow-400" },
                      ].map((stat, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (["infirmary", "cafeteria", "sports", "library", "auditorium", "admin", "students", "staff", "rooms", "maintenance"].includes(stat.key)) {
                              setActiveFacilityModal(stat.key as FacilityKey);
                            } else {
                              alert(`Live dashboard audit: ${stat.title} data feed fully calibrated.`);
                            }
                          }}
                          className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-2xl space-y-1 text-left cursor-pointer transition-all outline-none"
                        >
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">{stat.title}</span>
                          <h4 className={`text-base font-black ${stat.color} font-mono`}>{stat.val}</h4>
                          <span className="text-[9px] text-white/40 block font-sans leading-tight">{stat.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Academic Programme View Reshaped */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-6`}>
                    <div className="flex justify-between items-start border-b border-white/[0.06] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Academic Program Sync</span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">
                          {activeProgramme === "pyp" && "PYP Operational Summary"}
                          {activeProgramme === "myp" && "MYP Program Dashboard"}
                          {activeProgramme === "dp" && "DP Academic Executive Overview"}
                          {activeProgramme === "cp" && "CP Program Status & Roster"}
                        </h3>
                      </div>
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                        {activeProgramme.toUpperCase()} Stream
                      </span>
                    </div>

                    {/* PYP MODE RENDERING */}
                    {activeProgramme === "pyp" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Exhibition Progress Card */}
                          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-3">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">G5 Exhibition Milestones</span>
                            <div className="flex justify-between text-xs items-center">
                              <span className="text-white/60">Inquiry Projects Completion</span>
                              <strong className="text-emerald-400 font-mono">86% Done</strong>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400" style={{ width: "86%" }} />
                            </div>
                            <div className="flex justify-between text-[9px] text-white/35">
                              <span>24 Student inquiry teams</span>
                              <span>6 Mentors allocated</span>
                            </div>
                          </div>

                          {/* Parent engagement indicators */}
                          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Parent Engagement Indicators</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[9px] text-white/30 block leading-tight">Portal App Syncs</span>
                                <strong className="text-white">94% Active</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-white/30 block leading-tight">Meeting Attendance</span>
                                <strong className="text-white">98% Verified</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Grade level summaries */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">Primary School Grade Summary</span>
                          {[
                            { grade: "Grade 5", detail: "Exhibition milestones outline submitted (24 teams active)", wellbeing: "Balanced focus" },
                            { grade: "Grade 4", detail: "Inquiry block: Unit planner 3 signed off and finalized", wellbeing: "Healthy indexes" },
                            { grade: "Grade 3", detail: "Wellbeing tracking: homeroom checklists logged on time", wellbeing: "98% on-schedule" },
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <strong className="text-white/80">{item.grade}</strong>
                                <p className="text-[10px] text-white/40 font-medium mt-0.5">{item.detail}</p>
                              </div>
                              <span className="text-[9px] text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded">{item.wellbeing}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MYP MODE RENDERING */}
                    {activeProgramme === "myp" && (
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Personal Project Dashboard (Completion Rates)</span>
                            <span className="text-[10px] text-cyan-400 font-bold">48 Students Roster</span>
                          </div>

                          <div className="space-y-2 font-mono text-xs">
                            {[
                              { label: "Proposal Submitted", count: "48 / 48", pct: "100%", width: "100%", color: "bg-cyan-500" },
                              { label: "Research Stage Completion", count: "42 / 48", pct: "87%", width: "87%", color: "bg-cyan-500" },
                              { label: "Draft Outline Uploaded", count: "34 / 48", pct: "70%", width: "70%", color: "bg-cyan-500" },
                              { label: "Supervisor Reviews Completed", count: "22 / 48", pct: "45%", width: "45%", color: "bg-yellow-500" },
                              { label: "Final Submissions Uploaded", count: "12 / 48", pct: "25%", width: "25%", color: "bg-rose-500 animate-pulse" },
                            ].map((stage, idx) => (
                              <div key={idx} className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-xl space-y-1.5">
                                <div className="flex justify-between text-[10px] font-sans text-white/60">
                                  <span>{stage.label}</span>
                                  <span>{stage.count} ({stage.pct})</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${stage.color}`} style={{ width: stage.width }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-white/[0.04]">
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider">Service as Action</span>
                            <p className="text-white mt-1">92% student portfolios active</p>
                          </div>
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider">Assessment Status</span>
                            <p className="text-white mt-1">84% term sheets verified</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DP MODE RENDERING */}
                    {activeProgramme === "dp" && (
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Extended Essay (EE) Timeline Monitor</span>
                            <span className="text-[9px] text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded font-mono">Attention Flag</span>
                          </div>

                          <div className="space-y-2 font-mono text-xs">
                            {[
                              { label: "Outline Uploaded", count: "94%", width: "94%", color: "bg-cyan-500" },
                              { label: "Rough Draft Checked (Advisor Review)", count: "72%", width: "72%", color: "bg-yellow-500", warning: "Lagging: reviews behind schedule" },
                              { label: "Final Essay Uploaded", count: "48%", width: "48%", color: "bg-rose-500" },
                            ].map((stage, idx) => (
                              <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-sans text-white/70">
                                  <span>{stage.label}</span>
                                  <strong className="text-white">{stage.count}</strong>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${stage.color}`} style={{ width: stage.width }} />
                                </div>
                                {stage.warning && (
                                  <span className="text-[8px] text-yellow-400 font-sans leading-none block">{stage.warning}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold pt-2 border-t border-white/[0.04]">
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider block">TOK Essay Drafts</span>
                            <strong className="text-white">82% Verified</strong>
                          </div>
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider block">CAS Completion</span>
                            <strong className="text-emerald-400">95% (G11) / 89% (G12)</strong>
                          </div>
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider block">Mock Exam readiness</span>
                            <strong className="text-white">100% Logistics</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CP MODE RENDERING */}
                    {activeProgramme === "cp" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Reflective Project Health */}
                          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2.5">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Reflective Project</span>
                            <div className="flex justify-between text-xs items-center">
                              <span className="text-white/60">Portfolio progress rate</span>
                              <strong className="text-cyan-400 font-mono">85% On-schedule</strong>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400" style={{ width: "85%" }} />
                            </div>
                          </div>

                          {/* Career related studies */}
                          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1.5">
                            <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Career-related Studies</span>
                            <strong className="text-xs text-white/80 block">Pearson BTEC Level-3</strong>
                            <p className="text-[9px] text-white/40">22 candidates registered. 100% placement alignment verified.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-white/[0.04]">
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider block">Language Development</span>
                            <p className="text-white mt-1">90% completion rate</p>
                          </div>
                          <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04]">
                            <span className="text-[9px] text-white/35 uppercase tracking-wider block">Service Learning</span>
                            <p className="text-white mt-1">94% target hours logged</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dispatched Notices logs (clear language) */}
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

                {/* Right Area: Proactive Context Insights & Substitution demands (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Context Proactive Insights Card */}
                  <div className={`p-6 rounded-3xl border ${cardStyle} space-y-4`}>
                    <div>
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Daily Status</span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">Today&apos;s Attention</h4>
                      <p className="text-[9px] text-white/30 mt-0.5">Daily updates and items requiring attention.</p>
                    </div>

                    <div className="space-y-3">
                      {proactiveInsights.map((ins) => (
                        <div key={ins.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              ins.type === "warning" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              ins.type === "attention" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}>
                              {ins.type}
                            </span>
                          </div>
                          <p className="text-white/80 font-medium leading-tight">{ins.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
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

            {/* ─── TAB 2: STUDENT INTELLIGENCE ─────────────────────────────────── */}
            {activeTab === "students" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <StudentIntelligence
                  theme={theme}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {/* ─── TAB 3: FACULTY INTELLIGENCE ─────────────────────────────────── */}
            {activeTab === "teachers" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <FacultyIntelligence
                  theme={theme}
                  searchQuery={searchQuery}
                  onTriggerSubstitution={handleTriggerSubstitution}
                />
              </motion.div>
            )}

            {/* ─── TAB 4: ACADEMIC SCHEDULING ─────────────────────────────────── */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <AcademicScheduling
                  theme={theme}
                  activeProgramme={activeProgramme}
                />
              </motion.div>
            )}

            {/* ─── TAB 5: SCHOOL MAP ────────────────────────────────────────────── */}
            {activeTab === "map" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <SchoolMap />
              </motion.div>
            )}

            {/* ─── TAB 5B: SCHOOL ANALYTICS ─────────────────────────────────────── */}
            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <SchoolAnalytics
                  theme={theme}
                />
              </motion.div>
            )}

            {/* ─── TAB 6: EVENTS & PROPOSALS ────────────────────────────────────── */}
            {activeTab === "events" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <EventsInitiatives />
              </motion.div>
            )}

            {/* ─── TAB 7: BROADCASTER & ALERTS ───────────────────────────────────── */}
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
                        author: "Dr. Alistair Vance (Director)",
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
                          <option value="Whole School">Entire School</option>
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

            {/* ─── TAB 8: CONSOLE SETTINGS ───────────────────────────────────────── */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <SettingsPanel />
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

    {/* ─── CLICKABLE FACILITY OVERLAY MODALS ─────────────────────────────────────── */}
    <AnimatePresence>
      {activeFacilityModal && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="fixed inset-0" onClick={() => setActiveFacilityModal(null)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-[#0E0E10] border border-white/[0.08] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.9)] z-10 text-white text-left"
          >
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Executive Roster Audit</span>
                <h4 className="text-sm font-bold text-white uppercase mt-0.5">
                  {activeFacilityModal === "infirmary" && "Infirmary Management"}
                  {activeFacilityModal === "cafeteria" && "Cafeteria Operations"}
                  {activeFacilityModal === "sports" && "Sports Complex Dashboard"}
                  {activeFacilityModal === "students" && "Student Presence Monitor"}
                  {activeFacilityModal === "staff" && "Faculty Presence Monitor"}
                  {activeFacilityModal === "rooms" && "Space Density Monitor"}
                  {activeFacilityModal === "maintenance" && "Dispatched Maintenance Board"}
                  {activeFacilityModal === "library" && "Library Media Center Monitor"}
                  {activeFacilityModal === "auditorium" && "Main Auditorium Monitor"}
                  {activeFacilityModal === "admin" && "Administration Executive Block"}
                </h4>
              </div>
              <button
                onClick={() => setActiveFacilityModal(null)}
                className="text-white/40 hover:text-white text-xs font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {/* Students Details */}
            {activeFacilityModal === "students" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Total Present</span>
                    <p className="text-white/80 font-bold mt-0.5">614 / 638 Students</p>
                    <span className="text-[9px] text-emerald-400 block leading-none font-medium">96.2% Attendance Rate</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Active Classes</span>
                    <p className="text-white/85 font-mono font-bold mt-0.5">22 Learning Cohorts</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Programme Splits</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">DP: 178 / 184</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">MYP: 220 / 228</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">CP: 68 / 72</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">PYP: 148 / 154</div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Medical & Pastoral Alerts</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    10:15 AM - Lucas Gray checked into Infirmary.<br/>
                    09:40 AM - Emma Watson checked into Pastoral guidance.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("students"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">View Students</button>
                  <button onClick={() => { alert("Triggering safety verification ping to all classrooms..."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Roster Safety Ping</button>
                </div>
              </div>
            )}

            {/* Staff Details */}
            {activeFacilityModal === "staff" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Total Present</span>
                    <p className="text-white/80 font-bold mt-0.5">44 / 45 Faculty</p>
                    <span className="text-[9px] text-emerald-400 block leading-none font-medium">97.8% On-site Rate</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Pending Substitutions</span>
                    <p className="text-rose-400 font-mono font-bold mt-0.5">1 Cover Needed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Department Roster Distribution</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Math: 9 / 9</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Science: 11 / 12 (1 away)</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Humanities: 6 / 6</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Languages: 5 / 5</div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Active Coverage Alarm</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    Robert Blake is absent today. Grade 12 History Period 3 requires substitution assignment.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("teachers"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">View Teachers</button>
                  <button onClick={() => { alert("Broadcasting open cover offer to available staff..."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Broadcast Cover Request</button>
                </div>
              </div>
            )}

            {/* Rooms Details */}
            {activeFacilityModal === "rooms" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Active Spaces</span>
                    <p className="text-white/80 font-bold mt-0.5">18 / 20 In Use</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">2 spaces out-of-service</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Space Occupancy Density</span>
                    <p className="text-cyan-400 font-mono font-bold mt-0.5">85% Science Wing</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Peak Density Spaces</span>
                  <div className="space-y-1.5">
                    {[
                      { name: "Science Lab 3", count: "34 / 35 seats occupied", status: "near capacity" },
                      { name: "Central Library Study", count: "135 / 150 study desks occupied", status: "peak study hours" }
                    ].map((roomItem, rIdx) => (
                      <div key={rIdx} className="p-2 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-[10px]">
                        <span>{roomItem.name} ({roomItem.count})</span>
                        <span className="text-[8px] text-amber-400 font-bold uppercase">{roomItem.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">System Status Notes</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    HVAC parameters fully calibrated for central academic halls. Science Lab B ventilation upgrade scheduled.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("schedule"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Timetable Controls</button>
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("map"); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Open Campus Map</button>
                </div>
              </div>
            )}

            {/* Maintenance Details */}
            {activeFacilityModal === "maintenance" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Active Jobs</span>
                    <p className="text-white/80 font-bold mt-0.5">2 Dispatched Tasks</p>
                    <span className="text-[9px] text-yellow-400 block leading-none font-medium">1 attention item flagged</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Facility Buffer Priority</span>
                    <p className="text-white/85 font-mono font-bold mt-0.5">Clean Buffer Active</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Job Dispatch Board</span>
                  <div className="space-y-1.5">
                    {[
                      { name: "Science Wing Lab B", task: "Ventilation upgrade & duct checks", status: "in-progress" },
                      { name: "Central Library Hall A", task: "Table configuration & cabling check", status: "dispatched" }
                    ].map((job, jIdx) => (
                      <div key={jIdx} className="p-2 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-[10px]">
                        <div>
                          <strong>{job.name}</strong>
                          <span className="block text-[9px] text-white/40 mt-0.5">{job.task}</span>
                        </div>
                        <span className="text-[8px] text-cyan-400 font-mono uppercase font-bold">{job.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => alert("Simulating facilities hotline call...")} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Call Site Supervisor</button>
                  <button onClick={() => alert("New maintenance ticket composer opened...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Log Work Order</button>
                </div>
              </div>
            )}

            {/* Infirmary Details */}
            {activeFacilityModal === "infirmary" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Today&apos;s Staff</span>
                    <p className="text-white/80 font-bold mt-0.5">Nurse Linda Carter</p>
                    <span className="text-[9px] text-white/40 block leading-none">Head Clinic Nurse</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Clinic Capacity</span>
                    <p className="text-white/85 font-mono font-bold mt-0.5">2 / 6 Beds Occupied (33%)</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Current Students Admitted</span>
                  <div className="space-y-1.5">
                    {[
                      { name: "Lucas Gray", grade: "Grade 11", reason: "Mild fever, under observation since 10:15 AM" },
                      { name: "Priya Sharma", grade: "Grade 8", reason: "Minor scrape, bandaged and resting since 11:30 AM" }
                    ].map((patient, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-xl flex justify-between items-center">
                        <div>
                          <strong className="text-white/90">{patient.name} ({patient.grade})</strong>
                          <p className="text-[9px] text-white/40 font-medium leading-none mt-1">{patient.reason}</p>
                        </div>
                        <span className="text-[8px] text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded uppercase font-bold">Admitted</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Emergency Notes</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">All vaccine logs and medical lockers fully synchronized. No critical alerts active.</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { alert("Simulating phone audio: calling Nurse Linda Carter..."); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl">Call Staff</button>
                  <button onClick={() => { alert("Compose Direct Message panel open."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl">Message Staff</button>
                  <button onClick={() => { alert("Draft notice dialog open."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl">Create Notice</button>
                </div>
              </div>
            )}

            {/* Cafeteria Details */}
            {activeFacilityModal === "cafeteria" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Today&apos;s Lead</span>
                    <p className="text-white/80 font-bold mt-0.5">Chef Ronald Davies</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">Culinary Director</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Current Occupancy</span>
                    <p className="text-white/85 font-mono font-bold mt-0.5">220 / 400 Seated (55% density)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Meal Service Status</span>
                  <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center font-bold">
                    <span className="text-white/70">Lunch transition Phase 2 of 3</span>
                    <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-wider">On-Schedule</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold font-sans">Cafeteria Announcements</span>
                  <p className="text-white/60 bg-[#0A0A0B] p-3 rounded-xl border border-white/[0.03] text-[10px] leading-relaxed">
                    Special menu today: Vegan Taco Bowls, Fresh Salad Bar, Organic Melon Slices. Roster checklists complete.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { alert("Calling Kitchen Supervisor..."); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl">Call</button>
                  <button onClick={() => { alert("Messaging Kitchen staff..."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl">Message</button>
                  <button onClick={() => { alert("Parent broadcast dispatcher loaded."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl">Notify Parents</button>
                </div>
              </div>
            )}

            {/* Sports Complex Details */}
            {activeFacilityModal === "sports" && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  <span className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-black">Live Status</span>
                  <span className="px-2.5 py-1.5 rounded-lg text-white/50">Scheduled Sessions</span>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                  {[
                    {
                      name: "Football Field",
                      status: "Occupied",
                      class: "Grade 11 Sports Science",
                      prog: "DP1",
                      teacher: "Coach Miller",
                      time: "Period 1 (08:30 - 09:30)",
                      next: "09:30",
                      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    },
                    {
                      name: "Gymnasium",
                      status: "Occupied",
                      class: "Grade 12 PE Practical",
                      prog: "DP2",
                      teacher: "Coach Phelps",
                      time: "Period 1 (08:30 - 09:30)",
                      next: "09:30",
                      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    },
                    {
                      name: "Badminton Court",
                      status: "Available",
                      class: "None scheduled",
                      prog: "N/A",
                      teacher: "None",
                      time: "Vacant",
                      next: "Immediately",
                      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    },
                    {
                      name: "Swimming Pool",
                      status: "Occupied",
                      class: "Swim Team Time Trials",
                      prog: "DP1 / DP2",
                      teacher: "Coach Phelps",
                      time: "Period 4 (12:50 - 13:50)",
                      next: "13:50",
                      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    },
                    {
                      name: "Basketball Court",
                      status: "Reserved",
                      class: "Grade 5 PE Class",
                      prog: "PYP",
                      teacher: "Coach Miller",
                      time: "Period 2 (09:30 - 10:30)",
                      next: "10:30",
                      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    },
                    {
                      name: "Multipurpose Hall",
                      status: "Available",
                      class: "None scheduled",
                      prog: "N/A",
                      teacher: "None",
                      time: "Vacant",
                      next: "Immediately",
                      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    },
                    {
                      name: "Dance Studio",
                      status: "Under Maintenance",
                      class: "None scheduled",
                      prog: "N/A",
                      teacher: "None",
                      time: "Floor buffing in progress",
                      next: "Tomorrow 08:00",
                      badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }
                  ].map((fac, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-white text-xs">{fac.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border ${fac.badgeColor}`}>
                          {fac.status}
                        </span>
                      </div>
                      
                      {fac.status !== "Available" && fac.status !== "Under Maintenance" && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-white/50 leading-relaxed font-medium">
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase font-bold">Class & Prog</span>
                            <span className="text-white/80">{fac.class} ({fac.prog})</span>
                          </div>
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase font-bold">Supervisor</span>
                            <span className="text-cyan-400">{fac.teacher}</span>
                          </div>
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase font-bold">Time Booked</span>
                            <span className="text-white/80 font-mono">{fac.time}</span>
                          </div>
                          <div>
                            <span className="text-white/30 block text-[8px] uppercase font-bold">Next Available</span>
                            <span className="text-emerald-400 font-mono font-bold">{fac.next}</span>
                          </div>
                        </div>
                      )}

                      {fac.status === "Available" && (
                        <p className="text-[10px] text-white/40 leading-relaxed">This facility is vacant and available for booking during active periods.</p>
                      )}

                      {fac.status === "Under Maintenance" && (
                        <p className="text-[10px] text-yellow-400/80 leading-relaxed font-semibold">⚠️ {fac.time} · Resumes {fac.next}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-cyan-950/15 border border-cyan-950/50 rounded-2xl space-y-1">
                  <span className="text-[9px] text-cyan-400 uppercase block font-bold">Quick Operations Q&A</span>
                  <div className="space-y-1.5 text-[10px] text-cyan-200/60 leading-tight">
                    <p>• <strong>Which classes have sports today?</strong> DP1 Sports Science, DP2 PE, PYP Grade 5 PE, Swim Team trials.</p>
                    <p>• <strong>Who is using the football field?</strong> Coach Miller supervising DP1 Sports Science.</p>
                    <p>• <strong>What is free this afternoon?</strong> Football Field, Gymnasium, Badminton, Multipurpose Hall.</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { alert("Timetable scheduler loaded for athletic facilities."); setActiveFacilityModal(null); setActiveTab("schedule"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">View Schedule</button>
                  <button onClick={() => { alert("Messaging athletic coaches..."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Message Coaches</button>
                </div>
              </div>
            )}

            {/* Library Details */}
            {activeFacilityModal === "library" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Librarian Lead</span>
                    <p className="text-white/80 font-bold mt-0.5">Linda Carter</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">Head Librarian</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Occupancy Density</span>
                    <p className="text-[#22D3EE] font-mono font-bold mt-0.5">48 / 150 Study Desks (32%)</p>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Current Activity</span>
                  <p className="text-white/80 font-medium">DP Extended Essay Private Study block (G12 students completing rough drafts)</p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Upcoming Scheduling</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    15:30 - Theory of Knowledge (TOK) Exhibition board setups and panels check-in.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => alert("Calling Head Librarian Linda Carter...")} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Call Staff</button>
                  <button onClick={() => alert("Direct chat opened with Librarian Carter...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Message Staff</button>
                  <button onClick={() => alert("Compose direct notice for Library study space...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Create Notice</button>
                </div>
              </div>
            )}

            {/* Auditorium Details */}
            {activeFacilityModal === "auditorium" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Auditorium Director</span>
                    <p className="text-white/80 font-bold mt-0.5">Robert Blake</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">Theater Director</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Seating Occupancy</span>
                    <p className="text-[#22D3EE] font-mono font-bold mt-0.5">24 / 600 Seats (4%)</p>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Current Activity</span>
                  <p className="text-white/80 font-medium">Drama Club Performance Preparation & Sound check sessions.</p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Upcoming Scheduling</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    15:00 - DP Music Concert rehearsing and final logistics check-in.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => alert("Calling Theater Director Robert Blake...")} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Call Staff</button>
                  <button onClick={() => alert("Direct chat opened with Director Blake...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Message Staff</button>
                  <button onClick={() => alert("Compose direct notice for Auditorium space...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Create Notice</button>
                </div>
              </div>
            )}

            {/* Admin Details */}
            {activeFacilityModal === "admin" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Administration Lead</span>
                    <p className="text-white/80 font-bold mt-0.5">Dr. Alistair Vance</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">Head of School</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Occupancy Density</span>
                    <p className="text-[#22D3EE] font-mono font-bold mt-0.5">14 / 30 Seats (46%)</p>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Current Activity</span>
                  <p className="text-white/80 font-medium">Coordinators Board Alignment Briefing (Strategic curriculum mapping)</p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Upcoming Scheduling</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    16:00 - Operations Budget review & 17:00 - Board of Trustees banquet preparations.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => alert("Calling Head of School Dr. Vance...")} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Call Dr. Vance</button>
                  <button onClick={() => alert("Direct chat opened with Dr. Vance...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Message</button>
                  <button onClick={() => alert("Compose direct admin notice for leadership panel...")} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Create Notice</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* ─── SEARCH RESULT: STUDENT DETAIL OVERLAY SHEET ─────────────────────────────────────── */}
    <AnimatePresence>
      {searchSelectedStudent && (
        <div className="fixed inset-0 z-[210] flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchSelectedStudent(null)}
            className="absolute inset-0 bg-black"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="relative w-full max-w-md h-full bg-[#05080E]/95 border-l border-cyan-950/80 p-6 overflow-y-auto flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white text-left z-10"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  Search Profile Telemetry
                </span>
                <button
                  onClick={() => setSearchSelectedStudent(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                <div className="size-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl font-bold text-cyan-400">
                  {searchSelectedStudent.avatar}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black tracking-tight text-cyan-50">{searchSelectedStudent.title}</h3>
                  <p className="text-xs text-cyan-200/60">
                    {searchSelectedStudent.subtitle}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                    IB Student Profile
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Ecosystem Metrics</h4>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Target Segment:</span>
                    <span className="font-bold text-white">{searchSelectedStudent.subtitle.split("·")[0]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Current Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      Present in Class
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Advisor:</span>
                    <span className="font-bold text-white">Aarav Chen</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Active Room:</span>
                    <span className="font-mono text-cyan-400 font-bold">Science Lab 3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex gap-2">
              <button
                onClick={() => {
                  setSearchSelectedStudent(null);
                  setActiveTab("students");
                }}
                className="flex-1 py-2.5 bg-cyan-400 text-black hover:bg-cyan-300 font-bold rounded-xl text-center text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              >
                Inspect in Directory
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* ─── SEARCH RESULT: TEACHER DETAIL OVERLAY SHEET ─────────────────────────────────────── */}
    <AnimatePresence>
      {searchSelectedTeacher && (
        <div className="fixed inset-0 z-[210] flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchSelectedTeacher(null)}
            className="absolute inset-0 bg-black"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="relative w-full max-w-md h-full bg-[#05080E]/95 border-l border-cyan-950/80 p-6 overflow-y-auto flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white text-left z-10"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  Search Faculty Telemetry
                </span>
                <button
                  onClick={() => setSearchSelectedTeacher(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                <div className="size-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl font-bold text-cyan-400">
                  {searchSelectedTeacher.avatar}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black tracking-tight text-cyan-50">{searchSelectedTeacher.title}</h3>
                  <p className="text-xs text-cyan-200/60">
                    {searchSelectedTeacher.subtitle}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                    Faculty Member
                  </span>
                </div>
              </div>

              {/* Highlight Leadership Assignment */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">Leadership Assignment</span>
                  <span className="text-sm font-black text-cyan-100">
                    {searchSelectedTeacher.subtitle.includes("Lead") || searchSelectedTeacher.subtitle.includes("Coordinator") || searchSelectedTeacher.subtitle.includes("Head")
                      ? searchSelectedTeacher.subtitle.split("·")[1] || searchSelectedTeacher.subtitle.split("·")[0]
                      : "Faculty Leader"}
                  </span>
                </div>
                <div className="size-8 rounded-xl bg-cyan-400/15 flex items-center justify-center text-base">👑</div>
              </div>

              <div className="space-y-3 text-xs">
                <h4 className="text-[10px] font-bold text-white/35 uppercase tracking-widest font-sans">Ecosystem Details</h4>
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Department:</span>
                    <span className="font-bold text-white">{searchSelectedTeacher.subtitle.split("·")[0]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Current Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      Available
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Teaching Room:</span>
                    <span className="font-mono text-cyan-400 font-bold">Room 102</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex gap-2">
              <button
                onClick={() => {
                  setSearchSelectedTeacher(null);
                  setActiveTab("teachers");
                }}
                className="flex-1 py-2.5 bg-cyan-400 text-black hover:bg-cyan-300 font-bold rounded-xl text-center text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              >
                Inspect in Directory
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    </div>
  );
}
