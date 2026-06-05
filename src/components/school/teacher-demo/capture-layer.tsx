"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CapturedItem = {
  id: string;
  type: "space" | "support" | "counselor" | "coordination" | "resource" | "deadline" | "attendance";
  title: string;
  description: string;
  meta: string;
  actionLabel?: string;
  active: boolean;
  note?: string;
  tags?: string[];
  dimensions?: string;
  date?: string;
  fromEssentialSpace?: boolean;
};

type CaptureLayerProps = {
  onSaveCapture: (item: CapturedItem) => void;
};

type Point = { x: number; y: number };

export function CaptureLayer({ onSaveCapture }: CaptureLayerProps) {
  const [captureState, setCaptureState] = useState<"idle" | "capturing" | "cardOpen">("idle");
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Card form states
  const [note, setNote] = useState("");
  const [tag, setTag] = useState("Physics IA");
  const [importance, setImportance] = useState("normal");
  const [linkedPerson, setLinkedPerson] = useState("Chloe Vance");

  const lastKeyPressTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is writing in inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if ((e.key === "e" || e.key === "E") && captureState === "idle") {
        const now = Date.now();
        const diff = now - lastKeyPressTimeRef.current;
        if (diff > 0 && diff < 300) {
          setCaptureState("capturing");
        }
        lastKeyPressTimeRef.current = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [captureState]);

  useEffect(() => {
    const handleTriggerDemo = () => {
      // Step 1: Open capturing overlay
      setCaptureState("capturing");
      setStartPoint({ x: 220, y: 150 });
      setCurrentPoint({ x: 220, y: 150 });
      
      // Step 2: Animate drag coordinates over 1.5 seconds
      let step = 0;
      const totalSteps = 30;
      const interval = setInterval(() => {
        step += 1;
        setCurrentPoint({
          x: 220 + (420 * step) / totalSteps,
          y: 150 + (330 * step) / totalSteps,
        });
        if (step >= totalSteps) {
          clearInterval(interval);
          
          // Step 3: Transition to cardOpen
          setTimeout(() => {
            setCaptureState("cardOpen");
            
            // Step 4: Animate typing of note
            const demoNote = "Refraction optics diagram template for next lab session.";
            let charIndex = 0;
            const typeInterval = setInterval(() => {
              charIndex += 1;
              setNote(demoNote.substring(0, charIndex));
              if (charIndex >= demoNote.length) {
                clearInterval(typeInterval);
                
                // Step 5: Save automatically after 1.2 seconds
                setTimeout(() => {
                  // Simulate save action
                  const w = 420;
                  const h = 330;
                  const newItem: CapturedItem = {
                    id: `cap-${Date.now()}`,
                    type: "space",
                    title: demoNote,
                    description: demoNote,
                    meta: `${new Date().toLocaleDateString()} · ${w}x${h}px`,
                    actionLabel: "Quick Open",
                    active: true,
                    note: demoNote,
                    tags: ["Physics IA"],
                    dimensions: `${w}x${h}`,
                    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString(),
                    fromEssentialSpace: true,
                  };
                  
                  onSaveCapture(newItem);
                  
                  // Reset states
                  setCaptureState("idle");
                  setStartPoint(null);
                  setCurrentPoint(null);
                  setNote("");
                  
                  // Trigger toast visual
                  setShowToast(true);
                  setTimeout(() => {
                    setShowToast(false);
                  }, 2000);
                  
                }, 1200);
              }
            }, 40); // type a char every 40ms
          }, 600);
        }
      }, 50); // drag update every 50ms
    };

    window.addEventListener("axis-trigger-capture-demo", handleTriggerDemo);
    return () => window.removeEventListener("axis-trigger-capture-demo", handleTriggerDemo);
  }, [onSaveCapture]);

  // Mouse drag handlers for capturing screen region
  const handleMouseDown = (e: React.MouseEvent) => {
    if (captureState !== "capturing") return;
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint) return;
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (startPoint && currentPoint) {
      const dx = Math.abs(currentPoint.x - startPoint.x);
      const dy = Math.abs(currentPoint.y - startPoint.y);
      // Ensure the drag was significant (at least 15px)
      if (dx > 15 && dy > 15) {
        setCaptureState("cardOpen");
      } else {
        // Reset if just a click
        setStartPoint(null);
        setCurrentPoint(null);
      }
    }
  };

  const handleSave = () => {
    const w = startPoint && currentPoint ? Math.abs(startPoint.x - currentPoint.x) : 0;
    const h = startPoint && currentPoint ? Math.abs(startPoint.y - currentPoint.y) : 0;

    const newItem: CapturedItem = {
      id: `cap-${Date.now()}`,
      type: "space",
      title: note || `Captured Region (${w}x${h})`,
      description: note || "Captured screen region context.",
      meta: `${new Date().toLocaleDateString()} · ${w}x${h}px`,
      actionLabel: "Quick Open",
      active: true,
      note: note || "Captured screen region",
      tags: [tag],
      dimensions: `${w}x${h}`,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString(),
    };

    onSaveCapture(newItem);
    handleCancel();

    // Trigger visual toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleCancel = () => {
    setCaptureState("idle");
    setStartPoint(null);
    setCurrentPoint(null);
    setNote("");
    setTag("Physics IA");
    setImportance("normal");
    setLinkedPerson("Chloe Vance");
  };

  // Selection box box specs
  const getSelectionBoxStyles = () => {
    if (!startPoint || !currentPoint) return {};
    const left = Math.min(startPoint.x, currentPoint.x);
    const top = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(startPoint.x - currentPoint.x);
    const height = Math.abs(startPoint.y - currentPoint.y);

    return {
      left,
      top,
      width,
      height,
    };
  };

  return (
    <>
      <AnimatePresence>
        {captureState !== "idle" && (
          <div className="fixed inset-0 z-50 overflow-hidden select-none select-none-all">
            
            {/* Dimmed Blurred Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#000]/60 backdrop-blur-xs cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {captureState === "capturing" && (
                <div className="absolute left-6 top-6 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[10px] font-semibold text-white/50 tracking-widest uppercase">
                    Axis Capture Active
                  </span>
                  <p className="text-[9px] text-white/30 mt-0.5">Drag to capture screen space context</p>
                </div>
              )}
            </motion.div>

            {/* Selection Box Render */}
            {captureState === "capturing" && startPoint && currentPoint && (
              <div
                className="pointer-events-none absolute border border-dashed border-white/50 bg-white/[0.03] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
                style={getSelectionBoxStyles()}
              />
            )}

            {/* Glassmorphic Capture Card Popup */}
            {captureState === "cardOpen" && (
              <div className="fixed inset-0 flex items-center justify-center p-6 z-50">
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-white"
                >
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-sky-400 animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/55">
                        Context Capture
                      </span>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-white/30 hover:text-white transition-colors text-xs"
                    >
                      Discard (Esc)
                    </button>
                  </div>

                  {/* Crop Preview Graphic */}
                  {(() => {
                    const w = startPoint && currentPoint ? Math.abs(startPoint.x - currentPoint.x) : 0;
                    const h = startPoint && currentPoint ? Math.abs(startPoint.y - currentPoint.y) : 0;
                    return (
                      <div className="mt-4 relative aspect-video w-full rounded-xl bg-zinc-950/80 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px]" />
                        <div className="absolute border border-cyan-400 bg-cyan-500/10 rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.25)] flex items-center justify-center p-2 text-center"
                             style={{
                               width: Math.max(70, Math.min(180, w * 0.25)),
                               height: Math.max(40, Math.min(100, h * 0.25)),
                             }}>
                          <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest leading-none">Crop Area</span>
                        </div>
                        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/30">
                          {w} x {h} px
                        </div>
                      </div>
                    );
                  })()}

                  {/* Form fields */}
                  <div className="mt-4 space-y-4">
                    
                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/35 font-semibold uppercase tracking-wider">Quick Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What's important here?"
                        className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none"
                        autoFocus
                      />
                    </div>

                    {/* Settings columns */}
                    <div className="grid grid-cols-2 gap-3.5">
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/35 font-semibold uppercase tracking-wider">Contextual Tag</label>
                        <select
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Physics IA">Physics IA</option>
                          <option value="Lab Sync">Lab Sync Space</option>
                          <option value="Student Stress">Student stress sync</option>
                          <option value="Cover Opportunity">Substitute cover</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/35 font-semibold uppercase tracking-wider">Link Person</label>
                        <select
                          value={linkedPerson}
                          onChange={(e) => setLinkedPerson(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Chloe Vance">Chloe Vance</option>
                          <option value="Emma Watson">Emma Watson</option>
                          <option value="Marcus Vance">Marcus Vance</option>
                          <option value="Sarah Chen">Sarah Chen (Guidance)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/35 font-semibold uppercase tracking-wider">Importance</label>
                      <div className="flex gap-2">
                        {["low", "normal", "urgent"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setImportance(level)}
                            className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                              importance === level
                                ? "bg-white text-black border-white"
                                : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-Contextual sensing indicator */}
                    <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                      <div className="text-[8px] font-bold text-white/35 uppercase tracking-widest">
                        Auto-Context Linked
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[9px] text-white/50">
                          Class: DP Physics B
                        </span>
                        <span className="rounded bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[9px] text-white/50">
                          Room: Lab 3
                        </span>
                        <span className="rounded bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[9px] text-white/50">
                          Time: Period 2
                        </span>
                        <span className="rounded bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[9px] text-white/50">
                          Fac: Aarav Chen
                        </span>
                      </div>
                    </div>

                    {/* Action triggers */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-xl border border-white/[0.08] bg-transparent px-4.5 py-2.5 text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-xl bg-white text-black px-5 py-2.5 text-xs font-bold shadow-soft"
                      >
                        Save to Essential Space
                      </button>
                    </div>

                  </div>

                </motion.div>
              </div>
            )}

          </div>
        )}
      </AnimatePresence>

      {/* Persistent Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0E0E10] border border-white/10 px-5 py-3 rounded-full text-xs text-white/90 shadow-2xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium tracking-tight">Saved to Context</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

