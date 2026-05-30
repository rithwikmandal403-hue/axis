"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  sender: "teacher" | "other";
  senderName: string;
  text: string;
  time: string;
};

type ContextInfo = {
  room?: string;
  classGroup?: string;
  topic?: string;
  scheduleConflict?: string;
  actionRequired?: string;
  attendanceRate?: string;
  iaStatus?: string;
  lastActive?: string;
};

type Conversation = {
  id: string;
  name: string;
  type: "direct" | "channel" | "request";
  avatar: string;
  role?: string;
  presence?: "available" | "teaching" | "in-meeting" | "focus" | "offline";
  unread?: boolean;
  isPinned?: boolean;
  messages: Message[];
  context: ContextInfo;
};

type StudentRequest = {
  id: string;
  studentName: string;
  avatar: string;
  topic: string;
  requestTime: string;
  status: "pending" | "approved" | "declined" | "deferred";
  officeHours?: string;
};

// Initial data representing the school ecosystem
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    name: "DP1 Physics Coordination",
    type: "channel",
    avatar: "DP",
    isPinned: true,
    unread: true,
    messages: [
      { id: "m1", sender: "other", senderName: "Marcus Vance", text: "Has anyone booked Lab 3 for tomorrow's revision?", time: "10:14 AM" },
      { id: "m2", sender: "teacher", senderName: "Aarav Chen", text: "I have it reserved for Period 2 with Grade 11 Physics (B).", time: "10:15 AM" },
      { id: "m3", sender: "other", senderName: "Marcus Vance", text: "Ah, I need to run a collision experiment. Can we do a switch, or is there an available time slot later in the afternoon?", time: "10:18 AM" },
      { id: "m4", sender: "other", senderName: "Sarah Chen", text: "Aarav, let's schedule an emergency coordination meeting to clear the afternoon schedules.", time: "10:20 AM" },
    ],
    context: {
      room: "Lab 3",
      classGroup: "Grade 12 Adv Physics (A)",
      actionRequired: "Timetable collision reported on Period 5",
      scheduleConflict: "Period 5 Overlap: Marcus Vance vs Lab Prep",
    },
  },
  {
    id: "conv-2",
    name: "Sarah Chen",
    type: "direct",
    avatar: "SC",
    role: "Guidance Counselor",
    presence: "available",
    isPinned: true,
    unread: false,
    messages: [
      { id: "m5", sender: "other", senderName: "Sarah Chen", text: "Hi Aarav, I noticed Chloe Vance has been late twice this week. Proximity sync shows her device logged in but outside Room 102.", time: "Yesterday" },
      { id: "m6", sender: "teacher", senderName: "Aarav Chen", text: "Thanks Sarah, she's submitted her Physics IA draft but mentioned workload stress. Let's sync.", time: "Yesterday" },
      { id: "m7", sender: "other", senderName: "Sarah Chen", text: "Great. I am available in Room 102 now if you want to run through the support guidelines.", time: "09:30 AM" },
    ],
    context: {
      room: "Room 102",
      topic: "Student IA Workload Stress",
      actionRequired: "Review support guidelines for Chloe Vance",
      lastActive: "Active 5m ago",
    },
  },
  {
    id: "conv-3",
    name: "Dilan Patel",
    type: "direct",
    avatar: "DP",
    role: "Grade 11 Student",
    presence: "focus",
    unread: false,
    messages: [
      { id: "m8", sender: "other", senderName: "Dilan Patel", text: "Mr. Chen, for the Physics IA, does our model need to include air resistance calculation for the project?", time: "08:15 AM" },
      { id: "m9", sender: "teacher", senderName: "Aarav Chen", text: "Yes Dilan, it makes the error analysis section much more comprehensive. Check page 4 of the guidelines.", time: "08:22 AM" },
      { id: "m10", sender: "other", senderName: "Dilan Patel", text: "Understood. Can I confirm the guidelines during free period tomorrow?", time: "08:45 AM" },
    ],
    context: {
      classGroup: "Grade 11 Physics (B)",
      attendanceRate: "94.5%",
      iaStatus: "Draft Submitted · Review Pending",
      topic: "IA Guideline Verification",
    },
  },
  {
    id: "conv-4",
    name: "Chloe Vance",
    type: "direct",
    avatar: "CV",
    role: "Grade 11 Student",
    presence: "offline",
    unread: false,
    messages: [
      { id: "m11", sender: "other", senderName: "Chloe Vance", text: "Thank you for the extension on the kinematics assignment, Mr. Chen.", time: "2 days ago" },
      { id: "m12", sender: "teacher", senderName: "Aarav Chen", text: "Make sure to focus on the vector notation. Let's discuss it in the next class.", time: "2 days ago" },
    ],
    context: {
      classGroup: "Grade 11 Physics (B)",
      attendanceRate: "88.2% (Late Warning)",
      iaStatus: "Draft Review Required",
    },
  },
];

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: "req-1",
    studentName: "Riya Patel",
    avatar: "RP",
    topic: "Physics IA clarification: pendulum acceleration error calculations.",
    requestTime: "Requested during Period 3 (Free)",
    status: "pending",
  },
  {
    id: "req-2",
    studentName: "Lucas Gray",
    avatar: "LG",
    topic: "Assistance with thermodynamics practice problem set 4.",
    requestTime: "Requested 40m ago",
    status: "pending",
  },
];

export function MessagesWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [presenceStatus, setPresenceStatus] = useState<string>("available");
  const [presenceDropdownOpen, setPresenceDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showNav, setShowNav] = useState(true);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  // Active meeting states
  const [isInMeeting, setIsInMeeting] = useState(false);
  const meetingTimerRef = useRef(0);
  const [meetingTimerString, setMeetingTimerString] = useState("00:00");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Highlight Overlay Popover state
  const [highlightOverlay, setHighlightOverlay] = useState<{
    entity: string;
    type: "room" | "teacher" | "class" | "topic" | "period";
    title: string;
    details: string[];
    actionLabel?: string;
    x: number;
    y: number;
  } | null>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  // Presence Configuration
  const statuses = [
    { id: "available", label: "Available", color: "bg-emerald-500", desc: "Open to student requests & coordination" },
    { id: "teaching", label: "Teaching", color: "bg-amber-500", desc: "Mute alerts; signal in-class mode" },
    { id: "in-meeting", label: "In Meeting", color: "bg-blue-500", desc: "Available for critical coordinator overrides only" },
    { id: "focus", label: "Focus Mode", color: "bg-purple-500", desc: "Decline/defer new student requests automatically" },
    { id: "offline", label: "Offline", color: "bg-neutral-500", desc: "Quiet period; all requests deferred" },
  ];

  const currentPresence = statuses.find((s) => s.id === presenceStatus) || statuses[0];

  // Search logic - filters conversations, messages text, or requests
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.messages.some((m) => m.text.toLowerCase().includes(query)) ||
        (c.role && c.role.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return studentRequests;
    const query = searchQuery.toLowerCase();
    return studentRequests.filter(
      (r) =>
        r.studentName.toLowerCase().includes(query) ||
        r.topic.toLowerCase().includes(query)
    );
  }, [studentRequests, searchQuery]);

  // Meeting system timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInMeeting) {
      interval = setInterval(() => {
        meetingTimerRef.current += 1;
        const next = meetingTimerRef.current;
        const mins = Math.floor(next / 60).toString().padStart(2, "0");
        const secs = (next % 60).toString().padStart(2, "0");
        setMeetingTimerString(`${mins}:${secs}`);
      }, 1000);
    } else {
      meetingTimerRef.current = 0;
      setMeetingTimerString("00:00");
    }
    return () => clearInterval(interval);
  }, [isInMeeting]);

  // Send message implementation
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: Message = {
      id: `m-sent-${Date.now()}`,
      sender: "teacher",
      senderName: "Aarav Chen",
      text: inputText,
      time: timeString,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      )
    );
    setInputText("");
  };

  // Student Request action handlers
  const handleRequestAction = (id: string, action: "approve" | "decline" | "defer" | "redirect") => {
    setStudentRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          let updatedStatus = r.status;
          let officeHrs = undefined;
          if (action === "approve") updatedStatus = "approved";
          if (action === "decline") updatedStatus = "declined";
          if (action === "redirect") updatedStatus = "declined";
          if (action === "defer") {
            updatedStatus = "deferred";
            officeHrs = "Monday 3:00 PM - 4:00 PM";
          }
          return { ...r, status: updatedStatus as StudentRequest["status"], officeHours: officeHrs };
        }
        return r;
      })
    );

    // If approved, create a new conversation for them
    const req = studentRequests.find((r) => r.id === id);
    if (action === "approve" && req) {
      const isAlreadyExist = conversations.some((c) => c.name === req.studentName);
      if (!isAlreadyExist) {
        const newConv: Conversation = {
          id: `conv-student-${Date.now()}`,
          name: req.studentName,
          type: "direct",
          avatar: req.avatar,
          role: "Student (Access Approved)",
          presence: "available",
          unread: false,
          messages: [
            { id: "m-init", sender: "other", senderName: req.studentName, text: `Hello Mr. Chen, thank you for accepting my request. ${req.topic}`, time: "Just now" },
          ],
          context: {
            classGroup: "Grade 11 Physics",
            topic: "IA Clarification",
            actionRequired: "Respond to student query",
          },
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      }
    }
  };

  // Entity highlights data
  const ENTITY_DETAILS: Record<string, { type: "room" | "teacher" | "class" | "topic" | "period"; title: string; details: string[]; actionLabel?: string }> = {
    "Lab 3": {
      type: "room",
      title: "Lab 3 (Physics Laboratory)",
      details: [
        "Current Status: Occupied (Period 2)",
        "Assigned Class: Grade 11 Physics (B)",
        "Next Booking: DP1 Physics Coordination at 2:15 PM",
        "Available Slots: Period 3 (10:30 AM), Period 6 (1:30 PM)",
        "Coordinator override available for emergencies",
      ],
      actionLabel: "Reserve Alternative Slot",
    },
    "Sarah Chen": {
      type: "teacher",
      title: "Sarah Chen (Guidance Counselor)",
      details: [
        "Current Status: Available",
        "Location: Room 102",
        "Ecosystem Role: Student Workload & Support Coordination",
        "Active schedules: Available for consultation now",
      ],
      actionLabel: "Request Counselor Attendance",
    },
    "Room 102": {
      type: "room",
      title: "Room 102 (Guidance Office)",
      details: [
        "Current Status: Available",
        "Assigned Personnel: Sarah Chen",
        "No conflicting student bookings flagged for today",
      ],
    },
    "Physics IA": {
      type: "topic",
      title: "Physics Internal Assessment (IA)",
      details: [
        "Roster Status: 22/24 students submitted drafts",
        "Pending Teacher Review: 4 (including Chloe Vance)",
        "Assigned Coordinator: Marcus Vance",
        "Next Deadline: Phase 2 Final Draft submission on Friday",
      ],
      actionLabel: "Open IA Ledger",
    },
    "Period 5": {
      type: "period",
      title: "Period 5 Schedule Block",
      details: [
        "Time Frame: 12:45 PM - 1:30 PM",
        "Aarav Chen Status: Free Period / Coordination Duty",
        "Ecosystem Gaps: 1 coverage request pending in Grade 10 Science",
      ],
      actionLabel: "Volunteer for Coverage",
    },
  };

  // Text entity highlighter renderer
  const renderHighlightedMessage = (text: string) => {
    const keywords = ["Lab 3", "Sarah Chen", "Room 102", "Physics IA", "Period 5"];
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort keywords descending by length to avoid partial replacements
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${sortedKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');

    let match;
    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchedText = match[0];

      // Add text before match
      if (matchIndex > lastIndex) {
        elements.push(text.substring(lastIndex, matchIndex));
      }

      // Add matched styled tag
      const handleEntityClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const details = ENTITY_DETAILS[matchedText];
        if (details) {
          setHighlightOverlay({
            entity: matchedText,
            type: details.type,
            title: details.title,
            details: details.details,
            actionLabel: details.actionLabel,
            x: rect.left,
            y: rect.top - 8,
          });
        }
      };

      elements.push(
        <button
          key={`entity-${keyIdx++}`}
          onClick={handleEntityClick}
          className="inline-block relative text-left text-white/95 font-medium border-b border-dashed border-white/35 hover:border-white/90 hover:text-white bg-white/[0.04] px-1 py-0.5 rounded transition-all select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          style={{
            textShadow: "0 0 10px rgba(255,255,255,0.1)",
          }}
        >
          {matchedText}
        </button>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] h-[calc(100vh-140px)] w-full rounded-2xl border border-white/[0.06] bg-white/[0.01] shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden">
      
      {/* 1. LEFT NAVIGATION PANEL */}
      <div
        className={`${
          showNav ? "flex" : "hidden lg:flex"
        } flex-col border-r border-white/[0.06] bg-[#0C0C0E]/60 transition-all duration-300`}
      >
        {/* Presence Selector Header */}
        <div className="p-safe-md border-b border-white/[0.06]">
          <div className="relative">
            <button
              onClick={() => setPresenceDropdownOpen(!presenceDropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] px-safe-md py-safe-sm transition-all text-left"
            >
              <div className="flex items-center gap-safe-md">
                <span className={`size-2.5 rounded-full ${currentPresence.color} animate-pulse`} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/90 leading-tight">Aarav Chen</span>
                  <span className="text-[10px] text-white/40 leading-none">{currentPresence.label}</span>
                </div>
              </div>
              <svg className="size-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <AnimatePresence>
              {presenceDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPresenceDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl border border-white/[0.08] bg-[#0E0E10] p-1 shadow-[0_12px_36px_rgba(0,0,0,0.9)]"
                  >
                    {statuses.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPresenceStatus(item.id);
                          setPresenceDropdownOpen(false);
                        }}
                        className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-all ${
                          presenceStatus === item.id ? "bg-white/[0.06] text-white" : "text-white/50 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${item.color}`} />
                          <span className="text-[11px] font-semibold">{item.label}</span>
                        </div>
                        <span className="text-[9px] text-white/30 leading-snug mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Contextual Search & Requests */}
          <div className="flex items-center gap-safe-sm mt-safe-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-8 pr-safe-md py-2 text-xs text-white placeholder-white/30 focus:border-white/20 focus:bg-white/[0.04] focus:outline-none transition-all"
              />
              <svg className="absolute left-2.5 top-2.5 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={() => setIsRequestsOpen(true)}
              className="relative flex shrink-0 size-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/60 hover:text-white transition-all"
              title="Student Requests"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {filteredRequests.filter(r => r.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-white text-[#0A0A0C] text-[8px] font-bold shadow-sm">
                  {filteredRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation Navigation List */}
        <div className="flex-1 overflow-y-auto px-safe-sm py-safe-md space-y-safe-md scrollbar-none">
          {/* Section 1: Pinned Channels & DMs */}
          <div>
            <span className="px-safe-sm text-[9px] font-bold text-white/25 uppercase tracking-wider block mb-safe-sm">
              Ecosystem Coordination
            </span>
            <div className="space-y-0.5">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`flex w-full items-center gap-safe-sm rounded-lg px-safe-sm py-safe-sm transition-all text-left group ${
                      isActive ? "bg-white/[0.05] text-white" : "text-white/45 hover:bg-white/[0.02] hover:text-white/80"
                    }`}
                  >
                    <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-white/80 group-hover:border-white/20 transition-all">
                      {conv.avatar}
                      {conv.presence && (
                        <span className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-[#0A0A0B] ${
                          conv.presence === "available" ? "bg-emerald-500" :
                          conv.presence === "focus" ? "bg-purple-500" :
                          conv.presence === "in-meeting" ? "bg-blue-500" : "bg-neutral-500"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold tracking-tight truncate leading-none">
                          {conv.name}
                        </span>
                        {conv.unread && (
                          <span className="size-1.5 rounded-full bg-sky-400" />
                        )}
                      </div>
                      <span className="text-[9px] text-white/30 truncate block mt-1 leading-none font-medium">
                        {conv.messages[conv.messages.length - 1]?.text || conv.role || "No messages"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 2. CENTER PANEL (MAIN CHAT AREA / MEETING CANVAS) */}
      <div className="flex flex-col bg-[#0A0A0C]/40 relative min-w-0">
        
        {/* Active high-priority overlay banner */}
        {activeConversation?.context.actionRequired && !isInMeeting && (
          <div className="bg-amber-500/[0.03] border-b border-amber-500/20 px-safe-md py-safe-sm flex items-center justify-between">
            <div className="flex items-center gap-safe-sm">
              <span className="flex size-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-tight text-amber-500/90 uppercase">
                Coordination Needed: {activeConversation.context.actionRequired}
              </span>
            </div>
            <button
              onClick={() => setIsInMeeting(true)}
              className="rounded bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500 hover:text-black hover:border-transparent px-3 py-1 text-[9px] font-bold text-amber-400 transition-all"
            >
              Start Coordination Session
            </button>
          </div>
        )}

        {/* Conversation Header */}
        <div className="h-16 border-b border-white/[0.06] px-safe-lg flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNav(!showNav)}
              className="lg:hidden p-1 rounded hover:bg-white/5 text-white/60"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xs font-semibold text-white/90">
                {isInMeeting ? `Meeting: ${activeConversation?.name}` : activeConversation?.name}
              </h2>
              <span className="text-[9px] text-white/30 mt-0.5 leading-none">
                {isInMeeting ? "Live video coordination room" : activeConversation?.role || "Active Room Channel"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isInMeeting ? (
              <button
                onClick={() => setIsInMeeting(true)}
                className="rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 px-3 py-1.5 text-[10px] font-semibold text-white/90 hover:text-white transition-all flex items-center gap-1.5"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Coordination Call
              </button>
            ) : (
              <button
                onClick={() => setIsInMeeting(false)}
                className="rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white hover:border-transparent px-3 py-1.5 text-[10px] font-bold text-red-400 transition-all flex items-center gap-1.5"
              >
                <svg className="size-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Leave Session ({meetingTimerString})
              </button>
            )}
          </div>
        </div>

        {/* CONTENT SWITCHER (CHAT VS MEETING CANVAS) */}
        <div className="flex-1 overflow-y-auto p-safe-lg scrollbar-none relative">
          <AnimatePresence mode="wait">
            {!isInMeeting ? (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-safe-lg"
              >
                {activeConversation?.messages.map((msg, index) => {
                  const isTeacher = msg.sender === "teacher";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={`flex flex-col ${isTeacher ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-white/40 tracking-tight">
                          {msg.senderName}
                        </span>
                        <span className="text-[8px] text-white/20">{msg.time}</span>
                      </div>
                      
                      {/* Bubble */}
                      <div
                        className={`rounded-2xl max-w-lg px-4 py-3 text-xs leading-relaxed transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] ${
                          isTeacher
                            ? "bg-white text-[#0A0A0C] font-normal rounded-tr-sm"
                            : "bg-white/[0.03] border border-white/[0.06] text-white/80 rounded-tl-sm hover:border-white/10"
                        }`}
                      >
                        {isTeacher ? msg.text : renderHighlightedMessage(msg.text)}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="meeting-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col justify-between"
              >
                {/* Meeting Canvas Layout */}
                <div className="grid grid-cols-2 gap-safe-md flex-1 mb-safe-lg">
                  {/* Participant 1: Aarav Chen */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#0E0E10] flex flex-col justify-between p-safe-md relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Audio waveform visualization */}
                      {!isAudioMuted && (
                        <div className="flex items-center gap-1">
                          <motion.span animate={{ height: [12, 28, 12] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white/20 rounded-full" />
                          <motion.span animate={{ height: [18, 42, 18] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white/45 rounded-full" />
                          <motion.span animate={{ height: [24, 30, 24] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-white/30 rounded-full" />
                          <motion.span animate={{ height: [14, 20, 14] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-white/15 rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Self (Aarav Chen)</span>
                      <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">Host</span>
                    </div>
                    <div className="flex items-end justify-between z-10 mt-20">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">AC</span>
                        <span className="text-xs font-semibold text-white/95">Aarav Chen</span>
                      </div>
                      <div className="flex gap-1.5">
                        {isAudioMuted && <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">Muted</span>}
                        {isVideoMuted && <span className="text-[9px] bg-neutral-800 text-white/40 px-1.5 py-0.5 rounded">Video Off</span>}
                      </div>
                    </div>
                  </div>

                  {/* Participant 2: Marcus Vance */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#0E0E10] flex flex-col justify-between p-safe-md relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-1">
                        <motion.span animate={{ height: [15, 35, 15] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.1 }} className="w-1 bg-white/20 rounded-full" />
                        <motion.span animate={{ height: [22, 12, 22] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} className="w-1 bg-white/40 rounded-full" />
                        <motion.span animate={{ height: [12, 28, 12] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-1 bg-white/20 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Active Participant</span>
                      <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded text-white/80 font-medium">Lab 3 (Venue Link)</span>
                    </div>
                    <div className="flex items-end justify-between z-10 mt-20">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">MV</span>
                        <span className="text-xs font-semibold text-white/95">Marcus Vance</span>
                      </div>
                      <span className="text-[9px] text-[#0A0A0C] bg-white px-1.5 py-0.5 rounded font-bold">Speaking</span>
                    </div>
                  </div>
                </div>

                {/* Meeting operational context panel */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex flex-col md:flex-row md:items-center justify-between gap-safe-md">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest">Linked Agenda Context</span>
                    <span className="text-xs text-white/85 font-semibold mt-1">Period 5 Timetable Collision Resolution</span>
                    <p className="text-[10px] text-white/40 mt-1 leading-snug">
                      Comparing Lab 3 schedules: Marcus Vance seeks swap for collision test setup.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Trigger swap override simulation
                        const updatedConvs: Conversation[] = conversations.map(c => {
                          if (c.id === "conv-1") {
                            const newMsg: Message = {
                              id: `m-call-${Date.now()}`,
                              sender: "teacher",
                              senderName: "Aarav Chen",
                              text: "Successfully resolved overlap via Coordination Call. Lab 3 reserved for collision test Period 5.",
                              time: "Just now"
                            };
                            return {
                              ...c,
                              messages: [...c.messages, newMsg],
                              context: {
                                ...c.context,
                                actionRequired: undefined,
                                scheduleConflict: "Resolved: Swap applied",
                              }
                            };
                          }
                          return c;
                        });
                        setConversations(updatedConvs);
                        setIsInMeeting(false);
                      }}
                      className="rounded bg-white px-3 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-all"
                    >
                      Authorize Swap & Close Override
                    </button>
                  </div>
                </div>

                {/* Control bar */}
                <div className="mt-safe-md flex items-center justify-center gap-safe-md">
                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className={`size-10 rounded-full border flex items-center justify-center transition-all ${
                      isAudioMuted ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {isAudioMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6v12m0-12L5.25 9H3m4.5-3V3m0 18v-3" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      )}
                    </svg>
                  </button>

                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className={`size-10 rounded-full border flex items-center justify-center transition-all ${
                      isVideoMuted ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {isVideoMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25H12A2.25 2.25 0 0114.25 9v7.5A2.25 2.25 0 0112 18.75z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      )}
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT BOX BAR */}
        {!isInMeeting && (
          <div className="h-20 border-t border-white/[0.06] px-safe-lg flex items-center gap-safe-md bg-[#0A0A0C]/50 shrink-0">
            <button className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02] text-white/50 hover:text-white transition-all">
              <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.121L16.222 6.42" />
              </svg>
            </button>
            <input
              type="text"
              placeholder={`Message ${activeConversation?.name}... (type 'Lab 3' or 'Physics IA' to see contextual highlighting)`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-white/20 focus:bg-white/[0.04] focus:outline-none transition-all"
            />
            <button
              onClick={handleSendMessage}
              className="rounded-lg bg-white hover:opacity-90 px-4 py-2.5 text-xs font-bold text-black transition-all"
            >
              Send
            </button>
          </div>
        )}
      </div>

      <div className="border-l border-white/[0.06] bg-[#0C0C0E]/70 p-safe-md space-y-safe-md overflow-y-auto scrollbar-none flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">
            Context Engine
          </span>
          <span className="text-[8px] text-white/30">Active Insight</span>
        </div>

        {activeConversation ? (
          <div className="space-y-safe-md flex-1">
            {/* Dynamic Metadata details */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-sm">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Active Scope</span>
              <h3 className="text-xs font-semibold text-white/95 mt-1">{activeConversation.name}</h3>
              <p className="text-[10px] text-white/40 leading-snug mt-1">
                {activeConversation.role || "Collaboration group for coordinator overrides and scheduling logistics."}
              </p>
            </div>

            {/* Context parameters derived from conversation */}
            <div className="space-y-safe-sm">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">
                Derived Context Tags
              </span>

              {activeConversation.context.room && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-safe-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/30 leading-none">Linked Room</span>
                    <span className="text-[11px] font-semibold text-white/80 mt-1">{activeConversation.context.room}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                </div>
              )}

              {activeConversation.context.classGroup && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-safe-sm">
                  <span className="text-[8px] text-white/30 leading-none">Target Class</span>
                  <span className="text-[11px] font-semibold text-white/80 block mt-1">{activeConversation.context.classGroup}</span>
                </div>
              )}

              {activeConversation.context.attendanceRate && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-safe-sm">
                  <span className="text-[8px] text-white/30 leading-none">Student Attendance</span>
                  <span className={`text-[11px] font-semibold block mt-1 ${
                    activeConversation.context.attendanceRate.includes("Warning") ? "text-amber-400" : "text-white/80"
                  }`}>
                    {activeConversation.context.attendanceRate}
                  </span>
                </div>
              )}

              {activeConversation.context.iaStatus && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-safe-sm">
                  <span className="text-[8px] text-white/30 leading-none">Physics IA Status</span>
                  <span className="text-[11px] font-semibold text-white/80 block mt-1">{activeConversation.context.iaStatus}</span>
                </div>
              )}

              {activeConversation.context.scheduleConflict && (
                <div className="rounded-lg border border-red-500/10 bg-red-500/[0.02] p-safe-sm">
                  <span className="text-[8px] text-red-400/60 leading-none font-medium">Conflict Detected</span>
                  <span className="text-[10px] font-semibold text-red-400 block mt-1 leading-snug">
                    {activeConversation.context.scheduleConflict}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions Suggestions */}
            <div className="pt-safe-sm border-t border-white/[0.04] space-y-safe-sm">
              <span className="text-[8px] font-bold text-white/35 uppercase tracking-widest block">
                Suggested Actions
              </span>
              
              {activeConversation.context.room && (
                <button
                  onClick={() => setIsInMeeting(true)}
                  className="w-full text-left rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-safe-sm py-safe-sm text-[10px] text-white/70 hover:text-white transition-all block leading-normal"
                >
                  Schedule Room Consultation in {activeConversation.context.room}
                </button>
              )}

              {activeConversation.context.iaStatus && (
                <button
                  onClick={() => {
                    alert("Opening submission logs for Physics IA review...");
                  }}
                  className="w-full text-left rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-safe-sm py-safe-sm text-[10px] text-white/70 hover:text-white transition-all block leading-normal"
                >
                  Review Chloe Vance submissions ledger
                </button>
              )}

              <button className="w-full text-left rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-safe-sm py-safe-sm text-[10px] text-white/70 hover:text-white transition-all block leading-normal">
                Log Context Coordination Note
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-white/20 text-center py-6">
            Select a thread to view operational intelligence.
          </div>
        )}
      </div>

      {/* 4. CONTEXT-AWARE HOVER OVERLAY (MODAL POPOVER) */}
      <AnimatePresence>
        {highlightOverlay && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setHighlightOverlay(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                left: `${highlightOverlay.x}px`,
                top: `${highlightOverlay.y - 180}px`,
              }}
              className="absolute z-50 w-72 rounded-xl border border-white/15 bg-[#0E0E10]/95 p-safe-md shadow-[0_16px_48px_rgba(0,0,0,0.95)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-safe-sm border-b border-white/[0.06] mb-safe-sm">
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest">
                  Operational Reference
                </span>
                <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-semibold uppercase">
                  {highlightOverlay.type}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-white/95">{highlightOverlay.title}</h4>
              
              <ul className="mt-safe-sm space-y-1">
                {highlightOverlay.details.map((detail, dIdx) => (
                  <li key={dIdx} className="text-[10px] text-white/50 leading-relaxed list-none">
                    • {detail}
                  </li>
                ))}
              </ul>

              {highlightOverlay.actionLabel && (
                <div className="mt-safe-md pt-safe-sm border-t border-white/[0.06] flex justify-end">
                  <button
                    onClick={() => {
                      alert(`Dispatched action: ${highlightOverlay.actionLabel}`);
                      setHighlightOverlay(null);
                    }}
                    className="rounded bg-white px-2.5 py-1 text-[9px] font-bold text-black hover:opacity-90 transition-all"
                  >
                    {highlightOverlay.actionLabel}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. STUDENT REQUESTS DRAWER (SLIDE-OVER) */}
      <AnimatePresence>
        {isRequestsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] bg-[#0A0A0C] border-l border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="h-16 px-safe-lg border-b border-white/[0.06] flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-white/95">Pending Requests</h3>
                  <span className="text-[10px] text-white/40 leading-none mt-0.5">Communication & Office Hours</span>
                </div>
                <button
                  onClick={() => setIsRequestsOpen(false)}
                  className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-safe-lg scrollbar-none space-y-safe-md">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-white/[0.08] bg-white/[0.01] overflow-hidden flex flex-col">
                    <div className="p-safe-lg flex flex-col gap-safe-md">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/90 shadow-inner">
                            {req.avatar}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white/95">{req.studentName}</span>
                            <span className="text-[10px] text-white/40 mt-0.5">DP1 Physics (Section B)</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-white/30 text-right mt-1">
                          Requested:<br/>{req.requestTime}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="bg-[#0C0C0E] border border-white/[0.04] rounded-lg p-safe-md">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                          Subject: {req.topic.split(':')[0] || 'Clarification'}
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/80 whitespace-pre-wrap font-medium">
                          &ldquo;{req.topic}&rdquo;
                        </p>
                      </div>

                      {/* Actions */}
                      {req.status === "pending" ? (
                        <div className="flex items-center gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleRequestAction(req.id, "decline")}
                            className="px-3 py-1.5 text-[10px] font-semibold text-white/40 hover:text-white/80 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRequestAction(req.id, "defer")}
                            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
                          >
                            Defer
                          </button>
                          <button
                            onClick={() => handleRequestAction(req.id, "approve")}
                            className="rounded-lg bg-white px-4 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-all shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-white/40 border-t border-white/[0.04] pt-3 font-medium flex items-center gap-2">
                          {req.status === "approved" && <><span className="size-1.5 rounded-full bg-emerald-500"></span> Discussion Approved</>}
                          {req.status === "declined" && <><span className="size-1.5 rounded-full bg-neutral-500"></span> Request Declined</>}
                          {req.status === "deferred" && <><span className="size-1.5 rounded-full bg-purple-500"></span> Deferred: {req.officeHours}</>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-xs text-white/20 text-center py-10 font-medium">
                    No pending communication requests.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

