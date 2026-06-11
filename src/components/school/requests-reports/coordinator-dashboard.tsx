"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Request, RequestStatus, RequestPriority, UserRole } from "./types";
import { ResourcePickerModal } from "../coordinator-demo/connected-resources";
import { type Theme } from "@/lib/theme-utils";

interface CoordinatorDashboardProps {
  theme?: string;
}

const INITIAL_REQUESTS: Request[] = [
  {
    id: "req-0",
    type: "technology_issue",
    category: "Technology Issue",
    reporter: {
      id: "tch-3",
      name: "Ananya Rao",
      role: "teacher",
      email: "ananya.rao@school.edu"
    },
    location: {
      type: "room",
      name: "Room S305",
      id: "s305"
    },
    description: "The ceiling-mounted projector in classroom S305 has a broken display port and needs immediate repair. Cannot run lecture slides for DP Chemistry classes.",
    dateSubmitted: "2026-06-10T09:30:00Z",
    priority: "high",
    status: "pending",
    context: {
      operationalImpact: "DP Chemistry classes are currently unable to show slide presentations."
    }
  },
  {
    id: "req-1",
    type: "facility_issue",
    category: "Facilities Issue",
    reporter: {
      id: "tch-1",
      name: "Marcus Vance",
      role: "teacher",
      email: "marcus.vance@school.edu"
    },
    location: {
      type: "room",
      name: "Room S504",
      id: "s504"
    },
    description: "Projector in Room S504 is not functioning. Display flickers and bulb is completely dim, rendering presentations impossible.",
    dateSubmitted: "2026-06-04T08:15:00Z",
    priority: "high",
    status: "in_progress",
    assignedTo: {
      id: "staff-1",
      name: "Facilities Lead",
      role: "coordinator"
    },
    context: {
      operationalImpact: "High operational impact: affecting DP Physics Grade 11 presentations and classes today.",
      affectedClasses: ["DP Physics 11A", "DP Physics 11B"]
    },
    replies: [
      {
        id: "rep-stage-1",
        author: { id: "tch-1", name: "Marcus Vance", role: "teacher" },
        message: "Reported: Projector in S504 not functioning.",
        timestamp: "2026-06-04T08:15:00Z"
      },
      {
        id: "rep-stage-2",
        author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" },
        message: "Assigned: Request delegated to Facilities Lead.",
        timestamp: "2026-06-04T09:00:00Z"
      },
      {
        id: "rep-stage-3",
        author: { id: "staff-1", name: "Facilities Lead", role: "coordinator" },
        message: "In Progress: Bulb replacements ordered, technician scheduled for tomorrow morning.",
        timestamp: "2026-06-04T11:30:00Z"
      }
    ]
  },
  {
    id: "req-2",
    type: "wellbeing_concern",
    category: "Student Leave Request",
    reporter: {
      id: "std-1",
      name: "Chloe Vance",
      role: "student",
      email: "chloe.vance@student.edu"
    },
    description: "Requesting leave of absence from Sep 10-12 to attend the Harvard Model United Nations conference in Boston.",
    dateSubmitted: "2026-06-05T07:30:00Z",
    priority: "medium",
    status: "pending",
    context: {
      operationalImpact: "Requires coverage and homework packets setup for DP courses."
    }
  },
  {
    id: "req-3",
    type: "administrative_request",
    category: "Teacher Leave Request",
    reporter: {
      id: "tch-2",
      name: "Aarav Chen",
      role: "teacher",
      email: "aarav.chen@school.edu"
    },
    description: "Personal medical scan leave request for Monday afternoon (Sep 14). Need coordination for substitute coverage.",
    dateSubmitted: "2026-06-05T06:45:00Z",
    priority: "high",
    status: "pending",
    context: {
      operationalImpact: "Affects DP Math Grade 12 periods 5 & 6."
    }
  },
  {
    id: "req-4",
    type: "general_request",
    category: "Resource Request",
    reporter: {
      id: "tch-3",
      name: "Ananya Rao",
      role: "teacher",
      email: "ananya.rao@school.edu"
    },
    description: "Requesting purchase approval for 25 additional Chemistry lab safety goggles and 5 heat-resistant protective aprons.",
    dateSubmitted: "2026-06-03T10:00:00Z",
    priority: "medium",
    status: "approved",
    context: {
      operationalImpact: "Essential for laboratory safety during upcoming IA experiments."
    },
    replies: [
      {
        id: "rep-approve-1",
        author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" },
        message: "Approved: Procurement request authorized and sent to finance team.",
        timestamp: "2026-06-03T14:30:00Z"
      }
    ]
  },
  {
    id: "req-5",
    type: "meeting_request",
    category: "Meeting Request",
    reporter: {
      id: "parent-1",
      name: "Marcus Vance Sr.",
      role: "parent",
      email: "m.vance@family.com"
    },
    description: "Requesting parent-coordinator meeting to discuss college admissions preparation support and DP alignment.",
    dateSubmitted: "2026-06-02T11:00:00Z",
    priority: "low",
    status: "resolved",
    replies: [
      {
        id: "rep-resolve-1",
        author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" },
        message: "Resolved: Meeting scheduled for Sep 8 at 10:00 AM. Zoom link shared.",
        timestamp: "2026-06-02T16:00:00Z"
      }
    ]
  },
  {
    id: "req-6",
    type: "suggestion",
    category: "Support Request",
    reporter: {
      id: "std-2",
      name: "Lucas Gray",
      role: "student",
      email: "lucas.gray@student.edu"
    },
    description: "Requesting additional peer-tutoring support channels for MYP mathematics students heading into examinations.",
    dateSubmitted: "2026-06-01T09:30:00Z",
    priority: "medium",
    status: "resolved",
    replies: [
      {
        id: "rep-resolve-2",
        author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" },
        message: "Resolved: Peer-tutoring schedule finalized. Posted to notifications bulletin.",
        timestamp: "2026-06-02T10:00:00Z"
      }
    ]
  },
  {
    id: "req-7",
    type: "club_proposal",
    category: "Special Consideration Request",
    reporter: {
      id: "std-3",
      name: "Peter Parker",
      role: "student",
      email: "peter.parker@student.edu"
    },
    description: "Requesting extension for Physics IA draft submission due to emergency hospitalization.",
    dateSubmitted: "2026-05-28T12:00:00Z",
    priority: "high",
    status: "archived",
    replies: [
      {
        id: "rep-archive-1",
        author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" },
        message: "Approved & Archived: Extension granted until Sep 15. Medical certificate received.",
        timestamp: "2026-05-28T15:00:00Z"
      }
    ]
  }
];

export function CoordinatorDashboard({ theme = "dark" }: CoordinatorDashboardProps) {
  const [activeStatus, setActiveStatus] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Reply States with Connected Resources picker
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachedFile, setReplyAttachedFile] = useState<string | null>(null);
  const [isReplyPickerOpen, setIsReplyPickerOpen] = useState(false);

  // Drag and drop states
  const [dragOverRequestId, setDragOverRequestId] = useState<string | null>(null);
  const [isDragOverReplyModal, setIsDragOverReplyModal] = useState(false);

  // Quick Resolve & Custom Actions States
  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [activeAction, setActiveAction] = useState<"decline_leave" | "inquire_leave" | "will_fix" | "consider_suggestion" | null>(null);
  const [actionText, setActionText] = useState("");

  useEffect(() => {
    setResolvingRequestId(null);
    setResolutionNote("");
    setActiveAction(null);
    setActionText("");
  }, [selectedRequest]);

  const [newRequestText, setNewRequestText] = useState("");
  const [newRequestCategory, setNewRequestCategory] = useState("Facilities Issue");
  const [isSuggestionApplied, setIsSuggestionApplied] = useState(false);
  const [isSuggestHovered, setIsSuggestHovered] = useState(false);
  const [suggestCoords, setSuggestCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isSuggestMounted, setIsSuggestMounted] = useState(false);
  const suggestTriggerRef = useRef<HTMLDivElement>(null);
  const suggestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsSuggestMounted(true);
    return () => {
      if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
    };
  }, []);

  const updateSuggestCoords = () => {
    if (suggestTriggerRef.current) {
      const rect = suggestTriggerRef.current.getBoundingClientRect();
      setSuggestCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    if (!isSuggestHovered) return;
    updateSuggestCoords();

    window.addEventListener("scroll", updateSuggestCoords, { capture: true });
    window.addEventListener("resize", updateSuggestCoords);
    return () => {
      window.removeEventListener("scroll", updateSuggestCoords, { capture: true });
      window.removeEventListener("resize", updateSuggestCoords);
    };
  }, [isSuggestHovered]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [requests, setRequests] = useState<Request[]>(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("axis-requests");
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_REQUESTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("axis-requests", JSON.stringify(requests));
    }
  }, [requests]);

  useEffect(() => {
    const handleCreateRequest = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.request) {
        const newReq = customEvent.detail.request;
        setRequests((prev) => {
          if (prev.some(r => r.id === newReq.id || r.description === newReq.description)) {
            return prev;
          }
          return [
            {
              id: newReq.id || `req-context-${Date.now()}`,
              type: newReq.type || "facility_issue",
              category: newReq.category || "Facilities Issue",
              reporter: {
                id: newReq.reporterId || "tch-1",
                name: newReq.reporterName || "Aarav Chen",
                role: newReq.reporterRole || "teacher",
                email: newReq.reporterEmail || "aarav.chen@axis.edu"
              },
              location: {
                type: "room",
                name: newReq.location || "Room S504",
                id: newReq.locationId || "s504"
              },
              description: newReq.description,
              dateSubmitted: new Date().toISOString(),
              priority: newReq.priority || "high",
              status: "pending",
              context: {
                operationalImpact: newReq.operationalImpact || "Reported via Context Engine."
              }
            },
            ...prev
          ];
        });
      }
    };

    window.addEventListener("axis-context-create-request", handleCreateRequest);
    return () => {
      window.removeEventListener("axis-context-create-request", handleCreateRequest);
    };
  }, []);

  const statusTabs = [
    { id: "pending", label: "Pending" },
    { id: "in_progress", label: "In Progress" },
    { id: "approved", label: "Approved" },
    { id: "resolved", label: "Resolved" },
    { id: "archived", label: "Archived" }
  ];

  const getRequestsForTab = (tabId: string) => {
    return requests.filter(r => {
      if (tabId === "pending") return r.status === "pending" || r.status === "new";
      if (tabId === "resolved") return r.status === "resolved" || r.status === "rejected";
      return r.status === tabId;
    });
  };

  const filteredRequests = getRequestsForTab(activeStatus);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "pending":
      case "new": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "resolved": return "bg-cyan-400/15 text-cyan-300 border-cyan-500/20";
      case "archived": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case "low": return "text-zinc-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-orange-400";
      case "urgent": return "text-red-400";
    }
  };

  const handleStatusChange = (requestId: string, newStatus: RequestStatus, decisionText?: string) => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        const newReply = {
          id: `reply-status-${Date.now()}`,
          author: {
            id: "coord-1",
            name: "Ms. Sarah Thompson",
            role: "coordinator" as UserRole
          },
          timestamp: new Date().toISOString(),
          message: decisionText || `Status changed to ${newStatus.replace("_", " ")}.`
        };
        const updatedReq = {
          ...r,
          status: newStatus,
          replies: [...(r.replies || []), newReply]
        };
        // Keep selected request synched
        if (selectedRequest && selectedRequest.id === requestId) {
          setSelectedRequest(updatedReq);
        }
        return updatedReq;
      }
      return r;
    });
    setRequests(updated);
    window.sessionStorage.setItem("axis-requests", JSON.stringify(updated));
    triggerToast(`Request updated to ${newStatus.replace("_", " ")}.`);
  };

  const handleReply = (requestId: string) => {
    setSelectedRequest(requests.find(r => r.id === requestId) || null);
    setShowReplyModal(true);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedRequest) return;

    const messageText = replyAttachedFile 
      ? `${replyMessage}\n\n📎 Attached Document: ${replyAttachedFile}`
      : replyMessage;

    const newReply = {
      id: `reply-${Date.now()}`,
      author: {
        id: "coord-1",
        name: "Ms. Sarah Thompson",
        role: "coordinator" as UserRole
      },
      timestamp: new Date().toISOString(),
      message: messageText
    };

    const updatedRequests = requests.map(r => {
      if (r.id === selectedRequest.id) {
        const updated = {
          ...r,
          replies: [...(r.replies || []), newReply]
        };
        setSelectedRequest(updated);
        return updated;
      }
      return r;
    });

    setRequests(updatedRequests);
    window.sessionStorage.setItem("axis-requests", JSON.stringify(updatedRequests));

    setReplyMessage("");
    setReplyAttachedFile(null);
    setShowReplyModal(false);
    triggerToast("Reply dispatched successfully.");
  };

  // Stepper Stage Calculation for Issue Tracking
  const getStageStep = (request: Request) => {
    if (request.status === "archived") return 5;
    if (request.status === "resolved") return 4;
    if (request.status === "in_progress") return 3;
    if (request.assignedTo) return 2;
    return 1; // Reported
  };

  const getCategoryGroup = (request: Request): "ISSUE" | "REQUEST" | "INFORMATION_SUPPORT" => {
    const categoryLower = request.category?.toLowerCase() || "";
    const typeLower = request.type?.toLowerCase() || "";

    // 1. ISSUE
    if (
      categoryLower.includes("facilities issue") ||
      categoryLower.includes("maintenance request") ||
      categoryLower.includes("broken projector") ||
      categoryLower.includes("network failure") ||
      categoryLower.includes("facility problem") ||
      categoryLower.includes("technical problem") ||
      categoryLower.includes("equipment malfunction") ||
      typeLower.includes("facility_issue") ||
      typeLower.includes("technology_issue") ||
      typeLower.includes("equipment_issue") ||
      typeLower.includes("maintenance_request")
    ) {
      return "ISSUE";
    }

    // 2. INFORMATION / SUPPORT
    if (
      categoryLower.includes("support request") ||
      categoryLower.includes("question") ||
      categoryLower.includes("clarification") ||
      categoryLower.includes("guidance request") ||
      categoryLower.includes("administrative inquiry") ||
      categoryLower.includes("student support inquiry") ||
      categoryLower.includes("advice request") ||
      categoryLower.includes("suggestion") ||
      typeLower.includes("suggestion") ||
      typeLower.includes("wellbeing_concern")
    ) {
      return "INFORMATION_SUPPORT";
    }

    // 3. REQUEST
    if (
      categoryLower.includes("leave") ||
      categoryLower.includes("resource") ||
      categoryLower.includes("booking") ||
      categoryLower.includes("permission") ||
      categoryLower.includes("extension") ||
      categoryLower.includes("proposal") ||
      categoryLower.includes("request") ||
      typeLower.includes("meeting_request") ||
      typeLower.includes("general_request")
    ) {
      return "REQUEST";
    }

    return "INFORMATION_SUPPORT";
  };

  const getRequestSubtype = (request: Request): "LEAVE" | "ISSUE" | "SUGGESTION" | "GENERAL" => {
    const categoryLower = request.category?.toLowerCase() || "";
    const typeLower = request.type?.toLowerCase() || "";
    const descLower = request.description?.toLowerCase() || "";

    if (categoryLower.includes("leave") || descLower.includes("leave of absence")) {
      return "LEAVE";
    }

    if (
      categoryLower.includes("facilities") ||
      categoryLower.includes("maintenance") ||
      categoryLower.includes("projector") ||
      typeLower.includes("facility_issue") ||
      typeLower.includes("technology_issue") ||
      typeLower.includes("equipment_issue") ||
      typeLower.includes("maintenance_request")
    ) {
      return "ISSUE";
    }

    if (
      typeLower.includes("suggestion") ||
      typeLower.includes("feedback") ||
      categoryLower.includes("suggestion") ||
      categoryLower.includes("feedback")
    ) {
      return "SUGGESTION";
    }

    return "GENERAL";
  };

  const isIssueRequest = (request: Request) => {
    return getRequestSubtype(request) === "ISSUE";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Requests & Resolutions</h2>
            <p className="text-xs text-white/40 mt-0.5">Manage requests, approvals & records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-white/30 block">Total Records</span>
              <span className="text-lg font-bold text-cyan-400">{requests.length}</span>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeStatus === tab.id
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[8px]">
                {getRequestsForTab(tab.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-white/30 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <span className="text-2xl mb-2 block">No requests found</span>
                <span className="text-xs">No records correspond to the selected operational category.</span>
              </div>
            ) : (
               filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer axis-drop-target ${
                    selectedRequest?.id === request.id
                      ? "bg-white/[0.03] border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                  } ${
                    dragOverRequestId === request.id
                      ? "ring-2 ring-cyan-400 border-cyan-400/50 bg-cyan-950/20 scale-[1.01]"
                      : ""
                  }`}
                  onClick={() => setSelectedRequest(request)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverRequestId(request.id);
                  }}
                  onDragLeave={() => {
                    setDragOverRequestId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverRequestId(null);
                    try {
                      const data = e.dataTransfer.getData("application/json");
                      if (data) {
                        const item = JSON.parse(data);
                        if (item && item.title) {
                          setSelectedRequest(request);
                          setReplyAttachedFile(item.title);
                          if (item.content) {
                            setReplyMessage((prev) => 
                              prev ? `${prev}\n\n[Note Content: ${item.content}]` : `[Note Content: ${item.content}]`
                            );
                          }
                          setShowReplyModal(true);
                          triggerToast(`Selected request & attached "${item.title}" to reply.`);
                        }
                      }
                    } catch (err) {
                      console.error("Failed to drop item on request card", err);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${getStatusColor(request.status)}`}>
                          {request.status.replace("_", " ")}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mb-1">{request.category}</h3>
                      <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">{request.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 text-[9px] text-white/40">
                      <span className="font-semibold text-white/60">{request.reporter.name}</span>
                      <span>•</span>
                      <span className="capitalize">{request.reporter.role}</span>
                      {request.location && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">{request.location.name}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-white/30">
                      {new Date(request.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>

                  {request.context?.operationalImpact && (
                    <div className="mt-2.5 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] text-amber-400/80 block font-medium">
                        ⚠️ Impact: {request.context.operationalImpact}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Request Detail & Workflow Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedRequest ? (
                <motion.div
                  key={selectedRequest.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase border ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-white/40 hover:text-white text-xs font-bold px-1 py-0.5 rounded hover:bg-white/5 transition-all"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{selectedRequest.category}</h3>
                    <span className={`text-[9px] font-extrabold uppercase ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority} Priority Level
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px] p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <div>
                      <span className="text-white/35 block">Reporter Context</span>
                      <span className="text-white font-semibold">{selectedRequest.reporter.name}</span>
                      <span className="text-white/40 ml-1.5 uppercase text-[8px] tracking-wider font-semibold">({selectedRequest.reporter.role})</span>
                    </div>
                    {selectedRequest.location && (
                      <div>
                        <span className="text-white/35 block">Physical Location</span>
                        <span className="text-cyan-400 font-semibold">{selectedRequest.location.name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-white/35 block">Date Logged</span>
                      <span className="text-white font-medium">{new Date(selectedRequest.dateSubmitted).toLocaleString()}</span>
                    </div>
                    {selectedRequest.assignedTo && (
                      <div>
                        <span className="text-white/35 block">Active Owner</span>
                        <span className="text-cyan-400 font-semibold">{selectedRequest.assignedTo.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stepper Timeline for Issues */}
                  {isIssueRequest(selectedRequest) && (
                    <div className="p-3.5 rounded-xl border border-white/[0.04] bg-[#0A0C10]/40 space-y-3">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block font-extrabold">Issue Progress Timeline</span>
                      <div className="flex items-center justify-between text-[8px] font-bold text-white/50 relative px-2.5">
                        {/* Track Line */}
                        <div className="absolute top-2.5 left-[20px] right-[20px] h-0.5 bg-white/10 z-0">
                          <div 
                            className="h-full bg-cyan-500 transition-all duration-300" 
                            style={{ width: `${((getStageStep(selectedRequest) - 1) / 4) * 100}%` }}
                          />
                        </div>
                        
                        {/* Steps */}
                        {["Reported", "Assigned", "In Progress", "Resolved", "Archived"].map((stepLabel, idx) => {
                          const stepNum = idx + 1;
                          const isActive = getStageStep(selectedRequest) >= stepNum;
                          return (
                            <div key={stepLabel} className="flex flex-col items-center gap-1.5 z-10">
                              <div className={`size-5 rounded-full flex items-center justify-center border text-[8px] transition-all font-mono ${
                                isActive 
                                  ? "bg-cyan-950 border-cyan-500 text-cyan-400 font-extrabold" 
                                  : "bg-zinc-950 border-white/10 text-white/30"
                              }`}>
                                {stepNum}
                              </div>
                              <span className={isActive ? "text-cyan-400 font-extrabold" : "text-white/30 font-medium"}>{stepLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-white/35 text-[10px] block mb-1">Details & Description</span>
                    <p className="text-xs text-white/80 leading-relaxed font-medium bg-white/[0.01] p-3 rounded-xl border border-white/[0.03]">
                      {selectedRequest.description}
                    </p>
                  </div>

                  {selectedRequest.context?.operationalImpact && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] text-amber-400/80 block mb-0.5 font-bold uppercase tracking-wider">Operational Alert</span>
                      <p className="text-[10px] text-amber-400/75 leading-relaxed">{selectedRequest.context.operationalImpact}</p>
                    </div>
                  )}

                  {/* Operational Decision Workflow Panel */}
                  <div className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-3">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block font-extrabold">Workflow Actions</span>
                    
                    {(() => {
                      const categoryGroup = getCategoryGroup(selectedRequest);
                      const isArchived = selectedRequest.status === "archived";
                      
                      if (isArchived) {
                        return (
                          <p className="text-[10px] text-zinc-500 font-medium italic text-center py-2">
                            This {categoryGroup.toLowerCase().replace("_", " / ")} has been archived. No further actions are available.
                          </p>
                        );
                      }

                      // Define helper buttons to reuse
                      const renderAssignButton = (fullWidth: boolean = false) => (
                        <button
                          onClick={() => {
                            const assigneeName = prompt("Enter assignee name (e.g. Facilities Lead, IT Coordinator):");
                            if (assigneeName) {
                              const updated = requests.map(r => {
                                if (r.id === selectedRequest.id) {
                                  const newReply = {
                                    id: `reply-assign-${Date.now()}`,
                                    author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" as UserRole },
                                    message: `Assigned task to ${assigneeName}.`,
                                    timestamp: new Date().toISOString()
                                  };
                                  const updatedReq = {
                                    ...r,
                                    status: r.status === "pending" || r.status === "new" ? "in_progress" : r.status,
                                    assignedTo: { id: `assigned-${Date.now()}`, name: assigneeName, role: "coordinator" as UserRole },
                                    replies: [...(r.replies || []), newReply]
                                  };
                                  setSelectedRequest(updatedReq);
                                  return updatedReq;
                                }
                                return r;
                              });
                              setRequests(updated);
                              window.sessionStorage.setItem("axis-requests", JSON.stringify(updated));
                              triggerToast(`Assigned to ${assigneeName}.`);
                            }
                          }}
                          className={`${fullWidth ? "w-full" : "flex-grow"} py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-all uppercase`}
                        >
                          Assign
                        </button>
                      );

                      const renderReplyButton = (fullWidth: boolean = false) => (
                        <button
                          onClick={() => handleReply(selectedRequest.id)}
                          className={`${fullWidth ? "w-full" : "flex-grow"} py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-all uppercase`}
                        >
                          Add Reply
                        </button>
                      );

                      const renderEscalateButton = () => (
                        <button
                          onClick={() => {
                            const updated = requests.map(r => {
                              if (r.id === selectedRequest.id) {
                                const newReply = {
                                  id: `reply-escalate-${Date.now()}`,
                                  author: { id: "coord-1", name: "Sarah Thompson", role: "coordinator" as UserRole },
                                  message: "Escalated: High-level administrative review requested.",
                                  timestamp: new Date().toISOString()
                                };
                                const updatedReq = {
                                  ...r,
                                  priority: "urgent" as RequestPriority,
                                  replies: [...(r.replies || []), newReply]
                                };
                                setSelectedRequest(updatedReq);
                                return updatedReq;
                              }
                              return r;
                            });
                            setRequests(updated);
                            window.sessionStorage.setItem("axis-requests", JSON.stringify(updated));
                            triggerToast("Request escalated to administrative level.");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[9px] font-bold uppercase hover:bg-orange-500/25 transition-all"
                        >
                          Escalate
                        </button>
                      );

                      const renderArchiveButton = () => (
                        <button
                          onClick={() => handleStatusChange(selectedRequest.id, "archived", "Archived request.")}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-[9px] font-bold uppercase hover:bg-zinc-500/20 transition-all"
                        >
                          Archive Request
                        </button>
                      );

                      if (resolvingRequestId === selectedRequest.id) {
                        return (
                          <div className="p-3 bg-white/[0.02] border border-cyan-500/20 rounded-xl space-y-3">
                            <div>
                              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block">
                                {categoryGroup === "INFORMATION_SUPPORT" ? "Close Conversation" : "Resolve Request"}
                              </span>
                              <span className="text-[9px] text-white/40 block mt-0.5">
                                Add an optional resolution note or confirm completion immediately.
                              </span>
                            </div>
                            <textarea
                              value={resolutionNote}
                              onChange={(e) => setResolutionNote(e.target.value)}
                              placeholder="e.g. Projector restarted. Functioning normally."
                              className="w-full h-16 bg-[#09090b] border border-white/10 rounded-lg p-2 text-[11px] text-white/95 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none font-medium"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const finalNote = resolutionNote.trim() 
                                    ? resolutionNote.trim() 
                                    : (categoryGroup === "INFORMATION_SUPPORT" ? "Closed conversation context." : "Resolved and completed by Ms. Thompson.");
                                  handleStatusChange(selectedRequest.id, "resolved", finalNote);
                                  setResolvingRequestId(null);
                                  setResolutionNote("");
                                }}
                                className="flex-1 py-2 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all"
                              >
                                {categoryGroup === "INFORMATION_SUPPORT" ? "Confirm Close" : "Confirm Resolution"}
                              </button>
                              <button
                                onClick={() => {
                                  setResolvingRequestId(null);
                                  setResolutionNote("");
                                }}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      const subtype = getRequestSubtype(selectedRequest);

                      if (subtype === "LEAVE") {
                        if (selectedRequest.status === "pending" || selectedRequest.status === "new") {
                          return (
                            <div className="space-y-3">
                              {activeAction === null ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => handleStatusChange(selectedRequest.id, "approved", "Leave request approved by Coordinator Ms. Sarah Thompson.")}
                                      className="py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-emerald-400 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                                    >
                                      Approve Leave
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveAction("decline_leave");
                                        setActionText("");
                                      }}
                                      className="py-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase hover:bg-rose-500/30 transition-all"
                                    >
                                      Decline Leave
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveAction("inquire_leave");
                                      setActionText("");
                                    }}
                                    className="w-full py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-extrabold uppercase hover:bg-cyan-500/20 transition-all"
                                  >
                                    Inquire & Ask Details
                                  </button>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {renderAssignButton()}
                                    {renderReplyButton()}
                                  </div>
                                </div>
                              ) : activeAction === "decline_leave" ? (
                                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide block">Decline Leave Request</span>
                                  <textarea
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="Specify reason for decline (e.g. scheduling conflicts, exams)..."
                                    className="w-full h-16 bg-[#09090b] border border-white/10 rounded-lg p-2 text-[11px] text-white/95 placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 resize-none font-medium"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const finalReason = actionText.trim() ? actionText.trim() : "Declined due to scheduling policy.";
                                        handleStatusChange(selectedRequest.id, "rejected", `Decline note from Ms. Thompson: "${finalReason}"`);
                                        setActiveAction(null);
                                      }}
                                      className="flex-grow py-2 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold uppercase hover:bg-rose-500 transition-all"
                                    >
                                      Confirm Decline
                                    </button>
                                    <button
                                      onClick={() => setActiveAction(null)}
                                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : activeAction === "inquire_leave" ? (
                                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block">Inquire & Ask Details</span>
                                  <textarea
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="Ask about details (why and when, scheduling issues)..."
                                    className="w-full h-16 bg-[#09090b] border border-white/10 rounded-lg p-2 text-[11px] text-white/95 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none font-medium"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const finalMsg = actionText.trim() ? actionText.trim() : "Please provide more details on the exact dates and cover required.";
                                        const newReply = {
                                          id: `reply-inquiry-${Date.now()}`,
                                          author: { id: "coord-1", name: "Ms. Sarah Thompson", role: "coordinator" as UserRole },
                                          timestamp: new Date().toISOString(),
                                          message: `Information Request: "${finalMsg}"`
                                        };
                                        const updated = requests.map(r => {
                                          if (r.id === selectedRequest.id) {
                                            const updatedReq = { ...r, replies: [...(r.replies || []), newReply] };
                                            setSelectedRequest(updatedReq);
                                            return updatedReq;
                                          }
                                          return r;
                                        });
                                        setRequests(updated);
                                        window.sessionStorage.setItem("axis-requests", JSON.stringify(updated));
                                        triggerToast("Clarification request sent.");
                                        setActiveAction(null);
                                      }}
                                      className="flex-grow py-2 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all"
                                    >
                                      Send Inquiry
                                    </button>
                                    <button
                                      onClick={() => setActiveAction(null)}
                                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        } else if (selectedRequest.status === "approved" || selectedRequest.status === "rejected") {
                          return (
                            <div className="space-y-2.5">
                              {renderArchiveButton()}
                              {renderReplyButton(true)}
                            </div>
                          );
                        }
                      }

                      if (subtype === "ISSUE") {
                        if (selectedRequest.status === "pending" || selectedRequest.status === "new" || selectedRequest.status === "in_progress") {
                          return (
                            <div className="space-y-3">
                              {activeAction === null ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setActiveAction("will_fix");
                                      setActionText("");
                                    }}
                                    className="w-full py-2.5 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
                                  >
                                    Mark &quot;Will Be Fixed&quot;
                                  </button>
                                  <button
                                    onClick={() => setResolvingRequestId(selectedRequest.id)}
                                    className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase hover:bg-emerald-500/30 transition-all"
                                  >
                                    Resolve Issue
                                  </button>
                                  <div className="grid grid-cols-3 gap-2">
                                    {renderAssignButton()}
                                    {renderReplyButton()}
                                    {renderEscalateButton()}
                                  </div>
                                </div>
                              ) : activeAction === "will_fix" ? (
                                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block">Mark &quot;Will Be Fixed&quot; &amp; Contact Staff</span>
                                  <textarea
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="Add notes for the reporter (e.g. facilities technician has been contacted)..."
                                    className="w-full h-16 bg-[#09090b] border border-white/10 rounded-lg p-2 text-[11px] text-white/95 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none font-medium"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const noteStr = actionText.trim() ? ` Notes: "${actionText.trim()}"` : "";
                                        const finalMsg = `This issue will be fixed. The right department/staff has been contacted.${noteStr}`;
                                        handleStatusChange(selectedRequest.id, "in_progress", finalMsg);
                                        setActiveAction(null);
                                      }}
                                      className="flex-grow py-2 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all"
                                    >
                                      Confirm action
                                    </button>
                                    <button
                                      onClick={() => setActiveAction(null)}
                                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        } else if (selectedRequest.status === "resolved") {
                          return (
                            <div className="space-y-2.5">
                              {renderArchiveButton()}
                              {renderReplyButton(true)}
                            </div>
                          );
                        }
                      }

                      if (subtype === "SUGGESTION") {
                        if (selectedRequest.status === "pending" || selectedRequest.status === "new" || selectedRequest.status === "in_progress") {
                          return (
                            <div className="space-y-3">
                              {activeAction === null ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      setActiveAction("consider_suggestion");
                                      setActionText("");
                                    }}
                                    className="w-full py-2.5 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
                                  >
                                    Mark &quot;Taken into Consideration&quot;
                                  </button>
                                  <div className="grid grid-cols-3 gap-2">
                                    <button
                                      onClick={() => {
                                        const reason = prompt("Enter decline reason:");
                                        if (reason !== null) {
                                          handleStatusChange(selectedRequest.id, "rejected", `Declined suggestion. Reason: ${reason || "Not specified."}`);
                                        }
                                      }}
                                      className="py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase hover:bg-rose-500/25 transition-all text-center"
                                    >
                                      Decline
                                    </button>
                                    {renderAssignButton()}
                                    {renderReplyButton()}
                                  </div>
                                </div>
                              ) : activeAction === "consider_suggestion" ? (
                                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2.5">
                                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block">Mark &quot;Taken into Consideration&quot;</span>
                                  <textarea
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="Add feedback for the suggestion (e.g. taken into account for future scheduling adjustments)..."
                                    className="w-full h-16 bg-[#09090b] border border-white/10 rounded-lg p-2 text-[11px] text-white/95 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none font-medium"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const noteStr = actionText.trim() ? ` Details: "${actionText.trim()}"` : "";
                                        const finalMsg = `This suggestion has been taken into consideration.${noteStr}`;
                                        handleStatusChange(selectedRequest.id, "resolved", finalMsg);
                                        setActiveAction(null);
                                      }}
                                      className="flex-grow py-2 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-cyan-400 transition-all"
                                    >
                                      Confirm Action
                                    </button>
                                    <button
                                      onClick={() => setActiveAction(null)}
                                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        } else if (selectedRequest.status === "resolved" || selectedRequest.status === "approved" || selectedRequest.status === "rejected") {
                          return (
                            <div className="space-y-2.5">
                              {renderArchiveButton()}
                              {renderReplyButton(true)}
                            </div>
                          );
                        }
                      }

                      if (subtype === "GENERAL") {
                        if (selectedRequest.status === "pending" || selectedRequest.status === "new" || selectedRequest.status === "in_progress") {
                          return (
                            <div className="space-y-2.5">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleStatusChange(selectedRequest.id, "approved", "Approved by Coordinator Ms. Sarah Thompson.")}
                                  className="px-2.5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-[10px] font-extrabold uppercase hover:bg-emerald-400 transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (reason !== null) {
                                      handleStatusChange(selectedRequest.id, "rejected", `Rejected. Reason: ${reason || "Not specified."}`);
                                    }
                                  }}
                                  className="px-2.5 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase hover:bg-red-500/30 transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const msg = prompt("Enter details/clarification request message:");
                                  if (msg) {
                                    handleStatusChange(selectedRequest.id, "pending", `Coordinator requested clarification: "${msg}"`);
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase hover:bg-amber-500/20 transition-all"
                              >
                                Request Information
                              </button>
                              <div className="flex gap-2">
                                {renderAssignButton()}
                                {renderReplyButton()}
                              </div>
                            </div>
                          );
                        } else if (selectedRequest.status === "approved" || selectedRequest.status === "rejected" || selectedRequest.status === "resolved") {
                          return (
                            <div className="space-y-2.5">
                              {renderArchiveButton()}
                              {renderReplyButton(true)}
                            </div>
                          );
                        }
                      }

                      return null;
                    })()}
                  </div>

                  {/* Decision & Action Audit Log */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-extrabold">Decision & Action Log</span>
                      <span className="text-[8px] text-white/30 font-semibold uppercase">{selectedRequest.replies?.length || 0} entries</span>
                    </div>
                    <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                      {selectedRequest.replies && selectedRequest.replies.length > 0 ? (
                        selectedRequest.replies.map((reply) => (
                          <div key={reply.id} className="pl-6 relative">
                            {/* Timeline Dot */}
                            <div className="absolute left-[5px] top-1.5 size-1.5 rounded-full bg-cyan-950 border border-cyan-400 z-10" />
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-bold text-white/80">{reply.author.name}</span>
                              <span className="text-[8px] text-white/30">{new Date(reply.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed italic">&quot;{reply.message}&quot;</p>
                          </div>
                        ))
                      ) : (
                        <div className="pl-6 text-[10px] text-white/30 italic">No actions logged yet.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-left"
                >
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] shadow-lg space-y-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest leading-none">Simulation Console</span>
                      <h3 className="text-sm font-bold text-white mt-1.5">Submit Operations Request</h3>
                      <p className="text-[10px] text-white/40 mt-0.5">Simulate teacher or staff logging an operational issue.</p>
                    </div>

                    <div className="space-y-3 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/45 block">Description</label>
                        <textarea
                          rows={3}
                          value={newRequestText}
                          onChange={(e) => {
                            setNewRequestText(e.target.value);
                            if (isSuggestionApplied && !e.target.value.toLowerCase().includes("projector")) {
                              setIsSuggestionApplied(false);
                            }
                          }}
                          placeholder="e.g. Projector in S504 has stop functioning."
                          className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none transition-all resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] uppercase tracking-wider text-white/45 block">Category Classification</label>
                          {newRequestText.toLowerCase().includes("projector") && !isSuggestionApplied && (
                            <div
                              ref={suggestTriggerRef}
                              className="relative"
                              onMouseEnter={() => {
                                if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
                                updateSuggestCoords();
                                setIsSuggestHovered(true);
                              }}
                              onMouseLeave={() => {
                                suggestTimeoutRef.current = setTimeout(() => {
                                  setIsSuggestHovered(false);
                                }, 150);
                              }}
                            >
                              <span className="cursor-help text-[9px] font-extrabold uppercase tracking-wider text-cyan-400 animate-pulse flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                ✨ Auto Classification Detected
                              </span>
                              {isSuggestMounted && typeof document !== "undefined" && createPortal(
                                <AnimatePresence>
                                  {isSuggestHovered && suggestCoords ? (
                                    <motion.div
                                      key="suggest-panel"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.15 }}
                                      onMouseEnter={() => {
                                        if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
                                      }}
                                      onMouseLeave={() => {
                                        suggestTimeoutRef.current = setTimeout(() => {
                                          setIsSuggestHovered(false);
                                        }, 150);
                                      }}
                                      className="fixed z-[9999] p-4 rounded-xl border border-cyan-500/30 bg-[#0E0E10] shadow-2xl w-60 text-left flex flex-col gap-2 pointer-events-auto"
                                      style={{
                                        left: `${suggestCoords.left + suggestCoords.width}px`,
                                        top: `${suggestCoords.top}px`,
                                        transform: "translate(-100%, -100%)",
                                        marginTop: "-8px",
                                        filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.6))",
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">Context Scraped</span>
                                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">
                                          Facilities Issue
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-white/70 leading-normal">
                                        Axis detected a hardware/facilities issue. Classify under &quot;Facilities Issue&quot;?
                                      </p>
                                      <div className="flex gap-2.5 mt-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewRequestCategory("Facilities Issue");
                                            setIsSuggestionApplied(true);
                                            setIsSuggestHovered(false);
                                            triggerToast("Category classified under Facilities.");
                                          }}
                                          className="px-2.5 py-1.5 rounded bg-cyan-500 text-black text-[9px] font-extrabold hover:bg-cyan-400 transition-colors uppercase tracking-wider text-center flex-1 cursor-pointer"
                                        >
                                          Apply
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsSuggestionApplied(true);
                                            setIsSuggestHovered(false);
                                          }}
                                          className="px-2.5 py-1.5 rounded bg-white/10 text-white/70 text-[9px] font-bold hover:bg-white/20 transition-colors uppercase tracking-wider text-center flex-1 cursor-pointer"
                                        >
                                          Ignore
                                        </button>
                                      </div>
                                    </motion.div>
                                  ) : null}
                                </AnimatePresence>,
                                document.body
                              )}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            value={newRequestCategory}
                            onChange={(e) => setNewRequestCategory(e.target.value)}
                            className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-white focus:outline-none transition-all font-semibold"
                          >
                            <option value="Facilities Issue">Facilities Issue</option>
                            <option value="Student Leave Request">Student Leave Request</option>
                            <option value="Teacher Leave Request">Teacher Leave Request</option>
                            <option value="Resource Request">Resource Request</option>
                            <option value="Meeting Request">Meeting Request</option>
                            <option value="Support Request">Support Request</option>
                            <option value="Special Consideration Request">Special Consideration Request</option>
                          </select>
                          {isSuggestionApplied && newRequestCategory === "Facilities Issue" && (
                            <span className="absolute right-8 top-2.5 px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">
                              Suggested
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newRequestText.trim()) return;
                          setRequests((prev) => [
                            {
                              id: `req-sim-${Date.now()}`,
                              type: newRequestCategory === "Facilities Issue" ? "facility_issue" : "technology_issue",
                              category: newRequestCategory,
                              reporter: {
                                id: "staff-coord",
                                name: "Sarah Thompson",
                                role: "coordinator",
                                email: "sarah.thompson@axis.edu"
                              },
                              location: {
                                type: "facility",
                                name: newRequestCategory === "Facilities Issue" ? "Room S504" : "Science Lab 3"
                              },
                              description: newRequestText,
                              dateSubmitted: new Date().toISOString(),
                              priority: "high",
                              status: "pending",
                              context: {
                                operationalImpact: "Simulated log via dashboard."
                              }
                            },
                            ...prev
                          ]);
                          setNewRequestText("");
                          setIsSuggestionApplied(false);
                          triggerToast("Operational Request submitted.");
                        }}
                        className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-white/90 transition-all uppercase cursor-pointer"
                      >
                        Submit Request
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reply Submission Modal */}
      <AnimatePresence>
        {showReplyModal && selectedRequest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setShowReplyModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverReplyModal(true);
              }}
              onDragLeave={() => {
                setIsDragOverReplyModal(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverReplyModal(false);
                try {
                  const data = e.dataTransfer.getData("application/json");
                  if (data) {
                    const item = JSON.parse(data);
                    if (item && item.title) {
                      setReplyAttachedFile(item.title);
                      if (item.content) {
                        setReplyMessage((prev) => 
                          prev ? `${prev}\n\n[Note Content: ${item.content}]` : `[Note Content: ${item.content}]`
                        );
                      }
                      triggerToast(`Attached "${item.title}" to reply.`);
                    }
                  }
                } catch (err) {
                  console.error("Failed to drop item in reply modal", err);
                }
              }}
              className={`relative w-full max-w-md border p-6 rounded-2xl shadow-2xl z-10 text-white bg-[#0E0E10] border-white/10 space-y-4 axis-drop-target transition-all duration-200 ${
                isDragOverReplyModal ? "ring-2 ring-cyan-400 border-cyan-400/50 bg-cyan-950/10 scale-[1.01]" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400 block font-mono">Operations Portal</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Reply to Request</h3>
                </div>
                <button onClick={() => setShowReplyModal(false)} className="text-white/40 hover:text-white text-xs font-semibold">✕</button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] text-xs space-y-1">
                <span className="text-[8.5px] uppercase tracking-wider text-white/35">Original Query</span>
                <p className="font-semibold text-white/90 truncate">&ldquo;{selectedRequest.description}&rdquo;</p>
              </div>

              <form onSubmit={handleReplySubmit} className="space-y-4 pt-1 text-xs font-semibold text-white/80 border-none">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500">Reply Message</label>
                  <textarea
                    required
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Enter instructions, notes, or resolution update..."
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500 resize-none font-medium"
                  />
                </div>

                {/* Connected Resources integration picker */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500">Attach Reference Resource</label>
                    <button
                      type="button"
                      onClick={() => setIsReplyPickerOpen(true)}
                      className="text-[10px] font-extrabold text-cyan-400 hover:underline"
                    >
                      + Connected Resources
                    </button>
                  </div>
                  {replyAttachedFile ? (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 text-xs font-bold w-fit">
                      <span>📄 {replyAttachedFile}</span>
                      <button
                        type="button"
                        onClick={() => setReplyAttachedFile(null)}
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
                  Dispatch Reply
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ResourcePickerModal
        isOpen={isReplyPickerOpen}
        onClose={() => setIsReplyPickerOpen(false)}
        onSelect={(doc) => setReplyAttachedFile(doc.title)}
        theme={theme as Theme}
        contextText={selectedRequest ? `${selectedRequest.description} ${replyMessage}` : replyMessage}
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
