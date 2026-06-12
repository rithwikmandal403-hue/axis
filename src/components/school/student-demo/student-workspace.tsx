"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type StudentWorkspaceProps = {
  theme?: Theme;
  onNavigateToTab?: (tab: string) => void;
};

type WorkspaceItem = {
  id: string;
  title: string;
  type: "Word" | "PowerPoint" | "Excel" | "OneNote" | "Draft" | "Project";
  lastOpened: string;
  size?: string;
  category: "physics" | "university" | "math" | "cas" | "other";
};

type SuggestionItem = {
  id: string;
  trigger: string;
  actionText: string;
  details: string;
  type: "ia" | "university" | "assignment";
};

export function StudentWorkspace({ theme = "dark", onNavigateToTab }: StudentWorkspaceProps) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const [toast, setToast] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Mock Recent Work
  const [recentWork, setRecentWork] = useState<WorkspaceItem[]>([
    { id: "rw-1", title: "Physics IA Pendulum Damping methodology", type: "Word", lastOpened: "10 mins ago", size: "1.2 MB", category: "physics" },
    { id: "rw-2", title: "Imperial College Personal Statement Outline", type: "Draft", lastOpened: "1 hour ago", size: "45 KB", category: "university" },
    { id: "rw-3", title: "Math Calculus Problem Set 7 Working", type: "Excel", lastOpened: "Yesterday", size: "320 KB", category: "math" },
    { id: "rw-4", title: "CAS Community Garden Proposal", type: "PowerPoint", lastOpened: "2 days ago", size: "4.5 MB", category: "cas" },
    { id: "rw-5", title: "TOK Object Justification Draft 1", type: "Word", lastOpened: "3 days ago", size: "88 KB", category: "other" },
    { id: "rw-6", title: "Chemistry Kinetics Lab Data Sheets", type: "Excel", lastOpened: "4 days ago", size: "2.1 MB", category: "physics" },
  ]);

  // Context Engine Suggestions
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([
    {
      id: "s-1",
      trigger: "Teacher Aarav Chen uploaded Physics IA guidelines Phase 2",
      actionText: "Create IA Project Folder",
      details: "Set up a unified folder for experimental datasets, drafts, and formulas.",
      type: "ia",
    },
    {
      id: "s-2",
      trigger: "You started an application UCAS profile for Imperial College London",
      actionText: "Create Application Workspace",
      details: "Organize letters of recommendation, portfolios, and statement drafts.",
      type: "university",
    },
    {
      id: "s-3",
      trigger: "New assignment uploaded: English Literary Analysis Essay",
      actionText: "Create Assignment Workspace",
      details: "Pre-link text extracts and rubrics directly to Microsoft Word.",
      type: "assignment",
    },
  ]);

  // Essential Space captures
  const [captures, setCaptures] = useState([
    { id: "cap-1", title: "Spectrometer Graph Capture", type: "Image", time: "Today, 11:15 AM", details: "Damping coefficient curve" },
    { id: "cap-2", title: "Guidance Counselor Sarah Chen feedback", type: "Voice Note", time: "Yesterday", details: "EE text choice comments" },
    { id: "cap-3", title: "Math derivative formulas formulas", type: "Text Snippet", time: "Jun 10", details: "Standard differentiation rules" },
  ]);

  // Personal Database files
  const [databaseFiles, setDatabaseFiles] = useState([
    { name: "damping_calculations.xlsx", size: "124 KB", date: "June 11" },
    { name: "pendulum_methodology_draft1.docx", size: "412 KB", date: "June 10" },
    { name: "cas_reflection_volunteer.txt", size: "4 KB", date: "June 8" },
  ]);

  // Handle Quick Create Actions
  const handleQuickCreate = (type: string) => {
    const newId = `rw-${Date.now()}`;
    let newDocTitle = "";
    let docType: WorkspaceItem["type"] = "Word";

    if (type === "doc") {
      newDocTitle = "Untitled Document.docx";
      docType = "Word";
    } else if (type === "pres") {
      newDocTitle = "Untitled Presentation.pptx";
      docType = "PowerPoint";
    } else if (type === "sheet") {
      newDocTitle = "Untitled Spreadsheet.xlsx";
      docType = "Excel";
    } else if (type === "note") {
      newDocTitle = "Quick Study Note";
      docType = "OneNote";
    } else if (type === "univ") {
      newDocTitle = "University Application Draft";
      docType = "Draft";
    } else {
      newDocTitle = "New Project Workspace";
      docType = "Project";
    }

    const newItem: WorkspaceItem = {
      id: newId,
      title: newDocTitle,
      type: docType,
      lastOpened: "Just now",
      size: "12 KB",
      category: "other",
    };

    setRecentWork([newItem, ...recentWork]);
    triggerToast(`✓ Created and opened ${newDocTitle} in Axis-Office Workspace.`);
  };

  const handleSuggestionAction = (id: string, actionText: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
    triggerToast(`✓ Workspace Action Triggered: ${actionText}`);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Drag-and-Drop / Integration Simulation
  const handleInsertCapture = (captureTitle: string) => {
    triggerToast(`✓ Copied "${captureTitle}" from Essential Space into active workspace project.`);
  };

  const handleOpenDbFile = (fileName: string) => {
    triggerToast(`✓ Connected to Personal Database: Retrieved "${fileName}".`);
  };

  const filteredWork = recentWork.filter((w) => {
    if (activeFilter === "all") return true;
    return w.category === activeFilter;
  });

  return (
    <div className="space-y-6 normal-case text-left">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-6 z-[999] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-3 rounded-lg text-xs font-semibold shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Launchpad Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            My Workspace
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold uppercase tracking-wider">
              Productivity Hub
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Access your productivity tools, native workspaces, recently opened documents, and database folders in one unified console.
          </p>
        </div>
      </div>

      {/* Grid: Main Launcher Panel + Sidebar Integrations */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Launcher Column (Col 1-3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Quick Create Launcher */}
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Quick Create Launchpad</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: "New Document", type: "doc", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                { label: "New Slides", type: "pres", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
                { label: "New Sheets", type: "sheet", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { label: "New Note", type: "note", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                { label: "New Draft", type: "univ", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                { label: "New Workspace", type: "workspace", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
                { label: "New Folder", type: "folder", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleQuickCreate(btn.type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center hover:scale-[1.03] transition-all group ${btn.color}`}
                >
                  <span className="size-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold mb-2 group-hover:bg-white/10 transition-all">
                    +
                  </span>
                  <span className="text-[10px] font-bold tracking-tight">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Microsoft & Axis Tools Integrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Microsoft Suite Integrations */}
            <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Official Office Integrations</span>
                <span className="text-[9px] text-white/40">Connected</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Word", desc: "Documents", color: "text-blue-500 hover:bg-blue-500/5", icon: "W" },
                  { name: "PowerPoint", desc: "Slides", color: "text-orange-500 hover:bg-orange-500/5", icon: "P" },
                  { name: "Excel", desc: "Sheets", color: "text-emerald-500 hover:bg-emerald-500/5", icon: "E" },
                  { name: "OneNote", desc: "Notes Notebook", color: "text-purple-500 hover:bg-purple-500/5", icon: "N" },
                  { name: "Teams", desc: "Chat & Collab", color: "text-indigo-500 hover:bg-indigo-500/5", icon: "T" },
                  { name: "Outlook", desc: "Client Mail", color: "text-cyan-500 hover:bg-cyan-500/5", icon: "O" },
                ].map((app) => (
                  <button
                    key={app.name}
                    onClick={() => triggerToast(`✓ Redirecting to Microsoft ${app.name} web application integration...`)}
                    className={`p-3 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/20 transition-all flex flex-col items-center justify-center text-center ${app.color}`}
                  >
                    <span className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black shadow-inner mb-1.5 font-mono">
                      {app.icon}
                    </span>
                    <span className="text-[11px] font-bold text-white/90">{app.name}</span>
                    <span className="text-[9px] text-white/30 mt-0.5">{app.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Axis-Native Workspaces */}
            <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Axis Native Toolsuite</span>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Console</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-none">
                {[
                  { name: "Essential Space", tab: "essential-space" },
                  { name: "Personal Database", tab: "personal-database" },
                  { name: "Connected Resources", tab: "connected-resources" },
                  { name: "Application Maker", tab: "university" },
                  { name: "CAS Workspace", tab: "class-space" },
                  { name: "Extended Essay", tab: "class-space" },
                  { name: "TOK Workspace", tab: "class-space" },
                  { name: "Academic Analytics", tab: "academic-profile" },
                  { name: "Attendance logs", tab: "academic-profile" },
                  { name: "Task Manager", tab: "home" },
                ].map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => onNavigateToTab?.(tool.tab)}
                    className="p-2 border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-400/20 text-left rounded-xl transition-all flex items-center gap-2 group"
                  >
                    <span className="size-5 rounded-md bg-cyan-400/10 border border-cyan-400/20 text-[9px] font-bold text-cyan-400 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all">
                      A
                    </span>
                    <span className="text-[11px] text-white/80 font-semibold group-hover:text-white truncate">{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Context Engine Suggestions Widget */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Context-Engine Action Suggestions</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.01] flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                        Insight suggestion
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 block leading-snug italic">&ldquo;{s.trigger}&rdquo;</span>
                    <h5 className="text-xs font-bold text-white/90 leading-tight">{s.actionText}</h5>
                    <p className="text-[10px] text-white/50 leading-snug">{s.details}</p>
                  </div>
                  <button
                    onClick={() => handleSuggestionAction(s.id, s.actionText)}
                    className="w-full mt-4 py-1.5 bg-white text-black font-extrabold text-[10px] rounded-lg hover:opacity-90 transition-all text-center"
                  >
                    Execute suggestion
                  </button>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="col-span-3 py-6 border border-dashed border-white/[0.08] text-center text-xs text-white/20 font-medium rounded-2xl">
                  No active Context Engine workspace suggestions.
                </div>
              )}
            </div>
          </div>

          {/* Recent Work / Filter List */}
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Recent Documents & Projects</span>
              {/* Category Filter */}
              <div className="flex gap-1.5">
                {[
                  { id: "all", label: "All Work" },
                  { id: "physics", label: "Physics" },
                  { id: "university", label: "University" },
                  { id: "math", label: "Math" },
                  { id: "cas", label: "CAS" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      activeFilter === f.id ? "bg-white text-black" : "text-white/40 hover:bg-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-white/[0.04] max-h-[300px] overflow-y-auto scrollbar-none">
              {filteredWork.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between hover:bg-white/[0.01] px-2 rounded-lg transition-all group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`size-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[10px] ${
                      item.type === "Word" ? "text-blue-400" :
                      item.type === "Excel" ? "text-emerald-400" :
                      item.type === "PowerPoint" ? "text-orange-400" :
                      item.type === "OneNote" ? "text-purple-400" : "text-cyan-400"
                    }`}>
                      {item.type.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white/95 group-hover:text-white truncate block">{item.title}</span>
                      <span className="text-[9px] text-white/30 block mt-0.5 uppercase tracking-wide">
                        {item.type} • {item.size || "Folder"} • Opened {item.lastOpened}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerToast(`✓ Opening ${item.title} inside Axis Office integration...`)}
                      className="px-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-semibold text-white/70 hover:text-white rounded-lg transition-all"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
              {filteredWork.length === 0 && (
                <div className="py-10 text-center text-xs text-white/20 font-medium">
                  No files found matching filter.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Column (Col 4) */}
        <div className="space-y-6">
          
          {/* Essential Space Integration - click to insert */}
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            <div className="pb-2 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Essential Space Clips</span>
              <span className="text-[9px] text-white/40 block mt-0.5">Click snippets to insert into active project</span>
            </div>
            <div className="space-y-3">
              {captures.map((cap) => (
                <div
                  key={cap.id}
                  onClick={() => handleInsertCapture(cap.title)}
                  className="p-3 border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-cyan-400/20 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-semibold text-white">{cap.title}</span>
                    <span className="text-[8px] text-cyan-400 font-semibold">{cap.type}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1 italic">&ldquo;{cap.details}&rdquo;</p>
                  <span className="text-[8px] text-white/20 block mt-1.5 text-right">{cap.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Database Integration */}
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            <div className="pb-2 border-b border-white/[0.04] flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Personal Database</span>
                <span className="text-[9px] text-white/40 block mt-0.5">Cloud sync active</span>
              </div>
              <button
                onClick={() => onNavigateToTab?.("personal-database")}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase"
              >
                Sync
              </button>
            </div>
            <div className="space-y-2">
              {databaseFiles.map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleOpenDbFile(file.name)}
                  className="p-2.5 border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] rounded-lg flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-black text-white/30">📄</span>
                    <span className="text-[11px] text-white/80 group-hover:text-white truncate font-medium">{file.name}</span>
                  </div>
                  <span className="text-[9px] text-white/30 shrink-0">{file.size}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
