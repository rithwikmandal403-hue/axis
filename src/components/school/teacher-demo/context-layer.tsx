"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ContextItem = {
  id: string;
  type: "space" | "support" | "counselor" | "coordination" | "resource" | "deadline" | "attendance";
  title: string;
  description: string;
  actionLabel?: string;
  meta: string;
  active: boolean;
  dateAdded?: string;
  fromEssentialSpace?: boolean;
};

const INITIAL_CONTEXT_ITEMS: ContextItem[] = [
  {
    id: "space-1",
    type: "space",
    title: "Essential Space Revealed",
    description: "Room 4B has been freed for Period 4 due to a Math lecture cancellation. Available for student study groups.",
    actionLabel: "Release to Students",
    meta: "Period 4 · Room 4B",
    active: true,
    dateAdded: "Today",
  },
  {
    id: "support-1",
    type: "support",
    title: "Support Follow-up Pending",
    description: "Chloe Vance has submitted their revised Physics IA draft. Reviews are recommended before tomorrow's seminar.",
    actionLabel: "Open Draft",
    meta: "IA Advisory · Grade 11 B",
    active: true,
    dateAdded: "Today",
  },
  {
    id: "counselor-1",
    type: "counselor",
    title: "Counselor Nearby",
    description: "Sarah Chen (Guidance) is available in Room 102. Can assist with student IA workload stress discussions.",
    meta: "Available Now · Room 102",
    active: true,
    dateAdded: "Today",
  },
  {
    id: "coordination-1",
    type: "coordination",
    title: "Coverage Needed",
    description: "Grade 10 Science teacher marked absent. Coordination is looking for Period 5 coverages.",
    actionLabel: "Volunteer for Cover",
    meta: "Period 5 · Grade 10 Science",
    active: true,
    dateAdded: "Today",
  },
];

export type ContextLayerProps = {
  items?: ContextItem[];
  onDismissItem?: (id: string) => void;
  fullPage?: boolean;
};

export function ContextLayer({ items: propsItems, onDismissItem, fullPage = false }: ContextLayerProps) {
  const [localItems, setLocalItems] = useState<ContextItem[]>(INITIAL_CONTEXT_ITEMS);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const items = propsItems !== undefined ? propsItems : localItems;

  const handleAction = (id: string, actionText: string) => {
    setActionMessage(`Action dispatched: "${actionText}"`);
    setTimeout(() => {
      setActionMessage(null);
    }, 2800);

    if (onDismissItem) {
      onDismissItem(id);
    } else {
      setLocalItems(localItems.map(item => item.id === id ? { ...item, active: false } : item));
    }
  };

  const getIcon = (type: ContextItem["type"]) => {
    switch (type) {
      case "space":
        return (
          <svg className="size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
          </svg>
        );
      case "support":
      case "resource":
        return (
          <svg className="size-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case "counselor":
        return (
          <svg className="size-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        );
      case "coordination":
      case "deadline":
        return (
          <svg className="size-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        );
      case "attendance":
        return (
          <svg className="size-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const activeItems = items.filter(item => item.active);

  // If rendering full workspace page
  if (fullPage) {
    // Categories data for Full Workspace Explorer
    const explorerCategories = [
      { id: "all", name: "All Knowledge" },
      { id: "opportunities", name: "Opportunities" },
      { id: "resources", name: "Related Resources" },
      { id: "deadlines", name: "Deadlines" },
      { id: "meetings", name: "Meetings" },
      { id: "rooms", name: "Rooms" },
      { id: "captures", name: "Saved Captures" },
    ];

    // Static display list representing "Everything Context Knows"
    const staticAwarenessList = [
      { id: "s-opp-1", category: "opportunities", title: "Lab 3 Availability", desc: "Lab 3 becomes available after Period 4. Revision slots open.", meta: "Lab 3 · Science Dept", icon: getIcon("space") },
      { id: "s-res-1", category: "resources", title: "Physics IA Template", desc: "Related Physics worksheet uploaded 2 weeks ago by Marcus Vance.", meta: "Resource Hub", icon: getIcon("resource") },
      { id: "s-ded-1", category: "deadlines", title: "Physics IA Drafts Due", desc: "Three students (Emma, Jin, Caleb) have not submitted their revised methodology.", meta: "Draft Deadline · May 29", icon: getIcon("deadline") },
      { id: "s-meet-1", category: "meetings", title: "Counselor Consultation Slot", desc: "Guidance counselor Sarah Chen is available in Room 102 during your next free period.", meta: "Free Period 3 · Room 102", icon: getIcon("counselor") },
      { id: "s-rm-1", category: "rooms", title: "Timetable Room Conflict", desc: "Upcoming faculty meeting overlaps with standard assembly slot in Conference Hall B.", meta: "Schedule Block · Period 5", icon: getIcon("coordination") },
      { id: "s-att-1", category: "attendance", title: "Assisted Proximity Flag", desc: "Emma Watson flagged present but device registered 40m outside Room 102.", meta: "Attendance Sync", icon: getIcon("attendance") },
    ];

    // Merge active user captured items and mock database for full explorer view
    const combinedKnowledge: {
      id: string;
      category: string;
      title: string;
      desc: string;
      meta: string;
      icon: React.ReactNode;
      fromEssentialSpace?: boolean;
    }[] = [
      ...activeItems.map(item => ({
        id: item.id,
        category: item.id.startsWith("cap-") ? "captures" : "opportunities",
        title: item.title,
        desc: item.description,
        meta: item.meta,
        icon: getIcon(item.type),
        fromEssentialSpace: item.fromEssentialSpace
      })),
      ...staticAwarenessList.map(item => ({
        ...item,
        fromEssentialSpace: false
      }))
    ];

    const filteredKnowledge = combinedKnowledge.filter(item => {
      if (activeCategory === "all") return true;
      return item.category === activeCategory;
    });

    return (
      <div className="h-full flex flex-col gap-safe-lg text-white p-safe-sm">
        {/* Page title and description */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight">Attention</h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
            Today&apos;s updates, notifications, student alerts, and schedule changes.
          </p>
        </div>

        {/* Tab category filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl self-start">
          {explorerCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Action feedback toast */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-center text-xs font-medium text-emerald-400"
            >
              {actionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid of Knowledge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-safe-md">
          <AnimatePresence mode="popLayout">
            {filteredKnowledge.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-safe-lg flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:border-white/[0.12] transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05]">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white/90">{item.title}</span>
                        {item.fromEssentialSpace && (
                          /physics|optics|ia|refraction|waves|lab/i.test(item.title || "") || 
                          /physics|optics|ia|refraction|waves|lab/i.test(item.desc || "")
                        ) && (
                          <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-1.5 py-0.5 rounded tracking-wider mt-0.5 w-max">
                            From Essential Space
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-white/30 tracking-tight font-medium uppercase">{item.category}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/50">{item.desc}</p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] text-white/30 font-medium">{item.meta}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(item.id, "Context Action Triggered")}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white text-zinc-950 rounded hover:bg-white/90 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Standard Compact Dashboard Panel Mode (as shown in Home Column)
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-safe-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">
              Attention
            </span>
            {activeItems.length > 0 && (
              <span className="flex size-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] text-white/30 tracking-tight">Updates</span>
        </div>

        {/* Action feedback toast */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-center text-[10px] font-medium text-emerald-400"
            >
              {actionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* List of context cards */}
        <div className="space-y-safe-md">
          <AnimatePresence initial={false}>
            {activeItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-dashed border-white/10 p-safe-lg text-center text-xs text-white/30"
              >
                No items require attention today.
              </motion.div>
            ) : (
              activeItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0, padding: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-white/[0.12]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02]">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <h4 className="text-xs font-semibold tracking-tight text-white/95">
                            {item.title}
                          </h4>
                          {item.fromEssentialSpace && (
                            /physics|optics|ia|refraction|waves|lab/i.test(item.title || "") || 
                            /physics|optics|ia|refraction|waves|lab/i.test(item.description || "")
                          ) && (
                            <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-1.5 py-0.5 rounded tracking-wider mt-1 w-max">
                              From Essential Space
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/30 font-medium whitespace-nowrap">
                          {item.meta}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
                        {item.description}
                      </p>

                      {/* Item actions */}
                      {item.actionLabel && (
                        <div className="mt-3.5 flex justify-end">
                          <button
                            onClick={() => handleAction(item.id, item.actionLabel!)}
                            className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 transition-all"
                          >
                            {item.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

