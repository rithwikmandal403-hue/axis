"use client";

import { motion } from "framer-motion";

import { IntroductionBlock } from "@/components/onboarding/introduction-block";
import { InsightsSection } from "@/components/onboarding/insights-section";
import { UserTypeSelection } from "@/components/onboarding/user-type-selection";

export function OnboardingSection() {
  return (
    <motion.section
      id="onboarding"
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[1360px] px-6 pb-24 pt-8 md:px-10 md:pb-32 md:pt-12"
    >
      <IntroductionBlock />
      <InsightsSection />
      <UserTypeSelection />
    </motion.section>
  );
}
