"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type OrbitNode = {
  label: string;
  icon: string;
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
  { label: "People", icon: "👥", top: "12%", left: "50%", delay: 0.1 },
  { label: "Workplaces", icon: "💼", top: "50%", left: "88%", delay: 0.25 },
  { label: "Organizations", icon: "🏢", top: "88%", left: "50%", delay: 0.4 },
  { label: "Education", icon: "📖", top: "50%", left: "12%", delay: 0.55 },
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
