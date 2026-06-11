"use client";

import React, { useState } from "react";

export interface StudentSupportInfo {
  status: "Verified by IB" | "Pending Verification" | "Documentation Under Review" | "Expired" | "Not Applicable";
  planActive: boolean;
  approvalDate: string;
  expiryDate?: string;
  nextReviewDate: string;
  documentationStatus: string;
  provisions: string[];
  notes: string;
}

export const ACCOMMODATIONS_MAP: Record<string, StudentSupportInfo> = {
  "Chloe Vance": {
    status: "Verified by IB",
    planActive: true,
    approvalDate: "Sep 12, 2025",
    expiryDate: "May 2027",
    nextReviewDate: "Oct 15, 2026",
    documentationStatus: "Verified & Uploaded",
    provisions: ["25% Extra Time", "Separate Room", "Rest Breaks"],
    notes: "Student has been approved by the IB for 25% additional time during examinations. Separate testing environment required. Accommodation documentation verified and active."
  },
  "Lucas Gray": {
    status: "Pending Verification",
    planActive: true,
    approvalDate: "Jan 18, 2026",
    expiryDate: "Jun 2027",
    nextReviewDate: "Sep 05, 2026",
    documentationStatus: "Documentation Under Review",
    provisions: ["Rest Breaks (10 mins)"],
    notes: "Request submitted for 10-minute rest breaks per hour. Medical certificates uploaded. Awaiting final IB response."
  }
};

export function StudentSupportFlag({
  studentName,
  theme = "axis",
  onViewProfile
}: {
  studentName: string;
  theme?: string;
  onViewProfile?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const info = ACCOMMODATIONS_MAP[studentName];

  if (!info || !info.planActive) return null;

  return (
    <span className="relative inline-block ml-1.5 select-none align-middle">
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-help text-indigo-400 hover:text-indigo-300 font-black text-xs inline-flex items-center justify-center transition-colors"
        style={{ textShadow: "0 0 8px rgba(129, 140, 248, 0.4)" }}
      >
        ◈
      </span>
      {isHovered && (
        <span 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[999] w-56 p-3.5 bg-[#0C0C0E]/95 border border-indigo-500/35 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl text-left normal-case font-sans pointer-events-auto"
        >
          {/* Header */}
          <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono">
            Access Arrangements Active
          </span>

          {/* Verification Badge */}
          <span className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-white/50 font-bold">Verification:</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
              info.status === "Verified by IB"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {info.status}
            </span>
          </span>

          {/* Provisions */}
          <span className="block text-[10px] text-white/50 font-bold mt-2">Required Provisions:</span>
          <span className="flex flex-wrap gap-1 mt-1">
            {info.provisions.map((prov) => (
              <span key={prov} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[8px] font-bold">
                {prov}
              </span>
            ))}
          </span>

          {/* Expiry */}
          {info.expiryDate && (
            <span className="block text-[8.5px] text-white/40 mt-2 font-mono">
              Valid Until: <strong className="text-white/70">{info.expiryDate}</strong>
            </span>
          )}

          {/* Link action */}
          {onViewProfile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                onViewProfile();
              }}
              className="mt-2.5 block w-full text-center py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-[8.5px] uppercase tracking-widest font-black text-indigo-300 transition-all font-mono"
            >
              [View Full Support Profile]
            </button>
          )}
        </span>
      )}
    </span>
  );
}
