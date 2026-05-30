import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        axis: {
          bg: "#F7F7F5",
          text: "#0F1115",
          muted: "#6E7178",
          line: "#E8E8E4",
          card: "#FCFCFB",
        },
      },
      spacing: {
        'safe-sm': '0.75rem',   // 12px
        'safe-md': '1rem',      // 16px
        'safe-lg': '1.5rem',    // 24px
        'safe-xl': '2rem',      // 32px
        'safe-2xl': '3rem',     // 48px
      },
      boxShadow: {
        soft: "0 10px 30px -24px rgba(0, 0, 0, 0.4), 0 2px 10px -8px rgba(0,0,0,0.18)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Geist", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      keyframes: {
        "slow-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "slow-float": "slow-float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
