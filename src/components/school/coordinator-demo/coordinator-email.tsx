"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

function EmailBodyWithContext({
  email,
  onAction,
}: {
  email: Email;
  onAction: (actionType: string) => void;
}) {
  if (email.id === "em-coord-1") {
    return (
      <p className="text-xs text-white/70 leading-relaxed font-medium">
        Hi Sarah,{"\n\n"}I wanted to follow up on the planning for the upcoming{" "}
        <ContextTrigger
          text="Grade 12 Bake Sale on September 18"
          contextType="Potential Event"
          contextTitle="Grade 12 Bake Sale on September 18"
          actionLabel="Create Event"
          onAction={() => onAction("create-event")}
        />
        . We need to book the central courtyard and coordinate parent volunteers.{"\n\n"}
        Could you double check the availability and register this event in the system so that staff and parents are notified?{"\n\n"}
        Best,{"\n"}David Miller
      </p>
    );
  }
  if (email.id === "em-coord-2") {
    return (
      <p className="text-xs text-white/70 leading-relaxed font-medium">
        Hi Sarah,{"\n\n"}
        Just a reminder that we have the{" "}
        <ContextTrigger
          text="TOK Exhibition due next week"
          contextType="Deadline Mentioned"
          contextTitle="TOK Exhibition due next week"
          actionLabel="View TOK Guidelines"
          onAction={() => onAction("view-tok-resources")}
        />
        . Please check the supervisor progress logs and make sure they are on track.{"\n\n"}
        Thanks,{"\n"}Aarav Chen
      </p>
    );
  }
  return (
    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-medium">
      {email.body}
    </p>
  );
}

type EmailFolder = "inbox" | "sent" | "drafts" | "archived";

type Email = {
  id: string;
  from: string;
  fromRole: string;
  fromAvatar: string;
  to: string;
  subject: string;
  body: string;
  time: string;
  date: string;
  folder: EmailFolder;
  isRead: boolean;
  isStarred: boolean;
  tags?: string[];
};

const INITIAL_EMAILS: Email[] = [
  {
    id: "em-coord-1",
    from: "David Miller",
    fromRole: "Grade 12 Lead",
    fromAvatar: "DM",
    to: "sarah.thompson@axis.edu",
    subject: "Grade 12 Bake Sale coordination request",
    body: "Hi Sarah,\n\nI wanted to follow up on the planning for the upcoming Grade 12 Bake Sale on September 18. We need to book the central courtyard and coordinate parent volunteers.\n\nCould you double check the availability and register this event in the system so that staff and parents are notified?\n\nBest,\nDavid Miller",
    time: "10:45 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: true,
    tags: ["Bake Sale", "Courtyard"]
  },
  {
    id: "em-coord-2",
    from: "Sarah Chen",
    fromRole: "Guidance Counselor",
    fromAvatar: "SC",
    to: "sarah.thompson@axis.edu",
    subject: "TOK Exhibition draft moderation checkpoint",
    body: "Sarah,\n\nPlease note that the TOK Exhibition due next week must have all advisor comments and predicted grades locked. We are still missing 4 supervisor reports.\n\nCould you run a quick status audit and alert the advisors?\n\nThanks,\nSarah Chen",
    time: "09:12 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: false,
    tags: ["TOK Exhibition", "Deadlines"]
  },
  {
    id: "em-coord-3",
    from: "Mr. Michael Torres",
    fromRole: "Head of School",
    fromAvatar: "MT",
    to: "sarah.thompson@axis.edu",
    subject: "DP Accreditation Board visit guidelines",
    body: "Hi Sarah,\n\nAhead of our board review on Friday, please ensure the curriculum audit spreadsheets and syllabus coverage plans for PYP, MYP, and DP are compiled and accessible.\n\nI will need a brief summary outline on Thursday afternoon.\n\nWarm regards,\nMichael",
    time: "Yesterday",
    date: "June 3",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    tags: ["Board Review"]
  }
];

export function CoordinatorEmail({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>("em-coord-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compose email states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState("david.miller@axis.edu");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [attachedResource, setAttachedResource] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const handleCompose = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setComposeTo(customEvent.detail.to || "");
        setComposeSubject(customEvent.detail.subject || "");
        setComposeBody(customEvent.detail.body || "");
        setAttachedResource(null);
        setShowComposeModal(true);
      }
    };
    window.addEventListener("axis-compose-email", handleCompose);

    // Check for pending compose email on mount
    const win = window as typeof window & {
      pendingComposeEmail?: { to: string; subject: string; body: string };
    };
    if (typeof window !== "undefined" && win.pendingComposeEmail) {
      const details = win.pendingComposeEmail;
      setComposeTo(details.to || "");
      setComposeSubject(details.subject || "");
      setComposeBody(details.body || "");
      setAttachedResource(null);
      setShowComposeModal(true);
      delete win.pendingComposeEmail;
    }

    return () => window.removeEventListener("axis-compose-email", handleCompose);
  }, []);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) return;

    const newEmail: Email = {
      id: `em-sent-${Date.now()}`,
      from: "Ms. Sarah Thompson",
      fromRole: "DP Coordinator",
      fromAvatar: "ST",
      to: composeTo,
      subject: composeSubject,
      body: composeBody,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today",
      folder: "sent",
      isRead: true,
      isStarred: false,
      tags: attachedResource ? [attachedResource.replace(".pdf", "").replace(".docx", "")] : []
    };

    if (attachedResource) {
      newEmail.body += `\n\n📎 Attached Document: ${attachedResource}`;
    }

    setEmails(prev => [newEmail, ...prev]);
    setShowComposeModal(false);
    setComposeSubject("");
    setComposeBody("");
    setAttachedResource(null);
    triggerToast("Email dispatched successfully.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const folders: { id: EmailFolder; label: string; icon: React.ReactNode }[] = [
    {
      id: "inbox",
      label: "Inbox",
      icon: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.399 0V6.106c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0113.648 0c1.131.094 1.976 1.057 1.976 2.192V13.5" />
        </svg>
      )
    },
    {
      id: "sent",
      label: "Sent",
      icon: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      )
    },
    {
      id: "drafts",
      label: "Drafts",
      icon: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      )
    },
    {
      id: "archived",
      label: "Archived",
      icon: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
    }
  ];

  const unreadCount = useMemo(() => {
    return emails.filter((e) => !e.isRead && e.folder === "inbox").length;
  }, [emails]);

  const filteredEmails = useMemo(() => {
    let filtered = emails.filter((e) => e.folder === activeFolder);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [emails, activeFolder, searchQuery]);

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((em) => (em.id === id ? { ...em, isStarred: !em.isStarred } : em))
    );
  };

  return (
    <div className={`relative grid grid-cols-1 lg:grid-cols-[200px_280px_1fr] h-[calc(100vh-140px)] w-full border backdrop-blur-xl overflow-hidden ${AXIS_TOKENS.borderRadius.widget} ${AXIS_TOKENS.shadows.card} ${styles.cardBg}`}>
      
      {/* 1. Left Folders Navigation */}
      <div className={`flex flex-col border-r ${styles.border} ${theme === "light" ? "bg-black/[0.02]" : "bg-[#0C0C0E]/40"}`}>
        <div className={`p-4 border-b ${styles.border}`}>
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block leading-none">Inbox Hub</span>
            <span className="text-xs font-bold leading-none mt-1.5 text-white/90">sarah.thompson@axis.edu</span>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={() => setShowComposeModal(true)}
            className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg shadow-md transition-all ${styles.buttonPrimary}`}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Compose Email
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {folders.map((folder) => {
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolder(folder.id);
                  setSelectedEmailId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-cyan-400" : "text-white/40"}>
                    {folder.icon}
                  </span>
                  <span>{folder.label}</span>
                </div>
                {folder.id === "inbox" && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-cyan-500 text-black rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Middle Email List Pane */}
      <div className={`flex flex-col border-r ${styles.border} bg-[#0A0A0C]/10`}>
        {/* Search */}
        <div className={`p-3 border-b ${styles.border}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none transition-all ${styles.inputBg} focus:border-cyan-500/50`}
            />
            <svg className="absolute left-2.5 top-2.5 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {/* List of Email Cards */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-xs font-semibold">No emails found</div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = selectedEmailId === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.06] border-white/20"
                      : "bg-[#111115]/30 border-white/[0.03] hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="size-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {email.fromAvatar}
                      </div>
                      <span className={`text-[11px] truncate text-white/90 ${!email.isRead ? "font-extrabold text-cyan-400" : "font-semibold"}`}>
                        {email.from}
                      </span>
                    </div>
                    <span className="text-[8px] text-white/30 shrink-0 font-bold">{email.time}</span>
                  </div>

                  <h4 className={`text-[11px] mb-1 truncate text-white/80 ${!email.isRead ? "font-bold text-white" : "font-medium"}`}>
                    {email.subject}
                  </h4>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed mb-2 font-medium">
                    {email.body.replace(/\n/g, " ")}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {email.tags?.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.2 bg-white/[0.04] text-white/45 rounded text-[8px] border border-white/[0.02] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => handleToggleStar(email.id, e)}
                      className="text-white/30 hover:text-amber-400 transition-colors p-0.5 shrink-0"
                    >
                      <svg className={`size-3.5 ${email.isStarred ? "fill-amber-400 text-amber-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Right Email Detailed View Pane */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#0A0A0C]/5">
        {selectedEmail ? (
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Header / Info Row */}
            <div className={`p-4 border-b ${styles.border} flex items-start gap-3`}>
              <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                {selectedEmail.fromAvatar}
              </div>
              <div className="min-w-0 flex-grow">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white/95">{selectedEmail.from}</h2>
                  <span className="text-[9px] text-white/40 font-bold">{selectedEmail.date} · {selectedEmail.time}</span>
                </div>
                <div className="text-[10px] text-white/55 mt-0.5 font-medium">
                  Sender: {selectedEmail.fromRole}
                </div>
                <div className="text-[10px] text-white/40 font-medium">
                  To: {selectedEmail.to}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h1 className="text-sm font-bold text-white leading-snug tracking-wide border-b border-white/[0.03] pb-3">
                {selectedEmail.subject}
              </h1>
              <EmailBodyWithContext
                email={selectedEmail}
                onAction={(actionType) => {
                  if (actionType === "create-event") {
                    if (typeof window !== "undefined") {
                      const win = window as typeof window & {
                        pendingContextEvent?: { id: string; title: string; description: string; date: string; type: string; category: string; location: string };
                      };
                      win.pendingContextEvent = {
                        id: "evt-bakesale",
                        title: "Grade 12 Bake Sale",
                        description: "Grade 12 Bake Sale event referenced in emails.",
                        date: "2026-09-18",
                        type: "event",
                        category: "school",
                        location: "Central Courtyard"
                      };
                    }
                    window.dispatchEvent(new CustomEvent("axis-context-create-event", {
                      detail: {
                        event: {
                          id: "evt-bakesale",
                          title: "Grade 12 Bake Sale",
                          description: "Grade 12 Bake Sale event referenced in emails.",
                          date: "2026-09-18",
                          type: "event",
                          category: "school",
                          location: "Central Courtyard"
                        }
                      }
                    }));
                    window.dispatchEvent(new CustomEvent("axis-navigate-tab", {
                      detail: { tab: "events" }
                    }));
                  } else if (actionType === "view-tok-resources") {
                    window.dispatchEvent(new CustomEvent("axis-navigate-tab", {
                      detail: { tab: "resources" }
                    }));
                    triggerToast("Opening TOK Exhibition Guidelines policy document.");
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-12 text-center">
            <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">Select an email to view details</span>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setShowComposeModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md border p-6 rounded-2xl shadow-2xl z-10 text-white bg-[#0E0E10] border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Compose Executive Email</h3>
                <button onClick={() => setShowComposeModal(false)} className="text-white/40 hover:text-white text-xs font-semibold">✕</button>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs font-semibold text-white/80 border-none">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Recipient</label>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="recipient@axis.edu"
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Subject</label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="e.g. CAS Exhibition planning sync"
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Message Body</label>
                  <textarea
                    required
                    rows={4}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write email contents here..."
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Document Picker Trigger */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">Attach Document</label>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="text-[10px] font-extrabold text-cyan-400 hover:underline"
                    >
                      + Choose from Connected Resources
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
                    <span className="text-[10px] text-white/30 italic">No document linked</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer"
                >
                  Send Email
                </button>
              </form>
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

      {/* Floating Toast */}
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
