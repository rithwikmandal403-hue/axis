"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playNotificationSound } from "./audio-system";

export type NotificationType = "message" | "meeting" | "reminder" | "schedule" | "operational";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  archived: boolean;
  pinned: boolean;
  sender?: string;
  role?: string;
};

export function NotificationsSystem({ forceOpen, onOpenChange }: { forceOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "not-msg-1",
      type: "message",
      title: "New Message",
      message: "Marcus Vance: 'Hi Aarav, did you review the science equipment list?'",
      time: "2m ago",
      read: false,
      archived: false,
      pinned: true,
      sender: "Marcus Vance",
      role: "Head of Science",
    },
    {
      id: "not-meet-1",
      type: "meeting",
      title: "Meeting Invitation",
      message: "Sarah Chen invited you to: Student Guidance sync (Room 102)",
      time: "1h ago",
      read: false,
      archived: false,
      pinned: false,
      sender: "Sarah Chen",
      role: "Guidance Counselor",
    },
    {
      id: "not-rem-1",
      type: "reminder",
      title: "Timetable Conflict Reminder",
      message: "Physics B revision lab conflicts with standard grade assemblies.",
      time: "3h ago",
      read: true,
      archived: false,
      pinned: false,
    },
    {
      id: "not-sched-1",
      type: "schedule",
      title: "Schedule Confirmed",
      message: "Working Saturday confirmed for May 31. Thursday timetable applies.",
      time: "Yesterday",
      read: true,
      archived: false,
      pinned: false,
    },
    {
      id: "not-oper-1",
      type: "operational",
      title: "Room Allocation Updated",
      message: "Lab 3 booking finalized for your Grade 11 Physics (B) revision slot.",
      time: "Yesterday",
      read: true,
      archived: false,
      pinned: false,
    },
  ]);

  const [panelOpen, setPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setPanelOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    onOpenChange?.(panelOpen);
  }, [panelOpen, onOpenChange]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "archived" | "pinned">("all");

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read && !n.archived;
    if (activeFilter === "archived") return n.archived;
    if (activeFilter === "pinned") return n.pinned && !n.archived;
    return !n.archived; // "all" shows non-archived
  });

  const handlePlaySound = (type: NotificationType) => {
    if (type === "message") playNotificationSound("message");
    else if (type === "meeting") playNotificationSound("meeting");
    else playNotificationSound("reminder");
  };

  const handleTriggerSimulatedNotification = (type: NotificationType) => {
    const randomId = `sim-${Date.now()}`;
    let newNot: NotificationItem;

    if (type === "message") {
      newNot = {
        id: randomId,
        type: "message",
        title: "Simulation Message",
        message: "Sarah Chen: 'Can we meet during Period 4 to discuss Chloe's workload?'",
        time: "Just Now",
        read: false,
        archived: false,
        pinned: false,
        sender: "Sarah Chen",
        role: "Guidance Counselor",
      };
    } else if (type === "meeting") {
      newNot = {
        id: randomId,
        type: "meeting",
        title: "Virtual Invitation",
        message: "Urgent Science Faculty meeting scheduled for Friday, 3:30 PM",
        time: "Just Now",
        read: false,
        archived: false,
        pinned: false,
        sender: "Marcus Vance",
        role: "Head of Science",
      };
    } else {
      newNot = {
        id: randomId,
        type: "reminder",
        title: "Context Update",
        message: "Context: 'Lab 3 chemistry revision set is now complete.'",
        time: "Just Now",
        read: false,
        archived: false,
        pinned: false,
      };
    }

    setNotifications((prev) => [newNot, ...prev]);
    handlePlaySound(type);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const togglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const toggleArchive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: !n.archived } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "message":
        return (
          <svg className="size-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        );
      case "meeting":
        return (
          <svg className="size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        );
      case "reminder":
        return (
          <svg className="size-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "schedule":
        return (
          <svg className="size-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
        );
      case "operational":
        return (
          <svg className="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.867.867 0 01-1.186-.327 13.674 13.674 0 01-1.183-3.326m3.504-7.04a24.02 24.02 0 01.135 3.52M21.75 12c0 1.608-.401 3.12-1.104 4.443" />
          </svg>
        );
    }
  };

  return (
    <div className="relative">
      {/* Centralized Notification Bell Trigger Button */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={`relative flex size-9 items-center justify-center rounded-xl border transition-all duration-300 ${
          panelOpen
            ? "bg-white text-[#0A0A0B] border-white"
            : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
        }`}
        title="Notification Center"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black border border-[#0A0A0B]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Center Popover */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-white/[0.08] bg-[#0A0A0C]/95 p-safe-lg shadow-[0_24px_64px_rgba(0,0,0,0.95)] backdrop-blur-xl text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-safe-sm mb-safe-sm">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-white/95 uppercase tracking-wider">Notifications Center</h3>
                  <span className="text-[10px] text-white/40 mt-0.5">{unreadCount} active updates</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-semibold text-white/50 hover:text-white transition-colors"
                    >
                      Clear All Unread
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Filters */}
              <div className="flex gap-1.5 mb-safe-md bg-white/[0.02] border border-white/[0.05] p-0.5 rounded-lg">
                {(["all", "unread", "pinned", "archived"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-1 py-1 text-[10px] font-medium uppercase tracking-wide rounded-md capitalize transition-all ${
                      activeFilter === filter
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-white/40 hover:text-white/85"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Feed List */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-0.5 scrollbar-none">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-white/20">
                    No items in this category.
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`group relative flex items-start gap-3 rounded-xl border p-safe-md transition-all duration-300 ${
                          item.read
                            ? "bg-transparent border-white/[0.03]"
                            : "bg-white/[0.02] border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                        }`}
                      >
                        {/* Feed category Icon indicator */}
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] mt-0.5">
                          {getIcon(item.type)}
                        </div>

                        {/* Text Message Content */}
                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-white/90 leading-tight">
                              {item.title}
                            </span>
                            {item.pinned && (
                              <svg className="size-2.5 text-sky-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                            {item.message}
                          </p>
                          <span className="text-[9px] text-white/30 mt-1 block">{item.time}</span>
                        </div>

                        {/* Inline Actions Drawer */}
                        <div className="absolute right-2 top-2.5 flex flex-col items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Pin Toggle */}
                          <button
                            onClick={() => togglePin(item.id)}
                            className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-colors"
                            title={item.pinned ? "Unpin" : "Pin"}
                          >
                            <svg className={`size-3 ${item.pinned ? "text-sky-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </button>

                          {/* Read Toggle */}
                          <button
                            onClick={() => toggleRead(item.id)}
                            className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-colors"
                            title={item.read ? "Mark Unread" : "Mark Read"}
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {item.read ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </button>

                          {/* Archive / Restore Toggle */}
                          <button
                            onClick={() => toggleArchive(item.id)}
                            className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-colors"
                            title={item.archived ? "Send to Inbox" : "Archive"}
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                          </button>

                          {/* Dismiss / Delete */}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="p-1 hover:bg-white/10 text-rose-400 hover:text-rose-300 rounded transition-colors"
                            title="Dismiss"
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Sound Audio Synthesis Simulator Panel */}
              <div className="mt-safe-md pt-safe-sm border-t border-white/[0.06]">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                  Test Audio Alerts (Synthesized Chimes)
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleTriggerSimulatedNotification("message")}
                    className="py-1 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-[9px] font-medium tracking-tight rounded transition-all text-white/70 hover:text-white"
                  >
                    Chime
                  </button>
                  <button
                    onClick={() => handleTriggerSimulatedNotification("meeting")}
                    className="py-1 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-[9px] font-medium tracking-tight rounded transition-all text-white/70 hover:text-white"
                  >
                    Chord
                  </button>
                  <button
                    onClick={() => handleTriggerSimulatedNotification("reminder")}
                    className="py-1 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-[9px] font-medium tracking-tight rounded transition-all text-white/70 hover:text-white"
                  >
                    Pulse
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
