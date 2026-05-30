"use client";

import { motion } from "framer-motion";

import type { SchoolDemoRole } from "@/lib/school-demo-roles";

type RolePreviewUIProps = {
  variant: SchoolDemoRole["previewVariant"];
  isActive?: boolean;
};

export function RolePreviewUI({ variant, isActive = false }: RolePreviewUIProps) {
  const pulse = isActive ? 1.15 : 1;

  if (variant === "schedule") {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        {[0, 1, 2].map((row) => (
          <motion.div
            key={row}
            className="flex items-center gap-2"
            animate={{ opacity: [0.3, 0.75 * pulse, 0.3] }}
            transition={{ duration: 2.8 + row * 0.3, repeat: Number.POSITIVE_INFINITY, delay: row * 0.35 }}
          >
            <span className="h-1.5 w-7 shrink-0 rounded-full bg-white/25" />
            <span className="h-5 min-h-[20px] flex-1 rounded-md border border-white/10 bg-white/[0.05]" />
          </motion.div>
        ))}
        <motion.div
          className="mt-1 h-7 rounded-md border border-white/15 bg-white/[0.07]"
          animate={{ opacity: [0.35, 0.8 * pulse, 0.35] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
    );
  }

  if (variant === "operations") {
    return (
      <div className="grid h-full grid-cols-2 content-center gap-2 p-4">
        {[0, 1, 2, 3].map((cell) => (
          <motion.div
            key={cell}
            className="h-9 rounded-md border border-white/10 bg-white/[0.04] md:h-10"
            animate={{ opacity: [0.25, 0.7 * pulse, 0.25] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, delay: cell * 0.22 }}
          />
        ))}
      </div>
    );
  }

  if (variant === "learning") {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <motion.div
          className="h-9 rounded-md border border-white/10 bg-white/[0.05] md:h-10"
          animate={{ scale: [1, 1.02 * pulse, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className="flex gap-2">
          <motion.span
            className="h-1.5 flex-1 rounded-full bg-white/20"
            animate={{ opacity: [0.2, 0.55 * pulse, 0.2] }}
            transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
          />
          <span className="h-1.5 w-5 rounded-full bg-white/10" />
        </div>
        <motion.span
          className="block h-6 rounded-md border border-white/10 bg-white/[0.03]"
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2 p-4">
      <motion.div
        className="flex items-center gap-2"
        animate={{ opacity: [0.3, 0.7 * pulse, 0.3] }}
        transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY }}
      >
        <span className="size-5 rounded-full border border-white/15 bg-white/[0.05]" />
        <span className="h-1.5 flex-1 rounded-full bg-white/15" />
      </motion.div>
      {[0, 1].map((row) => (
        <motion.span
          key={row}
          className="block h-5 rounded-md border border-white/10 bg-white/[0.04]"
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, delay: row * 0.3 }}
        />
      ))}
    </div>
  );
}
