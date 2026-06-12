"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useDemoTutorial } from "@/components/school/demo-tutorial-context";
import { StudentSidebar } from "./student-sidebar";
import { StudentDashboard } from "./student-dashboard";
import { StudentSchedule } from "./student-schedule";
import { StudentClassSpace } from "./student-class-space";
import { StudentAcademicProfile } from "./student-academic-profile";
import { StudentApplicationMaker } from "./student-application-maker";
import { StudentWorkspace } from "./student-workspace";
import { StudentSupportFeedback } from "./student-support-feedback";

// Reused components from teacher-demo
import { SettingsWorkspace } from "../teacher-demo/settings-workspace";
import { StudentMessages as MessagesWorkspace } from "./student-messages";
import { MeetingsWorkspace } from "../teacher-demo/meetings-workspace";
import { CalendarWorkspace } from "../teacher-demo/calendar-workspace";
import { StudentEmail as EmailWorkspace } from "./student-email";
import { ConnectedResources } from "../teacher-demo/connected-resources-workspace";
import { PersonalDatabaseWorkspace } from "../personal-database";
import { EssentialSpaceWorkspace } from "../teacher-demo/essential-space-workspace";
import { SharedDemoHeader } from "../shared-demo-header";
import { CaptureLayer, type CapturedItem } from "../teacher-demo/capture-layer";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type StudentDemoShellProps = {
  perspectiveLabel?: string;
  perspectiveId?: string;
};

type SearchItem = {
  id: string;
  type: "Class" | "Teacher" | "Document" | "Venue" | "Action";
  title: string;
  subtitle: string;
  targetTab: string;
  actionData?: Record<string, string>;
};

const INITIAL_SEARCH_ITEMS: SearchItem[] = [
  // Classes
  { id: "cls-1", type: "Class", title: "DP1 Physics HL", subtitle: "Instructor: Aarav Chen · Room S504", targetTab: "class-space" },
  { id: "cls-2", type: "Class", title: "Math AA HL", subtitle: "Instructor: Dr. Sarah Chen · Room M302", targetTab: "class-space" },
  { id: "cls-3", type: "Class", title: "English A HL", subtitle: "Instructor: James Morrison · Room E201", targetTab: "class-space" },
  { id: "cls-4", type: "Class", title: "Chemistry SL", subtitle: "Instructor: Dr. Priya Sharma · Lab S102", targetTab: "class-space" },
  { id: "cls-6", type: "Class", title: "Psychology SL", subtitle: "Instructor: Dr. Marcus Vance · Room P104", targetTab: "class-space" },
  { id: "cls-7", type: "Class", title: "Spanish B SL", subtitle: "Instructor: Señora Isabella Ruiz", targetTab: "class-space" },
  
  // IB Components
  { id: "comp-ee", type: "Class", title: "Extended Essay (EE)", subtitle: "Advisor: Dr. Sarah Chen · Core Requirement", targetTab: "class-space" },
  { id: "comp-tok", type: "Class", title: "Theory of Knowledge (TOK - Core Component)", subtitle: "Coordinator: Michael Torres · Exhibition & Essay", targetTab: "class-space" },
  { id: "comp-cas", type: "Class", title: "CAS Portfolio", subtitle: "Advisor: Aarav Chen · Creativity, Activity, Service", targetTab: "class-space" },
  
  // Teachers
  { id: "tch-1", type: "Teacher", title: "Aarav Chen", subtitle: "Physics Department Head · advisor", targetTab: "messages" },
  { id: "tch-2", type: "Teacher", title: "Dr. Sarah Chen", subtitle: "Mathematics Department", targetTab: "messages" },
  { id: "tch-3", type: "Teacher", title: "James Morrison", subtitle: "Languages Department", targetTab: "messages" },
  { id: "tch-4", type: "Teacher", title: "Dr. Priya Sharma", subtitle: "Sciences Department", targetTab: "messages" },
  { id: "tch-5", type: "Teacher", title: "Michael Torres", subtitle: "TOK Coordinator", targetTab: "messages" },
  { id: "tch-6", type: "Teacher", title: "Dr. Marcus Vance", subtitle: "Social Sciences Dept", targetTab: "messages" },
  { id: "tch-7", type: "Teacher", title: "Señora Isabella Ruiz", subtitle: "Languages Dept", targetTab: "messages" },

  // Venues
  { id: "ven-1", type: "Venue", title: "Science Room S504", subtitle: "Floor 5 · Physics Classroom", targetTab: "schedule" },
  { id: "ven-2", type: "Venue", title: "Math Room M302", subtitle: "Floor 3 · Mathematics Classroom", targetTab: "schedule" },
  { id: "ven-3", type: "Venue", title: "English Room E201", subtitle: "Floor 2 · Humanities Classroom", targetTab: "schedule" },
  { id: "ven-4", type: "Venue", title: "Science Lab S102", subtitle: "Floor 1 · Chemistry Lab", targetTab: "schedule" },
  { id: "ven-5", type: "Venue", title: "School Library", subtitle: "Floor 1 · Quiet Study Area", targetTab: "connected-resources" },
  { id: "ven-6", type: "Venue", title: "Psychology Room P104", subtitle: "Floor 1 · Humanities Classroom", targetTab: "schedule" },

  // Actions
  { id: "act-1", type: "Action", title: "My Schedule", subtitle: "Go to personal timetable and events", targetTab: "schedule" },
  { id: "act-2", type: "Action", title: "Application Maker", subtitle: "College applications and readiness assessment", targetTab: "university" },
  { id: "act-workspace", type: "Action", title: "Workspace", subtitle: "Access documents, Microsoft integrations, and productivity tools", targetTab: "workspace" },
  { id: "act-support", type: "Action", title: "Support & Feedback", subtitle: "Submit a request, report an issue, or suggest improvements", targetTab: "support-feedback" },
  { id: "act-4", type: "Action", title: "Settings & Customization", subtitle: "Configure interface themes and preferences", targetTab: "settings" },
];

export function StudentDemoShell({
  perspectiveLabel = "Student",
  perspectiveId = "student",
}: StudentDemoShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [academicProfileSubTab, setAcademicProfileSubTab] = useState<string>("performance");
  const [classSpaceClassId, setClassSpaceClassId] = useState<string | null>(null);
  const [classSpaceTab, setClassSpaceTab] = useState<"assignments" | "resources" | "roadmap" | "members">("assignments");
  const [classSpaceTaskId, setClassSpaceTaskId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [emailInitialCompose, setEmailInitialCompose] = useState<{
    to: Array<{
      id: string;
      name: string;
      email: string;
      category: "Faculty" | "Guardians" | "Programme" | "Grade-Level" | "Subject Lead" | "Department" | "Broadcast";
    }>;
    subject: string;
    body: string;
  } | null>(null);

  // Onboarding Guided Tour states
  const { steps, activeStepIndex, isTutorialActive, startTutorial, nextStep, prevStep, endTutorial } =
    useDemoTutorial();

  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasRunTour, setHasRunTour] = useState(true);
  const [isWelcomeScreenOpen, setIsWelcomeScreenOpen] = useState(false);

  // Spotlight Search States
  const [isSpotlightSearchOpen, setIsSpotlightSearchOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");

  // Video call/Meetings states
  const [meetingScreenState, setMeetingScreenState] = useState<"inactive" | "loading" | "active">("inactive");
  const [activeMeetingInfo, setActiveMeetingInfo] = useState<any>(null);

  // Essential Space captures state
  const [essentialCaptures, setEssentialCaptures] = useState<CapturedItem[]>([
    {
      id: "cap-1",
      type: "space",
      title: "Physics IA Draft Outline",
      description: "My personal outline structure for the Physics internal assessment.",
      meta: "Chloe Vance · Grade 11 B",
      active: true,
      tags: ["Physics IA"],
      dimensions: "400x300",
      date: "Jun 10, 2026",
      fromEssentialSpace: true,
    }
  ]);

  // Synchronize localStorage theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme((localStorage.getItem("axis-theme") as Theme) || "dark");
      
      const handleThemeChange = () => {
        setTheme((localStorage.getItem("axis-theme") as Theme) || "dark");
      };
      window.addEventListener("axis-theme-change", handleThemeChange);
      return () => window.removeEventListener("axis-theme-change", handleThemeChange);
    }
  }, []);

  const styles = getAxisTheme(theme);

  // Auto-start onboarding if first time
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("axis-tour-has-run");
      if (stored !== "true") {
        setIsWelcomeScreenOpen(true);
        try {
          startTutorial();
        } catch (e) {
          console.error("Failed to auto-start tutorial:", e);
        }
      }
    }
  }, [startTutorial]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("axis-tour-has-run");
      setHasRunTour(stored === "true");
    }
  }, [isTutorialActive]);

  // Sync active tab with tour walkthrough steps
  useEffect(() => {
    if (!isTutorialActive) return;
    switch (activeStepIndex) {
      case 0: // Welcome
      case 1: // Dashboard
        setActiveTab("home");
        setIsSpotlightSearchOpen(false);
        break;
      case 2: // Schedule
        setActiveTab("schedule");
        setIsSpotlightSearchOpen(false);
        break;
      case 3: // Class Space
        setActiveTab("class-space");
        setIsSpotlightSearchOpen(false);
        break;
      case 4: // Messages
        setActiveTab("messages");
        setIsSpotlightSearchOpen(false);
        break;
      case 5: // Email
        setActiveTab("email");
        setIsSpotlightSearchOpen(false);
        break;
      case 6: // Academic Profile
        setActiveTab("academic-profile");
        setIsSpotlightSearchOpen(false);
        break;
      case 7: // University Readiness
        setActiveTab("university");
        setIsSpotlightSearchOpen(false);
        break;
      case 8: // Essential Space
        setActiveTab("essential-space");
        setIsSpotlightSearchOpen(false);
        break;
      case 9: // Personal Database
        setActiveTab("personal-database");
        setIsSpotlightSearchOpen(false);
        break;
      case 10: // Connected Resources
        setActiveTab("connected-resources");
        setIsSpotlightSearchOpen(false);
        break;
      case 11: // Axis Search Step
        setActiveTab("home");
        setIsSpotlightSearchOpen(true);
        break;
    }
  }, [activeStepIndex, isTutorialActive]);

  // Keyboard shortcut listener (Ctrl+K or "/" to search, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightSearchOpen((prev) => !prev);
      }
      
      // Open search on "/" when not inside an input/textarea
      if (e.key === "/" && !isTutorialActive) {
        const target = e.target as HTMLElement;
        if (
          target &&
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setIsSpotlightSearchOpen(true);
        }
      }

      // Close modal on Escape
      if (e.key === "Escape") {
        setIsSpotlightSearchOpen(false);
        setShowSkipWarning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTutorialActive]);

  // Spotlight search results calculation
  const searchResults = useMemo(() => {
    if (!spotlightQuery.trim()) return null;
    const query = spotlightQuery.toLowerCase().trim();
    const filtered = INITIAL_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    return {
      classes: filtered.filter((i) => i.type === "Class"),
      teachers: filtered.filter((i) => i.type === "Teacher"),
      venues: filtered.filter((i) => i.type === "Venue"),
      actions: filtered.filter((i) => i.type === "Action"),
    };
  }, [spotlightQuery]);

  const handleSelectSearchResult = (item: SearchItem) => {
    setIsSpotlightSearchOpen(false);
    setSpotlightQuery("");
    
    if (item.type === "Class") {
      const classIdMap: Record<string, string> = {
        "cls-1": "physics",
        "cls-2": "math",
        "cls-3": "english",
        "cls-4": "chemistry",
        "cls-6": "psychology",
        "cls-7": "spanish",
        "comp-ee": "ee",
        "comp-tok": "tok-core",
        "comp-cas": "cas",
      };
      const resolvedClassId = classIdMap[item.id];
      if (resolvedClassId) {
        setClassSpaceClassId(resolvedClassId);
        setClassSpaceTab("assignments");
        setClassSpaceTaskId(null);
      }
    }
    
    setActiveTab(item.targetTab);
  };

  // Guided Tour handlers
  const handleStartTourFromWelcome = () => {
    setIsWelcomeScreenOpen(false);
    startTutorial();
  };

  const handleExploreOnMyOwn = () => {
    setIsWelcomeScreenOpen(false);
    endTutorial();
    localStorage.setItem("axis-tour-has-run", "true");
  };

  const handleContinueTourFromWarning = () => {
    setShowSkipWarning(false);
    if (isWelcomeScreenOpen) {
      setIsWelcomeScreenOpen(false);
      startTutorial();
    }
  };

  const handleSkipAnywayFromWarning = () => {
    setShowSkipWarning(false);
    localStorage.setItem("axis-tour-has-run", "true");
    setIsWelcomeScreenOpen(false);
    endTutorial();
  };

  const handleSkipOrExit = () => {
    if (!hasRunTour) {
      setShowSkipWarning(true);
    } else {
      endTutorial();
    }
  };

  const handleNext = () => {
    if (activeStepIndex === steps.length - 1) {
      setShowCompletionModal(true);
    } else {
      nextStep();
    }
  };

  // Capture Layer handlers
  const handleSaveCapture = (item: CapturedItem) => {
    const enrichedItem = {
      ...item,
      fromEssentialSpace: true,
    };
    setEssentialCaptures((prev) => [enrichedItem, ...prev]);
  };

  const handleDeleteCapture = (id: string) => {
    setEssentialCaptures((prev) => prev.filter((c) => c.id !== id));
  };

  const activeStep = isTutorialActive ? steps[activeStepIndex] : null;

  const shellBgClass = {
    dark: "bg-[#0A0A0B]",
    light: "bg-[#F3F4F6]",
    "high-contrast": "bg-[#09090b]",
    axis: "bg-[#050607]",
  }[theme] || "bg-[#0A0A0B]";

  return (
    <div className={`min-h-screen w-full flex ${shellBgClass} antialiased overflow-hidden ${styles.textPrimary} transition-colors duration-300`}>
      {/* Video Call Mode View */}
      {meetingScreenState !== "inactive" ? (
        <div className="flex-1 w-full h-screen bg-[#0A0A0B] flex flex-col z-[150]">
          <AnimatePresence mode="wait">
            {meetingScreenState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4"
              >
                <div className="size-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <span className="text-xs text-white/40 tracking-wider uppercase font-semibold">
                  Calibrating Audio & Joining Virtual Room...
                </span>
                <div className="text-center pt-6">
                  <button
                    onClick={() => setMeetingScreenState("inactive")}
                    className="text-xs font-semibold text-white/30 hover:text-white/70 transition-colors"
                  >
                    Cancel and Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}

            {meetingScreenState === "active" && (
              <motion.div
                key="call"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 w-full h-full"
              >
                <MeetingsWorkspace
                  isCallActiveMode={true}
                  initialMeeting={activeMeetingInfo}
                  onLeaveMeeting={() => setMeetingScreenState("inactive")}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {/* Student Left Sidebar Navigation */}
          <StudentSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            isTutorialActive={isTutorialActive}
            activeStepIndex={activeStepIndex}
          />

          {/* Main Console Viewport */}
          <div className="flex-1 flex flex-col h-screen pl-[72px] overflow-hidden transition-all duration-300">
            {/* Top Shared Header */}
            <SharedDemoHeader
              perspectiveLabel={perspectiveLabel}
              perspectiveId={perspectiveId}
              userName="Chloe Vance"
              userAvatar="CV"
              dateInfo="Friday, June 12"
              updatesInfo="3 assignments due this week"
              theme={theme}
              onAdoptClick={() => router.push("/adopt")}
            />

            {/* Scrollable Workspace Container */}
            <main className="relative flex-1 overflow-y-auto px-safe-lg py-safe-lg md:px-safe-xl md:py-safe-xl scrollbar-none">
              <AnimatePresence mode="wait">
                {activeTab === "home" && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full"
                  >
                    <StudentDashboard
                      theme={theme}
                      onTabChange={setActiveTab}
                      onNavigateToTask={(classId, tab, taskId) => {
                        setClassSpaceClassId(classId);
                        setClassSpaceTab(tab);
                        setClassSpaceTaskId(taskId || null);
                      }}
                      onNavigateToSnapshotDetail={(metric) => {
                        if (metric === "gpa") {
                          setActiveTab("academic-profile");
                          setAcademicProfileSubTab("performance");
                        } else if (metric === "predictions") {
                          setActiveTab("academic-profile");
                          setAcademicProfileSubTab("predictions");
                        } else if (metric === "attendance") {
                          setActiveTab("academic-profile");
                          setAcademicProfileSubTab("attendance");
                        } else if (metric === "cas") {
                          setClassSpaceClassId("cas");
                          setClassSpaceTab("assignments");
                          setClassSpaceTaskId(null);
                          setActiveTab("class-space");
                        } else if (metric === "ee") {
                          setClassSpaceClassId("ee");
                          setClassSpaceTab("assignments");
                          setClassSpaceTaskId(null);
                          setActiveTab("class-space");
                        } else if (metric === "ia") {
                          setClassSpaceClassId("ia");
                          setClassSpaceTab("assignments");
                          setClassSpaceTaskId(null);
                          setActiveTab("class-space");
                        }
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === "workspace" && (
                  <motion.div
                    key="workspace"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <StudentWorkspace theme={theme} onNavigateToTab={setActiveTab} />
                  </motion.div>
                )}

                {activeTab === "schedule" && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="max-w-4xl mx-auto w-full"
                  >
                    <StudentSchedule
                      theme={theme}
                      onNavigateToClass={(classId) => {
                        setClassSpaceClassId(classId);
                        setClassSpaceTab("assignments");
                        setClassSpaceTaskId(null);
                        setActiveTab("class-space");
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === "class-space" && (
                  <motion.div
                    key="class-space"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <StudentClassSpace
                      theme={theme}
                      initialClassId={classSpaceClassId}
                      initialTab={classSpaceTab}
                      initialTaskId={classSpaceTaskId}
                    />
                  </motion.div>
                )}

                {activeTab === "academic-profile" && (
                  <motion.div
                    key="academic-profile"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <StudentAcademicProfile
                      theme={theme}
                      initialSubTab={academicProfileSubTab}
                      onSubTabChange={setAcademicProfileSubTab}
                      onNavigateToTab={setActiveTab}
                      onEmailCompose={(data) => {
                        setEmailInitialCompose({
                          to: data.to.map((t, i) => ({
                            id: `coord-${i}-${Date.now()}`,
                            name: t.name,
                            email: t.email,
                            category: "Faculty" as const,
                          })),
                          subject: data.subject,
                          body: data.body,
                        });
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === "university" && (
                  <motion.div
                    key="university"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <StudentApplicationMaker theme={theme} />
                  </motion.div>
                )}

                {activeTab === "messages" && (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <MessagesWorkspace />
                  </motion.div>
                )}

                {activeTab === "email" && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <EmailWorkspace
                      initialCompose={emailInitialCompose}
                      onClearCompose={() => setEmailInitialCompose(null)}
                    />
                  </motion.div>
                )}

                {activeTab === "meetings" && (
                  <motion.div
                    key="meetings"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <MeetingsWorkspace
                      onStartMeetingTransit={(meet) => {
                        setActiveMeetingInfo(meet);
                        setMeetingScreenState("loading");
                        setTimeout(() => setMeetingScreenState("active"), 1200);
                      }}
                      theme={theme}
                    />
                  </motion.div>
                )}

                {activeTab === "calendar" && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <CalendarWorkspace />
                  </motion.div>
                )}

                {activeTab === "essential-space" && (
                  <motion.div
                    key="essential-space"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <EssentialSpaceWorkspace
                      theme={theme}
                      captures={essentialCaptures}
                      onDeleteCapture={handleDeleteCapture}
                    />
                  </motion.div>
                )}

                {activeTab === "personal-database" && (
                  <motion.div
                    key="personal-database"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="max-w-6xl mx-auto w-full"
                  >
                    <PersonalDatabaseWorkspace theme={theme} />
                  </motion.div>
                )}

                {activeTab === "support-feedback" && (
                  <motion.div
                    key="support-feedback"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <StudentSupportFeedback theme={theme} />
                  </motion.div>
                )}

                {activeTab === "connected-resources" && (
                  <motion.div
                    key="connected-resources"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="w-full"
                  >
                    <ConnectedResources fullPage={true} />
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="max-w-4xl mx-auto w-full"
                  >
                    <SettingsWorkspace />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </>
      )}

      {/* Guided Tour popover overlay */}
      <AnimatePresence>
        {isTutorialActive && activeStep && (
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-6 right-6 md:left-[96px] md:right-6 z-50 mx-auto max-w-xl rounded-2xl border border-white/15 bg-[#0E0E10]/95 px-6 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            role="dialog"
            aria-label="Student Guided Tour Guidance"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest">
                Student Tour · Step {activeStepIndex + 1} of {steps.length} · {Math.round(((activeStepIndex + 1) / steps.length) * 100)}% Complete
              </span>
              <h3 className="mt-2 text-sm font-semibold tracking-tight text-white">{activeStep.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">{activeStep.description}</p>
              
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={activeStepIndex === 0}
                    className="text-xs font-semibold text-white/45 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    type="button"
                    onClick={handleSkipOrExit}
                    className="text-xs font-semibold text-white/40 hover:text-white transition-colors"
                  >
                    Skip Tour
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkipOrExit}
                    className="text-xs font-semibold text-white/40 hover:text-white transition-colors"
                  >
                    Exit
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                  >
                    {activeStepIndex === steps.length - 1 ? "Finish" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Welcome Onboarding Screen */}
      <AnimatePresence>
        {isWelcomeScreenOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0E0E10]/95 p-8 shadow-2xl text-white space-y-6 text-center"
            >
              <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mx-auto text-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold">
                A
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                  Welcome to Axis
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Welcome to your new student environment.
                </h2>
                <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
                  Axis connects all your classes, schedules, assignments, resources, and communications into a single dashboard.
                </p>
              </div>

              <div className="h-px bg-white/[0.06] w-full" />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartTourFromWelcome}
                  className="flex-1 rounded-xl bg-white text-black font-bold text-xs py-3.5 hover:opacity-90 transition-all uppercase tracking-wider"
                >
                  Take Guided Tour
                </button>
                <button
                  type="button"
                  onClick={handleExploreOnMyOwn}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-transparent text-white/70 font-semibold text-xs py-3.5 hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  Explore On My Own
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skip Warning Modal */}
      <AnimatePresence>
        {showSkipWarning && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setShowSkipWarning(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 p-6 shadow-2xl text-white space-y-4 text-center z-10"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skip Guided Tour?</h3>
              <div className="h-px bg-white/[0.06] w-full" />
              <p className="text-xs text-white/60 leading-relaxed text-left">
                Axis works differently from other school systems. It has integrated tools like the Context Engine, keyboard search, and and the capture system.
                <br /><br />
                A quick 2-minute tour will show you exactly how to navigate.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleContinueTourFromWarning}
                  className="flex-1 rounded-xl bg-white text-black font-bold text-xs py-3 hover:opacity-90 transition-all"
                >
                  Continue Tour
                </button>
                <button
                  type="button"
                  onClick={handleSkipAnywayFromWarning}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-transparent text-white/70 font-semibold text-xs py-3 hover:bg-white/5 transition-all"
                >
                  Skip Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => {
              setShowCompletionModal(false);
              localStorage.setItem("axis-tour-has-run", "true");
              endTutorial();
            }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 p-6 shadow-2xl text-white space-y-5 text-center z-10"
            >
              <div className="size-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400 animate-bounce">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">You&apos;re Ready.</h3>
                <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-widest">Axis Student Onboarding Complete</p>
              </div>
              <div className="h-px bg-white/[0.06] w-full" />
              <p className="text-xs text-white/60 leading-relaxed text-center">
                You now know how to view your classes, check schedules, track university applications, write notes, and search across Axis.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompletionModal(false);
                    localStorage.setItem("axis-tour-has-run", "true");
                    endTutorial();
                    setActiveTab("home");
                  }}
                  className="flex-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs py-3.5 transition-all uppercase tracking-wider"
                >
                  Enter Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spotlight Search Modal overlay */}
      <AnimatePresence>
        {isSpotlightSearchOpen && (
          <div className="fixed inset-0 z-[250] flex items-start justify-center p-6 bg-black/70 backdrop-blur-sm pt-24">
            <div className="fixed inset-0" onClick={() => setIsSpotlightSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 shadow-[0_32px_128px_rgba(0,0,0,0.95)] overflow-hidden z-10"
            >
              {/* Spotlight Input */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                <svg className="size-5 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={spotlightQuery}
                  onChange={(e) => setSpotlightQuery(e.target.value)}
                  placeholder="Search classes, teachers, venues, resources or actions... (Esc to close)"
                  className="w-full bg-transparent text-sm text-white placeholder-white/25 border-none focus:outline-none"
                />
              </div>

              {/* Spotlight Content */}
              <div className="max-h-[380px] overflow-y-auto p-4 space-y-4">
                {searchResults === null ? (
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      Try Searching For
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: "Physics", detail: "Jump straight to Class Space" },
                        { title: "Sarah Chen", detail: "Quick message with Math teacher" },
                        { title: "S504", detail: "Find classroom venue details" },
                        { title: "University", detail: "Readiness checklist rank A" },
                      ].map((item) => (
                        <button
                          key={item.title}
                          onClick={() => setSpotlightQuery(item.title)}
                          className="flex flex-col text-left p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.06] transition-all"
                        >
                          <span className="text-xs font-semibold text-white/80">{item.title}</span>
                          <span className="text-[9px] text-white/30 mt-0.5">{item.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Classes */}
                    {searchResults.classes.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-bold text-cyan-400/50 uppercase tracking-wider">Classes</div>
                        <div className="space-y-1">
                          {searchResults.classes.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.04]"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white/95">{item.title}</div>
                                <div className="text-[9px] text-white/35 mt-0.5 truncate">{item.subtitle}</div>
                              </div>
                              <span className="text-[9px] text-white/20 shrink-0">Class Space ↵</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teachers */}
                    {searchResults.teachers.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-bold text-emerald-400/50 uppercase tracking-wider">Teachers</div>
                        <div className="space-y-1">
                          {searchResults.teachers.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.04]"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white/95">{item.title}</div>
                                <div className="text-[9px] text-white/35 mt-0.5 truncate">{item.subtitle}</div>
                              </div>
                              <span className="text-[9px] text-white/20 shrink-0">Messages ↵</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Venues */}
                    {searchResults.venues.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-bold text-purple-400/50 uppercase tracking-wider">Venues</div>
                        <div className="space-y-1">
                          {searchResults.venues.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.04]"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white/95">{item.title}</div>
                                <div className="text-[9px] text-white/35 mt-0.5 truncate">{item.subtitle}</div>
                              </div>
                              <span className="text-[9px] text-white/20 shrink-0">Schedule ↵</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {searchResults.actions.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-bold text-amber-400/50 uppercase tracking-wider">Quick Actions</div>
                        <div className="space-y-1">
                          {searchResults.actions.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.04]"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white/95">{item.title}</div>
                                <div className="text-[9px] text-white/35 mt-0.5 truncate">{item.subtitle}</div>
                              </div>
                              <span className="text-[9px] text-white/20 shrink-0">Go to tab ↵</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.values(searchResults).every((arr) => arr.length === 0) && (
                      <div className="text-center py-8 text-xs text-white/20">
                        No matches found for &quot;{spotlightQuery}&quot;
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Capture overlay layer for E-key capture action */}
      <CaptureLayer onSaveCapture={handleSaveCapture} />
    </div>
  );
}
