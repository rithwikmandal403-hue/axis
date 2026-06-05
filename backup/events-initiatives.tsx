"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EventType =
  | "Sports Day"
  | "Graduation"
  | "Assembly"
  | "Field Trip"
  | "Academic Event"
  | "Festival"
  | "Parent Event"
  | "Open House"
  | "Exhibition";

type ProposalStatus = "Submitted" | "Under Review" | "Approved" | "Needs Revision" | "Rejected";

type ProposalType =
  | "Project Proposal"
  | "Funding Request"
  | "Event Request"
  | "Facility Request"
  | "Support Request"
  | "Campus Usage Request";

type SchoolEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  responsibleStaff: string;
  facility: string;
  status: "Confirmed" | "Planning" | "Hold";
};

type Proposal = {
  id: string;
  title: string;
  type: ProposalType;
  requester: string;
  role: "Teacher" | "Student" | "Staff";
  date: string;
  details: string;
  cost?: string;
  facilityNeeded?: string;
  status: ProposalStatus;
};

export function EventsInitiatives() {
  const [activeSegment, setActiveSegment] = useState<"active-events" | "proposals">("active-events");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Core Events State
  const [events, setEvents] = useState<SchoolEvent[]>([
    { id: "ev-1", title: "Whole-School Sports Day 2026", type: "Sports Day", date: "June 15, 2026", responsibleStaff: "Coach Miller", facility: "Main Stadium & Field", status: "Confirmed" },
    { id: "ev-2", title: "IB DP Graduation Ceremony", type: "Graduation", date: "June 20, 2026", responsibleStaff: "Sarah Jenkins", facility: "Main Auditorium", status: "Confirmed" },
    { id: "ev-3", title: "MYP Personal Project Exhibition", type: "Exhibition", date: "June 08, 2026", responsibleStaff: "Marcus Vance", facility: "Science Atrium", status: "Planning" },
    { id: "ev-4", title: "Grade 11 Physics Field Trip to Observatory", type: "Field Trip", date: "June 12, 2026", responsibleStaff: "Aarav Chen", facility: "External (Off-campus)", status: "Confirmed" },
    { id: "ev-5", title: "Academic Board & Parent Open House", type: "Open House", date: "June 18, 2026", responsibleStaff: "Dr. Alistair Vance", facility: "Central Lobby", status: "Planning" },
  ]);

  // Proposals State
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "prop-1",
      title: "Laser Spectroscopy Rig Purchase",
      type: "Funding Request",
      requester: "Aarav Chen",
      role: "Teacher",
      date: "May 30, 2026",
      details: "Purchase a modern compact laser refraction rig to upgrade DP Physics HL optics lab experiments.",
      cost: "₹18,500",
      status: "Submitted",
    },
    {
      id: "prop-2",
      title: "Student-Led Coding Hackathon",
      type: "Event Request",
      requester: "Leo Dubois (G11 Student)",
      role: "Student",
      date: "May 28, 2026",
      details: "Organize a 24-hour inter-school AI sandbox coding hackathon in the Design Computer Hub.",
      facilityNeeded: "Design Computer Hub",
      status: "Under Review",
    },
    {
      id: "prop-3",
      title: "Rainwater Harvesting Model Demo",
      type: "Project Proposal",
      requester: "Ananya Rao",
      role: "Teacher",
      date: "May 29, 2026",
      details: "DP and MYP Science students proposing to set up a live ecological harvesting mockup in the Central Atrium.",
      facilityNeeded: "Central Atrium",
      status: "Approved",
    },
    {
      id: "prop-4",
      title: "Drama Club Summer Production",
      type: "Campus Usage Request",
      requester: "Robert Blake",
      role: "Teacher",
      date: "May 25, 2026",
      details: "Booking request for Main Auditorium for 3 consecutive evenings for Shakespeare adaptations rehearsals.",
      facilityNeeded: "Main Auditorium",
      status: "Needs Revision",
    },
    {
      id: "prop-5",
      title: "Personal Drone Flight Zone Mapping",
      type: "Facility Request",
      requester: "Kabir Mehta (G10 Student)",
      role: "Student",
      date: "May 24, 2026",
      details: "Requesting to allocate a designated drone flight testing zone on the Athletics Track on weekends.",
      facilityNeeded: "Athletic Track & Field",
      status: "Rejected",
    },
  ]);

  // Handle status update
  const handleUpdateStatus = (proposalId: string, newStatus: ProposalStatus) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          // If approved, optionally append to events list if it's an event request
          if (newStatus === "Approved" && (p.type === "Event Request" || p.type === "Campus Usage Request")) {
            const newEv: SchoolEvent = {
              id: `ev-${Date.now()}`,
              title: p.title,
              type: "Academic Event",
              date: "June 25, 2026 (Scheduled)",
              responsibleStaff: p.requester,
              facility: p.facilityNeeded || "Campus Shared Space",
              status: "Planning"
            };
            setEvents(prevEv => [...prevEv, newEv]);
          }
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
    
    // Update selected proposal reference
    setSelectedProposal(prev => prev && prev.id === proposalId ? { ...prev, status: newStatus } : prev);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Under Review":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Needs Revision":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-start">
      
      {/* LEFT: Management lists (8 cols) */}
      <div className="xl:col-span-8 space-y-6">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
          <button
            onClick={() => {
              setActiveSegment("active-events");
              setSelectedProposal(null);
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeSegment === "active-events"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            ACTIVE EVENTS
          </button>
          <button
            onClick={() => {
              setActiveSegment("proposals");
              setSelectedProposal(null);
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeSegment === "proposals"
                ? "bg-cyan-500 text-black font-extrabold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            PROPOSAL QUEUE ({proposals.filter(p => p.status === "Submitted" || p.status === "Under Review").length} PENDING)
          </button>
        </div>

        {activeSegment === "active-events" ? (
          <div className="border border-white/[0.08] bg-[#0E0E10]/85 p-6 rounded-3xl backdrop-blur-xl shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus Events Board</h3>
              <p className="text-[11px] text-white/35">Schedule of approved assemblies, field trips, exhibitions, and sports days.</p>
            </div>

            <div className="space-y-2.5">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white/90">{ev.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-white/40 border border-white/10 uppercase tracking-widest font-mono">
                        {ev.type}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[9px] text-white/35">
                      <span>📅 Date: <strong className="text-white/60">{ev.date}</strong></span>
                      <span>📍 Room/Space: <strong className="text-white/60">{ev.facility}</strong></span>
                      <span>👥 Supervisor: <strong className="text-white/60">{ev.responsibleStaff}</strong></span>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                    ev.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400"
                  } border`}>
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-white/[0.08] bg-[#0E0E10]/85 p-6 rounded-3xl backdrop-blur-xl shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Proposal Review Pipeline</h3>
              <p className="text-[11px] text-white/35">Roster review approvals for student/faculty funding, facility usage, and project initiatives.</p>
            </div>

            <div className="space-y-2.5">
              {proposals.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProposal(prop)}
                  className={`w-full text-left p-4 bg-white/[0.01] border rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] hover:border-white/10 transition-all ${
                    selectedProposal?.id === prop.id ? "border-cyan-500/50 bg-cyan-500/5 shadow-md" : "border-white/[0.04]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-xs font-bold text-white/90 leading-tight">{prop.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-white/45 border border-white/5 font-mono">
                        {prop.type}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[9px] text-white/35">
                      <span>By: <strong className="text-white/60">{prop.requester} ({prop.role})</strong></span>
                      <span>Submitted: <strong className="text-white/60">{prop.date}</strong></span>
                      {prop.cost && <span>Funding: <strong className="text-cyan-400">{prop.cost}</strong></span>}
                      {prop.facilityNeeded && <span>Facility: <strong className="text-white/60">{prop.facilityNeeded}</strong></span>}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${getStatusBadge(prop.status)}`}>
                    {prop.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Selected Proposal Details & Review Workflows (4 cols) */}
      <div className="xl:col-span-4">
        <AnimatePresence mode="wait">
          {selectedProposal ? (
            <motion.div
              key={selectedProposal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="border border-white/[0.08] bg-[#0E0E10]/85 p-6 rounded-3xl space-y-6 backdrop-blur-xl shadow-lg"
            >
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block">{selectedProposal.type}</span>
                <h3 className="text-sm font-bold text-white mt-0.5 leading-tight">{selectedProposal.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[8px] border font-mono uppercase mt-2 inline-block ${getStatusBadge(selectedProposal.status)}`}>
                  {selectedProposal.status}
                </span>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4 border-b border-white/[0.06] pb-3 text-[10px]">
                  <div>
                    <span className="text-white/35 uppercase tracking-wider">Submitted By</span>
                    <p className="text-white/80 font-bold mt-0.5">{selectedProposal.requester}</p>
                    <span className="text-[9px] text-white/40 block leading-tight">{selectedProposal.role}</span>
                  </div>
                  <div>
                    <span className="text-white/35 uppercase tracking-wider">Proposal Date</span>
                    <p className="text-white/80 font-mono font-bold mt-0.5">{selectedProposal.date}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider block">Proposal Description</span>
                  <p className="text-white/70 font-medium leading-relaxed bg-[#0A0A0B] p-3 rounded-xl border border-white/[0.04] text-[11px]">
                    {selectedProposal.details}
                  </p>
                </div>

                {selectedProposal.cost && (
                  <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
                    <span className="text-white/35 uppercase tracking-wider">Budget Requirement</span>
                    <strong className="text-cyan-400 font-mono text-sm">{selectedProposal.cost}</strong>
                  </div>
                )}

                {selectedProposal.facilityNeeded && (
                  <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs">
                    <span className="text-white/35 uppercase tracking-wider">Campus Location Needed</span>
                    <strong className="text-white/85 font-sans">{selectedProposal.facilityNeeded}</strong>
                  </div>
                )}

                {/* Status governance review actions */}
                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-2">Executive Decision Roster</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedProposal.id, "Approved")}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] uppercase font-bold transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedProposal.id, "Rejected")}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] uppercase font-bold transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedProposal.id, "Under Review")}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] uppercase font-bold transition-all"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedProposal.id, "Needs Revision")}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] uppercase font-bold transition-all"
                    >
                      Needs Revision
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="border border-dashed border-white/[0.12] p-8 rounded-3xl h-[380px] flex flex-col justify-center items-center text-center text-xs text-white/30 space-y-2">
              <span className="text-2xl opacity-40">🗳️</span>
              <h4 className="font-bold text-white/60">No Proposal Selected</h4>
              <p className="max-w-[200px] leading-relaxed mx-auto">Select any pending request in the queue to evaluate specifications and dispatch executive approval decisions.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}
