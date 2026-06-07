"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, AXIS_TOKENS, type Theme } from "@/lib/theme-utils";
import { ResourcePickerModal } from "./connected-resources";

function ContextTrigger({
  text,
  contextTitle,
  contextType,
  actionLabel,
  onAction,
}: {
  text: string;
  contextTitle: string;
  contextType: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    if (!isHovered) return;
    updateCoords();

    window.addEventListener("scroll", updateCoords, { capture: true });
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, { capture: true });
      window.removeEventListener("resize", updateCoords);
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateCoords();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-help z-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="border-b border-dashed border-cyan-400/80 hover:bg-cyan-500/15 hover:border-cyan-400 transition-all duration-200 px-0.5 rounded-sm font-bold text-cyan-400">
        {text}
      </span>
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isHovered && coords ? (
            <motion.span
              key="context-panel"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
              className="fixed z-[9999] p-4 rounded-xl border border-cyan-500/30 bg-[#0E0E10] shadow-2xl w-60 text-left flex flex-col gap-2 pointer-events-auto"
              style={{
                left: `${coords.left + coords.width / 2}px`,
                top: `${coords.top}px`,
                transform: "translate(-50%, -100%)",
                marginTop: "-8px",
                filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.6))",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">Context Detected</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">
                  {contextType}
                </span>
              </span>
              <p className="text-[10px] text-white/70 leading-normal">{contextTitle}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                  setIsHovered(false);
                }}
                className="mt-1 w-full px-3 py-1.5 rounded bg-cyan-500 text-black text-[9px] font-extrabold hover:bg-cyan-400 transition-colors uppercase tracking-wider text-center cursor-pointer"
              >
                {actionLabel}
              </button>
            </motion.span>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}

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
  deadline?: string;
  actionRequired?: string;
  caseloadSummary?: string;
  lastActive?: string;
};

type GroupInvite = {
  id: string;
  name: string;
  inviter: string;
  inviterRole: string;
  description: string;
  membersCount: number;
  status: "pending" | "accepted" | "declined";
};

type Conversation = {
  id: string;
  name: string;
  type: "direct" | "channel";
  avatar: string;
  role?: string;
  presence?: "available" | "teaching" | "in-meeting" | "focus" | "offline";
  unread?: boolean;
  isPinned?: boolean;
  messages: Message[];
  context: ContextInfo;
};

function MessageTextWithContext({
  msg,
  onAction,
}: {
  msg: Message;
  onAction: (actionType: string) => void;
}) {
  if (msg.id === "m-meet") {
    return (
      <span>
        Can we{" "}
        <ContextTrigger
          text="meet Friday after school"
          contextType="Meeting Mentioned"
          contextTitle="Can we meet Friday after school?"
          actionLabel="Create Meeting"
          onAction={() => onAction("create-meeting")}
        />
        ?
      </span>
    );
  }
  if (msg.id === "m-proj") {
    return (
      <span>
        The{" "}
        <ContextTrigger
          text="projector in S504"
          contextType="Issue Found"
          contextTitle="The projector in S504 is not focusing properly."
          actionLabel="Create Maintenance Request"
          onAction={() => onAction("create-request")}
        />{" "}
        is not focusing properly.
      </span>
    );
  }
  if (msg.id === "m-feedback") {
    return (
      <span>
        Can you send the{" "}
        <ContextTrigger
          text="IA feedback by Monday"
          contextType="Task Mentioned"
          contextTitle="Can you send the IA feedback by Monday?"
          actionLabel="View Assessment Policy"
          onAction={() => onAction("view-assessment-policy")}
        />
        ?
      </span>
    );
  }
  return <span>{msg.text}</span>;
}

export function CoordinatorMessages({ theme }: { theme: Theme }) {
  const [presenceStatus, setPresenceStatus] = useState<string>("available");
  const [presenceDropdownOpen, setPresenceDropdownOpen] = useState(false);
  const [searchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [confirmRequest, setConfirmRequest] = useState<{ id: string; location: string; category: string; description: string; impact: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connected Resources states
  const [attachedResource, setAttachedResource] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "c-1",
      name: "DP Faculty Coordination",
      type: "channel",
      avatar: "FC",
      isPinned: true,
      unread: true,
      messages: [
        { id: "m1", sender: "other", senderName: "Aarav Chen", text: "Are all Physics HL predicted grades finalized for DP2?", time: "10:14 AM" },
        { id: "m2", sender: "self", senderName: "Ms. Sarah Thompson", text: "Physics and Chemistry HL are locked. We are waiting on Math AA HL upload.", time: "10:15 AM" },
        { id: "m3", sender: "other", senderName: "Marcus Vance", text: "Math AA HL predicted grades will be uploaded by Period 4. Just doing a final moderation check on Lucas Gray's IA.", time: "10:18 AM" },
        { id: "m-proj", sender: "other", senderName: "Ananya Rao", text: "The projector in S504 is not focusing properly.", time: "11:25 AM" }
      ],
      context: {
        room: "Conference Room B",
        topic: "DP2 Predicted Grades Lock",
        deadline: "Locked by Today 16:00",
        actionRequired: "Lock all moderated grade lists",
      }
    },
    {
      id: "c-2",
      name: "Aarav Chen",
      type: "direct",
      avatar: "AC",
      role: "Physics HL Lead & CAS Coordinator",
      presence: "available",
      isPinned: true,
      unread: false,
      messages: [
        { id: "m4", sender: "other", senderName: "Aarav Chen", text: "Sarah, I'm meeting with Chloe Vance about her Extended Essay research. She is struggling with the physics lab data calculations.", time: "Yesterday" },
        { id: "m5", sender: "self", senderName: "Ms. Sarah Thompson", text: "I can support her during Period 3. Let's redirect her to the library study block.", time: "Yesterday" },
        { id: "m-meet", sender: "other", senderName: "Aarav Chen", text: "Can we meet Friday after school?", time: "11:20 AM" },
        { id: "m-feedback", sender: "other", senderName: "Aarav Chen", text: "Can you send the IA feedback by Monday?", time: "11:22 AM" }
      ],
      context: {
        room: "Lab 3",
        topic: "Extended Essay Support Plan",
        caseloadSummary: "Chloe Vance (Physics EE) · Watch",
        lastActive: "Active now"
      }
    },
    {
      id: "c-3",
      name: "Mr. Michael Torres",
      type: "direct",
      avatar: "MT",
      role: "Head of School",
      presence: "in-meeting",
      unread: false,
      messages: [
        { id: "m6", sender: "other", senderName: "Mr. Michael Torres", text: "Sarah, please review the IB DP evaluation guidelines for the board presentation on Friday.", time: "09:12 AM" }
      ],
      context: {
        room: "Boardroom",
        topic: "DP Board Evaluation Report",
        deadline: "Presentation Friday 10:00 AM",
        lastActive: "In meeting"
      }
    }
  ]);

  const [invitations, setInvitations] = useState<GroupInvite[]>([
    {
      id: "inv-1",
      name: "TOK Review Board",
      inviter: "Mr. Michael Torres",
      inviterRole: "Head of School",
      description: "Discussion of TOK exhibition evaluations and advisor moderation notes.",
      membersCount: 4,
      status: "pending"
    },
    {
      id: "inv-2",
      name: "Extended Essay Moderation",
      inviter: "Aarav Chen",
      inviterRole: "Physics Lead",
      description: "EE draft review and advisor assignment updates for DP1 candidates.",
      membersCount: 6,
      status: "pending"
    }
  ]);

  const [activeTab, setActiveTab] = useState<string>("conversations"); // "conversations" or "invitations"
  const [activeConvId, setActiveConvId] = useState<string>("c-1");
  const [activeInviteId, setActiveInviteId] = useState<string | null>("inv-1");

  // Video call/meeting simulation
  const [isInMeeting, setIsInMeeting] = useState(false);
  const meetingTimerRef = useRef(0);
  const [meetingTimerString, setMeetingTimerString] = useState("00:00");

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  const activeInvitation = useMemo(() => {
    return invitations.find((i) => i.id === activeInviteId);
  }, [invitations, activeInviteId]);

  const statuses = [
    { id: "available", label: "Available", color: "bg-emerald-500", desc: "Open to coordination reviews" },
    { id: "in-meeting", label: "In Meeting", color: "bg-blue-500", desc: "Mute alerts; active sessions" },
    { id: "focus", label: "Focus Mode", color: "bg-purple-500", desc: "Deep work; notices silenced" },
    { id: "offline", label: "Offline", color: "bg-neutral-500", desc: "Quiet period" },
  ];

  const currentPresence = statuses.find((s) => s.id === presenceStatus) || statuses[0];

  // Sync Meeting Timer
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
      senderName: "Ms. Sarah Thompson",
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

    // Remove from invitations
    setInvitations(prev => prev.filter(i => i.id !== inviteId));
    setActiveInviteId(invitations.find(i => i.id !== inviteId)?.id || null);

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
    setInvitations(prev => prev.filter(i => i.id !== inviteId));
    setActiveInviteId(invitations.find(i => i.id !== inviteId)?.id || null);
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.messages.some((m) => m.text.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const pendingInvitesCount = invitations.length;
  const styles = getAxisTheme(theme);

  return (
    <div className={`relative grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] h-[calc(100vh-140px)] w-full border backdrop-blur-xl overflow-hidden ${AXIS_TOKENS.borderRadius.widget} ${AXIS_TOKENS.shadows.card} ${styles.cardBg}`}>
      
      {/* ─── 1. SIDEBAR NAVIGATION PANEL ───────────────────────────────────── */}
      <div className={`flex flex-col border-r ${styles.border} ${
        theme === "light" 
          ? "bg-black/[0.02]" 
          : theme === "high-contrast" 
            ? "bg-black" 
            : "bg-[#0C0C0E]/40"
      }`}>
        {/* Profile Presence Header */}
        <div className={`p-safe-md border-b ${styles.border}`}>
          <div className="relative">
            <button
              onClick={() => setPresenceDropdownOpen(!presenceDropdownOpen)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-all text-left ${styles.border} ${
                theme === "light"
                  ? "bg-black/[0.01] hover:bg-black/[0.03]"
                  : theme === "high-contrast"
                    ? "bg-black hover:bg-white/10"
                    : "bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${currentPresence.color} animate-pulse`} />
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold leading-tight ${styles.textPrimary}`}>Ms. Sarah Thompson</span>
                  <span className={`text-[9px] leading-none ${styles.textSecondary}`}>{currentPresence.label}</span>
                </div>
              </div>
              <svg className={`size-3 transition-transform ${presenceDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
                    className={`absolute left-0 right-0 z-50 mt-1.5 border p-1 ${AXIS_TOKENS.borderRadius.item} ${AXIS_TOKENS.shadows.popover} ${styles.cardBg}`}
                  >
                    {statuses.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setPresenceStatus(item.id);
                          setPresenceDropdownOpen(false);
                        }}
                        className={`flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition-all ${
                          presenceStatus === item.id 
                            ? theme === "light"
                              ? "bg-black/[0.06] text-black font-semibold"
                              : theme === "high-contrast"
                                ? "bg-white text-black font-semibold"
                                : "bg-white/[0.06] text-white font-semibold"
                            : theme === "light"
                              ? "text-black/60 hover:bg-black/[0.02]"
                              : theme === "high-contrast"
                                ? "text-white hover:bg-white/10"
                                : "text-white/60 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${item.color}`} />
                          <span className="text-[10px] font-semibold">{item.label}</span>
                        </div>
                        <span className="text-[8px] opacity-40 leading-snug mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Workspace selector tabs */}
        <div className={`grid grid-cols-2 p-2 border-b gap-1 shrink-0 ${styles.border}`}>
          <button
            onClick={() => setActiveTab("conversations")}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === "conversations"
                ? theme === "light"
                  ? "bg-black text-white"
                  : theme === "high-contrast"
                    ? "bg-white text-black"
                    : "bg-white text-black"
                : theme === "light"
                  ? "text-black/40 hover:bg-black/5"
                  : theme === "high-contrast"
                    ? "text-white hover:bg-white/10"
                    : "text-white/40 hover:bg-white/5"
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
              activeTab === "invitations"
                ? theme === "light"
                  ? "bg-black text-white"
                  : theme === "high-contrast"
                    ? "bg-white text-black"
                    : "bg-white text-black"
                : theme === "light"
                  ? "text-black/40 hover:bg-black/5"
                  : theme === "high-contrast"
                    ? "text-white hover:bg-white/10"
                    : "text-white/40 hover:bg-white/5"
            }`}
          >
            Invites
            {pendingInvitesCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold ${
                activeTab === "invitations"
                  ? theme === "light"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : "bg-cyan-500 text-black"
              }`}>
                {pendingInvitesCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5 scrollbar-none">
          {activeTab === "conversations" ? (
            filteredConversations.map((conv) => {
              const isActive = activeConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all border ${
                    isActive
                      ? theme === "light"
                        ? "bg-black/[0.04] border-black/10 text-black"
                        : theme === "high-contrast"
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-white"
                      : theme === "light"
                        ? "border-transparent text-black/60 hover:bg-black/[0.02] hover:text-black"
                        : theme === "high-contrast"
                          ? "border-transparent text-white hover:bg-white/10"
                          : "border-transparent text-white/60 hover:bg-white/[0.02] hover:text-white"
                  }`}
                >
                  <div className={`relative flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                    theme === "light"
                      ? "bg-black/[0.03] border border-black/10 text-black"
                      : "bg-white/[0.03] border border-white/10 text-white"
                  }`}>
                    {conv.avatar}
                    {conv.presence && (
                      <span className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-[#0C0C0E] ${
                        conv.presence === "available" ? "bg-emerald-500" : "bg-neutral-500"
                      }`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-[11px] font-bold truncate leading-none ${isActive ? (theme === "light" ? "text-black" : "text-white") : styles.textPrimary}`}>{conv.name}</span>
                      {conv.unread && <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />}
                    </div>
                    <span className={`text-[9px] truncate block mt-1 leading-none font-medium ${isActive ? (theme === "light" ? "text-black/60" : "text-white/60") : styles.textSecondary}`}>
                      {conv.messages[conv.messages.length - 1]?.text || conv.role}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            invitations.map((invite) => {
              const isActive = activeInviteId === invite.id;
              return (
                <button
                  key={invite.id}
                  onClick={() => setActiveInviteId(invite.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border ${
                    isActive
                      ? theme === "light"
                        ? "bg-black/[0.04] border-black/10 text-black"
                        : theme === "high-contrast"
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-white"
                      : theme === "light"
                        ? "border-transparent text-black/60 hover:bg-black/[0.02] hover:text-black"
                        : theme === "high-contrast"
                          ? "border-transparent text-white hover:bg-white/10"
                          : "border-transparent text-white/60 hover:bg-white/[0.02] hover:text-white"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-extrabold">
                    {invite.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[11px] font-bold block leading-none ${isActive ? (theme === "light" ? "text-black" : "text-white") : styles.textPrimary}`}>{invite.name}</span>
                    <span className="text-[9px] text-cyan-400 font-semibold block mt-1 leading-none">
                      From {invite.inviter}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── 2. CENTER PANEL (CHAT OR INVITATION DETAIL) ────────────────── */}
      <div className={`flex flex-col relative min-w-0 ${
        theme === "light" 
          ? "bg-black/[0.01]" 
          : theme === "high-contrast" 
            ? "bg-black" 
            : "bg-[#0A0A0C]/40"
      }`}>
        
        {/* Tab Header */}
        <div className={`h-16 border-b px-6 flex items-center justify-between shrink-0 ${styles.border}`}>
          {activeTab === "conversations" ? (
            <>
              <div className="flex flex-col">
                <h4 className={`text-xs font-bold ${styles.textPrimary}`}>{activeConversation?.name}</h4>
                <span className={`text-[9px] mt-0.5 leading-none ${styles.textSecondary}`}>{activeConversation?.role || "Active Room Channel"}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInMeeting(true)}
                  className={`rounded-xl border p-2 transition-all flex items-center justify-center ${styles.buttonSecondary}`}
                  title="Voice Call"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.145-5.09-3.41-6.233-6.233l1.293-.97c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsInMeeting(true)}
                  className={`rounded-xl p-2 transition-all flex items-center justify-center ${styles.buttonPrimary}`}
                  title="Video Call"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <h4 className={`text-xs font-bold ${styles.textPrimary}`}>Pending Group Requests</h4>
              <span className="text-[9px] text-cyan-400 font-bold uppercase mt-0.5 leading-none">Invitations Ledger</span>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {activeTab === "conversations" ? (
            !isInMeeting ? (
              <div className="space-y-4">
                {activeConversation?.messages.map((msg) => {
                  const isSelf = msg.sender === "self";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold tracking-tight ${styles.textSecondary} opacity-60`}>{msg.senderName}</span>
                        <span className={`text-[8px] ${styles.textSecondary} opacity-40`}>{msg.time}</span>
                      </div>
                      <div className={`rounded-2xl max-w-lg px-4 py-2.5 text-xs leading-relaxed ${
                        isSelf 
                          ? theme === "light"
                            ? "bg-cyan-600 text-white rounded-tr-sm"
                            : theme === "high-contrast"
                              ? "bg-white text-black font-bold rounded-tr-sm"
                              : "bg-white text-black rounded-tr-sm"
                          : theme === "light"
                            ? "bg-black/[0.03] border border-black/[0.06] text-black/80 rounded-tl-sm"
                            : theme === "high-contrast"
                              ? "bg-black border border-white text-white rounded-tl-sm"
                              : "bg-white/[0.04] border border-white/[0.08] text-white/90 rounded-tl-sm"
                      }`}>
                        <MessageTextWithContext
                          msg={msg}
                          onAction={(actionType) => {
                            if (actionType === "create-meeting") {
                              if (typeof window !== "undefined") {
                                const win = window as typeof window & {
                                  pendingContextMeeting?: {
                                    id: string;
                                    title: string;
                                    description: string;
                                    date: string;
                                    time: string;
                                    duration: string;
                                    type: string;
                                    attendees: string[];
                                    location: string;
                                    priority: string;
                                  };
                                };
                                win.pendingContextMeeting = {
                                  id: "meet-fry",
                                  title: "Aarav Chen coordination review",
                                  description: "Friday meeting mentioned in messages log.",
                                  date: "2026-06-05",
                                  time: "15:30",
                                  duration: "1h",
                                  type: "in-person",
                                  attendees: ["Ms. Sarah Thompson", "Aarav Chen"],
                                  location: "Science Lab 3",
                                  priority: "medium"
                                };
                              }
                              window.dispatchEvent(new CustomEvent("axis-context-create-meeting", {
                                detail: {
                                  meeting: {
                                    id: "meet-fry",
                                    title: "Aarav Chen coordination review",
                                    description: "Friday meeting mentioned in messages log.",
                                    date: "2026-06-05", // Friday
                                    time: "15:30",
                                    duration: "1h",
                                    type: "in-person",
                                    attendees: ["Ms. Sarah Thompson", "Aarav Chen"],
                                    location: "Science Lab 3",
                                    priority: "medium"
                                  }
                                }
                              }));
                              window.dispatchEvent(new CustomEvent("axis-navigate-tab", {
                                detail: { tab: "meetings" }
                              }));
                            } else if (actionType === "create-request") {
                              setConfirmRequest({
                                id: "req-proj",
                                location: "Science Lab S504",
                                category: "Technology Issue",
                                description: "The projector in S504 is not focusing properly.",
                                impact: "Science classes in S504 affected by blurry projection."
                              });
                            } else if (actionType === "view-assessment-policy") {
                              window.dispatchEvent(new CustomEvent("axis-navigate-tab", {
                                detail: { tab: "resources" }
                              }));
                              triggerToast("Opening Assessment Policy & Criteria document.");
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                {/* Meeting views */}
                <div className="grid grid-cols-2 gap-4 flex-grow mb-6">
                  <div className={`rounded-xl border flex flex-col justify-between p-4 relative overflow-hidden h-40 ${styles.cardBg}`}>
                    <div className="flex justify-between items-start z-10">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-70`}>Self</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded ${theme === "light" ? "bg-black/10 text-black/60" : "bg-white/10 text-white/60"}`}>Host</span>
                    </div>
                    <div className="flex items-end justify-between z-10">
                      <span className={`text-xs font-bold ${styles.textPrimary}`}>Ms. Sarah Thompson</span>
                      <span className={`text-[8px] ${styles.textSecondary}`}>Audio Connected</span>
                    </div>
                  </div>
                  <div className={`rounded-xl border flex flex-col justify-between p-4 relative overflow-hidden h-40 ${styles.cardBg}`}>
                    <div className="flex justify-between items-start z-10">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-70`}>Participant</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded ${theme === "light" ? "bg-black/10 text-black/60" : "bg-white/10 text-white/60"}`}>Lead</span>
                    </div>
                    <div className="flex items-end justify-between z-10">
                      <span className={`text-xs font-bold ${styles.textPrimary}`}>{activeConversation?.name}</span>
                      <span className="text-[8px] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/10 px-1.5 py-0.5 rounded">Speaking</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border ${styles.border} ${
                  theme === "light"
                    ? "bg-black/[0.01]"
                    : "bg-white/[0.01]"
                }`}>
                  <div className="flex flex-col">
                    <span className={`text-[8px] font-bold uppercase ${styles.textSecondary} opacity-70`}>Session Rhythm</span>
                    <span className={`text-xs font-semibold mt-1 ${styles.textPrimary}`}>DP Programme Coordination Call</span>
                  </div>
                  <button
                    onClick={() => setIsInMeeting(false)}
                    className="rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[9px] px-3.5 py-2 uppercase hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
                  >
                    Disconnect ({meetingTimerString})
                  </button>
                </div>
              </div>
            )
          ) : (
            activeInvitation ? (
              <div className={`max-w-md mx-auto ${AXIS_TOKENS.borderRadius.widget} border p-6 text-center space-y-6 ${styles.cardBg}`}>
                <div className="flex size-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 items-center justify-center text-xl font-bold mx-auto">
                  {activeInvitation.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`text-base font-bold ${styles.textPrimary}`}>{activeInvitation.name}</h4>
                  <p className="text-[10px] text-cyan-400 mt-1 font-semibold">
                    Invited by {activeInvitation.inviter} ({activeInvitation.inviterRole})
                  </p>
                  <p className={`text-xs leading-relaxed mt-4 ${styles.textSecondary}`}>
                    {activeInvitation.description}
                  </p>
                </div>
                <div className={`flex items-center justify-center gap-4 text-xs font-semibold py-2 border-y ${styles.border}`}>
                  <span className={`${styles.textSecondary} opacity-60`}>Proposed Members</span>
                  <span className={styles.textPrimary}>{activeInvitation.membersCount} invited faculty</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDeclineInvite(activeInvitation.id)}
                    className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptInvite(activeInvitation.id)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all ${styles.buttonPrimary}`}
                  >
                    Accept Invite
                  </button>
                </div>
              </div>
            ) : (
              <div className={`py-20 text-center text-xs ${styles.textSecondary}`}>
                No pending invitations. All group invitations reviewed.
              </div>
            )
          )}
        </div>

        {/* Input Message Area (only for conversations view) */}
        {activeTab === "conversations" && !isInMeeting && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              try {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                  const item = JSON.parse(data);
                  if (item && item.title) {
                    setAttachedResource(item.title);
                    if (item.content) {
                      setInputText((prev) => 
                        prev ? `${prev}\n\n[Attached: ${item.title}] ${item.content}` : `[Attached: ${item.title}] ${item.content}`
                      );
                    }
                  }
                }
              } catch (err) {
                console.error("Failed to drop item in messages panel", err);
              }
            }}
            className={`p-4 border-t shrink-0 ${styles.border} flex flex-col gap-2 transition-all duration-200 ${
              isDragOver ? "ring-2 ring-cyan-400 border-cyan-400/50 bg-cyan-950/10 scale-[1.01]" : ""
            }`}
          >
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
            <div className="flex gap-3 items-center">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center shrink-0 ${
                  theme === "light"
                    ? "border-black/10 hover:bg-black/5 text-black/60"
                    : "border-white/10 hover:bg-white/5 text-white/60"
                }`}
                title="Attach from Connected Resources"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder={`Send message to ${activeConversation?.name}...`}
                className={`flex-grow rounded-lg border px-4 py-2.5 text-xs focus:outline-none transition-all ${styles.inputBg} focus:border-cyan-500/50 text-white`}
              />
              <button
                onClick={handleSendMessage}
                className={`rounded-lg px-5 py-2.5 text-xs font-bold transition-all shrink-0 ${styles.buttonPrimary}`}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. RIGHT PANEL (CONTEXT DETAILS CARD) ────────────────────── */}
      <div className={`p-5 space-y-6 overflow-y-auto border-l ${styles.border} ${
        theme === "light" 
          ? "bg-black/[0.02]" 
          : theme === "high-contrast" 
            ? "bg-black" 
            : "bg-[#0C0C0E]/40"
      }`}>
        {activeTab === "conversations" && activeConversation ? (
          <>
            <div>
              <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                Workflow Context
              </span>
              <h5 className={`text-xs font-bold mt-1.5 ${styles.textPrimary}`}>
                {activeConversation.name}
              </h5>
              {activeConversation.role && (
                <p className={`text-[10px] mt-1 ${styles.textSecondary}`}>{activeConversation.role}</p>
              )}
            </div>

            <div className={`space-y-4 pt-4 border-t ${styles.border}`}>
              {activeConversation.context.room && (
                <div>
                  <span className={`text-[9px] uppercase font-bold ${styles.textSecondary} opacity-60`}>Location Desk</span>
                  <p className={`text-xs font-semibold mt-0.5 ${styles.textPrimary}`}>{activeConversation.context.room}</p>
                </div>
              )}
              {activeConversation.context.topic && (
                <div>
                  <span className={`text-[9px] uppercase font-bold ${styles.textSecondary} opacity-60`}>Inquiry Thread</span>
                  <p className={`text-xs font-semibold mt-0.5 ${styles.textPrimary}`}>{activeConversation.context.topic}</p>
                </div>
              )}
              {activeConversation.context.deadline && (
                <div>
                  <span className={`text-[9px] uppercase font-bold ${styles.textSecondary} opacity-60`}>Submission Block</span>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">{activeConversation.context.deadline}</p>
                </div>
              )}
              {activeConversation.context.caseloadSummary && (
                <div>
                  <span className={`text-[9px] uppercase font-bold ${styles.textSecondary} opacity-60`}>Core Telemetry</span>
                  <p className={`text-xs font-semibold mt-0.5 ${styles.textSecondary}`}>{activeConversation.context.caseloadSummary}</p>
                </div>
              )}
              {activeConversation.context.lastActive && (
                <div>
                  <span className={`text-[9px] uppercase font-bold ${styles.textSecondary} opacity-60`}>Telemetry Sync</span>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{activeConversation.context.lastActive}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/[0.05]">
              <span className="text-[8px] font-semibold text-cyan-400 bg-cyan-500/[0.05] p-2 rounded-lg border border-cyan-500/10 block text-center">
                DP COORDINATION NODE active
              </span>
            </div>
          </>
        ) : (
          <div className={`text-center py-20 text-[10px] ${styles.textSecondary}`}>
            Select a conversation channel or review invites ledger.
          </div>
        )}
      </div>
      {/* Persistent Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 z-50 bg-[#0E0E10] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] px-5 py-3 rounded-full text-xs text-white/90 flex items-center gap-2.5 backdrop-blur-md"
          >
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-medium tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Maintenance Request Confirmation Modal */}
      <AnimatePresence>
        {confirmRequest && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm select-none">
            <div className="fixed inset-0" onClick={() => setConfirmRequest(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0E0E10] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl z-10 text-white"
            >
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Create Maintenance Request</span>
                </div>
                <button onClick={() => setConfirmRequest(null)} className="text-white/40 hover:text-white">✕</button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-white/35">Location</label>
                  <input
                    type="text"
                    value={confirmRequest.location}
                    onChange={(e) => setConfirmRequest({ ...confirmRequest, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-white/35">Category</label>
                  <input
                    type="text"
                    value={confirmRequest.category}
                    onChange={(e) => setConfirmRequest({ ...confirmRequest, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-white/35">Issue / Description</label>
                  <textarea
                    rows={3}
                    value={confirmRequest.description}
                    onChange={(e) => setConfirmRequest({ ...confirmRequest, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-black/40 border-white/[0.08] text-white outline-none focus:border-cyan-500/50 resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setConfirmRequest(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("axis-context-create-request", {
                      detail: {
                        request: {
                          id: confirmRequest.id,
                          type: "facility_issue",
                          category: confirmRequest.category,
                          reporterName: "Ananya Rao",
                          reporterRole: "teacher",
                          reporterEmail: "ananya.rao@axis.edu",
                          location: confirmRequest.location,
                          locationId: "room-504",
                          description: confirmRequest.description,
                          operationalImpact: confirmRequest.impact
                        }
                      }
                    }));
                    triggerToast("Maintenance Request logged.");
                    setConfirmRequest(null);
                  }}
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ResourcePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(doc) => setAttachedResource(doc.title)}
        theme={theme}
      />
    </div>
  );
}
