"use client";

import { motion } from "framer-motion";

type NavigationItemProps = {
  id: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  isCollapsed?: boolean;
  layoutId: string;
  theme?: string;
  height?: string;
  isHighlighted?: boolean;
};

export function NavigationItem({
  label,
  subLabel,
  icon,
  badge,
  isActive,
  onClick,
  disabled = false,
  isCollapsed = false,
  layoutId,
  theme = "dark",
  height = "h-12",
  isHighlighted = false,
}: NavigationItemProps) {
  const isLight = theme === "light";
  const isHC = theme === "high-contrast";
  const isAxis = theme === "axis";

  const hasIcon = !!icon;
  const paddingClass = hasIcon ? "px-3" : "pl-6 pr-3";
  const heightClass = height;
  const indicatorHeightClass = heightClass === "h-12" ? "h-6" : "h-5";
  const indicatorLeftClass = hasIcon ? "left-[4px]" : "left-[5px]";

  // Active Highlight card styling (Background + Border + Shadow)
  const activeHighlightClass = isLight
    ? "bg-cyan-50/70 border-cyan-200/50 shadow-[0_2px_8px_rgba(6,182,212,0.04)]"
    : isHC
      ? "bg-white border-white"
      : isAxis
        ? "bg-cyan-950/25 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.12)]"
        : "bg-zinc-900/60 border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.4)]";

  // Accent bar indicator styling (Pill indicator)
  const accentBarClass = isLight
    ? "bg-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
    : isHC
      ? "bg-black"
      : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]";

  // Active text styling
  const activeTextClass = isLight
    ? "text-cyan-900"
    : isHC
      ? "text-black"
      : isAxis
        ? "text-cyan-300"
        : "text-zinc-100";

  // Inactive button styling
  const inactiveBtnClass = isLight
    ? "text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-900"
    : isHC
      ? "text-white/70 hover:bg-white/10 hover:text-white"
      : isAxis
        ? "text-cyan-200/50 hover:bg-cyan-950/10 hover:text-cyan-200"
        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex w-full items-center ${heightClass} ${paddingClass} rounded-lg text-left transition-colors duration-200 outline-none select-none border border-transparent ${
        isActive ? `${activeTextClass} font-semibold` : `${inactiveBtnClass} font-normal`
      } ${disabled ? "opacity-20 cursor-not-allowed" : ""} ${isHighlighted ? "tour-highlight" : ""}`}
    >
      {/* Absolute highlight wrapper containing background card and indicator bar, animated via Framer Motion layoutId */}
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className={`absolute inset-0 rounded-lg border ${activeHighlightClass} pointer-events-none z-0`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          {/* Cyan accent indicator bar physically attached inside the layout wrapper */}
          <div className={`absolute ${indicatorLeftClass} top-1/2 -translate-y-1/2 w-[3px] ${indicatorHeightClass} rounded-full ${accentBarClass}`} />
        </motion.div>
      )}

      {/* Item Icon container */}
      {hasIcon && (
        <div className="size-8 flex items-center justify-center shrink-0 relative transition-transform duration-200 group-hover:scale-102 z-10 text-base">
          {icon}
        </div>
      )}

      {/* Item label & sub-label text container */}
      {(!isCollapsed || !hasIcon) && (
        <motion.div
          initial={hasIcon ? { opacity: 0, x: -8 } : undefined}
          animate={hasIcon ? { opacity: 1, x: 0 } : undefined}
          exit={hasIcon ? { opacity: 0 } : undefined}
          transition={{ delay: 0.05, duration: 0.18 }}
          className={`flex flex-col min-w-0 ${hasIcon ? "ml-3" : ""} h-8 justify-center z-10`}
        >
          <span className="text-[13px] tracking-tight leading-none text-inherit">{label}</span>
          {subLabel && (
            <span className="mt-1 text-[9px] tracking-wide leading-none opacity-45 truncate text-inherit/70">
              {subLabel}
            </span>
          )}
        </motion.div>
      )}

      {/* Badge or other optional child elements */}
      {badge && <div className="z-10 relative flex-1 flex justify-end">{badge}</div>}
    </button>
  );
}
