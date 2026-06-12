"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentStatisticsProfile } from "../coordinator-demo/student-statistics-profile";
import { detectContextInText, type DetectedContext } from "../teacher-demo/teacher-context-engine";
import { MessageTextWithTeacherContext } from "../teacher-demo/teacher-context-trigger";
import { TeacherContextActionModal } from "../teacher-demo/teacher-context-modals";
import { ResourcePickerModal } from "../coordinator-demo/connected-resources";

type Message = {
  id: string;
  sender: "self" | "other";
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
  statusActivity?: string;
  statusColor?: string;
};

type GroupMember = {
  name: string;
  role: string;
  avatar: string;
  status: "joined" | "pending" | "declined";
};

type GroupInvite = {
  id: string;
  name: string;
  type: string;
  inviter: string;
  inviterRole: string;
  dateInvited: string;
  membersCount: number;
  description: string;
  purpose: string;
  createdBy: string;
  activitySummary: string;
  members: GroupMember[];
};

// Initial data representing the school platform
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    name: "DP1 Physics HL",
    type: "channel",
    avatar: "PH",
    isPinned: true,
    unread: true,
    statusActivity: "2 Upcoming Deadlines",
    statusColor: "text-amber-400",
    messages: [
      { id: "m1", sender: "other", senderName: "Dilan Patel", text: "Has anyone booked Lab 3 for our IA measurements?", time: "10:14 AM" },
      { id: "m2", sender: "self", senderName: "Chloe Vance", text: "I think Mr. Chen reserved it for Period 2 tomorrow.", time: "10:15 AM" },
      { id: "m3", sender: "other", senderName: "Aarav Chen", text: "Yes Chloe, I did. You are free to use the sensor kits then.", time: "10:18 AM" },
      { id: "m4", sender: "other", senderName: "Aarav Chen", text: "Make sure you finalize your Physics IA draft by Friday night.", time: "10:20 AM" },
    ],
    context: {
      room: "Lab 3",
      classGroup: "DP1 Physics HL",
      actionRequired: "Physics IA draft deadline this Friday",
      iaStatus: "Draft review needed",
    },
  },
  {
    id: "conv-2",
    name: "Counselor Sarah Chen",
    type: "direct",
    avatar: "SC",
    role: "Guidance Counselor",
    presence: "available",
    isPinned: true,
    unread: false,
    statusActivity: "1 Task Pending",
    statusColor: "text-cyan-400",
    messages: [
      { id: "m5", sender: "other", senderName: "Sarah Chen", text: "Hi Chloe, I noticed you haven't uploaded your university shortlist draft yet.", time: "Yesterday" },
      { id: "m6", sender: "self", senderName: "Chloe Vance", text: "Hi Dr. Chen, I'm still deciding between Imperial College and Edinburgh. I will update it tonight.", time: "Yesterday" },
      { id: "m7", sender: "other", senderName: "Sarah Chen", text: "Are you free for a brief chat tomorrow morning during registration?", time: "09:30 AM" },
    ],
    context: {
      room: "Room 102",
      topic: "University Application Shortlist",
      actionRequired: "Meet with Counselor tomorrow",
      lastActive: "Active 5m ago",
    },
  },
  {
    id: "conv-3",
    name: "Math AA HL",
    type: "channel",
    avatar: "MA",
    unread: false,
    statusActivity: "Calculus Homework due Friday",
    statusColor: "text-rose-400/80",
    messages: [
      { id: "m8", sender: "other", senderName: "Dr. Sarah Chen", text: "Problem Set 7 has been posted. Make sure to attempt all differentiation questions.", time: "08:15 AM" },
      { id: "m9", sender: "self", senderName: "Chloe Vance", text: "Is this due before the quiz on derivatives?", time: "08:22 AM" },
      { id: "m10", sender: "other", senderName: "Dr. Sarah Chen", text: "Yes Chloe. The quiz covers the exact same topics as this problem set.", time: "08:45 AM" },
    ],
    context: {
      classGroup: "Math AA HL",
      topic: "Calculus Problem Set 7",
    },
  },
  {
    id: "conv-4",
    name: "TOK Exhibition",
    type: "channel",
    avatar: "TK",
    unread: false,
    statusActivity: "1 Reflection pending",
    statusColor: "text-indigo-400",
    messages: [
      { id: "m11", sender: "other", senderName: "Michael Torres", text: "Please ensure your 300-word justification draft for object 1 is ready by tomorrow.", time: "2 days ago" },
      { id: "m12", sender: "self", senderName: "Chloe Vance", text: "Is it fine if my object is a digital photograph?", time: "2 days ago" },
      { id: "m13", sender: "other", senderName: "Michael Torres", text: "Yes, as long as it has a specific, real-world provenance.", time: "2 days ago" },
    ],
    context: {
      topic: "TOK Object Justification",
    },
  },
  {
    id: "conv-5",
    name: "CAS Project Team",
    type: "channel",
    avatar: "CA",
    unread: true,
    statusActivity: "Volunteer Event This Saturday",
    statusColor: "text-emerald-400",
    messages: [
      { id: "m14", sender: "other", senderName: "Dilan Patel", text: "I've printed the flyers for the charity run. We should meet at the front gate at 8:00 AM.", time: "Yesterday" },
      { id: "m15", sender: "self", senderName: "Chloe Vance", text: "Perfect, I've got the sign-up sheets and water bottles ready.", time: "Yesterday" },
    ],
    context: {
      topic: "CAS Garden Cleanup & Charity Run",
    },
  },
  {
    id: "conv-6",
    name: "Student Council",
    type: "channel",
    avatar: "SC",
    unread: false,
    statusActivity: "Meeting at 12:30 PM",
    statusColor: "text-white/50",
    messages: [
      { id: "m16", sender: "other", senderName: "Lucas Gray", text: "Hey team, the principal approved the common room changes.", time: "2:30 PM" },
      { id: "m17", sender: "self", senderName: "Chloe Vance", text: "Excellent! Let's present the layout proposals today.", time: "2:45 PM" },
    ],
    context: {
      actionRequired: "Student Council Proposal Presentation",
    },
  },
];

const SEEDED_INVITATIONS: GroupInvite[] = [
  {
    id: "inv-1",
    name: "DP1 Chemistry Study Group",
    type: "Student Study Circle",
    inviter: "Dilan Patel",
    inviterRole: "Grade 11 Student",
    dateInvited: "June 10, 2026",
    membersCount: 4,
    description: "Collaboration space for Chemistry HL option topics and option prep.",
    purpose: "Coordinate study sessions, share lab notes, and prepare for the upcoming organic chemistry test.",
    createdBy: "Dilan Patel",
    activitySummary: "Organic Chemistry summary shared · Active 1h ago",
    members: [
      { name: "Dilan Patel", role: "Grade 11 Student", avatar: "DP", status: "joined" },
      { name: "Chloe Vance", role: "Grade 11 Student", avatar: "CV", status: "pending" },
      { name: "Dr. Priya Sharma", role: "Advisor", avatar: "PS", status: "joined" },
      { name: "Lucas Gray", role: "Grade 11 Student", avatar: "LG", status: "pending" }
    ]
  },
  {
    id: "inv-2",
    name: "Yearbook Committee",
    type: "Co-curricular / CAS",
    inviter: "Ms. Sarah Thompson",
    inviterRole: "Committee Advisor",
    dateInvited: "June 9, 2026",
    membersCount: 4,
    description: "Design and content curation for the 2026 school yearbook.",
    purpose: "Organize layout sub-groups, assign photography schedules, and write section drafts.",
    createdBy: "Ms. Sarah Thompson",
    activitySummary: "Layout template shared · Active 1d ago",
    members: [
      { name: "Ms. Sarah Thompson", role: "Committee Advisor", avatar: "ST", status: "joined" },
      { name: "Chloe Vance", role: "Grade 11 Student", avatar: "CV", status: "pending" },
      { name: "Lucas Gray", role: "Grade 11 Student", avatar: "LG", status: "joined" },
      { name: "Riya Patel", role: "Grade 11 Student", avatar: "RP", status: "joined" }
    ]
  }
];

export function StudentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [presenceStatus, setPresenceStatus] = useState<string>("available");
  const [presenceDropdownOpen, setPresenceDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showNav, setShowNav] = useState(true);

  // Invitations states
  const [invitations, setInvitations] = useState<GroupInvite[]>(SEEDED_INVITATIONS);
  const [activeTab, setActiveTab] = useState<string>("conversations"); // "conversations" or "invitations"
  const [activeInviteId, setActiveInviteId] = useState<string | null>("inv-1");

  // Active meeting states
  const [isInMeeting, setIsInMeeting] = useState(false);
  const meetingTimerRef = useRef(0);
  const [meetingTimerString, setMeetingTimerString] = useState("00:00");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Attachment states
  const [attachedResource, setAttachedResource] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Teacher Context Modal state
  const [selectedContext, setSelectedContext] = useState<DetectedContext | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [contextToast, setContextToast] = useState<string | null>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  const activeInvitation = useMemo(() => {
    return invitations.find((i) => i.id === activeInviteId);
  }, [invitations, activeInviteId]);

  const pendingInvitesCount = invitations.length;

  // Presence Configuration
  const statuses = [
    { id: "available", label: "Available", color: "bg-emerald-500", desc: "Available for group study & messaging" },
    { id: "studying", label: "Studying", color: "bg-amber-500", desc: "Busy with assignments" },
    { id: "in-class", label: "In Class", color: "bg-blue-500", desc: "Muted during lessons" },
    { id: "focus", label: "Focus Mode", color: "bg-purple-500", desc: "Do Not Disturb" },
    { id: "offline", label: "Offline", color: "bg-neutral-500", desc: "Away from screen" },
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
    if (!inputText.trim() && !attachedResource) return;
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    const textToSend = attachedResource
      ? `${inputText}\n\n📎 Attached Document: ${attachedResource}`
      : inputText;

    const newMsg: Message = {
      id: `m-sent-${Date.now()}`,
      sender: "self",
      senderName: "Chloe Vance",
      text: textToSend,
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
    setAttachedResource(null);
  };

  const handleAcceptInvite = (inviteId: string) => {
    const invite = invitations.find(i => i.id === inviteId);
    if (!invite) return;

    // Remove from invitations and compute next selection
    const remaining = invitations.filter(i => i.id !== inviteId);
    setInvitations(remaining);
    setActiveInviteId(remaining[0]?.id || null);

    // Add to conversations
    const newConv: Conversation = {
      id: `c-added-${Date.now()}`,
      name: invite.name,
      type: "channel",
      avatar: invite.name.split(" ").map(w => w[0]).join(""),
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: "other",
          senderName: invite.inviter,
          text: `Welcome to the ${invite.name} channel. This group was created to coordinate ${invite.description}`,
          time: "Just now"
        }
      ],
      context: {
        topic: invite.name,
        actionRequired: "Review group guidelines"
      }
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setActiveTab("conversations");
  };

  const handleDeclineInvite = (inviteId: string) => {
    const remaining = invitations.filter(i => i.id !== inviteId);
    setInvitations(remaining);
    setActiveInviteId(remaining[0]?.id || null);
  };

  // Teacher Context action handler - Full end-to-end flow with navigation & auto-modal opening
  const handleContextAction = (context: DetectedContext) => {
    // Store full context in window for target workspace to access
    const contextData = {
      id: context.id,
      type: context.type,
      trigger: context.trigger,
      confidence: context.confidence,
      title: context.title,
      description: context.description,
      date: context.date,
      time: context.time,
      targetGroup: context.targetGroup,
      participants: context.participants,
      timestamp: Date.now(),
      autoOpen: true // Signal to auto-open modal
    };

    if (context.type === "meeting") {
      // Store meeting context and navigate
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.axisContextPendingMeeting = contextData;
      }
      
      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: "meeting",
          autoOpen: true,
          context: contextData,
          meeting: {
            id: `meet-${Date.now()}`,
            title: context.title || "Coordination Meeting",
            description: context.trigger,
            date: context.date || new Date().toISOString().split('T')[0],
            time: context.time || "14:30",
            duration: "1h",
            type: "in-person",
            attendees: context.participants || ["Aarav Chen"],
            location: "TBD",
            priority: "medium"
          }
        }
      }));
      
      // Navigate to meetings workspace
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { workspace: "meetings", autoOpenModal: true }
      }));
      
    } else if (context.type === "task") {
      // Store task context, extract class/grade, navigate to class-space
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.axisContextPendingTask = contextData;
      }

      // Determine which class to navigate to (e.g., "Grade 11 Physics (B)")
      const targetClass = context.targetGroup || "Grade 11 Physics";

      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: "task",
          autoOpen: true,
          context: contextData,
          task: {
            id: `task-${Date.now()}`,
            title: context.title || "Student Task",
            description: context.trigger,
            dueDate: context.date || new Date().toISOString().split('T')[0],
            targetGroup: context.targetGroup || "Grade 11 Students",
            priority: "high"
          },
          targetClass
        }
      }));
      
      // Navigate to class-space (specific class) with auto-modal flag
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { 
          workspace: "class-space", 
          targetClass,
          autoOpenModal: true 
        }
      }));
      
    } else if (context.type === "event") {
      // Store event context and navigate to calendar
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.axisContextPendingEvent = contextData;
      }

      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: "event",
          autoOpen: true,
          context: contextData,
          event: {
            id: `evt-${Date.now()}`,
            title: context.title || "Event",
            description: context.trigger,
            date: context.date || new Date().toISOString().split('T')[0],
            time: context.time || "14:30",
            type: "event"
          }
        }
      }));
      
      // Navigate to calendar with auto-modal flag
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { workspace: "calendar", autoOpenModal: true }
      }));
      
    } else if (context.type === "assignment") {
      // Assignments go to Class Space too
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        win.axisContextPendingAssignment = contextData;
      }

      const targetClass = context.targetGroup || "Grade 11";

      window.dispatchEvent(new CustomEvent("axis-context-auto-action", {
        detail: {
          type: "assignment",
          autoOpen: true,
          context: contextData,
          targetClass
        }
      }));
      
      window.dispatchEvent(new CustomEvent("axis-navigate-workspace", {
        detail: { 
          workspace: "class-space", 
          targetClass,
          autoOpenModal: true 
        }
      }));
      
    } else if (context.type === "reminder") {
      // Reminders are simple - just show toast
      setContextToast("✓ Reminder created successfully");
      setTimeout(() => setContextToast(null), 2500);
    }
  };

  // Context confirmation handler
  const handleContextConfirm = (context: DetectedContext) => {
    setContextToast(`✓ ${context.type.charAt(0).toUpperCase() + context.type.slice(1)} created successfully`);
    setTimeout(() => setContextToast(null), 2500);
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
        "Role: Student Workload & Support Coordination",
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
        "Staffing Needs: 1 coverage request pending in Grade 10 Science",
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

          {/* Contextual Search */}
          <div className="flex items-center gap-safe-sm mt-safe-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-8 pr-safe-md py-2 text-xs text-white placeholder-white/30 focus:border-white/20 focus:bg-white/[0.04] focus:outline-none transition-all"
              />
              <svg className="absolute left-2.5 top-2.5 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Workspace selector tabs */}
        <div className="grid grid-cols-2 p-2 border-b border-white/[0.06] gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("conversations")}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-155 ${
              activeTab === "conversations"
                ? "bg-white text-black font-extrabold"
                : "text-white/40 hover:bg-white/5"
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-155 flex items-center justify-center gap-1.5 ${
              activeTab === "invitations"
                ? "bg-white text-black font-extrabold"
                : "text-white/40 hover:bg-white/5"
            }`}
          >
            Invites
            {pendingInvitesCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold ${
                activeTab === "invitations"
                  ? "bg-black text-white"
                  : "bg-cyan-500 text-black"
              }`}>
                {pendingInvitesCount}
              </span>
            )}
          </button>
        </div>

        {/* Conversation Navigation List */}
        <div className="flex-1 overflow-y-auto px-safe-sm py-safe-md space-y-safe-md scrollbar-none">
          {activeTab === "conversations" ? (
            <div>
              <span className="px-safe-sm text-[9px] font-bold text-white/25 uppercase tracking-wider block mb-safe-sm">
                School Coordination
              </span>
              <div className="space-y-0.5">
                {filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        if (showNav) setShowNav(false);
                      }}
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
                          <span className="text-[11px] font-semibold tracking-tight truncate leading-none flex items-center gap-1.5">
                            {conv.name}
                          </span>
                          {conv.unread && (
                            <span className="size-1.5 rounded-full bg-sky-400" />
                          )}
                        </div>
                        {conv.statusActivity ? (
                          <span className={`text-[9px] font-semibold flex items-center gap-1 mt-1 leading-none ${conv.statusColor || "text-white/40"}`}>
                            <span className="size-1 rounded-full bg-current animate-pulse" />
                            {conv.statusActivity}
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/30 truncate block mt-1 leading-none font-medium">
                            {conv.messages[conv.messages.length - 1]?.text || conv.role || "No messages"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <span className="px-safe-sm text-[9px] font-bold text-white/25 uppercase tracking-wider block mb-safe-sm">
                Pending Group Invitations
              </span>
              <div className="space-y-0.5">
                {invitations.map((invite) => {
                  const isActive = activeInviteId === invite.id;
                  return (
                    <button
                      key={invite.id}
                      onClick={() => setActiveInviteId(invite.id)}
                      className={`flex w-full items-center gap-safe-sm rounded-lg px-safe-sm py-safe-sm transition-all text-left group border ${
                        isActive
                          ? "bg-white/[0.05] border-white/10 text-white"
                          : "border-transparent text-white/45 hover:bg-white/[0.02] hover:text-white/80"
                      }`}
                    >
                      <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-xs font-semibold text-cyan-400">
                        {invite.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold tracking-tight truncate block leading-none text-white/95">
                          {invite.name}
                        </span>
                        <span className="text-[9px] text-cyan-400/90 truncate block mt-1 leading-none font-medium">
                          From {invite.inviter}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === "invitations" ? (
        <div className="col-span-2 grid grid-cols-1 xl:grid-cols-[1fr_360px] h-full min-w-0 divide-x divide-white/[0.06] overflow-hidden">
          {/* Left Sub-pane: Invitations Grid / Hub */}
          <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-zinc-950/20">
            {/* Hub Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white/90">Pending Group Invitations</h2>
                <p className="text-[10px] mt-1 text-white/40">
                  Review and onboard into shared coordination spaces and departments.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {pendingInvitesCount} Waiting
              </span>
            </div>

            {/* Cards Grid */}
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/90">All Caught Up!</h4>
                  <p className="text-[10px] mt-1 text-white/40">
                    You have no pending group invitations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitations.map((invite) => {
                  const isSelected = activeInviteId === invite.id;
                  return (
                    <button
                      key={invite.id}
                      onClick={() => setActiveInviteId(invite.id)}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-cyan-500/[0.04] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                          : "bg-white/[0.01] border-white/[0.05] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-extrabold">
                            {invite.name.split(" ").map(w => w[0]).join("")}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white/90">{invite.name}</h4>
                            <span className="text-[9px] text-cyan-400 font-semibold">{invite.type}</span>
                          </div>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-white/5 text-white/40">
                          {invite.membersCount} Members
                        </span>
                      </div>
                      <p className="text-[10px] mt-3 line-clamp-2 leading-relaxed text-white/40">
                        {invite.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between w-full text-[9px]">
                        <span className="text-white/40">
                          Invited by <strong className="text-white/90">{invite.inviter}</strong>
                        </span>
                        <span className="opacity-40">{invite.dateInvited}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sub-pane: Detailed Group Preview Panel */}
          <div className="flex flex-col h-full overflow-y-auto p-6 bg-[#0C0C0E]/60">
            {activeInvitation ? (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {/* Preview Header */}
                  <div>
                    <span className="text-[8px] font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                      {activeInvitation.type}
                    </span>
                    <h3 className="text-sm font-black mt-2 leading-tight text-white/90">
                      {activeInvitation.name}
                    </h3>
                    <p className="text-[10px] mt-1 text-white/40">
                      Created by {activeInvitation.createdBy}
                    </p>
                  </div>

                  {/* Purpose */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 opacity-60">Group Purpose</span>
                    <p className="text-[10px] leading-relaxed text-white/90">
                      {activeInvitation.purpose}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 opacity-60">Scope & Description</span>
                    <p className="text-[10px] leading-relaxed text-white/40">
                      {activeInvitation.description}
                    </p>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 opacity-60">Recent Activity</span>
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-semibold bg-amber-500/[0.03] border border-amber-500/10 p-2.5 rounded-lg">
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      {activeInvitation.activitySummary}
                    </div>
                  </div>

                  {/* Members Ledger */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 opacity-60">Members Directory</span>
                      <span className="text-[8px] font-semibold text-cyan-400">
                        {activeInvitation.members.filter(m => m.status === "joined").length} Joined · {activeInvitation.members.filter(m => m.status === "pending").length} Pending
                      </span>
                    </div>
                    <div className="max-h-[160px] overflow-y-auto border border-white/[0.04] rounded-lg divide-y divide-white/[0.04] p-1 bg-black/10">
                      {activeInvitation.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between p-2 text-[10px]">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-md bg-white/5 flex items-center justify-center font-bold text-[9px] border border-white/10">
                              {member.avatar}
                            </div>
                            <div>
                              <span className="font-semibold block text-white/90">{member.name}</span>
                              <span className="text-[8px] block opacity-50">{member.role}</span>
                            </div>
                          </div>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            member.status === "joined"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : member.status === "declined"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="pt-6 border-t border-white/[0.04] flex items-center gap-3">
                  <button
                    onClick={() => handleDeclineInvite(activeInvitation.id)}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-red-500/20 hover:bg-red-500/5 text-red-400 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptInvite(activeInvitation.id)}
                    className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/10 transition-all"
                  >
                    Accept Group Invitation
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="size-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 11.517 1.282l-.548.077m-.041-.02v1.5m0 2.25h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/90">No Group Selected</h4>
                  <p className="text-[10px] mt-1 text-white/40">
                    Select a pending invitation card to preview its details, scope, and roster.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
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
              <h2 className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
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
                  const isTeacher = msg.sender === "self";
                  // Detect context in non-teacher messages
                  const detectedContexts = !isTeacher ? detectContextInText(msg.text) : [];
                  
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
                        {isTeacher ? msg.text : (
                          detectedContexts.length > 0 ? (
                            <MessageTextWithTeacherContext
                              text={msg.text}
                              contexts={detectedContexts}
                              onAction={handleContextAction}
                            />
                          ) : (
                            renderHighlightedMessage(msg.text)
                          )
                        )}
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
                              sender: "other",
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
          <div className="min-h-20 border-t border-white/[0.06] px-safe-lg py-3 flex flex-col gap-2 bg-[#0A0A0C]/50 shrink-0 relative justify-center">
            {attachedResource && (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold w-fit">
                <span className="flex items-center gap-1.5">
                  <svg className="size-3 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {attachedResource}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedResource(null)}
                  className="text-white/40 hover:text-red-400 font-extrabold"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center gap-safe-md w-full">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAttachDropdownOpen(!isAttachDropdownOpen)}
                  className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02] text-white/50 hover:text-white transition-all"
                  title="Attach item"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.121L16.222 6.42" />
                  </svg>
                </button>

                {isAttachDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsAttachDropdownOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-white/[0.08] bg-[#0E0E10] p-1.5 shadow-2xl z-40 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachDropdownOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left px-3 py-2 text-[10px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="size-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        Upload files from computer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachDropdownOpen(false);
                          setIsPickerOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-[10px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="size-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Use connected resources
                      </button>
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAttachedResource(file.name);
                  }
                }}
                className="hidden"
              />
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
                className="rounded-lg bg-white hover:opacity-90 px-4 py-2.5 text-xs font-bold text-black transition-all shrink-0"
              >
                Send
              </button>
            </div>
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
              <h3 className="text-xs font-semibold text-white/95 mt-1 flex items-center gap-1.5">
                {activeConversation.name}
              </h3>
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
            Select a conversation to view related context.
          </div>
        )}
      </div>
        </>
      )}

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



      {/* 6. TEACHER CONTEXT ACTION MODAL */}
      <TeacherContextActionModal
        context={selectedContext}
        isOpen={isContextModalOpen}
        onClose={() => {
          setIsContextModalOpen(false);
          setSelectedContext(null);
        }}
        onConfirm={handleContextConfirm}
      />

      <ResourcePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(doc) => setAttachedResource(doc.title)}
        theme="dark"
        contextText={activeConversation ? `${activeConversation.messages[activeConversation.messages.length - 1]?.text || ""} ${inputText}` : inputText}
      />

      {/* Context Toast Notification */}
      <AnimatePresence>
        {contextToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-6 z-[999] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium"
          >
            {contextToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher-Side Slide-Over Support Profile Drawer */}
      <AnimatePresence>
        {profileStudentId && (
          <div className="fixed inset-0 z-[150] flex justify-end text-left normal-case">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setProfileStudentId(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-2xl bg-zinc-950 border-l border-white/10 p-6 overflow-y-auto shadow-2xl"
            >
              <StudentStatisticsProfile
                theme="axis"
                selectedStudentId={profileStudentId}
                isTeacher={true}
                onBack={() => setProfileStudentId(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

