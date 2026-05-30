"use client";

import { motion } from "framer-motion";

import { RolePreviewUI } from "@/components/school/role-preview-ui";
import { roleIconMap } from "@/components/school/role-icons";
import type { SchoolDemoRole } from "@/lib/school-demo-roles";

type RoleCardProps = {
  role: SchoolDemoRole;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
  onSelect: (role: SchoolDemoRole) => void;
};

export function RoleCard({
  role,
  index,
  isFocused,
  onFocus,
  onSelect,
}: RoleCardProps) {
  const Icon = roleIconMap[role.id];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 + index * 0.06 }}
      onClick={() => onSelect(role)}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={`group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,box-shadow,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
        isFocused
          ? "z-10 border-white/28 bg-white/[0.08] shadow-[0_28px_70px_-32px_rgba(0,0,0,0.95)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
      }`}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.992 }}
    >
      {isFocused && (
        <motion.div
          layoutId="role-card-glow"
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}

      <div
        className={`relative min-h-0 flex-1 overflow-hidden border-b border-white/[0.06] transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-85"
        }`}
      >
        <RolePreviewUI variant={role.previewVariant} isActive={isFocused} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/20 to-transparent" />
      </div>

      <div className="relative shrink-0 px-4 py-4 md:px-5 md:py-5">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-8 items-center justify-center rounded-lg border transition-colors duration-300 ${
              isFocused
                ? "border-white/25 bg-white/10 text-white"
                : "border-white/10 bg-white/[0.04] text-white/60"
            }`}
          >
            <Icon className="size-4" />
          </span>
          <h3
            className={`text-lg font-medium tracking-tight transition-colors md:text-xl ${
              isFocused ? "text-white" : "text-white/90"
            }`}
          >
            {role.label}
          </h3>
        </div>
        <p
          className={`mt-2 line-clamp-2 text-xs leading-relaxed transition-colors md:text-[13px] ${
            isFocused ? "text-white/65" : "text-white/45"
          }`}
        >
          {role.description}
        </p>
      </div>
    </motion.button>
  );
}
