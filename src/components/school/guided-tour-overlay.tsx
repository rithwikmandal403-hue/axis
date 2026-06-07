"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDemoTutorial } from "./demo-tutorial-context";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";
import { useEffect, useRef } from "react";

interface GuidedTourOverlayProps {
  theme: Theme;
}

export function GuidedTourOverlay({ theme }: GuidedTourOverlayProps) {
  const styles = getAxisTheme(theme);
  const {
    steps,
    activeStepIndex,
    isTutorialActive,
    nextStep,
    prevStep,
    endTutorial,
  } = useDemoTutorial();

  const highlightRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted element into view
  useEffect(() => {
    if (steps && activeStepIndex >= 0 && steps[activeStepIndex]?.highlight) {
      const element = document.querySelector(`[data-tour-highlight="${steps[activeStepIndex].highlight}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeStepIndex, steps]);

  if (!isTutorialActive || activeStepIndex < 0) return null;
  if (!steps || steps.length === 0) return null;

  const currentStep = steps[activeStepIndex];
  if (!currentStep) return null;

  const isFinalStep = currentStep.isFinal || false;
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      endTutorial();
      if (typeof window !== "undefined") {
        localStorage.setItem("axis-tour-has-run", "true");
      }
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    endTutorial();
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-tour-has-run", "true");
    }
  };

  const handleReplay = () => {
    endTutorial();
    if (typeof window !== "undefined") {
      localStorage.removeItem("axis-tour-has-run");
    }
  };

  return (
    <AnimatePresence>
      {isTutorialActive && (
        <>
          {/* Dark overlay with spotlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
            onClick={handleSkip}
          >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Highlight spotlight */}
            {currentStep?.highlight && (
              <motion.div
                key={currentStep.highlight}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  ref={highlightRef}
                  className="relative"
                  style={{
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-lg border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-pulse`}
                    style={{
                      boxShadow: "0 0 40px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Tour card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              theme === "light"
                ? "bg-white border-black/[0.08]"
                : "bg-[#0E0E10]/95 border-white/[0.08]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === activeStepIndex
                          ? "w-8 bg-cyan-400"
                          : idx < activeStepIndex
                            ? "w-2 bg-cyan-400/50"
                            : "w-2 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-medium ${theme === "light" ? "text-black/50" : "text-white/50"}`}>
                  {activeStepIndex + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className={`text-[10px] font-medium transition-colors ${
                  theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"
                }`}
              >
                Skip Tour
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {isFinalStep && currentStep?.welcomeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center py-4 ${theme === "light" ? "text-black" : "text-white"}`}
                >
                  <h2 className="text-2xl font-bold mb-2">{currentStep.welcomeMessage}</h2>
                </motion.div>
              )}

              <div>
                <h3 className={`text-lg font-bold mb-2 ${theme === "light" ? "text-black" : "text-white"}`}>
                  {currentStep?.title}
                </h3>
                <p className={`text-sm leading-relaxed ${theme === "light" ? "text-black/70" : "text-white/70"}`}>
                  {currentStep?.description}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isFirstStep
                      ? "opacity-30 cursor-not-allowed"
                      : theme === "light"
                        ? "bg-black/[0.02] border border-black/[0.06] text-black/70 hover:bg-black/[0.05]"
                        : "bg-white/[0.02] border border-white/[0.06] text-white/70 hover:bg-white/[0.05]"
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {isFinalStep && currentStep?.secondaryButton && (
                    <button
                      onClick={handleReplay}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        theme === "light"
                          ? "bg-black/[0.02] border border-black/[0.06] text-black/70 hover:bg-black/[0.05]"
                          : "bg-white/[0.02] border border-white/[0.06] text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      {currentStep.secondaryButton}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                      isFinalStep
                        ? "bg-cyan-400 hover:bg-cyan-300 text-black"
                        : theme === "light"
                          ? "bg-black text-white hover:bg-black/90"
                          : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {isFinalStep ? currentStep?.primaryButton || "Finish" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
