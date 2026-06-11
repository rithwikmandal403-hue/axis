/**
 * Teacher Context Action Modals
 * Handles creation workflows for events, meetings, tasks, reminders, assignments
 * Pre-fills detected information, teacher confirms before publishing
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DetectedContext } from "./teacher-context-engine";

export type ContextActionType = "event" | "meeting" | "task" | "reminder" | "assignment" | "followup" | "announcement" | "calendar" | null;

export function TeacherContextActionModal({
  context,
  isOpen,
  onClose,
  onConfirm,
}: {
  context: DetectedContext | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (context: DetectedContext, formData: Record<string, string>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!context) return;

    // Pre-fill form based on context type
    const initialData: Record<string, string> = {
      title: context.title || "",
      description: context.description || "",
      date: context.date || "",
      time: context.time || "",
      targetGroup: context.targetGroup || "",
      participants: context.participants?.join(", ") || "",
    };

    setFormData(initialData);
  }, [context]);

  if (!context || !isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    onConfirm(context, formData);
    setToastMessage(`✓ ${context.type.charAt(0).toUpperCase() + context.type.slice(1)} created successfully`);
    setTimeout(() => {
      onClose();
      setToastMessage(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E0E10] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-white/10 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Create {context.type.charAt(0).toUpperCase() + context.type.slice(1)}</h2>
              <p className="text-xs text-white/40 mt-1">Context automatically detected and pre-filled below</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Render form fields based on context type */}
            {renderContextForm(context, formData, handleChange)}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 flex gap-3 justify-end bg-white/[0.01]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Confirm & Create"}
            </button>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Render context-specific form fields
 */
function renderContextForm(
  context: DetectedContext,
  formData: Record<string, string>,
  handleChange: (field: string, value: string) => void
) {
  const commonFields = (
    <>
      <div>
        <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
          placeholder="Enter title..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all resize-none h-24"
          placeholder="Add details..."
        />
      </div>
    </>
  );

  switch (context.type) {
    case "event":
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
        </>
      );

    case "meeting":
      return (
        <>
          {commonFields}
          <div>
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Participants (comma-separated)</label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => handleChange("participants", e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g., Aarav Chen, Sarah Thompson"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </>
      );

    case "task":
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Due Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Target Group</label>
              <input
                type="text"
                value={formData.targetGroup}
                onChange={(e) => handleChange("targetGroup", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="e.g., Grade 10, Physics HL"
              />
            </div>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
            <p className="text-xs text-cyan-400 font-medium">
              ✓ Task will be assigned to: <span className="font-bold">{formData.targetGroup || "All Students"}</span>
            </p>
          </div>
        </>
      );

    case "reminder":
      return (
        <>
          {commonFields}
          <div>
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Remind On</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </>
      );

    case "assignment":
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Due Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Class/Grade</label>
              <input
                type="text"
                value={formData.targetGroup}
                onChange={(e) => handleChange("targetGroup", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="e.g., Grade 11 Physics"
              />
            </div>
          </div>
        </>
      );

    case "followup":
      return (
        <>
          {commonFields}
          <div>
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Follow-up Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </>
      );

    case "announcement":
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Target Audience</label>
              <input
                type="text"
                value={formData.targetGroup}
                onChange={(e) => handleChange("targetGroup", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="e.g., Grade 11 Physics (B)"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Expiry Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
            <p className="text-xs text-cyan-400 font-medium">
              ✓ Announcement will be published to: <span className="font-bold">{formData.targetGroup || "All Classes"}</span>
            </p>
          </div>
        </>
      );

    case "calendar":
      return (
        <>
          {commonFields}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Scheduled Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
        </>
      );

    default:
      return commonFields;
  }
}
