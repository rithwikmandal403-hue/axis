"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { StudentRequestType } from "./types";

interface StudentSubmissionFormProps {
  theme?: string;
  onSubmit?: (data: StudentSubmissionData) => void;
  onCancel?: () => void;
}

type StudentSubmissionData = {
  type: StudentRequestType | "";
  category: string;
  description: string;
  location?: {
    type: "room" | "facility" | "general";
    name: string;
  };
  priority: "low" | "medium" | "high";
  dateSubmitted: string;
};

type RequestTypeItem = {
  value: StudentRequestType;
  label: string;
  icon: ReactNode;
};

function IdeaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M12 4.5C8.4 4.5 5.5 7.2 5.5 10.5C5.5 12.7 6.8 14.6 8.8 15.7V18H15.2V15.7C17.2 14.6 18.5 12.7 18.5 10.5C18.5 7.2 15.6 4.5 12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9H16M8 12H13M8 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <rect x="4" y="6" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M8 7V3M16 7V3M5 10H19V19H5V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13H16M8 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M12 19.5C12 19.5 4.5 14.7 4.5 9.1C4.5 6.7 6.4 5 8.8 5C10.2 5 11.4 5.7 12 6.8C12.6 5.7 13.8 5 15.2 5C17.6 5 19.5 6.7 19.5 9.1C19.5 14.7 12 19.5 12 19.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M6 4.5H15L18 7.5V19.5H6V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 10H15M9 13H15M9 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StudentSubmissionForm({ theme = "dark", onSubmit, onCancel }: StudentSubmissionFormProps) {
  const [requestType, setRequestType] = useState<StudentRequestType | "">("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState<"room" | "facility" | "general">("general");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLight = theme === "light";
  const shellClass = isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0C0C0E] border-white/[0.06] text-white";
  const panelClass = isLight ? "bg-black/[0.02] border-black/[0.08] hover:bg-black/[0.04]" : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03]";
  const inputClass = isLight ? "bg-white border-black/[0.08] text-black placeholder-black/30 focus:border-cyan-500/50" : "bg-white/[0.02] border-white/[0.06] text-white placeholder-white/30 focus:border-cyan-500/50";

  const requestTypes: RequestTypeItem[] = [
    { value: "suggestion", label: "Suggestion", icon: <IdeaIcon /> },
    { value: "facility_issue", label: "Facility Issue", icon: <BuildingIcon /> },
    { value: "technology_issue", label: "Technology Issue", icon: <DeviceIcon /> },
    { value: "event_proposal", label: "Event Proposal", icon: <EventIcon /> },
    { value: "club_proposal", label: "Club Proposal", icon: <TargetIcon /> },
    { value: "wellbeing_concern", label: "Wellbeing Concern", icon: <HeartIcon /> },
    { value: "general_request", label: "General Request", icon: <NoteIcon /> },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      type: requestType,
      category,
      description,
      location: locationType !== "general" ? { type: locationType, name: location } : undefined,
      priority,
      dateSubmitted: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit?.(submissionData);
    setIsSubmitting(false);

    setRequestType("");
    setCategory("");
    setDescription("");
    setLocation("");
    setLocationType("general");
    setPriority("medium");
  };

  return (
    <div className={`h-full flex flex-col ${shellClass}`}>
      <div className={`p-6 border-b ${isLight ? "border-black/[0.08]" : "border-white/[0.06]"}`}>
        <h2 className={`text-lg font-bold ${isLight ? "text-black" : "text-white"}`}>Submit Request</h2>
        <p className={`text-xs mt-0.5 ${isLight ? "text-black/50" : "text-white/40"}`}>Share ideas, report issues, or propose events</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${isLight ? "text-black/50" : "text-white/50"}`}>Request Type</label>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setRequestType(type.value);
                    setCategory(type.label);
                  }}
                  className={`p-4 rounded-xl border transition-all text-left ${requestType === type.value ? "bg-cyan-500/10 border-cyan-500/30" : panelClass}`}
                >
                  <span className={`mb-2 block ${requestType === type.value ? "text-cyan-400" : isLight ? "text-black/70" : "text-white/70"}`}>{type.icon}</span>
                  <span className={`text-xs font-semibold block ${isLight ? "text-black" : "text-white"}`}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {requestType && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${isLight ? "text-black/50" : "text-white/50"}`}>Location (Optional)</label>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: "general", label: "General" },
                    { value: "room", label: "Room" },
                    { value: "facility", label: "Facility" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setLocationType(type.value as "room" | "facility" | "general")}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        locationType === type.value ? "bg-cyan-500 text-black" : isLight ? "bg-black/[0.02] text-black/60 hover:bg-black/[0.05]" : "bg-white/[0.02] text-white/60 hover:bg-white/[0.05]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {locationType !== "general" && (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={locationType === "room" ? "e.g., Science Lab 3, Room 204" : "e.g., Gymnasium, Library, Auditorium"}
                    className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-all ${inputClass}`}
                  />
                )}
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${isLight ? "text-black/50" : "text-white/50"}`}>Priority</label>
                <div className="flex gap-2">
                  {[
                    { value: "low", label: "Low", color: "text-zinc-400" },
                    { value: "medium", label: "Medium", color: "text-yellow-400" },
                    { value: "high", label: "High", color: "text-orange-400" },
                  ].map((prio) => (
                    <button
                      key={prio.value}
                      type="button"
                      onClick={() => setPriority(prio.value as "low" | "medium" | "high")}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                        priority === prio.value ? "bg-white/[0.05] border-white/[0.1]" : panelClass
                      }`}
                    >
                      <span className={`text-xs font-bold ${prio.color} block`}>{prio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${isLight ? "text-black/50" : "text-white/50"}`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about your request..."
                  rows={5}
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-all resize-none ${inputClass}`}
                />
              </div>
            </motion.div>
          )}
        </form>
      </div>

      <div className={`p-6 border-t flex gap-3 ${isLight ? "border-black/[0.08]" : "border-white/[0.06]"}`}>
        <button
          onClick={onCancel}
          className={`flex-1 px-4 py-3 rounded-xl border text-xs font-bold uppercase transition-all ${isLight ? "bg-black/[0.02] border-black/[0.08] text-black hover:bg-black/[0.05]" : "bg-white/[0.02] border-white/[0.06] text-white hover:bg-white/[0.05]"}`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!requestType || !description || isSubmitting}
          className="flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-black text-xs font-bold uppercase hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
