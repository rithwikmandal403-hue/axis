"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { StudentIntelligence } from "./student-intelligence";
import { FacultyIntelligence } from "./faculty-intelligence";
import { NavigationItem } from "@/components/school/navigation-item";
import { AcademicScheduling } from "./academic-scheduling";
import { SchoolMap } from "./school-map";
import { EventsInitiatives } from "./events-initiatives";
import { SchoolAnalytics } from "./school-analytics";
import { SettingsPanel } from "./settings-panel";
import { CoordinatorDashboard } from "../requests-reports/coordinator-dashboard";
import { CoordinatorMeetings } from "./coordinator-meetings";
import { CoordinatorAttendance } from "./coordinator-attendance";
import { CoordinatorMessages } from "./coordinator-messages";
import { ClockSystem } from "../teacher-demo/clock-system";
import { SharedDemoHeader } from "../shared-demo-header";
import { type ContextItem } from "../teacher-demo/context-layer";
import { CoordinatorEmail } from "./coordinator-email";
import { ConnectedResourcesWorkspace, ResourcePickerModal } from "./connected-resources";
import { getThemeColors, type Theme, AXIS_TOKENS, getAxisTheme } from "@/lib/theme-utils";

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

type DPWorkflowMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "watch" | "urgent";
};

type FacilityKey = "students" | "staff" | "rooms" | "infirmary" | "cafeteria" | "sports" | "maintenance" | "library" | "auditorium" | "admin";

type SearchItem = {
  id: string;
  type: "Student" | "Teacher" | "Class" | "Department" | "Facility" | "Room" | "Event" | "Announcement" | "Programme" | "Parent" | "Document";
  title: string;
  subtitle: string;
  meta?: string;
  avatar?: string;
  targetTab?: string;
  actionData?: { id?: string; facility?: string };
};

const SEARCH_ITEMS: SearchItem[] = [
  { id: "std-1", type: "Student", title: "Chloe Vance", subtitle: "DP1 · Physics HL · EE History · CAS reflections current", avatar: "CV", targetTab: "students", actionData: { id: "std-1" } },
  { id: "std-2", type: "Student", title: "Lucas Gray", subtitle: "DP1 · Chemistry IA flagged · Infirmary", avatar: "LG", targetTab: "students", actionData: { id: "std-2" } },
  { id: "std-3", type: "Student", title: "Dilan Patel", subtitle: "DP1 · Math AA HL · EE research block in Library", avatar: "DP", targetTab: "students", actionData: { id: "std-3" } },
  { id: "std-4", type: "Student", title: "Emma Watson", subtitle: "DP1 · TOK essay conference · University counseling", avatar: "EW", targetTab: "students", actionData: { id: "std-4" } },
  { id: "std-5", type: "Student", title: "Leo Sterling", subtitle: "Grade 10-C · MYP", avatar: "LS", targetTab: "students", actionData: { id: "std-5" } },
  { id: "std-6", type: "Student", title: "Sophia Alpin", subtitle: "DP2 · Predicted grades submitted · Exam readiness watch", avatar: "SA", targetTab: "students", actionData: { id: "std-6" } },
  { id: "std-7", type: "Student", title: "Marcus Aurelius", subtitle: "Grade 9-B · MYP", avatar: "MA", targetTab: "students", actionData: { id: "std-7" } },

  { id: "tch-1", type: "Teacher", title: "Aarav Chen", subtitle: "IB DP Physics HL · IA moderation · CAS Coordinator · EE Supervisor", avatar: "AC", targetTab: "teachers", actionData: { id: "tch-1" } },
  { id: "tch-2", type: "Teacher", title: "Ananya Rao", subtitle: "IB DP Chemistry HL · IA lab supervisor · Group 4 · EE Supervisor", avatar: "AR", targetTab: "teachers", actionData: { id: "tch-2" } },
  { id: "tch-3", type: "Teacher", title: "Marcus Vance", subtitle: "Mathematics AA HL · Predicted grades moderation · EE Supervisor", avatar: "MV", targetTab: "teachers", actionData: { id: "tch-3" } },
  { id: "tch-4", type: "Teacher", title: "Sarah Chen", subtitle: "IB DP Coordinator · University deadlines · TOK oversight · TOK Advisor", avatar: "SC", targetTab: "teachers", actionData: { id: "tch-4" } },
  { id: "tch-5", type: "Teacher", title: "David Miller", subtitle: "Athletics Coach · MYP Coordinator", avatar: "DM", targetTab: "teachers", actionData: { id: "tch-5" } },
  { id: "tch-6", type: "Teacher", title: "Clara Dupont", subtitle: "Literature Specialist · English Department Lead · EE Supervisor", avatar: "CD", targetTab: "teachers", actionData: { id: "tch-6" } },
  { id: "tch-7", type: "Teacher", title: "Robert Blake", subtitle: "History Teacher · Grade Level Lead · TOK Advisor", avatar: "RB", targetTab: "teachers", actionData: { id: "tch-7" } },

  { id: "cls-1", type: "Class", title: "DP1 Physics HL (Group 4)", subtitle: "Taught by Aarav Chen · IA practicals · Lab 3", targetTab: "schedule" },
  { id: "cls-2", type: "Class", title: "DP2 Physics HL (Group 4)", subtitle: "Taught by Aarav Chen · Paper 2 revision · Lab 3", targetTab: "schedule" },
  { id: "cls-3", type: "Class", title: "DP1 Chemistry SL (Group 4)", subtitle: "Taught by Ananya Rao · IA data collection · Lab 2", targetTab: "schedule" },
  { id: "cls-4", type: "Class", title: "DP2 Chemistry HL (Group 4)", subtitle: "Taught by Ananya Rao · IA final upload · Lab 2", targetTab: "schedule" },
  { id: "cls-5", type: "Class", title: "DP2 Mathematics AA HL (Group 5)", subtitle: "Taught by Marcus Vance · Predicted grade evidence", targetTab: "schedule" },
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
  { id: "evt-2", type: "Event", title: "DP2 Exam Readiness Briefing", subtitle: "15:00 Today · Main Auditorium", targetTab: "events" },
  { id: "evt-3", type: "Event", title: "Varsity Basketball Game", subtitle: "17:00 Today · Gym Hall", targetTab: "events" },
  { id: "evt-4", type: "Event", title: "Executive Board Budget Review", subtitle: "16:00 Today · Boardroom", targetTab: "events" },

  { id: "ann-1", type: "Announcement", title: "Science Lab room assignment adjustments", subtitle: "10 mins ago · Science Department", targetTab: "events" },
  { id: "ann-2", type: "Announcement", title: "IB DP Extended Essay draft checklist deadline", subtitle: "2 hours ago · DP1 Cohort", targetTab: "events" },
  { id: "ann-3", type: "Announcement", title: "Inter-school sports logistics finalized", subtitle: "1 day ago · Whole School", targetTab: "events" },

  { id: "prg-1", type: "Programme", title: "Primary Years Programme (PYP)", subtitle: "Inquiry-based primary curriculum", targetTab: "home" },
  { id: "prg-2", type: "Programme", title: "Middle Years Programme (MYP)", subtitle: "Grades 6-10 curriculum framework", targetTab: "home" },
  { id: "prg-3", type: "Programme", title: "International Baccalaureate Diploma Programme (IB DP)", subtitle: "DP1-DP2: six subject groups, TOK, EE, CAS, IAs, predicted grades, examinations", targetTab: "home" },
  { id: "prg-4", type: "Programme", title: "Career-related Programme (CP)", subtitle: "Vocational and career pathway curriculum", targetTab: "home" },

  { id: "meet-1", type: "Event", title: "TOK Review Meeting", subtitle: "Review TOK exhibition grading criteria and advisor reviews", targetTab: "meetings" },
  { id: "meet-2", type: "Event", title: "EE Supervisor Meeting", subtitle: "Draft feedback progress check and caseload balance audits", targetTab: "meetings" },
  { id: "meet-3", type: "Event", title: "University Guidance Review", subtitle: "Review predicted grade alignment and final transcripts", targetTab: "meetings" },
  { id: "meet-4", type: "Event", title: "CAS Progress Meeting", subtitle: "CAS reflections check and portfolio reviews", targetTab: "meetings" },
  { id: "meet-5", type: "Event", title: "DP Parent Conference", subtitle: "Townhall about IA, predicted grades, and exams", targetTab: "meetings" },
  { id: "meet-6", type: "Event", title: "Exam Coordination Session", subtitle: "IB Exam invigilation setup and storage audit", targetTab: "meetings" },
];

const ALL_SEARCH_ITEMS: SearchItem[] = [
  ...SEARCH_ITEMS,
  { id: "parent-1", type: "Parent", title: "Robert Vance", subtitle: "Father of Chloe Vance", avatar: "RV", targetTab: "students", actionData: { id: "std-1" } },
  { id: "doc-1", type: "Document", title: "EE Coordinator Guide 2026", subtitle: "Extended Essay regulations", avatar: "Doc", targetTab: "settings" }
];

const COORDINATOR_CONTEXT_ITEMS: ContextItem[] = [
  {
    id: "coord-c1",
    type: "coordination",
    title: "EE Coordinator Review Check",
    description: "4 supervisor allocations have unsubmitted comments. Reviews recommended before the IB registration lock.",
    actionLabel: "Verify Submissions",
    meta: "Extended Essay · DP2",
    active: true,
    dateAdded: "Today"
  },
  {
    id: "coord-c2",
    type: "support",
    title: "TOK Exhibition Risk",
    description: "Dilan Patel's TOK exhibition draft is blank. Follow-up meeting scheduled for Period 3.",
    actionLabel: "View Student",
    meta: "TOK Advisory · DP1",
    active: true,
    dateAdded: "Today"
  },
  {
    id: "coord-c3",
    type: "space",
    title: "Displacement Request",
    description: "Aarav Chen requested a temporary room swap for Science Lab 3 during Period 5 practical exam.",
    actionLabel: "Approve Swap",
    meta: "Science Lab 3 · Period 5",
    active: true,
    dateAdded: "Today"
  }
];

type EssentialItem = {
  id: string;
  type: "note" | "screenshot";
  title: string;
  content: string;
  tags: string[];
  date: string;
};

const INITIAL_ESSENTIAL_ITEMS: EssentialItem[] = [
  { id: "es-1", type: "note", title: "Aarav Chen — Parent Follow-up", content: "Mother mentioned concerns about workload balance in TOK and EE. Follow up with advisor by Friday.", tags: ["parent", "follow-up", "DP2"], date: "Today, 9:15 AM" },
  { id: "es-2", type: "screenshot", title: "Attendance Anomaly — Grade 11", content: "Screenshot of attendance drop pattern for DP1 cohort during Period 3 across last 2 weeks.", tags: ["attendance", "DP1"], date: "Yesterday, 2:30 PM" },
  { id: "es-3", type: "note", title: "Budget Reallocation Note", content: "Science dept requested additional 2,400 for lab equipment. Approved pending VP sign-off.", tags: ["budget", "science"], date: "2 days ago" }
];

export function CoordinatorDemoShell() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeProgramme] = useState<AcademicProgramme>("dp");
  const [searchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Connected Resources states
  const [attachedResource, setAttachedResource] = useState<string | null>(null);
  const [isResourcePickerOpen, setIsResourcePickerOpen] = useState(false);
  const [isSpotlightSearchOpen, setIsSpotlightSearchOpen] = useState(false);
  const [isEssentialSpaceOpen, setIsEssentialSpaceOpen] = useState(false);
  const [isEssentialTabVisible, setIsEssentialTabVisible] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [essentialItems, setEssentialItems] = useState<EssentialItem[]>(INITIAL_ESSENTIAL_ITEMS);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(true);
    }, AXIS_TOKENS.sidebar.hoverIntentDelay);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, AXIS_TOKENS.sidebar.collapseDelay);
  };

  const themeColors = getThemeColors(theme);


  const [searchSelectedStudent, setSearchSelectedStudent] = useState<SearchItem | null>(null);
  const [searchSelectedTeacher, setSearchSelectedTeacher] = useState<SearchItem | null>(null);

  // ── Essential Space Handlers ───────────────────────────────────────────────────────────────
  const handleAddNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    const newItem: EssentialItem = {
      id: `es-${Date.now()}`,
      type: "note",
      title: noteTitle.trim() || "Untitled Note",
      content: noteContent.trim(),
      tags: noteTags.split(",").map(t => t.trim()).filter(Boolean),
      date: "Just now"
    };
    setEssentialItems(prev => [newItem, ...prev]);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags("");
  };

  const handleCaptureScreen = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 150);
    const tabLabels: Record<string, string> = {
      home: "Overview Dashboard", students: "Student Directory", attendance: "Attendance Monitor",
      email: "Email Workspace", messaging: "Messages Panel", meetings: "Meetings Schedule",
      schedule: "Programme Schedule", teachers: "Academic Structure", map: "Campus Spaces",
      events: "Calendar & Events", analytics: "Analytics Dashboard", requests: "Requests Panel",
      resources: "Connected Resources", settings: "Settings Panel", announcements: "Announcements"
    };
    const label = tabLabels[activeTab] || "Active View";
    const newItem: EssentialItem = {
      id: `es-cap-${Date.now()}`,
      type: "screenshot",
      title: `Screenshot — ${label}`,
      content: `Captured screen snippet of ${label} at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}.`,
      tags: ["capture", activeTab],
      date: "Just now"
    };
    setEssentialItems(prev => [newItem, ...prev]);
  };

  const handleCopyItem = async (item: EssentialItem) => {
    const text = `${item.title}\n${item.content}\nTags: ${item.tags.join(", ")}`;
    try { await navigator.clipboard.writeText(text); } catch { /* demo */ }
  };

  const handleDownloadItem = (item: EssentialItem) => {
    const text = `${item.title}\n${"\u2500".repeat(40)}\n${item.content}\n\nTags: ${item.tags.join(", ")}\nSaved: ${item.date}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteItem = (id: string) => {
    setEssentialItems(prev => prev.filter(item => item.id !== id));
  };



  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener("axis-navigate-tab", handleNavigateTab);
    return () => {
      window.removeEventListener("axis-navigate-tab", handleNavigateTab);
    };
  }, []);


  // Facility Overlay Modals
  const [activeFacilityModal, setActiveFacilityModal] = useState<FacilityKey | null>(null);

  // Emergency States
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Substitution state
  const [substitutions, setSubstitutions] = useState<SubstitutionNeed[]>([
    { id: "sub-1", absentTeacher: "Robert Blake", classCover: "DP2 History HL Paper 3 revision", period: "Period 3", room: "Room 202", assignedTeacher: null, status: "pending" },
    { id: "sub-2", absentTeacher: "Ananya Rao", classCover: "DP1 Chemistry SL IA data collection", period: "Period 4", room: "Lab 2", assignedTeacher: "Aarav Chen", status: "assigned" },
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
      audience: "DP1 candidates & EE supervisors",
      author: "Sarah Chen (IB DP Coordinator)",
      date: "2 hours ago",
      content: "The Extended Essay rough draft deadline has been extended by 3 days. Supervisors should update RPPF meeting notes and advisor review slots accordingly."
    },
  ]);

  // Sync theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("axis-theme") || "dark";
      setTheme(savedTheme as Theme);
      const handleThemeChange = () => {
        const newTheme = localStorage.getItem("axis-theme") || "dark";
        setTheme(newTheme as Theme);
      };
      window.addEventListener("axis-theme-change", handleThemeChange);
      return () => window.removeEventListener("axis-theme-change", handleThemeChange);
    }
  }, []);

  // Keyboard listeners for Spotlight Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSpotlightSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute live school snapshot statistics
  const telemetry = useMemo(() => {
    const defaultData = {
      roleLabel: "IB DP Coordinator",
      studentsPresent: "178 / 184",
      studentsPresentPct: "96.7% DP attendance",
      teachersPresent: "28 / 29",
      activeClasses: "18 DP Blocks",
      activeMeetings: "7 Supervisor Meetings",
      infirmaryCount: "2 in Infirmary",
      counselorCount: "6 university appointments",
      roomsAffected: "2 IA labs reserved",
      pendingSubstitutions: 1,
      logs: [
        { id: "log-dp-1", time: "10:15 AM", text: "Lucas Gray checked into Infirmary during DP1 Chemistry IA lab block. Supervisor notified.", type: "medical" },
        { id: "log-dp-2", time: "09:40 AM", text: "Emma Watson began university deadline counseling for UCAS personal statement review.", type: "pastoral" },
        { id: "log-dp-3", time: "09:10 AM", text: "Science Lab room change approved for DP Physics HL IA practical: Lab 3 to Lab 4.", type: "operations" },
      ]
    };
    return defaultData;
  }, []);

  const dpWorkflowMetrics: DPWorkflowMetric[] = [
    { label: "TOK", value: "82%", detail: "TOK essay drafts verified; exhibition objects logged", tone: "watch" },
    { label: "Extended Essay", value: "72%", detail: "Rough drafts reviewed; supervisor comments pending", tone: "urgent" },
    { label: "CAS", value: "91%", detail: "CAS reflections and project evidence current", tone: "good" },
    { label: "Internal Assessments", value: "76%", detail: "Group 4 and Group 5 IA moderation underway", tone: "watch" },
    { label: "Predicted Grades", value: "64/88", detail: "DP2 predicted grades submitted for university references", tone: "watch" },
    { label: "Subject Groups", value: "6/6", detail: "Six IB DP subject groups staffed and balanced", tone: "good" },
    { label: "Exam Readiness", value: "88%", detail: "Mock exam access arrangements and invigilation mapped", tone: "good" },
    { label: "University Deadlines", value: "11", detail: "Applications due in the next 14 days", tone: "urgent" },
    { label: "Supervisor Allocation", value: "100%", detail: "EE supervisors assigned; two load-balancing reviews open", tone: "good" },
  ];

  // Context Proactive Insights (Surfacing UI alerts based on curriculum status)
  const proactiveInsights = useMemo(() => {
    return [
      { id: "ins-1", text: "Extended Essay rough draft reviews are lagging: 72% complete against Friday's IB DP checkpoint.", type: "warning" },
      { id: "ins-2", text: "TOK essay conferences need 8 final supervisor notes before the coordinator moderation meeting.", type: "attention" },
      { id: "ins-3", text: "DP2 university deadlines: 11 applications due in the next 14 days; references need predicted grades.", type: "conflict" },
      { id: "ins-4", text: "Internal Assessments overlap with mock exam readiness checks in Group 4 labs this week.", type: "conflict" },
      { id: "ins-5", text: "CAS evidence is strong overall, but 6 DP2 candidates need final reflection sign-off.", type: "warning" }
    ];
  }, []);

  // Timeline events feed
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [
      { id: "ev-dp-1", time: "11:00 AM", title: "Extended Essay supervisor allocation review", meta: "IB DP Office · EE/RPPF notes", urgency: "high" },
      { id: "ev-dp-2", time: "01:30 PM", title: "Predicted grades moderation", meta: "Subject group leads · DP2 evidence", urgency: "medium" },
      { id: "ev-dp-3", time: "03:45 PM", title: "University deadline reference audit", meta: "Counseling Office · UCAS/Common App", urgency: "high" },
    ];
    return events;
  }, []);

  // Grouped spotlight search results
  const spotlightResults = useMemo(() => {
    if (!spotlightQuery.trim()) return null;
    const query = spotlightQuery.toLowerCase().trim();
    const filtered = ALL_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    return {
      students: filtered.filter((item) => item.type === "Student"),
      teachers: filtered.filter((item) => item.type === "Teacher"),
      parents: filtered.filter((item) => item.type === "Parent"),
      facilities: filtered.filter((item) => item.type === "Facility" || item.type === "Room"),
      departments: filtered.filter((item) => item.type === "Department"),
      meetings: filtered.filter((item) => item.type === "Event" || item.type === "Announcement" || item.id.startsWith("meet")),
      documents: filtered.filter((item) => item.type === "Document"),
    };
  }, [spotlightQuery]);

  const handleSelectSearchResult = (item: SearchItem) => {
    setIsSpotlightSearchOpen(false);
    setSpotlightQuery("");
    
    if (item.type === "Student") {
      setActiveTab("students");
      setSelectedStudentId(item.id);
    } else if (item.type === "Teacher") {
      setActiveTab("teachers");
      setSelectedTeacherId(item.id);
    } else if ((item.type === "Facility" || item.type === "Room") && item.actionData?.facility) {
      setActiveTab("map");
      setActiveFacilityModal(item.actionData.facility as FacilityKey);
    } else if (item.type === "Parent") {
      alert(`Parent Profile:\nName: ${item.title}\nRelation: ${item.subtitle}\nHotline: +1 (555) 892-0192\nEmail: robert.vance@axis.edu`);
    } else if (item.type === "Document") {
      alert(`Document Archive:\nTitle: ${item.title}\nType: IB Official Reference\nStatus: Verified\nFile size: 1.4 MB (PDF)`);
    } else {
      if (item.targetTab) {
        setActiveTab(item.targetTab);
      }
    }
  };

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
      title: `Emergency Executive Announcement: ${type.toUpperCase()}`,
      type: "emergency",
      audience: "ALL DP STAKEHOLDERS",
      author: "Dr. Alistair Vance (Director)",
      date: "Just now",
      content: message
    };
    setAnnouncements(prev => [emergencyAnn, ...prev]);
  };

  const themeStyles = getAxisTheme(theme);
  const shellBgClass = themeStyles.bg;
  const cardStyle = themeStyles.cardBg;

  return (
    <div className={`relative flex min-h-screen w-full ${shellBgClass} overflow-hidden antialiased transition-colors duration-500`}>
      
      {/* ─── EMERGENCY BROADCAST BANNER ─────────────────────────────────────────── */}
      {emergencyActive && (
        <div className="fixed top-0 inset-x-0 z-[150] bg-red-600 border-b border-red-500 text-white font-extrabold text-xs uppercase py-3.5 px-6 flex justify-between items-center shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 4.5L20 18.5H4L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.2" r="0.8" fill="currentColor" />
            </svg>
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
        initial={{ width: AXIS_TOKENS.sidebar.collapsedWidth }}
        animate={{ width: isSidebarHovered ? AXIS_TOKENS.sidebar.expandedWidth : AXIS_TOKENS.sidebar.collapsedWidth }}
        transition={AXIS_TOKENS.sidebar.transition}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Brand logo */}
        <div className="flex h-24 items-center px-5">
          <div className="flex items-center gap-4">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-extrabold text-lg shadow-md ${theme === "light" ? "bg-black text-white" : "bg-white text-[#0A0A0B]"}`}>
              A
            </div>
            {isSidebarHovered && (
              <div className="flex flex-col">
                <span className={`text-sm font-semibold tracking-wide uppercase ${themeColors.textPrimary}`}>Axis</span>
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
              sub: "Programme command center",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )
            },
            {
              id: "students",
              label: "Students",
              sub: "Student visibility",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 2.25V4.5m0 11.25V21" />
                </svg>
              )
            },
            {
              id: "attendance",
              label: "Attendance",
              sub: "Attendance insights",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              id: "email",
              label: "Email",
              sub: "Ecosystem updates",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L4.32 8.91A2.25 2.25 0 013.25 6.993V6.75" />
                </svg>
              )
            },
            {
              id: "messaging",
              label: "Messages",
              sub: "Connected communication",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              )
            },
            {
              id: "meetings",
              label: "Meetings",
              sub: "Reviews & planning",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 002.25-2.25h9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )
            },

            {
              id: "schedule",
              label: "Schedule",
              sub: "Programme scheduling",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              id: "teachers",
              label: "Academic Structure",
              sub: "Departments & leadership",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.902 0-5.54-1.088-7.54-2.881.346-1.3.83-2.522 1.435-3.63a3.75 3.75 0 017.153-1.755 4.887 4.887 0 00-2.231 4.17M6.75 7.5a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM19.5 8.25a2.25 2.25 0 120-4.5 2.25 2.25 0 020 4.5z" />
                </svg>
              )
            },
            {
              id: "map",
              label: "Spaces",
              sub: "Campus operations",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6.75V15m-10.5-3h15M3 5.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25z" />
                </svg>
              )
            },
            {
              id: "events",
              label: "Calendar",
              sub: "Events & timelines",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              )
            },
            {
              id: "requests",
              label: "Requests",
              sub: "Support & approvals",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.192-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 01-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              )
            },
            {
              id: "analytics",
              label: "Analytics",
              sub: "Programme insights",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125 1.125 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              )
            },
            {
              id: "resources",
              label: "Connected Resources",
              sub: "Ecosystem document layer",
              icon: (
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                </svg>
              )
            },
            {
              id: "settings",
              label: "Settings",
              sub: "Workspace preferences",
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
                theme={theme}
              />
            );
          })}

          {/* Sidebar Footer Spacer */}
          <div className="flex-1" />
        </nav>

        {/* Footer info */}
        <div className={`border-t px-5 py-4 text-center ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
          {isSidebarHovered ? (
            <div className={`flex flex-col text-[10px] ${theme === "light" ? "text-black/30" : "text-white/30"}`}>
              <span>v0.5.2-alpha</span>
              <span className="font-bold uppercase text-cyan-400 font-mono">Strategic Center</span>
            </div>
          ) : (
            <span className={`text-[9px] font-bold ${theme === "light" ? "text-black/20" : "text-white/20"}`}>L</span>
          )}
        </div>
      </motion.aside>

      {/* ─── MAIN PORT CONTAINER ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col h-screen pl-[72px] overflow-hidden ${emergencyActive ? "pt-[45px]" : ""} ${theme === "light" ? "bg-gray-50" : "bg-[#0A0A0B]"}`}>
        
        {/* Top Header */}
        <SharedDemoHeader
          perspectiveLabel="Diploma Programme Coordinator"
          perspectiveId="coordinator"
          userName="Ms. Sarah Thompson"
          userAvatar="ST"
          dateInfo="Monday, August 28"
          updatesInfo="TOK, EE, CAS, IA and predicted-grade sync verified"
          theme={theme}
          onAdoptClick={() => {
            router.push("/adopt");
          }}
        />



        {/* ─── SCROLLABLE CONTENT VIEWPORT ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-visible p-6 scrollbar-none">
          <AnimatePresence mode="wait">
            
            {/* ─── TAB 1: OVERVIEW COCKPIT ──────────────────────────────────────── */}
            {activeTab === "home" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12 overflow-visible"
              >
                
                {/* Left Area: Snapshot Cards & Programme Details (8 cols) */}
                <div className="lg:col-span-8 space-y-6 overflow-visible relative z-30">
                  
                  {/* Clickable Campus Overview Grid */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-6`}>
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">IB DP Overview</span>
                      <h2 className={`text-lg font-black tracking-tight mt-0.5 ${themeColors.textPrimary}`}>Live Coordinator Dashboard</h2>
                      <p className={`text-[11px] mt-0.5 ${themeColors.textMuted}`}>Use this board to track TOK, Extended Essay, CAS, Internal Assessments, predicted grades, subject groups, exam readiness, university deadlines, and supervisor allocation.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { key: "students", title: "DP Candidates", val: telemetry.studentsPresent, sub: "DP1 and DP2 attendance", color: "text-emerald-400" },
                        { key: "staff", title: "Subject Leads", val: telemetry.teachersPresent, sub: "Supervisors and moderators", color: "text-cyan-400" },
                        { key: "rooms", title: "IA / EE Rooms", val: "18 Spaces", sub: "Labs, library and conference rooms", color: theme === "light" ? "text-black" : "text-white" },
                        { key: "admin", title: "University Reviews", val: "14 / 30", sub: "Counseling and reference slots", color: "text-purple-400" },
                        { key: "infirmary", title: "CAS / Wellbeing", val: telemetry.infirmaryCount, sub: "Reflection and support follow-up", color: "text-amber-400" },
                        { key: "cafeteria", title: "Exam Timetable", val: "DP mock cycle active", sub: "Invigilation and access arrangements", color: "text-indigo-400" },
                        { key: "sports", title: "TOK / CAS Events", val: "3 / 8 Active", sub: "Exhibition, meetings and service", color: "text-cyan-400" },
                        { key: "library", title: "TOK & EE Hub", val: "48 / 150 Seated", sub: "Research, supervision and drafting", color: "text-emerald-400" },
                        { key: "auditorium", title: "Exam Readiness", val: "24 / 600 Seated", sub: "Briefings, mock exams and invigilation", color: "text-blue-400" },
                        { key: "maintenance", title: "Supervisor Allocation", val: "2 Reviews Open", sub: "Load balancing in progress", color: "text-yellow-400" },
                      ].map((stat, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (["infirmary", "cafeteria", "sports", "library", "auditorium", "admin", "students", "staff", "rooms", "maintenance"].includes(stat.key)) {
                              setActiveFacilityModal(stat.key as FacilityKey);
                            } else {
                              alert(`IB DP coordinator audit: ${stat.title} data feed fully calibrated.`);
                            }
                          }}
                          className={`p-3 border rounded-2xl space-y-1 text-left cursor-pointer transition-all outline-none ${theme === "light" ? "bg-black/[0.01] hover:bg-black/[0.03] border-black/[0.04]" : "bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.04]"}`}
                        >
                          <span className={`text-[9px] font-bold uppercase tracking-widest block ${theme === "light" ? "text-black/30" : "text-white/30"}`}>{stat.title}</span>
                          <h4 className={`text-base font-black font-mono ${stat.color}`}>{stat.val}</h4>
                          <span className={`text-[9px] block font-sans leading-tight ${theme === "light" ? "text-black/40" : "text-white/40"}`}>{stat.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-5`}>
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">DP Workflow Snapshot</span>
                      <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${themeColors.textPrimary}`}>Core IB Programme Status</h3>
                      <p className={`text-[11px] mt-0.5 ${themeColors.textMuted}`}>The coordinator view stays anchored to the IB Diploma Programme workflow.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {dpWorkflowMetrics.map((metric) => (
                        <div key={metric.label} className={`p-3 rounded-2xl border ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">{metric.label}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                              metric.tone === "good" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              metric.tone === "urgent" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>{metric.value}</span>
                          </div>
                          <p className={`text-[10px] mt-2 leading-relaxed ${themeColors.textMuted}`}>{metric.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Academic Programme View Reshaped */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-6`}>
                    <div className={`flex justify-between items-start border-b pb-3 ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Academic Programme Sync</span>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${themeColors.textPrimary}`}>
                          {activeProgramme === "pyp" && "PYP Operational Summary"}
                          {activeProgramme === "myp" && "MYP Programme Dashboard"}
                          {activeProgramme === "dp" && "IB Diploma Programme Dashboard"}
                          {activeProgramme === "cp" && "CP Programme Status & Roster"}
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
                          <div className={`p-4 border rounded-2xl space-y-3 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>G5 Exhibition Milestones</span>
                            <div className="flex justify-between text-xs items-center">
                              <span className={theme === "light" ? "text-black/60" : "text-white/60"}>Inquiry Projects Completion</span>
                              <strong className="text-emerald-400 font-mono">86% Done</strong>
                            </div>
                            <div className={`h-2 w-full rounded-full overflow-hidden ${theme === "light" ? "bg-black/5" : "bg-white/5"}`}>
                              <div className="h-full bg-emerald-400" style={{ width: "86%" }} />
                            </div>
                            <div className={`flex justify-between text-[9px] ${theme === "light" ? "text-black/35" : "text-white/35"}`}>
                              <span>24 Student inquiry teams</span>
                              <span>6 Mentors allocated</span>
                            </div>
                          </div>

                          {/* Parent engagement indicators */}
                          <div className={`p-4 border rounded-2xl space-y-2 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Parent Engagement Indicators</span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className={`text-[9px] block leading-tight ${theme === "light" ? "text-black/30" : "text-white/30"}`}>Portal App Syncs</span>
                                <strong className={theme === "light" ? "text-black" : "text-white"}>94% Active</strong>
                              </div>
                              <div>
                                <span className={`text-[9px] block leading-tight ${theme === "light" ? "text-black/30" : "text-white/30"}`}>Meeting Attendance</span>
                                <strong className={theme === "light" ? "text-black" : "text-white"}>98% Verified</strong>
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
                            <div key={idx} className={`p-3 border rounded-xl flex justify-between items-center text-xs ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                              <div>
                                <strong className={theme === "light" ? "text-black/80" : "text-white/80"}>{item.grade}</strong>
                                <p className={`text-[10px] font-medium mt-0.5 ${theme === "light" ? "text-black/40" : "text-white/40"}`}>{item.detail}</p>
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
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Personal Project Dashboard (Completion Rates)</span>
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
                              <div key={idx} className={`p-2.5 border rounded-xl space-y-1.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.03]" : "bg-white/[0.01] border-white/[0.03]"}`}>
                                <div className={`flex justify-between text-[10px] font-sans ${theme === "light" ? "text-black/60" : "text-white/60"}`}>
                                  <span>{stage.label}</span>
                                  <span>{stage.count} ({stage.pct})</span>
                                </div>
                                <div className={`h-1 w-full rounded-full overflow-hidden ${theme === "light" ? "bg-black/5" : "bg-white/5"}`}>
                                  <div className={`h-full ${stage.color}`} style={{ width: stage.width }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t ${theme === "light" ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                          <div className={`p-3 rounded-xl border ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Service as Action</span>
                            <p className={`mt-1 ${theme === "light" ? "text-black" : "text-white"}`}>92% student portfolios active</p>
                          </div>
                          <div className={`p-3 rounded-xl border ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Assessment Status</span>
                            <p className={`mt-1 ${theme === "light" ? "text-black" : "text-white"}`}>84% term sheets verified</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DP MODE RENDERING */}
                    {activeProgramme === "dp" && (
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Extended Essay (EE) Timeline Monitor</span>
                            <span className="text-[9px] text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded font-mono">Attention Flag</span>
                          </div>

                          <div className="space-y-2 font-mono text-xs">
                            {[
                              { label: "Outline Uploaded", count: "94%", width: "94%", color: "bg-cyan-500" },
                              { label: "Rough Draft Checked (Advisor Review)", count: "72%", width: "72%", color: "bg-yellow-500", warning: "Lagging: reviews behind schedule" },
                              { label: "Final Essay Uploaded", count: "48%", width: "48%", color: "bg-rose-500" },
                            ].map((stage, idx) => (
                              <div key={idx} className={`p-3 border rounded-xl space-y-1.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                                <div className={`flex justify-between items-center text-[10px] font-sans ${theme === "light" ? "text-black/70" : "text-white/70"}`}>
                                  <span>{stage.label}</span>
                                  <strong className={theme === "light" ? "text-black" : "text-white"}>{stage.count}</strong>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === "light" ? "bg-black/5" : "bg-white/5"}`}>
                                  <div className={`h-full ${stage.color}`} style={{ width: stage.width }} />
                                </div>
                                {stage.warning && (
                                  <span className="text-[8px] text-yellow-400 font-sans leading-none block">{stage.warning}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold pt-2 border-t ${theme === "light" ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                          <div className={`p-3 rounded-xl border space-y-0.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>TOK Essay Drafts</span>
                            <strong className={theme === "light" ? "text-black" : "text-white"}>82% Verified</strong>
                          </div>
                          <div className={`p-3 rounded-xl border space-y-0.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>CAS Completion</span>
                            <strong className="text-emerald-400">95% (G11) / 89% (G12)</strong>
                          </div>
                          <div className={`p-3 rounded-xl border space-y-0.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Mock Exam readiness</span>
                            <strong className={theme === "light" ? "text-black" : "text-white"}>100% Logistics</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CP MODE RENDERING */}
                    {activeProgramme === "cp" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Reflective Project Health */}
                          <div className={`p-4 border rounded-2xl space-y-2.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Reflective Project</span>
                            <div className="flex justify-between text-xs items-center">
                              <span className={theme === "light" ? "text-black/60" : "text-white/60"}>Portfolio progress rate</span>
                              <strong className="text-cyan-400 font-mono">85% On-schedule</strong>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === "light" ? "bg-black/5" : "bg-white/5"}`}>
                              <div className="h-full bg-cyan-400" style={{ width: "85%" }} />
                            </div>
                          </div>

                          {/* Career related studies */}
                          <div className={`p-4 border rounded-2xl space-y-1.5 ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Career-related Studies</span>
                            <strong className={`text-xs block ${theme === "light" ? "text-black/80" : "text-white/80"}`}>Pearson BTEC Level-3</strong>
                            <p className={`text-[9px] ${theme === "light" ? "text-black/40" : "text-white/40"}`}>22 candidates registered. 100% placement alignment verified.</p>
                          </div>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t ${theme === "light" ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                          <div className={`p-3 rounded-xl border ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Language Development</span>
                            <p className={`mt-1 ${theme === "light" ? "text-black" : "text-white"}`}>90% completion rate</p>
                          </div>
                          <div className={`p-3 rounded-xl border ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <span className={`text-[9px] uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Service Learning</span>
                            <p className={`mt-1 ${theme === "light" ? "text-black" : "text-white"}`}>94% target hours logged</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DP spaces and supervision */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-5 overflow-visible relative z-20`}>
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">IB Spaces & Supervision</span>
                      <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${themeColors.textPrimary}`}>DP room allocation dashboard</h3>
                      <p className={`text-[11px] mt-0.5 ${themeColors.textMuted}`}>Track TOK exhibition setup, Extended Essay supervision rooms, IA labs, and exam readiness spaces.</p>
                    </div>

                    {/* Today's DP supervision blocks */}
                    <div className="space-y-3">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme === "light" ? "text-black/35" : "text-white/35"}`}>Today&apos;s DP supervision blocks</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        {[
                          { class: "TOK Exhibition setup", programme: "DP", supervisor: "Sarah Chen", time: "Period 1-2", location: "Library" },
                          { class: "Extended Essay research", programme: "DP", supervisor: "Aarav Chen", time: "Period 3-4", location: "Research Room" },
                          { class: "DP1 CAS reflection workshop", programme: "DP", supervisor: "Ananya Rao", time: "Period 2-3", location: "Conference Room" },
                          { class: "DP2 Exam readiness briefing", programme: "DP", supervisor: "Marcus Vance", time: "After School", location: "Auditorium" },
                        ].map((session, idx) => (
                          <div key={idx} className={`p-3 border rounded-xl ${theme === "light" ? "bg-black/[0.01] border-black/[0.04]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-semibold ${theme === "light" ? "text-black/90" : "text-white/90"}`}>{session.class}</span>
                              <span className="text-[8px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">{session.programme}</span>
                            </div>
                            <div className={`grid grid-cols-2 gap-2 text-[9px] ${theme === "light" ? "text-black/50" : "text-white/50"}`}>
                              <div>
                                <span className={`block ${theme === "light" ? "text-black/30" : "text-white/30"}`}>Supervisor</span>
                                <span className={theme === "light" ? "text-black/70" : "text-white/70"}>{session.supervisor}</span>
                              </div>
                              <div>
                                <span className={`block ${theme === "light" ? "text-black/30" : "text-white/30"}`}>Time Slot</span>
                                <span className={theme === "light" ? "text-black/70" : "text-white/70"}>{session.time}</span>
                              </div>
                            </div>
                            <div className={`mt-2 pt-2 border-t ${theme === "light" ? "border-black/[0.03]" : "border-white/[0.03]"}`}>
                              <span className={`text-[8px] block ${theme === "light" ? "text-black/30" : "text-white/30"}`}>Location</span>
                              <span className="text-cyan-400 font-medium">{session.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Facility Status Grid */}
                    <div className="space-y-3">
                      <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">IB room status</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] overflow-visible">
                        {[
                          { name: "Library", status: "Occupied", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", class: "TOK Exhibition", programme: "DP", supervisor: "Sarah Chen", time: "Period 1-2", next: "Available after 10:30 AM" },
                          { name: "Science Lab 2", status: "Occupied", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", class: "Chemistry IA", programme: "DP", supervisor: "Ananya Rao", time: "Period 3-4", next: "Available after 12:15 PM" },
                          { name: "Research Room", status: "Available", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", class: null, programme: null, supervisor: null, time: null, next: "Available now" },
                          { name: "Auditorium", status: "Occupied", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", class: "DP2 Exam readiness briefing", programme: "DP", supervisor: "Marcus Vance", time: "After School", next: "Available after 4:30 PM" },
                          { name: "Conference Room", status: "Reserved", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", class: "CAS meeting", programme: "DP", supervisor: "Aarav Chen", time: "Period 5-6", next: "Available after 2:30 PM" },
                          { name: "Exam Hall", status: "Occupied", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", class: "Mock exam seating", programme: "DP", supervisor: "Principal", time: "Period 1", next: "Available after 9:00 AM" },
                          { name: "University Office", status: "Available", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", class: null, programme: null, supervisor: null, time: null, next: "Available now" },
                          { name: "CAS Hub", status: "Under Maintenance", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", class: null, programme: null, supervisor: null, time: null, next: "Expected available: Tomorrow" },
                        ].map((fac, idx) => (
                          <div key={idx} className="group relative p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl hover:bg-white/[0.02] transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white/80 font-medium text-[9px]">{fac.name}</span>
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${fac.bg} ${fac.border} ${fac.color}`}>{fac.status}</span>
                            </div>
                            
                            {/* Hover Details */}
                            <div className="absolute left-0 right-0 bottom-full mb-2 p-3 bg-[#0A0A0B] border border-white/[0.08] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto" style={{ zIndex: 9999999 }}>
                              {fac.class ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                                    <div>
                                      <span className="text-white/30 block">Current Session</span>
                                      <span className="text-white/80">{fac.class}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/30 block">IB Programme</span>
                                      <span className="text-cyan-400">{fac.programme}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/30 block">Supervisor</span>
                                      <span className="text-white/80">{fac.supervisor}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/30 block">Time Slot</span>
                                      <span className="text-white/80">{fac.time}</span>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-white/[0.06]">
                                    <span className="text-white/30 text-[8px] block">Next Availability</span>
                                    <span className="text-emerald-400 font-medium text-[9px]">{fac.next}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-white/30 text-[8px] block">Next Availability</span>
                                  <span className="text-emerald-400 font-medium text-[9px]">{fac.next}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dispatched Notices logs (clear language) */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-4`}>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live DP Workflow Logs</h3>
                      <p className="text-[11px] text-white/35">Real-time IB coordinator feed from supervisors, advisors, and deadline checkpoints.</p>
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
                  
                  {/* Universal Clock */}
                  <ClockSystem />

                  {/* System Safety / Emergency Dispatch Card */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-4`}>
                    <div>
                      <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest block">System Safety</span>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${theme === "light" ? "text-black" : "text-white"}`}>Emergency Control</h4>
                      <p className={`text-[9px] mt-0.5 ${theme === "light" ? "text-black/40" : "text-white/30"}`}>Dispatch emergency protocols and alert all active school consoles instantly.</p>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all animate-pulse flex items-center justify-center gap-2"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 4.5L20 18.5H4L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                          <path d="M12 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <circle cx="12" cy="16.2" r="0.8" fill="currentColor" />
                        </svg>
                        <span>Emergency Alert</span>
                      </button>
                    </div>
                  </div>

                  {/* Context Proactive Insights Card */}
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-4`}>
                    <div>
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Coordinator Attention</span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">Today&apos;s IB DP priorities</h4>
                      <p className="text-[9px] text-white/30 mt-0.5">Daily updates and items requiring coordinator action.</p>
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
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-4`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Today&apos;s High-Priority Timeline</h4>
                      <p className="text-[9px] text-white/30">TOK, EE, CAS, IA, predicted-grade and university checkpoints.</p>
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
                  <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-4`}>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Supervisor Allocation</h4>
                      <p className="text-[9px] text-white/30">Assign cover for IB sessions, labs, conferences, and moderation meetings.</p>
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
                  selectedStudentId={selectedStudentId}
                  onClearSelectedStudent={() => setSelectedStudentId(null)}
                />
              </motion.div>
            )}

            {/* ─── TAB 2.5: ATTENDANCE ─────────────────────────────────────────── */}
            {activeTab === "attendance" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CoordinatorAttendance
                  theme={theme}
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
                  selectedTeacherId={selectedTeacherId}
                  onClearSelectedTeacher={() => setSelectedTeacherId(null)}
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
                <EventsInitiatives theme={theme} />
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
                <div className={`p-6 rounded-2xl border ${cardStyle} shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] space-y-6`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Executive Broadcaster</span>
                    <h3 className="text-base font-bold tracking-tight text-white">Compose DP Notice</h3>
                    <p className="text-xs text-white/40">Select DP cohorts and dispatch TOK, EE, CAS, IA, predicted-grade, or exam-readiness updates.</p>
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
                        content: attachedResource ? `${contentText.value}\n\nAttached Resource: ${attachedResource}` : contentText.value,
                      };
                      setAnnouncements(prev => [newAnn, ...prev]);
                      titleInput.value = "";
                      contentText.value = "";
                      setAttachedResource(null);
                      alert("IB DP notice successfully transmitted to target groups.");
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
                          <option value="DP Grade 11 & 12">DP1 & DP2 candidates</option>
                          <option value="MYP Year 4 & 5">MYP candidates</option>
                          <option value="Faculty Only">Subject leads & supervisors</option>
                          <option value="Parents List">Parents and guardians</option>
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

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-500">Attach Reference Document</label>
                        <button
                          type="button"
                          onClick={() => setIsResourcePickerOpen(true)}
                          className="text-[10px] font-extrabold text-cyan-400 hover:underline"
                        >
                          + Choose From Connected Resources
                        </button>
                      </div>
                      {attachedResource ? (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 text-xs font-bold w-fit">
                          <span>📄 {attachedResource}</span>
                          <button
                            type="button"
                            onClick={() => setAttachedResource(null)}
                            className="text-white/40 hover:text-red-400 font-extrabold"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/30 italic">No resource files linked</span>
                      )}
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

            {/* ─── TAB 8: REQUESTS & REPORTS ─────────────────────────────────────── */}
            {activeTab === "requests" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CoordinatorDashboard theme={theme} />
              </motion.div>
            )}

            {/* ─── TAB 9: MEETINGS ────────────────────────────────────────────────── */}
            {activeTab === "meetings" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CoordinatorMeetings theme={theme} />
              </motion.div>
            )}

            {/* ─── TAB 10: MESSAGING ───────────────────────────────────────────────── */}
            {activeTab === "messaging" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CoordinatorMessages
                  theme={theme}
                />
              </motion.div>
            )}

            {/* ─── TAB 10.5: EMAIL ───────────────────────────────────────────────── */}
            {activeTab === "email" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CoordinatorEmail theme={theme} />
              </motion.div>
            )}



            {/* ─── TAB 10.7: CONNECTED RESOURCES ───────────────────────────────────── */}
            {activeTab === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-6xl mx-auto w-full"
              >
                <ConnectedResourcesWorkspace theme={theme} />
              </motion.div>
            )}

            {/* ─── TAB 11: CONSOLE SETTINGS ───────────────────────────────────────── */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-4xl mx-auto"
              >
                <SettingsPanel theme={theme} />
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
              className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0E0E10]/95 p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-white space-y-5 text-left z-10"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                <svg className="size-6 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 4.5L20 18.5H4L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M12 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16.2" r="0.8" fill="currentColor" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">Critical Emergency dispatcher</h3>
                  <p className="text-[9px] text-white/35">Dispatch priority alarms across all DP networks and campus teams.</p>
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
            className="relative bg-[#0E0E10] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.9)] z-10 text-white text-left"
          >
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-3">
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">Executive Roster Audit</span>
                <h4 className="text-sm font-bold text-white uppercase mt-0.5">
                  {activeFacilityModal === "infirmary" && "Wellbeing and Support"}
                  {activeFacilityModal === "cafeteria" && "Meal Service Operations"}
                  {activeFacilityModal === "sports" && "IB Spaces Dashboard"}
                  {activeFacilityModal === "students" && "DP Candidate Monitor"}
                  {activeFacilityModal === "staff" && "Subject Lead Monitor"}
                  {activeFacilityModal === "rooms" && "Room Allocation Monitor"}
                  {activeFacilityModal === "maintenance" && "Dispatched Work Orders"}
                  {activeFacilityModal === "library" && "TOK and EE Research Hub"}
                  {activeFacilityModal === "auditorium" && "Exam and Assembly Hall"}
                  {activeFacilityModal === "admin" && "Coordinator Office Block"}
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
                  <p className="text-white/80 font-bold mt-0.5">178 / 184 DP candidates</p>
                    <span className="text-[9px] text-emerald-400 block leading-none font-medium">96.7% DP attendance</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Active Classes</span>
                    <p className="text-white/85 font-mono font-bold mt-0.5">6 Subject Groups + core</p>
                  </div>
                </div>

                <div className="space-y-2">
                    <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">IB cohort splits</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">DP: 178 / 184</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">MYP: 220 / 228</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">CP: 68 / 72</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">PYP: 148 / 154</div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Wellbeing and pastoral alerts</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    10:15 AM - Lucas Gray checked into the infirmary during Chemistry IA.<br/>
                    09:40 AM - Emma Watson checked into university counseling for predicted grades.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("students"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">View DP Candidates</button>
                  <button onClick={() => { alert("Triggering safety verification ping to all DP sessions..."); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Roster Safety Ping</button>
                </div>
              </div>
            )}

            {/* Staff Details */}
            {activeFacilityModal === "staff" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Total Present</span>
                    <p className="text-white/80 font-bold mt-0.5">28 / 29 Subject leads</p>
                    <span className="text-[9px] text-emerald-400 block leading-none font-medium">97.8% On-site Rate</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Pending Substitutions</span>
                    <p className="text-rose-400 font-mono font-bold mt-0.5">1 Supervisor Cover Needed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Subject group roster distribution</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Group 1: 6 / 6</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Group 2: 5 / 5</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Group 3: 4 / 4</div>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">Group 4: 6 / 6</div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-1">
                  <span className="text-[8px] text-white/35 uppercase block font-bold">Active Coverage Alarm</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">
                    Robert Blake is absent today. DP2 History HL Period 3 requires supervisor reassignment.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("teachers"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">View Subject Leads</button>
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
                    <p className="text-white/80 font-bold mt-0.5">12 / 14 In Use</p>
                    <span className="text-[9px] text-white/40 block leading-none font-medium">2 research rooms reserved</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/30 uppercase block font-bold">Room occupancy density</span>
                    <p className="text-cyan-400 font-mono font-bold mt-0.5">85% DP spaces</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Peak density spaces</span>
                  <div className="space-y-1.5">
                    {[
                      { name: "Science Lab 3", count: "34 / 35 seats occupied", status: "IA lab" },
                      { name: "Central Library Study", count: "135 / 150 study desks occupied", status: "EE research" }
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
                    HVAC parameters fully calibrated for DP exam halls. Science Lab B ventilation upgrade scheduled.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("schedule"); }} className="flex-1 py-2 bg-cyan-500 text-black font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Timetable Controls</button>
                  <button onClick={() => { setActiveFacilityModal(null); setActiveTab("map"); }} className="flex-1 py-2 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl text-center">Open IB Spaces</button>
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
                <div className="size-8 rounded-xl bg-cyan-400/15 flex items-center justify-center text-base text-cyan-400">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 17h12l-1-7-3 3-2-5-2 5-3-3-1 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
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

    {/* Floating Axis Search */}
    <div className="fixed bottom-6 right-6 z-[45] flex items-center">
      <button
        onClick={() => setIsSpotlightSearchOpen(true)}
        className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full border shadow-[0_12px_48px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_12px_48px_-8px_rgba(6,182,212,0.15)] ${
          theme === "light"
            ? "bg-white/90 border-black/10 text-black hover:border-black/20"
            : "bg-[#0E0E10]/95 border-white/10 text-white hover:border-cyan-500/25"
        }`}
      >
        <svg className="size-3.5 text-cyan-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M16 16L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-xs font-semibold tracking-tight" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>Axis Search</span>
        <kbd className={`hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border px-1.5 font-mono text-[9px] font-medium shadow-[0_1px_0_1px] transition-all ${
          theme === "light"
            ? "border-black/15 bg-black/[0.04] text-black/45 shadow-black/[0.06]"
            : "border-white/15 bg-white/[0.04] text-white/35 shadow-white/[0.03]"
        }`}>
          ⌘K
        </kbd>
      </button>
    </div>

    {/* Essential Space — Edge Trigger Zone */}
    <div
      className="fixed right-0 top-0 bottom-0 w-3 z-[40]"
      onMouseEnter={() => setIsEssentialTabVisible(true)}
    />

    {/* Essential Space — Slim Tab */}
    <AnimatePresence>
      {isEssentialTabVisible && !isEssentialSpaceOpen && (
        <motion.button
          initial={{ x: 28 }}
          animate={{ x: 0 }}
          exit={{ x: 28 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onMouseLeave={() => setIsEssentialTabVisible(false)}
          onClick={() => { setIsEssentialSpaceOpen(true); setIsEssentialTabVisible(false); }}
          className={`fixed right-0 top-1/2 -translate-y-1/2 z-[41] w-7 h-32 rounded-l-xl border-y border-l flex flex-col items-center justify-center gap-2 transition-colors ${
            theme === "light"
              ? "bg-white/90 border-black/10 hover:bg-white text-black/50 hover:text-black shadow-[-4px_0_20px_rgba(0,0,0,0.08)]"
              : "bg-[#0E0E10]/95 border-white/10 hover:border-cyan-500/30 text-white/40 hover:text-white shadow-[-4px_0_20px_rgba(0,0,0,0.5)]"
          }`}
        >
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[7px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 select-none">Tray</span>
        </motion.button>
      )}
    </AnimatePresence>

    {/* Essential Space — Slide-Out Tray */}
    <AnimatePresence>
      {isEssentialSpaceOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEssentialSpaceOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className={`fixed right-0 top-0 bottom-0 z-[110] w-80 sm:w-96 border-l shadow-[-16px_0_64px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col ${
              theme === "light"
                ? "bg-white/95 border-black/10 text-black"
                : "bg-[#0A0A0C]/95 border-white/[0.08] text-white"
            }`}
          >
            {/* Tray Header */}
            <div className={`flex items-center justify-between p-5 pb-4 border-b shrink-0 ${
              theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"
            }`}>
              <div>
                <h3 className={`text-sm font-semibold tracking-tight ${theme === "light" ? "text-black" : "text-white/95"}`}>Essential Space</h3>
                <p className={`text-[10px] mt-0.5 ${theme === "light" ? "text-black/40" : "text-white/35"}`}>Personal tray &middot; drag items anywhere</p>
              </div>
              <button
                onClick={() => setIsEssentialSpaceOpen(false)}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "light" ? "hover:bg-black/5 text-black/40 hover:text-black" : "hover:bg-white/[0.06] text-white/35 hover:text-white"
                }`}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Note Form */}
            <div className={`p-5 space-y-3 border-b shrink-0 ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
              <span className={`text-[9px] font-bold uppercase tracking-widest block ${theme === "light" ? "text-black/35" : "text-white/30"}`}>Quick Note</span>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Title"
                className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition-all ${
                  theme === "light"
                    ? "bg-black/[0.02] border-black/[0.08] text-black placeholder:text-black/30 focus:border-black/20"
                    : "bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/15"
                }`}
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Short note..."
                rows={2}
                className={`w-full rounded-lg border px-3 py-2 text-xs outline-none resize-none transition-all ${
                  theme === "light"
                    ? "bg-black/[0.02] border-black/[0.08] text-black placeholder:text-black/30 focus:border-black/20"
                    : "bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/15"
                }`}
              />
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className={`w-full rounded-lg border px-3 py-2 text-[10px] outline-none transition-all ${
                  theme === "light"
                    ? "bg-black/[0.02] border-black/[0.08] text-black placeholder:text-black/30 focus:border-black/20"
                    : "bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/25 focus:border-white/15"
                }`}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    theme === "light" ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Save Note
                </button>
                <button
                  onClick={handleCaptureScreen}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-semibold transition-all ${
                    theme === "light"
                      ? "border-black/10 text-black/60 hover:bg-black/[0.03] hover:text-black"
                      : "border-white/[0.08] text-white/50 hover:bg-white/[0.04] hover:text-white"
                  }`}
                  title="Capture Screen Snippet"
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Saved Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 scrollbar-none">
              {essentialItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${theme === "light" ? "bg-black/[0.03]" : "bg-white/[0.03]"}`}>
                    <svg className={`size-5 ${theme === "light" ? "text-black/15" : "text-white/15"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <p className={`text-[10px] ${theme === "light" ? "text-black/25" : "text-white/25"}`}>Your tray is empty</p>
                  <p className={`text-[9px] mt-1 ${theme === "light" ? "text-black/15" : "text-white/15"}`}>Save notes or capture snippets above</p>
                </div>
              ) : (
                essentialItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.title + "\n" + item.content);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className={`group rounded-xl border p-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      theme === "light"
                        ? "bg-black/[0.01] border-black/[0.06] hover:border-black/[0.12] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                        : "bg-white/[0.01] border-white/[0.05] hover:border-white/[0.12] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 size-6 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === "screenshot" ? "bg-violet-500/10 text-violet-400" : "bg-cyan-500/10 text-cyan-400"
                      }`}>
                        {item.type === "screenshot" ? (
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                        ) : (
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${item.type === "screenshot" ? "text-violet-400/70" : "text-cyan-400/70"}`}>{item.type === "screenshot" ? "Screen Capture" : "Quick Note"}</span>
                        <p className={`text-[11px] font-semibold leading-snug mt-0.5 ${theme === "light" ? "text-black/85" : "text-white/85"}`}>{item.title}</p>
                        <p className={`text-[10px] leading-relaxed mt-1 line-clamp-2 ${theme === "light" ? "text-black/45" : "text-white/40"}`}>{item.content}</p>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${theme === "light" ? "bg-black/[0.04] text-black/40" : "bg-white/[0.04] text-white/30"}`}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center justify-between mt-2.5 pt-2 border-t border-dashed ${theme === "light" ? "border-black/[0.05]" : "border-white/[0.04]"}`}>
                      <span className={`text-[8px] ${theme === "light" ? "text-black/25" : "text-white/20"}`}>{item.date}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopyItem(item)} className={`p-1 rounded transition-all ${theme === "light" ? "hover:bg-black/5 text-black/30 hover:text-black" : "hover:bg-white/[0.06] text-white/25 hover:text-white"}`} title="Copy">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                        </button>
                        <button onClick={() => handleDownloadItem(item)} className={`p-1 rounded transition-all ${theme === "light" ? "hover:bg-black/5 text-black/30 hover:text-black" : "hover:bg-white/[0.06] text-white/25 hover:text-white"}`} title="Download">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-1 rounded transition-all hover:bg-rose-500/10 text-rose-400/40 hover:text-rose-400" title="Delete">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Screen Flash Overlay */}
    <AnimatePresence>
      {flashActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="fixed inset-0 z-[999] bg-white pointer-events-none"
        />
      )}
    </AnimatePresence>

    {/* Spotlight Search Modal */}
    <AnimatePresence>
      {isSpotlightSearchOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsSpotlightSearchOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full max-w-2xl rounded-2xl border p-5 shadow-[0_24px_64px_rgba(0,0,0,0.7)] text-left z-10 flex flex-col max-h-[70vh] overflow-hidden ${
              theme === "light"
                ? "bg-white border-black/10 text-black"
                : "bg-[#0E0E10]/95 border-white/10 text-white"
            }`}
          >
            {/* Spotlight Input */}
            <div className={`relative flex items-center gap-3 pb-4 border-b ${
              theme === "light" ? "border-black/10" : "border-white/10"
            }`}>
              <svg className={`size-5 ${theme === "light" ? "text-black/45" : "text-white/45"}`} viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="M16 16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search everything (students, teachers, parents, rooms, calendar events, requests, documents...)"
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                className={`w-full bg-transparent border-none outline-none text-sm ${
                  theme === "light" ? "text-black placeholder-black/35" : "text-white placeholder-white/30"
                }`}
                autoFocus
              />
              <kbd className={`hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium ${
                theme === "light" ? "border-black/20 bg-black/5 text-black/50" : "border-white/20 bg-white/5 text-white/40"
              }`}>
                ESC
              </kbd>
            </div>

            {/* Results Container */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-5 scrollbar-none">
              {spotlightResults === null ? (
                /* Suggested items state when empty */
                <div className="space-y-4 py-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${theme === "light" ? "text-black/40" : "text-white/30"}`}>
                    Suggested Searches & Quick Tools
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: "Theory of Knowledge (TOK) Exhibition", sub: "View DP1 milestone schedule", icon: "evt-1" },
                      { title: "Extended Essay Coordinator Guide", sub: "Read IB EE regulations 2026", icon: "doc-1" },
                      { title: "Science Lab 3 Practical", sub: "View room allocation monitor", icon: "fac-9" },
                      { title: "Ms. Sarah Thompson Profile", sub: "Coordinator workspace preferences", icon: "tch-4" },
                    ].map((item, idx) => {
                      const target = ALL_SEARCH_ITEMS.find((i) => i.id === item.icon);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (target) handleSelectSearchResult(target);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                            theme === "light"
                              ? "bg-black/[0.01] border-black/[0.05] hover:bg-black/[0.03] text-black"
                              : "bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03] text-white"
                          }`}
                        >
                          <div className="mt-0.5 size-7 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-500 font-bold shrink-0">
                            ★
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{item.title}</span>
                            <span className={`text-[10px] block mt-0.5 ${theme === "light" ? "text-black/50" : "text-white/40"}`}>{item.sub}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Grouped search results */
                <div className="space-y-4">
                  {[
                    { key: "students", label: "Students" },
                    { key: "teachers", label: "Teachers" },
                    { key: "parents", label: "Parents" },
                    { key: "facilities", label: "Rooms & Facilities" },
                    { key: "departments", label: "Departments" },
                    { key: "meetings", label: "Meetings & Events" },
                    { key: "documents", label: "Documents" },
                  ].map((group) => {
                    const groupItems = spotlightResults ? (spotlightResults as Record<string, SearchItem[]>)[group.key] || [] : [];
                    if (groupItems.length === 0) return null;
                    return (
                      <div key={group.key} className="space-y-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${theme === "light" ? "text-black/40" : "text-white/30"}`}>
                          {group.label}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {groupItems.map((item: SearchItem) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                theme === "light"
                                  ? "bg-black/[0.01] border-black/[0.04] hover:border-cyan-500/30 hover:bg-cyan-500/5 text-black"
                                  : "bg-white/[0.01] border-white/[0.04] hover:border-cyan-500/30 hover:bg-cyan-500/5 text-white"
                              }`}
                            >
                              {item.avatar ? (
                                <div className="size-7 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-[10px] text-cyan-500 shrink-0">
                                  {item.avatar}
                                </div>
                              ) : (
                                <div className={`size-7 rounded border flex items-center justify-center text-xs shrink-0 ${
                                  theme === "light" ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"
                                }`}>
                                  📄
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-xs font-bold block truncate">{item.title}</span>
                                <span className={`text-[10px] block truncate ${theme === "light" ? "text-black/50" : "text-white/40"}`}>
                                  {item.subtitle}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {spotlightResults && Object.values(spotlightResults as Record<string, SearchItem[]>).every((arr) => arr.length === 0) && (
                    <div className={`py-12 text-center text-xs ${theme === "light" ? "text-black/40" : "text-white/40"}`}>
                      No results match your search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Cinematic ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            theme === "light"
              ? "radial-gradient(circle 900px at 50% -200px, rgba(0,0,0,0.015) 0%, transparent 80%)"
              : "radial-gradient(circle 900px at 50% -200px, rgba(255,255,255,0.035) 0%, transparent 80%)",
        }}
      />

      {/* Global CSS style overrides for complete theme standardization */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rounded-3xl { border-radius: 1rem !important; } /* Standardize card radius to 16px (rounded-2xl) */
      ` }} />
      {theme === "light" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #0f1115 !important; }
          .text-white\\/95 { color: #0f1115 !important; }
          .text-white\\/90 { color: #1f2937 !important; }
          .text-white\\/85 { color: #1f2937 !important; }
          .text-white\\/80 { color: #374151 !important; }
          .text-white\\/75 { color: #374151 !important; }
          .text-white\\/70 { color: #4b5563 !important; }
          .text-white\\/65 { color: #4b5563 !important; }
          .text-white\\/60 { color: #4b5563 !important; }
          .text-white\\/55 { color: #4b5563 !important; }
          .text-white\\/50 { color: #6b7280 !important; }
          .text-white\\/45 { color: #6b7280 !important; }
          .text-white\\/40 { color: #71717a !important; }
          .text-white\\/35 { color: #71717a !important; }
          .text-white\\/30 { color: #8e8e93 !important; }
          .text-white\\/25 { color: #a1a1aa !important; }
          .text-white\\/20 { color: #b1b1b6 !important; }
          .text-white\\/15 { color: #c1c1c6 !important; }
          .text-white\\/10 { color: #d1d1d6 !important; }
          .text-white\\/5 { color: #e5e5ea !important; }
          .text-slate-100 { color: #0f1115 !important; }
          .text-zinc-100 { color: #0f1115 !important; }
          .text-gray-100 { color: #0f1115 !important; }
          .text-neutral-100 { color: #0f1115 !important; }
          .text-slate-200 { color: #1f2937 !important; }
          .text-zinc-200 { color: #1f2937 !important; }
          .text-gray-200 { color: #1f2937 !important; }
          .text-slate-300 { color: #374151 !important; }
          .text-zinc-300 { color: #374151 !important; }
          .text-gray-300 { color: #374151 !important; }
          .border-white\\/\\[0\\.04\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.05\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.06\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.08\\] { border-color: rgba(0, 0, 0, 0.12) !important; }
          .border-white\\/10 { border-color: rgba(0, 0, 0, 0.12) !important; }
          .border-white\\/15 { border-color: rgba(0, 0, 0, 0.16) !important; }
          .border-white\\/20 { border-color: rgba(0, 0, 0, 0.18) !important; }
          .bg-white\\/\\[0\\.01\\] { background-color: rgba(0, 0, 0, 0.015) !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: rgba(0, 0, 0, 0.02) !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: rgba(0, 0, 0, 0.03) !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/10 { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/15 { background-color: rgba(0, 0, 0, 0.08) !important; }
          .bg-black\\/40 { background-color: rgba(0, 0, 0, 0.05) !important; }
          .bg-black\\/35 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.03) !important; }
          .bg-black\\/10 { background-color: rgba(0, 0, 0, 0.02) !important; }
          .bg-black\\/\\[0\\.15\\] { background-color: rgba(0, 0, 0, 0.05) !important; }
          .bg-\\[\\#0C0C0E\\]\\/30 { background-color: #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #f9fafb !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #f3f4f6 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #f9fafb !important; }
          .bg-\\[\\#0A0A0C\\] { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\]\\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
          .bg-\\[\\#0A0A0B\\]\\/85 { background-color: rgba(255, 255, 255, 0.85) !important; }
          .bg-\\[\\#0C0C0E\\] { background-color: #ffffff !important; }
          .bg-\\[\\#08080A\\] { background-color: #ffffff !important; }
          .border-white\\/5 { border-color: rgba(0, 0, 0, 0.06) !important; }
          .border-white\\/10 { border-color: rgba(0, 0, 0, 0.08) !important; }
          .from-white\\/\\[0\\.04\\] { --tw-gradient-from: rgba(0, 0, 0, 0.02) !important; --tw-gradient-to: rgba(0, 0, 0, 0) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
          .to-white\\/\\[0\\.01\\] { --tw-gradient-to: rgba(0, 0, 0, 0.005) !important; }
          .hover\\:text-white:hover { color: #0f1115 !important; }
          .hover\\:text-white\\/80:hover { color: #1f2937 !important; }
          .hover\\:bg-white\\/\\[0\\.04\\]:hover { background-color: rgba(0, 0, 0, 0.05) !important; }
          .hover\\:bg-white\\/\\[0\\.02\\]:hover { background-color: rgba(0, 0, 0, 0.03) !important; }
          .hover\\:border-white\\/20:hover { border-color: rgba(0, 0, 0, 0.15) !important; }
          .hover\\:border-white\\/\\[0\\.08\\]:hover { border-color: rgba(0, 0, 0, 0.12) !important; }
          ::placeholder { color: #6b7280 !important; }
          .placeholder-white\\/20::placeholder { color: #6b7280 !important; opacity: 1 !important; }
          select option { background-color: #ffffff !important; color: #0f1115 !important; }
          
          /* Custom layout overrides for missing backgrounds in Light Theme */
          .bg-zinc-950 { background-color: #ffffff !important; }
          .bg-zinc-900 { background-color: #ffffff !important; }
          .bg-zinc-950\\/80 { background-color: rgba(255, 255, 255, 0.8) !important; }
          .bg-zinc-900\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
          .bg-cyan-950\\/10 { background-color: rgba(6, 182, 212, 0.05) !important; }
          .bg-\\[\\#0E0E10\\]\\/40 { background-color: rgba(255, 255, 255, 0.4) !important; }
          .bg-\\[\\#0A0A0C\\]\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
          .bg-\\[\\#0C0D10\\]\\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
          
          /* Custom hover states overrides under Light Theme */
          .hover\\:bg-white\\/5:hover { background-color: rgba(0, 0, 0, 0.04) !important; }
          .hover\\:bg-white\\/10:hover { background-color: rgba(0, 0, 0, 0.08) !important; }
          .hover\\:bg-white\\/20:hover { background-color: rgba(0, 0, 0, 0.15) !important; }
          .hover\\:bg-white\\/\\[0\\.06\\]:hover { background-color: rgba(0, 0, 0, 0.06) !important; }
          .hover\\:bg-white\\/\\[0\\.08\\]:hover { background-color: rgba(0, 0, 0, 0.08) !important; }
          
          /* Soft light shadows mapping for premium card visual consistency */
          [class*="shadow-\\[0_12px_64px"] { box-shadow: 0 12px 48px -12px rgba(0,0,0,0.08) !important; }
          [class*="shadow-\\[0_24px_80px"] { box-shadow: 0 20px 40px -15px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_8px_32px"] { box-shadow: 0 8px 24px -8px rgba(0,0,0,0.05) !important; }
          [class*="shadow-\\[0_12px_48px"] { box-shadow: 0 12px 36px -10px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_24px_64px"] { box-shadow: 0 16px 48px -12px rgba(0,0,0,0.07) !important; }
          [class*="shadow-\\[0_16px_48px"] { box-shadow: 0 16px 36px -12px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_12px_36px"] { box-shadow: 0 12px 28px -10px rgba(0,0,0,0.05) !important; }
        ` }} />
      )}
      {theme === "high-contrast" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #f4f4f5 !important; }
          .text-white\\/90 { color: #e4e4e7 !important; }
          .text-white\\/80 { color: #d4d4d8 !important; }
          .text-white\\/70 { color: #a1a1aa !important; }
          .text-white\\/60 { color: #a1a1aa !important; }
          .text-white\\/50 { color: #71717a !important; }
          .text-white\\/45 { color: #71717a !important; }
          .text-white\\/40 { color: #52525b !important; }
          .text-white\\/35 { color: #52525b !important; }
          .text-white\\/30 { color: #3f3f46 !important; }
          .text-white\\/20 { color: #27272a !important; }
          .text-white\\/10 { color: #18181b !important; }
          
          /* Forced high contrast borders (fully white/light) */
          .border-white\\/\\[0\\.04\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.05\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.06\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.08\\] { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/5 { border-color: #a1a1aa !important; border-width: 1px !important; }
          .border-white\\/10 { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/15 { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/20 { border-color: #ffffff !important; border-width: 1.5px !important; }
          
          /* High contrast dark canvas elements */
          .bg-white\\/\\[0\\.01\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: #000000 !important; }
          .bg-white\\/10 { background-color: #000000 !important; border: 1.5px solid #ffffff !important; }
          .bg-white\\/15 { background-color: #000000 !important; border: 1.5px solid #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #000000 !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #000000 !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #000000 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\]\\/95 { background-color: #000000 !important; }
          .bg-\\[\\#0A0A0B\\]\\/85 { background-color: #000000 !important; }
          
          select option { background-color: #000000 !important; color: #ffffff !important; }
        ` }} />
      )}
      {theme === "axis" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #f3f4f6 !important; }
          .border-white\\/\\[0\\.04\\] { border-color: rgba(6, 182, 212, 0.15) !important; }
          .border-white\\/\\[0\\.05\\] { border-color: rgba(6, 182, 212, 0.2) !important; }
          .border-white\\/\\[0\\.06\\] { border-color: rgba(6, 182, 212, 0.25) !important; }
          .border-white\\/\\[0\\.08\\] { border-color: rgba(6, 182, 212, 0.3) !important; }
          .border-white\\/10 { border-color: rgba(6, 182, 212, 0.35) !important; }
          .border-white\\/15 { border-color: rgba(139, 92, 246, 0.4) !important; }
          .bg-white\\/\\[0\\.01\\] { background-color: rgba(6, 182, 212, 0.01) !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: rgba(6, 182, 212, 0.02) !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: rgba(6, 182, 212, 0.03) !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: rgba(6, 182, 212, 0.04) !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: rgba(6, 182, 212, 0.05) !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: rgba(6, 182, 212, 0.08) !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #0b0c0f !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #0f1115 !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #0c0d10 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #0f1115 !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #0c0d10 !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #0b0c0f !important; }
          .bg-white { background-color: #22d3ee !important; color: #000000 !important; }
          .border-white\\/5 { border-color: rgba(6, 182, 212, 0.15) !important; }
          .border-white\\/10 { border-color: rgba(6, 182, 212, 0.25) !important; }
          select option { background-color: #0c0d10 !important; color: #f3f4f6 !important; }
        ` }} />
      )}

      {/* Resource Picker Modal Component */}
      <ResourcePickerModal
        isOpen={isResourcePickerOpen}
        onClose={() => setIsResourcePickerOpen(false)}
        onSelect={(doc) => setAttachedResource(doc.title)}
        theme={theme}
      />
    </div>
  );
}
