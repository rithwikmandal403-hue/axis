"use client";

import { motion } from "framer-motion";

import type { EnvironmentContent } from "@/lib/environment-content";

type ContextualCardsProps = {
  content: EnvironmentContent["contextual"];
};

export function ContextualCards({ content }: ContextualCardsProps) {
  return (
    <section className="border-t border-axis-line">
      <div className="mx-auto max-w-[1360px] px-6 py-20 md:px-10 md:py-28">
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
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
          className="mt-4 max-w-[640px] text-3xl font-medium tracking-tight text-axis-text md:text-[40px]"
        >
          {content.title}
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {content.items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
              className="rounded-2xl border border-axis-line bg-axis-bg px-7 py-8 md:px-8"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-axis-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl font-medium tracking-tight text-axis-text">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-axis-muted md:text-base">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
