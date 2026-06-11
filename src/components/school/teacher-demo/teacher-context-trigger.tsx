/**
 * Teacher Context Trigger Component
 * Reuses the exact interaction pattern from Coordinator perspective
 * Subtle indicator on hover, tooltip reveals on hover, action on click
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ContextType, DetectedContext } from "./teacher-context-engine";

export function TeacherContextTrigger({
  text,
  contextType,
  contextTitle,
  contextDescription,
  actionLabel,
  meta,
  onAction,
  confidence = 0.85,
}: {
  text: string;
  contextType: ContextType | string;
  contextTitle: string;
  contextDescription?: string;
  actionLabel: string;
  meta?: string;
  onAction: () => void;
  confidence?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    if (!isHovered) return;
    updateCoords();

    window.addEventListener("scroll", updateCoords, { capture: true });
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, { capture: true });
      window.removeEventListener("resize", updateCoords);
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateCoords();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  // Determine styling based on confidence
  const isHighConfidence = confidence > 0.8;

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-help z-20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Indicator: Dashed underline with optional glow */}
      <span className={`border-b border-dashed ${
        isHighConfidence 
          ? "border-cyan-400/90 hover:bg-cyan-500/15 hover:border-cyan-400" 
          : "border-cyan-400/60 hover:bg-cyan-500/10 hover:border-cyan-400/80"
      } transition-all duration-200 px-0.5 rounded-sm font-bold text-cyan-400`}>
        {text}
      </span>

      {/* Tooltip Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isHovered && coords ? (() => {
            const margin = 12;
            const tooltipWidth = 256; // w-64 = 256px
            const leftCenter = coords.left + coords.width / 2;
            const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
            const adjustedLeft = Math.max(margin + tooltipWidth / 2, Math.min(windowWidth - margin - tooltipWidth / 2, leftCenter));
            
            const showBelow = coords.top < 180;
            const topPos = showBelow ? coords.top + coords.height : coords.top;
            const transformVal = showBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)";
            const marginTopVal = showBelow ? "8px" : "-8px";

            return (
              <motion.div
                key="teacher-context-panel"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
                className="fixed z-[9999] p-4 rounded-xl border border-cyan-500/30 bg-[#0E0E10] shadow-2xl w-64 text-left flex flex-col gap-3 pointer-events-auto"
                style={{
                  left: `${adjustedLeft}px`,
                  top: `${topPos}px`,
                  transform: transformVal,
                  marginTop: marginTopVal,
                  filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.6))",
                }}
              >
                {/* Header: Context Type Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-400">
                    Context Detected
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest leading-none whitespace-nowrap">
                    {contextType}
                  </span>
                </div>

                {/* Title */}
                <p className="text-xs font-semibold text-white/90">{contextTitle}</p>

                {/* Description */}
                {contextDescription && (
                  <p className="text-[10px] text-white/60 leading-relaxed">{contextDescription}</p>
                )}

                {/* Meta info */}
                {meta && (
                  <p className="text-[9px] text-white/40 font-medium leading-relaxed">{meta}</p>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction();
                    setIsHovered(false);
                  }}
                  className="mt-2 w-full px-3 py-2 rounded bg-cyan-500 text-black text-[9px] font-extrabold hover:bg-cyan-400 transition-colors uppercase tracking-wider text-center cursor-pointer"
                >
                  {actionLabel}
                </button>
              </motion.div>
            );
          })() : null}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}

/**
 * Render a message with context triggers
 */
export function MessageTextWithTeacherContext({
  text,
  contexts,
  onAction,
}: {
  text: string;
  contexts: DetectedContext[];
  onAction: (context: DetectedContext) => void;
}) {
  if (contexts.length === 0) {
    return <span>{text}</span>;
  }

  // Sort contexts by confidence (highest first)
  const sortedContexts = [...contexts].sort((a, b) => b.confidence - a.confidence);

  // For simplicity, wrap only the highest confidence context
  // In production, could wrap multiple with different styling
  const primaryContext = sortedContexts[0];

  // Try to find the trigger text in the message
  const triggerMatch = text.match(new RegExp(primaryContext.trigger, "i"));
  if (!triggerMatch) {
    return <span>{text}</span>;
  }

  const triggerText = triggerMatch[0];
  const parts = text.split(new RegExp(`(${primaryContext.trigger})`, "i"));

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.toLowerCase() === triggerText.toLowerCase()) {
          return (
            <TeacherContextTrigger
              key={idx}
              text={part}
              contextType={primaryContext.type}
              contextTitle={primaryContext.title || "Context Detected"}
              contextDescription={primaryContext.description}
              actionLabel={primaryContext.actionLabel}
              meta={primaryContext.date ? `Due: ${primaryContext.date}` : undefined}
              confidence={primaryContext.confidence}
              onAction={() => onAction(primaryContext)}
            />
          );
        }
        return part;
      })}
    </span>
  );
}
