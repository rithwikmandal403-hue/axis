"use client";

import { motion } from "framer-motion";

import { capabilityIconMap } from "@/components/environment/capability-icons";
import type { EnvironmentContent } from "@/lib/environment-content";

type EcosystemCapabilitiesProps = {
  content: NonNullable<EnvironmentContent["capabilities"]>;
};

export function EcosystemCapabilities({ content }: EcosystemCapabilitiesProps) {
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
          className="mt-4 max-w-[680px] text-3xl font-medium tracking-tight text-axis-text md:text-[40px]"
        >
          {content.title}
        </motion.h2>

        {content.intro && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 max-w-[620px] text-lg leading-relaxed text-axis-muted"
          >
            {content.intro}
          </motion.p>
        )}

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
          {content.items.map((item, index) => {
            const Icon = capabilityIconMap[item.icon];

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                className="group rounded-2xl border border-axis-line bg-axis-card/50 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-axis-text/15 hover:bg-axis-card hover:shadow-soft md:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-axis-line bg-axis-bg text-axis-text/70 transition-colors duration-300 group-hover:border-axis-text/20 group-hover:text-axis-text">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium tracking-tight text-axis-text md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-axis-muted md:text-[15px] md:leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
