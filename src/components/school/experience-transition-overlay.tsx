"use client";

import { motion, AnimatePresence } from "framer-motion";

type ExperienceTransitionOverlayProps = {
  active: boolean;
};

export function ExperienceTransitionOverlay({ active }: ExperienceTransitionOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.06) 0%, transparent 55%)",
            }}
          />

          <motion.div
            className="relative size-48 rounded-full border border-white/10"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
          />
          <motion.div
            className="absolute size-72 rounded-full border border-white/[0.06]"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
          />

          <motion.p
            className="absolute text-sm font-medium tracking-[0.2em] text-white/50 uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Entering environment
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
