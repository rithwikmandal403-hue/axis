"use client";

import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export function IntroductionBlock() {
  return (
    <section className="mx-auto max-w-[720px]">
      <motion.p
        custom={0}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-2xl leading-[1.45] tracking-tight text-axis-text md:text-[32px] md:leading-[1.4]"
      >
        School software shouldn&apos;t make coordination harder.
      </motion.p>

      <motion.div
        custom={0.12}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="my-12 space-y-3 text-lg leading-relaxed text-axis-muted md:my-16 md:text-xl"
      >
        <p>Attendance lives in one app.</p>
        <p>Lesson plans in another.</p>
        <p>Parent messages somewhere else.</p>
        <p>Important details get lost between systems.</p>
      </motion.div>

      <motion.p
        custom={0.2}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-lg leading-relaxed text-axis-muted md:text-xl"
      >
        The more systems a school runs, the more time teachers spend on admin.
      </motion.p>

      <motion.div
        custom={0.28}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="my-12 h-px w-full max-w-[120px] bg-axis-text/20 md:my-16"
      />

      <motion.p
        custom={0.34}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-xl leading-[1.55] tracking-tight text-axis-text md:text-2xl md:leading-[1.5]"
      >
        Axis connects your daily school tasks, calendars, and communications into a single, cohesive system — designed to reduce daily admin and restore focus to teaching and learning.
      </motion.p>

      <motion.div
        custom={0.42}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 space-y-4 md:mt-20"
      >
        <p className="text-2xl font-medium tracking-tight text-axis-text md:text-3xl">
          Not another admin database.
        </p>
        <p className="text-2xl font-medium tracking-tight text-axis-text md:text-3xl">
          A calm workspace where everything works together.
        </p>
      </motion.div>
    </section>
  );
}
