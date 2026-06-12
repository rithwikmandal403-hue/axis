"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type RequestType = "Issue" | "Suggestion" | "Help" | "Approval" | "Feedback";

type Attachment = {
  name: string;
  source: "database" | "resources" | "captures" | "computer";
  size: string;
};

type Reply = {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
};

type UserRequest = {
  id: string;
  title: string;
  category: RequestType;
  description: string;
  dateSubmitted: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedDept: string;
  replies: Reply[];
  attachments: Attachment[];
};

export function StudentSupportFeedback({ theme = "dark" }: { theme?: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  // State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RequestType | "">("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);

  // Picker states
  const [isDbPickerOpen, setIsDbPickerOpen] = useState(false);
  const [isResPickerOpen, setIsResPickerOpen] = useState(false);
  const [isCapPickerOpen, setIsCapPickerOpen] = useState(false);

  // Context Engine suggest
  const [suggestedCategory, setSuggestedCategory] = useState<RequestType | null>(null);

  // Seeded Requests
  const [requests, setRequests] = useState<UserRequest[]>([
    {
      id: "sf-1",
      title: "DP Physics Block 2 Conflict",
      category: "Help",
      description: "My Wednesday Block 2 shows DP1 Physics HL and Math AA HL simultaneously. Need clarification on which block is correct.",
      dateSubmitted: "2026-06-10",
      priority: "high",
      status: "in_progress",
      assignedDept: "Academic Office",
      attachments: [],
      replies: [
        {
          id: "rep-1",
          author: "Sarah Thompson",
          role: "academic coordinator",
          message: "Hi Chloe, we are aware of the overlap. Dr. Sarah Chen is resolving the scheduling matrix for Grade 11-B. Expect an update by tomorrow morning.",
          timestamp: "June 11, 2026, 09:45 AM"
        }
      ]
    },
    {
      id: "sf-2",
      title: "CAS Community Garden Proposal",
      category: "Approval",
      description: "Submitting the final proposal and supervisor agreement for the Community Garden initiative under CAS Activity.",
      dateSubmitted: "2026-06-05",
      priority: "medium",
      status: "resolved",
      assignedDept: "CAS Department",
      attachments: [{ name: "cas_reflection_volunteer.txt", source: "database", size: "4 KB" }],
      replies: [
        {
          id: "rep-2",
          author: "Aarav Chen",
          role: "CAS advisor",
          message: "Hi Chloe, your proposal meets all IB CAS learning outcomes. I have approved it in the system. You can now log your weekly reflections.",
          timestamp: "June 6, 2026, 11:20 AM"
        }
      ]
    },
    {
      id: "sf-3",
      title: "S504 Projector Dim Bulbs",
      category: "Issue",
      description: "The projector in Room S504 has dim bulbs and flickers. It is hard to read physics presentation slides.",
      dateSubmitted: "2026-06-04",
      priority: "high",
      status: "resolved",
      assignedDept: "Facilities & Operations",
      attachments: [],
      replies: [
        {
          id: "rep-3",
          author: "Facilities Team",
          role: "operational lead",
          message: "A technician was dispatched this morning. The dimmer bulb has been replaced and connections verified. The display should now be steady.",
          timestamp: "June 5, 2026, 02:10 PM"
        }
      ]
    },
    {
      id: "sf-4",
      title: "Recycling Bins in Student Common Room",
      category: "Suggestion",
      description: "We should add split recycling bins in the Common Room for paper/plastic bottles. The current bin overflows quickly.",
      dateSubmitted: "2026-05-20",
      priority: "low",
      status: "closed",
      assignedDept: "Operations",
      attachments: [],
      replies: [
        {
          id: "rep-4",
          author: "Operations Support",
          role: "operational lead",
          message: "Thank you for the suggestion, Chloe. Split bins have been ordered and placed next to the main lounge. Closed.",
          timestamp: "May 25, 2026, 10:15 AM"
        }
      ]
    }
  ]);

  // Context Engine real-time suggest
  useEffect(() => {
    const text = description.toLowerCase();
    if (!text.trim()) {
      setSuggestedCategory(null);
      return;
    }

    if (
      text.includes("attendance") ||
      text.includes("broken") ||
      text.includes("incorrect") ||
      text.includes("wrong") ||
      text.includes("room") ||
      text.includes("equipment") ||
      text.includes("error") ||
      text.includes("issue")
    ) {
      setSuggestedCategory("Issue");
    } else if (
      text.includes("suggest") ||
      text.includes("idea") ||
      text.includes("improve") ||
      text.includes("feature") ||
      text.includes("should be") ||
      text.includes("proposal")
    ) {
      setSuggestedCategory("Suggestion");
    } else if (
      text.includes("help") ||
      text.includes("counselor") ||
      text.includes("counseling") ||
      text.includes("clarify") ||
      text.includes("support") ||
      text.includes("guidance")
    ) {
      setSuggestedCategory("Help");
    } else if (
      text.includes("approve") ||
      text.includes("approval") ||
      text.includes("cas") ||
      text.includes("sign")
    ) {
      setSuggestedCategory("Approval");
    } else if (
      text.includes("feedback") ||
      text.includes("course") ||
      text.includes("opinion")
    ) {
      setSuggestedCategory("Feedback");
    } else {
      setSuggestedCategory(null);
    }
  }, [description]);

  // Actions
  const handleApplySuggestion = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
    }
  };

  const handleAttachFile = (name: string, source: Attachment["source"], size: string) => {
    setSelectedAttachments((prev) => [
      ...prev.filter((a) => a.name !== name),
      { name, source, size }
    ]);
  };

  const handleRemoveAttachment = (name: string) => {
    setSelectedAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description) return;

    const newRequest: UserRequest = {
      id: `sf-${Date.now()}`,
      title,
      category,
      description,
      dateSubmitted: new Date().toISOString().split("T")[0],
      priority,
      status: "open",
      assignedDept: category === "Issue" ? "Facilities & Operations" :
                    category === "Approval" ? "Academic Office" :
                    category === "Help" ? "Counseling & Wellbeing" : "Administration Department",
      replies: [],
      attachments: selectedAttachments
    };

    setRequests([newRequest, ...requests]);
    setIsSubmitSuccess(true);
    setTimeout(() => setIsSubmitSuccess(false), 4000);

    // Reset Form
    setTitle("");
    setCategory("");
    setDescription("");
    setPriority("medium");
    setSelectedAttachments([]);
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  return (
    <div className="space-y-6 text-left normal-case">
      {/* Toast Notification */}
      <AnimatePresence>
        {isSubmitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-6 z-[999] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-3 rounded-lg text-xs font-semibold shadow-lg"
          >
            ✓ Support & Feedback request submitted successfully.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Support & Feedback Center
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold uppercase tracking-wider">
            Advisory Link
          </span>
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Submit help requests, suggest ideas, report campus issues, and track school administrative responses.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* Form Column (Col 1-2) */}
        <div className="xl:col-span-2 space-y-6">
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Submit Communication</span>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-bold uppercase block">Title Summary</label>
                <input
                  type="text"
                  required
                  placeholder="Short, descriptive summary..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none transition-all ${
                    isLight ? "bg-white border-black/10 focus:border-cyan-400" : "bg-white/[0.02] border-white/10 focus:border-cyan-400"
                  }`}
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 font-bold uppercase block">Category Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Issue", "Suggestion", "Help", "Approval", "Feedback"] as RequestType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCategory(type)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        category === type
                          ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-400"
                          : isLight
                            ? "bg-black/[0.01] border-black/[0.06] hover:bg-black/[0.02] text-black/60"
                            : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03] text-white/70"
                      }`}
                    >
                      <span className="text-[11px] font-bold block">
                        {type === "Issue" ? "⚠️ Issue Report" :
                         type === "Suggestion" ? "💡 Suggestion" :
                         type === "Help" ? "🤝 Help Request" :
                         type === "Approval" ? "📝 Approval Request" : "💬 General Feedback"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description box */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-bold uppercase block">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your request or issue here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none transition-all resize-none ${
                    isLight ? "bg-white border-black/10 focus:border-cyan-400" : "bg-white/[0.02] border-white/10 focus:border-cyan-400"
                  }`}
                />
              </div>

              {/* Context Engine suggest bar */}
              <AnimatePresence>
                {suggestedCategory && category !== suggestedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 border border-cyan-500/20 bg-cyan-500/[0.02] rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Context Engine
                      </span>
                      <span className="text-[10px] text-white/60 block mt-1">
                        Suggests classifying this as a <strong className="text-cyan-400">{suggestedCategory} Request</strong>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="px-2.5 py-1 bg-white text-black font-extrabold text-[9px] rounded-lg hover:opacity-90"
                    >
                      Apply
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attachment Picker Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase block">Link Attachments</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDbPickerOpen(!isDbPickerOpen)}
                    className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-white/20 transition-all font-semibold"
                  >
                    📁 Personal DB
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResPickerOpen(!isResPickerOpen)}
                    className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-white/20 transition-all font-semibold"
                  >
                    📚 Resources
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCapPickerOpen(!isCapPickerOpen)}
                    className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-white/20 transition-all font-semibold"
                  >
                    ✨ Captures
                  </button>
                </div>

                {/* Selected attachments list */}
                {selectedAttachments.length > 0 && (
                  <div className="p-2 border border-white/[0.04] bg-white/[0.005] rounded-xl space-y-1.5">
                    {selectedAttachments.map((att) => (
                      <div key={att.name} className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                        <span className="truncate max-w-[200px] text-white/80">{att.name} ({att.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.name)}
                          className="text-rose-500 font-bold hover:text-rose-400 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown list expansions */}
              <AnimatePresence>
                {isDbPickerOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#111113] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Add from Personal Database</span>
                    {[
                      { name: "damping_calculations.xlsx", size: "124 KB" },
                      { name: "cas_reflection_volunteer.txt", size: "4 KB" },
                      { name: "physics_olympiad_cert.pdf", size: "2.1 MB" }
                    ].map((f) => (
                      <div key={f.name} className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => { handleAttachFile(f.name, "database", f.size); setIsDbPickerOpen(false); }} className="text-cyan-400 font-bold">Link</button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {isResPickerOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#111113] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Add from School Resources</span>
                    {[
                      { name: "IB Physics Data Booklet", size: "2.1 MB" },
                      { name: "Mechanics Formula Sheet", size: "420 KB" }
                    ].map((f) => (
                      <div key={f.name} className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => { handleAttachFile(f.name, "resources", f.size); setIsResPickerOpen(false); }} className="text-cyan-400 font-bold">Link</button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {isCapPickerOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-[#111113] border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Add from Essential Space Captures</span>
                    {[
                      { name: "Physics IA Draft Outline", size: "1.2 MB" },
                      { name: "Spectrometer Graph Capture", size: "640 KB" }
                    ].map((f) => (
                      <div key={f.name} className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => { handleAttachFile(f.name, "captures", f.size); setIsCapPickerOpen(false); }} className="text-cyan-400 font-bold">Link</button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={!title || !category || !description}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-cyan-500"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Tracking Console Column (Col 3-5) */}
        <div className="xl:col-span-3 space-y-6">
          <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tracking Logs</span>
              
              {/* Status Tab Filters */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {(["all", "open", "in_progress", "resolved", "closed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 ${
                      activeTab === tab ? "bg-white text-black" : "text-white/40 hover:bg-white/5"
                    }`}
                  >
                    {tab === "in_progress" ? "In Review" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto scrollbar-none">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`py-3.5 px-3 flex items-center justify-between cursor-pointer rounded-xl transition-all border border-transparent ${
                    selectedRequest?.id === req.id
                      ? "bg-white/[0.03] border-cyan-400/20"
                      : "hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] uppercase font-bold border px-2 py-0.5 rounded-full ${
                        req.category === "Issue" ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                        req.category === "Suggestion" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                        req.category === "Help" ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" :
                        req.category === "Approval" ? "text-purple-400 border-purple-500/20 bg-purple-500/5" : "text-zinc-400 border-zinc-500/20 bg-zinc-500/5"
                      }`}>
                        {req.category}
                      </span>
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold ${
                        req.status === "open" ? "text-blue-400" :
                        req.status === "in_progress" ? "text-cyan-400" :
                        req.status === "resolved" ? "text-emerald-400" : "text-white/30"
                      }`}>
                        {req.status === "in_progress" ? "In Review" : req.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white block truncate">{req.title}</span>
                    <span className="text-[9px] text-white/30 block">
                      Submitted {req.dateSubmitted} &bull; Assigned: {req.assignedDept}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold shrink-0">View Details &rarr;</span>
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="py-12 text-center text-xs text-white/20 font-medium">
                  No submissions found matching filter.
                </div>
              )}
            </div>
          </div>

          {/* Details Panel when a Request is selected */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}
              >
                <div className="flex justify-between items-start border-b border-white/[0.04] pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-cyan-400 block tracking-wider">Request Details</span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-normal">{selectedRequest.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="opacity-50 text-[10px] uppercase font-bold">Category</span>
                    <span className="block font-semibold text-white/95 mt-0.5">{selectedRequest.category}</span>
                  </div>
                  <div>
                    <span className="opacity-50 text-[10px] uppercase font-bold">Current Status</span>
                    <span className={`block font-bold mt-0.5 uppercase tracking-wide ${
                      selectedRequest.status === "open" ? "text-blue-400" :
                      selectedRequest.status === "in_progress" ? "text-cyan-400" :
                      selectedRequest.status === "resolved" ? "text-emerald-400" : "text-white/30"
                    }`}>
                      {selectedRequest.status === "in_progress" ? "In Review" : selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-50 text-[10px] uppercase font-bold">Date Submitted</span>
                    <span className="block font-semibold text-white/95 mt-0.5">{selectedRequest.dateSubmitted}</span>
                  </div>
                  <div>
                    <span className="opacity-50 text-[10px] uppercase font-bold">Assigned Department</span>
                    <span className="block font-semibold text-white/95 mt-0.5">{selectedRequest.assignedDept}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="opacity-50 text-[10px] uppercase font-bold block">Original Message</span>
                  <p className="text-xs text-white/75 bg-white/[0.01] p-3 rounded-lg border border-white/[0.04] leading-relaxed">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Attachments within details */}
                {selectedRequest.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="opacity-50 text-[10px] uppercase font-bold block">Linked Assets</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.attachments.map((att) => (
                        <span key={att.name} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70">
                          📎 {att.name} ({att.size})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Logs */}
                <div className="space-y-2">
                  <span className="opacity-50 text-[10px] uppercase font-bold block">Response History</span>
                  {selectedRequest.replies.length > 0 ? (
                    <div className="space-y-3">
                      {selectedRequest.replies.map((rep) => (
                        <div key={rep.id} className="p-3.5 bg-cyan-500/[0.01] border border-cyan-400/10 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-white/95">{rep.author}</span>
                              <span className="text-[9px] text-cyan-400 uppercase font-bold ml-1.5 tracking-wider">{rep.role}</span>
                            </div>
                            <span className="text-[9px] text-white/30">{rep.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed italic">&ldquo;{rep.message}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 border border-dashed border-white/[0.08] text-center text-xs text-white/20 font-medium rounded-xl">
                      Waiting for initial staff review and assignment.
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
