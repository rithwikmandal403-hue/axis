"use client";

import { motion } from "framer-motion";

const PARTICLES = [
  { x: "12%", y: "22%", size: 2, delay: 0 },
  { x: "78%", y: "18%", size: 1.5, delay: 0.8 },
  { x: "88%", y: "62%", size: 2, delay: 1.2 },
  { x: "24%", y: "78%", size: 1.5, delay: 0.4 },
  { x: "52%", y: "88%", size: 2, delay: 1.6 },
  { x: "6%", y: "52%", size: 1.5, delay: 2 },
  { x: "64%", y: "38%", size: 1.5, delay: 0.6 },
  { x: "42%", y: "14%", size: 2, delay: 1.1 },
];

export function ExperienceAmbientEnvironment() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 8%, rgba(255,255,255,0.09) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(255,255,255,0.04) 0%, transparent 50%)",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.35]"
        animate={{ opacity: [0.28, 0.38, 0.28] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,10,11,0.4) 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0.12, 0.35, 0.12],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 5 + index * 0.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
