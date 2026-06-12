"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

type OrbitNode = {
  label: string;
  icon: React.ReactNode;
  top: string;
  left: string;
  delay: number;
};

const CENTER = 160;
const RINGS = [
  { r: 68, opacity: 0.62, dash: false, strokeWidth: 1 },
  { r: 94, opacity: 0.5, dash: true, strokeWidth: 1 },
  { r: 118, opacity: 0.42, dash: false, strokeWidth: 1 },
  { r: 142, opacity: 0.36, dash: true, strokeWidth: 1 },
];

const DOT_ANGLES = [12, 52, 98, 142, 188, 232, 278, 322];

const nodes: OrbitNode[] = [
  { 
    label: "People", 
    icon: (
      <svg className="size-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 18M15 19.128a9.38 9.38 0 01-5.625-2.625M10.089 18a11.36 11.36 0 01-3.212-1.093M10.089 18a11.534 11.534 0 00.75-2.935M10.089 18H8.25M10.839 15.065a11.534 11.534 0 01-.75-2.935m.75 2.935a11.334 11.334 0 002.622-2.128M10.839 15.065a11.36 11.36 0 00-3.212-1.093m0 0a11.534 11.534 0 01.75-2.935M7.627 13.972H5.788M7.627 13.972a11.334 11.334 0 002.622-2.128M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), 
    top: "12%", 
    left: "50%", 
    delay: 0.1 
  },
  { 
    label: "Workplaces", 
    icon: (
      <svg className="size-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-1.115-.086-2.208-.25-3.275m0 3.275a.75.75 0 01-.375.65m-15.75-3.925c.164-1.067.25-2.16.25-3.275m0 3.275a.75.75 0 00.375.65m15.125-4.575a22.95 22.95 0 00-14.25 0M18.75 6.75h-13.5M9 6.75V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 3v3.75" />
      </svg>
    ), 
    top: "50%", 
    left: "88%", 
    delay: 0.25 
  },
  { 
    label: "Organizations", 
    icon: (
      <svg className="size-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v3.375c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 6.375V3z" />
      </svg>
    ), 
    top: "88%", 
    left: "50%", 
    delay: 0.4 
  },
  { 
    label: "Education", 
    icon: (
      <svg className="size-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-16.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-16.25v14.25" />
      </svg>
    ), 
    top: "50%", 
    left: "12%", 
    delay: 0.55 
  },
];

function ringDots(radius: number) {
  return DOT_ANGLES.map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      angle,
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  });
}

export function EcosystemVisualization() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">
      {/* Ambient field behind the orbit system */}
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.04) 0%, rgba(59,130,246,0.01) 50%, transparent 72%)",
        }}
      />

      {/* Orbital rings + path dots */}
      <svg
        viewBox="0 0 320 320"
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden
      >
        {RINGS.map((ring, index) => (
          <motion.g
            key={ring.r}
            animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 96 + index * 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={ring.r}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth={ring.strokeWidth}
              opacity={ring.opacity * 0.7}
              strokeDasharray={ring.dash ? "4 8" : undefined}
            />
            {ringDots(ring.r).map((dot) => (
              <circle
                key={`${ring.r}-${dot.angle}`}
                cx={dot.x}
                cy={dot.y}
                r={index === RINGS.length - 1 ? 2 : 1.5}
                fill="#FFFFFF"
                opacity={index < 2 ? 0.35 : 0.25}
              />
            ))}
          </motion.g>
        ))}
      </svg>

      {/* Center halo behind logo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[46%] rounded-full border border-white/10 bg-gradient-to-b from-[#121214]/85 to-[#0A0A0B]/95 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md" />
      </div>

      {/* Center logo */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <Image
            src="/axis-logo.png"
            alt="Axis"
            width={200}
            height={250}
            priority
            className="block h-auto w-[140px] object-contain object-center md:w-[160px] invert brightness-200"
          />
        </motion.div>
      </div>

      {/* Orbit nodes */}
      {nodes.map((node) => (
        <div
          key={node.label}
          className="absolute z-20"
          style={{
            top: node.top,
            left: node.left,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 7.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: node.delay,
            }}
          >
            <div className="grid size-12 place-items-center rounded-full border border-white/10 bg-[#121214]/90 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm md:size-14">
              <span aria-hidden>{node.icon}</span>
            </div>
            <span className="text-[11px] font-medium tracking-[0.02em] text-zinc-400 md:text-xs">
              {node.label}
            </span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
