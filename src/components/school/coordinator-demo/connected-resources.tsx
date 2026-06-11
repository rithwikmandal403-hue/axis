"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

export type ResourceDoc = {
  id: string;
  title: string;
  category: "Academic" | "Faculty" | "Parents" | "Students" | "Administration" | "Policies" | "IB Resources" | "Emergency Resources" | "Forms";
  type: "pdf" | "doc" | "xls" | "link";
  date: string;
  size: string;
  version: string;
  visibility: "Public" | "Faculty" | "Parents" | "Students" | "Internal Only";
  isArchived: boolean;
  usageCount: number;
};

export const INITIAL_RESOURCES: ResourceDoc[] = [
  {
    id: "doc-1",
    title: "Academic Honesty Policy.pdf",
    category: "Policies",
    type: "pdf",
    date: "2026-05-12",
    size: "342 KB",
    version: "v2.1",
    visibility: "Public",
    isArchived: false,
    usageCount: 86,
  },
  {
    id: "doc-2",
    title: "IB Diploma Programme Handbook 2026.pdf",
    category: "Academic",
    type: "pdf",
    date: "2026-04-18",
    size: "1.4 MB",
    version: "v1.0",
    visibility: "Public",
    isArchived: false,
    usageCount: 142,
  },
  {
    id: "doc-3",
    title: "Extended Essay Supervisor Guide.pdf",
    category: "IB Resources",
    type: "pdf",
    date: "2026-05-20",
    size: "890 KB",
    version: "v1.5",
    visibility: "Faculty",
    isArchived: false,
    usageCount: 54,
  },
  {
    id: "doc-4",
    title: "Emergency Evacuation Procedures.pdf",
    category: "Emergency Resources",
    type: "pdf",
    date: "2026-01-10",
    size: "512 KB",
    version: "v3.0",
    visibility: "Public",
    isArchived: false,
    usageCount: 230,
  },
  {
    id: "doc-5",
    title: "TOK Exhibition Guidelines.pdf",
    category: "IB Resources",
    type: "pdf",
    date: "2026-05-25",
    size: "1.2 MB",
    version: "v1.1",
    visibility: "Students",
    isArchived: false,
    usageCount: 98,
  },
  {
    id: "doc-6",
    title: "Syllabus Audit Template.docx",
    category: "Forms",
    type: "doc",
    date: "2026-05-28",
    size: "45 KB",
    version: "v1.0",
    visibility: "Faculty",
    isArchived: false,
    usageCount: 32,
  },
  {
    id: "doc-7",
    title: "Assessment Policy & Criteria.pdf",
    category: "Policies",
    type: "pdf",
    date: "2026-05-02",
    size: "620 KB",
    version: "v2.0",
    visibility: "Public",
    isArchived: false,
    usageCount: 115,
  },
  {
    id: "doc-8",
    title: "Parent Volunteer Consent Form.pdf",
    category: "Forms",
    type: "pdf",
    date: "2026-05-15",
    size: "180 KB",
    version: "v1.2",
    visibility: "Parents",
    isArchived: false,
    usageCount: 44,
  },
  {
    id: "doc-9",
    title: "School Calendar 2026-2027.pdf",
    category: "Administration",
    type: "pdf",
    date: "2026-05-01",
    size: "1.8 MB",
    version: "v1.0",
    visibility: "Public",
    isArchived: false,
    usageCount: 320,
  },
];

export function getSessionResources(): ResourceDoc[] {
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem("axis-resources");
    if (saved) return JSON.parse(saved);
  }
  return INITIAL_RESOURCES;
}

export function saveSessionResources(resources: ResourceDoc[]) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("axis-resources", JSON.stringify(resources));
  }
}

// Icon helper components
function DocTypeIcon({ type }: { type: ResourceDoc["type"] }) {
  const baseClass = "size-4 shrink-0";
  if (type === "pdf") {
    return (
      <span className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/15 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className={baseClass} stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v20m-5-5H2M22 7h-5" strokeLinecap="round" />
          <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
        </svg>
      </span>
    );
  }
  if (type === "doc") {
    return (
      <span className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className={baseClass} stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8m8 4H8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (type === "xls") {
    return (
      <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className={baseClass} stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" className={baseClass} stroke="currentColor" strokeWidth={2}>
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
        <path d="M14.828 14.828a4 4 0 015.656-5.656l1.102 1.101" />
      </svg>
    </span>
  );
}

export function ConnectedResourcesWorkspace({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);

  const [resources, setResources] = useState<ResourceDoc[]>(() => getSessionResources());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Form states for uploading documents
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ResourceDoc["category"]>("Policies");
  const [newType, setNewType] = useState<ResourceDoc["type"]>("pdf");
  const [newVisibility, setNewVisibility] = useState<ResourceDoc["visibility"]>("Public");
  const [newSize, setNewSize] = useState("120 KB");

  // Local Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    saveSessionResources(resources);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" ? true : doc.category === selectedCategory;
      const matchesArchived = doc.isArchived === showArchived;
      return matchesSearch && matchesCategory && matchesArchived;
    });
  }, [resources, searchQuery, selectedCategory, showArchived]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: ResourceDoc = {
      id: `doc-${Date.now()}`,
      title: newTitle.endsWith(`.${newType}`) ? newTitle : `${newTitle}.${newType}`,
      category: newCategory,
      type: newType,
      date: new Date().toISOString().split("T")[0],
      size: newSize || "85 KB",
      version: "v1.0",
      visibility: newVisibility,
      isArchived: false,
      usageCount: 0,
    };

    setResources((prev) => [newDoc, ...prev]);
    setNewTitle("");
    setIsUploading(false);
    triggerToast(`"${newDoc.title}" added to Connected Resources successfully.`);
  };

  const handleArchiveToggle = (id: string, isArchived: boolean) => {
    setResources((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isArchived } : doc))
    );
    triggerToast(isArchived ? "Document archived successfully." : "Document restored from archive.");
  };

  const handleReplaceVersion = (id: string) => {
    setResources((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const num = parseFloat(doc.version.replace("v", "")) + 1.0;
          return {
            ...doc,
            version: `v${num.toFixed(1)}`,
            date: new Date().toISOString().split("T")[0],
            size: `${(parseFloat(doc.size) * 1.15).toFixed(0)} KB`,
            usageCount: doc.usageCount + 1,
          };
        }
        return doc;
      })
    );
    triggerToast("Version updated successfully. Transmitting update notifications.");
  };

  const categories = [
    "all", "Academic", "Faculty", "Parents", "Students", "Administration", "Policies", "IB Resources", "Emergency Resources", "Forms"
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Connected Resources</span>
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-medium text-cyan-400 uppercase tracking-widest font-mono">Axis document layer</span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight mt-1.5 ${styles.textPrimary}`}>
            Document Repository & Knowledge Hub
          </h2>
          <p className={`text-xs mt-1 ${styles.textSecondary}`}>
            Centralized document database of policy handbooks, forms, calendars, curriculum guides, and IB resources.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all self-start sm:self-auto rounded-xl ${styles.buttonPrimary}`}
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Grid of Repository Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Documents", value: resources.length, detail: "All category folders", color: "text-white" },
          { title: "Active Guides", value: resources.filter(d => !d.isArchived).length, detail: "Currently visible in workspace", color: "text-cyan-400" },
          { title: "Usage Hits", value: resources.reduce((sum, d) => sum + d.usageCount, 0), detail: "Faculty/student reference queries", color: "text-emerald-400" },
          { title: "Archived Drafts", value: resources.filter(d => d.isArchived).length, detail: "Historical versions in records", color: "text-white/40" },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${styles.cardBg} ${styles.border} flex flex-col justify-between h-24`}>
            <span className={`text-[8.5px] font-bold uppercase tracking-wider ${styles.textSecondary}`}>{item.title}</span>
            <span className={`text-2xl font-black font-mono ${item.color}`}>{item.value}</span>
            <span className={`text-[9px] ${styles.textSecondary} opacity-60`}>{item.detail}</span>
          </div>
        ))}
      </div>

      {/* Filtering and Query Bar */}
      <div className={`p-4 rounded-xl border ${styles.cardBg} ${styles.border} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search document repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none transition-all ${styles.inputBg} focus:border-cyan-500/50 text-white`}
          />
          <svg className="absolute left-2.5 top-2.5 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-white/40">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`rounded-lg border px-2 py-1.5 text-xs text-white bg-black/45 ${styles.border} focus:outline-none`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === "all" ? "All Folders" : cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowArchived(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              showArchived
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            {showArchived ? "Viewing Archive" : "View Archive"}
          </button>
        </div>
      </div>

      {/* Main Documents Table Ledger */}
      <div className={`rounded-2xl border ${styles.cardBg} ${styles.border} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-white/[0.04] text-[9px] uppercase tracking-wider text-white/40 bg-white/[0.01]">
                <th className="p-4">Document Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Format</th>
                <th className="p-4">Size</th>
                <th className="p-4">Version</th>
                <th className="p-4">Visibility</th>
                <th className="p-4">Date Added</th>
                <th className="p-4 text-center">Downloads</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-xs text-white/30 font-semibold uppercase tracking-wider">
                    No documents matching query found
                  </td>
                </tr>
              ) : (
                filteredResources.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors text-xs">
                    <td className="p-4 font-semibold text-white/90">
                      <div className="flex items-center gap-3">
                        <DocTypeIcon type={doc.type} />
                        <span className="truncate max-w-[200px]" title={doc.title}>{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/60">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-mono font-bold text-white/40">{doc.type}</td>
                    <td className="p-4 text-white/50">{doc.size}</td>
                    <td className="p-4 font-mono text-cyan-400 font-bold">{doc.version}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        doc.visibility === "Public"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : doc.visibility === "Faculty"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : doc.visibility === "Students"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {doc.visibility}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-white/45">{doc.date}</td>
                    <td className="p-4 text-center font-mono text-white/80">{doc.usageCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleReplaceVersion(doc.id)}
                          className="px-2.5 py-1 rounded bg-cyan-500 text-black text-[9px] font-extrabold hover:bg-cyan-400 transition-colors uppercase tracking-wider"
                          title="Replace file version and notify dependents"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleArchiveToggle(doc.id, !doc.isArchived)}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold transition-colors uppercase tracking-wider ${
                            doc.isArchived
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {doc.isArchived ? "Restore" : "Archive"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload/Creation Dialog Panel */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsUploading(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`relative w-full max-w-md border p-6 rounded-2xl shadow-2xl z-10 text-white bg-[#0E0E10] border-white/10`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Upload New Reference Document</h3>
                <button onClick={() => setIsUploading(false)} className="text-white/40 hover:text-white text-xs font-semibold">✕</button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 pt-3 text-xs font-semibold text-white/80">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assessment Policy 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">Category Folder</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ResourceDoc["category"])}
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                    >
                      {categories.filter(c => c !== "all").map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">Format</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ResourceDoc["type"])}
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                    >
                      <option value="pdf">PDF File</option>
                      <option value="doc">Word Doc</option>
                      <option value="xls">Excel Sheet</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">Visibility</label>
                    <select
                      value={newVisibility}
                      onChange={(e) => setNewVisibility(e.target.value as ResourceDoc["visibility"])}
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                    >
                      <option value="Public">Public (Students/Parents/Staff)</option>
                      <option value="Faculty">Faculty Only (Supervisors)</option>
                      <option value="Parents">Parents Only</option>
                      <option value="Students">Students Only</option>
                      <option value="Internal Only">Internal Only (Coordinators)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">File Size Estimate</label>
                    <input
                      type="text"
                      placeholder="e.g. 240 KB"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Upload & Register Document
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Local floating Toast Overlay */}
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

// ─── REUSABLE RESOURCE PICKER MODAL FOR ATTACHMENTS ───────────────────────
import { 
  getSessionFiles, 
  saveSessionFiles, 
  getSessionFolders, 
  FileTypeIcon,
  type PersonalFile,
  type PersonalFolder 
} from "../personal-database";

// ─── REUSABLE RESOURCE PICKER MODAL FOR ATTACHMENTS ───────────────────────
type ResourcePickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: { id: string; title: string; type: string; size: string; category: string }) => void;
  theme?: Theme;
  contextText?: string;
};

export function ResourcePickerModal({
  isOpen,
  onClose,
  onSelect,
  theme = "dark",
  contextText = "",
}: ResourcePickerModalProps) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  // Tab State: "suggested" | "institutional" | "personal" | "upload"
  const [activeTab, setActiveTab] = useState<"suggested" | "institutional" | "personal" | "upload">("suggested");
  
  // Search & Navigation States
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [personalFolderId, setPersonalFolderId] = useState<string | undefined>(undefined);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Data States
  const [resources] = useState<ResourceDoc[]>(() => getSessionResources());
  const [personalFiles, setPersonalFiles] = useState<PersonalFile[]>(() => getSessionFiles());
  const [personalFolders] = useState<PersonalFolder[]>(() => getSessionFolders());

  // Upload Simulation States
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<PersonalFile["type"]>("pdf");
  const [uploadSize, setUploadSize] = useState("180 KB");
  const [uploadFolderId, setUploadFolderId] = useState<string>("");

  // Update files list when session storage changes
  useEffect(() => {
    if (isOpen) {
      setPersonalFiles(getSessionFiles());
    }
  }, [isOpen]);

  // Context Engine suggested files logic
  const suggestedFiles = useMemo(() => {
    const text = (contextText || "").toLowerCase();
    const suggestions: (ResourceDoc | PersonalFile)[] = [];

    if (text.includes("handbook") || text.includes("dp handbook") || text.includes("student handbook")) {
      const match1 = resources.find(r => r.title.toLowerCase().includes("handbook"));
      if (match1) suggestions.push(match1);
      const match2 = resources.find(r => r.title.toLowerCase().includes("honesty"));
      if (match2) suggestions.push(match2);
      const match3 = resources.find(r => r.title.toLowerCase().includes("assessment policy"));
      if (match3) suggestions.push(match3);
    } 
    
    if (text.includes("moderation") || text.includes("notes") || text.includes("meeting notes")) {
      const p1 = personalFiles.find(f => f.title.toLowerCase().includes("moderation notes - april"));
      if (p1) suggestions.push(p1);
      const p2 = personalFiles.find(f => f.title.toLowerCase().includes("moderation notes - may"));
      if (p2) suggestions.push(p2);
      const p3 = personalFiles.find(f => f.title.toLowerCase().includes("department review"));
      if (p3) suggestions.push(p3);
    }
    
    if (text.includes("assessment policy") || text.includes("assessment")) {
      const p1 = personalFiles.find(f => f.title.toLowerCase().includes("dp assessment policy"));
      if (p1) suggestions.push(p1);
      const p2 = personalFiles.find(f => f.title.toLowerCase().includes("assessment handbook"));
      if (p2) suggestions.push(p2);
      const r1 = resources.find(r => r.title.toLowerCase().includes("assessment policy"));
      if (r1) suggestions.push(r1);
    }

    // Default suggestions if none match the conversation keywords
    if (suggestions.length === 0) {
      const match1 = resources.find(r => r.title.toLowerCase().includes("honesty"));
      if (match1) suggestions.push(match1);
      const match2 = resources.find(r => r.title.toLowerCase().includes("guide"));
      if (match2) suggestions.push(match2);
      const p1 = personalFiles.find(f => f.title.toLowerCase().includes("tok"));
      if (p1) suggestions.push(p1);
    }

    // De-duplicate suggestions by title
    const unique: (ResourceDoc | PersonalFile)[] = [];
    const seen = new Set<string>();
    for (const item of suggestions) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    }
    return unique;
  }, [contextText, resources, personalFiles]);

  const getRecommendationReason = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("handbook")) return "Matches 'handbook' reference in dialogue";
    if (t.includes("moderation")) return "Matches 'moderation notes' topic";
    if (t.includes("assessment")) return "Matches 'assessment policy' request";
    return "AI Suggested Reference";
  };

  // Filter Connected Resources docs
  const filteredInstitutionalDocs = useMemo(() => {
    return resources.filter((d) => {
      const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
      const matchFolder = activeFolder === "all" ? true : d.category === activeFolder;
      return matchSearch && matchFolder && !d.isArchived;
    });
  }, [resources, search, activeFolder]);

  // Filter Personal Database docs
  const filteredPersonalDocs = useMemo(() => {
    return personalFiles.filter((f) => {
      const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
      const matchFolder = f.folderId === personalFolderId;
      const matchFavorite = showFavoritesOnly ? f.isFavorite : true;
      return matchSearch && matchFolder && matchFavorite;
    });
  }, [personalFiles, search, personalFolderId, showFavoritesOnly]);

  const categories = [
    "all", "Academic", "Faculty", "Parents", "Students", "Administration", "Policies", "IB Resources", "Forms"
  ];

  // Handle upload selection directly
  const handleUploadAndAttach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newFile: PersonalFile = {
      id: `pf-${Date.now()}`,
      title: uploadTitle.endsWith(`.${uploadType}`) ? uploadTitle.trim() : `${uploadTitle.trim()}.${uploadType}`,
      type: uploadType,
      date: new Date().toISOString().split("T")[0],
      size: uploadSize || "140 KB",
      folderId: uploadFolderId ? uploadFolderId : undefined,
      isFavorite: false
    };

    const updatedFiles = [newFile, ...personalFiles];
    saveSessionFiles(updatedFiles);
    setPersonalFiles(updatedFiles);

    onSelect({
      id: newFile.id,
      title: newFile.title,
      type: newFile.type,
      size: newFile.size,
      category: "Personal File"
    });
    setUploadTitle("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className={`relative w-full max-w-xl border p-5 rounded-2xl shadow-2xl z-10 flex flex-col gap-4 max-h-[85vh] bg-[#0E0E10] border-white/10 text-white`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-white/10 shrink-0">
              <div>
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400 block font-mono">Unified Retrieval Hub</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Select File Attachment</h3>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-semibold px-2 py-1 bg-white/5 rounded-lg">✕</button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex rounded-xl p-0.5 bg-black/40 border border-white/5 shrink-0">
              {([
                { id: "suggested", label: "Suggested Files" },
                { id: "institutional", label: "Connected Resources" },
                { id: "personal", label: "Personal Database" },
                { id: "upload", label: "Device Upload" }
              ] as const).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearch("");
                    }}
                    className={`flex-1 py-2 text-center rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-cyan-500 text-black shadow-lg"
                        : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* SEARCH AREA (Not shown on upload tab) */}
            {activeTab !== "upload" && (
              <div className="relative shrink-0">
                <input
                  type="text"
                  placeholder={
                    activeTab === "suggested"
                      ? "Filter suggested references..."
                      : activeTab === "personal"
                      ? "Search private vault files..."
                      : "Filter institutional assets..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-black/60 border border-white/10 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                />
                <svg className="absolute left-2.5 top-2.5 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>
            )}

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[300px] scrollbar-none">
              
              {/* TAB 1: SUGGESTED FILES */}
              {activeTab === "suggested" && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-cyan-950/15 border border-cyan-800/20 text-[10px] text-cyan-400 font-semibold flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    Context Engine analyzed text and suggested these highly relevant files:
                  </div>
                  
                  {suggestedFiles
                    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
                    .length === 0 ? (
                      <div className="text-center py-10 text-xs text-white/20 uppercase tracking-widest font-semibold">No suggestions found</div>
                    ) : (
                      suggestedFiles
                        .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
                        .map((item) => {
                          const isPersonal = !("category" in item);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                onSelect({
                                  id: item.id,
                                  title: item.title,
                                  type: item.type,
                                  size: item.size,
                                  category: isPersonal ? "Personal File" : (item as ResourceDoc).category
                                });
                                onClose();
                              }}
                              className="w-full text-left p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FileTypeIcon type={item.type} />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-white/90 truncate group-hover:text-cyan-400 transition-colors">{item.title}</span>
                                  <span className="text-[9px] text-white/40 leading-none mt-1.5 flex items-center gap-1.5">
                                    <span className="text-cyan-400 font-bold uppercase tracking-wider shrink-0">
                                      {isPersonal ? "📁 Personal File" : "🏫 School Resource"}
                                    </span>
                                    <span>·</span>
                                    <span className="text-amber-400/90 font-medium font-mono shrink-0">
                                      {getRecommendationReason(item.title)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors shrink-0">Attach →</span>
                            </button>
                          );
                        })
                    )}
                </div>
              )}

              {/* TAB 2: CONNECTED RESOURCES */}
              {activeTab === "institutional" && (
                <div className="space-y-3">
                  {/* Category switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                    {categories.map((folder) => {
                      const isSelected = activeFolder === folder;
                      return (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => setActiveFolder(folder)}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                            isSelected
                              ? "bg-cyan-500 text-black"
                              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {folder === "all" ? "All Folders" : folder}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    {filteredInstitutionalDocs.length === 0 ? (
                      <div className="text-center py-10 text-xs text-white/20 uppercase tracking-widest font-semibold">No resource files found</div>
                    ) : (
                      filteredInstitutionalDocs.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            onSelect({
                              id: doc.id,
                              title: doc.title,
                              type: doc.type,
                              size: doc.size,
                              category: doc.category
                            });
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileTypeIcon type={doc.type} />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white/90 truncate group-hover:text-cyan-400 transition-colors">{doc.title}</span>
                              <span className="text-[9px] text-white/40 leading-none mt-1">{doc.category} · {doc.size}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[8px] font-mono border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 px-1.5 py-0.5 rounded">{doc.version}</span>
                            <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors">Select →</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PERSONAL DATABASE */}
              {activeTab === "personal" && (
                <div className="space-y-3">
                  {/* Favorites and Nav bar */}
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase border-b border-white/5 pb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPersonalFolderId(undefined)}
                        className={`hover:text-cyan-400 ${personalFolderId === undefined ? "text-cyan-400" : "text-white/60"}`}
                      >
                        Root Vault
                      </button>
                      {personalFolderId && (
                        <>
                          <span className="text-white/20">/</span>
                          <span className="text-cyan-400">{personalFolders.find(f => f.id === personalFolderId)?.name}</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`px-2 py-0.5 rounded border ${
                        showFavoritesOnly ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "border-white/10 text-white/45"
                      }`}
                    >
                      ★ Starred
                    </button>
                  </div>

                  {/* Folders in list (only shown in root folder view) */}
                  {personalFolderId === undefined && !showFavoritesOnly && (
                    <div className="grid grid-cols-2 gap-2">
                      {personalFolders
                        .filter(folder => folder.name.toLowerCase().includes(search.toLowerCase()))
                        .map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => setPersonalFolderId(folder.id)}
                            className="p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/20 transition-all cursor-pointer flex items-center gap-2 group"
                          >
                            <span className="text-cyan-400">📁</span>
                            <span className="text-[11px] font-bold text-white/80 group-hover:text-cyan-400 transition-colors truncate">
                              {folder.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Personal files list */}
                  <div className="space-y-2">
                    {filteredPersonalDocs.length === 0 ? (
                      <div className="text-center py-8 text-xs text-white/20 uppercase tracking-widest font-semibold">No files inside folder</div>
                    ) : (
                      filteredPersonalDocs.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => {
                            onSelect({
                              id: file.id,
                              title: file.title,
                              type: file.type,
                              size: file.size,
                              category: "Personal File"
                            });
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileTypeIcon type={file.type} />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-white/90 truncate group-hover:text-cyan-400 transition-colors">{file.title}</span>
                              <span className="text-[9px] text-white/40 leading-none mt-1">
                                {file.size} · Uploaded {file.date}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors shrink-0">Attach →</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DEVICE UPLOAD SIMULATOR */}
              {activeTab === "upload" && (
                <form onSubmit={handleUploadAndAttach} className="space-y-3.5 text-xs text-left p-2">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-black/20">
                    <span className="text-3xl animate-bounce">📥</span>
                    <span className="font-bold text-white/80">Simulate File Drag & Drop</span>
                    <span className="text-[10px] text-white/30">Or fill in the metadata details below to upload instantly</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-semibold">Filename</label>
                    <input
                      type="text"
                      placeholder="Enter document filename..."
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Organize into Folder</label>
                      <select
                        value={uploadFolderId}
                        onChange={(e) => setUploadFolderId(e.target.value)}
                        className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500 text-[11px]"
                      >
                        <option value="">Vault Root Directory</option>
                        {personalFolders.map(f => (
                          <option key={f.id} value={f.id}>📁 {f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-semibold">Extension</label>
                      <select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value as PersonalFile["type"])}
                        className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500 text-[11px]"
                      >
                        <option value="pdf">.pdf</option>
                        <option value="doc">.docx</option>
                        <option value="xls">.xlsx</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("suggested")}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl font-bold text-white"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                    >
                      Upload & Link
                    </button>
                  </div>
                </form>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
