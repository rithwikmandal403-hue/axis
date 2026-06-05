"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { NavigationItem } from "@/components/school/navigation-item";

type SidebarItem = {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  active?: boolean;
  enabled?: boolean;
};

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme?: string;
  isTutorialActive?: boolean;
  activeStepIndex?: number;
};

export function LeftSidebar({
  activeTab,
  setActiveTab,
  theme = "dark",
  isTutorialActive = false,
  activeStepIndex = -1,
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const items: SidebarItem[] = [
    {
      id: "home",
      label: "Home",
      subLabel: "Operational focus",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "timetable",
      label: "Timetable",
      subLabel: "Adaptive schedule",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "attendance",
      label: "Attendance",
      subLabel: "Attendance & presence",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "messages",
      label: "Messages",
      subLabel: "Direct & channels",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "email",
      label: "Email",
      subLabel: "School communication",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      enabled: true,
    },

    {
      id: "meetings",
      label: "Meetings",
      subLabel: "Scheduled & instant",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 002.25-2.25h9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "class-space",
      label: "Class Space",
      subLabel: "Unified tasks & resources",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.008v.008H9V10zm0 3.5h.008v.008H9v-.008zm0 3.5h.008v.008H9v-.008z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "calendar",
      label: "Calendar",
      subLabel: "Term dates & holidays",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "essential-space",
      label: "Essential Space",
      subLabel: "Personal captures, notes & knowledge",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925-3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 002.25 12c0 2.071 1.679 3.75 3.75 3.75a3.75 3.75 0 003.75-3.75M12 18a3.75 3.75 0 003.75-3.75m0 0a3.75 3.75 0 013.75-3.75A3.75 3.75 0 0012 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12a1 1 0 11-2 0 1 1 0 012 0zM10.5 15.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "workspace",
      label: "Workspace",
      subLabel: "Documents, presentations & collaboration",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.7c0-.621-.504-1.125-1.125-1.125H4.875C4.254 7.575 3.75 8.079 3.75 8.7v3.79c0 .668.324 1.294.87 1.66l1.245.833a2.18 2.18 0 002.006.18h8.258c.7 0 1.365-.371 1.745-.968l1.245-.833zM9 7.5v-1.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v1.5m-6 3h6" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "connected-resources",
      label: "Connected Resources",
      subLabel: "Connected systems & learning tools",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875V16.5m-1.05 2.25a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.05-11.25V7.5m-1.05-2.25a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm10.5 6V12m-1.05-2.25a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zM3.621 8.73A9 9 0 0110.5 2.25M12 21.75a9 9 0 01-6.879-3.02M20.379 15.27a9 9 0 01-6.879 3.02m0-12a9 9 0 016.879 3.02" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "requests",
      label: "Requests & Reports",
      subLabel: "Report issues & submit requests",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 01-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "settings",
      label: "Settings",
      subLabel: "Themes & profile config",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      enabled: true,
    },
  ];

  // Hover Intent and Delayed Collapse Handlers
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150); // 150ms hover intent delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120); // 120ms collapse delay
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-[#0A0A0B]/85 shadow-[24px_0_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      initial={{ width: "72px" }}
      animate={{ width: isHovered ? "260px" : "72px" }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }} // Premium custom easing duration (250ms)
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Brand logo at top */}
      <div className={`flex h-24 items-center px-5 transition-all duration-300 ${isTutorialActive && activeStepIndex === 0 ? "tour-highlight rounded-r-xl" : ""}`}>
        <div className="flex items-center gap-4">
          <motion.div 
            layout
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${theme === "light" ? "bg-[#111827] text-white" : "bg-white text-[#0A0A0B]"} font-bold text-base tracking-tighter shadow-md`}
          >
            A
          </motion.div>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.15 }}
              className="flex flex-col"
            >
              <span className="text-sm font-semibold tracking-wide text-white uppercase">Axis</span>
              <span className="text-[10px] text-white/40 tracking-wider">Ecosystem</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      {(() => {
        const getHighlightId = (stepIdx: number) => {
          switch (stepIdx) {
            case 1: return "home";
            case 3: return "timetable";
            case 4: return "attendance";
            case 5: return "messages";
            case 6: return "meetings";
            case 7: return "class-space";
            case 8: return "calendar";
            case 9: return "essential-space";
            case 10: return "essential-space";
            case 11: return "workspace";
            case 12: return "workspace";
            case 13: return "connected-resources";
            case 18: return "settings";
            default: return null;
          }
        };
        const highlightId = getHighlightId(activeStepIndex);

        return (
          <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-none">
            {items.map((item) => {
              const isActive = activeTab === item.id;
              const isItemHighlighted = isTutorialActive && highlightId === item.id;
              return (
                <NavigationItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  subLabel={item.subLabel}
                  icon={item.icon}
                  badge={item.id === "connected-resources" && !isHovered && (
                    <span className="absolute right-2 top-2 size-1.5 rounded-full bg-white/60 animate-pulse" />
                  )}
                  isActive={isActive}
                  onClick={() => item.enabled && setActiveTab(item.id)}
                  disabled={!item.enabled}
                  isCollapsed={!isHovered}
                  layoutId="sidebarActiveHighlight"
                  theme={theme}
                  isHighlighted={isItemHighlighted}
                />
              );
            })}
          </nav>
        );
      })()}

      {/* Footer / version info */}
      <div className="border-t border-white/[0.06] px-5 py-4">
        {isHovered ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-between gap-1 text-[10px] text-white/30"
          >
            <span>v0.4.8-alpha</span>
            <span>Teacher Console</span>
          </motion.div>
        ) : (
          <div className="text-center text-[9px] text-white/20">T</div>
        )}
      </div>
    </motion.aside>
  );
}

