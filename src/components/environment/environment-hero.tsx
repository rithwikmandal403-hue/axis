"use client";

import { motion } from "framer-motion";

import type { EnvironmentContent } from "@/lib/environment-content";

type EnvironmentHeroProps = {
  content: EnvironmentContent["hero"];
};

export function EnvironmentHero({ content }: EnvironmentHeroProps) {
  const headlineLines = content.headline.split("\n");

  return (
    <section className="mx-auto max-w-[1360px] px-6 pb-16 pt-4 md:px-10 md:pb-20">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-axis-muted"
      >
        {content.eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        className="mt-6 max-w-[820px] text-[48px] font-medium leading-[1.02] tracking-tightest text-axis-text md:text-[72px] lg:text-[80px]"
      >
        {headlineLines.map((line, i) => (
          <span key={line}>
            {line}
            {i < headlineLines.length - 1 && <br />}
          </span>
        ))}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="my-10 h-px w-12 bg-axis-text/30"
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.22 }}
        className="max-w-[640px] text-2xl tracking-tight text-axis-text md:text-3xl"
      >
        {content.subheadline}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 max-w-[560px] text-lg leading-relaxed text-axis-muted"
      >
        {content.description}
      </motion.p>
    </section>
  );
}
