"use client";

import { motion } from "framer-motion";

import type { EnvironmentContent } from "@/lib/environment-content";

type EnvironmentIntroProps = {
  content: EnvironmentContent["intro"];
};

export function EnvironmentIntro({ content }: EnvironmentIntroProps) {
  return (
    <section className="border-t border-axis-line bg-axis-card/30">
      <div className="mx-auto max-w-[720px] px-6 py-20 md:px-10 md:py-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs font-semibold uppercase tracking-[0.22em] text-axis-muted"
        >
          {content.label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.06 }}
          className="mt-6 text-3xl font-medium leading-[1.25] tracking-tight text-axis-text md:text-[40px]"
        >
          {content.statement}
        </motion.h2>

        <div className="mt-10 space-y-6">
          {content.paragraphs.map((paragraph, index) => (
            <motion.p
              key={paragraph}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 + index * 0.08 }}
              className="text-lg leading-relaxed text-axis-muted md:text-xl"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="my-12 h-px w-full max-w-[120px] bg-axis-text/20"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl leading-[1.5] tracking-tight text-axis-text md:text-2xl"
        >
          {content.closing}
        </motion.p>
      </div>
    </section>
  );
}
