"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ParentRequestType } from "./types";

interface ParentSubmissionFormProps {
  theme?: string;
  onSubmit?: (data: ParentSubmissionData) => void;
  onCancel?: () => void;
}

type ParentSubmissionData = {
  type: ParentRequestType | "";
  category: string;
  description: string;
  studentName: string;
  priority: "low" | "medium" | "high";
  dateSubmitted: string;
};

type RequestTypeItem = {
  value: ParentRequestType;
  label: string;
  icon: ReactNode;
};

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M10 9.2C10 7.5 11.4 6.2 13 6.2C14.6 6.2 16 7.4 16 9C16 10.3 15.2 11.1 14.1 11.8C13 12.5 12.5 13.1 12.5 14.2V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12.5" cy="18.2" r="0.8" fill="currentColor" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M5 7.5H19V15.5H12L8 19V15.5H5V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ConcernIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M12 4.5L19 17.5H5L12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="0.8" fill="currentColor" />
    </svg>
  );
}

function SuggestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M12 4.5C8.4 4.5 5.5 7.2 5.5 10.5C5.5 12.7 6.8 14.6 8.8 15.7V18H15.2V15.7C17.2 14.6 18.5 12.7 18.5 10.5C18.5 7.2 15.6 4.5 12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 18H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path d="M8 7V3M16 7V3M5 10H19V19H5V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13H16M8 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ParentSubmissionForm({ theme = "dark", onSubmit, onCancel }: ParentSubmissionFormProps) {
  const [requestType, setRequestType] = useState<ParentRequestType | "">("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLight = theme === "light";
  const shellClass = isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0C0C0E] border-white/[0.06] text-white";
  const panelClass = isLight ? "bg-black/[0.02] border-black/[0.08] hover:bg-black/[0.04]" : "bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03]";
  const inputClass = isLight ? "bg-white border-black/[0.08] text-black placeholder-black/30 focus:border-cyan-500/50" : "bg-white/[0.02] border-white/[0.06] text-white placeholder-white/30 focus:border-cyan-500/50";

  const requestTypes: RequestTypeItem[] = [
    { value: "question", label: "Question", icon: <QuestionIcon /> },
    { value: "feedback", label: "Feedback", icon: <FeedbackIcon /> },
    { value: "concern", label: "Concern", icon: <ConcernIcon /> },
    { value: "suggestion", label: "Suggestion", icon: <SuggestionIcon /> },
    { value: "meeting_request", label: "Meeting Request", icon: <CalendarIcon /> },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      type: requestType,
      category,
      description,
      studentName,
      priority,
      dateSubmitted: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit?.(submissionData);
    setIsSubmitting(false);

    setRequestType("");
    setCategory("");
    setDescription("");
    setStudentName("");
    setPriority("medium");
  };

  return (
    <div className={`h-full flex flex-col ${shellClass}`}>
      <div className={`p-6 border-b ${isLight ? "border-black/[0.08]" : "border-white/[0.06]"}`}>
        <h2 className={`text-lg font-bold ${isLight ? "text-black" : "text-white"}`}>Submit Request</h2>
        <p className={`text-xs mt-0.5 ${isLight ? "text-black/50" : "text-white/40"}`}>Ask questions, share feedback, or request a meeting</p>
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
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${isLight ? "text-black/50" : "text-white/50"}`}>Student Name (Optional)</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="If this request is about a specific student"
                  className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none transition-all ${inputClass}`}
                />
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
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${priority === prio.value ? "bg-white/[0.05] border-white/[0.1]" : panelClass}`}
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
