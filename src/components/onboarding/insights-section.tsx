"use client";

import { motion } from "framer-motion";

const insights = [
  {
    value: "9+",
    label: "disconnected tools",
    detail: "Average number of tools used daily across modern teams.",
  },
  {
    value: "23%",
    label: "operational drag",
    detail: "Estimated time lost to context switching between systems.",
  },
  {
    value: "67%",
    label: "communication gaps",
    detail: "Teams reporting fragmented coordination across workflows.",
  },
  {
    value: "4.2",
    label: "interruptions / hour",
    detail: "Workflow interruptions caused by switching environments.",
  },
];

export function InsightsSection() {
  return (
    <section className="mt-28 border-t border-axis-line pt-20 md:mt-36 md:pt-24">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-axis-muted"
      >
        The cost of fragmentation
      </motion.p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {insights.map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
            className="rounded-2xl border border-axis-line bg-axis-card/60 px-6 py-7 md:px-7 md:py-8"
          >
            <p className="text-[40px] font-medium leading-none tracking-tightest text-axis-text md:text-[44px]">
              {item.value}
            </p>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.12em] text-axis-text/80">
              {item.label}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-axis-muted">{item.detail}</p>
          </motion.article>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 text-xs text-axis-muted/80"
      >
        Placeholder insights for demonstration. Figures represent directional operational patterns.
      </motion.p>
    </section>
  );
}
