"use client";

import { motion } from "framer-motion";

import { EcosystemVisualization } from "@/components/ecosystem-visualization";

type HeroSectionProps = {
  onGetStarted: () => void;
};

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <main className="mx-auto grid w-full max-w-[1360px] grid-cols-1 gap-14 px-6 pb-14 pt-6 md:px-10 lg:min-h-[calc(100vh-104px)] lg:grid-cols-[1fr_1.25fr] lg:gap-6">
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="flex items-center lg:pr-12"
      >
        <div className="max-w-[540px]">
          <h1 className="text-[56px] font-medium leading-[0.98] tracking-tightest text-white md:text-[76px] lg:text-[88px]">
            Everything is
            <br />
            one.
          </h1>

          <div className="my-8 h-px w-12 bg-white/20" />

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Built for</p>

          <p className="mt-4 text-3xl leading-[1.28] tracking-tight text-white md:text-[42px]">
            educators, workplaces,
            <br />
            and connected organizations.
          </p>

          <p className="mt-6 max-w-[440px] text-lg leading-relaxed text-zinc-400">
            Axis unifies communication, coordination, and context into a single, cohesive operating layer — designed to reduce fragmentation and restore operational clarity.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#0A0A0B] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 mt-12"
            onClick={onGetStarted}
          >
            <span>Explore the Ecosystem</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>→</span>
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative flex w-full items-center justify-center border-l-0 border-white/10 pt-2 lg:border-l lg:pl-0"
        aria-label="Axis ecosystem visualization"
      >
        <div className="flex w-full max-w-[640px] items-center justify-center lg:mx-auto">
          <EcosystemVisualization />
        </div>
      </motion.section>
    </main>
  );
}
