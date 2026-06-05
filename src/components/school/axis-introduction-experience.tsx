"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AxisIntroductionExperienceProps = {
  onComplete: () => void;
};

// ─── SHARED CONSTANTS ──────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const PHASE_DURATIONS: Record<number, number> = {
  0: 3800,
  1: 9000,
  2: 8000,
  3: 13000, // Ecosystem 3D
  4: 12000, // Essential Space
  5: 11000, // Context
  6: 14000, // Storytelling
  7: 9000,  // School Map
  8: 6500,  // Personalization
  9: 5000,  // Transition
};

const TOTAL_PHASES = 10;

const ECOSYSTEM_NODES = [
  { id: "core", x: 0, y: 0, size: 24, delay: 0, label: "Axis" },
  { id: "n1", x: -80, y: -60, size: 12, delay: 0.2, label: "Dashboard" },
  { id: "n2", x: 90, y: -40, size: 16, delay: 0.3, label: "Messages" },
  { id: "n3", x: -40, y: 80, size: 14, delay: 0.4, label: "Calendar" },
  { id: "n4", x: 70, y: 70, size: 10, delay: 0.5, label: "Classes" },
  { id: "n5", x: -120, y: 10, size: 12, delay: 0.6, label: "Meetings" },
  { id: "n6", x: 130, y: 15, size: 14, delay: 0.7, label: "Files" },
  { id: "n7", x: 20, y: -100, size: 10, delay: 0.8, label: "Notes" },
];

const CONNECTIONS = [
  { from: "core", to: "n1" },
  { from: "core", to: "n2" },
  { from: "core", to: "n3" },
  { from: "core", to: "n4" },
  { from: "core", to: "n5" },
  { from: "core", to: "n6" },
  { from: "core", to: "n7" },
  { from: "n1", to: "n5" },
  { from: "n2", to: "n6" },
  { from: "n3", to: "n4" },
  { from: "n7", to: "n1" },
  { from: "n7", to: "n2" },
];

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function AmbientGlow({ color = "rgba(255,255,255,0.04)", size = 900 }: { color?: string; size?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(circle ${size}px at 50% 50%, ${color} 0%, transparent 85%)`,
      }}
    />
  );
}

function NoiseTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function ProgressBar({ phase }: { phase: number }) {
  const progress = ((phase + 1) / TOTAL_PHASES) * 100;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] h-[2px] bg-white/[0.04]">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-400/40"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </div>
  );
}

// ─── BEAT 0: OPENING ───────────────────────────────────────────────────────────

function BeatOpening() {
  return (
    <motion.div
      key="beat-opening"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 -m-6 rounded-full"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.15, scale: 1.4 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)",
          }}
        />
        <div className="flex size-20 items-center justify-center rounded-3xl bg-white text-[#0A0A0B] font-extrabold text-4xl tracking-tighter shadow-[0_0_80px_rgba(255,255,255,0.12)]">
          A
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BEAT 1: THE PROBLEM ───────────────────────────────────────────────────────

function BeatProblem() {
  const lines = [
    "School workflows are fragmented.",
    "Information is scattered across systems.",
    "Context gets lost. Time is wasted.",
  ];

  return (
    <motion.div
      key="beat-problem"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center text-center max-w-lg px-6"
    >
      <div className="space-y-6">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 2.2, ease: EASE }}
            className="text-lg md:text-xl font-medium tracking-tight text-white/80 leading-relaxed"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

// ─── BEAT 2: THE PROMISE ───────────────────────────────────────────────────────

function BeatPromise() {
  return (
    <motion.div
      key="beat-promise"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center text-center max-w-xl px-6"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          background: "radial-gradient(circle 500px at 50% 50%, rgba(34,211,238,0.06) 0%, transparent 80%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="space-y-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="text-sm font-bold text-cyan-400 uppercase tracking-[0.25em]"
        >
          Introducing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6, ease: EASE }}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white"
        >
          Axis
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8, ease: EASE }}
          className="text-base md:text-lg text-white/60 leading-relaxed max-w-md mx-auto"
        >
          One connected environment for your entire school.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3.5, ease: EASE }}
          className="text-sm text-white/40 tracking-wide"
        >
          Less friction. More flow.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── BEAT 3: ECOSYSTEM NETWORK (3D) ────────────────────────────────────────────

function BeatEcosystemNetwork() {
  return (
    <motion.div
      key="beat-ecosystem-network"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center text-center px-6 w-full overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-12 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">
          A connected school system
        </p>
        <p className="text-[10px] text-white/50 tracking-widest uppercase">
          Watch how all components work together
        </p>
      </motion.div>

      {/* 3D Container */}
      <div className="relative w-80 h-80 md:w-[500px] md:h-[400px]" style={{ perspective: "1000px" }}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ rotateX: 65, rotateZ: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotateX: 55, rotateZ: 360, scale: 1, opacity: 1 }}
          transition={{
            rotateZ: { duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            rotateX: { duration: 2, ease: "easeOut" },
            scale: { duration: 1.5, ease: EASE },
            opacity: { duration: 1.5 },
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Orbital rings */}
          <div className="absolute size-48 rounded-full border border-cyan-500/20" />
          <div className="absolute size-72 rounded-full border border-cyan-500/10" />
          <div className="absolute size-96 rounded-full border border-white/[0.05]" />

          {/* Connections */}
          {CONNECTIONS.map((conn, i) => {
            const start = ECOSYSTEM_NODES.find((n) => n.id === conn.from)!;
            const end = ECOSYSTEM_NODES.find((n) => n.id === conn.to)!;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <motion.div
                key={`${conn.from}-${conn.to}`}
                className="absolute h-[1px] origin-left"
                style={{
                  width: length,
                  left: `calc(50% + ${start.x}px)`,
                  top: `calc(50% + ${start.y}px)`,
                  transform: `rotate(${angle}deg)`,
                  background: "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.3) 50%, rgba(34,211,238,0) 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.3 + 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Nodes */}
          {ECOSYSTEM_NODES.map((node) => (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: `calc(50% + ${node.x}px)`,
                top: `calc(50% + ${node.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: node.id === "core" ? 1 : 0.6 }}
              transition={{ duration: 0.6, delay: 0.8 + node.delay, ease: EASE }}
            >
              <div
                className="relative rounded-full bg-cyan-400"
                style={{
                  width: node.size,
                  height: node.size,
                  boxShadow: node.id === "core" ? "0 0 30px rgba(34,211,238,0.6)" : "0 0 10px rgba(34,211,238,0.3)",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border border-cyan-400"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{
                    duration: 2,
                    delay: node.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeOut",
                  }}
                />
              </div>
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[8px] font-semibold tracking-widest text-white/70 uppercase whitespace-nowrap"
                style={{ 
                  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                  transform: "rotateX(-55deg)", // Counter-rotate to face camera
                }}
              >
                {node.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── BEAT 4: ESSENTIAL SPACE ───────────────────────────────────────────────────

function BeatEssentialSpace() {
  return (
    <motion.div
      key="beat-essential-space"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 w-full max-w-2xl"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] mb-12"
      >
        Essential Space
      </motion.p>

      {/* Keystroke Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        className="flex gap-2 items-center mb-8"
      >
        <div className="flex gap-1">
          <motion.div
            animate={{ y: [0, 2, 0], backgroundColor: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"] }}
            transition={{ duration: 0.3, delay: 1.5, ease: "easeOut" }}
            className="size-10 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center font-mono text-sm shadow-inner"
          >
            E
          </motion.div>
          <motion.div
            animate={{ y: [0, 2, 0], backgroundColor: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"] }}
            transition={{ duration: 0.3, delay: 1.7, ease: "easeOut" }}
            className="size-10 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center font-mono text-sm shadow-inner"
          >
            E
          </motion.div>
        </div>
        <span className="text-xs text-white/40 uppercase tracking-widest ml-3">Double Tap E</span>
      </motion.div>

      {/* Capture Modal Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 2.1, ease: EASE }}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#121315] shadow-2xl p-5 mb-10 overflow-hidden relative"
      >
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
          <div className="size-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-white/80">Quick Capture</span>
        </div>
        
        <div className="space-y-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, delay: 2.8, ease: "easeOut" }}
            className="h-4 bg-white/10 rounded-md" 
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            transition={{ duration: 0.8, delay: 4.0, ease: "easeOut" }}
            className="h-4 bg-white/10 rounded-md" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 5.2, ease: EASE }}
          className="absolute bottom-4 right-5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30 uppercase tracking-wider font-semibold"
        >
          Saved to Essential Space
        </motion.div>
      </motion.div>

      <div className="space-y-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 6.5, ease: EASE }}
          className="text-xl font-medium tracking-tight text-white"
        >
          Nothing important gets lost.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 7.8, ease: EASE }}
          className="text-sm text-white/50"
        >
          Capture now. Find it when it matters.
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── BEAT 5: CONTEXT ───────────────────────────────────────────────────────────

function BeatContext() {
  return (
    <motion.div
      key="beat-context"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 w-full max-w-2xl text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.3em] mb-12"
      >
        Context
      </motion.p>

      {/* UI Mockup - Calendar + Note */}
      <div className="relative w-full max-w-lg h-48 flex items-center justify-center mb-10">
        
        {/* Calendar Event */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: -60 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          className="absolute z-10 w-64 rounded-xl border border-white/10 bg-[#121315] p-4 shadow-xl"
        >
          <div className="flex gap-3 mb-2">
            <div className="w-1 rounded bg-violet-400" />
            <div>
              <p className="text-xs font-semibold text-white">Department Meeting</p>
              <p className="text-[10px] text-white/50">Today, 2:00 PM</p>
            </div>
          </div>
        </motion.div>

        {/* Resurfaced Note */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 60, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.8, ease: EASE }}
          className="absolute z-20 w-56 rounded-xl border border-cyan-500/30 bg-[#0A0B0E] p-4 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cyan-400 text-xs">◆</span>
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Related Note</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-3/4 bg-white/10 rounded" />
          </div>
        </motion.div>

        {/* Connection Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.6 }}
          className="absolute z-0 w-32 h-[1px] bg-gradient-to-r from-violet-500/30 to-cyan-500/30"
        />
      </div>

      <div className="space-y-5">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.8, ease: EASE }}
          className="text-xl md:text-2xl font-medium tracking-tight text-white"
        >
          Context connects the dots.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 5.0, ease: EASE }}
          className="text-sm md:text-base text-white/70"
        >
          The right information at the right moment.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 6.5, ease: EASE }}
          className="text-xs text-white/40 tracking-wider"
        >
          Context keeps track so you don&apos;t have to.
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── BEAT 6: STORYTELLING (REAL-WORLD SCENARIOS) ───────────────────────────────

function BeatStorytelling() {
  const scenarios = [
    { text: "Teacher records attendance.", accent: "rgba(34, 211, 238, 1)" },
    { text: "Student finds a classroom.", accent: "rgba(139, 92, 246, 1)" },
    { text: "Parent receives visibility.", accent: "rgba(251, 191, 36, 1)" },
    { text: "Coordinator sees updates.", accent: "rgba(52, 211, 153, 1)" },
    { text: "Resources become available.", accent: "rgba(255, 255, 255, 1)" },
    { text: "Meetings are scheduled.", accent: "rgba(255, 255, 255, 1)" },
    { text: "Information flows naturally.", accent: "rgba(34, 211, 238, 1)", highlight: true },
  ];

  return (
    <motion.div
      key="beat-storytelling"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 w-full h-full relative"
    >
      <div className="relative w-full max-w-md mx-auto py-10 h-full flex flex-col justify-center">
        {/* Flowing timeline visualization */}
        <div className="absolute inset-y-0 left-6 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="flex flex-col gap-8 md:gap-10 pl-16">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: scenario.highlight ? 1 : 0.6, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + i * 1.5, ease: EASE }}
              className="flex items-center text-left relative"
            >
              {/* Ping effect on the timeline */}
              <motion.div
                className="absolute left-[-2.5rem] top-1/2 size-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ backgroundColor: scenario.accent }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 1.5 }}
              />
              
              <p 
                className={`px-4 py-2 rounded-lg bg-[#0A0A0B] border border-white/5 shadow-sm text-sm md:text-base tracking-wide ${scenario.highlight ? 'font-bold text-white text-lg md:text-xl border-cyan-500/30 bg-cyan-500/5' : 'font-medium text-white/80'}`}
                style={scenario.highlight ? {} : { color: scenario.accent }}
              >
                {scenario.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── BEAT 7: SCHOOL MAP & OPERATIONS ───────────────────────────────────────────

function BeatSchoolMap() {
  const rooms = [
    { id: "r1", label: "Physics Lab", x: 10, y: 20, w: 22, h: 18, status: "occupied", color: "rgba(34,211,238,0.5)" },
    { id: "r2", label: "Room 102", x: 35, y: 20, w: 18, h: 18, status: "available", color: "rgba(52,211,153,0.5)" },
    { id: "r3", label: "Main Hall", x: 56, y: 20, w: 34, h: 18, status: "occupied", color: "rgba(34,211,238,0.5)" },
    { id: "r4", label: "Room 201", x: 10, y: 42, w: 18, h: 16, status: "maintenance", color: "rgba(251,191,36,0.5)" },
    { id: "r5", label: "Library", x: 31, y: 42, w: 28, h: 16, status: "available", color: "rgba(52,211,153,0.5)" },
    { id: "r6", label: "Staff Room", x: 62, y: 42, w: 28, h: 16, status: "occupied", color: "rgba(34,211,238,0.5)" },
    { id: "r7", label: "Room 301", x: 10, y: 62, w: 22, h: 16, status: "occupied", color: "rgba(34,211,238,0.5)" },
    { id: "r8", label: "Computer Lab", x: 35, y: 62, w: 26, h: 16, status: "projector", color: "rgba(139,92,246,0.5)" },
    { id: "r9", label: "Gym", x: 64, y: 62, w: 26, h: 16, status: "available", color: "rgba(52,211,153,0.5)" },
  ];

  const statusIcons: Record<string, string> = {
    occupied: "●",
    available: "○",
    maintenance: "⚠",
    projector: "▶",
  };

  return (
    <motion.div
      key="beat-school-map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 w-full max-w-2xl"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-6"
      >
        The building is part of the system
      </motion.p>

      {/* Isometric-style map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.0, delay: 0.3, ease: EASE }}
        className="relative w-full aspect-[16/10] rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden shadow-2xl"
        style={{
          perspective: "1000px",
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Rooms */}
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.8, translateZ: -20 }}
            animate={{ opacity: 1, scale: 1, translateZ: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + i * 0.12, ease: EASE }}
            className="absolute rounded-lg border border-white/[0.08] flex flex-col items-center justify-center gap-0.5 p-1"
            style={{
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
              background: `linear-gradient(135deg, ${room.color.replace("0.5", "0.06")} 0%, transparent 100%)`,
              boxShadow: `inset 0 0 20px ${room.color.replace("0.5", "0.03")}`,
            }}
          >
            <span className="text-[8px] md:text-[9px] font-bold text-white/70 tracking-wider text-center leading-tight">
              {room.label}
            </span>
            <span
              className="text-[7px] md:text-[8px]"
              style={{ color: room.color }}
            >
              {statusIcons[room.status]} {room.status === "maintenance" ? "Repair" : room.status === "projector" ? "Projector ✓" : room.status}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.5, ease: EASE }}
        className="flex flex-wrap gap-4 mt-5 justify-center"
      >
        {[
          { label: "Occupied", color: "rgba(34,211,238,0.5)" },
          { label: "Available", color: "rgba(52,211,153,0.5)" },
          { label: "Maintenance", color: "rgba(251,191,36,0.5)" },
          { label: "Equipment", color: "rgba(139,92,246,0.5)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[8px] font-semibold text-white/35 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.5, ease: EASE }}
        className="mt-5 text-[11px] text-white/30 tracking-wider text-center"
      >
        Room availability · Equipment status · Class movement · Operational awareness
      </motion.p>
    </motion.div>
  );
}

// ─── BEAT 8: PERSONALIZATION + STATS ───────────────────────────────────────────

function BeatPersonalization() {
  const stats = [
    { value: "1", label: "Platform" },
    { value: "4", label: "School Views" },
    { value: "0", label: "Lost Info" },
  ];

  return (
    <motion.div
      key="beat-personalization"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center justify-center px-6 w-full max-w-xl text-center"
    >
      {/* Theme mockup */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        className="flex gap-3 mb-8"
      >
        {[
          { name: "Dark", bg: "#0A0A0B", border: "white/20" },
          { name: "Light", bg: "#F3F4F6", border: "black/10" },
          { name: "Axis", bg: "#050607", border: "cyan-400/30" },
        ].map((theme, i) => (
          <motion.div
            key={theme.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.15, ease: EASE }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="size-12 rounded-xl border flex items-center justify-center text-[10px] font-bold shadow-md"
              style={{
                backgroundColor: theme.bg,
                borderColor: i === 2 ? "rgba(34,211,238,0.3)" : i === 1 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)",
                color: i === 1 ? "#0A0A0B" : "#ffffff",
              }}
            >
              A
            </div>
            <span className="text-[8px] font-semibold text-white/35 uppercase tracking-wider">{theme.name}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
        className="text-xs text-white/50 mb-8"
      >
        Axis adapts to the user. Themes, layouts, and role-specific views.
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.0, ease: EASE }}
        className="flex gap-10"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.5 + i * 0.2, ease: EASE }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl font-extrabold text-cyan-400 tracking-tighter">{stat.value}</span>
            <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider mt-1">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── BEAT 9: TRANSITION ────────────────────────────────────────────────────────

function BeatTransition() {
  return (
    <motion.div
      key="beat-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
        className="space-y-6"
      >
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-white"
        >
          Choose your perspective.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
          className="flex gap-5 justify-center"
        >
          {["Teacher", "Coordinator", "Student", "Parent"].map((role, i) => (
            <motion.span
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.5 + i * 0.15, ease: EASE }}
              className="text-xs font-semibold text-white/50 tracking-wider"
            >
              {role}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.5, ease: EASE }}
          className="text-[10px] text-white/25 tracking-widest uppercase"
        >
          Explore Axis
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export function AxisIntroductionExperience({ onComplete }: AxisIntroductionExperienceProps) {
  const [phase, setPhase] = useState(0);

  const handleSkipFull = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onComplete();
  }, [onComplete]);

  const handleAdvance = useCallback(() => {
    if (phase >= TOTAL_PHASES - 1) {
      onComplete();
    } else {
      setPhase((prev) => prev + 1);
    }
  }, [phase, onComplete]);

  // Auto-advance phases
  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    if (duration === undefined) return;

    const timer = setTimeout(() => {
      if (phase >= TOTAL_PHASES - 1) {
        onComplete();
      } else {
        setPhase((prev) => prev + 1);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const renderBeat = () => {
    switch (phase) {
      case 0:
        return <BeatOpening />;
      case 1:
        return <BeatProblem />;
      case 2:
        return <BeatPromise />;
      case 3:
        return <BeatEcosystemNetwork />;
      case 4:
        return <BeatEssentialSpace />;
      case 5:
        return <BeatContext />;
      case 6:
        return <BeatStorytelling />;
      case 7:
        return <BeatSchoolMap />;
      case 8:
        return <BeatPersonalization />;
      case 9:
        return <BeatTransition />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#050607] text-white antialiased overflow-hidden cursor-pointer"
      onClick={handleAdvance}
    >
      {/* Background layers */}
      <AmbientGlow />
      <NoiseTexture />

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        onClick={handleSkipFull}
        className="fixed top-6 right-8 z-[110] text-[10px] font-semibold text-white/25 hover:text-white/60 uppercase tracking-[0.2em] transition-colors duration-300"
      >
        Skip
      </motion.button>

      {/* Progress bar */}
      <ProgressBar phase={phase} />

      {/* Beat content */}
      <AnimatePresence mode="wait">
        {renderBeat()}
      </AnimatePresence>
    </motion.div>
  );
}
