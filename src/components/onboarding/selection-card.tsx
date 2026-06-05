"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type SelectionCardProps = {
  label: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: () => void;
  index: number;
  href?: string;
};

export function SelectionCard({
  label,
  description,
  icon,
  selected,
  onSelect,
  index,
  href,
}: SelectionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    onSelect();

    if (href) {
      window.setTimeout(() => {
        router.push(href);
      }, 320);
    }
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 * index }}
      onClick={handleClick}
      className={`group flex min-h-[148px] w-full flex-col items-start justify-between rounded-2xl border px-7 py-7 text-left transition-all duration-300 ease-out md:min-h-[168px] md:px-8 md:py-8 ${
        selected
          ? "border-white bg-white text-[#0A0A0B] shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
          : "border-white/10 bg-white/[0.02] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] text-white"
      }`}
      whileHover={{ y: selected ? 0 : -4 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex w-full items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
            selected
              ? "border-black/15 bg-black/5 text-black"
              : "border-white/5 bg-white/5 text-zinc-300"
          }`}
        >
          {icon}
        </span>
        <span
          className={`text-xl font-medium tracking-tight md:text-2xl ${
            selected ? "text-[#0A0A0B]" : "text-white"
          }`}
        >
          {label}
        </span>
      </div>
      <span
        className={`mt-4 text-sm leading-relaxed ${
          selected ? "text-[#0A0A0B]/75" : "text-zinc-400"
        }`}
      >
        {description}
      </span>
    </motion.button>
  );
}
