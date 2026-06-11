"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

export type PersonalFolder = {
  id: string;
  name: string;
  date: string;
  category?: string;
};

export type PersonalFile = {
  id: string;
  title: string;
  type: "pdf" | "doc" | "xls" | "link";
  date: string;
  size: string;
  folderId?: string; // undefined or empty means root
  isFavorite: boolean;
};

export const INITIAL_FOLDERS: PersonalFolder[] = [
  { id: "f-1", name: "Assessment", date: "2026-05-10", category: "Assessment" },
  { id: "f-2", name: "Meetings", date: "2026-04-12", category: "Meetings" },
  { id: "f-3", name: "University", date: "2026-05-15", category: "University" },
  { id: "f-4", name: "Administration", date: "2026-03-20", category: "Administration" }
];

export const INITIAL_FILES: PersonalFile[] = [
  { id: "pf-1", title: "Moderation Notes - April.pdf", type: "pdf", date: "2026-04-22", size: "310 KB", folderId: "f-2", isFavorite: true },
  { id: "pf-2", title: "Moderation Notes - May.pdf", type: "pdf", date: "2026-05-24", size: "285 KB", folderId: "f-2", isFavorite: false },
  { id: "pf-3", title: "DP Assessment Policy.pdf", type: "pdf", date: "2026-05-02", size: "620 KB", folderId: "f-1", isFavorite: true },
  { id: "pf-4", title: "Assessment Handbook.pdf", type: "pdf", date: "2026-05-05", size: "840 KB", folderId: "f-1", isFavorite: false },
  { id: "pf-5", title: "TOK Essay Prompts 2026.pdf", type: "pdf", date: "2026-05-18", size: "450 KB", isFavorite: false },
  { id: "pf-6", title: "University Counselor Guide.pdf", type: "pdf", date: "2026-05-20", size: "1.2 MB", folderId: "f-3", isFavorite: false },
  { id: "pf-7", title: "Department Review Summary.docx", type: "doc", date: "2026-05-27", size: "54 KB", folderId: "f-2", isFavorite: true }
];

export function getSessionFolders(): PersonalFolder[] {
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem("axis-personal-folders");
    if (saved) return JSON.parse(saved);
  }
  return INITIAL_FOLDERS;
}

export function saveSessionFolders(folders: PersonalFolder[]) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("axis-personal-folders", JSON.stringify(folders));
  }
}

export function getSessionFiles(): PersonalFile[] {
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem("axis-personal-files");
    if (saved) return JSON.parse(saved);
  }
  return INITIAL_FILES;
}

export function saveSessionFiles(files: PersonalFile[]) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("axis-personal-files", JSON.stringify(files));
  }
}

// Icon helper components
export function FileTypeIcon({ type }: { type: PersonalFile["type"] }) {
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

export function PersonalDatabaseWorkspace({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  const [folders, setFolders] = useState<PersonalFolder[]>(() => getSessionFolders());
  const [files, setFiles] = useState<PersonalFile[]>(() => getSessionFiles());

  // Navigation state (folderId or null/empty for root)
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Modal / Interaction states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<PersonalFile["type"]>("pdf");
  const [uploadSize, setUploadSize] = useState("180 KB");

  const [showMoveModal, setShowMoveModal] = useState<PersonalFile | null>(null);
  const [showRenameFileModal, setShowRenameFileModal] = useState<PersonalFile | null>(null);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<PersonalFolder | null>(null);
  const [renameInput, setRenameInput] = useState("");

  // Context Engine Organization Suggestions State
  const [activeSuggestion, setActiveSuggestion] = useState<{
    fileId: string;
    folderId: string;
    folderName: string;
    fileName: string;
  } | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    saveSessionFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveSessionFiles(files);
  }, [files]);

  // Folder details lookup
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === currentFolderId);
  }, [folders, currentFolderId]);

  // Filtered files in active view
  const visibleFiles = useMemo(() => {
    return files.filter((f) => {
      // Must match search query
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
      // Must match favorites filter if checked
      const matchesFavorite = filterFavorites ? f.isFavorite : true;
      // Must be inside current folder
      const matchesFolder = f.folderId === currentFolderId;
      
      return matchesSearch && matchesFavorite && matchesFolder;
    });
  }, [files, searchQuery, filterFavorites, currentFolderId]);

  // Filtered folders in active view (folders can only exist in root for simplicity, or we show all root folders when in root)
  const visibleFolders = useMemo(() => {
    if (currentFolderId !== undefined) return []; // No subfolders in this simple structure
    return folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, searchQuery, currentFolderId]);

  // Handle file uploads
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    const newFile: PersonalFile = {
      id: `pf-${Date.now()}`,
      title: uploadTitle.endsWith(`.${uploadType}`) ? uploadTitle.trim() : `${uploadTitle.trim()}.${uploadType}`,
      type: uploadType,
      date: new Date().toISOString().split("T")[0],
      size: uploadSize || "150 KB",
      folderId: currentFolderId,
      isFavorite: false
    };

    setFiles((prev) => [newFile, ...prev]);
    setUploadTitle("");
    setShowUpload(false);
    triggerToast(`"${newFile.title}" uploaded successfully to your Personal Database.`);

    // Context Engine Suggestion Logic
    const lowerName = newFile.title.toLowerCase();
    let suggestedFolderId = "";
    let suggestedFolderName = "";

    if (lowerName.includes("assessment") || lowerName.includes("rubric") || lowerName.includes("grade") || lowerName.includes("score")) {
      const match = folders.find(f => f.category === "Assessment");
      if (match) {
        suggestedFolderId = match.id;
        suggestedFolderName = match.name;
      }
    } else if (lowerName.includes("meeting") || lowerName.includes("notes") || lowerName.includes("minutes") || lowerName.includes("session")) {
      const match = folders.find(f => f.category === "Meetings");
      if (match) {
        suggestedFolderId = match.id;
        suggestedFolderName = match.name;
      }
    } else if (lowerName.includes("university") || lowerName.includes("counselor") || lowerName.includes("admission") || lowerName.includes("college") || lowerName.includes("apply")) {
      const match = folders.find(f => f.category === "University");
      if (match) {
        suggestedFolderId = match.id;
        suggestedFolderName = match.name;
      }
    } else if (lowerName.includes("policy") || lowerName.includes("handbook") || lowerName.includes("admin") || lowerName.includes("contract")) {
      const match = folders.find(f => f.category === "Administration");
      if (match) {
        suggestedFolderId = match.id;
        suggestedFolderName = match.name;
      }
    }

    // Only trigger suggestion if suggestion matches a folder and it is NOT already in that folder
    if (suggestedFolderId && newFile.folderId !== suggestedFolderId) {
      setTimeout(() => {
        setActiveSuggestion({
          fileId: newFile.id,
          folderId: suggestedFolderId,
          folderName: suggestedFolderName,
          fileName: newFile.title
        });
      }, 500);
    }
  };

  // Perform Context Engine organizing
  const handleAcceptSuggestion = () => {
    if (!activeSuggestion) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeSuggestion.fileId ? { ...f, folderId: activeSuggestion.folderId } : f
      )
    );
    triggerToast(`"${activeSuggestion.fileName}" organized into "${activeSuggestion.folderName}" folder.`);
    setActiveSuggestion(null);
  };

  // Create Custom Folder
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: PersonalFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowCreateFolder(false);
    triggerToast(`Folder "${newFolder.name}" created successfully.`);
  };

  // Toggle Favorite Status
  const handleToggleFavorite = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  // Move File manually
  const handleMoveFile = (fileId: string, targetFolderId: string | undefined) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, folderId: targetFolderId } : f))
    );
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    triggerToast(`File moved to ${targetFolder ? `"${targetFolder.name}"` : "Root"}.`);
    setShowMoveModal(null);
  };

  // Delete actions
  const handleDeleteFile = (fileId: string, name: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    triggerToast(`"${name}" deleted permanently.`);
  };

  const handleDeleteFolder = (folderId: string, name: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Orphaned files inside folder get moved back to root
    setFiles((prev) =>
      prev.map((f) => (f.folderId === folderId ? { ...f, folderId: undefined } : f))
    );
    triggerToast(`Folder "${name}" deleted. Linked files moved to Root.`);
    if (currentFolderId === folderId) setCurrentFolderId(undefined);
  };

  // Rename actions
  const handleRenameFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameFileModal || !renameInput.trim()) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === showRenameFileModal.id ? { ...f, title: renameInput.trim() } : f))
    );
    triggerToast(`File renamed to "${renameInput.trim()}".`);
    setShowRenameFileModal(null);
    setRenameInput("");
  };

  const handleRenameFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameFolderModal || !renameInput.trim()) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === showRenameFolderModal.id ? { ...f, name: renameInput.trim() } : f))
    );
    triggerToast(`Folder renamed to "${renameInput.trim()}".`);
    setShowRenameFolderModal(null);
    setRenameInput("");
  };

  // Calculate stats
  const totalFilesCount = files.length;
  const favoritesCount = files.filter(f => f.isFavorite).length;

  return (
    <div className={`space-y-6 select-none ${isLight ? "text-black" : "text-white"}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">User Knowledge Layer</span>
          <h2 className="text-xl font-bold tracking-tight mt-0.5 font-sans">Personal Database</h2>
          <p className={`text-xs ${isLight ? "text-black/60" : "text-white/45"}`}>
            Manage your private documents, files, and reference sheets securely within Axis.
          </p>
        </div>
        
        {/* STATS BADGES */}
        <div className="flex gap-3 text-xs shrink-0">
          <div className={`px-4 py-2 rounded-xl border flex flex-col justify-center ${isLight ? "bg-black/5 border-black/5" : "bg-white/[0.02] border-white/[0.05]"}`}>
            <span className={`text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/45" : "text-white/35"}`}>Total Stored</span>
            <strong className="text-sm font-extrabold text-cyan-400">{totalFilesCount} Files</strong>
          </div>
          <div className={`px-4 py-2 rounded-xl border flex flex-col justify-center ${isLight ? "bg-black/5 border-black/5" : "bg-white/[0.02] border-white/[0.05]"}`}>
            <span className={`text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/45" : "text-white/35"}`}>Starred Files</span>
            <strong className="text-sm font-extrabold text-amber-400">{favoritesCount} Stars</strong>
          </div>
          <div className={`px-4 py-2 rounded-xl border flex flex-col justify-center ${isLight ? "bg-black/5 border-black/5" : "bg-white/[0.02] border-white/[0.05]"}`}>
            <span className={`text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/45" : "text-white/35"}`}>Vault Status</span>
            <strong className="text-sm font-extrabold text-emerald-400">Private</strong>
          </div>
        </div>
      </div>

      {/* CONTEXT ENGINE SUGGESTION BANNER */}
      <AnimatePresence>
        {activeSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className={`rounded-2xl border p-4 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              isLight
                ? "bg-cyan-50/90 border-cyan-200 text-black"
                : "bg-cyan-950/20 border-cyan-500/30 text-white"
            }`}
          >
            <div className="flex gap-3 items-center">
              <span className="size-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Context Engine Assistant</span>
                <p className="text-xs font-medium mt-0.5">
                  Analyze suggests placing <strong className="text-cyan-400">{activeSuggestion.fileName}</strong> inside the <strong className="text-cyan-400">&quot;{activeSuggestion.folderName}&quot;</strong> folder based on content type.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => setActiveSuggestion(null)}
                className={`py-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isLight ? "border-black/10 text-black/60 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/5"
                }`}
              >
                Keep in Root
              </button>
              <button
                type="button"
                onClick={handleAcceptSuggestion}
                className="py-1.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all"
              >
                Organize Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE CONTROLS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Favorites Toggle */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search private files & folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 ${
                isLight ? "bg-black/5 border-black/10 text-black" : "bg-black/45 border-white/10 text-white"
              }`}
            />
            <svg className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
          
          <button
            type="button"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterFavorites
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : isLight ? "border-black/10 hover:bg-black/5" : "border-white/10 hover:bg-white/5 text-zinc-400"
            }`}
          >
            <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            Starred Only
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateFolder(true)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              isLight ? "border-black/10 hover:bg-black/5 text-black" : "border-white/10 hover:bg-white/5 text-white"
            }`}
          >
            + Create Folder
          </button>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${styles.buttonPrimary}`}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload File
          </button>
        </div>
      </div>

      {/* BREADCRUMB & FOLDER NAVIGATION */}
      <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
        isLight ? "bg-black/5" : "bg-white/[0.02]"
      }`}>
        <div className="flex items-center gap-1.5 font-mono">
          <button
            type="button"
            onClick={() => setCurrentFolderId(undefined)}
            className="hover:text-cyan-400 transition-colors uppercase tracking-wider"
          >
            Personal Vault
          </button>
          
          {currentFolder && (
            <>
              <span className="text-zinc-500">/</span>
              <span className="text-cyan-400 uppercase tracking-wider">{currentFolder.name}</span>
            </>
          )}
        </div>
        
        {currentFolder && (
          <button
            type="button"
            onClick={() => setCurrentFolderId(undefined)}
            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Root
          </button>
        )}
      </div>

      {/* FOLDERS GRID (Only shown when at root level) */}
      {currentFolderId === undefined && (
        <div className="space-y-3">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${isLight ? "text-black/45" : "text-white/30"}`}>
            Private Folders ({visibleFolders.length})
          </span>
          {visibleFolders.length === 0 ? (
            <div className={`text-center py-6 rounded-2xl border border-dashed text-xs ${isLight ? "border-black/10 text-black/40" : "border-white/10 text-white/30"}`}>
              No custom folders matching query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {visibleFolders.map((folder) => {
                const folderFilesCount = files.filter(f => f.folderId === folder.id).length;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[110px] group ${
                      isLight
                        ? "bg-white border-black/[0.06] hover:border-black/20"
                        : "bg-black/15 border-white/[0.04] hover:border-cyan-500/30 hover:bg-black/25"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 shrink-0 flex items-center justify-center">
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                      </span>
                      
                      {/* Rename/Delete folder buttons */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Rename Folder"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRenameFolderModal(folder);
                            setRenameInput(folder.name);
                          }}
                          className={`p-1 rounded hover:bg-white/10 ${isLight ? "text-black/60" : "text-white/60"}`}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          title="Delete Folder"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id, folder.name);
                          }}
                          className={`p-1 rounded hover:bg-red-500/20 text-red-400`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider group-hover:text-cyan-400 transition-colors leading-tight">
                        {folder.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 leading-none">
                        <span>{folderFilesCount} documents</span>
                        <span>{folder.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FILES LIST */}
      <div className="space-y-3">
        <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${isLight ? "text-black/45" : "text-white/30"}`}>
          Private Files ({visibleFiles.length})
        </span>

        {visibleFiles.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 ${
            isLight ? "border-black/10 text-black/40" : "border-white/10 text-white/30"
          }`}>
            <span className="text-xl">📂</span>
            <span className="text-xs font-semibold uppercase tracking-wider leading-none">No private files found</span>
            <span className="text-[10px] text-zinc-500">Drag files here or click Upload to populate this folder.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleFiles.map((file) => {
              return (
                <div
                  key={file.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isLight
                      ? "bg-white border-black/[0.06] hover:bg-zinc-50"
                      : "bg-black/15 border-white/[0.04] hover:bg-black/25 hover:border-cyan-500/20"
                  }`}
                >
                  {/* File Metadata */}
                  <div className="flex items-center gap-3 min-w-0">
                    <FileTypeIcon type={file.type} />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold leading-tight ${isLight ? "text-black" : "text-white/95"} truncate group-hover:text-cyan-400 transition-colors`}>
                          {file.title}
                        </span>
                        {file.isFavorite && (
                          <span className="text-amber-400 leading-none">★</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 leading-none">
                        <span>{file.size}</span>
                        <span>·</span>
                        <span>Uploaded {file.date}</span>
                        {file.folderId && (
                          <>
                            <span>·</span>
                            <span className="text-cyan-400/70 font-semibold font-mono uppercase tracking-wider">
                              📁 {folders.find(f => f.id === file.folderId)?.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Star Favorite Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(file.id)}
                      className={`p-1.5 rounded-lg border transition-all text-xs font-bold uppercase ${
                        file.isFavorite
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400"
                      }`}
                      title={file.isFavorite ? "Remove Star" : "Star File"}
                    >
                      ★
                    </button>

                    {/* Move File Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowMoveModal(file)}
                      className="py-1 px-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase text-cyan-400 transition-all"
                    >
                      Move Folder
                    </button>

                    {/* Rename File Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRenameFileModal(file);
                        setRenameInput(file.title);
                      }}
                      className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 transition-all"
                      title="Rename File"
                    >
                      ✏️
                    </button>

                    {/* Delete File Trigger */}
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id, file.title)}
                      className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/20 text-[10px] font-bold text-red-400 transition-all"
                      title="Delete File"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS LAYOUT */}
      <AnimatePresence>
        
        {/* CREATE FOLDER MODAL */}
        {showCreateFolder && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowCreateFolder(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 bg-[#0E0E10] text-white shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Create Private Folder</h3>
              <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter folder name (e.g. Science HL)..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolder(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* UPLOAD FILE MODAL */}
        {showUpload && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowUpload(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 bg-[#0E0E10] text-white shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Upload Private File</h3>
              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">File Name</label>
                  <input
                    type="text"
                    placeholder="Enter document title..."
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">File Extension</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as PersonalFile["type"])}
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500"
                    >
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="doc">Word (.docx)</option>
                      <option value="xls">Excel (.xlsx)</option>
                      <option value="link">Web Link</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">File Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.2 MB"
                      value={uploadSize}
                      onChange={(e) => setUploadSize(e.target.value)}
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl font-bold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                  >
                    Confirm Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MOVE FILE MODAL */}
        {showMoveModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowMoveModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 bg-[#0E0E10] text-white shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Move file to...</h3>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Select a folder to relocate <strong className="text-white">&quot;{showMoveModal.title}&quot;</strong>:
              </p>
              
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {/* Root Option */}
                <button
                  type="button"
                  onClick={() => handleMoveFile(showMoveModal.id, undefined)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-xs font-semibold ${
                    showMoveModal.folderId === undefined ? "border-cyan-500 text-cyan-400" : "text-white"
                  }`}
                >
                  📁 Vault Root Directory
                </button>
                
                {/* Existing folders */}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleMoveFile(showMoveModal.id, folder.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-xs font-semibold ${
                      showMoveModal.folderId === folder.id ? "border-cyan-500 text-cyan-400" : "text-white"
                    }`}
                  >
                    📁 {folder.name}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(null)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl font-bold text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* RENAME FILE MODAL */}
        {showRenameFileModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowRenameFileModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 bg-[#0E0E10] text-white shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Rename File</h3>
              <form onSubmit={handleRenameFileSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter new file name..."
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameFileModal(null)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl font-bold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                  >
                    Confirm Rename
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* RENAME FOLDER MODAL */}
        {showRenameFolderModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowRenameFolderModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 p-5 bg-[#0E0E10] text-white shadow-2xl flex flex-col gap-4 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Rename Folder</h3>
              <form onSubmit={handleRenameFolderSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter new folder name..."
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameFolderModal(null)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs rounded-xl font-bold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl"
                  >
                    Confirm Rename
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
