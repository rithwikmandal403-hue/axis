"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────

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
  endDate?: string; // for multi-day events
  title: string;
  type: EventType;
  description: string;
  impactedClasses?: number;
  timetableNote?: string;
  affectedGroups?: string[];
  preparation?: string;
};

type DayInfo = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
};

// ─── Operational Calendar Data (Academic Year 2025–26) ──────────────────

const CALENDAR_EVENTS: CalendarEvent[] = [
  // ── May 2026 ──
  {
    id: "ev-may-1",
    date: "2026-05-01",
    title: "Labour Day",
    type: "holiday",
    description: "National holiday. School closed for all students and staff.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
  },
  {
    id: "ev-may-3",
    date: "2026-05-03",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Compensatory working day for extended Holi break. Modified timetable active.",
    timetableNote: "Monday timetable follows.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)", "Homeroom 11-F"],
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
  },
  {
    id: "ev-may-10",
    date: "2026-05-10",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Regular working Saturday. Wednesday timetable follows.",
    timetableNote: "Wednesday timetable follows.",
    affectedGroups: ["All assigned classes"],
  },
  {
    id: "ev-may-12",
    date: "2026-05-12",
    title: "Buddha Purnima",
    type: "holiday",
    description: "School closed. Buddhist cultural observance.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
  },
  {
    id: "ev-may-15",
    date: "2026-05-15",
    title: "Lab Safety Inspection",
    type: "event",
    description: "Annual safety inspection for Lab 3 and Lab 4. Physics equipment audit.",
    preparation: "Ensure all lab equipment is catalogued and safety checklist is updated.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
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
  },
  {
    id: "ev-may-29",
    date: "2026-05-29",
    title: "IA Draft Deadline",
    type: "event",
    description: "Final submission deadline for Physics IA Phase 2 drafts.",
    affectedGroups: ["Grade 11 Physics (B)"],
    preparation: "Review submitted drafts. Flag incomplete submissions.",
  },
  {
    id: "ev-may-30",
    date: "2026-05-30",
    title: "Sports Day",
    type: "event",
    description: "Annual inter-house athletics meet. Classes suspended after Period 3.",
    impactedClasses: 3,
    timetableNote: "Only Periods 1–3 active. Sports events from 12:00 PM.",
  },
  {
    id: "ev-may-31",
    date: "2026-05-31",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Compensatory working day. Thursday timetable follows.",
    timetableNote: "Thursday timetable follows.",
    affectedGroups: ["All assigned classes"],
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
  },
  {
    id: "ev-jun-7",
    date: "2026-06-07",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Pre-break compensatory day. Friday timetable follows.",
    timetableNote: "Friday timetable follows.",
    affectedGroups: ["All assigned classes"],
  },
  {
    id: "ev-jun-10",
    date: "2026-06-10",
    title: "Eid al-Adha (Tentative)",
    type: "holiday",
    description: "Subject to moon sighting. School closed.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
  },
  {
    id: "ev-jun-15",
    date: "2026-06-15",
    title: "Teacher Professional Development",
    type: "event",
    description: "Full-day PD workshop on IB assessment strategies. Mandatory for all IB teachers.",
    timetableNote: "No student classes. Workshop in Conference Hall.",
    preparation: "Bring laptop and current assessment rubrics.",
  },
  {
    id: "ev-jun-20",
    date: "2026-06-20",
    title: "Half Day",
    type: "half-day",
    description: "School ends at 12:30 PM. Staff meetings in the afternoon.",
    impactedClasses: 3,
    timetableNote: "Only morning periods active.",
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
    preparation: "Ensure all exam papers are submitted and printed.",
  },
  {
    id: "ev-jun-28",
    date: "2026-06-28",
    title: "PTM",
    type: "ptm",
    description: "Parent-Teacher Meeting for mid-term review.",
    timetableNote: "No regular classes. PTM slots 9 AM – 2 PM.",
    preparation: "Prepare mid-term progress reports.",
  },
  // ── July 2026 ──
  {
    id: "ev-jul-4",
    date: "2026-07-04",
    title: "Working Saturday",
    type: "working-saturday",
    description: "Compensatory working day. Tuesday timetable follows.",
    timetableNote: "Tuesday timetable follows.",
    affectedGroups: ["All assigned classes"],
  },
  {
    id: "ev-jul-10",
    date: "2026-07-10",
    title: "Science Fair",
    type: "event",
    description: "Annual inter-school science exhibition. Physics department showcases student projects.",
    preparation: "Coordinate 5 student project displays. Ensure Lab 3 equipment is available.",
    affectedGroups: ["Grade 11 Physics (B)", "Grade 12 Adv Physics (A)"],
  },
  {
    id: "ev-jul-17",
    date: "2026-07-17",
    title: "Muharram",
    type: "holiday",
    description: "School closed for Muharram observance.",
    impactedClasses: 6,
    timetableNote: "All classes cancelled.",
  },
  {
    id: "ev-jul-25",
    date: "2026-07-25",
    title: "Grade Assembly",
    type: "assembly",
    description: "Grade 12 farewell assembly preparation and rehearsal.",
    impactedClasses: 1,
    timetableNote: "Period 5–6 reserved for rehearsal.",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const WEEKDAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateToKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
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
      return { dot: "bg-white/60", bg: "bg-white/[0.03]", label: "Event", border: "border-white/10" };
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
  }
}

function buildMonthGrid(year: number, month: number, today: Date, events: CalendarEvent[]): DayInfo[] {
  const firstDayOfMonth = new Date(year, month, 1);
  // Monday=0 ── Sunday=6
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

// ─── Component ──────────────────────────────────────────────────

export function CalendarWorkspace() {
  const today = useMemo(() => new Date(), []);
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [dismissedEventIds, setDismissedEventIds] = useState<Set<string>>(new Set());

  // Inline forms states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);

  // Form input states
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndTime, setEventEndTime] = useState("10:00");
  const [eventDuration, setEventDuration] = useState("1 hour");
  const [eventNotes, setEventNotes] = useState("");
  const [eventAlert, setEventAlert] = useState(false);

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderAlert, setReminderAlert] = useState(false);

  // Reset forms when selectedDay changes
  useEffect(() => {
    setShowAddEvent(false);
    setShowAddReminder(false);
  }, [selectedDay]);

  // Listen for context auto-action events (from Messages)
  useEffect(() => {
    const handleContextAutoAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, context, autoOpen } = customEvent.detail;

      if (type === "event" && autoOpen && context) {
        // Auto-fill form with context data
        setEventTitle(context.title || "Event");
        setEventDesc(context.description || "");
        
        // Set time if available
        if (context.time) {
          setEventStartTime(context.time);
          const [hours, minutes] = context.time.split(':').map(Number);
          const endHours = (hours + 1) % 24; // Add 1 hour
          setEventEndTime(`${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }

        // Set selected day to the context date
        if (context.date) {
          const parts = context.date.split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2], 10);
          setViewYear(year);
          setViewMonth(month);
          
          const contextDate = new Date(year, month, day);
          const dayInfo: DayInfo = {
            date: contextDate,
            dayOfMonth: day,
            isCurrentMonth: month === today.getMonth() && year === today.getFullYear(),
            isToday: false,
            isWeekend: contextDate.getDay() === 0 || contextDate.getDay() === 6,
            events: []
          };
          setSelectedDay(dayInfo);
        }

        // Auto-open the event creation form
        setShowAddEvent(true);
      } else if (type === "meeting" && autoOpen && context) {
        // Meetings also use event creation
        setEventTitle(context.title || "Meeting");
        setEventDesc(context.description || "");
        
        if (context.time) {
          setEventStartTime(context.time);
          const [hours, minutes] = context.time.split(':').map(Number);
          const endHours = (hours + 1) % 24;
          setEventEndTime(`${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }

        if (context.date) {
          const parts = context.date.split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          setViewYear(year);
          setViewMonth(month);
          
          const contextDate = new Date(year, month, day);
          const dayInfo: DayInfo = {
            date: contextDate,
            dayOfMonth: day,
            isCurrentMonth: month === today.getMonth() && year === today.getFullYear(),
            isToday: false,
            isWeekend: contextDate.getDay() === 0 || contextDate.getDay() === 6,
            events: []
          };
          setSelectedDay(dayInfo);
        }

        setShowAddEvent(true);
      }
    };

    window.addEventListener("axis-context-auto-action", handleContextAutoAction);
    return () => window.removeEventListener("axis-context-auto-action", handleContextAutoAction);
  }, [today]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedDay) return;

    const newEvent: CalendarEvent = {
      id: `ev-custom-${Date.now()}`,
      date: dateToKey(selectedDay.date),
      title: eventTitle,
      type: "personal",
      description: eventDesc,
      timetableNote: `Private · ${eventStartTime} - ${eventEndTime} (${eventDuration})`,
      preparation: eventNotes ? `Notes: ${eventNotes}` : undefined,
      affectedGroups: eventAlert ? ["With active alert"] : [],
    };

    setEvents((prev) => [...prev, newEvent]);

    const lowerTitle = eventTitle.toLowerCase();
    if (lowerTitle.includes("lab prep") || lowerTitle.includes("lab safety") || lowerTitle.includes("lab preparation")) {
      const contextEvent = new CustomEvent("axis-add-context-item", {
        detail: {
          id: `cap-cal-lab-${Date.now()}`,
          type: "resource",
          title: "Physics practical tomorrow",
          description: `Lab Preparation is scheduled on ${formatEventDate(newEvent.date)}. Prism kits and equipment are catalogued and ready in Lab 3.`,
          actionLabel: "View Lab Setup",
          meta: "Lab Prep · Active",
          active: true,
        }
      });
      window.dispatchEvent(contextEvent);
    } else if (lowerTitle.includes("parent meeting") || lowerTitle.includes("ptm") || lowerTitle.includes("parent-teacher")) {
      const contextEvent = new CustomEvent("axis-add-context-item", {
        detail: {
          id: `cap-cal-ptm-${Date.now()}`,
          type: "counselor",
          title: "Parent Meeting Approaching",
          description: `Scheduled Parent Meeting starts in 30 minutes. Student performance reports are prepared.`,
          actionLabel: "Open Portfolios",
          meta: "Calendar Alert · 30m away",
          active: true,
        }
      });
      window.dispatchEvent(contextEvent);
    }

    setEventTitle("");
    setEventDesc("");
    setEventStartTime("09:00");
    setEventEndTime("10:00");
    setEventDuration("1 hour");
    setEventNotes("");
    setEventAlert(false);
    setShowAddEvent(false);

    setSelectedDay((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        events: [...prev.events, newEvent],
      };
    });
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !selectedDay) return;

    const newReminder: CalendarEvent = {
      id: `ev-custom-${Date.now()}`,
      date: dateToKey(selectedDay.date),
      title: reminderTitle,
      type: "reminder",
      description: `Reminder created on calendar. ${reminderAlert ? "Alert enabled." : ""}`,
      timetableNote: reminderAlert ? "Alert active" : undefined,
    };

    setEvents((prev) => [...prev, newReminder]);

    const lowerTitle = reminderTitle.toLowerCase();
    if (lowerTitle.includes("meet coordinator") || lowerTitle.includes("coordinator")) {
      const contextEvent = new CustomEvent("axis-add-context-item", {
        detail: {
          id: `cap-cal-coord-${Date.now()}`,
          type: "coordination",
          title: "Meet Coordinator",
          description: `Schedule reminder: Meet Coordinator regarding the Grade 11 Physics syllabus coverage timeline.`,
          actionLabel: "View Syllabus",
          meta: "Calendar Alert · Reminder",
          active: true,
        }
      });
      window.dispatchEvent(contextEvent);
    }

    setReminderTitle("");
    setReminderAlert(false);
    setShowAddReminder(false);

    setSelectedDay((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        events: [...prev.events, newReminder],
      };
    });
  };

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth, today, events), [viewYear, viewMonth, today, events]);

  // Compute upcoming holidays & breaks
  const upcomingHolidays = useMemo(() => {
    const todayKey = dateToKey(today);
    return events
      .filter((ev) => ev.date >= todayKey && (ev.type === "holiday" || ev.type === "break"))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
      .map((ev) => {
        const evDate = new Date(ev.date + "T00:00:00");
        const diffMs = evDate.getTime() - today.getTime();
        const daysAway = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        let duration: string | undefined;
        if (ev.endDate) {
          const end = new Date(ev.endDate + "T00:00:00");
          const dur = Math.ceil((end.getTime() - evDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          duration = `${dur} days`;
        }
        return { ...ev, daysAway, duration };
      });
  }, [today, events]);

  // Compute upcoming events (future events sorted by date)
  const upcomingEvents = useMemo(() => {
    const todayKey = dateToKey(today);
    return events
      .filter((ev) => ev.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [today, events]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDay(null);
  };

  const handleDismissEvent = (id: string) => {
    setDismissedEventIds((prev) => new Set(prev).add(id));
  };

  // Format date for display
  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return `${dayNames[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-safe-lg w-full">

      {/* ═══════════════════════════════════════════════════════
          LEFT: MONTH GRID + OPERATIONAL OUTLOOK
          ═══════════════════════════════════════════════════════ */}
      <div className="space-y-safe-lg">

        {/* ─── Monthly View ─────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg md:p-safe-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={goToToday}
                className="rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevMonth}
                className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAY_LABELS.map((wd) => (
              <div key={wd} className="text-center text-[11px] font-semibold text-white/35 uppercase tracking-wider py-1.5">
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {grid.map((day, idx) => {
              const hasEvents = day.events.length > 0;
              const isSelected = selectedDay && isSameDay(day.date, selectedDay.date);

              const holidayEvent = day.events.find(ev => ev.type === "holiday");
              const breakEvent = day.events.find(ev => ev.type === "break");
              const workingSaturdayEvent = day.events.find(ev => ev.type === "working-saturday");

              let cellClass = "border-transparent ";
              let textClass = "text-white/70 group-hover:text-white ";

              if (isSelected) {
                cellClass = "border-white/25 bg-white/[0.06] ";
              } else {
                if (holidayEvent) {
                  cellClass = "border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.05] hover:border-red-500/20 ";
                  textClass = "text-red-400/80 group-hover:text-red-300 ";
                } else if (breakEvent) {
                  cellClass = "border-teal-500/10 bg-teal-500/[0.03] hover:bg-teal-500/[0.05] hover:border-teal-500/20 ";
                  textClass = "text-teal-400/80 group-hover:text-teal-300 ";
                } else if (workingSaturdayEvent) {
                  cellClass = "border-amber-500/10 bg-amber-500/[0.02] hover:bg-amber-500/[0.04] hover:border-amber-500/20 ";
                  textClass = "text-amber-400/90 group-hover:text-amber-300 ";
                } else if (day.isWeekend) {
                  cellClass = "border-white/[0.03] bg-white/[0.015] hover:bg-white/[0.025] ";
                  textClass = "text-white/25 group-hover:text-white/40 ";
                } else {
                  cellClass = "border-transparent hover:bg-white/[0.03] ";
                  textClass = "text-white/70 group-hover:text-white ";
                }
              }

              if (day.isToday) {
                textClass = "bg-white text-[#0A0A0C] rounded-full size-7 flex items-center justify-center font-bold ";
              }

              const opacityClass = !day.isCurrentMonth ? "opacity-25" : "";

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center justify-start rounded-lg py-2.5 px-1 min-h-[80px] border transition-all duration-200 group ${cellClass} ${opacityClass}`}
                >
                  {/* Day number */}
                  <span className={`text-sm font-semibold leading-none transition-colors ${textClass}`}>
                    {day.dayOfMonth}
                  </span>

                  {/* Event indicators */}
                  {hasEvents && day.isCurrentMonth && (
                    <div className="flex flex-col items-center gap-0.5 mt-2 w-full">
                      {day.events.slice(0, 2).map((ev) => {
                        const style = getEventTypeStyle(ev.type);
                        return (
                          <span
                            key={ev.id}
                            className={`w-full max-w-[calc(100%-4px)] text-[8px] font-semibold text-center truncate rounded py-0.5 px-1 ${style.bg} ${
                              ev.type === "holiday" ? "text-red-400/90" :
                              ev.type === "working-saturday" ? "text-amber-400/90" :
                              ev.type === "ptm" ? "text-violet-400/90" :
                              ev.type === "exam" ? "text-sky-400/90" :
                              ev.type === "assembly" ? "text-emerald-400/90" :
                              ev.type === "break" ? "text-teal-400/90" :
                              ev.type === "half-day" ? "text-orange-400/90" :
                              ev.type === "personal" ? "text-indigo-400/90" :
                              ev.type === "reminder" ? "text-fuchsia-400/90" :
                              ev.type === "meeting" ? "text-blue-400/90" :
                              ev.type === "deadline" ? "text-rose-400/90" :
                              "text-white/60"
                            }`}
                          >
                            {ev.title.length > 10 ? ev.title.slice(0, 9) + "..." : ev.title}
                          </span>
                        );
                      })}
                      {day.events.length > 2 && (
                        <span className="text-[8px] text-white/35 font-medium">+{day.events.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-wrap gap-x-6 gap-y-2">
            {(["holiday","working-saturday","ptm","exam","assembly","event","break","half-day","personal","reminder","meeting","deadline"] as EventType[]).map((type) => {
              const s = getEventTypeStyle(type);
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${s.dot}`} />
                  <span className="text-[11px] text-white/45 font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg md:p-safe-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white/90 tracking-tight">Upcoming Holidays</h3>
            <span className="text-[11px] text-white/30 font-medium">School Closures & Breaks</span>
          </div>

          {upcomingHolidays.length > 0 ? (
            <div className="space-y-3">
              {upcomingHolidays.map((hol, idx) => (
                <motion.button
                  key={hol.id}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => {
                    const d = new Date(hol.date + "T00:00:00");
                    setViewYear(d.getFullYear());
                    setViewMonth(d.getMonth());
                    const dayGrid = buildMonthGrid(d.getFullYear(), d.getMonth(), today, events);
                    const match = dayGrid.find((di) => isSameDay(di.date, d));
                    if (match) setSelectedDay(match);
                  }}
                  className="w-full flex items-center gap-4 text-left rounded-xl border border-white/[0.06] bg-white/[0.01] px-4 py-3.5 group hover:bg-white/[0.03] transition-all cursor-pointer focus:outline-none focus:border-white/20 animate-none"
                >
                  <div className="flex flex-col items-center justify-center shrink-0 w-10">
                    <span className="text-lg font-bold text-white/80 leading-none">
                      {new Date(hol.date + "T00:00:00").getDate()}
                    </span>
                    <span className="text-[9px] text-white/35 font-semibold uppercase mt-0.5">
                      {MONTHS[new Date(hol.date + "T00:00:00").getMonth()].slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white/85 block truncate">{hol.title}</span>
                    <span className="text-[11px] text-white/35 block mt-0.5 font-medium">
                      {hol.daysAway === 0 ? "Today" : hol.daysAway === 1 ? "Tomorrow" : `In ${hol.daysAway} days`}
                      {hol.duration && ` · ${hol.duration}`}
                    </span>
                  </div>
                  <span className={`size-2 rounded-full shrink-0 ${hol.type === "break" ? "bg-teal-400" : "bg-red-400"}`} />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-white/20 text-center py-8 italic">
              No upcoming holidays scheduled.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT: SELECTED DAY DETAIL + UPCOMING TIMELINE
          ═══════════════════════════════════════════════════════ */}
      <div className="space-y-safe-lg">

        {/* Selected Day Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedDay ? (
            <motion.div
              key={dateToKey(selectedDay.date)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-safe-md md:p-safe-lg shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                    {selectedDay.isToday ? "Today" : "Selected Day"}
                  </span>
                  <h3 className="text-base font-semibold text-white/95 mt-1">
                    {WEEKDAY_LABELS[(selectedDay.date.getDay() + 6) % 7]}, {MONTHS[selectedDay.date.getMonth()]} {selectedDay.dayOfMonth}
                  </h3>
                </div>
                {selectedDay.isWeekend && selectedDay.events.length === 0 && (
                  <span className="text-[10px] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded text-white/45 font-semibold">Weekend</span>
                )}
                {selectedDay.isToday && (
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
                  </span>
                )}
              </div>

              {!showAddEvent && !showAddReminder && (
                <>
                  {selectedDay.events.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDay.events.map((ev) => {
                        const style = getEventTypeStyle(ev.type);
                        const isDismissed = dismissedEventIds.has(ev.id);
                        return (
                          <div
                            key={ev.id}
                            className={`rounded-xl border ${style.border} ${style.bg} p-safe-md transition-all ${isDismissed ? "opacity-40" : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`size-2.5 rounded-full shrink-0 ${style.dot}`} />
                                <span className="text-[10px] font-bold text-white/45 uppercase tracking-widest">{style.label}</span>
                              </div>
                              {!isDismissed && (
                                <button
                                  onClick={() => handleDismissEvent(ev.id)}
                                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-white/90 mt-2">{ev.title}</h4>
                            <p className="text-[11px] text-white/50 leading-relaxed mt-1.5">{ev.description}</p>

                            {/* Impact tags */}
                            <div className="mt-3 space-y-1.5">
                              {ev.impactedClasses && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-white/35 uppercase tracking-widest font-bold w-14">Impact</span>
                                  <span className="text-[11px] text-white/60 font-medium">{ev.impactedClasses} classes affected</span>
                                </div>
                              )}
                              {ev.timetableNote && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-white/35 uppercase tracking-widest font-bold w-14">Schedule</span>
                                  <span className="text-[11px] text-white/60 font-medium">{ev.timetableNote}</span>
                                </div>
                              )}
                              {ev.preparation && (
                                <div className="flex items-start gap-2">
                                  <span className="text-[9px] text-white/35 uppercase tracking-widest font-bold w-14 mt-0.5">Prep</span>
                                  <span className="text-[11px] text-white/60 font-medium leading-relaxed">{ev.preparation}</span>
                                </div>
                              )}
                              {ev.affectedGroups && ev.affectedGroups.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-[9px] text-white/35 uppercase tracking-widest font-bold w-14 mt-0.5">Groups</span>
                                  <div className="flex flex-wrap gap-1">
                                    {ev.affectedGroups.map((g) => (
                                      <span key={g} className="text-[10px] border border-white/[0.08] bg-white/[0.02] rounded px-2 py-0.5 text-white/50 font-medium">{g}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-sm text-white/25 italic">
                        {selectedDay.isWeekend ? "Weekend · No scheduled events." : "No operational events scheduled."}
                      </span>
                      {!selectedDay.isWeekend && (
                        <p className="text-[11px] text-white/20 mt-1.5">Regular timetable active.</p>
                      )}
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(true)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-center text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      + Add Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddReminder(true)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-center text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      + Add Reminder
                    </button>
                  </div>
                </>
              )}

              {/* Add Event Form */}
              {showAddEvent && (
                <form onSubmit={handleSaveEvent} className="mt-2 space-y-3.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/45 uppercase tracking-wider">New Personal Event</span>
                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded px-1.5 py-0.5 font-semibold">Private</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 font-semibold block">Event Title</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Lab Preparation"
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 font-semibold block">Description</label>
                    <textarea
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="Brief notes about this event..."
                      rows={2}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 font-semibold block">Start Time</label>
                      <input
                        type="text"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 font-semibold block">End Time</label>
                      <input
                        type="text"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 font-semibold block">Duration</label>
                      <input
                        type="text"
                        value={eventDuration}
                        onChange={(e) => setEventDuration(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/45 font-semibold block">Optional Notes</label>
                      <input
                        type="text"
                        value={eventNotes}
                        onChange={(e) => setEventNotes(e.target.value)}
                        placeholder="e.g. Lab 3 safety checklists"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 bg-white/[0.01] border border-white/[0.04] rounded-lg px-2.5">
                    <span className="text-[10px] text-white/50 font-semibold">Enable Context Alert</span>
                    <button
                      type="button"
                      onClick={() => setEventAlert(!eventAlert)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        eventAlert ? "bg-indigo-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          eventAlert ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-center text-xs font-semibold text-white/50 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-white py-2 text-center text-xs font-bold text-[#0A0A0C] hover:opacity-90 transition-all"
                    >
                      Save Event
                    </button>
                  </div>
                </form>
              )}

              {showAddReminder && (
                <form onSubmit={handleSaveReminder} className="mt-2 space-y-3.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/45 uppercase tracking-wider">New Reminder</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/45 font-semibold block">Reminder Target</label>
                    <input
                      type="text"
                      required
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      placeholder="e.g. Prepare Lab Equipment"
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1 bg-white/[0.01] border border-white/[0.04] rounded-lg px-2.5">
                    <span className="text-[10px] text-white/50 font-semibold">Enable Alert</span>
                    <button
                      type="button"
                      onClick={() => setReminderAlert(!reminderAlert)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        reminderAlert ? "bg-fuchsia-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          reminderAlert ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddReminder(false)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-center text-xs font-semibold text-white/50 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-white py-2 text-center text-xs font-bold text-[#0A0A0C] hover:opacity-90 transition-all"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg text-center"
            >
              <div className="py-8">
                <svg className="size-9 mx-auto text-white/15 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="text-sm text-white/30 font-medium block">Select a day to view details</span>
                <span className="text-[11px] text-white/20 block mt-1">Click any date on the calendar</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Upcoming Operational Timeline ─────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-md md:p-safe-lg shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/90 tracking-tight">Upcoming Events</h3>
            <span className="text-[11px] text-white/30 font-medium">Timeline</span>
          </div>

          <div className="space-y-1">
            {upcomingEvents.map((ev, idx) => {
              const style = getEventTypeStyle(ev.type);
              const isFirst = idx === 0;
              return (
                <button
                  key={ev.id}
                  onClick={() => {
                    const d = new Date(ev.date + "T00:00:00");
                    setViewYear(d.getFullYear());
                    setViewMonth(d.getMonth());
                    const dayGrid = buildMonthGrid(d.getFullYear(), d.getMonth(), today, events);
                    const match = dayGrid.find((di) => isSameDay(di.date, d));
                    if (match) setSelectedDay(match);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all group ${
                    isFirst ? "bg-white/[0.03] border border-white/[0.06]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center gap-0.5 self-stretch">
                    <span className={`size-2 rounded-full shrink-0 mt-1 ${style.dot}`} />
                    {idx < upcomingEvents.length - 1 && (
                      <span className="w-px flex-1 bg-white/[0.06]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white/80 group-hover:text-white/95 block truncate transition-colors">
                      {ev.title}
                    </span>
                    <span className="text-[10px] text-white/35 block mt-0.5 font-medium">
                      {formatEventDate(ev.date)}
                      {ev.endDate && ` – ${formatEventDate(ev.endDate)}`}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 ${
                    ev.type === "holiday" ? "text-red-400/60" :
                    ev.type === "exam" ? "text-sky-400/60" :
                    ev.type === "ptm" ? "text-violet-400/60" :
                    ev.type === "working-saturday" ? "text-amber-400/60" :
                    "text-white/30"
                  }`}>
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

