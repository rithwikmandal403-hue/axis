"use client";

import { useEffect, useState } from "react";
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
        e.preventDefault();
        setCaptureState("capturing");
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
            {(captureState === "capturing" || captureState === "cardOpen") && startPoint && currentPoint && (
              <div
                className="pointer-events-none absolute border border-dashed border-white/50 bg-white/[0.03] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
                style={getSelectionBoxStyles()}
              />
            )}

            {/* Glassmorphic Capture Card Popup (Floating Bottom-Right Preview) */}
            {captureState === "cardOpen" && startPoint && currentPoint && (
              <div className="fixed bottom-6 right-6 w-80 z-50">
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 p-4 shadow-[0_12px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-white space-y-3"
                >
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-sky-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                        Context Capture
                      </span>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-white/40 hover:text-white transition-colors text-[10px] font-bold"
                    >
                      Discard
                    </button>
                  </div>

                  {/* Crop Preview Graphic */}
                  {(() => {
                    const w = Math.abs(currentPoint.x - startPoint.x);
                    const h = Math.abs(currentPoint.y - startPoint.y);
                    return (
                      <div className="relative h-20 w-full rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
                        <div className="flex flex-col items-center gap-1 z-10">
                          <svg className="size-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          </svg>
                          <span className="text-[9px] font-mono text-cyan-300 font-semibold">{w} × {h} Snip</span>
                        </div>
                        <div className="absolute bottom-1 right-2 text-[7px] font-mono text-white/20">AXIS SNIPPER</div>
                      </div>
                    );
                  })()}

                  {/* Form fields */}
                  <div className="space-y-2.5">
                    
                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold">Quick Note</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What's important here?"
                        className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none font-semibold"
                        autoFocus
                      />
                    </div>

                    {/* Settings columns */}
                    <div className="grid grid-cols-2 gap-2">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold">Tag</label>
                        <select
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2 py-1 text-[11px] text-white focus:outline-none font-semibold"
                        >
                          <option value="Physics IA">Physics IA</option>
                          <option value="Lab Sync">Lab Sync Space</option>
                          <option value="Student Stress">Student stress sync</option>
                          <option value="Cover Opportunity">Substitute cover</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold">Link Person</label>
                        <select
                          value={linkedPerson}
                          onChange={(e) => setLinkedPerson(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-2 py-1 text-[11px] text-white focus:outline-none font-semibold"
                        >
                          <option value="Chloe Vance">Chloe Vance</option>
                          <option value="Emma Watson">Emma Watson</option>
                          <option value="Marcus Vance">Marcus Vance</option>
                          <option value="Sarah Chen">Sarah Chen (Guidance)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold">Importance</label>
                      <div className="flex gap-1.5">
                        {["low", "normal", "urgent"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setImportance(level)}
                            className={`flex-1 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors ${
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

                    {/* Action triggers */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-white/70 hover:text-white hover:bg-white/10 transition-all text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-1.5 rounded-xl bg-cyan-400 text-zinc-950 font-bold uppercase text-[10px] hover:bg-cyan-300 transition-all text-center animate-pulse"
                      >
                        Save
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

