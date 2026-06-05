"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

// ─── TYPES ───────────────────────────────────────────────────────────────

type EventType =
  | "holiday"
  | "working-saturday"
  | "ptm"
  | "exam"
  | "assembly"
  | "event"
  | "break"
  | "half-day"
  | "personal"
  | "reminder"
  | "meeting"
  | "deadline";

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  title: string;
  type: EventType;
  description: string;
  impactedClasses?: number;
  timetableNote?: string;
  affectedGroups?: string[];
  preparation?: string;
  audience?: string;
  notificationsSent?: string[];
  category?: "personal" | "programme" | "school";
  status?: "active" | "cancelled";
  location?: string;
  attachments?: string[];
  startTime?: string;
  endTime?: string;
};

type DayInfo = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
};

type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  expected: number;
  completed: number;
  pending: number;
  late: number;
  percentage: number;
  attentionAlert?: string;
  status: "Completed" | "In Progress" | "Review Phase" | "Scheduled" | "Finalizing";
  outstandingStudents: { name: string; status: string; risk: "high" | "medium" | "none" }[];
  supervisors: { name: string; outstandingReviews: number }[];
  recentActivity: string[];
  riskIndicator?: string;
  communicationHistory: string[];
};

// ─── INITIAL OPERATIONAL CALENDAR DATA (Academic Year 2025–26) ───────────

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // ── May 2026 ──
  {
    id: "ev-may-1",
    date: "2026-05-01",
    title: "Labour Day",
    type: "holiday",
    description: "National holiday. School closed for all students and staff.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Campus-wide",
    attachments: [],
    startTime: "08:00",
    endTime: "16:00"
  },
  {
    id: "ev-may-3",
    date: "2026-05-03",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Compensatory working day for extended Holi break. Modified timetable active.",
    timetableNote: "Monday timetable follows.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)", "Homeroom 11-F"],
    audience: "DP1, DP2",
    category: "programme",
    status: "active",
    location: "Respective Classrooms",
    attachments: ["Compensatory_Schedule.pdf"],
    startTime: "08:30",
    endTime: "13:30"
  },
  {
    id: "ev-may-5",
    date: "2026-05-05",
    title: "Grade Assembly",
    type: "assembly",
    description: "Grade 11 assembly in the Main Auditorium. Physics department presents IA showcase.",
    impactedClasses: 2,
    timetableNote: "Period 1 shortened to 30 min.",
    affectedGroups: ["Grade 11 Physics (B)"],
    preparation: "Prepare 3 student IA presentations for showcase.",
    audience: "DP1",
    category: "programme",
    status: "active",
    location: "Main Auditorium",
    attachments: ["IA_Showcase_Agenda.pdf"],
    startTime: "08:15",
    endTime: "09:15"
  },
  {
    id: "ev-may-10",
    date: "2026-05-10",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Regular working Saturday. Wednesday timetable follows.",
    timetableNote: "Wednesday timetable follows.",
    affectedGroups: ["All assigned classes"],
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Respective Classrooms",
    attachments: [],
    startTime: "08:30",
    endTime: "13:30"
  },
  {
    id: "ev-may-12",
    date: "2026-05-12",
    title: "Buddha Purnima",
    type: "holiday",
    description: "School closed. Buddhist cultural observance.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Campus-wide",
    attachments: [],
    startTime: "08:00",
    endTime: "16:00"
  },
  {
    id: "ev-may-15",
    date: "2026-05-15",
    title: "Lab Safety Inspection",
    type: "event",
    description: "Annual safety inspection for Lab 3 and Lab 4. Physics equipment audit.",
    preparation: "Ensure all lab equipment is catalogued and safety checklist is updated.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
    audience: "Selected Teachers",
    category: "programme",
    status: "active",
    location: "Science Labs 3 & 4",
    attachments: ["Safety_Inspection_Checklist.pdf"],
    startTime: "10:00",
    endTime: "12:30"
  },
  {
    id: "ev-may-18",
    date: "2026-05-18",
    endDate: "2026-05-22",
    title: "Unit Test Week",
    type: "exam",
    description: "Internal unit assessments for Grades 11–12. Modified schedule with extended periods.",
    impactedClasses: 4,
    timetableNote: "Exam timetable replaces regular schedule.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
    preparation: "Submit question papers by May 15. Invigilation roster confirmed.",
    audience: "DP1, DP2",
    category: "programme",
    status: "active",
    location: "Examination Hall A & B",
    attachments: ["Unit_Test_Schedule_G11_G12.pdf"],
    startTime: "08:30",
    endTime: "11:30"
  },
  {
    id: "ev-may-24",
    date: "2026-05-24",
    title: "PTM Saturday",
    type: "ptm",
    description: "Parent-Teacher Meeting for Grades 11–12. 15-minute appointment slots.",
    impactedClasses: 6,
    timetableNote: "Teaching schedule suspended. PTM slots 9 AM – 1 PM.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)", "Homeroom 11-F"],
    preparation: "Prepare individual student progress reports. Review attendance flags.",
    audience: "DP1, DP2",
    category: "school",
    status: "active",
    location: "Central Gymnasium",
    attachments: ["PTM_Parent_Slots.xlsx"],
    startTime: "09:00",
    endTime: "13:00"
  },
  {
    id: "ev-may-29",
    date: "2026-05-29",
    title: "IA Draft Deadline",
    type: "deadline",
    description: "Final submission deadline for Physics IA Phase 2 drafts.",
    affectedGroups: ["Grade 11 Physics (B)"],
    preparation: "Review submitted drafts. Flag incomplete submissions.",
    audience: "DP1",
    category: "programme",
    status: "active",
    location: "Axis Digital Portal",
    attachments: ["Physics_IA_Rubric.pdf"],
    startTime: "23:59",
    endTime: "23:59"
  },
  {
    id: "ev-may-30",
    date: "2026-05-30",
    title: "Sports Day",
    type: "event",
    description: "Annual inter-house athletics meet. Classes suspended after Period 3.",
    impactedClasses: 3,
    timetableNote: "Only Periods 1–3 active. Sports events from 12:00 PM.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Athletics Field",
    attachments: ["Event_Flow_SportsDay.pdf"],
    startTime: "12:00",
    endTime: "17:00"
  },
  {
    id: "ev-may-31",
    date: "2026-05-31",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Compensatory working day. Thursday timetable follows.",
    timetableNote: "Thursday timetable follows.",
    affectedGroups: ["All assigned classes"],
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Respective Classrooms",
    attachments: [],
    startTime: "08:30",
    endTime: "13:30"
  },
  // ── June 2026 ──
  {
    id: "ev-jun-1",
    date: "2026-06-01",
    endDate: "2026-06-05",
    title: "Summer Break Begins",
    type: "break",
    description: "First week of summer recess. School closed for all.",
    impactedClasses: 6,
    timetableNote: "No classes scheduled.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Campus-wide",
    attachments: [],
    startTime: "08:00",
    endTime: "16:00"
  },
  {
    id: "ev-jun-8",
    date: "2026-06-08",
    title: "MYP Personal Project Exhibition",
    type: "event",
    description: "Annual exhibition showcase for Grade 10 Personal Projects in the Atrium.",
    timetableNote: "Atrium booked all day. Normal classes proceed.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Science Atrium",
    attachments: ["Exhibition_Floorplan.pdf"],
    startTime: "09:00",
    endTime: "15:30"
  },
  {
    id: "ev-jun-15",
    date: "2026-06-15",
    title: "IB DP Graduation Ceremony",
    type: "event",
    description: "Diploma Programme Graduation Ceremony. Main Auditorium and Atrium reception.",
    timetableNote: "Classes suspended for G12. G11 helper duty active.",
    audience: "Entire School",
    category: "school",
    status: "active",
    location: "Main Auditorium & Atrium",
    attachments: ["Graduation_Programme_2026.pdf"],
    startTime: "09:30",
    endTime: "13:00"
  },
  {
    id: "ev-jun-22",
    date: "2026-06-22",
    endDate: "2026-06-26",
    title: "Mid-Term Examinations",
    type: "exam",
    description: "Mid-term assessments for all grades. Exam timetable in effect.",
    impactedClasses: 6,
    timetableNote: "Exam schedule replaces regular timetable.",
    audience: "DP1, DP2",
    category: "programme",
    status: "active",
    location: "Examination Hall A & B",
    attachments: ["MidTerm_Schedule_June.pdf"],
    startTime: "08:30",
    endTime: "12:30"
  }
];

// ─── INITIAL TIMELINE MILESTONES DATA ────────────────────────────────────

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "ms-tok-exh",
    title: "TOK Exhibition Final",
    dueDate: "2026-05-12",
    expected: 148,
    completed: 148,
    pending: 0,
    late: 0,
    percentage: 100,
    status: "Completed",
    outstandingStudents: [],
    supervisors: [
      { name: "Ms. Sarah Thompson", outstandingReviews: 0 },
      { name: "Mr. Marcus Vance", outstandingReviews: 0 }
    ],
    recentActivity: [
      "Exhibition files archived on May 14.",
      "Moderation marks uploaded to IBIS hub."
    ],
    communicationHistory: [
      "Broadcaster: TOK Exhibition final grades locked.",
      "Email: Invitation sent to parents for public showcase."
    ]
  },
  {
    id: "ms-tok-ess",
    title: "TOK Essay Draft submission",
    dueDate: "2026-06-12",
    expected: 148,
    completed: 62,
    pending: 86,
    late: 22,
    percentage: 42,
    status: "In Progress",
    attentionAlert: "TOK Essay completion pace below expected pace",
    outstandingStudents: [
      { name: "Leo Dubois", status: "Draft Missing", risk: "high" },
      { name: "Sofia Chen", status: "Outline Only", risk: "medium" },
      { name: "Lucas Martin", status: "Draft Missing", risk: "high" },
      { name: "Emma Watson", status: "Not Started", risk: "high" }
    ],
    supervisors: [
      { name: "Ms. Sarah Thompson", outstandingReviews: 12 },
      { name: "Mr. Marcus Vance", outstandingReviews: 18 },
      { name: "Mr. Robert Blake", outstandingReviews: 8 }
    ],
    recentActivity: [
      "14 draft submissions checked yesterday.",
      "22 candidates past draft target date."
    ],
    riskIndicator: "Low completion pace. 22 candidates are past internal target draft milestones, risking overlap with Chemistry IA final submissions.",
    communicationHistory: [
      "System alert: Pre-alert sent to 22 late students.",
      "Syllabus ping: Reminder sent to TOK supervisors."
    ]
  },
  {
    id: "ms-ee-final",
    title: "Extended Essay Final submission",
    dueDate: "2026-06-18",
    expected: 148,
    completed: 142,
    pending: 6,
    late: 6,
    percentage: 96,
    status: "Review Phase",
    attentionAlert: "EE reviews behind schedule (6 outstanding reviews)",
    outstandingStudents: [
      { name: "David Miller", status: "Review Pending", risk: "medium" },
      { name: "Elsa Pataky", status: "Review Pending", risk: "medium" },
      { name: "Nate Diaz", status: "Feedback Required", risk: "high" }
    ],
    supervisors: [
      { name: "Mr. Aarav Chen", outstandingReviews: 4 },
      { name: "Ms. Ananya Rao", outstandingReviews: 2 }
    ],
    recentActivity: [
      "Feedback uploaded for 12 students this week.",
      "6 final reviews pending supervisor lock."
    ],
    riskIndicator: "6 advisor reviews are overdue. Final compilation must start by June 20 to hit submission window.",
    communicationHistory: [
      "Direct message: Alert sent to Mr. Aarav Chen.",
      "Broadcaster: Calendar deadline reminder dispatched."
    ]
  },
  {
    id: "ms-cas-refl",
    title: "CAS Reflections Upload",
    dueDate: "2026-06-15",
    expected: 148,
    completed: 110,
    pending: 38,
    late: 18,
    percentage: 74,
    status: "In Progress",
    attentionAlert: "CAS reflections overdue for 18 candidates",
    outstandingStudents: [
      { name: "Clara Dupont", status: "2 Reflections Short", risk: "medium" },
      { name: "Marc Anthone", status: "No reflections uploaded", risk: "high" },
      { name: "Siddharth Malhotra", status: "Journal Empty", risk: "high" }
    ],
    supervisors: [
      { name: "Ms. Sarah Thompson", outstandingReviews: 10 },
      { name: "Mr. Marcus Vance", outstandingReviews: 8 }
    ],
    recentActivity: [
      "CAS Coordinator audited 42 reflections in past 48 hours.",
      "10 students updated journals today."
    ],
    riskIndicator: "18 candidates have not uploaded required monthly reflections for May/June cycles.",
    communicationHistory: [
      "Notice board: CAS updates guidelines updated."
    ]
  },
  {
    id: "ms-ia-draft",
    title: "IA Phase 2 Drafts",
    dueDate: "2026-06-25",
    expected: 148,
    completed: 45,
    pending: 103,
    late: 0,
    percentage: 30,
    status: "Scheduled",
    outstandingStudents: [
      { name: "All Grade 12 Candidates", status: "Awaiting final drafts", risk: "none" }
    ],
    supervisors: [
      { name: "All DP Faculty", outstandingReviews: 103 }
    ],
    recentActivity: [
      "Submission portal opened on June 01."
    ],
    communicationHistory: [
      "Calendar sync: IA draft windows added to teacher calendars."
    ]
  },
  {
    id: "ms-pred-grd",
    title: "Predicted Grades Submission",
    dueDate: "2026-06-28",
    expected: 148,
    completed: 120,
    pending: 28,
    late: 8,
    percentage: 81,
    status: "Finalizing",
    attentionAlert: "Predicted grade submissions incomplete (8 subjects pending)",
    outstandingStudents: [
      { name: "Physics HL (Mr. Chen)", status: "8 entries missing", risk: "medium" },
      { name: "Chemistry SL (Ms. Rao)", status: "12 entries missing", risk: "medium" },
      { name: "French B SL (Ms. Martin)", status: "8 entries missing", risk: "medium" }
    ],
    supervisors: [
      { name: "Mr. Aarav Chen", outstandingReviews: 8 },
      { name: "Ms. Ananya Rao", outstandingReviews: 12 },
      { name: "Ms. Martin", outstandingReviews: 8 }
    ],
    recentActivity: [
      "Completed entries locked by Academic Board on June 02."
    ],
    riskIndicator: "8 subject leads have not submitted final predicted portfolios. Submissions are required before mock examination results compilation.",
    communicationHistory: [
      "System notice: Alert dispatched to 3 pending subject leads."
    ]
  }
];

// ─── CALENDAR MONTH CONFIGS ──────────────────────────────────────────────

const TODAY = new Date("2026-06-04T00:00:00");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateToKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function isDateInRange(dateKey: string, event: CalendarEvent) {
  if (!event.endDate) return dateKey === event.date;
  return dateKey >= event.date && dateKey <= event.endDate;
}

function getEventTypeStyle(type: EventType): { dot: string; bg: string; label: string; border: string } {
  switch (type) {
    case "holiday":
      return { dot: "bg-red-400", bg: "bg-red-500/[0.06]", label: "Holiday", border: "border-red-500/20" };
    case "working-saturday":
      return { dot: "bg-amber-400", bg: "bg-amber-500/[0.06]", label: "Working Saturday", border: "border-amber-500/20" };
    case "ptm":
      return { dot: "bg-violet-400", bg: "bg-violet-500/[0.06]", label: "PTM", border: "border-violet-500/20" };
    case "exam":
      return { dot: "bg-sky-400", bg: "bg-sky-500/[0.06]", label: "Examination", border: "border-sky-500/20" };
    case "assembly":
      return { dot: "bg-emerald-400", bg: "bg-emerald-500/[0.06]", label: "Assembly", border: "border-emerald-500/20" };
    case "event":
      return { dot: "bg-cyan-400", bg: "bg-cyan-500/[0.06]", label: "School Event", border: "border-cyan-500/20" };
    case "break":
      return { dot: "bg-teal-400", bg: "bg-teal-500/[0.06]", label: "Break", border: "border-teal-500/20" };
    case "half-day":
      return { dot: "bg-orange-400", bg: "bg-orange-500/[0.06]", label: "Half Day", border: "border-orange-500/20" };
    case "personal":
      return { dot: "bg-indigo-400", bg: "bg-indigo-500/[0.06]", label: "Personal", border: "border-indigo-500/20" };
    case "reminder":
      return { dot: "bg-fuchsia-400", bg: "bg-fuchsia-500/[0.06]", label: "Reminder", border: "border-fuchsia-500/20" };
    case "meeting":
      return { dot: "bg-blue-400", bg: "bg-blue-500/[0.06]", label: "Meeting", border: "border-blue-500/20" };
    case "deadline":
      return { dot: "bg-rose-400", bg: "bg-rose-500/[0.06]", label: "Deadline", border: "border-rose-500/20" };
    default:
      return { dot: "bg-cyan-400", bg: "bg-cyan-500/[0.06]", label: "Event", border: "border-cyan-500/20" };
  }
}

function buildMonthGrid(year: number, month: number, today: Date, events: CalendarEvent[]): DayInfo[] {
  const firstDayOfMonth = new Date(year, month, 1);
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: DayInfo[] = [];

  // Previous month fill
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const key = dateToKey(d);
    grid.push({
      date: d,
      dayOfMonth: d.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: events.filter((ev) => isDateInRange(key, ev)),
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = dateToKey(d);
    grid.push({
      date: d,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: events.filter((ev) => isDateInRange(key, ev)),
    });
  }

  // Next month fill to complete final row
  const remaining = 42 - grid.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const key = dateToKey(d);
    grid.push({
      date: d,
      dayOfMonth: i,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: events.filter((ev) => isDateInRange(key, ev)),
    });
  }

  return grid;
}

// ─── COMPONENT IMPLEMENTATION ───────────────────────────────────────────

export function EventsInitiatives({ theme = "axis" }: { theme?: string }) {
  const styles = getAxisTheme(theme as Theme);
  const isLight = theme === "light";

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"calendar" | "timeline">("calendar");

  // Operational state data
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("axis-events");
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("axis-events", JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    const handleCreateEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.event) {
        const newEv = customEvent.detail.event;
        // Pre-fill form state variables
        setFormName(newEv.title);
        setFormDesc(newEv.description || "");
        setFormDate(newEv.date || "2026-06-10");
        setFormType((newEv.type as EventType) || "event");
        setFormCategory(newEv.category || "school");
        setFormLocation(newEv.location || "");
        setFormStartTime(newEv.startTime || "10:00");
        setFormEndTime(newEv.endTime || "14:00");
        setFormAudience(newEv.audience || "Entire School");
        
        // Open the creation wizard
        setWizardStep(1);
        setShowWizard(true);
        setActiveTab("calendar");
        
        triggerToast("Suggested event details loaded. Please review and publish.");
      }
    };

    window.addEventListener("axis-context-create-event", handleCreateEvent);

    // Check for pending event creation on mount
    const win = window as typeof window & {
      pendingContextEvent?: {
        title: string;
        description: string;
        date: string;
        type: string;
        category: "personal" | "programme" | "school";
        location: string;
        startTime?: string;
        endTime?: string;
        audience?: string;
      };
    };
    if (typeof window !== "undefined" && win.pendingContextEvent) {
      const newEv = win.pendingContextEvent;
      setFormName(newEv.title);
      setFormDesc(newEv.description || "");
      setFormDate(newEv.date || "2026-06-10");
      setFormType((newEv.type as EventType) || "event");
      setFormCategory(newEv.category || "school");
      setFormLocation(newEv.location || "");
      setFormStartTime(newEv.startTime || "10:00");
      setFormEndTime(newEv.endTime || "14:00");
      setFormAudience(newEv.audience || "Entire School");
      
      setWizardStep(1);
      setShowWizard(true);
      setActiveTab("calendar");
      
      delete win.pendingContextEvent;
      setTimeout(() => {
        triggerToast("Suggested event details loaded. Please review and publish.");
      }, 100);
    }

    return () => {
      window.removeEventListener("axis-context-create-event", handleCreateEvent);
    };
  }, []);

  const [milestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  
  // Calendar Month selection
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);

  // Timeline selected details inspector
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("ms-tok-ess"); // Default TOK essay open

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Event wizard orchestration states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Event wizard forms inputs
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<EventType>("event");
  const [formDate, setFormDate] = useState("2026-06-10");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:30");
  const [formAudience, setFormAudience] = useState("Entire School");
  const [formNotifications, setFormNotifications] = useState<string[]>([
    "Add to calendars", "Send announcement"
  ]);

  // Contextual actions and modals states
  const [activeActionMenuEventId, setActiveActionMenuEventId] = useState<string | null>(null);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState<EventType>("event");
  const [editCategory, setEditCategory] = useState<"personal" | "programme" | "school">("school");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAudience, setEditAudience] = useState("");
  const [editNotifications, setEditNotifications] = useState<string[]>([]);
  const [editAttachments, setEditAttachments] = useState<string[]>([]);

  // Duplicate Modal State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatingEvent, setDuplicatingEvent] = useState<CalendarEvent | null>(null);
  const [duplicateDate, setDuplicateDate] = useState("");
  const [duplicateStartTime, setDuplicateStartTime] = useState("");
  const [duplicateEndTime, setDuplicateEndTime] = useState("");
  const [duplicateAudience, setDuplicateAudience] = useState("");

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);

  // Impact Modal State
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactEvent, setImpactEvent] = useState<CalendarEvent | null>(null);

  // New state in creation wizard:
  const [formCategory, setFormCategory] = useState<"personal" | "programme" | "school">("school");
  const [formLocation, setFormLocation] = useState("");
  const [formAttachments, setFormAttachments] = useState<string[]>([]);

  // Derived timeline calculations
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth, TODAY, events), [viewYear, viewMonth, events]);

  const selectedMilestone = useMemo(() => {
    return milestones.find((m) => m.id === selectedMilestoneId);
  }, [milestones, selectedMilestoneId]);

  const upcomingEvents = useMemo(() => {
    const todayKey = dateToKey(TODAY);
    return events
      .filter((ev) => ev.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  const attentionMilestones = useMemo(() => {
    return milestones.filter((m) => m.attentionAlert);
  }, [milestones]);

  const impactTelemetry = useMemo(() => {
    if (formCategory === "personal") {
      return { students: 0, teachers: 0, conflict: "✓ Private calendar event. No institutional resources blocked." };
    }

    let students = 620;
    let teachers = 48;
    
    if (formAudience === "DP1") {
      students = 142;
      teachers = 12;
    } else if (formAudience === "DP2") {
      students = 120;
      teachers = 10;
    } else if (formAudience === "Selected Students" || formAudience === "Custom Group") {
      students = 35;
      teachers = 4;
    } else if (formAudience === "Selected Teachers") {
      students = 0;
      teachers = 16;
    } else if (formAudience === "Selected Sections") {
      students = 28;
      teachers = 2;
    }

    // Room Conflict Simulation
    let conflict: string | null = null;
    if (formDate === "2026-06-08" && (formName.toLowerCase().includes("exhibition") || formType === "event")) {
      conflict = "⚠️ Space Conflict: Science Atrium is fully booked for MYP Personal Project Exhibition.";
    } else if (formDate === "2026-06-15" && (formStartTime >= "08:00" && formStartTime <= "13:00")) {
      conflict = "⚠️ Booking Conflict: Main Auditorium is reserved for IB DP Graduation Ceremony.";
    }

    return { students, teachers, conflict };
  }, [formAudience, formDate, formName, formStartTime, formType, formCategory]);

  const currentSelectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = dateToKey(selectedDay.date);
    return events.filter((ev) => isDateInRange(dateKey, ev));
  }, [events, selectedDay]);

  // Helper date formatting
  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  };

  const handleOpenWizard = (initialDateKey?: string) => {
    if (initialDateKey) setFormDate(initialDateKey);
    setFormName("");
    setFormDesc("");
    setFormType("event");
    setFormCategory("school");
    setFormLocation("");
    setFormStartTime("09:00");
    setFormEndTime("10:30");
    setFormAudience("Entire School");
    setFormNotifications(["Add to calendars", "Send announcement"]);
    setFormAttachments([]);
    setWizardStep(1);
    setShowWizard(true);
  };

  const handlePublishEvent = () => {
    const newEvent: CalendarEvent = {
      id: `ev-coordinator-${Date.now()}`,
      date: formDate,
      title: formName || `${formType.toUpperCase()} Event`,
      type: formType,
      description: formDesc || "Coordinator scheduled event.",
      timetableNote: `${formStartTime} - ${formEndTime} · ${formAudience}`,
      audience: formAudience,
      notificationsSent: formNotifications,
      category: formCategory,
      status: "active",
      location: formLocation || "Main Campus",
      attachments: formAttachments,
      startTime: formStartTime,
      endTime: formEndTime
    };

    setEvents((prev) => [...prev, newEvent]);
    setShowWizard(false);
    triggerToast("Initiative registered & broadcast system-wide successfully.");

    // Update active month view to date of event
    const eventD = new Date(formDate + "T00:00:00");
    setViewYear(eventD.getFullYear());
    setViewMonth(eventD.getMonth());
    
    // Select the day automatically
    const targetGrid = buildMonthGrid(eventD.getFullYear(), eventD.getMonth(), TODAY, [...events, newEvent]);
    const match = targetGrid.find((di) => isSameDay(di.date, eventD));
    if (match) setSelectedDay(match);
  };

  const handlePingOutstanding = (milestoneTitle: string) => {
    triggerToast(`Sent immediate push alerts & email reminders for ${milestoneTitle}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── TAB HEADERS CONTAINER ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-5 select-none">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.05] w-fit">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === "calendar"
                ? isLight
                  ? "bg-white text-black shadow-sm"
                  : "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/10"
                : isLight
                ? "text-black/50 hover:text-black hover:bg-black/5"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            School Calendar
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === "timeline"
                ? isLight
                  ? "bg-white text-black shadow-sm"
                  : "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/10"
                : isLight
                ? "text-black/50 hover:text-black hover:bg-black/5"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            IB Programme Timeline
          </button>
        </div>

        <button
          onClick={() => handleOpenWizard()}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${styles.buttonPrimary}`}
        >
          <span>+ Create Programme Event</span>
        </button>
      </div>

      {/* ─── CORE VIEWPORT SWITCHER ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "calendar" ? (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start"
          >
            
            {/* LEFT SIDE: Month Grid */}
            <div className={`rounded-2xl border ${styles.cardBg} p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
              
              {/* Grid Header controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className={`text-lg font-bold tracking-tight ${isLight ? "text-black" : "text-white"}`}>
                    {MONTHS[viewMonth]} {viewYear}
                  </h2>
                  <button
                    onClick={() => {
                      setViewYear(TODAY.getFullYear());
                      setViewMonth(TODAY.getMonth());
                      setSelectedDay(null);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      isLight
                        ? "border-black/10 bg-black/[0.02] text-black/60 hover:bg-black/[0.05]"
                        : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    Today
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (viewMonth === 0) {
                        setViewMonth(11);
                        setViewYear(viewYear - 1);
                      } else {
                        setViewMonth(viewMonth - 1);
                      }
                      setSelectedDay(null);
                    }}
                    className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                      isLight ? "text-black/40 hover:bg-black/5" : "text-white/40 hover:bg-white/[0.04]"
                    }`}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (viewMonth === 11) {
                        setViewMonth(0);
                        setViewYear(viewYear + 1);
                      } else {
                        setViewMonth(viewMonth + 1);
                      }
                      setSelectedDay(null);
                    }}
                    className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                      isLight ? "text-black/40 hover:bg-black/5" : "text-white/40 hover:bg-white/[0.04]"
                    }`}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 mb-2 border-b border-white/[0.04] pb-2">
                {WEEKDAY_LABELS.map((wd) => (
                  <div key={wd} className={`text-center text-[10px] font-bold uppercase tracking-wider py-1 ${isLight ? "text-black/40" : "text-white/35"}`}>
                    {wd}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1">
                {grid.map((day, idx) => {
                  const hasEvents = day.events.length > 0;
                  const isSelected = selectedDay && isSameDay(day.date, selectedDay.date);
                  const isCurrent = isSameDay(day.date, TODAY);

                  let cellStyle = isLight ? "border-black/[0.03] " : "border-white/[0.02] ";
                  let textStyle = isLight ? "text-black/70 " : "text-white/60 ";

                  if (isSelected) {
                    cellStyle += isLight ? "border-black/40 bg-black/5 " : "border-cyan-400/40 bg-cyan-950/10 shadow-[0_0_12px_rgba(6,182,212,0.06)] ";
                  } else {
                    if (day.events.some(e => e.type === "holiday")) {
                      cellStyle += "bg-red-500/[0.02] hover:bg-red-500/[0.05] ";
                      textStyle = "text-red-400/80 ";
                    } else if (day.events.some(e => e.type === "break")) {
                      cellStyle += "bg-teal-500/[0.02] hover:bg-teal-500/[0.05] ";
                      textStyle = "text-teal-400/80 ";
                    } else if (day.isWeekend) {
                      cellStyle += isLight ? "bg-black/[0.015] " : "bg-white/[0.005] ";
                      textStyle = isLight ? "text-black/30 " : "text-white/20 ";
                    } else {
                      cellStyle += isLight ? "hover:bg-black/[0.03] " : "hover:bg-white/[0.02] ";
                    }
                  }

                  const opacityClass = !day.isCurrentMonth ? "opacity-25" : "";

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className={`relative flex flex-col items-center justify-start rounded-xl p-2.5 min-h-[92px] border transition-all duration-200 group text-left ${cellStyle} ${opacityClass}`}
                    >
                      <span className={`text-xs font-bold leading-none ${
                        isCurrent
                          ? isLight
                            ? "bg-black text-white rounded-full size-6 flex items-center justify-center"
                            : "bg-[#22d3ee] text-black rounded-full size-6 flex items-center justify-center font-extrabold"
                          : textStyle
                      }`}>
                        {day.dayOfMonth}
                      </span>

                      {/* Display small tags inside cell */}
                      {hasEvents && day.isCurrentMonth && (
                        <div className="flex flex-col gap-1 mt-2 w-full select-none pointer-events-none">
                          {day.events.slice(0, 2).map((ev) => {
                            const eventStyle = getEventTypeStyle(ev.type);
                            return (
                              <span
                                key={ev.id}
                                className={`w-full text-[8px] font-bold truncate rounded-md py-0.5 px-1.5 border ${
                                  ev.status === "cancelled"
                                    ? "bg-white/[0.01] border-white/[0.04] text-white/30 line-through opacity-40"
                                    : `${eventStyle.bg} ${eventStyle.border} ${
                                        ev.type === "holiday" ? "text-red-400" :
                                        ev.type === "exam" ? "text-sky-400" :
                                        ev.type === "assembly" ? "text-emerald-400" :
                                        ev.type === "deadline" ? "text-rose-400" :
                                        "text-cyan-400"
                                      }`
                                }`}
                              >
                                {ev.category === "personal" ? "🔒 " : ""}{ev.title}
                              </span>
                            );
                          })}
                          {day.events.length > 2 && (
                            <span className={`text-[8px] font-semibold text-center mt-0.5 ${isLight ? "text-black/35" : "text-white/30"}`}>
                              +{day.events.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend row */}
              <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-wrap gap-x-5 gap-y-2 select-none">
                {([
                  { type: "holiday", label: "Holiday" },
                  { type: "exam", label: "Assessment" },
                  { type: "assembly", label: "Assembly" },
                  { type: "event", label: "School Event" },
                  { type: "break", label: "Break/Recess" },
                  { type: "deadline", label: "Program Deadline" }
                ]).map((item) => {
                  const style = getEventTypeStyle(item.type as EventType);
                  return (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${style.dot}`} />
                      <span className={`text-[10px] font-bold ${isLight ? "text-black/45" : "text-white/40"}`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT SIDE: Day Inspector & Upcoming lists */}
            <div className="space-y-6">
              
              {/* Selected Day Details Panel */}
              <AnimatePresence mode="wait">
                {selectedDay ? (
                  <motion.div
                    key={dateToKey(selectedDay.date)}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`rounded-2xl border ${styles.cardBg} p-5 shadow-lg space-y-4`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? "text-black/45" : "text-white/35"}`}>
                          Day Details
                        </span>
                        <h4 className={`text-sm font-bold mt-0.5 ${isLight ? "text-black" : "text-white"}`}>
                          {formatEventDate(dateToKey(selectedDay.date))}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleOpenWizard(dateToKey(selectedDay.date))}
                        className={`text-[8px] font-bold uppercase border px-2 py-1 rounded-lg ${
                          isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-cyan-400 hover:bg-cyan-500/10"
                        }`}
                      >
                        + Add Event
                      </button>
                    </div>

                    {currentSelectedDayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {currentSelectedDayEvents.map((ev) => {
                          const eventStyle = getEventTypeStyle(ev.type);
                          const isCancelled = ev.status === "cancelled";
                          const categoryLabel = ev.category === "personal" ? "Personal" : ev.category === "school" ? "School" : "Programme";
                          const categoryIcon = ev.category === "personal" ? "🔒" : ev.category === "school" ? "🏫" : "🎓";
                          
                          return (
                            <div
                              key={ev.id}
                              className={`relative p-3 rounded-xl border ${eventStyle.border} ${eventStyle.bg} space-y-1.5 transition-all duration-205 ${
                                isCancelled ? "opacity-50" : ""
                              }`}
                            >
                              {/* Ellipsis Actions Trigger */}
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionMenuEventId(activeActionMenuEventId === ev.id ? null : ev.id);
                                  }}
                                  className={`size-6 rounded-lg flex items-center justify-center transition-all ${
                                    isLight ? "hover:bg-black/5 text-black/50" : "hover:bg-white/10 text-white/50"
                                  }`}
                                >
                                  •••
                                </button>

                                {/* Dropdown Action Menu */}
                                <AnimatePresence>
                                  {activeActionMenuEventId === ev.id && (
                                    <>
                                      {/* Invisible full-screen overlay to close menu on click away */}
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveActionMenuEventId(null);
                                        }}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        className={`absolute right-0 top-7 w-40 rounded-xl border p-1 shadow-xl z-50 backdrop-blur-md ${
                                          isLight
                                            ? "bg-white/95 border-black/10 text-black shadow-black/10"
                                            : "bg-[#16161A]/95 border-white/10 text-white shadow-black/40"
                                        }`}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionMenuEventId(null);
                                            setEditingEvent(ev);
                                            setEditName(ev.title);
                                            setEditDesc(ev.description);
                                            setEditType(ev.type);
                                            setEditCategory(ev.category || "programme");
                                            setEditDate(ev.date);
                                            setEditStartTime(ev.startTime || "09:00");
                                            setEditEndTime(ev.endTime || "10:30");
                                            setEditLocation(ev.location || "Main Campus");
                                            setEditAudience(ev.audience || "Entire School");
                                            setEditNotifications(ev.notificationsSent || ["Add to calendars"]);
                                            setEditAttachments(ev.attachments || []);
                                            setShowEditModal(true);
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                                            isLight ? "hover:bg-black/5 text-black/80" : "hover:bg-white/5 text-white/80"
                                          }`}
                                        >
                                          Edit Event
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionMenuEventId(null);
                                            setDuplicatingEvent(ev);
                                            setDuplicateDate(ev.date);
                                            setDuplicateStartTime(ev.startTime || "09:00");
                                            setDuplicateEndTime(ev.endTime || "10:30");
                                            setDuplicateAudience(ev.audience || "Entire School");
                                            setShowDuplicateModal(true);
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                                            isLight ? "hover:bg-black/5 text-black/80" : "hover:bg-white/5 text-white/80"
                                          }`}
                                        >
                                          Duplicate Event
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionMenuEventId(null);
                                            setEvents((prev) =>
                                              prev.map((item) =>
                                                item.id === ev.id
                                                  ? { ...item, status: isCancelled ? "active" : "cancelled" }
                                                  : item
                                              )
                                            );
                                            triggerToast(
                                              isCancelled
                                                ? "Event restored and synchronized."
                                                : "Event marked as Cancelled. Remains in history."
                                            );
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                                            isLight ? "hover:bg-black/5 text-black/80" : "hover:bg-white/5 text-white/80"
                                          }`}
                                        >
                                          {isCancelled ? "Restore Event" : "Cancel Event"}
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionMenuEventId(null);
                                            setImpactEvent(ev);
                                            setShowImpactModal(true);
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                                            isLight ? "hover:bg-black/5 text-black/80" : "hover:bg-white/5 text-white/80"
                                          }`}
                                        >
                                          View Impact
                                        </button>
                                        <div className={`h-px my-1 ${isLight ? "bg-black/5" : "bg-white/5"}`} />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionMenuEventId(null);
                                            setDeletingEvent(ev);
                                            setShowDeleteModal(true);
                                          }}
                                          className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide text-rose-500 hover:bg-rose-500/10 transition-all"
                                        >
                                          Delete Event
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pr-8">
                                <span className={`text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                  ev.type === "holiday" ? "bg-red-500/10 text-red-400" :
                                  ev.type === "exam" ? "bg-sky-500/10 text-sky-400" :
                                  "bg-cyan-500/10 text-cyan-400"
                                }`}>
                                  {ev.type}
                                </span>
                                
                                {/* Category Indicator Badge */}
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                  ev.category === "personal" ? "bg-indigo-500/10 text-indigo-400" :
                                  ev.category === "school" ? "bg-amber-500/10 text-amber-400" :
                                  "bg-teal-500/10 text-teal-400"
                                }`}>
                                  <span>{categoryIcon}</span>
                                  <span>{categoryLabel}</span>
                                </span>

                                {isCancelled && (
                                  <span className="text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                    🚫 Cancelled
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <h5 className={`text-xs font-bold leading-tight ${isCancelled ? "line-through text-white/40" : ""}`}>
                                  {ev.title}
                                </h5>
                                {ev.location && (
                                  <span className={`text-[9px] font-medium flex items-center gap-1 ${isLight ? "text-black/45" : "text-white/35"}`}>
                                    📍 {ev.location}
                                  </span>
                                )}
                              </div>

                              <p className={`text-[10px] leading-relaxed ${isLight ? "text-black/60" : "text-white/50"}`}>
                                {ev.description}
                              </p>

                              {ev.attachments && ev.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {ev.attachments.map((file, i) => (
                                    <span
                                      key={i}
                                      className={`text-[8px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                                        isLight ? "bg-zinc-50 border-black/5 text-black/50" : "bg-white/[0.02] border-white/5 text-white/40"
                                      }`}
                                    >
                                      📎 {file}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {(ev.timetableNote || (ev.startTime && ev.endTime)) && (
                                <div className="text-[9px] text-cyan-400 font-medium flex items-center gap-1">
                                  ⏱ {ev.startTime && ev.endTime ? `${ev.startTime} - ${ev.endTime}` : ev.timetableNote}
                                  {ev.audience && <span className={`text-white/30 ml-1`}>· {ev.audience}</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-center py-6 text-xs italic ${isLight ? "text-black/35" : "text-white/30"}`}>
                        No scheduled timeline events for this day.
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className={`rounded-2xl border ${styles.cardBg} border-dashed p-6 text-center text-xs ${isLight ? "text-black/35" : "text-white/30"} select-none`}>
                    Select a calendar grid day to inspect local events details.
                  </div>
                )}
              </AnimatePresence>

              {/* Suggested by Context Engine (Bake Sale suggestion) */}
              {!events.some(ev => ev.title.toLowerCase().includes("bake sale")) && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)] space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-cyan-500/10">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">Suggested by Context Engine</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">Ecosystem suggestion</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Recent email mentions a Grade 12 Bake Sale</h4>
                    <p className="text-[10px] text-white/50">Proposed date: September 18, 2026. Courtyard requested.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEvents((prev) => [
                          ...prev,
                          {
                            id: "evt-bakesale",
                            title: "Grade 12 Bake Sale",
                            description: "Grade 12 Bake Sale event in the courtyard.",
                            date: "2026-09-18",
                            type: "event",
                            category: "school",
                            location: "Central Courtyard",
                            startTime: "10:00",
                            endTime: "14:00",
                            audience: "All Students & Staff",
                            status: "active"
                          }
                        ]);
                        triggerToast("Grade 12 Bake Sale added to Calendar.");
                      }}
                      className="px-2.5 py-1.5 rounded bg-cyan-500 text-black text-[9px] font-bold hover:bg-cyan-400 transition-colors uppercase tracking-wider"
                    >
                      Create Event
                    </button>
                    <button
                      onClick={() => {
                        setFormName("Grade 12 Bake Sale");
                        setFormDesc("Grade 12 Bake Sale event referenced in communication log.");
                        setFormCategory("school");
                        setFormType("event");
                        setFormLocation("Central Courtyard");
                        setFormDate("2026-09-18");
                        setFormStartTime("10:00");
                        setFormEndTime("14:00");
                        setFormAudience("All Students & Staff");
                        setShowWizard(true);
                        setWizardStep(1);
                      }}
                      className="px-2.5 py-1.5 rounded bg-white/10 text-white/70 text-[9px] font-bold hover:bg-white/20 transition-colors uppercase tracking-wider"
                    >
                      Configure...
                    </button>
                  </div>
                </div>
              )}

              {/* Upcoming Events Overview */}
              <div className={`rounded-2xl border ${styles.cardBg} p-5 shadow-lg`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.04]">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-black/50" : "text-white/50"}`}>
                    Upcoming Schedule
                  </h3>
                  <span className={`text-[9px] font-medium ${isLight ? "text-black/30" : "text-white/30"}`}>
                    Next 5 Events
                  </span>
                </div>

                <div className="space-y-2 select-none">
                  {upcomingEvents.map((ev) => {
                    const eventStyle = getEventTypeStyle(ev.type);
                    return (
                      <button
                        key={ev.id}
                        onClick={() => {
                          const eventD = new Date(ev.date + "T00:00:00");
                          setViewYear(eventD.getFullYear());
                          setViewMonth(eventD.getMonth());
                          const targetGrid = buildMonthGrid(eventD.getFullYear(), eventD.getMonth(), TODAY, events);
                          const match = targetGrid.find((di) => isSameDay(di.date, eventD));
                          if (match) setSelectedDay(match);
                        }}
                        className={`w-full flex items-start gap-3 p-2 rounded-xl text-left hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all`}
                      >
                        <div className="flex flex-col items-center justify-start shrink-0 w-8 text-center">
                          <span className="text-xs font-bold">{new Date(ev.date + "T00:00:00").getDate()}</span>
                          <span className={`text-[8px] uppercase font-bold tracking-tight ${isLight ? "text-black/40" : "text-white/35"}`}>
                            {MONTHS[new Date(ev.date + "T00:00:00").getMonth()].slice(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold truncate leading-tight group-hover:text-white">{ev.title}</h4>
                          <span className={`text-[9px] leading-none ${isLight ? "text-black/40" : "text-white/35"}`}>
                            Scope: {ev.audience || "Entire School"}
                          </span>
                        </div>
                        <span className={`size-1.5 rounded-full mt-2 shrink-0 ${eventStyle.dot}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </motion.div>
        ) : (
          /* ─── TAB 2: IB PROGRAMME TIMELINE ───────────────────────────── */
          <motion.div
            key="timeline-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            
            {/* LEFT SIDE: Milestone progression flow (8 cols) */}
            <div className="xl:col-span-8 space-y-4">
              
              {/* Subtle attention indicator summary */}
              {attentionMilestones.length > 0 && (
                <div className={`p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-3 select-none`}>
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse mt-1 shrink-0" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider leading-none">Programme Alerts Requiring Action</span>
                    <p className={`text-[10px] leading-relaxed ${isLight ? "text-black/70" : "text-white/60"}`}>
                      {attentionMilestones.length} major assessments require coordinator intervention to balance supervisor grading load and safeguard student timelines.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Milestones list */}
              <div className="space-y-3">
                {milestones.map((ms) => {
                  const isSelected = ms.id === selectedMilestoneId;
                  const hasAlert = !!ms.attentionAlert;
                  
                  return (
                    <div
                      key={ms.id}
                      onClick={() => setSelectedMilestoneId(ms.id)}
                      className={`p-4 rounded-2xl border transition-all duration-350 cursor-pointer select-none ${
                        isSelected
                          ? isLight
                            ? "border-black bg-black/[0.02] shadow-sm scale-[1.002]"
                            : "border-cyan-500 bg-cyan-950/5 shadow-[0_8px_32px_rgba(6,182,212,0.08)] scale-[1.002]"
                          : hasAlert
                          ? "border-amber-500/20 bg-amber-500/[0.01] hover:border-amber-500/30"
                          : isLight
                          ? "border-black/[0.04] bg-white hover:border-black/10"
                          : "border-white/[0.04] bg-[#0E0E10]/40 hover:border-white/[0.08]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-xs font-bold tracking-tight">{ms.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider font-mono ${
                              ms.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              ms.status === "Review Phase" ? "bg-sky-500/10 border-sky-500/20 text-sky-400" :
                              ms.status === "Finalizing" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" :
                              "bg-white/5 border-white/10 text-white/50"
                            }`}>
                              {ms.status}
                            </span>
                            {hasAlert && (
                              <span className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[8px] font-extrabold text-amber-400 uppercase tracking-wider">
                                <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
                                Alert Flagged
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] block ${isLight ? "text-black/45" : "text-white/40"}`}>
                            Target Submission Window: <strong>{formatEventDate(ms.dueDate)}</strong>
                          </span>
                        </div>

                        {/* Progress numerical stats */}
                        <div className="flex items-baseline gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className={`text-[8px] uppercase tracking-wider block ${isLight ? "text-black/35" : "text-white/30"}`}>Completed</span>
                            <strong className="text-xs font-bold">{ms.completed} <span className={`text-[10px] font-normal ${isLight ? "text-black/40" : "text-white/30"}`}>/ {ms.expected}</span></strong>
                          </div>
                          {ms.late > 0 && (
                            <div className="text-right">
                              <span className="text-[8px] uppercase tracking-wider block text-amber-400/70">Overdue</span>
                              <strong className="text-xs font-bold text-amber-400">{ms.late} candidates</strong>
                            </div>
                          )}
                          <div className="text-right">
                            <span className={`text-[8px] uppercase tracking-wider block ${isLight ? "text-black/35" : "text-white/30"}`}>Progress</span>
                            <strong className="text-xs font-extrabold text-cyan-400">{ms.percentage}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Smooth milestone progress bar */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-black/5" : "bg-white/5"}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ms.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              ms.status === "Completed" ? "bg-emerald-500" :
                              hasAlert ? "bg-amber-400" : "bg-cyan-400"
                            }`}
                          />
                        </div>
                        {hasAlert && (
                          <p className="text-[9px] text-amber-400/90 font-medium">
                            ⚠️ Attention Indicator: {ms.attentionAlert}
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT SIDE: Selected milestone Coordinator Insight drawer (4 cols) */}
            <div className="xl:col-span-4">
              <AnimatePresence mode="wait">
                {selectedMilestone ? (
                  <motion.div
                    key={selectedMilestone.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className={`rounded-2xl border ${styles.cardBg} p-5 shadow-lg space-y-5`}
                  >
                    
                    {/* Header information */}
                    <div>
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest block leading-none ${
                        selectedMilestone.status === "Completed" ? "text-emerald-400" :
                        selectedMilestone.attentionAlert ? "text-amber-400" : "text-cyan-400"
                      }`}>
                        {selectedMilestone.status} Assessment Profile
                      </span>
                      <h3 className="text-sm font-bold leading-tight mt-1">
                        {selectedMilestone.title}
                      </h3>
                      <p className={`text-[10px] mt-1 ${isLight ? "text-black/45" : "text-white/45"}`}>
                        Assessment target window closes on <strong>{formatEventDate(selectedMilestone.dueDate)}</strong>.
                      </p>
                    </div>

                    {/* Analytics progress widgets */}
                    <div className="grid grid-cols-2 gap-2 select-none">
                      <div className={`p-3 rounded-xl border ${isLight ? "bg-black/[0.02] border-black/5" : "bg-black/20 border-white/5"} text-center`}>
                        <span className={`text-[8px] uppercase tracking-wider block ${isLight ? "text-black/35" : "text-white/30"}`}>Compliance Rate</span>
                        <strong className="text-base font-extrabold text-cyan-400">{selectedMilestone.percentage}%</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isLight ? "bg-black/[0.02] border-black/5" : "bg-black/20 border-white/5"} text-center`}>
                        <span className={`text-[8px] uppercase tracking-wider block ${isLight ? "text-black/35" : "text-white/30"}`}>Outstanding</span>
                        <strong className={`text-base font-extrabold ${selectedMilestone.pending > 0 ? "text-amber-400" : ""}`}>
                          {selectedMilestone.pending}
                        </strong>
                      </div>
                    </div>

                    {/* Quick control actions CTAs */}
                    {selectedMilestone.pending > 0 && (
                      <div className="flex gap-2 border-b border-white/[0.04] pb-4 select-none">
                        <button
                          onClick={() => handlePingOutstanding(selectedMilestone.title)}
                          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] uppercase font-bold rounded-lg transition-all text-center"
                        >
                          Ping Late Students
                        </button>
                        <button
                          onClick={() => triggerToast("Supervisor notice list pre-filled & dispatched.")}
                          className={`flex-1 py-2 border text-[9px] uppercase font-bold rounded-lg transition-all text-center ${
                            isLight ? "border-black/10 hover:bg-black/5" : "border-white/10 text-white/80 hover:bg-white/5"
                          }`}
                        >
                          Ping Supervisors
                        </button>
                      </div>
                    )}

                    {/* Risk profiles alert warnings */}
                    {selectedMilestone.riskIndicator && (
                      <div className="p-3 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl space-y-1 select-none">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-400 block leading-none">Assessment Risk Forecast</span>
                        <p className={`text-[10px] leading-relaxed ${isLight ? "text-black/70" : "text-white/60"}`}>
                          {selectedMilestone.riskIndicator}
                        </p>
                      </div>
                    )}

                    {/* Outstanding student list roster */}
                    <div className="space-y-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? "text-black/40" : "text-white/35"}`}>
                        Outstanding Candidates ({selectedMilestone.outstandingStudents.length})
                      </span>
                      {selectedMilestone.outstandingStudents.length > 0 ? (
                        <div className={`rounded-xl border max-h-[140px] overflow-y-auto p-2.5 space-y-2 ${isLight ? "bg-zinc-50 border-black/5" : "bg-[#0E0E10]/40 border-white/5"}`}>
                          {selectedMilestone.outstandingStudents.map((st, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px]">
                              <span className="font-semibold">{st.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-bold px-1.5 rounded ${isLight ? "bg-black/5 text-black/50" : "bg-white/5 text-white/55"}`}>
                                  {st.status}
                                </span>
                                {st.risk !== "none" && (
                                  <span className={`size-1.5 rounded-full ${st.risk === "high" ? "bg-rose-400" : "bg-amber-400"}`} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 text-center rounded-xl border border-dashed text-[10px] italic ${isLight ? "text-black/30" : "text-white/30"}`}>
                          Roster clear. All expectation targets met.
                        </div>
                      )}
                    </div>

                    {/* Supervisors loading index */}
                    <div className="space-y-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? "text-black/40" : "text-white/35"}`}>
                        Supervisor Grading Load
                      </span>
                      <div className={`rounded-xl border max-h-[120px] overflow-y-auto p-2.5 space-y-2 ${isLight ? "bg-zinc-50 border-black/5" : "bg-[#0E0E10]/40 border-white/5"}`}>
                        {selectedMilestone.supervisors.map((sp, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold">{sp.name}</span>
                            <span className={`font-mono text-[9px] font-bold ${sp.outstandingReviews > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                              {sp.outstandingReviews > 0 ? `${sp.outstandingReviews} reviews pending` : "Grades final"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent audit activity timelines */}
                    <div className="space-y-2 border-t border-white/[0.04] pt-3 select-none">
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? "text-black/40" : "text-white/35"}`}>
                        Recent Audit Activity
                      </span>
                      <div className="space-y-1.5">
                        {selectedMilestone.recentActivity.map((ac, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[9px]">
                            <span className="text-cyan-400 mt-0.5">▪</span>
                            <span className={isLight ? "text-black/60" : "text-white/50"}>{ac}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className={`rounded-2xl border ${styles.cardBg} border-dashed p-6 text-center text-xs ${isLight ? "text-black/35" : "text-white/30"}`}>
                    Select an assessment milestone on the timeline to audit compliance and supervisor logs.
                  </div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EVENT CREATION WIZARD MODAL DIALOG ─────────────────────────── */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none">
            
            {/* Glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            {/* Main dialog box container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              
              {/* Wizard header progress */}
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                    Initiative Composer · Step {wizardStep} of 5
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {wizardStep === 1 && "Event Profile"}
                    {wizardStep === 2 && "Temporal Allocation"}
                    {wizardStep === 3 && "Target Audience"}
                    {wizardStep === 4 && "Broadcast Strategy"}
                    {wizardStep === 5 && "Review & Dispatch"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isLight ? "text-black/50 hover:text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Wizard Body content pages */}
              <div className="space-y-4 text-xs font-semibold">
                
                {/* STEP 1: Name, Type, Description */}
                {wizardStep === 1 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Name</label>
                      <input
                        type="text"
                        placeholder="e.g. TOK Exhibition"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                          isLight ? "bg-zinc-50 border-black/10 placeholder-black/35 text-black" : "bg-black/40 border-white/[0.08] placeholder-white/20 text-white"
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["personal", "programme", "school"] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormCategory(cat);
                              if (cat === "personal") {
                                setFormAudience("Private (Creator Only)");
                                setFormType("personal");
                              } else if (cat === "programme") {
                                setFormAudience("DP1");
                                setFormType("exam");
                              } else {
                                setFormAudience("Entire School");
                                setFormType("event");
                              }
                            }}
                            className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wide text-center transition-all ${
                              formCategory === cat
                                ? isLight
                                  ? "border-black bg-black/5 text-black"
                                  : "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-extrabold"
                                : isLight
                                ? "border-black/5 bg-zinc-50 text-black/50 hover:bg-black/5"
                                : "border-white/5 bg-black/20 text-white/50 hover:bg-white/5"
                            }`}
                          >
                            {cat === "personal" ? "🔒 Personal" : cat === "school" ? "🏫 School" : "🎓 Prog"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Type</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as EventType)}
                          className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                            isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                          }`}
                        >
                          {formCategory === "personal" && (
                            <>
                              <option value="personal">Private Appointment</option>
                              <option value="reminder">Personal Reminder</option>
                              <option value="meeting">Personal Meeting</option>
                              <option value="deadline">Task Deadline</option>
                            </>
                          )}
                          {formCategory === "programme" && (
                            <>
                              <option value="exam">Examination</option>
                              <option value="assembly">Programme Assembly</option>
                              <option value="deadline">Programme Deadline</option>
                              <option value="meeting">Department Meeting</option>
                              <option value="event">Workshop / Session</option>
                            </>
                          )}
                          {formCategory === "school" && (
                            <>
                              <option value="event">School Event</option>
                              <option value="holiday">Official Holiday</option>
                              <option value="break">Holiday Break / Recess</option>
                              <option value="ptm">Parent Meeting (PTM)</option>
                              <option value="half-day">Half Day Schedule</option>
                              <option value="working-saturday">Working Saturday</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Science Lab 3"
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                            isLight ? "bg-zinc-50 border-black/10 placeholder-black/35 text-black" : "bg-black/40 border-white/[0.08] placeholder-white/20 text-white"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Suggested by Context Engine (inside Wizard Step 1) */}
                    {!events.some(ev => ev.title.toLowerCase().includes("bake sale")) && !formName.trim() && (
                      <div className="mt-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">Suggested by Context Engine</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">Pre-fill</span>
                        </div>
                        <p className="text-[10px] text-white/70">Found in recent email: &quot;Grade 12 Bake Sale on September 18&quot; in Courtyard.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setFormName("Grade 12 Bake Sale");
                            setFormDesc("Grade 12 Bake Sale event in the courtyard.");
                            setFormCategory("school");
                            setFormType("event");
                            setFormLocation("Central Courtyard");
                            setFormDate("2026-09-18");
                            setFormStartTime("10:00");
                            setFormEndTime("14:00");
                            setFormAudience("All Students & Staff");
                            triggerToast("Prefilled Grade 12 Bake Sale event details.");
                          }}
                          className="w-full text-center py-1.5 rounded bg-cyan-500 text-black text-[9px] font-extrabold hover:bg-cyan-400 transition-colors uppercase tracking-wider"
                        >
                          Use Suggestion
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Date & Time */}
                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Target Date</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                          isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Start Time</label>
                        <input
                          type="text"
                          value={formStartTime}
                          onChange={(e) => setFormStartTime(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                            isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>End Time</label>
                        <input
                          type="text"
                          value={formEndTime}
                          onChange={(e) => setFormEndTime(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                            isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Audience Scope */}
                {wizardStep === 3 && (
                  <div className="space-y-3">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Target Audience Scope</label>
                    {formCategory === "personal" ? (
                      <div className={`p-4 rounded-xl border text-center ${isLight ? "border-indigo-500/20 bg-indigo-500/[0.02]" : "border-indigo-500/20 bg-indigo-500/[0.02]"} space-y-2`}>
                        <span className="text-xl">🔒</span>
                        <h4 className="text-xs font-bold text-indigo-400">Private Personal Event</h4>
                        <p className={`text-[10px] leading-relaxed ${isLight ? "text-black/50" : "text-white/40"}`}>
                          Personal events only appear in your calendar. They never affect students, teachers, parents, or programme schedules.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[
                          "Entire School",
                          "DP1",
                          "DP2",
                          "Selected Students",
                          "Selected Teachers",
                          "Selected Sections",
                          "Custom Group"
                        ].map((aud) => (
                          <label
                            key={aud}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-white/[0.02] transition-colors ${
                              formAudience === aud
                                ? "border-cyan-500 bg-cyan-500/[0.03]"
                                : isLight ? "border-black/5 bg-zinc-50" : "border-white/5 bg-black/20"
                            }`}
                          >
                            <span className="text-[11px] font-semibold">{aud}</span>
                            <input
                              type="radio"
                              name="wizardAudience"
                              checked={formAudience === aud}
                              onChange={() => setFormAudience(aud)}
                              className="size-3 border-white/20 bg-transparent text-cyan-400"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Notifications options */}
                {wizardStep === 4 && (
                  <div className="space-y-3">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Broadcast Channels</label>
                    <div className="space-y-2.5">
                      {[
                        { id: "Add to calendars", desc: "Instantly place this item on calendars for all targeted users." },
                        { id: "Send announcement", desc: "Dispatch a push banner alert via academic notice boards." },
                        { id: "Send notification", desc: "Deliver an operational ping notification inside Axis consoles." },
                        { id: "Send email", desc: "Email a formal bulletin update summarizing description notes." }
                      ].map((item) => {
                        const isChecked = formNotifications.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? "border-cyan-500 bg-cyan-500/[0.03]"
                                : isLight ? "border-black/5 bg-zinc-50" : "border-white/5 bg-black/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setFormNotifications(formNotifications.filter(x => x !== item.id));
                                } else {
                                  setFormNotifications([...formNotifications, item.id]);
                                }
                              }}
                              className="size-3.5 rounded border border-white/20 bg-transparent text-cyan-400 mt-0.5"
                            />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold">{item.id}</span>
                              <span className={`text-[9px] mt-0.5 ${isLight ? "text-black/50" : "text-white/40"}`}>{item.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: Impact Review & Confirmation */}
                {wizardStep === 5 && (
                  <div className="space-y-3">
                    <p className={`text-[10px] leading-relaxed ${isLight ? "text-black/60" : "text-white/50"}`}>
                      Axis has compiled an automatic schedule & occupancy audit. Please review the estimated impact metrics below:
                    </p>

                    <div className={`p-4 rounded-xl border space-y-3.5 ${
                      isLight ? "bg-zinc-50 border-black/5" : "bg-black/30 border-white/5"
                    }`}>
                      <div>
                        <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Initiative Profile</span>
                        <strong className="text-xs text-cyan-400 font-bold">{formName || "Untitled event"}</strong>
                        <span className={`block text-[10px] mt-0.5 ${isLight ? "text-black/60" : "text-white/50"}`}>
                          {formatEventDate(formDate)} · {formStartTime} to {formEndTime} ({formType})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pb-1">
                        <div>
                          <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Candidates</span>
                          <strong className="text-xs">{impactTelemetry.students} students</strong>
                        </div>
                        <div>
                          <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Faculty</span>
                          <strong className="text-xs">{impactTelemetry.teachers} teachers</strong>
                        </div>
                      </div>

                      <div>
                        <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Conflicts Audit</span>
                        {impactTelemetry.conflict ? (
                          <div className="mt-1 p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-[9px]">
                            {impactTelemetry.conflict}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            ✓ Occupancy Clearance (Zero conflicts detected).
                          </span>
                        )}
                      </div>

                      <div>
                        <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Broadcast Summary</span>
                        <p className={`text-[10px] mt-0.5 leading-snug ${isLight ? "text-black/65" : "text-white/50"}`}>
                          Dispatched system-wide calendars and notice alerts via: <strong className="text-cyan-400 font-bold">{formNotifications.join(", ")}</strong>.
                        </p>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Wizard navigation action footer buttons */}
              <div className="pt-3 border-t border-white/5 flex gap-3 mt-2">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className={`flex-1 py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                      isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className={`flex-1 py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                      isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    Cancel
                  </button>
                )}

                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && !formName.trim()) {
                        triggerToast("Event Name is required to proceed.");
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all uppercase tracking-wider rounded-xl ${styles.buttonPrimary}`}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishEvent}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all uppercase tracking-wider rounded-xl ${styles.buttonPrimary}`}
                  >
                    Publish Event
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── EDIT EVENT MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                    Operational Control
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Edit Event
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isLight ? "text-black/50 hover:text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Title</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["personal", "programme", "school"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setEditCategory(cat);
                          if (cat === "personal") {
                            setEditAudience("Private (Creator Only)");
                            setEditType("personal");
                          } else if (cat === "programme") {
                            setEditAudience("DP1");
                            setEditType("exam");
                          } else {
                            setEditAudience("Entire School");
                            setEditType("event");
                          }
                        }}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wide text-center transition-all ${
                          editCategory === cat
                            ? isLight
                              ? "border-black bg-black/5 text-black"
                              : "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-extrabold"
                            : isLight
                            ? "border-black/5 bg-zinc-50 text-black/50 hover:bg-black/5"
                            : "border-white/5 bg-black/20 text-white/50 hover:bg-white/5"
                        }`}
                      >
                        {cat === "personal" ? "🔒 Personal" : cat === "school" ? "🏫 School" : "🎓 Prog"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Event Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as EventType)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    >
                      {editCategory === "personal" && (
                        <>
                          <option value="personal">Private Appointment</option>
                          <option value="reminder">Personal Reminder</option>
                          <option value="meeting">Personal Meeting</option>
                          <option value="deadline">Task Deadline</option>
                        </>
                      )}
                      {editCategory === "programme" && (
                        <>
                          <option value="exam">Examination</option>
                          <option value="assembly">Programme Assembly</option>
                          <option value="deadline">Programme Deadline</option>
                          <option value="meeting">Department Meeting</option>
                          <option value="event">Workshop / Session</option>
                        </>
                      )}
                      {editCategory === "school" && (
                        <>
                          <option value="event">School Event</option>
                          <option value="holiday">Official Holiday</option>
                          <option value="break">Holiday Break / Recess</option>
                          <option value="ptm">Parent Meeting (PTM)</option>
                          <option value="half-day">Half Day Schedule</option>
                          <option value="working-saturday">Working Saturday</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Start Time</label>
                    <input
                      type="text"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>End Time</label>
                    <input
                      type="text"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                </div>

                {editCategory !== "personal" && (
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Target Audience</label>
                    <select
                      value={editAudience}
                      onChange={(e) => setEditAudience(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    >
                      <option value="Entire School">Entire School</option>
                      <option value="DP1">DP1</option>
                      <option value="DP2">DP2</option>
                      <option value="Selected Students">Selected Students</option>
                      <option value="Selected Teachers">Selected Teachers</option>
                      <option value="Selected Sections">Selected Sections</option>
                      <option value="Custom Group">Custom Group</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Memo Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold resize-none ${
                      isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Attachments</label>
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Filename (e.g. syllabus.pdf)"
                          id="edit-attachment-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget;
                              if (input.value.trim()) {
                                setEditAttachments([...editAttachments, input.value.trim()]);
                                input.value = "";
                              }
                            }
                          }}
                          className={`flex-1 p-2 rounded-lg border outline-none font-bold text-[10px] ${
                            isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("edit-attachment-input") as HTMLInputElement;
                            if (input && input.value.trim()) {
                              setEditAttachments([...editAttachments, input.value.trim()]);
                              input.value = "";
                            }
                          }}
                          className="px-3 py-1 bg-cyan-500 text-black rounded-lg text-[9px] font-bold uppercase"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {editAttachments.map((file, idx) => (
                          <span
                            key={idx}
                            onClick={() => setEditAttachments(editAttachments.filter((_, i) => i !== idx))}
                            className="text-[8px] font-mono px-2 py-0.5 rounded border border-red-500/20 bg-red-500/5 text-red-400 flex items-center gap-1 cursor-pointer hover:bg-red-500/10"
                          >
                            📎 {file} ✕
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Notification Channels</label>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {["Add to calendars", "Send announcement", "Send notification", "Send email"].map((notif) => {
                        const isChecked = editNotifications.includes(notif);
                        return (
                          <label key={notif} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setEditNotifications(editNotifications.filter((n) => n !== notif));
                                } else {
                                  setEditNotifications([...editNotifications, notif]);
                                }
                              }}
                              className="size-3 rounded border border-white/20 bg-transparent text-cyan-400"
                            />
                            <span className="text-[10px]">{notif}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-white/5 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                    isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editName.trim()) {
                      triggerToast("Event Name is required.");
                      return;
                    }
                    setEvents((prev) =>
                      prev.map((item) =>
                        item.id === editingEvent.id
                          ? {
                              ...item,
                              title: editName,
                              description: editDesc,
                              type: editType,
                              category: editCategory,
                              date: editDate,
                              startTime: editStartTime,
                              endTime: editEndTime,
                              location: editLocation,
                              audience: editAudience,
                              notificationsSent: editNotifications,
                              attachments: editAttachments,
                              timetableNote: `${editStartTime} - ${editEndTime} · ${editAudience}`
                            }
                          : item
                      )
                    );
                    setShowEditModal(false);
                    triggerToast("Initiative changes applied & broadcast updated.");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all uppercase tracking-wider rounded-xl ${styles.buttonPrimary}`}
                >
                  Save Changes
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DUPLICATE EVENT MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showDuplicateModal && duplicatingEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDuplicateModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                    Event Duplicator
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Duplicate Event
                  </h3>
                </div>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isLight ? "text-black/50 hover:text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className={`p-3 rounded-xl border ${isLight ? "bg-zinc-50 border-black/5 text-black" : "bg-black/20 border-white/5 text-white"} space-y-1`}>
                  <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/30"}`}>Cloning Template</span>
                  <strong className="text-xs">{duplicatingEvent.title}</strong>
                  <span className={`block text-[10px] ${isLight ? "text-black/60" : "text-white/50"}`}>{duplicatingEvent.description}</span>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Target Date</label>
                  <input
                    type="date"
                    value={duplicateDate}
                    onChange={(e) => setDuplicateDate(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Start Time</label>
                    <input
                      type="text"
                      value={duplicateStartTime}
                      onChange={(e) => setDuplicateStartTime(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>End Time</label>
                    <input
                      type="text"
                      value={duplicateEndTime}
                      onChange={(e) => setDuplicateEndTime(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    />
                  </div>
                </div>

                {duplicatingEvent.category !== "personal" && (
                  <div className="space-y-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wide ${isLight ? "text-black/40" : "text-white/35"}`}>Audience</label>
                    <select
                      value={duplicateAudience}
                      onChange={(e) => setDuplicateAudience(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 text-black" : "bg-black/40 border-white/[0.08] text-white"
                      }`}
                    >
                      <option value="Entire School">Entire School</option>
                      <option value="DP1">DP1</option>
                      <option value="DP2">DP2</option>
                      <option value="Selected Students">Selected Students</option>
                      <option value="Selected Teachers">Selected Teachers</option>
                      <option value="Selected Sections">Selected Sections</option>
                      <option value="Custom Group">Custom Group</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  className={`flex-1 py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                    isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newEvent: CalendarEvent = {
                      ...duplicatingEvent,
                      id: `ev-coordinator-dup-${Date.now()}`,
                      date: duplicateDate,
                      startTime: duplicateStartTime,
                      endTime: duplicateEndTime,
                      audience: duplicatingEvent.category === "personal" ? "Private (Creator Only)" : duplicateAudience,
                      status: "active",
                      timetableNote: `${duplicateStartTime} - ${duplicateEndTime} · ${duplicatingEvent.category === "personal" ? "Private" : duplicateAudience}`
                    };
                    setEvents((prev) => [...prev, newEvent]);
                    setShowDuplicateModal(false);
                    triggerToast("Event successfully duplicated.");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all uppercase tracking-wider rounded-xl ${styles.buttonPrimary}`}
                >
                  Duplicate
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRMATION MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && deletingEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-widest block font-mono">
                    System Removal Request
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500">
                    Confirm Event Deletion
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isLight ? "text-black/50 hover:text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-black/70" : "text-white/60"}`}>
                  Are you sure you want to delete <strong className={`${isLight ? "text-black" : "text-white"} font-bold`}>&quot;{deletingEvent.title}&quot;</strong>? This action will permanently remove it from all calendars, notifications, and reminders.
                </p>

                <div className={`p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02] space-y-3`}>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Impact Analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/30"}`}>Affected Users</span>
                      <strong className="text-xs">
                        {deletingEvent.category === "personal" ? "0 Users (Private)" : deletingEvent.audience === "Entire School" ? "620 Users" : deletingEvent.audience === "DP1" ? "142 Students" : deletingEvent.audience === "DP2" ? "120 Students" : "35 Students"}
                      </strong>
                    </div>

                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/30"}`}>Affected Groups</span>
                      <strong className="text-xs truncate block max-w-full">
                        {deletingEvent.category === "personal" ? "None" : deletingEvent.affectedGroups?.join(", ") || "Grade cohorts"}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/30"}`}>Notifications To Be Removed</span>
                    <p className={`text-[10px] text-rose-400 mt-0.5 leading-snug`}>
                      {deletingEvent.category === "personal" ? "No push notices" : `${deletingEvent.notificationsSent?.length || 2} active notice pings and calendar sync tokens will be deleted.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                    isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEvents((prev) => prev.filter((item) => item.id !== deletingEvent.id));
                    setShowDeleteModal(false);
                    triggerToast("Event deleted successfully from all systems.");
                  }}
                  className="flex-1 py-2.5 text-xs font-bold transition-all uppercase tracking-wider rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-center shadow-md shadow-rose-600/10"
                >
                  Delete Event
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── VIEW IMPACT MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showImpactModal && impactEvent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImpactModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">
                    Coordination Intel
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Event Impact Analysis
                  </h3>
                </div>
                <button
                  onClick={() => setShowImpactModal(false)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    isLight ? "text-black/50 hover:text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isLight ? "bg-zinc-50 border-black/5" : "bg-black/30 border-white/5"
                }`}>
                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Initiative Profile</span>
                    <strong className="text-xs text-cyan-400 font-bold">{impactEvent.title}</strong>
                    <span className={`block text-[10px] mt-0.5 ${isLight ? "text-black/60" : "text-white/50"}`}>
                      {formatEventDate(impactEvent.date)} · {impactEvent.startTime && impactEvent.endTime ? `${impactEvent.startTime} to ${impactEvent.endTime}` : impactEvent.timetableNote} ({impactEvent.type})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Candidates</span>
                      <strong className="text-xs">
                        {impactEvent.category === "personal" ? "0 students (Private)" : impactEvent.audience === "Entire School" ? "620 students" : impactEvent.audience === "DP1" ? "142 students" : impactEvent.audience === "DP2" ? "120 students" : "35 students"}
                      </strong>
                    </div>
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Faculty</span>
                      <strong className="text-xs">
                        {impactEvent.category === "personal" ? "0 teachers (Private)" : impactEvent.audience === "Entire School" ? "48 teachers" : impactEvent.audience === "DP1" ? "12 teachers" : impactEvent.audience === "DP2" ? "10 teachers" : "4 teachers"}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Facility & Conflict Audit</span>
                    {impactEvent.category === "personal" ? (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                        ✓ Private event. No campus room booking conflict.
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                        ✓ Campus location &quot;{impactEvent.location || "Main Campus"}&quot; checked. Zero scheduling room conflicts detected.
                      </span>
                    )}
                  </div>

                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Broadcast Summary</span>
                    <p className={`text-[10px] mt-0.5 leading-snug ${isLight ? "text-black/65" : "text-white/50"}`}>
                      {impactEvent.category === "personal" ? "No notification channels active. Event visible to creator only." : `Dispatched system-wide calendars and notice alerts via: ${impactEvent.notificationsSent?.join(", ") || "Add to calendars, Send announcement"}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex mt-2">
                <button
                  type="button"
                  onClick={() => setShowImpactModal(false)}
                  className={`w-full py-2.5 border text-xs font-semibold uppercase tracking-wider transition-all text-center rounded-xl ${
                    isLight ? "border-black/10 text-black/70 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Close Impact Analysis
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── TOAST POP-UP SYSTEM ────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[250] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.9)] max-w-sm ${
              isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10]/95 border-cyan-500/20 text-white"
            }`}
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/[0.12] border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
              ✓
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold leading-none">System Synchronized</span>
              <span className={`text-[10px] leading-tight ${isLight ? "text-black/50" : "text-white/45"}`}>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
