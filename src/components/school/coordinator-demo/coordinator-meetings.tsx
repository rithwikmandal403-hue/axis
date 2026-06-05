"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";
import { ResourcePickerModal } from "./connected-resources";

type Meeting = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  type: "in-person" | "online" | "hybrid";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  attendees: string[];
  location?: string;
  meetingLink?: string;
  priority: "high" | "medium" | "low";
  attachments?: string[];
  decisionsMade?: string[];
  meetingNotes?: string;
};

type CoordinatorMeetingsProps = {
  theme?: Theme;
};

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "m-parent",
    title: "DP Parent Conference",
    description: "Cohort alignment session to review IA workloads, predicted grades policy, and exam schedules",
    date: "2026-06-05", // Tomorrow
    time: "16:00",
    duration: "2h",
    type: "hybrid",
    status: "upcoming",
    attendees: ["Ms. Sarah Thompson", "DP1 & DP2 Parents", "Subject Leads"],
    location: "Main Auditorium",
    meetingLink: "https://meet.axis.edu/dp-parent-townhall",
    priority: "high",
    attachments: ["Assessment Policy & Criteria.pdf"],
    meetingNotes: "Prepare slides summarizing mock exam timelines and university counselor assignment lists.",
  },
  {
    id: "m-cas",
    title: "CAS Progress Meeting",
    description: "CAS reflections check and final candidate portfolio approval reviews",
    date: "2026-06-08", // This Week
    time: "11:00",
    duration: "1h",
    type: "online",
    status: "upcoming",
    attendees: ["Ms. Sarah Thompson", "Aarav Chen", "CAS Advisors"],
    meetingLink: "https://meet.axis.edu/cas-progress-sync",
    priority: "medium",
    attachments: [],
    meetingNotes: "Focus on students with fewer than 3 documented reflections. Ensure advisor flags are logged.",
  },
  {
    id: "m-ee",
    title: "EE Supervisor Checkpoint",
    description: "Draft feedback progress check and caseload balance audits for DP1 & DP2 candidates",
    date: "2026-06-10", // This Week
    time: "14:00",
    duration: "1h",
    type: "online",
    status: "upcoming",
    attendees: ["Ms. Sarah Thompson", "Marcus Vance", "Ananya Rao", "EE Supervisors"],
    meetingLink: "https://meet.axis.edu/ee-supervisor-sync",
    priority: "high",
    attachments: ["Extended Essay Supervisor Guide.pdf"],
    meetingNotes: "Double-check advisor loading. Identify supervisors with more than 5 candidates.",
  },
  {
    id: "m-tok",
    title: "TOK Exhibition Review",
    description: "Review TOK exhibition grading criteria and schedule supervisor review slots",
    date: "2026-06-15", // Next Week
    time: "09:00",
    duration: "1.5h",
    type: "in-person",
    status: "upcoming",
    attendees: ["Ms. Sarah Thompson", "Aarav Chen", "Clara Dupont", "TOK Advisors"],
    location: "Library Conference Room",
    priority: "high",
    attachments: ["Academic Honesty Policy.pdf", "TOK Exhibition Guidelines.pdf"],
    meetingNotes: "Align grading standards for the internal exhibition. Prepare moderation feedback templates.",
  },
  {
    id: "m-univ",
    title: "University Guidance Sync",
    description: "Review predicted grade alignment and final transcript packages with counseling staff",
    date: "2026-06-20", // Next Week
    time: "10:00",
    duration: "2h",
    type: "hybrid",
    status: "upcoming",
    attendees: ["Ms. Sarah Thompson", "University Counselors", "Michael Torres"],
    location: "Executive Suite",
    meetingLink: "https://meet.axis.edu/university-counseling",
    priority: "medium",
    attachments: [],
    meetingNotes: "Ensure transcript security compliance protocols are verified before submission.",
  },
  {
    id: "m-exam",
    title: "Exam Coordination Review",
    description: "IB exam room setup, invigilator assignments, and safety storage room audit",
    date: "2026-06-04", // Today (completed)
    time: "08:00",
    duration: "1.5h",
    type: "in-person",
    status: "completed",
    attendees: ["Ms. Sarah Thompson", "Administration Staff", "Invigilator Leads"],
    location: "Exam Hall A",
    priority: "high",
    attachments: ["School Calendar 2026-2027.pdf"],
    decisionsMade: [
      "Secured secondary vault location for exam papers.",
      "Approved invigilator roster with 12 substitutes registered.",
      "Assigned separate rooms for student access arrangements."
    ],
    meetingNotes: "Audit of secure room complete. Vault double locks verified by Director.",
  },
  {
    id: "m-dept",
    title: "Department Curriculum Audit",
    description: "Review curriculum syllabus mapping and coverage plans for PYP, MYP, and DP streams",
    date: "2026-06-03", // Past
    time: "14:00",
    duration: "2.5h",
    type: "in-person",
    status: "completed",
    attendees: ["Ms. Sarah Thompson", "Department Heads", "Michael Torres"],
    location: "Executive Suite",
    priority: "medium",
    attachments: ["Academic Honesty Policy.pdf"],
    decisionsMade: [
      "Authorized transition to digital syllabi tracking.",
      "Identified Group 4 science laboratory coverage overlaps."
    ],
    meetingNotes: "All departments have locked their current syllabus tracking logs.",
  }
];

export function CoordinatorMeetings({ theme = "dark" }: CoordinatorMeetingsProps) {
  const styles = getAxisTheme(theme);

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("axis-meetings");
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_MEETINGS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("axis-meetings", JSON.stringify(meetings));
    }
  }, [meetings]);

  // Listen to the Axis Context event engine dispatches
  useEffect(() => {
    const handleCreateMeeting = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.meeting) {
        const newMeet = customEvent.detail.meeting;
        setQuickTitle(newMeet.title);
        setQuickDesc(newMeet.description || "Meeting scheduled via context suggestion.");
        setQuickDate(newMeet.date || "2026-06-05");
        setQuickTime(newMeet.time || "15:30");
        setQuickType(newMeet.type || "in-person");
        setQuickPriority(newMeet.priority || "medium");
        if (newMeet.attachments) {
          setAttachedFiles(newMeet.attachments);
        }
        triggerToast("Suggested meeting details pre-filled. Review and schedule.");
      }
    };

    window.addEventListener("axis-context-create-meeting", handleCreateMeeting);

    // Check for pending meeting creation on mount
    const win = window as typeof window & {
      pendingContextMeeting?: {
        title: string;
        description: string;
        date: string;
        time: string;
        type: Meeting["type"];
        priority: Meeting["priority"];
        attachments?: string[];
      };
    };
    if (typeof window !== "undefined" && win.pendingContextMeeting) {
      const newMeet = win.pendingContextMeeting;
      setQuickTitle(newMeet.title);
      setQuickDesc(newMeet.description || "Meeting scheduled via context suggestion.");
      setQuickDate(newMeet.date || "2026-06-05");
      setQuickTime(newMeet.time || "15:30");
      setQuickType(newMeet.type || "in-person");
      setQuickPriority(newMeet.priority || "medium");
      if (newMeet.attachments) {
        setAttachedFiles(newMeet.attachments);
      }
      delete win.pendingContextMeeting;
      setTimeout(() => {
        triggerToast("Suggested meeting details pre-filled. Review and schedule.");
      }, 100);
    }

    return () => {
      window.removeEventListener("axis-context-create-meeting", handleCreateMeeting);
    };
  }, []);

  // UI state variables
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchArchiveQuery, setSearchArchiveQuery] = useState("");
  const [isResourcePickerOpen, setIsResourcePickerOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Quick Schedule Form state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickDate, setQuickDate] = useState("2026-06-05");
  const [quickTime, setQuickTime] = useState("10:00");
  const [quickDuration] = useState("1h");
  const [quickType, setQuickType] = useState<Meeting["type"]>("in-person");
  const [quickPriority, setQuickPriority] = useState<Meeting["priority"]>("medium");
  const [quickLocation] = useState("Library Conference Room");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newMeeting: Meeting = {
      id: `meet-quick-${Date.now()}`,
      title: quickTitle,
      description: quickDesc || "Quick coordination session.",
      date: quickDate,
      time: quickTime,
      duration: quickDuration,
      type: quickType,
      status: "upcoming",
      attendees: ["Ms. Sarah Thompson", "Subject Leads"],
      priority: quickPriority,
      location: quickType !== "online" ? quickLocation : undefined,
      meetingLink: quickType !== "in-person" ? "https://meet.axis.edu/quick-sync" : undefined,
      attachments: attachedFiles,
      meetingNotes: "Draft coordination agenda complete.",
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setQuickTitle("");
    setQuickDesc("");
    setAttachedFiles([]);
    triggerToast(`Meeting "${newMeeting.title}" scheduled successfully.`);
  };

  const handleRemoveAttachment = (filename: string) => {
    setAttachedFiles(prev => prev.filter(f => f !== filename));
  };

  // Timeline chronology sorting logic
  // Today = 2026-06-04
  const todayDateStr = "2026-06-04";
  const tomorrowDateStr = "2026-06-05";

  const timelineMeetings = useMemo(() => {
    // Only upcoming or today's active ones go into timeline
    const active = meetings.filter(m => m.status === "upcoming" || m.status === "ongoing" || m.date === todayDateStr);
    
    // Sort chronologically by date then time
    return [...active].sort((a, b) => {
      const aVal = `${a.date}T${a.time}`;
      const bVal = `${b.date}T${b.time}`;
      return aVal.localeCompare(bVal);
    });
  }, [meetings]);

  const timelineGroups = useMemo(() => {
    const groups: Record<string, Meeting[]> = {
      "Today": [],
      "Tomorrow": [],
      "This Week": [],
      "Next Week & Beyond": [],
    };

    timelineMeetings.forEach(m => {
      if (m.date === todayDateStr) {
        groups["Today"].push(m);
      } else if (m.date === tomorrowDateStr) {
        groups["Tomorrow"].push(m);
      } else {
        const diffTime = new Date(m.date).getTime() - new Date(todayDateStr).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 7) {
          groups["This Week"].push(m);
        } else {
          groups["Next Week & Beyond"].push(m);
        }
      }
    });

    return groups;
  }, [timelineMeetings]);

  const archivedMeetings = useMemo(() => {
    const past = meetings.filter(m => m.status === "completed" || m.status === "cancelled" || m.date < todayDateStr);
    if (!searchArchiveQuery) return past;
    return past.filter(m =>
      m.title.toLowerCase().includes(searchArchiveQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchArchiveQuery.toLowerCase()) ||
      m.attendees.some(att => att.toLowerCase().includes(searchArchiveQuery.toLowerCase()))
    );
  }, [meetings, searchArchiveQuery]);

  // Today's Spotlight Meeting
  const todaysSpotlight = useMemo(() => {
    // Look for today's completed/upcoming
    const todayMeets = meetings.filter(m => m.date === todayDateStr);
    return todayMeets[0] || null;
  }, [meetings]);

  // High priority upcoming review checkpoint items
  const upcomingReviews = useMemo(() => {
    return meetings.filter(m => m.status === "upcoming" && m.priority === "high" && m.date !== todayDateStr).slice(0, 2);
  }, [meetings]);

  return (
    <div className="space-y-8 font-sans">
      {/* ─── TOP SECTION: CALM PORTAL ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Today's Meetings & Upcoming Reviews (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-2xl border ${styles.cardBg} ${styles.border} space-y-4 shadow-sm`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.04]">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Today&apos;s Focus</span>
                <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${styles.textPrimary}`}>Spotlight Sync</h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                Active Cycle
              </span>
            </div>

            {todaysSpotlight ? (
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded text-[8px] font-bold uppercase tracking-wider">
                    {todaysSpotlight.priority} Priority · {todaysSpotlight.type}
                  </span>
                  <h4 className="text-sm font-bold text-white">{todaysSpotlight.title}</h4>
                  <p className="text-xs text-white/50">{todaysSpotlight.description}</p>
                  <div className="flex items-center gap-2.5 text-[10px] text-white/40 pt-1">
                    <span>🕒 {todaysSpotlight.time} ({todaysSpotlight.duration})</span>
                    <span>📍 {todaysSpotlight.location || "Online"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setSelectedMeeting(todaysSpotlight)}
                    className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    Details
                  </button>
                  {todaysSpotlight.status === "upcoming" && (
                    <button className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-black text-[10px] font-extrabold uppercase tracking-wider hover:bg-cyan-400 transition-colors">
                      Start Sync
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/20 uppercase tracking-widest font-semibold">
                No meetings scheduled for today
              </div>
            )}
          </div>

          {/* Upcoming Academic Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => setSelectedMeeting(rev)}
                className={`p-4 rounded-2xl border cursor-pointer hover:border-white/10 transition-all ${styles.cardBg} ${styles.border} flex flex-col justify-between h-36`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider font-mono">Academic Checkpoint</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-extrabold uppercase">{rev.priority}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-1">{rev.title}</h4>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{rev.description}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/[0.03] text-[9.5px] text-white/35 font-mono">
                  <span>📅 {rev.date}</span>
                  <span>{rev.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Schedule Meeting Inline Form (Right 1 Column) */}
        <div className={`p-6 rounded-2xl border ${styles.cardBg} ${styles.border} space-y-4 shadow-sm`}>
          <div className="border-b pb-3 border-white/[0.04]">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Operations</span>
            <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${styles.textPrimary}`}>Quick Schedule</h3>
          </div>

          <form onSubmit={handleQuickSubmit} className="space-y-3.5 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-white/35">Meeting Title</label>
              <input
                type="text"
                required
                placeholder="e.g. TOK Supervisor Sync"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-white/35">Description</label>
              <textarea
                placeholder="Key objectives..."
                rows={2}
                value={quickDesc}
                onChange={(e) => setQuickDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-white/35">Date</label>
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-white/35">Time</label>
                <input
                  type="time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-white/35">Category</label>
                <select
                  value={quickType}
                  onChange={(e) => setQuickType(e.target.value as Meeting["type"])}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="in-person">In-Person</option>
                  <option value="online">Online Link</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-white/35">Priority</label>
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as Meeting["priority"])}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Resource Attachment Block */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-wider text-white/35">Meeting Resources</label>
                <button
                  type="button"
                  onClick={() => setIsResourcePickerOpen(true)}
                  className="text-[9.5px] font-extrabold text-cyan-400 hover:underline"
                >
                  + Reference Resource
                </button>
              </div>

              {attachedFiles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {attachedFiles.map((file) => (
                    <span
                      key={file}
                      className="px-2 py-0.5 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 text-[8.5px] font-bold flex items-center gap-1.5"
                    >
                      <span className="truncate max-w-[80px]">{file}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file)}
                        className="text-white/40 hover:text-red-400 text-[9px] font-extrabold select-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[9px] text-white/20 block italic">No attachments linked</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all mt-2 cursor-pointer"
            >
              Dispatch Schedule
            </button>
          </form>
        </div>
      </div>

      {/* ─── MIDDLE SECTION: UPCOMING TIMELINE ──────────────────────────── */}
      <div className={`p-6 rounded-2xl border ${styles.cardBg} ${styles.border} space-y-6 shadow-sm`}>
        <div className="border-b pb-3 border-white/[0.04]">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Academic Rhythm</span>
          <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${styles.textPrimary}`}>Upcoming Chronology</h3>
        </div>

        {timelineMeetings.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/20 uppercase tracking-widest font-semibold">
            No upcoming schedule items logged
          </div>
        ) : (
          <div className="relative border-l border-white/[0.06] pl-6 ml-3 space-y-6">
            {Object.entries(timelineGroups).map(([groupTitle, groupMeets]) => {
              if (groupMeets.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-3.5 relative">
                  {/* Timeline dot label connector */}
                  <div className="absolute -left-[31px] top-1.5 size-2 rounded-full bg-cyan-400 border-4 border-black ring-4 ring-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  
                  <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono block">
                    {groupTitle}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupMeets.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMeeting(m)}
                        className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.01] hover:border-white/10 cursor-pointer transition-all flex flex-col justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="font-bold text-white truncate leading-snug">{m.title}</h4>
                            <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase tracking-wider shrink-0 border ${
                              m.priority === "high"
                                ? "bg-red-500/15 border-red-500/25 text-red-400"
                                : m.priority === "medium"
                                ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
                                : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                            }`}>
                              {m.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{m.description}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.03] text-[9.5px] text-white/35 font-mono">
                          <div className="flex items-center gap-1">
                            <span>🕒 {m.time} ({m.duration})</span>
                            {m.location && <span>· 📍 {m.location}</span>}
                          </div>
                          <span className="text-cyan-400 font-bold uppercase tracking-widest group-hover:underline text-[8.5px]">Open →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── BOTTOM SECTION: ARCHIVE & DECISIONS ───────────────────────── */}
      <div className={`p-6 rounded-2xl border ${styles.cardBg} ${styles.border} space-y-6 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3 border-white/[0.04] gap-4">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Records</span>
            <h3 className={`text-sm font-bold uppercase tracking-wider mt-0.5 ${styles.textPrimary}`}>Historical Decisions & past reviews</h3>
          </div>

          <div className="relative w-full max-w-xs shrink-0">
            <input
              type="text"
              placeholder="Search past review history..."
              value={searchArchiveQuery}
              onChange={(e) => setSearchArchiveQuery(e.target.value)}
              className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none bg-black/45 border border-white/[0.08] text-white focus:border-cyan-500/50"
            />
            <svg className="absolute left-2.5 top-2.5 size-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {archivedMeetings.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/20 uppercase tracking-widest font-semibold">
            No matching past records found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivedMeetings.map((past) => (
              <div
                key={past.id}
                onClick={() => setSelectedMeeting(past)}
                className="p-5 rounded-xl border border-white/[0.04] bg-black/20 hover:bg-black/35 hover:border-white/10 cursor-pointer transition-all flex flex-col justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/15 text-[8px] font-black text-white/40 uppercase tracking-widest">
                      {past.status.toUpperCase()}
                    </span>
                    <span className="text-[9.5px] font-mono text-white/30">{past.date}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{past.title}</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">{past.description}</p>
                </div>

                {past.decisionsMade && past.decisionsMade.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                    <span className="text-[8.5px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono">Decisions Made</span>
                    <ul className="list-disc list-inside text-[10px] text-white/70 space-y-0.5 leading-snug">
                      {past.decisionsMade.map((dec, idx) => (
                        <li key={idx} className="truncate">{dec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center text-[9px] text-white/30 pt-2 border-t border-white/[0.03] font-mono">
                  <span>Attendees: {past.attendees.length}</span>
                  <span className="text-cyan-400/80 font-bold uppercase tracking-wider">Inspect notes →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MEETING DETAILS EXECUTIVE DRAWER DIALOG ──────────────────── */}
      <AnimatePresence>
        {selectedMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setSelectedMeeting(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`relative w-full max-w-xl border p-6 rounded-2xl shadow-2xl z-10 text-white bg-[#0E0E10] border-white/10 space-y-5`}
            >
              <div className="flex items-start justify-between border-b pb-3 border-white/10">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400 block font-mono">
                    {selectedMeeting.status} checkpoint
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mt-0.5">{selectedMeeting.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="text-white/40 hover:text-white text-xs font-semibold px-2 py-1 bg-white/5 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-white/[0.04] pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-white/40">Temporal Window</span>
                    <p className="font-semibold text-white/80">{selectedMeeting.date} · {selectedMeeting.time} ({selectedMeeting.duration})</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-white/40">Location Slot</span>
                    <p className="font-semibold text-white/80">{selectedMeeting.location || "Online Connect Link"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Sync Summary</span>
                  <p className="text-white/70 leading-relaxed font-medium">{selectedMeeting.description}</p>
                </div>

                {selectedMeeting.meetingNotes && (
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">Notes Ledger</span>
                    <p className="text-white/75 leading-relaxed font-medium italic">&quot;{selectedMeeting.meetingNotes}&quot;</p>
                  </div>
                )}

                {selectedMeeting.decisionsMade && selectedMeeting.decisionsMade.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-white/40">Action Items & Decisions</span>
                    <div className="p-3.5 rounded-xl bg-cyan-950/10 border border-cyan-500/20 space-y-1.5">
                      {selectedMeeting.decisionsMade.map((dec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-white/85 font-medium">
                          <span className="text-cyan-400 font-bold shrink-0 mt-0.5">✔</span>
                          <span className="leading-snug">{dec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meeting Attachments */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Linked Documents</span>
                  {selectedMeeting.attachments && selectedMeeting.attachments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedMeeting.attachments.map((file) => (
                        <div
                          key={file}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">📄</span>
                            <span className="font-semibold text-white/90">{file}</span>
                          </div>
                          <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Reference Active</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 italic">No official files associated</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10 shrink-0">
                  {selectedMeeting.status === "upcoming" && (
                    <>
                      <button
                        onClick={() => {
                          setMeetings(prev =>
                            prev.map(m => m.id === selectedMeeting.id ? { ...m, status: "completed" as const, decisionsMade: ["Authorized review actions in agenda check."] } : m)
                          );
                          setSelectedMeeting(null);
                          triggerToast("Sync session completed. Decisions archived.");
                        }}
                        className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Complete Session
                      </button>
                      <button
                        onClick={() => {
                          setMeetings(prev => prev.filter(m => m.id !== selectedMeeting.id));
                          setSelectedMeeting(null);
                          triggerToast("Meeting scheduled slot removed.");
                        }}
                        className="px-5 py-2.5 border border-red-500/20 bg-red-500/10 hover:bg-red-500/25 text-red-400 font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wider rounded-xl transition-all text-center"
                  >
                    Close Records
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Picker dialog */}
      <ResourcePickerModal
        isOpen={isResourcePickerOpen}
        onClose={() => setIsResourcePickerOpen(false)}
        onSelect={(doc) => {
          if (!attachedFiles.includes(doc.title)) {
            setAttachedFiles(prev => [...prev, doc.title]);
            triggerToast(`Linked file "${doc.title}".`);
          }
        }}
        theme={theme}
      />

      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 z-[250] bg-[#0E0E10] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] px-5 py-3 rounded-full text-xs text-white/90 flex items-center gap-2.5 backdrop-blur-md"
          >
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-medium tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
