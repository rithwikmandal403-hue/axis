"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";
import { useDemoTutorial } from "@/components/school/demo-tutorial-context";
import { AnnouncementsPanel } from "./teacher-demo/announcements-panel";
import { NotificationsSystem } from "./teacher-demo/notifications-system";

interface SharedDemoHeaderProps {
  perspectiveLabel: string;
  perspectiveId: string;
  userName: string;
  userAvatar: string;
  dateInfo?: string;
  updatesInfo?: string;
  theme: Theme;
  onAdoptClick: () => void;
  onAnnouncementView?: () => void;
  onNotificationView?: () => void;
}

export function SharedDemoHeader({
  perspectiveLabel,
  perspectiveId,
  userName,
  userAvatar,
  dateInfo = "Monday, August 28",
  updatesInfo = "2 coordination updates",
  theme,
  onAdoptClick,
  onAnnouncementView,
  onNotificationView,
}: SharedDemoHeaderProps) {
  const styles = getAxisTheme(theme);
  const { activeStepIndex, isTutorialActive, startTutorial, endTutorial } =
    useDemoTutorial();

  const [hasRunTour, setHasRunTour] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tourHasRun = localStorage.getItem("axis-tour-has-run") === "true";
      setHasRunTour(tourHasRun);
      
      const coachMarkDismissed = localStorage.getItem("axis-tour-coach-mark-dismissed");
      if (coachMarkDismissed !== "true") {
        setShowCoachMark(true);
      }
    }
  }, []);

  const handleDismissCoachMark = () => {
    setShowCoachMark(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-tour-coach-mark-dismissed", "true");
    }
  };

  const handleStartTourManual = () => {
    setShowCoachMark(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-tour-has-run", "true");
    }
    setHasRunTour(true);
    startTutorial();
  };

  const handleSkipOrExit = () => {
    endTutorial();
  };

  return (
    <header className={`relative z-20 flex h-24 items-center justify-between border-b px-safe-lg md:px-safe-xl ${styles.border}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <Link
            href="/school/experience"
            className={`text-xs transition-colors ${
              theme === "light"
                ? "text-black/40 hover:text-black"
                : "text-white/40 hover:text-white"
            }`}
          >
            ← Exit console
          </Link>
          <span className={`size-1 rounded-full ${
            theme === "light" ? "bg-black/20" : "bg-white/20"
          }`} />
          <span className={`text-[10px] font-semibold tracking-widest uppercase ${
            theme === "light" ? "text-black/45" : "text-white/45"
          }`}>
            {perspectiveId === "coordinator" 
              ? "DIPLOMA PROGRAMME COORDINATOR" 
              : `${perspectiveLabel} Mode (${perspectiveId})`}
          </span>
        </div>
        
        <div className="mt-2 flex items-baseline gap-2.5 flex-wrap">
          <h1 className={`text-sm font-semibold tracking-tight ${styles.textPrimary}`}>
            Welcome back, {userName}.
          </h1>
          {perspectiveId === "coordinator" && (
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              DP Coordinator
            </span>
          )}
          <span className={`text-xs font-normal tracking-tight ${
            theme === "light" ? "text-black/35" : "text-white/35"
          }`}>
            · {dateInfo} · {updatesInfo}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Announcements & Notifications Popovers */}
        <div className={`flex items-center gap-3 p-1 rounded-xl transition-all duration-300 ${
          isTutorialActive && activeStepIndex === 14 
            ? theme === "light"
              ? "tour-highlight bg-black/5"
              : "tour-highlight bg-white/5"
            : ""
        }`}>
          <div className={`p-0.5 rounded-lg transition-all ${
            isTutorialActive && activeStepIndex === 15 
              ? theme === "light"
                ? "tour-highlight bg-black/5"
                : "tour-highlight bg-white/5"
              : ""
          }`}>
            <AnnouncementsPanel 
              forceOpen={isTutorialActive && activeStepIndex === 15}
              onOpenChange={(open) => {
                if (open) {
                  onAnnouncementView?.();
                }
              }}
            />
          </div>
          <div className={`p-0.5 rounded-lg transition-all ${
            isTutorialActive && activeStepIndex === 16 
              ? theme === "light"
                ? "tour-highlight bg-black/5"
                : "tour-highlight bg-white/5"
              : ""
          }`}>
            <NotificationsSystem 
              forceOpen={isTutorialActive && activeStepIndex === 16}
              onOpenChange={(open) => {
                if (open) {
                  onNotificationView?.();
                }
              }}
            />
          </div>
          {/* Profile icon */}
          {perspectiveId !== "coordinator" && (
            <div className={`size-8 rounded-full border flex items-center justify-center text-[10px] font-bold select-none ${
              theme === "light"
                ? "bg-gray-100 border-black/10 text-black/60"
                : "bg-[#08080A] border-white/10 text-white/55"
            }`}>
              {userAvatar}
            </div>
          )}
        </div>

        <span className={`h-4 w-px ${theme === "light" ? "bg-black/10" : "bg-white/10"}`} />

        {/* Bring Axis To Your School button */}
        <button
          type="button"
          onClick={onAdoptClick}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-300 hover:scale-[1.02] flex items-center gap-1.5 ${
            theme === "light"
              ? "bg-black/[0.02] border-black/10 text-black/70 hover:border-black/25 hover:text-black"
              : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
          }`}
        >
          <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Bring Axis To Your School</span>
        </button>

        <span className={`h-4 w-px ${theme === "light" ? "bg-black/10" : "bg-white/10"}`} />

        {/* Guided tour button wrapper */}
        <div className="relative">
          <button
            type="button"
            onClick={isTutorialActive ? handleSkipOrExit : handleStartTourManual}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-300 ${
              isTutorialActive
                ? theme === "light"
                  ? "bg-black text-white border-black hover:bg-black/95"
                  : "bg-white text-black border-white hover:bg-white/95"
                : !hasRunTour
                  ? "bg-cyan-950/20 border-cyan-400/40 text-cyan-400 hover:border-cyan-400 hover:text-white guided-tour-pulse-btn"
                  : theme === "light"
                    ? "bg-black/[0.02] border-black/10 text-black/70 hover:border-black/25 hover:text-black"
                    : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
            }`}
          >
            {isTutorialActive ? "Exit Tour" : "Guided Tour"}
            {!hasRunTour && !isTutorialActive && (
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-400 text-[7px] font-black text-black uppercase tracking-wider scale-90 border border-[#050607]">
                Recommended
              </span>
            )}
          </button>

          {/* First-Time User Coach Mark Callout */}
          <AnimatePresence>
            {showCoachMark && !isTutorialActive && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`absolute right-0 top-full mt-3.5 z-50 w-72 rounded-2xl border p-safe-md shadow-2xl backdrop-blur-xl text-left ${
                  theme === "light"
                    ? "border-cyan-600/30 bg-white shadow-black/10"
                    : "border-cyan-400/30 bg-[#0E0E10]/95 shadow-black/80"
                }`}
              >
                {/* Arrow pointing up */}
                <div className={`absolute right-8 -top-1.5 size-3 rotate-45 border-l border-t ${
                  theme === "light"
                    ? "border-cyan-600/30 bg-white"
                    : "border-cyan-400/30 bg-[#0E0E10]"
                }`} />
                
                <div className="relative space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-[11px] leading-relaxed font-medium ${
                      theme === "light" ? "text-black/80" : "text-white/90"
                    }`}>
                      Start here for a quick walkthrough of Axis.
                    </p>
                    <button
                      type="button"
                      onClick={handleDismissCoachMark}
                      className={`transition-colors p-0.5 text-xs shrink-0 select-none ${
                        theme === "light" ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"
                      }`}
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowCoachMark(false);
                      startTutorial();
                    }}
                    className={`w-full text-center py-2 px-3 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest ${styles.buttonPrimary}`}
                  >
                    Start Guided Tour
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
