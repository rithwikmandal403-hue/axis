"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { AxisIntroductionExperience } from "@/components/school/axis-introduction-experience";
import { DemoEnterTransition } from "@/components/school/demo-enter-transition";
import { ExperienceAmbientEnvironment } from "@/components/school/experience-ambient-environment";
import { RoleCard } from "@/components/school/role-card";
import { getDemoHref, schoolDemoRoles, type SchoolDemoRole } from "@/lib/school-demo-roles";

export function RoleSelection() {
  const router = useRouter();
  const [focusedRoleId, setFocusedRoleId] = useState<string | null>(schoolDemoRoles[0]?.id ?? null);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);
  const [enteringRoleLabel, setEnteringRoleLabel] = useState<string>();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("axis-intro-seen");
      if (seen !== "true") {
        setShowIntro(true);
      }
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-intro-seen", "true");
    }
    setShowIntro(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  const handleRoleSelect = useCallback(
    (role: SchoolDemoRole) => {
      setEnteringRoleLabel(role.label);
      setIsEnteringDemo(true);

      window.setTimeout(() => {
        router.push(getDemoHref(role.id));
      }, 780);
    },
    [router],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-y-auto text-white">
      <ExperienceAmbientEnvironment />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link
          href="/school"
          className="text-sm text-white/45 transition-colors hover:text-white/80"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-4">
          {!showIntro && (
            <button
              type="button"
              onClick={handleReplayIntro}
              className="text-[10px] font-medium tracking-[0.15em] text-white/25 uppercase hover:text-white/55 transition-colors duration-300"
            >
              Watch Intro
            </button>
          )}
          <span className="text-[10px] font-medium tracking-[0.2em] text-white/35 uppercase md:text-[11px]">
            Axis demo environment
          </span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-5 md:px-8 md:pb-7">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-center"
        >
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-4xl lg:text-[42px]">
            How do you experience Axis?
          </h1>
          <p className="mx-auto mt-2 max-w-[480px] text-sm leading-relaxed text-white/50 md:mt-3 md:text-base">
            Every environment adapts to the people within it.
          </p>
        </motion.div>

        <div
          className="mt-5 grid min-h-0 flex-1 grid-cols-2 gap-3 md:mt-6 md:gap-4 lg:grid-cols-4 lg:gap-5"
          onMouseLeave={() => setFocusedRoleId(null)}
        >
          {schoolDemoRoles.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              index={index}
              isFocused={focusedRoleId === role.id}
              onFocus={() => setFocusedRoleId(role.id)}
              onSelect={handleRoleSelect}
            />
          ))}
        </div>

        <p className="mt-3 shrink-0 text-center text-[10px] tracking-[0.14em] text-white/28 uppercase md:text-[11px]">
          Select a role to enter the shared school environment demo
        </p>
      </main>

      <DemoEnterTransition active={isEnteringDemo} roleLabel={enteringRoleLabel} />

      {/* Cinematic Introduction Experience overlay */}
      <AnimatePresence>
        {showIntro && (
          <AxisIntroductionExperience onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
