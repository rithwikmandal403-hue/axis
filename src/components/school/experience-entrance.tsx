"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ExperienceEntranceProps = {
  children: ReactNode;
};

export function ExperienceEntrance({ children }: ExperienceEntranceProps) {
  return (
    <motion.div
      className="h-full min-h-0"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
