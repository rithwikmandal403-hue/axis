"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Request, DashboardWidgetData } from "./types";

interface RequestsWidgetProps {
  theme?: string;
  onRequestClick?: (request: Request) => void;
}

export function RequestsWidget({ onRequestClick }: RequestsWidgetProps) {
  const [expanded, setExpanded] = useState(false);

  // Sample data - in production this would come from an API
  const widgetData: DashboardWidgetData = {
    newReports: 3,
    highPriorityReports: 2,
    pendingSuggestions: 5,
    outstandingIssues: 4,
    recentRequests: [
      {
        id: "req-1",
        type: "facility_issue",
        category: "Facility Issue",
        reporter: {
          id: "tch-1",
          name: "Aarav Chen",
          role: "teacher"
        },
        location: {
          type: "room",
          name: "Science Lab 3"
        },
        description: "Projector not working properly. Screen flickers intermittently.",
        dateSubmitted: "2024-08-28T08:15:00Z",
        priority: "high",
        status: "in_progress"
      },
      {
        id: "req-2",
        type: "technology_issue",
        category: "Technology Issue",
        reporter: {
          id: "tch-2",
          name: "Ananya Rao",
          role: "teacher"
        },
        location: {
          type: "room",
          name: "Science Lab 2"
        },
        description: "Lab equipment computers not connecting to network.",
        dateSubmitted: "2024-08-28T09:30:00Z",
        priority: "urgent",
        status: "pending"
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
        description: "Suggest adding more charging stations in the library.",
        dateSubmitted: "2024-08-27T14:20:00Z",
        priority: "medium",
        status: "pending"
      }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-zinc-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-orange-400";
      case "urgent": return "text-red-400";
      default: return "text-white";
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.01] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Requests Requiring Attention</span>
          <h3 className="text-sm font-bold text-white mt-0.5">Community Submissions</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/40 hover:text-white transition-colors"
        >
          <svg className={`size-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <span className="text-[9px] text-white/40 block">New Reports</span>
          <span className="text-2xl font-black text-cyan-400">{widgetData.newReports}</span>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <span className="text-[9px] text-white/40 block">High Priority</span>
          <span className="text-2xl font-black text-red-400">{widgetData.highPriorityReports}</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <span className="text-[9px] text-white/40 block">Pending Suggestions</span>
          <span className="text-2xl font-black text-amber-400">{widgetData.pendingSuggestions}</span>
        </div>
        <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
          <span className="text-[9px] text-white/40 block">Outstanding Issues</span>
          <span className="text-2xl font-black text-orange-400">{widgetData.outstandingIssues}</span>
        </div>
      </div>

      {/* Recent Requests */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 pt-2 border-t border-white/[0.06]"
        >
          <span className="text-[9px] text-white/35 font-bold uppercase tracking-wider block">Recent Requests</span>
          {widgetData.recentRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all cursor-pointer"
              onClick={() => onRequestClick?.(request)}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-semibold text-white">{request.category}</span>
                <span className={`text-[8px] font-bold uppercase ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              <p className="text-[10px] text-white/60 line-clamp-2 mb-2">{request.description}</p>
              <div className="flex items-center justify-between text-[8px] text-white/40">
                <span>{request.reporter.name} ({request.reporter.role})</span>
                {request.location && (
                  <span className="text-cyan-400">{request.location.name}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
