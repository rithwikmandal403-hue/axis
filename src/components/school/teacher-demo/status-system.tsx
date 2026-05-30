"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Status Types
export type StatusType = "teaching" | "available" | "in_meeting" | "planning" | "away" | "unavailable" | "busy";

export interface StatusOption {
  id: StatusType;
  label: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

// Scenarios representing different times/contexts of a school day
export interface Scenario {
  id: string;
  title: string;
  timeString: string;
  statusId: StatusType;
  contextTitle: string;
  contextDetail: string;
  sensors: {
    timetable: string;
    calendar: string;
    location: string;
    device: string;
  };
}

export function StatusSystem() {
  // Define available statuses
  const statuses: StatusOption[] = [
    {
      id: "available",
      label: "Available",
      color: "bg-emerald-500",
      glowColor: "rgba(16, 185, 129, 0.4)",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/[0.04]",
      description: "Visible to staff and students; open for coordination or coverage.",
    },
    {
      id: "teaching",
      label: "Teaching",
      color: "bg-amber-500",
      glowColor: "rgba(245, 158, 11, 0.4)",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/[0.04]",
      description: "Mutes notifications; updates classroom board display mode.",
    },
    {
      id: "in_meeting",
      label: "In Meeting",
      color: "bg-blue-500",
      glowColor: "rgba(59, 130, 246, 0.4)",
      borderColor: "border-blue-500/20",
      bgColor: "bg-blue-500/[0.04]",
      description: "Auto-syncs with calendar events; routes urgent calls only.",
    },
    {
      id: "planning",
      label: "Planning",
      color: "bg-sky-400",
      glowColor: "rgba(56, 189, 248, 0.4)",
      borderColor: "border-sky-400/20",
      bgColor: "bg-sky-400/[0.04]",
      description: "Prep block; alerts limited to critical department items.",
    },
    {
      id: "away",
      label: "Away",
      color: "bg-neutral-500",
      glowColor: "rgba(115, 115, 115, 0.4)",
      borderColor: "border-neutral-500/20",
      bgColor: "bg-neutral-500/[0.04]",
      description: "Offline or out of range. Messages are queued.",
    },
    {
      id: "busy",
      label: "Busy (Do Not Disturb)",
      color: "bg-rose-500",
      glowColor: "rgba(244, 63, 94, 0.4)",
      borderColor: "border-rose-500/20",
      bgColor: "bg-rose-500/[0.04]",
      description: "Manual Override. All notifications muted except school-wide alerts.",
    },
    {
      id: "unavailable",
      label: "Unavailable",
      color: "bg-red-700",
      glowColor: "rgba(185, 28, 28, 0.4)",
      borderColor: "border-red-700/20",
      bgColor: "bg-red-700/[0.04]",
      description: "Manual Override. Set offline across all schedules and portals.",
    },
  ];

  // Define scenarios
  const scenarios: Scenario[] = [
    {
      id: "teaching_period",
      title: "1. Period 2 Class",
      timeString: "10:15 AM",
      statusId: "teaching",
      contextTitle: "Teaching Grade 11 Physics | Room B12 • Period 2",
      contextDetail: "Axis detected you are in Room B12 and the Period 2 bell has rung. Muting notifications & setting dashboard to focus mode.",
      sensors: {
        timetable: "Period 2: Gr 11 Physics (10:15 - 11:30)",
        calendar: "No conflicting meetings",
        location: "Science Wing - Room B12",
        device: "Smartboard Connected"
      }
    },
    {
      id: "prep_period",
      title: "2. Free Prep Block",
      timeString: "11:30 AM",
      statusId: "planning",
      contextTitle: "Prep Period | Office 204 • Next class in 45m",
      contextDetail: "Axis detected you are in your office with no scheduled classes. Recommending student query bookings.",
      sensors: {
        timetable: "Period 3: Prep Period (11:30 - 12:15)",
        calendar: "No conflicting meetings",
        location: "Faculty Lounge - Office 204",
        device: "Desktop Station Active"
      }
    },
    {
      id: "staff_sync",
      title: "3. Staff Sync",
      timeString: "12:15 PM",
      statusId: "in_meeting",
      contextTitle: "Staff Sync | Conference Room A • Ends in 12m",
      contextDetail: "Calendar sync indicates Academic Sync is in progress. Diverting calls to Assistant Principal.",
      sensors: {
        timetable: "No scheduled class",
        calendar: "Dept. Sync (12:15 - 13:00)",
        location: "Admin Wing - Conf Room A",
        device: "Laptop (Active Google Meet)"
      }
    },
    {
      id: "cancelled_class",
      title: "4. Class Cancelled",
      timeString: "1:40 PM",
      statusId: "available",
      contextTitle: "Period 5 Cancelled | Available for coverage",
      contextDetail: "Chemistry class cancelled by Admin. Axis updated status to Available and flagged you for potential cover options.",
      sensors: {
        timetable: "Period 5: Chemistry (Cancelled by Admin)",
        calendar: "No conflicting meetings",
        location: "Library - Study Center",
        device: "Tablet Connected"
      }
    },
    {
      id: "away_hours",
      title: "5. After Hours",
      timeString: "4:00 PM",
      statusId: "away",
      contextTitle: "Out of Office | Desktop Lock Detected",
      contextDetail: "You have left the school campus and your workspace terminal is locked. Auto-sync paused.",
      sensors: {
        timetable: "School Day Completed",
        calendar: "No conflicting meetings",
        location: "Off-Campus (Geofence Exit)",
        device: "All Terminals Offline"
      }
    }
  ];

  // State Management
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [manualOverrideStatus, setManualOverrideStatus] = useState<StatusType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState<boolean>(true);
  
  // Triggers for cyan/violet animation pulse
  const [lastStatusId, setLastStatusId] = useState<StatusType>("teaching");
  const [pulseKey, setPulseKey] = useState<number>(0);

  const currentScenario = scenarios[activeScenarioIndex];
  
  // Calculate final status
  const currentStatusId = manualOverrideStatus || currentScenario.statusId;
  const selectedStatus = statuses.find((s) => s.id === currentStatusId) || statuses[0];

  // Auto-cycling Scenario Engine
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveScenarioIndex((prev) => (prev + 1) % scenarios.length);
    }, 10000); // cycle scenarios every 10 seconds
    return () => clearInterval(interval);
  }, [isAutoCycling, scenarios.length]);

  // Trigger glowing pulse overlay on status change
  useEffect(() => {
    if (currentStatusId !== lastStatusId) {
      setLastStatusId(currentStatusId);
      setPulseKey((prev) => prev + 1);
    }
  }, [currentStatusId, lastStatusId]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0A0C]/70 backdrop-blur-md p-safe-lg shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      
      {/* Dynamic Pulse Animation Glow Layer */}
      <AnimatePresence>
        {pulseKey > 0 && (
          <>
            <motion.div
              key={`pulse-cyan-${pulseKey}`}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.03 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-2xl border border-cyan-400 pointer-events-none z-10"
            />
            <motion.div
              key={`pulse-violet-${pulseKey}`}
              initial={{ opacity: 0.9, scale: 0.98 }}
              animate={{ opacity: 0, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-2xl border border-violet-500 pointer-events-none z-10"
            />
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-safe-md">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
            Operational Status
          </span>
          
          {/* Status Mode Badge */}
          <div className="flex items-center gap-1.5">
            {manualOverrideStatus ? (
              <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose-400 border border-rose-500/20">
                <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Override Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-400 border border-cyan-500/20">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60 opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-cyan-400"></span>
                </span>
                Axis Auto-Sync
              </span>
            )}
          </div>
        </div>

        {/* Selected Status Selector & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-all hover:bg-white/[0.05] active:scale-[0.99]`}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex size-3">
                <span 
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulse" 
                  style={{ backgroundColor: selectedStatus.glowColor }} 
                />
                <span className={`relative inline-flex size-3 rounded-full ${selectedStatus.color}`} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">{selectedStatus.label}</span>
                {manualOverrideStatus && (
                  <span className="text-[10px] text-white/30">Click to resume auto-sync</span>
                )}
              </div>
            </div>
            
            <svg
              className={`size-4 text-white/40 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Status Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Close backdrop */}
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0E0E12] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.9)] scrollbar-none"
                >
                  {/* Option 1: Resume Auto Sync (only visible when override is active) */}
                  {manualOverrideStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualOverrideStatus(null);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-3 py-2.5 text-left text-cyan-400 transition-all mb-1.5"
                    >
                      <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight">Resume Axis Auto-Sync</span>
                        <span className="text-[9px] text-cyan-400/70">Enable automatic timetable routing</span>
                      </div>
                    </button>
                  )}

                  {/* Manual Overrides header */}
                  <div className="px-3 py-1.5 text-[9px] font-bold text-white/30 tracking-wider uppercase">
                    Set Manual Override
                  </div>

                  {statuses.map((item) => {
                    const isCurrent = manualOverrideStatus === item.id || (!manualOverrideStatus && currentScenario.statusId === item.id);
                    const isManualOnly = item.id === "busy" || item.id === "unavailable";
                    
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setManualOverrideStatus(item.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition-all ${
                          isCurrent
                            ? "bg-white/[0.06] text-white"
                            : "text-white/60 hover:bg-white/[0.02] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${item.color}`} />
                          <span className="text-xs font-semibold tracking-tight">
                            {item.label} 
                            {isManualOnly && <span className="ml-1 text-[9px] font-normal text-white/30">(Override)</span>}
                          </span>
                        </div>
                        <span className="mt-0.5 text-[9px] text-white/30 leading-snug">
                          {item.description}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Context Explanation Card */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/30 uppercase tracking-widest">
            <span>Context Sync Feed</span>
            <span className="flex items-center gap-1 text-[9px]">
              <span className={`size-1 rounded-full ${manualOverrideStatus ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={manualOverrideStatus ? "text-amber-400" : "text-emerald-400"}>
                {manualOverrideStatus ? "Override Active" : "Synced"}
              </span>
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {manualOverrideStatus ? (
              <>
                <p className="text-xs leading-relaxed text-white/70">
                  Your status is locked to <strong className="text-white font-semibold">{selectedStatus.label}</strong>.
                </p>
                <div className="text-[10px] leading-snug text-white/40 border-t border-white/[0.03] pt-1.5 mt-1.5">
                  <span className="text-[9px] font-semibold text-amber-500/80 uppercase block tracking-wider mb-0.5">Axis Recommendation</span>
                  Based on timetable context, Axis would set your status to <strong className="text-white/70">{statuses.find(s => s.id === currentScenario.statusId)?.label}</strong>.
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-medium leading-relaxed text-white">
                  {currentScenario.contextTitle}
                </p>
                <p className="text-[10px] leading-relaxed text-white/45">
                  {currentScenario.contextDetail}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Live Diagnostics Grid (Shows sensor inputs) */}
        <div className="rounded-xl border border-white/[0.03] bg-black/20 p-3">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider block mb-2">
            Ecosystem Signals
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* Timetable Sync */}
            <div className="flex items-start gap-2 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2">
              <svg className="size-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="overflow-hidden">
                <span className="block text-[8px] font-bold text-white/35 uppercase">Timetable</span>
                <span className="block text-white/60 truncate font-medium">{currentScenario.sensors.timetable}</span>
              </div>
            </div>

            {/* Calendar Event */}
            <div className="flex items-start gap-2 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2">
              <svg className="size-3.5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div className="overflow-hidden">
                <span className="block text-[8px] font-bold text-white/35 uppercase">Calendar</span>
                <span className="block text-white/60 truncate font-medium">{currentScenario.sensors.calendar}</span>
              </div>
            </div>

            {/* GPS/Beacons Location */}
            <div className="flex items-start gap-2 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2">
              <svg className="size-3.5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="overflow-hidden">
                <span className="block text-[8px] font-bold text-white/35 uppercase">Location</span>
                <span className="block text-white/60 truncate font-medium">{currentScenario.sensors.location}</span>
              </div>
            </div>

            {/* Device Terminal */}
            <div className="flex items-start gap-2 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2">
              <svg className="size-3.5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <div className="overflow-hidden">
                <span className="block text-[8px] font-bold text-white/35 uppercase">Device Status</span>
                <span className="block text-white/60 truncate font-medium">{currentScenario.sensors.device}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Dashboard */}
        <div className="mt-1 border-t border-white/[0.04] pt-3">
          <button
            type="button"
            onClick={() => setIsSimulatorExpanded(!isSimulatorExpanded)}
            className="flex w-full items-center justify-between text-[10px] font-bold text-cyan-400/80 hover:text-cyan-400 uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Demo Simulator Dashboard
            </div>
            <svg
              className={`size-3 text-cyan-400/60 transition-transform duration-200 ${isSimulatorExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <AnimatePresence>
            {isSimulatorExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden mt-2.5 space-y-2.5"
              >
                {/* Auto Cycle Controls */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg p-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-white/70">Auto-Progress Schedule</span>
                    <span className="text-[8px] text-white/30">Cycle scenarios on a 10s timer</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsAutoCycling(!isAutoCycling)}
                    className={`rounded px-2.5 py-1 text-[9px] font-bold transition-all ${
                      isAutoCycling 
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                        : "bg-white/[0.05] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                  >
                    {isAutoCycling ? "PAUSE CYCLE" : "AUTO PLAY"}
                  </button>
                </div>

                {/* Progress bar */}
                {isAutoCycling && (
                  <div className="h-0.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <motion.div
                      key={`${activeScenarioIndex}_${isAutoCycling}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    />
                  </div>
                )}

                {/* Scenario Selection Grid */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8.5px] font-bold text-white/30 uppercase tracking-wide">
                    Select Day Event Scenario
                  </span>
                  
                  <div className="flex flex-col gap-1">
                    {scenarios.map((sc, index) => {
                      const isActive = index === activeScenarioIndex;
                      const scStatus = statuses.find(s => s.id === sc.statusId) || statuses[0];
                      
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setActiveScenarioIndex(index);
                            setIsAutoCycling(false); // Pause auto cycling on manual click
                          }}
                          className={`flex items-center justify-between rounded-lg p-2 text-left border transition-all text-[10px] ${
                            isActive
                              ? "bg-cyan-500/[0.06] border-cyan-500/30 text-white font-medium shadow-[0_2px_8px_-4px_rgba(34,211,238,0.2)]"
                              : "bg-white/[0.01] border-white/[0.03] text-white/55 hover:bg-white/[0.03] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`size-1.5 rounded-full ${scStatus.color}`} />
                            <span className="truncate">{sc.title}</span>
                          </div>
                          <span className="text-[8.5px] font-mono text-white/30 text-right flex-shrink-0">
                            {sc.timeString}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
