"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { NavigationItem } from "@/components/school/navigation-item";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type SidebarItem = {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  enabled?: boolean;
};

type StudentSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme?: Theme;
  isTutorialActive?: boolean;
  activeStepIndex?: number;
};

export function StudentSidebar({
  activeTab,
  setActiveTab,
  theme = "dark",
  isTutorialActive = false,
  activeStepIndex = -1,
}: StudentSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const styles = getAxisTheme(theme);

  const items: SidebarItem[] = [
    {
      id: "home",
      label: "Home",
      subLabel: "Your day at a glance",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "workspace",
      label: "Workspace",
      subLabel: "Productivity & integrations",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "schedule",
      label: "My Schedule",
      subLabel: "Personal timetable",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "class-space",
      label: "Class Space",
      subLabel: "Classes & assignments",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "messages",
      label: "Messages",
      subLabel: "Direct & group chats",
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
      subLabel: "School email",
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
      subLabel: "Join & schedule",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 002.25-2.25h9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "academic-profile",
      label: "Academic Profile",
      subLabel: "Performance & growth",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "university",
      label: "Application Maker",
      subLabel: "College applications",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "calendar",
      label: "Calendar",
      subLabel: "Events & deadlines",
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
      subLabel: "Notes & captures",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "personal-database",
      label: "Personal Database",
      subLabel: "Private files",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "support-feedback",
      label: "Support & Feedback",
      subLabel: "Report issues & suggestions",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 4.5 4.5 0 0 0 3.322-1.66c.247-.296.58-.46 1.011-.46.574 0 1.157.067 1.731.067Z" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "connected-resources",
      label: "Connected Resources",
      subLabel: "School resources",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
      enabled: true,
    },
    {
      id: "settings",
      label: "Settings",
      subLabel: "Theme & profile",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      enabled: true,
    },
  ];

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => setIsHovered(false), 120);
  };

  // Determine sidebar colors based on theme
  const asideThemeClasses = {
    light: "bg-white/95 border-black/[0.06] shadow-[24px_0_80px_-20px_rgba(0,0,0,0.15)]",
    "high-contrast": "bg-black border-2 border-white",
    axis: "bg-[#050607]/85 border-cyan-400/20 shadow-[24px_0_80px_-20px_rgba(6,182,212,0.1)]",
    dark: "bg-[#0A0A0B]/85 border-white/[0.06] shadow-[24px_0_80px_-20px_rgba(0,0,0,0.8)]",
  };

  const currentAsideClasses = asideThemeClasses[theme] || asideThemeClasses.dark;

  const getHighlightId = (stepIdx: number) => {
    switch (stepIdx) {
      case 0:
      case 1:
        return "home";
      case 2:
        return "schedule";
      case 3:
        return "class-space";
      case 4:
        return "messages";
      case 5:
        return "email";
      case 6:
        return "academic-profile";
      case 7:
        return "university";
      case 8:
        return "essential-space";
      case 9:
        return "personal-database";
      case 10:
        return "connected-resources";
      default:
        return null;
    }
  };

  const highlightId = getHighlightId(activeStepIndex);

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ width: isHovered ? "260px" : "72px" }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={`fixed left-0 top-0 z-[100] flex h-screen flex-col border-r backdrop-blur-xl overflow-hidden select-none ${currentAsideClasses}`}
    >
      {/* Brand Logo */}
      <div className={`flex h-24 items-center px-5 shrink-0 ${isTutorialActive && activeStepIndex === 0 ? "tour-highlight rounded-r-xl" : ""}`}>
        <div className="flex items-center gap-4">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-base tracking-tighter shadow-md ${theme === "light" ? "bg-black text-white" : "bg-white text-[#0A0A0B]"}`}>
            A
          </div>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.15 }}
              className="flex flex-col"
            >
              <span className={`text-sm font-semibold tracking-wide uppercase ${styles.textPrimary}`}>Axis</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Student</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-none">
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
              isActive={isActive}
              onClick={() => item.enabled && setActiveTab(item.id)}
              disabled={!item.enabled}
              isCollapsed={!isHovered}
              layoutId="studentSidebarActiveHighlight"
              theme={theme}
              isHighlighted={isItemHighlighted}
            />
          );
        })}
      </nav>

      {/* Footer / version info */}
      <div className={`border-t px-5 py-4 ${styles.border}`}>
        {isHovered ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col items-center justify-between gap-1 text-[10px] ${styles.textSecondary}`}
          >
            <span>v0.4.8-alpha</span>
            <span>Student Console</span>
          </motion.div>
        ) : (
          <div className="text-center text-[9px] opacity-40">S</div>
        )}
      </div>
    </motion.aside>
  );
}
