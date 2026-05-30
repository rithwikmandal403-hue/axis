"use client";

import { motion } from "framer-motion";

import type { EnvironmentContent } from "@/lib/environment-content";

type OperationalInsightsProps = {
  content: NonNullable<EnvironmentContent["insights"]>;
};

export function OperationalInsights({ content }: OperationalInsightsProps) {
  return (
    <section className="border-t border-axis-line bg-axis-card/20">
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
          className="mt-4 max-w-[720px] text-3xl font-medium tracking-tight text-axis-text md:text-[40px]"
        >
          {content.title}
        </motion.h2>

        {content.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 max-w-[600px] text-lg leading-relaxed text-axis-muted"
          >
            {content.subtitle}
          </motion.p>
        )}

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {content.metrics.map((metric, index) => (
            <motion.article
              key={metric.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.07 }}
              className="flex flex-col justify-between rounded-2xl border border-axis-line bg-axis-bg px-6 py-7 md:px-7 md:py-8"
            >
              <div>
                <p className="flex items-baseline gap-1 text-[42px] font-medium leading-none tracking-tightest text-axis-text md:text-[46px]">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-lg font-medium tracking-tight text-axis-muted">
                      {metric.unit}
                    </span>
                  )}
                </p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-axis-text/75">
                  {metric.label}
                </p>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-axis-muted">{metric.detail}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="my-14 h-px w-full bg-axis-line"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {content.observations.map((observation, index) => (
            <motion.blockquote
              key={observation}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: 0.12 + index * 0.08 }}
              className="border-l border-axis-text/15 pl-5 text-base leading-relaxed text-axis-text/90 md:text-lg"
            >
              {observation}
            </motion.blockquote>
          ))}
        </div>

        {content.footnote && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 text-xs text-axis-muted/75"
          >
            {content.footnote}
          </motion.p>
        )}
      </div>
    </section>
  );
}
