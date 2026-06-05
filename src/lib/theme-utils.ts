export type Theme = "dark" | "light" | "high-contrast" | "axis";

export interface ThemeColors {
  panelBg: string;
  itemBg: string;
  itemHoverBg: string;
  border: string;
  textMuted: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  btnActive: string;
  btnActiveText: string;
  indicator: string;
}

export interface AxisTheme {
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonTertiary: string;
  badge: string;
  plansBg: string;
  accentGlow: string;
  inputBg: string;
  border: string;
}

export const AXIS_TOKENS = {
  sidebar: {
    collapsedWidth: "72px",
    expandedWidth: "260px",
    hoverIntentDelay: 150, // ms
    collapseDelay: 120, // ms
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number] },
  },
  borderRadius: {
    card: "rounded-3xl",
    widget: "rounded-2xl",
    item: "rounded-xl",
    badge: "rounded-lg",
  },
  shadows: {
    card: "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]",
    popover: "shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
  },
  spacing: {
    outerPadding: "p-6",
    innerPadding: "p-5",
    gap: "gap-6",
  }
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  const themes: Record<Theme, ThemeColors> = {
    dark: {
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      itemBg: "bg-white/[0.01]",
      itemHoverBg: "hover:bg-white/[0.02]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/90",
      textSecondary: "text-white/60",
      inputBg: "bg-[#0C0C0E]/70 border-white/[0.08] text-white",
      btnActive: "bg-white text-black font-bold",
      btnActiveText: "text-black",
      indicator: "bg-cyan-400",
    },
    light: {
      panelBg: "bg-white border-black/[0.08]",
      itemBg: "bg-black/[0.01]",
      itemHoverBg: "hover:bg-black/[0.02]",
      border: "border-black/[0.08]",
      textMuted: "text-black/50",
      textPrimary: "text-black/90",
      textSecondary: "text-black/60",
      inputBg: "bg-[#F9FAFB] border-black/[0.08] text-black",
      btnActive: "bg-[#111827] text-white font-bold",
      btnActiveText: "text-white",
      indicator: "bg-cyan-600",
    },
    "high-contrast": {
      panelBg: "bg-black border-2 border-white",
      itemBg: "bg-black border border-white/40",
      itemHoverBg: "hover:bg-white/10",
      border: "border-2 border-white",
      textMuted: "text-white",
      textPrimary: "text-white font-bold",
      textSecondary: "text-white",
      inputBg: "bg-black border-2 border-white text-white",
      btnActive: "bg-white text-black font-extrabold",
      btnActiveText: "text-black",
      indicator: "bg-white",
    },
    axis: {
      panelBg: "bg-[#121417]/90 border-white/[0.08]",
      itemBg: "bg-[#16191F]/40 border border-white/[0.04]",
      itemHoverBg: "hover:bg-[#1A1D24]",
      border: "border-white/[0.08]",
      textMuted: "text-white/35",
      textPrimary: "text-white/95",
      textSecondary: "text-white/70",
      inputBg: "bg-[#181B22] border-white/[0.10] text-white",
      btnActive: "bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.25)]",
      btnActiveText: "text-black",
      indicator: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
    },
  };

  return themes[theme] || themes.dark;
};

export const getAxisTheme = (theme: Theme): AxisTheme => {
  const themes: Record<Theme, AxisTheme> = {
    dark: {
      bg: "bg-[#0A0A0B]",
      cardBg: "bg-[#0E0E10]/95 border-white/[0.08]",
      textPrimary: "text-white",
      textSecondary: "text-white/60",
      buttonPrimary: "bg-[#22d3ee] text-black hover:bg-[#22d3ee]/90 font-bold",
      buttonSecondary: "border-white/[0.08] hover:bg-white/5 text-white/70",
      buttonTertiary: "text-white/40 hover:text-white/80",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      plansBg: "bg-white/[0.02] border-white/[0.04]",
      accentGlow: "rgba(34,211,238,0.15)",
      inputBg: "bg-[#0C0C0E]/70 border-white/[0.08] text-white",
      border: "border-white/[0.06]",
    },
    light: {
      bg: "bg-[#F3F4F6]",
      cardBg: "bg-white border-black/[0.08]",
      textPrimary: "text-black",
      textSecondary: "text-black/60",
      buttonPrimary: "bg-cyan-600 text-white hover:bg-cyan-500 font-bold",
      buttonSecondary: "border-black/[0.08] hover:bg-black/5 text-black/70",
      buttonTertiary: "text-black/40 hover:text-black/80",
      badge: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
      plansBg: "bg-black/[0.02] border-black/[0.04]",
      accentGlow: "rgba(14,165,233,0.1)",
      inputBg: "bg-[#F9FAFB] border-black/[0.08] text-black",
      border: "border-black/[0.08]",
    },
    "high-contrast": {
      bg: "bg-[#09090b]",
      cardBg: "bg-black border-2 border-white",
      textPrimary: "text-white",
      textSecondary: "text-white/80",
      buttonPrimary: "bg-white text-black hover:bg-zinc-200 border border-white font-bold",
      buttonSecondary: "border border-white bg-black hover:bg-zinc-950 text-white",
      buttonTertiary: "text-white underline hover:text-zinc-200",
      badge: "border-white border text-white",
      plansBg: "border border-white bg-black",
      accentGlow: "rgba(255,255,255,0)",
      inputBg: "bg-black border-2 border-white text-white",
      border: "border-2 border-white",
    },
    axis: {
      bg: "bg-[#050607]",
      cardBg: "bg-[#050607]/95 border-cyan-400/20",
      textPrimary: "text-cyan-50",
      textSecondary: "text-cyan-200/60",
      buttonPrimary: "bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]",
      buttonSecondary: "border-cyan-400/20 hover:bg-cyan-400/5 text-cyan-300",
      buttonTertiary: "text-violet-400 hover:text-violet-300",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      plansBg: "bg-cyan-950/10 border-cyan-500/10",
      accentGlow: "rgba(6,182,212,0.25)",
      inputBg: "bg-[#181B22] border-white/[0.10] text-white",
      border: "border-white/[0.08]",
    },
  };

  return themes[theme] || themes.dark;
};

export const getThemeClass = (theme: Theme): string => {
  switch (theme) {
    case "light":
      return "bg-gray-50 text-black";
    case "high-contrast":
      return "bg-black text-white";
    case "axis":
      return "bg-[#0A0A0B] text-white";
    default:
      return "bg-[#0A0A0B] text-white";
  }
};
