"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES & DATA ────────────────────────────────────────────────────────────

type ResourceItem = {
  id: string;
  title: string;
  type: "folder" | "pdf" | "doc" | "web" | "policy" | "guide" | "class" | "room" | "meeting";
  section: "teaching" | "school-hub" | "recent" | "department" | "suggested";
  department?: "Physics" | "Chemistry" | "Mathematics";
  pinned: boolean;
  subtext: string;
  tags?: string[];
};

type ConnectedPlatform = {
  id: string;
  name: string;
  connected: boolean;
  desc: string;
};

const INITIAL_RESOURCES: ResourceItem[] = [
  // 1. Teaching Resources
  { id: "res-1", title: "DP1 Physics Folder", type: "folder", section: "teaching", department: "Physics", pinned: true, subtext: "Curriculum templates & worksheets", tags: ["curriculum", "dp1"] },
  { id: "res-2", title: "Physics IA Guide", type: "pdf", section: "teaching", department: "Physics", pinned: true, subtext: "Syllabus guidelines and grading criteria", tags: ["assessment", "ia"] },
  { id: "res-3", title: "Lab Safety Document", type: "doc", section: "teaching", department: "Physics", pinned: true, subtext: "Operational rules & equipment check sheets", tags: ["safety", "lab"] },
  { id: "res-4", title: "Assessment Rubric", type: "pdf", section: "teaching", department: "Physics", pinned: true, subtext: "Standardized IB grading framework", tags: ["rubric", "grading"] },
  
  // 3. School Hub (Non-corporate, central, approachable institutional info)
  { id: "hub-1", title: "School Handbook", type: "pdf", section: "school-hub", pinned: false, subtext: "Official school regulations & directory · 2026", tags: ["handbook", "parents", "students"] },
  { id: "hub-2", title: "Faculty Handbook", type: "guide", section: "school-hub", pinned: false, subtext: "Teaching staff requirements, keys & schedules", tags: ["handbook", "staff", "faculty"] },
  { id: "hub-3", title: "Academic Policies", type: "policy", section: "school-hub", pinned: false, subtext: "Integrity, moderation & grading standards", tags: ["policy", "academic", "ib"] },
  { id: "hub-4", title: "Attendance Policies", type: "policy", section: "school-hub", pinned: false, subtext: "Student attendance thresholds & trigger rules", tags: ["policy", "attendance", "absent"] },
  { id: "hub-5", title: "Assessment Policies", type: "policy", section: "school-hub", pinned: false, subtext: "Formative and summative assessment schedules", tags: ["policy", "assessment", "grades"] },
  { id: "hub-6", title: "Emergency Procedures", type: "policy", section: "school-hub", pinned: false, subtext: "Fire evacuation, lockdown & medical contacts", tags: ["emergency", "safety", "evacuation"] },
  { id: "hub-7", title: "Staff Directory", type: "web", section: "school-hub", pinned: false, subtext: "Interactive staff departments & emails", tags: ["directory", "staff", "contacts"] },
  { id: "hub-8", title: "School Calendar", type: "web", section: "school-hub", pinned: false, subtext: "Term dates, holidays & institutional events", tags: ["calendar", "dates", "events"] },
  { id: "hub-9", title: "Forms & Documents", type: "folder", section: "school-hub", pinned: false, subtext: "Leave forms, procurement & field trip requests", tags: ["forms", "documents", "admin"] },
  { id: "hub-10", title: "IT Guides", type: "guide", section: "school-hub", pinned: false, subtext: "Wi-Fi, printer config & projector setup help", tags: ["it", "wifi", "help"] },
  { id: "hub-11", title: "IB School Documents", type: "folder", section: "school-hub", pinned: false, subtext: "DP/MYP authorizations & syllabus files", tags: ["ib", "dp", "myp"] },
  { id: "hub-12", title: "School Announcements Archive", type: "folder", section: "school-hub", pinned: false, subtext: "Browse historic daily digests & notices", tags: ["announcements", "archive", "notices"] },
  { id: "hub-13", title: "Campus Information", type: "web", section: "school-hub", pinned: false, subtext: "Map directions, parking rules & facility booking", tags: ["campus", "map", "facilities"] },

  // 5. Recent Resources
  { id: "rec-1", title: "Thermodynamics Syllabus Draft", type: "doc", section: "recent", pinned: false, subtext: "Viewed 15m ago", tags: ["syllabus", "physics"] },
  { id: "rec-2", title: "Wave Properties Simulation", type: "web", section: "recent", pinned: false, subtext: "Viewed 1h ago", tags: ["simulation", "waves"] },
  { id: "rec-3", title: "Grade 11 Term 2 Report Template", type: "pdf", section: "recent", pinned: false, subtext: "Viewed 3h ago", tags: ["report", "grades"] },
  
  // 6. Department Library
  { id: "dept-1", title: "Physics IA Sample Submissions", type: "folder", section: "department", department: "Physics", pinned: false, subtext: "Chemistry/Physics cross-referencing folders", tags: ["moderation", "ia"] },
  { id: "dept-2", title: "Stoichiometry Worksheet", type: "doc", section: "department", department: "Chemistry", pinned: false, subtext: "Chemistry standard templates", tags: ["chemistry", "practice"] },
  { id: "dept-3", title: "Calculus IA Prompts", type: "pdf", section: "department", department: "Mathematics", pinned: false, subtext: "Math HL curriculum assets", tags: ["math", "calculus"] },

  // 7. Suggested Resources (Context Layer Syncs)
  { id: "sug-1", title: "Collision Dynamics Simulation Setup", type: "web", section: "suggested", pinned: false, subtext: "Suggested for Period 5: Physics Class", tags: ["lesson-prep", "dynamics"] },
  { id: "sug-2", title: "Chloe Vance Guidance Action Record", type: "doc", section: "suggested", pinned: false, subtext: "Suggested for Chloe Vance Support Case", tags: ["support", "counselor"] },
];

const INITIAL_PLATFORMS: ConnectedPlatform[] = [
  { id: "gdrive", name: "Google Drive", connected: true, desc: "Synchronize class sheets, docs, and student folders" },
  { id: "onedrive", name: "OneDrive", connected: false, desc: "Retrieve institutional spreadsheets and school archives" },
  { id: "inthinking", name: "InThinking", connected: true, desc: "Import IB physics exam questions and curriculum blocks" },
  { id: "kognity", name: "Kognity", connected: false, desc: "Assign digital textbook readings and quick questions" },
  { id: "managebac", name: "ManageBac", connected: true, desc: "Sync grading rosters, units, and student timetables" },
  { id: "portal", name: "School Portal", connected: true, desc: "Core administrative panel communications database" },
  { id: "library", name: "Library System", connected: false, desc: "Cross-reference physical textbook inventory and reserves" },
];

// ─── HELPER COMPONENT: RESOURCE ICON ──────────────────────────────────────────

function ResourceIcon({ type }: { type: ResourceItem["type"] }) {
  switch (type) {
    case "folder":
      return (
        <svg className="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18m-18 0v-7.5A2.25 2.25 0 014.5 3.75h3.836a2.25 2.25 0 011.697.77l1.403 1.64a2.25 2.25 0 001.697.77H19.5a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25z" />
        </svg>
      );
    case "pdf":
      return (
        <svg className="size-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "doc":
    case "policy":
    case "guide":
      return (
        <svg className="size-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "web":
      return (
        <svg className="size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
        </svg>
      );
    case "class":
      return (
        <svg className="size-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 018.732 6.027c-.896.248-1.783.52-2.658.814m-15.482 0C4.468 11.303 9 17.03 12 17.03c3 0 7.532-5.727 7.74-6.883m-15.48 0L12 14.043l7.74-3.896" />
        </svg>
      );
    case "room":
      return (
        <svg className="size-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.875c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21H3.375c-.621 0-1.125-.504-1.125-1.125V9.75M19.5 9.75V9a2.25 2.25 0 00-2.25-2.25h-10.5A2.25 2.25 0 004.5 9v.75m15 0a3 3 0 11-6 0m0 0a3 3 0 11-6 0m0 0a3 3 0 10-6 0" />
        </svg>
      );
    case "meeting":
      return (
        <svg className="size-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      );
  }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

type ConnectedResourcesProps = {
  fullPage?: boolean;
};

export function ConnectedResources({ fullPage = false }: ConnectedResourcesProps) {
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>(INITIAL_PLATFORMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("Physics");

  // Toggle Pinned State (Moves item to Quick Access dynamically)
  const handleTogglePin = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r))
    );
  };

  // Toggle Connected State for platforms
  const handleToggleConnect = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p))
    );
  };

  // Filtered lists for rendering
  const teachingResources = useMemo(() => resources.filter((r) => r.section === "teaching"), [resources]);
  const schoolHubResources = useMemo(() => resources.filter((r) => r.section === "school-hub"), [resources]);
  const pinnedResources = useMemo(() => resources.filter((r) => r.pinned), [resources]);
  const recentResources = useMemo(() => resources.filter((r) => r.section === "recent"), [resources]);
  const suggestedResources = useMemo(() => resources.filter((r) => r.section === "suggested"), [resources]);
  
  const departmentResources = useMemo(() => {
    return resources.filter((r) => {
      if (r.section !== "department") return false;
      if (selectedDeptFilter === "All") return true;
      return r.department === selectedDeptFilter;
    });
  }, [resources, selectedDeptFilter]);

  // Universal Search Filter (Simulates future capability including rooms/teachers/meetings)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    
    // Filter actual resource items
    const matchingResources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.subtext.toLowerCase().includes(query) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(query)))
    );

    // Filter connected platforms
    const matchingPlatforms = platforms.filter(
      (p) => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query)
    );

    // Mock search hits for future-designed queries: Rooms, Classes, Teachers, Curriculum blocks
    const futureHits: ResourceItem[] = [];
    if ("physics hl Grade 12 Grade 11 B A".toLowerCase().includes(query)) {
      futureHits.push({ id: "fut-c1", title: "Grade 11 Physics B", type: "class", section: "teaching", pinned: false, subtext: "Roster: 22 students · Period 5" });
      futureHits.push({ id: "fut-c2", title: "DP2 Physics HL", type: "class", section: "teaching", pinned: false, subtext: "Roster: 20 students · Period 2" });
    }
    if ("lab laboratory 3 102".toLowerCase().includes(query)) {
      futureHits.push({ id: "fut-r1", title: "Science Lab 3", type: "room", section: "teaching", pinned: false, subtext: "Physics Equipment Hub · Available Period 4" });
      futureHits.push({ id: "fut-r2", title: "Advisory Room 102", type: "room", section: "teaching", pinned: false, subtext: "Guidance Office · Sarah Chen" });
    }
    if ("marcus vance sarah chen Aarav".toLowerCase().includes(query)) {
      futureHits.push({ id: "fut-t1", title: "Marcus Vance", type: "meeting", section: "recent", pinned: false, subtext: "Science Head · Available Period 6" });
      futureHits.push({ id: "fut-t2", title: "Sarah Chen", type: "meeting", section: "recent", pinned: false, subtext: "Guidance Counselor · Available Period 3" });
    }
    if ("curriculum waves syllabus optics mechanics".toLowerCase().includes(query)) {
      futureHits.push({ id: "fut-s1", title: "Topic 4: Waves Curriculum Block", type: "folder", section: "teaching", pinned: false, subtext: "Syllabus outlines & lesson benchmarks" });
    }

    return {
      resources: matchingResources,
      platforms: matchingPlatforms,
      future: futureHits,
    };
  }, [searchQuery, resources, platforms]);

  // ─── RENDER FULL WORKSPACE PAGE ────────────────────────────────────────────

  if (fullPage) {
    return (
      <div className="h-full flex flex-col gap-safe-lg text-white p-safe-sm">
        {/* Header Block */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight">Connected Resources</h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
            The shared resource library of the school. Manage integrations, pin vital guides, retrieve shared department catalogs, and access school handbook documents from a single connected surface.
          </p>
        </div>

        {/* Universal Search Input */}
        <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-xl focus-within:border-cyan-500/30 transition-all duration-300">
          <svg className="absolute left-4 top-3.5 size-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search anything (resources, documents, policies, classes, rooms, teachers...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-transparent text-xs text-white focus:outline-none placeholder-white/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-xs text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Search Results Panel */}
        <AnimatePresence>
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl p-4 space-y-4 shadow-xl z-20"
            >
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Search Matches</span>
              </div>

              {searchResults.resources.length === 0 && searchResults.platforms.length === 0 && searchResults.future.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/30 italic">
                  No matches found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {searchResults.resources.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Documents & Assets</span>
                      <div className="grid gap-2">
                        {searchResults.resources.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-2">
                              <ResourceIcon type={item.type} />
                              <div className="flex flex-col">
                                <span className="text-xs text-white/90">{item.title}</span>
                                <span className="text-[9px] text-white/35">{item.subtext}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTogglePin(item.id)}
                              className={`p-1 rounded text-[10px] ${item.pinned ? "text-cyan-400" : "text-white/35 hover:text-white"}`}
                            >
                              {item.pinned ? "📌 Pinned" : "Pin"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.future.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">School Connections (Classes, Rooms & Contacts)</span>
                      <div className="grid gap-2">
                        {searchResults.future.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/5">
                            <ResourceIcon type={item.type} />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/90">{item.title}</span>
                              <span className="text-[9px] text-white/35">{item.subtext}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.platforms.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block">Connected Platforms</span>
                      <div className="grid gap-2">
                        {searchResults.platforms.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                            <div className="flex flex-col">
                              <span className="text-xs text-white/90">{p.name}</span>
                              <span className="text-[9px] text-white/35">{p.desc}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.connected ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                              {p.connected ? "Connected" : "Disconnected"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MAIN DUAL COLUMNS GRID ────────────────────────────────────────── */}
        {!searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-safe-lg">
            {/* Left Column: Teaching Resources, Connected Platforms, School Hub */}
            <div className="space-y-safe-lg">
              
              {/* 1. Teaching Resources */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Teaching Resources</h3>
                  <span className="text-[9px] text-white/35">Curriculum & syllabus</span>
                </div>
                <div className="grid gap-safe-sm">
                  {teachingResources.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#0E0E10]/40 hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05]">
                          <ResourceIcon type={item.type} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/90">{item.title}</span>
                          <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`text-[10px] font-bold p-1 ${item.pinned ? "text-cyan-400" : "text-white/20 hover:text-white"}`}
                      >
                        📌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Connected Platforms */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Connected Platforms</h3>
                  <span className="text-[9px] text-white/35">Sync parameters active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {platforms.map((p) => (
                    <div
                      key={p.id}
                      className={`rounded-xl p-3 border transition-all duration-300 ${
                        p.connected
                          ? "bg-emerald-500/[0.01] border-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.02)]"
                          : "bg-white/[0.01] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white/90">{p.name}</span>
                            {p.connected && (
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                          <span className="text-[9.5px] text-white/35 mt-1 leading-snug">{p.desc}</span>
                        </div>
                        <button
                          onClick={() => handleToggleConnect(p.id)}
                          className={`rounded-md px-2.5 py-1 text-[9px] font-bold transition-all ${
                            p.connected
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {p.connected ? "Connected" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. School Hub (Administrative & operational protocols) */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">School Hub</h3>
                    <p className="text-[9px] text-white/35 mt-0.5">Where school policies and guides live</p>
                  </div>
                  <span className="text-[9px] text-white/35 font-semibold">Institutional hub</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schoolHubResources.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#0E0E10]/40 hover:bg-[#0E0E10]/80 hover:border-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05]">
                          <ResourceIcon type={item.type} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/90">{item.title}</span>
                          <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`text-[10px] font-bold p-1 ${item.pinned ? "text-cyan-400" : "text-white/20 hover:text-white"}`}
                      >
                        📌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Quick Access (Pinned), Recents, Department Library, Suggested */}
            <div className="space-y-safe-lg">
              
              {/* 4. Quick Access (Pinned Items) */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Quick Access</h3>
                  <span className="text-[9px] text-white/30 font-semibold">Pinned assets</span>
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {pinnedResources.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-dashed border-white/5 p-safe-lg text-center text-xs text-white/20 italic"
                      >
                        No items pinned. Pin frequently used files to access them here.
                      </motion.div>
                    ) : (
                      pinnedResources.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0, padding: 0 }}
                          className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-[#0E0E10]/40 group animate-none"
                        >
                          <div className="flex items-center gap-3">
                            <ResourceIcon type={item.type} />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-white/95">{item.title}</span>
                              <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTogglePin(item.id)}
                            className="text-xs text-white/20 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Unpin"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 5. Recent Resources */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Resources</h3>
                  <span className="text-[9px] text-white/35">Quick re-entry</span>
                </div>
                <div className="grid gap-2">
                  {recentResources.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-[#0E0E10]/30 hover:bg-[#0E0E10]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ResourceIcon type={item.type} />
                        <div className="flex flex-col">
                          <span className="text-xs text-white/85">{item.title}</span>
                          <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`text-[10px] font-bold p-1 ${item.pinned ? "text-cyan-400" : "text-white/20 hover:text-white"}`}
                      >
                        📌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Department Library Explorer */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-md">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.05]">
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Department Library</h3>
                    <p className="text-[9px] text-white/35 mt-0.5">Faculty shared folders & templates</p>
                  </div>
                  
                  {/* Selector tab filters */}
                  <div className="flex gap-1 p-0.5 bg-black/40 border border-white/5 rounded-lg">
                    {(["Physics", "Chemistry", "Mathematics"] as const).map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDeptFilter(dept)}
                        className={`px-2 py-1 rounded text-[8px] uppercase tracking-wider font-bold transition-all ${
                          selectedDeptFilter === dept ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  {departmentResources.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#0E0E10]/40 hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.05]">
                          <ResourceIcon type={item.type} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/90">{item.title}</span>
                          <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          className={`p-1.5 rounded-lg border transition-all text-xs ${
                            item.pinned
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          }`}
                          title={item.pinned ? "Pinned to Quick Access" : "Pin to Quick Access"}
                        >
                          📌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Suggested Resources (Context Aware Suggestions) */}
              <div className="rounded-2xl border border-white/[0.06] bg-emerald-500/[0.01] p-safe-lg shadow-md border-l-2 border-l-emerald-500/20">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/10">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Contextual Suggestions</h3>
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[8.5px] text-emerald-500/40 font-mono">Synced from Context</span>
                </div>
                <div className="space-y-2">
                  {suggestedResources.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/10 bg-emerald-950/[0.03]"
                    >
                      <div className="flex items-center gap-2.5">
                        <ResourceIcon type={item.type} />
                        <div className="flex flex-col">
                          <span className="text-xs text-white/85">{item.title}</span>
                          <span className="text-[9px] text-white/35 mt-0.5">{item.subtext}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`text-[10px] font-bold p-1 ${item.pinned ? "text-cyan-400" : "text-white/20 hover:text-white"}`}
                      >
                        📌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── COMPACT SIDEBAR/PANEL MODE (REPLACES CONTEXT ON DASHBOARD SIDEBAR) ─────

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-safe-md">
      
      {/* Search Bar - Compact */}
      <div className="relative bg-zinc-950 border border-white/[0.08] rounded-xl flex items-center pr-3 focus-within:border-white/25 transition-all">
        <svg className="size-3.5 text-white/30 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-2 pr-2 py-2.5 bg-transparent text-[11px] text-white focus:outline-none placeholder-white/30"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[9px] text-white/40 hover:text-white">✕</button>
        )}
      </div>

      {/* Dynamic search results overlay for compact mode */}
      <AnimatePresence>
        {searchQuery && searchResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-white/10 bg-zinc-900 p-3 space-y-2 max-h-[220px] overflow-y-auto"
          >
            <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Search Matches</span>
            {searchResults.resources.length === 0 && searchResults.future.length === 0 ? (
              <span className="text-[10px] text-white/30 block italic py-2">No matching items found</span>
            ) : (
              <div className="space-y-1.5">
                {searchResults.resources.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded bg-white/[0.02]">
                    <ResourceIcon type={item.type} />
                    <span className="text-[10.5px] text-white/80 truncate">{item.title}</span>
                  </div>
                ))}
                {searchResults.future.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded bg-white/[0.02]">
                    <ResourceIcon type={item.type} />
                    <span className="text-[10.5px] text-white/80 truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!searchQuery && (
        <div className="space-y-4">
          
          {/* Quick Access (Pinned Items) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.04]">
              <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Quick Access (Pinned)</span>
            </div>
            <div className="space-y-1.5">
              {pinnedResources.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <ResourceIcon type={item.type} />
                    <span className="text-[11px] text-white/80 truncate font-medium">{item.title}</span>
                  </div>
                  <button onClick={() => handleTogglePin(item.id)} className="text-[9px] opacity-35 hover:opacity-100">✕</button>
                </div>
              ))}
              {pinnedResources.length === 0 && (
                <span className="text-[9.5px] text-white/20 italic block py-1">Pin items to view them here</span>
              )}
            </div>
          </div>

          {/* Connected Platforms State Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.04]">
              <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Platforms</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {platforms.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-1.5 rounded bg-black/30 border border-white/[0.03]">
                  <span className="text-[10px] text-white/70 truncate">{p.name}</span>
                  <span className={`size-1.5 rounded-full ${p.connected ? "bg-emerald-400 animate-pulse" : "bg-white/10"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* School Hub Shortcuts */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.04]">
              <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">School Hub (Shortcuts)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {schoolHubResources.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded bg-black/20 border border-white/[0.03] min-w-0">
                  <ResourceIcon type={item.type} />
                  <span className="text-[10px] text-white/75 truncate">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Context Suggested Resources */}
          <div className="space-y-2 bg-emerald-500/[0.01] border border-emerald-500/10 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Suggested for Next Lesson</span>
            <div className="space-y-1.5 mt-1.5">
              {suggestedResources.slice(0, 1).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <ResourceIcon type={item.type} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10.5px] font-bold text-white/90 truncate">{item.title}</span>
                    <span className="text-[8px] text-white/30 truncate">{item.subtext}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
