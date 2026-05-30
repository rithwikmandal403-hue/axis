"use client";

import { AnimatePresence, motion } from "framer-motion";

type DemoEnterTransitionProps = {
  active: boolean;
  roleLabel?: string;
};

export function DemoEnterTransition({ active, roleLabel }: DemoEnterTransitionProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0a0a0b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 58%)",
            }}
          />

          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="size-20 rounded-full border border-white/15" />
            <motion.div
              className="absolute size-32 rounded-full border border-white/[0.06]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            {roleLabel && (
              <p className="mt-8 text-sm font-medium tracking-[0.18em] text-white/50 uppercase">
                Entering {roleLabel} perspective
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
