"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { SelectionCard } from "@/components/onboarding/selection-card";
import {
  OrganizationIcon,
  OtherIcon,
  SchoolIcon,
  WorkplaceIcon,
} from "@/components/onboarding/user-type-icons";

const userTypes = [
  {
    id: "school",
    label: "School",
    href: "/school",
    description: "Coordinate learning, communication, and administration in one place.",
    icon: SchoolIcon,
    accent: "text-sky-700/70",
  },
  {
    id: "workplace",
    label: "Workplace",
    href: "/workplace",
    description: "Unify teams, workflows, and daily operations without switching contexts.",
    icon: WorkplaceIcon,
    accent: "text-amber-800/65",
  },
  {
    id: "organization",
    label: "Organization",
    href: "/organization",
    description: "Connect departments, systems, and people across growing structures.",
    icon: OrganizationIcon,
    accent: "text-slate-600/75",
  },
  {
    id: "other",
    label: "Other",
    description: "Explore Axis for a connected environment that doesn't fit a single category.",
    icon: OtherIcon,
    accent: "text-neutral-500/80",
  },
] as const;

export function UserTypeSelection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="mt-28 border-t border-axis-line pt-20 md:mt-36 md:pt-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-3xl font-medium tracking-tight text-axis-text md:text-[40px]"
      >
        Who are you?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        className="mt-4 max-w-[520px] text-lg leading-relaxed text-axis-muted"
      >
        Choose the environment that best describes how you operate. This helps Axis shape your
        connected ecosystem.
      </motion.p>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {userTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selected === type.id;
          const href = "href" in type ? type.href : undefined;

          return (
            <SelectionCard
              key={type.id}
              label={type.label}
              description={type.description}
              href={href}
              icon={
                <Icon className={`size-[18px] ${isSelected ? "text-white" : type.accent}`} />
              }
              selected={isSelected}
              onSelect={() => setSelected(type.id)}
              index={index}
            />
          );
        })}
      </div>
    </section>
  );
}
