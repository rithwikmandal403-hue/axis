"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type CapturedItem } from "./capture-layer";

export type WorkspaceItem = {
  id: string;
  title: string;
  type: "document" | "presentation" | "spreadsheet" | "pdf" | "note" | "mindmap" | "folder" | "link" | "resource";
  lastModified: string;
  owner: string;
  department: string;
  status: string;
  pinned: boolean;
  shared: boolean;
  draft: boolean;
  template?: boolean;
  classMatch?: string;
  tags?: string[];
  content?: string;
  pdfUrl?: string;
  pdfPages?: number;
};

type WorkspaceWorkspaceProps = {
  theme?: string;
  items: WorkspaceItem[];
  onUpdateItems: (items: WorkspaceItem[]) => void;
  captures?: CapturedItem[];
  selectedFileId?: string | null;
  onClearSelectedFile?: () => void;
};

export function WorkspaceWorkspace({
  theme = "dark",
  items,
  onUpdateItems,
  captures = [],
  selectedFileId = null,
  onClearSelectedFile,
}: WorkspaceWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"all" | "shared" | "drafts" | "templates">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeFile, setActiveFile] = useState<WorkspaceItem | null>(null);

  // PDF Viewer states
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfSearch, setPdfSearch] = useState("");
  const [pdfBookmarks, setPdfBookmarks] = useState<number[]>([]);

  // Presentation fullscreen states
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Side Drawer for linking Captures
  const [showCapturesDrawer, setShowCapturesDrawer] = useState(false);

  // Auto-open selected file if passed from shell Context panel click
  useEffect(() => {
    if (selectedFileId) {
      const file = items.find((i) => i.id === selectedFileId);
      if (file) {
        setActiveFile(file);
      }
      if (onClearSelectedFile) {
        onClearSelectedFile();
      }
    }
  }, [selectedFileId, items, onClearSelectedFile]);

  // Theme styling mapping
  const styling = useMemo(() => {
    return {
      dark: {
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06] text-white",
        itemBg: "bg-white/[0.01] border-white/[0.04]",
        itemHoverBg: "hover:bg-white/[0.02]",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90",
        inputBg: "bg-black/30 border-white/[0.08]",
        btnActive: "bg-white text-black font-semibold",
        badgeBg: "bg-white/5 border-white/10 text-white/70",
      },
      light: {
        panelBg: "bg-white border-black/[0.08] text-black",
        itemBg: "bg-black/[0.01] border-black/[0.04]",
        itemHoverBg: "hover:bg-black/[0.02]",
        border: "border-black/[0.08]",
        textMuted: "text-black/50",
        textPrimary: "text-black/90",
        inputBg: "bg-[#F9FAFB] border-black/[0.08]",
        btnActive: "bg-[#111827] text-white font-semibold",
        badgeBg: "bg-black/5 border-black/10 text-black/70",
      },
      "high-contrast": {
        panelBg: "bg-black border-2 border-white text-white",
        itemBg: "bg-black border border-white/40",
        itemHoverBg: "hover:bg-white/10",
        border: "border-2 border-white",
        textMuted: "text-white",
        textPrimary: "text-white font-bold",
        inputBg: "bg-black border-2 border-white",
        btnActive: "bg-white text-black font-extrabold",
        badgeBg: "bg-black border border-white text-white",
      },
      axis: {
        panelBg: "bg-[#121417]/90 border-white/[0.08] text-white",
        itemBg: "bg-[#16191F]/40 border border-white/[0.04]",
        itemHoverBg: "hover:bg-[#1A1D24]",
        border: "border-white/[0.08]",
        textMuted: "text-white/35",
        textPrimary: "text-white/95",
        inputBg: "bg-[#181B22] border-white/[0.10]",
        btnActive: "bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)]",
        badgeBg: "bg-cyan-950/20 border-cyan-500/20 text-cyan-400",
      },
    }[theme] || {
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06] text-white",
      itemBg: "bg-white/[0.01] border-white/[0.04]",
      itemHoverBg: "hover:bg-white/[0.02]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/95",
      inputBg: "bg-black/30 border-white/[0.08]",
      btnActive: "bg-white text-black",
      badgeBg: "bg-white/5 border-white/10 text-white/70",
    };
  }, [theme]);

  // Create Workspace item callbacks
  const handleQuickCreate = (type: WorkspaceItem["type"]) => {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const newItem: WorkspaceItem = {
      id: `ws-${Date.now()}`,
      title: `Untitled ${formattedType}`,
      type,
      lastModified: "Just now",
      owner: "Aarav Chen",
      department: "Science",
      status: "Draft",
      pinned: false,
      shared: false,
      draft: true,
      content: type === "document" ? "# New Document\nStart writing here..." : "",
      pdfUrl: type === "pdf" ? "new_document.pdf" : undefined,
      pdfPages: type === "pdf" ? 1 : undefined,
    };

    onUpdateItems([newItem, ...items]);
    setActiveFile(newItem);
    setPdfPage(1);
    setPdfBookmarks([]);
    setActiveSlide(0);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeFile?.id === id) setActiveFile(null);
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  // Modify active open file fields
  const handleUpdateFileContent = (val: string) => {
    if (!activeFile) return;
    const updated = { ...activeFile, content: val, lastModified: "Just now" };
    setActiveFile(updated);
    onUpdateItems(items.map((item) => (item.id === activeFile.id ? updated : item)));
  };

  const handleUpdateFileTitle = (val: string) => {
    if (!activeFile) return;
    const updated = { ...activeFile, title: val, lastModified: "Just now" };
    setActiveFile(updated);
    onUpdateItems(items.map((item) => (item.id === activeFile.id ? updated : item)));
  };

  const handleAttachFileToClass = (className: string) => {
    if (!activeFile) return;
    const updated = { ...activeFile, classMatch: className };
    setActiveFile(updated);
    onUpdateItems(items.map((item) => (item.id === activeFile.id ? updated : item)));
    alert(`Resource attached to class: ${className}`);
  };

  // Type Icons Helper
  const getTypeIcon = (type: WorkspaceItem["type"]) => {
    switch (type) {
      case "document": return "DOC";
      case "presentation": return "PPT";
      case "spreadsheet": return "XLS";
      case "pdf": return "PDF";
      case "note": return "NOTE";
      case "mindmap": return "MAP";
      case "folder": return "FOLDER";
      case "link": return "LINK";
      default: return "DOC";
    }
  };

  // Search filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab check
      if (activeTab === "shared" && !item.shared) return false;
      if (activeTab === "drafts" && !item.draft) return false;
      if (activeTab === "templates" && !item.template) return false;

      // Type query
      if (selectedType !== "all" && item.type !== selectedType) return false;

      // Search match
      const query = searchQuery.toLowerCase();
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(query));
      const deptMatch = item.department.toLowerCase().includes(query);
      const ownerMatch = item.owner.toLowerCase().includes(query);

      return titleMatch || tagMatch || deptMatch || ownerMatch;
    });
  }, [items, activeTab, searchQuery, selectedType]);

  const pinnedItems = useMemo(() => items.filter((i) => i.pinned), [items]);

  // PDF simulated search text highlighter
  const pdfHighlightMatch = useMemo(() => {
    if (!pdfSearch || !activeFile || activeFile.type !== "pdf") return null;
    const query = pdfSearch.toLowerCase();
    const mockPDFLines = [
      "Physics practical refraction syllabus coordinates.",
      "Calculate displacement coefficients using Snell's Law indices.",
      "Prisms double alignment templates verify angles index of 1.52.",
      "Review lab draft methodology before the Friday evaluation.",
    ];
    return mockPDFLines.find((line) => line.toLowerCase().includes(query));
  }, [pdfSearch, activeFile]);

  // PDF Bookmarking Callback
  const handleTogglePdfBookmark = () => {
    if (pdfBookmarks.includes(pdfPage)) {
      setPdfBookmarks(pdfBookmarks.filter((p) => p !== pdfPage));
    } else {
      setPdfBookmarks([...pdfBookmarks, pdfPage]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-safe-lg font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Axis Workspace</h2>
          <p className="text-xs opacity-50 mt-1">Documents, presentations & collaboration through your school&apos;s Microsoft 365 integration.</p>
        </div>
        {activeFile && (
          <button
            onClick={() => setActiveFile(null)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border ${styling.border} bg-white/5 hover:bg-white/10 transition-all`}
          >
            ← Return to Workspace Home
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeFile ? (

          // ─── DASHBOARD HOME VIEW ──────────────────────────────────────────────────
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-safe-lg"
          >
            {/* MICROSOFT 365 INTEGRATION BANNER */}
            <div className={`rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-safe-lg flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">LINK</div>
                <div>
                  <h3 className="text-sm font-bold text-cyan-400">Microsoft 365 Integration</h3>
                  <p className="text-xs opacity-70 mt-0.5">Access Word, PowerPoint, Excel & OneDrive through your school Microsoft account</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold opacity-60">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Word</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">PowerPoint</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Excel</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">OneDrive</span>
              </div>
            </div>

            {/* QUICK CREATE GRID */}
            <div className={`rounded-2xl border ${styling.panelBg} p-safe-lg space-y-4`}>
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-40">Quick Create</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { type: "document", label: "New Document", icon: "DOC", color: "hover:border-blue-500/40 hover:bg-blue-500/5" },
                  { type: "presentation", label: "New Presentation", icon: "PPT", color: "hover:border-amber-500/40 hover:bg-amber-500/5" },
                  { type: "spreadsheet", label: "New Spreadsheet", icon: "XLS", color: "hover:border-emerald-500/40 hover:bg-emerald-500/5" },
                  { type: "pdf", label: "PDF Workspace", icon: "PDF", color: "hover:border-red-500/40 hover:bg-red-500/5" },
                  { type: "note", label: "Sticky Note", icon: "NOTE", color: "hover:border-purple-500/40 hover:bg-purple-500/5" },
                  { type: "mindmap", label: "Mind Map", icon: "MAP", color: "hover:border-cyan-500/40 hover:bg-cyan-500/5" },
                  { type: "folder", label: "Folder", icon: "FOLDER", color: "hover:border-zinc-500/40 hover:bg-zinc-500/5" },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleQuickCreate(item.type as WorkspaceItem["type"])}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] transition-all hover:scale-102 ${item.color}`}
                  >
                    <span className="text-xl mb-2">{item.icon}</span>
                    <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className={`rounded-2xl border ${styling.panelBg} p-safe-md flex flex-col md:flex-row gap-safe-md items-center`}>
              <div className="relative w-full md:flex-1">
                <input
                  type="text"
                  placeholder="Search Workspace by title, tags, owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl border ${styling.inputBg} pl-9 pr-4 py-2.5 text-xs text-inherit bg-transparent focus:outline-none placeholder-inherit/30`}
                />
                <span className="absolute left-3.5 top-3.5 opacity-30 text-xs">Search</span>
              </div>
              <div className="flex gap-2 w-full md:w-auto shrink-0 overflow-x-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`rounded-xl border ${styling.border} px-3.5 py-2.5 text-xs bg-black/40 text-inherit focus:outline-none`}
                >
                  <option value="all">All Formats</option>
                  <option value="document">Documents</option>
                  <option value="presentation">Slides</option>
                  <option value="spreadsheet">Sheets</option>
                  <option value="pdf">PDFs</option>
                  <option value="note">Notes</option>
                  <option value="mindmap">Mind Maps</option>
                </select>
              </div>
            </div>

            {/* PINNED FILES GRID */}
            {pinnedItems.length > 0 && !searchQuery && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-40">Pinned Work</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {pinnedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveFile(item);
                        setPdfPage(1);
                        setPdfBookmarks([]);
                        setActiveSlide(0);
                      }}
                      className={`rounded-xl border ${styling.itemBg} p-safe-md flex flex-col justify-between h-32 cursor-pointer ${styling.itemHoverBg} transition-all`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <button
                            onClick={(e) => handleTogglePin(item.id, e)}
                            className="text-amber-400 text-xs hover:scale-110 transition-transform"
                          >
                            ★
                          </button>
                        </div>
                        <h4 className="text-xs font-bold leading-tight truncate">{item.title}</h4>
                      </div>
                      <span className="text-[9px] opacity-40">Edited {item.lastModified}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIZED EXPLORER TABLES */}
            <div className={`rounded-2xl border ${styling.panelBg} p-safe-lg space-y-safe-md`}>
              <div className="flex border-b border-white/[0.04] pb-1.5 justify-between items-center">
                <div className="flex gap-4">
                  {[
                    { id: "all", label: "My Explorer" },
                    { id: "shared", label: "Shared With Me" },
                    { id: "drafts", label: "Drafts Archive" },
                    { id: "templates", label: "Templates Library" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`text-xs font-semibold pb-2 border-b-2 transition-all ${
                        activeTab === tab.id
                          ? "border-[#06b6d4] text-[#06b6d4]"
                          : "border-transparent opacity-40 hover:opacity-80"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] opacity-35">{filteredItems.length} assets</span>
              </div>

              {/* LIST TABLE */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-20 opacity-30 text-xs">No files match filters</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 opacity-40 font-bold">
                        <th className="pb-3 w-1/2">Title</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Last Modified</th>
                        <th className="pb-3">Owner</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setActiveFile(item);
                            setPdfPage(1);
                            setPdfBookmarks([]);
                            setActiveSlide(0);
                          }}
                          className={`border-b border-white/[0.03] last:border-b-0 cursor-pointer ${styling.itemHoverBg} transition-colors`}
                        >
                          <td className="py-3.5 font-bold flex items-center gap-2.5">
                            <span className="text-sm shrink-0">{getTypeIcon(item.type)}</span>
                            <span className="truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
                            {item.pinned && <span className="text-amber-400 text-[10px]">★</span>}
                          </td>
                          <td className="py-3.5 capitalize opacity-60">{item.type}</td>
                          <td className="py-3.5 opacity-55">{item.lastModified}</td>
                          <td className="py-3.5 opacity-55">{item.owner}</td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={(e) => handleTogglePin(item.id, e)}
                              className="opacity-45 hover:opacity-100 text-xs"
                            >
                              {item.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(item.id, e)}
                              className="text-red-500 hover:text-red-400 opacity-70 hover:opacity-100"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          
          // ─── ACTIVE FILE WORKSPACE VIEWS ──────────────────────────────────────────
          <motion.div
            key="workspace-editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col lg:flex-row gap-safe-lg items-start"
          >
            {/* EDITOR CANVAS */}
            <div className={`flex-1 w-full rounded-2xl border ${styling.panelBg} p-safe-lg space-y-5 min-h-[520px] flex flex-col justify-between overflow-hidden relative`}>
              
              {/* File Title Header */}
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(activeFile.type)}</span>
                  <input
                    type="text"
                    value={activeFile.title}
                    onChange={(e) => handleUpdateFileTitle(e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#06b6d4] focus:outline-none font-bold text-sm text-inherit py-0.5"
                  />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                    {activeFile.status}
                  </span>
                </div>
              </div>

              {/* 1. DOCUMENT WORKSPACE */}
              {activeFile.type === "document" && (
                <div className="flex-1 flex flex-col gap-4">
                  {/* Mock toolbar */}
                  <div className="flex gap-2 p-1.5 bg-black/20 border border-white/5 rounded-xl text-[10px] uppercase font-bold tracking-wider opacity-60">
                    <button className="px-2 py-1 hover:bg-white/10 rounded">Bold</button>
                    <button className="px-2 py-1 hover:bg-white/10 rounded">Italic</button>
                    <button className="px-2 py-1 hover:bg-white/10 rounded">Heading</button>
                    <button className="px-2 py-1 hover:bg-white/10 rounded">Bulleted List</button>
                    <span className="w-px h-4 bg-white/10 self-center" />
                    <button className="px-2 py-1 hover:bg-white/10 rounded">Insert Table</button>
                  </div>
                  <textarea
                    value={activeFile.content || ""}
                    onChange={(e) => handleUpdateFileContent(e.target.value)}
                    placeholder="Write your document contents here..."
                    rows={12}
                    className="w-full bg-black/10 border border-white/5 rounded-xl p-4 text-xs text-inherit focus:outline-none focus:border-white/20 resize-none font-mono"
                  />
                </div>
              )}

              {/* 2. PRESENTATION WORKSPACE */}
              {activeFile.type === "presentation" && (
                <div className="flex-1 flex flex-col gap-4">
                  
                  {/* Presentation Mode overlay */}
                  {isPresenting && (
                    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-12 text-white">
                      <div className="absolute top-4 right-4 flex gap-4 text-xs">
                        <span>Slide {activeSlide + 1} of 4</span>
                        <button
                          onClick={() => setIsPresenting(false)}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded hover:bg-white/20"
                        >
                          End Show (Esc)
                        </button>
                      </div>
                      <div className="text-center space-y-4 max-w-lg">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                          {activeFile.content?.split("\n")[activeSlide]?.replace(/Slide \d+: /, "") || "Welcome"}
                        </h2>
                        <p className="text-xs text-white/40">Presenter visual deck container.</p>
                      </div>
                      <div className="absolute bottom-6 flex gap-4">
                        <button
                          disabled={activeSlide === 0}
                          onClick={() => setActiveSlide(prev => prev - 1)}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded disabled:opacity-20"
                        >
                          Prev
                        </button>
                        <button
                          disabled={activeSlide === 3}
                          onClick={() => setActiveSlide(prev => prev + 1)}
                          className="px-4 py-2 bg-white text-black font-bold rounded disabled:opacity-20"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 flex-1">
                    {/* Slide deck list sidebar */}
                    <div className="col-span-1 border border-white/5 rounded-xl bg-black/20 p-2 space-y-2">
                      {[0, 1, 2, 3].map((num) => (
                        <div
                          key={num}
                          onClick={() => setActiveSlide(num)}
                          className={`aspect-video rounded border flex items-center justify-center cursor-pointer transition-all ${
                            activeSlide === num ? "border-[#06b6d4] bg-[#06b6d4]/10" : "border-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className="text-[9px] font-bold font-mono">Slide {num + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Active Slide Center Display */}
                    <div className="col-span-3 border border-white/5 rounded-xl bg-zinc-950/80 p-6 flex flex-col justify-between aspect-video">
                      <div className="text-center my-auto space-y-3">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {activeFile.content?.split("\n")[activeSlide]?.replace(/Slide \d+: /, "") || "Introductory Slides"}
                        </h3>
                        <p className="text-[10px] text-white/30">Visual slide template mock preview</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2 shrink-0">
                        <span className="text-[8px] opacity-35">Template: Axis Dark Presentation</span>
                        <button
                          onClick={() => setIsPresenting(true)}
                          className="px-3.5 py-1 bg-cyan-400 text-black text-[9px] font-bold rounded-lg hover:scale-102 transition-transform"
                        >
                          Present Deck →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SPREADSHEET WORKSPACE */}
              {activeFile.type === "spreadsheet" && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-mono font-bold opacity-30 uppercase">Formula:</span>
                    <input
                      type="text"
                      defaultValue="=SUM(Chloe_IA:Chloe_Final)"
                      className={`flex-1 rounded border ${styling.border} px-3 py-1 text-[11px] font-mono bg-black/40 text-inherit focus:outline-none`}
                    />
                  </div>

                  {/* Grid cells layout */}
                  <div className="border border-white/5 rounded-xl overflow-hidden text-[9px] font-mono bg-zinc-950/20">
                    <div className="grid grid-cols-4 bg-white/5 text-center font-bold border-b border-white/5 py-1.5">
                      <div>Name</div>
                      <div>Term IA</div>
                      <div>Final IA</div>
                      <div>Grading</div>
                    </div>
                    {[
                      { name: "Chloe Vance", term: "18 / 20", final: "19 / 20", grade: "Grade 7" },
                      { name: "Dilan Patel", term: "16 / 20", final: "17 / 20", grade: "Grade 6" },
                      { name: "Emma Watson", term: "14 / 20", final: "15 / 20", grade: "Grade 5" },
                      { name: "Lucas Gray", term: "12 / 20", final: "13 / 20", grade: "Grade 4" },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-4 text-center border-b border-white/[0.03] last:border-b-0 py-2.5 hover:bg-white/[0.02]">
                        <div className="font-bold">{row.name}</div>
                        <div>{row.term}</div>
                        <div>{row.final}</div>
                        <div className="text-cyan-400 font-bold">{row.grade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. NATIVE PDF READER */}
              {activeFile.type === "pdf" && (
                <div className="flex-1 flex flex-col gap-4">
                  {/* PDF header controls */}
                  <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 bg-black/30 border border-white/5 rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={pdfPage === 1}
                        onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-10"
                      >
                        ←
                      </button>
                      <span className="text-[10px] font-bold">
                        Page {pdfPage} of {activeFile.pdfPages || 4}
                      </span>
                      <button
                        disabled={pdfPage === (activeFile.pdfPages || 4)}
                        onClick={() => setPdfPage(prev => Math.min(activeFile.pdfPages || 4, prev + 1))}
                        className="p-1 hover:bg-white/10 rounded disabled:opacity-10"
                      >
                        →
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPdfZoom(prev => Math.max(50, prev - 25))}
                        className="px-2 py-0.5 border border-white/10 rounded text-[9px]"
                      >
                        -
                      </button>
                      <span className="text-[9px] font-mono self-center">{pdfZoom}%</span>
                      <button
                        onClick={() => setPdfZoom(prev => Math.min(200, prev + 25))}
                        className="px-2 py-0.5 border border-white/10 rounded text-[9px]"
                      >
                        +
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search PDF content..."
                        value={pdfSearch}
                        onChange={(e) => setPdfSearch(e.target.value)}
                        className={`rounded-lg border ${styling.border} px-2.5 py-1 text-[10px] bg-black/40 text-inherit focus:outline-none w-36`}
                      />
                    </div>

                    <button
                      onClick={handleTogglePdfBookmark}
                      className={`text-[10px] font-semibold transition-colors ${pdfBookmarks.includes(pdfPage) ? "text-amber-400" : "opacity-40"}`}
                    >
                      ★ Bookmark
                    </button>
                  </div>

                  {/* PDF Content Canvas Block */}
                  <div className="relative border border-white/10 rounded-xl bg-zinc-900/90 aspect-[4/3] p-8 flex flex-col justify-between shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] opacity-40 uppercase tracking-widest border-b border-white/5 pb-2">
                        <span>Syllabus Guide: Refraction Blocks</span>
                        <span>Lab 3 Practical</span>
                      </div>
                      
                      <div className="space-y-2 text-white/80">
                        <h4 className="text-sm font-bold text-white">4.1 Refraction Lab Exercise (Page {pdfPage})</h4>
                        <p className="text-xs leading-relaxed">
                          Refraction occurs when light passes from one transparent medium to another of different optical densities.
                          The bending is described by Snell&apos;s Law indices.
                        </p>
                        <p className="text-[11px] leading-relaxed opacity-70">
                          Align laser alignment pins at exactly 30 degrees. Carefully record the incident and refracted ray coordinates on the grid template.
                        </p>
                      </div>

                      {/* Display search highlight if matched */}
                      {pdfHighlightMatch && (
                        <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[11px]">
                          <strong>Search Match Highlight:</strong> &quot;{pdfHighlightMatch}&quot;
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 shrink-0">
                      <span className="text-[8px] text-white/30 uppercase tracking-wider font-mono">
                        File: {activeFile.pdfUrl}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const e = new CustomEvent("axis-trigger-capture-demo");
                            window.dispatchEvent(e);
                          }}
                          className="px-3 py-1 rounded bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/20 text-[#06b6d4] text-[9px] font-bold uppercase tracking-wider"
                        >
                          Capture Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. NOTES */}
              {activeFile.type === "note" && (
                <div className="flex-1 flex flex-col gap-3">
                  <textarea
                    value={activeFile.content || ""}
                    onChange={(e) => handleUpdateFileContent(e.target.value)}
                    placeholder="Type lightweight notes here..."
                    rows={12}
                    className="w-full bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-xs text-yellow-300 placeholder-yellow-500/40 focus:outline-none focus:border-yellow-500/30 resize-none font-medium"
                  />
                  <span className="text-[9px] text-yellow-500/40">Sticky notes are saved automatically in real-time.</span>
                </div>
              )}

              {/* 6. MIND MAPS */}
              {activeFile.type === "mindmap" && (
                <div className="flex-1 flex flex-col gap-4">
                  <p className="text-[10px] opacity-40 leading-relaxed">Organize lesson units or brainstorming boards by connecting nodes below.</p>
                  <div className="relative h-72 w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    <svg className="absolute inset-0 size-full pointer-events-none">
                      <line x1={150} y1={120} x2={350} y2={80} stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="3 3" />
                      <line x1={150} y1={120} x2={350} y2={180} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" />
                    </svg>

                    <div className="absolute left-[90px] top-[100px] w-28 h-10 rounded-xl border border-[#06b6d4] bg-[#06b6d4]/10 p-2 text-center text-[10px] font-bold text-[#06b6d4] select-none flex items-center justify-center">
                      Optics unit map
                    </div>
                    <div className="absolute left-[290px] top-[60px] w-28 h-10 rounded-xl border border-indigo-400 bg-indigo-500/10 p-2 text-center text-[10px] font-bold text-indigo-400 select-none flex items-center justify-center">
                      Snell&apos;s Law formulas
                    </div>
                    <div className="absolute left-[290px] top-[160px] w-28 h-10 rounded-xl border border-purple-400 bg-purple-500/10 p-2 text-center text-[10px] font-bold text-purple-400 select-none flex items-center justify-center">
                      Prisms lab guidelines
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FOLDERS / OTHER TYPES */}
              {!["document", "presentation", "spreadsheet", "pdf", "note", "mindmap"].includes(activeFile.type) && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <span className="text-lg mb-2">FOLDER</span>
                  <span className="text-xs font-bold">Standard Folder Environment</span>
                  <p className="text-[10px] opacity-40 max-w-xs mt-1">This directory placeholder connects file links and attachments securely.</p>
                </div>
              )}

            </div>

            {/* INTEGRATIONS & CONTROL SIDE-PANEL */}
            <div className="w-full lg:w-72 shrink-0 space-y-6">
              
              {/* Class Space Integration */}
              <div className={`rounded-2xl border ${styling.panelBg} p-4.5 space-y-3.5`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-40">Class Space Attachment</h4>
                <p className="text-[10px] opacity-50 leading-relaxed">
                  Make this file visible to students and link it to their unit assignments.
                </p>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold opacity-30 uppercase block">Select Class Target</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAttachFileToClass(e.target.value);
                    }}
                    value={activeFile.classMatch || ""}
                    className={`w-full rounded-lg border ${styling.border} px-2 py-2 text-xs bg-black/40 text-inherit focus:outline-none`}
                  >
                    <option value="">Unassigned</option>
                    <option value="Grade 11 Physics (B)">Grade 11 Physics (B)</option>
                    <option value="Grade 12 Adv Physics (A)">Grade 12 Adv Physics (A)</option>
                    <option value="Homeroom 11-F">Homeroom 11-F</option>
                  </select>
                </div>
                {activeFile.classMatch && (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    ✓ Attached to {activeFile.classMatch}
                  </div>
                )}
              </div>

              {/* Essential Space Integration */}
              <div className={`rounded-2xl border ${styling.panelBg} p-4.5 space-y-3.5`}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-40">Essential Space Integration</h4>
                <p className="text-[10px] opacity-50 leading-relaxed">
                  Reference captured screenshots, clipped paragraphs, or write notes directly to this file canvas.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowCapturesDrawer(true)}
                    className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-lg transition-all"
                  >
                    Reference Clips ({captures.length})
                  </button>
                  <button
                    onClick={() => {
                      alert("File registered as a reference in Essential Space.");
                    }}
                    className="w-full py-2 bg-white text-zinc-950 text-[10px] font-bold rounded-lg hover:bg-white/95 transition-all"
                  >
                    Save File reference to Essential Space
                  </button>
                </div>
              </div>

            </div>

            {/* SLIDE-OUT CAPTURES DRAWER */}
            <AnimatePresence>
              {showCapturesDrawer && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowCapturesDrawer(false)} />
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    className="fixed right-0 top-0 bottom-0 z-50 w-80 sm:w-96 bg-[#0E0E10] border-l border-white/10 p-5 shadow-2xl overflow-y-auto flex flex-col gap-4 text-white"
                  >
                    <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider">Essential Captures</span>
                      <button
                        onClick={() => setShowCapturesDrawer(false)}
                        className="text-xs opacity-50 hover:opacity-100"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto flex-1 scrollbar-none">
                      {captures.length === 0 ? (
                        <div className="text-center py-10 opacity-30 text-[10px]">No captures registered yet</div>
                      ) : (
                        captures.map((cap) => (
                          <div
                            key={cap.id}
                            onClick={() => {
                              handleUpdateFileContent(
                                (activeFile.content || "") + `\n\n[Reference Capture Clip: ${cap.title} - ${cap.note}]`
                              );
                              setShowCapturesDrawer(false);
                            }}
                            className="p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer space-y-1.5"
                          >
                            <div className="flex justify-between items-center text-[8px] opacity-40 font-mono">
                              <span>{cap.tags?.[0] || "Physics"}</span>
                              <span>{cap.meta}</span>
                            </div>
                            <h5 className="text-[10px] font-bold leading-snug">{cap.title}</h5>
                            <p className="text-[9px] opacity-50">{cap.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
