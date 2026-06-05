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
    id: "req-1",
    type: "facility_issue",
    category: "Facility Issue",
    reporter: {
      id: "tch-1",
      name: "Aarav Chen",
      role: "teacher",
      email: "aarav.chen@axis.edu"
    },
    location: {
      type: "room",
      name: "Science Lab 3",
      id: "lab-3"
    },
    description: "Projector not working properly. Screen flickers intermittently during presentations. Need urgent replacement or repair.",
    dateSubmitted: "2024-08-28T08:15:00Z",
    priority: "high",
    status: "new",
    context: {
      operationalImpact: "Affecting DP Physics and Chemistry classes. 4 classes scheduled today.",
      affectedClasses: ["DP Physics 11A", "DP Chemistry 12A", "DP Physics 11B", "DP Chemistry 12B"],
      affectedEvents: []
    }
  },
  {
    id: "req-2",
    type: "technology_issue",
    category: "Technology Issue",
    reporter: {
      id: "tch-2",
      name: "Ananya Rao",
      role: "teacher",
      email: "ananya.rao@axis.edu"
    },
    location: {
      type: "room",
      name: "Science Lab 2",
      id: "lab-2"
    },
    description: "Lab equipment computers not connecting to network. Students unable to access simulation software.",
    dateSubmitted: "2024-08-28T09:30:00Z",
    priority: "urgent",
    status: "new",
    context: {
      operationalImpact: "Critical for DP Chemistry IA submissions due this week.",
      affectedClasses: ["DP Chemistry 11A", "DP Chemistry 11B"],
      affectedEvents: []
    }
  },
  {
    id: "req-3",
    type: "suggestion",
    category: "Suggestion",
    reporter: {
      id: "std-1",
      name: "Chloe Vance",
      role: "student"
    },
    description: "Suggest adding more charging stations in the library. Current ones are always occupied during study periods.",
    dateSubmitted: "2024-08-27T14:20:00Z",
    priority: "medium",
    status: "waiting",
    context: {
      operationalImpact: "Student convenience and study environment improvement."
    }
  },
  {
    id: "req-4",
    type: "maintenance_request",
    category: "Maintenance Request",
    reporter: {
      id: "tch-3",
      name: "Marcus Vance",
      role: "teacher",
      email: "marcus.vance@axis.edu"
    },
    location: {
      type: "room",
      name: "Room 204",
      id: "room-204"
    },
    description: "Air conditioning not cooling properly. Room temperature uncomfortable for afternoon classes.",
    dateSubmitted: "2024-08-26T16:45:00Z",
    priority: "high",
    status: "in_progress",
    assignedTo: {
      id: "staff-1",
      name: "Facilities Team",
      role: "coordinator"
    },
    context: {
      operationalImpact: "Affecting DP Calculus and MYP Algebra classes in afternoon slots.",
      affectedClasses: ["DP Calculus 12", "MYP Algebra 10A", "MYP Algebra 10B"]
    }
  },
  {
    id: "req-5",
    type: "event_proposal",
    category: "Event Proposal",
    reporter: {
      id: "std-2",
      name: "Lucas Gray",
      role: "student"
    },
    description: "Proposal for inter-school robotics competition. Would require venue booking and budget approval.",
    dateSubmitted: "2024-08-25T11:00:00Z",
    priority: "medium",
    status: "waiting",
    context: {
      operationalImpact: "Potential school-wide event requiring coordination with multiple departments."
    }
  },
  {
    id: "req-6",
    type: "equipment_issue",
    category: "Equipment Issue",
    reporter: {
      id: "tch-4",
      name: "David Miller",
      role: "teacher",
      email: "david.miller@axis.edu"
    },
    location: {
      type: "facility",
      name: "Gymnasium",
      id: "gym"
    },
    description: "Basketball hoops need adjustment. Nets are torn and rim height is inconsistent.",
    dateSubmitted: "2024-08-24T15:30:00Z",
    priority: "medium",
    status: "resolved",
    assignedTo: {
      id: "staff-2",
      name: "Maintenance Lead",
      role: "coordinator"
    },
    replies: [
      {
        id: "rep-1",
        author: {
          id: "staff-2",
          name: "Maintenance Lead",
          role: "coordinator"
        },
        message: "Work order created. Will address by end of week.",
        timestamp: "2024-08-24T16:00:00Z"
      },
      {
        id: "rep-2",
        author: {
          id: "staff-2",
          name: "Maintenance Lead",
          role: "coordinator"
        },
        message: "Completed. Hoops adjusted and nets replaced.",
        timestamp: "2024-08-26T10:30:00Z"
      }
    ]
  }
];

export function CoordinatorDashboard({ theme = "dark" }: CoordinatorDashboardProps) {
  const [activeStatus, setActiveStatus] = useState<RequestStatus>("new");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Reply States with Connected Resources picker
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachedFile, setReplyAttachedFile] = useState<string | null>(null);
  const [isReplyPickerOpen, setIsReplyPickerOpen] = useState(false);

  const [newRequestText, setNewRequestText] = useState("");
  const [newRequestCategory, setNewRequestCategory] = useState("Technology Issue");
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
              category: newReq.category || "Facility Issue",
              reporter: {
                id: newReq.reporterId || "tch-1",
                name: newReq.reporterName || "Aarav Chen",
                role: newReq.reporterRole || "teacher",
                email: newReq.reporterEmail || "aarav.chen@axis.edu"
              },
              location: {
                type: "room",
                name: newReq.location || "Science Lab 3",
                id: newReq.locationId || "lab-3"
              },
              description: newReq.description,
              dateSubmitted: new Date().toISOString(),
              priority: newReq.priority || "high",
              status: "new",
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

  const statusCategories: RequestStatus[] = ["new", "in_progress", "waiting", "resolved", "archived"];

  const filteredRequests = requests.filter(req => req.status === activeStatus);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "new": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "waiting": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
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

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    // In production, this would update the request in the database
    console.log(`Changing request ${requestId} to ${newStatus}`);
  };

  const handleAssign = (requestId: string) => {
    // In production, this would open an assignment modal
    console.log(`Assigning request ${requestId}`);
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
          replies: [...(r.replies || []), newReply],
          status: "in_progress" as RequestStatus
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

  const handleEscalate = (requestId: string) => {
    // In production, this would escalate the request
    console.log(`Escalating request ${requestId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">DP Requests & Reports</h2>
            <p className="text-xs text-white/40 mt-0.5">Manage supervisor requests, DP notices, and IB workflow submissions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-white/30 block">Total Requests</span>
              <span className="text-lg font-bold text-cyan-400">{requests.length}</span>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusCategories.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeStatus === status
                  ? getStatusColor(status) + " bg-opacity-20"
                  : "text-white/40 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {status.replace("_", " ")}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[8px]">
                {requests.filter(r => r.status === status).length}
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
              <div className="p-8 text-center text-white/30">
                <span className="text-4xl mb-2 block">No requests</span>
                <span className="text-sm">No requests in this category</span>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] transition-all cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${getStatusColor(request.status)}`}>
                          {request.status.replace("_", " ")}
                        </span>
                        <span className={`text-[8px] font-bold uppercase ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{request.category}</h3>
                      <p className="text-xs text-white/60 line-clamp-2">{request.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span>{request.reporter.name}</span>
                      <span></span>
                      <span>{request.reporter.role}</span>
                      {request.location && (
                        <>
                          <span></span>
                          <span className="text-cyan-400">{request.location.name}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-white/30">
                      {new Date(request.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>

                  {request.context?.operationalImpact && (
                    <div className="mt-3 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] text-amber-400/80 block">
                        Alert {request.context.operationalImpact}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Request Detail Panel */}
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
                    <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-white/40 hover:text-white text-[10px]"
                    >
                      
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{selectedRequest.category}</h3>
                    <span className={`text-[8px] font-bold uppercase ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority} Priority
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div>
                      <span className="text-white/30 block">Reporter</span>
                      <span className="text-white">{selectedRequest.reporter.name}</span>
                      <span className="text-white/40 ml-1">({selectedRequest.reporter.role})</span>
                    </div>
                    {selectedRequest.location && (
                      <div>
                        <span className="text-white/30 block">Location</span>
                        <span className="text-cyan-400">{selectedRequest.location.name}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-white/30 block">Submitted</span>
                      <span className="text-white">{new Date(selectedRequest.dateSubmitted).toLocaleString()}</span>
                    </div>
                    {selectedRequest.assignedTo && (
                      <div>
                        <span className="text-white/30 block">Assigned To</span>
                        <span className="text-white">{selectedRequest.assignedTo.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-white/30 text-[10px] block mb-1">Description</span>
                    <p className="text-xs text-white/80">{selectedRequest.description}</p>
                  </div>

                  {selectedRequest.context?.operationalImpact && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <span className="text-[9px] text-amber-400/80 block mb-1">Alert Operational Impact</span>
                      <p className="text-[10px] text-amber-400/60">{selectedRequest.context.operationalImpact}</p>
                    </div>
                  )}

                  {selectedRequest.replies && selectedRequest.replies.length > 0 && (
                    <div>
                      <span className="text-white/30 text-[10px] block mb-2">Replies</span>
                      <div className="space-y-2">
                        {selectedRequest.replies.map((reply) => (
                          <div key={reply.id} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-white/70">{reply.author.name}</span>
                              <span className="text-[8px] text-white/30">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/60">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.04]">
                    <button
                      onClick={() => handleAssign(selectedRequest.id)}
                      className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase hover:bg-cyan-500/20 transition-all"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleReply(selectedRequest.id)}
                      className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase hover:bg-blue-500/20 transition-all"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => handleEscalate(selectedRequest.id)}
                      className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase hover:bg-amber-500/20 transition-all"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, "resolved")}
                      className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase hover:bg-emerald-500/20 transition-all"
                    >
                      Resolve
                    </button>
                  </div>

                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, "archived")}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-[10px] font-bold uppercase hover:bg-zinc-500/20 transition-all"
                  >
                    Archive
                  </button>
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
                            if (isSuggestionApplied && !e.target.value.toLowerCase().includes("basketball court lights")) {
                              setIsSuggestionApplied(false);
                            }
                          }}
                          placeholder="e.g. The basketball court lights have stopped working."
                          className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2.5 text-xs text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none transition-all resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] uppercase tracking-wider text-white/45 block">Category Classification</label>
                          {newRequestText.toLowerCase().includes("basketball court lights") && !isSuggestionApplied && (
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
                                ✨ Suggestion Detected
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
                                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">Context Detected</span>
                                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">
                                          Facilities Suggested
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-white/70 leading-normal">
                                        Axis detected a physical asset issue. Classify under &quot;Facility Issue&quot;?
                                      </p>
                                      <div className="flex gap-2.5 mt-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewRequestCategory("Facility Issue");
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
                            <option value="Facility Issue">Facility Issue</option>
                            <option value="Technology Issue">Technology Issue</option>
                            <option value="Maintenance Request">Maintenance Request</option>
                            <option value="Suggestion">Suggestion</option>
                          </select>
                          {isSuggestionApplied && newRequestCategory === "Facility Issue" && (
                            <span className="absolute right-8 top-2 px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none">
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
                              type: newRequestCategory === "Facility Issue" ? "facility_issue" : "technology_issue",
                              category: newRequestCategory,
                              reporter: {
                                id: "staff-coord",
                                name: "Sarah Thompson",
                                role: "coordinator",
                                email: "sarah.thompson@axis.edu"
                              },
                              location: {
                                type: "facility",
                                name: newRequestCategory === "Facility Issue" ? "Basketball Court" : "Science Lab 3"
                              },
                              description: newRequestText,
                              dateSubmitted: new Date().toISOString(),
                              priority: "high",
                              status: "new",
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
                        className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-white/90 transition-all uppercase"
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
              className="relative w-full max-w-md border p-6 rounded-2xl shadow-2xl z-10 text-white bg-[#0E0E10] border-white/10 space-y-4"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-white outline-none focus:border-cyan-500 resize-none"
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
