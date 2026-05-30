"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { OnboardingSection } from "@/components/onboarding/onboarding-section";

export function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [heroDimmed, setHeroDimmed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const onboardingRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (!showOnboarding) return;

    const timer = window.setTimeout(() => {
      onboardingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [showOnboarding]);

  useEffect(() => {
    if (!showOnboarding || !heroRef.current) return;

    const heroEl = heroRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Dim hero only when it has scrolled mostly out of view
        setHeroDimmed(entry.intersectionRatio < 0.45);
      },
      { threshold: [0, 0.2, 0.45, 0.6, 0.8, 1], rootMargin: "0px" },
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [showOnboarding]);

  return (
    <div className="min-h-screen bg-axis-bg text-axis-text">
      <motion.div
        ref={heroRef}
        animate={{
          opacity: heroDimmed ? 0.35 : 1,
          scale: heroDimmed ? 0.985 : 1,
          filter: heroDimmed ? "blur(1.5px)" : "blur(0px)",
        }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={heroDimmed ? "pointer-events-none" : ""}
      >
        <Navbar />
        <HeroSection onGetStarted={handleGetStarted} />
      </motion.div>

      <div ref={onboardingRef}>
        <AnimatePresence>
          {showOnboarding && <OnboardingSection />}
        </AnimatePresence>
      </div>
    </div>
  );
}
