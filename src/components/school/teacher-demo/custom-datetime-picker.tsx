"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type PickerType = "date" | "time" | "datetime";

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  type: PickerType;
  theme?: Theme;
  placeholder?: string;
  className?: string;
}

export function CustomDateTimePicker({
  value,
  onChange,
  type,
  theme = "dark",
  placeholder,
  className = "",
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  // Parse initial date value
  const parseValue = () => {
    let parsedDate = new Date();
    let parsedHours = 9;
    let parsedMinutes = 0;
    let parsedAmPm = "AM";

    if (value) {
      try {
        if (type === "date") {
          const [y, m, d] = value.split("-").map(Number);
          parsedDate = new Date(y, m - 1, d);
        } else if (type === "time") {
          const [h, min] = value.split(":").map(Number);
          parsedHours = h % 12 || 12;
          parsedMinutes = min || 0;
          parsedAmPm = h >= 12 ? "PM" : "AM";
        } else if (type === "datetime") {
          // Supports YYYY-MM-DDTHH:MM or YYYY-MM-DD HH:MM
          const parts = value.split(/[T ]/);
          if (parts[0]) {
            const [y, m, d] = parts[0].split("-").map(Number);
            parsedDate = new Date(y, m - 1, d);
          }
          if (parts[1]) {
            const [h, min] = parts[1].split(":").map(Number);
            parsedHours = h % 12 || 12;
            parsedMinutes = min || 0;
            parsedAmPm = h >= 12 ? "PM" : "AM";
          }
        }
      } catch (e) {
        console.error("Error parsing date/time value:", e);
      }
    }

    return {
      date: parsedDate,
      hours: parsedHours,
      minutes: parsedMinutes,
      ampm: parsedAmPm,
    };
  };

  const initialVal = parseValue();
  const [currentDate, setCurrentDate] = useState<Date>(initialVal.date);
  const [selectedDate, setSelectedDate] = useState<Date>(initialVal.date);
  const [selectedHours, setSelectedHours] = useState<number>(initialVal.hours);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialVal.minutes);
  const [selectedAmPm, setSelectedAmPm] = useState<string>(initialVal.ampm);

  // Sync state if value prop changes
  useEffect(() => {
    const val = parseValue();
    setCurrentDate(val.date);
    setSelectedDate(val.date);
    setSelectedHours(val.hours);
    setSelectedMinutes(val.minutes);
    setSelectedAmPm(val.ampm);
  }, [value, type]);

  // Click outside listener to close picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date helper: YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format time helper: HH:MM (24h format for input sync)
  const formatTimeString = (h: number, m: number, ap: string) => {
    let hour24 = h;
    if (ap === "PM" && h < 12) hour24 += 12;
    if (ap === "AM" && h === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Trigger onChange with combined date/time value
  const handleSelect = (date: Date, hours: number, minutes: number, ampm: string) => {
    if (type === "date") {
      onChange(formatDateString(date));
    } else if (type === "time") {
      onChange(formatTimeString(hours, minutes, ampm));
    } else {
      onChange(`${formatDateString(date)}T${formatTimeString(hours, minutes, ampm)}`);
    }
  };

  // Get display text for input box
  const getDisplayText = () => {
    if (!value) return placeholder || `Select ${type}...`;

    if (type === "date") {
      const d = selectedDate;
      return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
    } else if (type === "time") {
      return `${selectedHours.toString().padStart(2, "0")}:${selectedMinutes.toString().padStart(2, "0")} ${selectedAmPm}`;
    } else {
      const d = selectedDate;
      const dateStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
      const timeStr = `${selectedHours.toString().padStart(2, "0")}:${selectedMinutes.toString().padStart(2, "0")} ${selectedAmPm}`;
      return `${dateStr} ${timeStr}`;
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, ...
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align to Monday as index 0

  const daysArray = [];
  
  // Previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month padding days
  const totalCells = 42; // standard 6 rows of 7
  const nextMonthPadding = totalCells - daysArray.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container wrapper */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg bg-white/5 border px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 cursor-pointer focus-within:border-cyan-500/50 hover:bg-white/[0.07] transition-all select-none ${
          isOpen ? "border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]" : "border-white/10"
        }`}
      >
        <span className={value ? "text-white" : "text-white/40 font-normal"}>{getDisplayText()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          {type === "time" ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          )}
        </svg>
      </div>

      {/* Popover Calendar & Picker Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 top-full z-[100] mt-1.5 flex rounded-xl border border-white/10 bg-[#141416] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${
              type === "time" ? "w-[240px]" : type === "date" ? "w-[280px]" : "w-[440px]"
            } overflow-hidden`}
          >
            {/* LEFT SIDE: DATE GRID PANEL */}
            {type !== "time" && (
              <div className="flex-1 pr-3">
                {/* Month/Year Navigation Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-sm font-bold text-white select-none">
                    {monthsList[month]}, {year}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-white/60 hover:text-white transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-white/60 hover:text-white transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Weekdays Row */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekdays.map((wd) => (
                    <span key={wd} className="text-[10px] font-extrabold uppercase text-white/30 tracking-wider">
                      {wd}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {daysArray.map((cell, index) => {
                    const isSelected = selectedDate && 
                      cell.date.getDate() === selectedDate.getDate() &&
                      cell.date.getMonth() === selectedDate.getMonth() &&
                      cell.date.getFullYear() === selectedDate.getFullYear();
                    
                    const isToday = () => {
                      const today = new Date();
                      return cell.date.getDate() === today.getDate() &&
                        cell.date.getMonth() === today.getMonth() &&
                        cell.date.getFullYear() === today.getFullYear();
                    };

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedDate(cell.date);
                          handleSelect(cell.date, selectedHours, selectedMinutes, selectedAmPm);
                          if (type === "date") {
                            setIsOpen(false);
                          }
                        }}
                        className={`
                          text-xs py-1.5 rounded-lg font-medium cursor-pointer transition-all flex items-center justify-center select-none
                          ${!cell.isCurrentMonth ? "text-white/20 hover:text-white/40" : "text-white/80 hover:text-white"}
                          ${isSelected ? "bg-cyan-500 font-bold text-black hover:bg-cyan-400" : ""}
                          ${isToday() && !isSelected ? "border border-cyan-500/30 text-cyan-400 bg-cyan-500/[0.02]" : ""}
                          ${!isSelected && !isToday() ? "hover:bg-white/5" : ""}
                        `}
                      >
                        {cell.day}
                      </div>
                    );
                  })}
                </div>

                {/* Footer buttons (only date or datetime modes) */}
                <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setCurrentDate(today);
                      handleSelect(today, selectedHours, selectedMinutes, selectedAmPm);
                      if (type === "date") {
                        setIsOpen(false);
                      }
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* RIGHT SIDE: TIME SCROLL COLUMNS */}
            {type !== "date" && (
              <div className={`flex flex-col pl-3 ${type === "datetime" ? "border-l border-white/5 w-[140px]" : "w-full"}`}>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5 px-1.5 select-none">
                  Time
                </div>
                
                {/* Time Selection Container */}
                <div className="flex gap-1.5 flex-1 overflow-hidden h-[180px]">
                  {/* Hours column */}
                  <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none pr-0.5 h-full">
                    {hoursList.map((h) => (
                      <div
                        key={h}
                        onClick={() => {
                          setSelectedHours(h);
                          handleSelect(selectedDate, h, selectedMinutes, selectedAmPm);
                        }}
                        className={`text-center py-1.5 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors ${
                          selectedHours === h 
                            ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30" 
                            : "text-white/60 hover:bg-white/5"
                        }`}
                      >
                        {h.toString().padStart(2, "0")}
                      </div>
                    ))}
                  </div>

                  {/* Minutes column */}
                  <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-none pr-0.5 h-full">
                    {minutesList.filter((m) => m % 5 === 0).map((m) => ( // Render 5 minute intervals to stay sleek
                      <div
                        key={m}
                        onClick={() => {
                          setSelectedMinutes(m);
                          handleSelect(selectedDate, selectedHours, m, selectedAmPm);
                        }}
                        className={`text-center py-1.5 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors ${
                          selectedMinutes === m 
                            ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30" 
                            : "text-white/60 hover:bg-white/5"
                        }`}
                      >
                        {m.toString().padStart(2, "0")}
                      </div>
                    ))}
                  </div>

                  {/* AM/PM Column */}
                  <div className="flex flex-col gap-1 w-11">
                    {["AM", "PM"].map((ap) => (
                      <div
                        key={ap}
                        onClick={() => {
                          setSelectedAmPm(ap);
                          handleSelect(selectedDate, selectedHours, selectedMinutes, ap);
                        }}
                        className={`text-center py-2.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                          selectedAmPm === ap 
                            ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30" 
                            : "text-white/50 hover:bg-white/5"
                        }`}
                      >
                        {ap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer buttons for Time-only picker */}
                {type === "time" && (
                  <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const h = now.getHours() % 12 || 12;
                        const min = Math.round(now.getMinutes() / 5) * 5 % 60;
                        const ap = now.getHours() >= 12 ? "PM" : "AM";
                        setSelectedHours(h);
                        setSelectedMinutes(min);
                        setSelectedAmPm(ap);
                        handleSelect(selectedDate, h, min, ap);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setIsOpen(false);
                      }}
                      className="text-white/40 hover:text-white/70 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
