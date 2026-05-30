"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ClockSystem() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-20" />; // Prevent hydration mismatch layout shift

  const formatHours = time.getHours().toString().padStart(2, "0");
  const formatMinutes = time.getMinutes().toString().padStart(2, "0");
  const formatSeconds = time.getSeconds().toString().padStart(2, "0");

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDayName = days[time.getDay()];
  const currentMonthName = months[time.getMonth()];
  const currentDateNum = time.getDate();

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-safe-lg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col justify-start">
        {/* Large clock */}
        <div className="flex items-baseline font-mono text-5xl font-light tracking-tighter text-white select-none">
          <span>{formatHours}</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mx-1 text-white/50"
          >
            :
          </motion.span>
          <span>{formatMinutes}</span>
          <span className="ml-2 text-xs font-normal text-white/20 select-none tracking-widest uppercase">
            {formatSeconds}
          </span>
        </div>

        {/* Date layer */}
        <div className="mt-3 flex flex-col items-start gap-0.5 border-t border-white/[0.04] pt-3">
          <span className="text-sm font-semibold tracking-tight text-white/90">
            {currentDayName}
          </span>
          <span className="text-xs tracking-normal text-white/45">
            {currentDateNum} {currentMonthName} {time.getFullYear()}
          </span>
        </div>

        {/* Small operational indicator */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-2.5 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/30 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium text-white/50 tracking-wider uppercase">
            Ecosystem Connected
          </span>
        </div>
      </div>
    </div>
  );
}

