"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type CapturedItem } from "./capture-layer";

type EssentialSpaceProps = {
  theme?: string;
  captures?: CapturedItem[];
  onDeleteCapture?: (id: string) => void;
  onAddCapture?: (item: CapturedItem) => void;
};

type NoteItem = {
  id: string;
  title: string;
  body: string;
  date: string;
};

type ResourceItem = {
  id: string;
  title: string;
  type: "pdf" | "link" | "doc" | "video";
  url: string;
  date: string;
};

type MindMapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
};

type MindMapLink = {
  from: string;
  to: string;
};

type DraftItem = {
  id: string;
  text: string;
  date: string;
};

export function EssentialSpaceWorkspace({
  theme = "dark",
  captures = [],
  onDeleteCapture,
}: EssentialSpaceProps) {
  const [activeSegment, setActiveSegment] = useState<
    "captures" | "notes" | "collections" | "mindmaps" | "resources" | "drafts"
  >("captures");

  // Local state for Notes
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: "note-1",
      title: "Optics lesson concepts",
      body: "Need to prepare refraction prism kits and light source alignment templates for grade 11 B.",
      date: "May 28, 2026",
    },
    {
      id: "note-2",
      title: "Chloe Vance IA ideas",
      body: "Suggested friction calculation tweaks. Look into air resistance damping coefficients.",
      date: "May 29, 2026",
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");

  // Local state for Saved Resources
  const [resources, setResources] = useState<ResourceItem[]>([
    {
      id: "res-1",
      title: "IB Physics Guide 2026",
      type: "pdf",
      url: "physics_guide_2026.pdf",
      date: "2 weeks ago",
    },
    {
      id: "res-2",
      title: "Waves Simulation Lab Link",
      type: "link",
      url: "https://phet.colorado.edu/waves",
      date: "1 month ago",
    },
  ]);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceType, setNewResourceType] = useState<ResourceItem["type"]>("pdf");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  // Local state for Mind Maps
  const [nodes, setNodes] = useState<MindMapNode[]>([
    { id: "node-1", label: "IB physics IA", x: 160, y: 120, color: "#06b6d4" },
    { id: "node-2", label: "Light Waves", x: 300, y: 60, color: "#a855f7" },
    { id: "node-3", label: "Refraction", x: 300, y: 180, color: "#10b981" },
  ]);
  const [links, setLinks] = useState<MindMapLink[]>([
    { from: "node-1", to: "node-2" },
    { from: "node-1", to: "node-3" },
  ]);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [linkFromNode, setLinkFromNode] = useState("");
  const [linkToNode, setLinkToNode] = useState("");

  // Local state for Draft Space
  const [drafts, setDrafts] = useState<DraftItem[]>([
    { id: "draft-1", text: "DP Physics term syllabus revision project plans.", date: "Today" },
    { id: "draft-2", text: "Substitute class ideas for grade 10 science period 5.", date: "Yesterday" },
  ]);
  const [newDraftText, setNewDraftText] = useState("");

  // Active zoomed capture for Quick Open Modal
  const [zoomedCapture, setZoomedCapture] = useState<CapturedItem | null>(null);

  // Mapped styling variables matching local context theme selector
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

  // Notes callbacks
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteBody) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      body: newNoteBody,
      date: new Date().toLocaleDateString(),
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteBody("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Resources callbacks
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle || !newResourceUrl) return;
    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      title: newResourceTitle,
      type: newResourceType,
      url: newResourceUrl,
      date: "Just now",
    };
    setResources([newRes, ...resources]);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  // Mind map node & link callbacks
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel) return;
    const colors = ["#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      x: 100 + Math.random() * 200,
      y: 80 + Math.random() * 140,
      color: randomColor,
    };
    setNodes([...nodes, newNode]);
    setNewNodeLabel("");
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFromNode || !linkToNode || linkFromNode === linkToNode) return;
    // Check if link already exists
    const linkExists = links.some(
      (l) =>
        (l.from === linkFromNode && l.to === linkToNode) ||
        (l.from === linkToNode && l.to === linkFromNode)
    );
    if (!linkExists) {
      setLinks([...links, { from: linkFromNode, to: linkToNode }]);
    }
    setLinkFromNode("");
    setLinkToNode("");
  };

  const handleClearMindMap = () => {
    setNodes([]);
    setLinks([]);
  };

  // Drafts callbacks
  const handleAddDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftText) return;
    const newDraft: DraftItem = {
      id: `draft-${Date.now()}`,
      text: newDraftText,
      date: "Today",
    };
    setDrafts([newDraft, ...drafts]);
    setNewDraftText("");
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-safe-lg items-start font-sans">
      
      {/* LEFT: Internal Workspace Sidebar Navigation */}
      <div className={`w-full md:w-56 shrink-0 rounded-2xl border ${styling.panelBg} p-safe-md space-y-safe-md`}>
        <div className="px-1.5 flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[#06b6d4] uppercase">Teacher Studio</span>
          <h2 className="text-sm font-semibold tracking-tight leading-none mt-1.5">Essential Space</h2>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { id: "captures", label: "Captured Area", badge: captures.length },
            { id: "notes", label: "Personal Notes", badge: notes.length },
            { id: "collections", label: "Collections", badge: 5 },
            { id: "mindmaps", label: "Mind Maps", badge: nodes.length },
            { id: "resources", label: "Saved Resources", badge: resources.length },
            { id: "drafts", label: "Draft Space", badge: drafts.length },
          ].map((seg) => {
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id as typeof activeSegment)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                  isActive
                    ? styling.btnActive
                    : `text-inherit/60 ${styling.itemHoverBg}`
                }`}
              >
                <span>{seg.label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/10 text-inherit" : styling.badgeBg}`}>
                  {seg.badge}
                </span>
              </button>
            );
          })}
        </nav>
        
        <div className="pt-2 border-t border-white/[0.04]">
          <span className="text-[8px] opacity-40 block">Capture shortcut: Double-Tap &quot;E&quot;</span>
        </div>
      </div>

      {/* RIGHT: Active Tab Segment Panel */}
      <div className={`flex-1 w-full rounded-2xl border ${styling.panelBg} p-safe-lg min-h-[500px] flex flex-col justify-between overflow-hidden`}>
        <div className="space-y-safe-lg">
          
          {/* TAB 1: CAPTURED SCREEN REGIONS */}
          {activeSegment === "captures" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Captures Ledger</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Visually clipped coordinates with contextual notes.</p>
                </div>
              </div>

              {captures.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <span className="text-sm font-semibold opacity-40">No captures registered yet</span>
                  <p className="text-[10px] opacity-35 max-w-xs mx-auto mt-2">
                    Double-tap the <strong className="text-cyan-400">E</strong> key on your keyboard from anywhere to crop screen regions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-safe-md">
                  {captures.map((cap) => {
                    const dimensions = cap.dimensions || "Crop Area";
                    return (
                      <div
                        key={cap.id}
                        className={`rounded-xl border ${styling.itemBg} p-safe-md space-y-safe-sm flex flex-col justify-between`}
                      >
                        <div className="space-y-safe-sm">
                          {/* Mini simulated preview crop block */}
                          <div className="relative aspect-video w-full rounded-lg bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            <div className="border border-cyan-400/50 bg-cyan-500/[0.04] px-3 py-1.5 rounded-sm flex items-center justify-center">
                              <span className="text-[7.5px] font-bold text-cyan-400 tracking-wider">Crop Preview</span>
                            </div>
                            <span className="absolute bottom-1 right-1.5 font-mono text-[7px] text-white/30">{dimensions}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8.5px] font-bold uppercase tracking-wider ${theme === "light" ? "text-indigo-600" : "text-cyan-400"}`}>
                                {cap.tags?.[0] || "Physics"}
                              </span>
                              <span className="text-[8.5px] text-inherit/30">{cap.date || cap.meta}</span>
                            </div>
                            <p className="text-[11px] font-medium leading-snug text-inherit/80">{cap.note || cap.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-safe-sm border-t border-white/[0.03]">
                          <button
                            onClick={() => setZoomedCapture(cap)}
                            className="text-[10px] font-bold text-[#06b6d4] hover:text-[#22d3ee] transition-colors"
                          >
                            Quick Open →
                          </button>
                          {onDeleteCapture && (
                            <button
                              onClick={() => onDeleteCapture(cap.id)}
                              className="text-[9px] text-red-500 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL NOTES */}
          {activeSegment === "notes" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Personal Studio Notes</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Simple, fast, distraction-free thoughts.</p>
                </div>
              </div>

              {/* Note Creator Form */}
              <form onSubmit={handleAddNote} className={`rounded-xl border ${styling.itemBg} p-safe-md space-y-safe-sm`}>
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className={`w-full bg-transparent border-b ${styling.border} py-1 text-xs text-inherit focus:outline-none placeholder-inherit/35 font-semibold`}
                />
                <textarea
                  placeholder="Write your note here..."
                  rows={2}
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  className="w-full bg-transparent py-1 text-xs text-inherit focus:outline-none placeholder-inherit/30 resize-none"
                />
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className={`px-4.5 py-1.5 rounded-lg text-[10px] font-bold ${styling.btnActive}`}
                  >
                    Add Note
                  </button>
                </div>
              </form>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-safe-md">
                {notes.map((n) => (
                  <div key={n.id} className={`rounded-xl border ${styling.itemBg} p-safe-md flex flex-col justify-between`}>
                    <div className="space-y-safe-sm">
                      <div className="flex items-start justify-between gap-safe-sm">
                        <h4 className="text-xs font-bold leading-snug">{n.title}</h4>
                        <span className="text-[8px] text-inherit/30 shrink-0">{n.date}</span>
                      </div>
                      <p className="text-[11px] text-inherit/60 leading-relaxed">{n.body}</p>
                    </div>
                    <div className="flex justify-end pt-safe-sm mt-safe-sm border-t border-white/[0.03]">
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-[9px] text-red-500 hover:text-red-400"
                      >
                        Discard Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COLLECTIONS */}
          {activeSegment === "collections" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Collections Portfolio</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Segmented knowledge archives for classes and teams.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-safe-md">
                {[
                  { title: "DP1 Physics", count: "14 items", icon: "⚛️", color: "from-cyan-500/20 to-blue-500/10" },
                  { title: "Assessment Ideas", count: "8 ideas", icon: "📝", color: "from-purple-500/20 to-pink-500/10" },
                  { title: "Department Planning", count: "5 logs", icon: "📁", color: "from-amber-500/20 to-orange-500/10" },
                  { title: "Lab Activities", count: "9 references", icon: "🧪", color: "from-emerald-500/20 to-teal-500/10" },
                  { title: "IB Resources", count: "12 guides", icon: "📘", color: "from-blue-500/20 to-sky-500/10" },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border ${styling.itemBg} bg-gradient-to-br ${col.color} p-safe-md flex flex-col justify-between h-36 transition-all hover:scale-102 hover:border-white/20`}
                  >
                    <div className="text-2xl">{col.icon}</div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold leading-tight">{col.title}</h4>
                      <span className="text-[10px] text-inherit/40 block">{col.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VISUAL THINKING MIND MAPS */}
          {activeSegment === "mindmaps" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Lightweight Mind Maps</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Connect nodes quickly to organize curricular concepts.</p>
                </div>
                <button
                  onClick={handleClearMindMap}
                  className="px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-500 text-[10px] font-semibold"
                >
                  Clear Map
                </button>
              </div>

              {/* Node Map Grid Setup Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-safe-md">
                <form onSubmit={handleAddNode} className={`rounded-xl border ${styling.itemBg} p-safe-md flex gap-safe-sm items-end`}>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[9px] text-inherit/40 font-bold uppercase">Node Label</label>
                    <input
                      type="text"
                      placeholder="Type concept (e.g. Waves)..."
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      className={`w-full rounded-lg border ${styling.border} px-3 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold ${styling.btnActive} shrink-0`}
                  >
                    Add Node
                  </button>
                </form>

                <form onSubmit={handleCreateLink} className={`rounded-xl border ${styling.itemBg} p-safe-md flex gap-safe-sm items-end`}>
                  <div className="flex-1 grid grid-cols-2 gap-safe-sm">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-inherit/40 font-bold uppercase">Link From</label>
                      <select
                        value={linkFromNode}
                        onChange={(e) => setLinkFromNode(e.target.value)}
                        className={`w-full rounded-lg border ${styling.border} px-2 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                      >
                        <option value="">Select...</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-inherit/40 font-bold uppercase">Link To</label>
                      <select
                        value={linkToNode}
                        onChange={(e) => setLinkToNode(e.target.value)}
                        className={`w-full rounded-lg border ${styling.border} px-2 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                      >
                        <option value="">Select...</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`px-4.5 py-2 rounded-lg text-[10px] font-bold ${styling.btnActive} shrink-0`}
                  >
                    Link Nodes
                  </button>
                </form>
              </div>

              {/* Simulated Interactive SVG Canvas Area */}
              <div className="relative h-64 w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center">
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 size-full pointer-events-none">
                  {links.map((link, idx) => {
                    const fromNode = nodes.find(n => n.id === link.from);
                    const toNode = nodes.find(n => n.id === link.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <line
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={theme === "light" ? "#4f46e5" : "#22d3ee"}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                    );
                  })}
                </svg>

                {/* Nodes rendering */}
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      setNodes(prev => prev.map(n => {
                        if (n.id === node.id) {
                          return {
                            ...n,
                            x: Math.max(20, Math.min(500, n.x + info.delta.x)),
                            y: Math.max(20, Math.min(230, n.y + info.delta.y)),
                          };
                        }
                        return n;
                      }));
                    }}
                    style={{ left: node.x - 55, top: node.y - 20 }}
                    className="absolute cursor-move flex items-center justify-center w-28 h-10 rounded-xl border p-2 text-center text-[10px] font-bold select-none text-white shadow-lg shadow-black/20"
                    animate={{ backgroundColor: node.color, borderColor: node.color }}
                  >
                    {node.label}
                  </motion.div>
                ))}

                {nodes.length === 0 && (
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">
                    Studio Node canvas empty. Add nodes above.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SAVED REFERENCE RESOURCES */}
          {activeSegment === "resources" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Reference Materials</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Quickly access books, templates, videos and links.</p>
                </div>
              </div>

              {/* Resource Form */}
              <form onSubmit={handleAddResource} className={`rounded-xl border ${styling.itemBg} p-safe-md flex flex-col sm:flex-row gap-safe-sm items-end`}>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-inherit/40 font-bold uppercase">Resource Title</label>
                    <input
                      type="text"
                      placeholder="Optics Guide..."
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      className={`w-full rounded-lg border ${styling.border} px-3 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-inherit/40 font-bold uppercase">Type</label>
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value as ResourceItem["type"])}
                      className={`w-full rounded-lg border ${styling.border} px-2 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                    >
                      <option value="pdf">PDF File</option>
                      <option value="link">Web Link</option>
                      <option value="doc">Document</option>
                      <option value="video">Lecture Video</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-inherit/40 font-bold uppercase">URL / Location</label>
                    <input
                      type="text"
                      placeholder="Reference source..."
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      className={`w-full rounded-lg border ${styling.border} px-3 py-2 text-xs text-inherit bg-transparent focus:outline-none`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-[10px] font-bold ${styling.btnActive} shrink-0`}
                >
                  Save Reference
                </button>
              </form>

              {/* Resources list */}
              <div className="space-y-safe-sm">
                {resources.map((res) => {
                  const typeIcon =
                    res.type === "pdf" ? "📕" : res.type === "link" ? "🔗" : res.type === "video" ? "🎬" : "📄";
                  return (
                    <div
                      key={res.id}
                      className={`flex items-center justify-between p-safe-md rounded-xl border ${styling.itemBg} hover:bg-white/[0.01] transition-colors`}
                    >
                      <div className="flex items-center gap-safe-md min-w-0">
                        <span className="text-base">{typeIcon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-inherit/90 truncate">{res.title}</span>
                          <span className="text-[9px] text-inherit/35 truncate mt-0.5">{res.url}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[8.5px] text-inherit/30">{res.date}</span>
                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="text-[9px] text-red-500 hover:text-red-400"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: DRAFT SPACE */}
          {activeSegment === "drafts" && (
            <div className="space-y-safe-lg">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-safe-sm">
                <div>
                  <h3 className="text-sm font-bold text-inherit">Draft Scratchpad</h3>
                  <p className="text-[11px] text-inherit/40 mt-0.5">Quickly dump unfinished curricular concepts and ideas.</p>
                </div>
              </div>

              {/* Draft Form */}
              <form onSubmit={handleAddDraft} className="flex gap-safe-sm items-end">
                <input
                  type="text"
                  placeholder="New quick thought/draft idea..."
                  value={newDraftText}
                  onChange={(e) => setNewDraftText(e.target.value)}
                  className={`flex-1 rounded-xl border ${styling.border} px-safe-md py-safe-sm text-xs text-inherit bg-transparent focus:outline-none`}
                />
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold ${styling.btnActive} shrink-0`}
                >
                  Write Draft
                </button>
              </form>

              {/* Draft lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className={`rounded-xl border ${styling.itemBg} p-4.5 flex flex-col justify-between gap-3 h-32`}
                  >
                    <p className="text-[11px] leading-relaxed text-inherit/70 overflow-y-auto">{d.text}</p>
                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 shrink-0">
                      <span className="text-[9px] text-inherit/30">{d.date}</span>
                      <button
                        onClick={() => handleDeleteDraft(d.id)}
                        className="text-[9px] text-red-500 hover:text-red-400"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* QUICK OPEN CAPTURE ZOOM MODAL */}
      <AnimatePresence>
        {zoomedCapture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setZoomedCapture(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#0E0E10] border border-white/10 p-6 space-y-4 shadow-2xl z-10 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Capture Zoom View</span>
                </div>
                <button
                  onClick={() => setZoomedCapture(null)}
                  className="text-white/40 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all"
                >
                  Close (Esc)
                </button>
              </div>

              {/* Large graphic simulating the screenshot view */}
              <div className="relative aspect-video w-full rounded-xl bg-zinc-950/95 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:15px_15px]" />
                <div className="border border-cyan-400 bg-cyan-500/10 px-6 py-4 rounded-xl flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Optics Refraction Frame</span>
                  <span className="text-[9px] text-white/50">{zoomedCapture.dimensions || "Crop coordinates"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-white/40">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider">{zoomedCapture.tags?.[0]}</span>
                  <span>{zoomedCapture.date || zoomedCapture.meta}</span>
                </div>
                <h3 className="text-sm font-bold mt-1 text-white">{zoomedCapture.title}</h3>
                <p className="text-xs text-white/70 leading-relaxed mt-2 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  {zoomedCapture.note || zoomedCapture.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
