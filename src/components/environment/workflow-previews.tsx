"use client";

import { motion } from "framer-motion";

import type { EnvironmentContent } from "@/lib/environment-content";

type WorkflowPreviewsProps = {
  content: EnvironmentContent["workflows"];
};

export function WorkflowPreviews({ content }: WorkflowPreviewsProps) {
  return (
    <section className="mx-auto max-w-[1360px] px-6 py-20 md:px-10 md:py-28">
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
        className="mt-4 text-3xl font-medium tracking-tight text-axis-text md:text-[40px]"
      >
        {content.title}
      </motion.h2>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
        {content.items.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.07 }}
            className="group rounded-2xl border border-axis-line bg-axis-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-axis-text/15 hover:shadow-soft md:p-8"
          >
            <h3 className="text-xl font-medium tracking-tight text-axis-text">{item.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-axis-muted">{item.description}</p>
            <p className="mt-5 border-t border-axis-line pt-4 text-xs uppercase tracking-[0.14em] text-axis-text/55">
              {item.detail}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
