"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useDemoTutorial } from "@/components/school/demo-tutorial-context";
import { LeftSidebar } from "./sidebar";
import { ClockSystem } from "./clock-system";
import { StatusSystem } from "./status-system";
import { CurrentClassCard, type ReminderItem } from "./current-class";
import { AdaptiveTimetable } from "./adaptive-timetable";
import { AttendanceWorkspace } from "./attendance-workspace";
import { SettingsWorkspace } from "./settings-workspace";
import { NotificationsSystem } from "./notifications-system";
import { ContextLayer } from "./context-layer";
import { CaptureLayer, type CapturedItem } from "./capture-layer";
import { MessagesWorkspace } from "./messages-workspace";
import { MeetingsWorkspace } from "./meetings-workspace";
import { CalendarWorkspace } from "./calendar-workspace";
import { EmailWorkspace } from "./email-workspace";
import { ClassSpaceWorkspace } from "./class-space-workspace";
import { AnnouncementsPanel } from "./announcements-panel";
import { DeviceCalibration } from "./device-calibration";
import { ConnectedResources } from "./connected-resources-workspace";
import { playNotificationSound } from "./audio-system";
import { EssentialSpaceWorkspace } from "./essential-space-workspace";
import { WorkspaceWorkspace, type WorkspaceItem } from "./workspace-workspace";

type TeacherDemoShellProps = {
  perspectiveLabel?: string;
  perspectiveId?: string;
};

type Student = {
  id: string;
  name: string;
  avatar: string;
  status: "present" | "late" | "excused" | "absent";
  deviceSynced: boolean;
  proximityVerified: boolean;
};

type ClassRoster = {
  [className: string]: {
    subject: string;
    roster: Student[];
    automatedActive: boolean;
  };
};

const INITIAL_ROSTERS: ClassRoster = {
  "Grade 11 Physics (B)": {
    subject: "Grade 11 Physics (Section B)",
    automatedActive: true,
    roster: [
      { id: "std-1", name: "Chloe Vance", avatar: "CV", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-2", name: "Dilan Patel", avatar: "DP", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-3", name: "Emma Watson", avatar: "EW", status: "late", deviceSynced: true, proximityVerified: false },
      { id: "std-4", name: "Lucas Gray", avatar: "LG", status: "absent", deviceSynced: false, proximityVerified: false },
      { id: "std-5", name: "Aria Thorne", avatar: "AT", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-6", name: "Jin Woo", avatar: "JW", status: "excused", deviceSynced: false, proximityVerified: false },
    ],
  },
  "Grade 12 Adv Physics (A)": {
    subject: "Grade 12 Advanced Physics (Section A)",
    automatedActive: true,
    roster: [
      { id: "std-7", name: "Alex Mercer", avatar: "AM", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-8", name: "Nisha Rao", avatar: "NR", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-9", name: "Oliver Queen", avatar: "OQ", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-10", name: "Selina Kyle", avatar: "SK", status: "absent", deviceSynced: false, proximityVerified: false },
      { id: "std-11", name: "Bruce Wayne", avatar: "BW", status: "excused", deviceSynced: true, proximityVerified: false },
    ],
  },
  "Homeroom 11-F": {
    subject: "Homeroom Advisory Group (11-F)",
    automatedActive: false,
    roster: [
      { id: "std-12", name: "Caleb Sterling", avatar: "CS", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-13", name: "Zoe Kravitz", avatar: "ZK", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-14", name: "Miles Morales", avatar: "MM", status: "late", deviceSynced: true, proximityVerified: false },
      { id: "std-15", name: "Gwen Stacy", avatar: "GS", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-16", name: "Peter Parker", avatar: "PP", status: "present", deviceSynced: true, proximityVerified: true },
      { id: "std-17", name: "Harry Osborn", avatar: "HO", status: "absent", deviceSynced: false, proximityVerified: false },
    ],
  },
};

export function TeacherDemoShell({
  perspectiveLabel = "Teacher",
  perspectiveId = "teacher",
}: TeacherDemoShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState("dark");

  // Invisible engagement score system
  const [engagement, setEngagement] = useState<{
    completedTour: boolean;
    exploredSections: string[];
    notesCreated: number;
    capturesSaved: number;
    settingsInteracted: boolean;
    announcementsViewed: number;
    notificationsViewed: number;
    dismissedAtScore: number | null;
    hasAccepted: boolean;
  }>({
    completedTour: false,
    exploredSections: ["home"],
    notesCreated: 0,
    capturesSaved: 0,
    settingsInteracted: false,
    announcementsViewed: 0,
    notificationsViewed: 0,
    dismissedAtScore: null,
    hasAccepted: false,
  });

  const [showEcosystemInvitation, setShowEcosystemInvitation] = useState(false);
  const [showPlansView, setShowPlansView] = useState(false);
  const [isTransitioningToAdopt, setIsTransitioningToAdopt] = useState(false);

  const handleTransitionToAdopt = useCallback(() => {
    setIsTransitioningToAdopt(true);
    setTimeout(() => {
      router.push("/adopt");
    }, 2200);
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tourHasRun = localStorage.getItem("axis-tour-has-run") === "true";
      const saved = localStorage.getItem("axis-teacher-engagement");
      if (saved && saved !== "undefined" && saved !== "null") {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setEngagement((prev) => ({
              completedTour: parsed.completedTour !== undefined ? parsed.completedTour : tourHasRun,
              exploredSections: Array.isArray(parsed.exploredSections) ? parsed.exploredSections : prev.exploredSections,
              notesCreated: typeof parsed.notesCreated === "number" ? parsed.notesCreated : prev.notesCreated,
              capturesSaved: typeof parsed.capturesSaved === "number" ? parsed.capturesSaved : prev.capturesSaved,
              settingsInteracted: parsed.settingsInteracted !== undefined ? parsed.settingsInteracted : prev.settingsInteracted,
              announcementsViewed: typeof parsed.announcementsViewed === "number" ? parsed.announcementsViewed : prev.announcementsViewed,
              notificationsViewed: typeof parsed.notificationsViewed === "number" ? parsed.notificationsViewed : prev.notificationsViewed,
              dismissedAtScore: typeof parsed.dismissedAtScore === "number" ? parsed.dismissedAtScore : prev.dismissedAtScore,
              hasAccepted: parsed.hasAccepted !== undefined ? parsed.hasAccepted : prev.hasAccepted,
            }));
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved engagement state", e);
        }
      }
      if (tourHasRun) {
        setEngagement((prev) => ({
          ...prev,
          completedTour: true,
        }));
      }
    }
  }, []);

  const updateEngagement = useCallback((updater: (prev: typeof engagement) => typeof engagement) => {
    setEngagement((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        localStorage.setItem("axis-teacher-engagement", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const engagementScore = useMemo(() => {
    let score = 0;
    if (engagement.completedTour) score += 50;
    if (engagement.exploredSections && Array.isArray(engagement.exploredSections)) {
      score += engagement.exploredSections.length * 10;
    }
    score += Math.min(engagement.notesCreated || 0, 3) * 10;
    score += Math.min(engagement.capturesSaved || 0, 3) * 10;
    if (engagement.settingsInteracted) score += 15;
    score += Math.min(engagement.announcementsViewed || 0, 3) * 5;
    score += Math.min(engagement.notificationsViewed || 0, 3) * 5;
    return score;
  }, [engagement]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(localStorage.getItem("axis-theme") || "dark");
      
      const handleThemeChange = () => {
        setTheme(localStorage.getItem("axis-theme") || "dark");
      };
      window.addEventListener("axis-theme-change", handleThemeChange);
      return () => window.removeEventListener("axis-theme-change", handleThemeChange);
    }
  }, []);

  const { steps, activeStepIndex, isTutorialActive, startTutorial, nextStep, prevStep, endTutorial } =
    useDemoTutorial();

  // Guided Onboarding states
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasRunTour, setHasRunTour] = useState(true);
  const [isWelcomeScreenOpen, setIsWelcomeScreenOpen] = useState(false);
  const [showCoachMark, setShowCoachMark] = useState(false);



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

  const handleStartTourFromWelcome = () => {
    setIsWelcomeScreenOpen(false);
    setShowCoachMark(false);
    startTutorial();
  };

  const handleExploreOnMyOwn = () => {
    setIsWelcomeScreenOpen(false);
    endTutorial();
    if (typeof window !== "undefined") {
      const coachMarkDismissed = localStorage.getItem("axis-tour-coach-mark-dismissed");
      if (coachMarkDismissed !== "true") {
        setShowCoachMark(true);
      }
    }
  };

  const handleDismissCoachMark = () => {
    setShowCoachMark(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("axis-tour-coach-mark-dismissed", "true");
    }
  };

  const handleStartTourManual = () => {
    setShowCoachMark(false);
    startTutorial();
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
    setHasRunTour(true);
    setIsWelcomeScreenOpen(false);
    endTutorial();
    setShowCoachMark(false);
    localStorage.setItem("axis-tour-coach-mark-dismissed", "true");
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

  // Switch tabs automatically based on current walkthrough step
  useEffect(() => {
    if (!isTutorialActive) return;
    switch (activeStepIndex) {
      case 0: // Welcome to Axis
      case 1: // Today's Dashboard
      case 2: // Presence & Availability
        setActiveTab("home");
        setIsQuickContextOpen(false);
        break;
      case 3: // Timetable
        setActiveTab("timetable");
        setIsQuickContextOpen(false);
        break;
      case 4: // Attendance
        setActiveTab("attendance");
        setIsQuickContextOpen(false);
        break;
      case 5: // Messages
        setActiveTab("messages");
        setIsQuickContextOpen(false);
        break;
      case 6: // Meetings
        setActiveTab("meetings");
        setIsQuickContextOpen(false);
        break;
      case 7: // Class Space
        setActiveTab("class-space");
        setIsQuickContextOpen(false);
        break;
      case 8: // Calendar
        setActiveTab("calendar");
        setIsQuickContextOpen(false);
        break;
      case 9: // Essential Space
      case 10: // Capture System
        setActiveTab("essential-space");
        setIsQuickContextOpen(false);
        break;
      case 11: // Workspace Intro
      case 12: // Workspace Demo
        setActiveTab("workspace");
        setIsQuickContextOpen(false);
        break;
      case 13: // Connected Resources
        setActiveTab("connected-resources");
        setIsQuickContextOpen(false);
        break;
      case 14: // Top Right Awareness
      case 15: // Announcements
      case 16: // Notifications
        setActiveTab("home");
        setIsQuickContextOpen(false);
        break;
      case 17: // Context
        setActiveTab("home");
        setIsQuickContextOpen(true);
        break;
      case 18: // Settings & Personalization
        setActiveTab("settings");
        setIsQuickContextOpen(false);
        break;
      default:
        break;
    }
  }, [activeStepIndex, isTutorialActive]);

  // Quick Context Floating Side-Sheet Open State
  const [isQuickContextOpen, setIsQuickContextOpen] = useState(false);
  const [contextPreviewIdx, setContextPreviewIdx] = useState(0);

  // Meeting Fullscreen transitions
  const [meetingScreenState, setMeetingScreenState] = useState<"inactive" | "loading" | "calibration" | "active">("inactive");
  const [activeMeetingInfo, setActiveMeetingInfo] = useState<{
    id: string;
    title: string;
    participants: string[];
    classGroup?: string;
    time: string;
    purpose: string;
    status: "scheduled" | "invited";
    timetableBlock?: string;
    isShareable?: boolean;
    shareLink?: string;
  } | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const loadingStages = [
    "Preparing Meeting Environment",
    "Loading Meeting Context",
    "Syncing Hardware Devices",
    "Connecting Secure Stream"
  ];

  useEffect(() => {
    if (meetingScreenState === "loading") {
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev >= loadingStages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setMeetingScreenState("calibration");
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 750);
      return () => clearInterval(interval);
    }
  }, [meetingScreenState, loadingStages.length]);



  // Lifted Roster and Verification States
  const [rosters, setRosters] = useState<ClassRoster>(INITIAL_ROSTERS);
  const [selectedClass, setSelectedClass] = useState("Grade 11 Physics (B)");
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string | null>(null);

  // Lifted Reminder Lifecycle States
  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: "rem-1", text: "Review physics IA draft guidelines", status: "active", targetType: "class", targetName: "Grade 11 Physics (B)" },
    { id: "rem-2", text: "Bring light refraction prism kit", status: "active", targetType: "room", targetName: "Lab 3" },
    { id: "rem-3", text: "Review photo-electric quantum worksheets", status: "active", targetType: "class", targetName: "Grade 12 Advanced Physics" },
  ]);

  // Lifted memory state that syncs Capture Layer output to Context display
  const [essentialCaptures, setEssentialCaptures] = useState<CapturedItem[]>([
    {
      id: "cap-1",
      type: "space",
      title: "Optics refraction prisms setup",
      description: "Prisms and templates for grade 11 B lab.",
      meta: "Lab 3 · Science Dept",
      active: true,
      tags: ["Physics IA"],
      dimensions: "400x300",
      date: "May 28, 2026",
      fromEssentialSpace: true,
    }
  ]);

  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([
    {
      id: "ws-1",
      title: "Grade 11 Optics Lab Worksheet",
      type: "document",
      lastModified: "2 hours ago",
      owner: "Aarav Chen",
      department: "Science",
      status: "Draft",
      pinned: true,
      shared: false,
      draft: true,
      content: "# Grade 11 Optics Lab Worksheet\n\nTask: Measure the index of refraction of a glass block.\n\nInstructions:\n1. Direct the laser pointer at the block.\n2. Mark the entry and exit points.\n3. Measure the angles with a protractor.",
      classMatch: "Grade 11 Physics (B)",
      tags: ["Optics", "Lab"],
    },
    {
      id: "ws-2",
      title: "Grade 11 Optics Presentation",
      type: "presentation",
      lastModified: "Yesterday",
      owner: "Aarav Chen",
      department: "Science",
      status: "Ready",
      pinned: true,
      shared: true,
      draft: false,
      content: "Slide 1: Introduction to Optics & Refraction\nSlide 2: Snell's Law & Refractive Indices\nSlide 3: Prism Laser Alignment Setup\nSlide 4: Lab Safety & Angle Verification Checklist",
      classMatch: "Grade 11 Physics (B)",
      tags: ["Optics", "Syllabus"],
    },
    {
      id: "ws-3",
      title: "Term 1 Physics Gradebook",
      type: "spreadsheet",
      lastModified: "3 days ago",
      owner: "Aarav Chen",
      department: "Science",
      status: "Updated",
      pinned: false,
      shared: false,
      draft: false,
      classMatch: "Grade 11 Physics (B)",
      tags: ["Grades", "Record"],
    },
    {
      id: "ws-4",
      title: "Lab Refraction Guide PDF",
      type: "pdf",
      lastModified: "4 days ago",
      owner: "Science Department",
      department: "Science",
      status: "Published",
      pinned: false,
      shared: true,
      draft: false,
      pdfUrl: "refraction_guide.pdf",
      pdfPages: 4,
      classMatch: "Grade 11 Physics (B)",
      tags: ["Syllabus", "Guide"],
    },
    {
      id: "ws-5",
      title: "IA Advisory Prep Checklist",
      type: "note",
      lastModified: "Just now",
      owner: "Aarav Chen",
      department: "Science",
      status: "Draft",
      pinned: false,
      shared: false,
      draft: true,
      content: "- Check Chloe's revised IA draft.\n- Review snell's law laser coordinate charts.\n- Prepare prism calibration benchmarks.",
      tags: ["IA", "Advisory"],
    },
    {
      id: "ws-6",
      title: "Optics Conceptual Map",
      type: "mindmap",
      lastModified: "5 days ago",
      owner: "Aarav Chen",
      department: "Science",
      status: "Draft",
      pinned: false,
      shared: false,
      draft: true,
      tags: ["Planning", "Optics"],
    },
    {
      id: "ws-7",
      title: "Lesson Plans - Optics & Waves",
      type: "folder",
      lastModified: "1 week ago",
      owner: "Aarav Chen",
      department: "Science",
      status: "Archived",
      pinned: false,
      shared: false,
      draft: false,
      tags: ["Curriculum", "Planning"],
    }
  ]);

  const [openWorkspaceFileId, setOpenWorkspaceFileId] = useState<string | null>(null);
  const [dismissedWsContextIds, setDismissedWsContextIds] = useState<string[]>([]);

  // Trigger conditions for ecosystem invitation popup
  const isEligibleForInvitation = useMemo(() => {
    if (isTutorialActive || meetingScreenState !== "inactive" || isWelcomeScreenOpen) {
      return false;
    }
    if (engagement.hasAccepted) {
      return false;
    }
    const exploredCount = engagement.exploredSections && Array.isArray(engagement.exploredSections) ? engagement.exploredSections.length : 0;
    const tourCondition = engagement.completedTour && exploredCount >= 4;
    const scoreCondition = engagementScore >= 60;
    if (!tourCondition && !scoreCondition) {
      return false;
    }
    if (engagement.dismissedAtScore !== null) {
      if (engagementScore < engagement.dismissedAtScore + 50) {
        return false;
      }
    }
    return true;
  }, [isTutorialActive, meetingScreenState, isWelcomeScreenOpen, engagement, engagementScore]);

  useEffect(() => {
    if (isEligibleForInvitation) {
      const timer = setTimeout(() => {
        setShowEcosystemInvitation(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowEcosystemInvitation(false);
    }
  }, [isEligibleForInvitation]);

  // Track unique sections explored
  useEffect(() => {
    if (activeTab) {
      updateEngagement((prev) => {
        if (!prev.exploredSections.includes(activeTab)) {
          return {
            ...prev,
            exploredSections: [...prev.exploredSections, activeTab],
          };
        }
        return prev;
      });
    }
  }, [activeTab, updateEngagement]);

  // Track quick context opening
  useEffect(() => {
    if (isQuickContextOpen) {
      updateEngagement((prev) => {
        if (!prev.exploredSections.includes("context-quick")) {
          return {
            ...prev,
            exploredSections: [...prev.exploredSections, "context-quick"],
          };
        }
        return prev;
      });
    }
  }, [isQuickContextOpen, updateEngagement]);

  // Track workspace notes created (initial count in demo is 7)
  useEffect(() => {
    if (workspaceItems.length > 7) {
      const notesCount = workspaceItems.length - 7;
      updateEngagement((prev) => {
        if (prev.notesCreated < notesCount) {
          return {
            ...prev,
            notesCreated: notesCount,
          };
        }
        return prev;
      });
    }
  }, [workspaceItems.length, updateEngagement]);

  // Track settings interaction via theme customization
  useEffect(() => {
    if (theme && theme !== "dark") {
      updateEngagement((prev) => {
        if (!prev.settingsInteracted) {
          return {
            ...prev,
            settingsInteracted: true,
          };
        }
        return prev;
      });
    }
  }, [theme, updateEngagement]);
  // Console logging for verification of engagement progress
  useEffect(() => {
    console.log("[Axis Engagement Telemetry]", {
      score: engagementScore,
      completedTour: engagement.completedTour,
      exploredSectionsCount: engagement.exploredSections && Array.isArray(engagement.exploredSections) ? engagement.exploredSections.length : 0,
      exploredSectionsList: engagement.exploredSections,
      notesCreated: engagement.notesCreated,
      capturesSaved: engagement.capturesSaved,
      settingsInteracted: engagement.settingsInteracted,
      announcementsViewed: engagement.announcementsViewed,
      notificationsViewed: engagement.notificationsViewed,
      isEligible: isEligibleForInvitation,
      isTutorialActive,
      meetingScreenState,
      isWelcomeScreenOpen,
      dismissedAtScore: engagement.dismissedAtScore,
      hasAccepted: engagement.hasAccepted,
    });
  }, [
    engagementScore,
    engagement,
    isEligibleForInvitation,
    isTutorialActive,
    meetingScreenState,
    isWelcomeScreenOpen,
  ]);
  const [contextItems, setContextItems] = useState<CapturedItem[]>([
    {
      id: "cap-1",
      type: "space",
      title: "Optics refraction prisms setup",
      description: "Prisms and templates for grade 11 B lab.",
      meta: "Lab 3 · Science Dept",
      active: true,
      tags: ["Physics IA"],
      dimensions: "400x300",
      date: "May 28, 2026",
      fromEssentialSpace: true,
    },
    {
      id: "space-1",
      type: "space",
      title: "Essential Space Revealed",
      description: "Room 4B has been freed for Period 4 due to a Math lecture cancellation. Available for student study groups.",
      actionLabel: "Release to Students",
      meta: "Period 4 · Room 4B",
      active: true,
    },
    {
      id: "support-1",
      type: "support",
      title: "Support Follow-up Pending",
      description: "Chloe Vance has submitted their revised Physics IA draft. Reviews are recommended before tomorrow's seminar.",
      actionLabel: "Open Draft",
      meta: "IA Advisory · Grade 11 B",
      active: true,
    },
    {
      id: "counselor-1",
      type: "counselor",
      title: "Counselor Nearby",
      description: "Sarah Chen (Guidance) is available in Room 102. Can assist with student IA workload stress discussions.",
      meta: "Available Now · Room 102",
      active: true,
    },
    {
      id: "coordination-1",
      type: "coordination",
      title: "Coverage Needed",
      description: "Grade 10 Science teacher marked absent. Coordination is looking for Period 5 coverages.",
      actionLabel: "Volunteer for Cover",
      meta: "Period 5 · Grade 10 Science",
      active: true,
    },
    {
      id: "announcement-ctx-1",
      type: "support",
      title: "IA Deadline Extended",
      description: "Physics IA Deadline extended to 13 June by announcement 3 days ago. Review revised calendar sync.",
      actionLabel: "Verify Calendar",
      meta: "Announcement · 3d ago",
      active: true,
    },
    {
      id: "announcement-ctx-2",
      type: "coordination",
      title: "Related Assignment Pending",
      description: "Science lab room assignment change announcement. Ensure pre-lab worksheets are updated.",
      actionLabel: "Open Worksheets",
      meta: "Class Space · Next Week",
      active: true,
    },
  ]);

  const derivedContextItems = useMemo(() => {
    const wsSuggestions: CapturedItem[] = workspaceItems
      .filter(item => item.classMatch === selectedClass && (item.type === "presentation" || item.type === "pdf" || item.type === "document"))
      .map(item => ({
        id: `ws-ctx-${item.id}`,
        type: "support" as const,
        title: `Relevant resource: ${item.title}`,
        description: `This ${item.type} matches the topic for ${selectedClass}. Open it directly inside Axis Workspace.`,
        actionLabel: item.type === "presentation" ? "Open Presentation" : item.type === "pdf" ? "Open PDF" : "Open Document",
        meta: `Workspace · ${item.status}`,
        active: true,
      }))
      .filter(item => !dismissedWsContextIds.includes(item.id));

    return [...wsSuggestions, ...contextItems];
  }, [workspaceItems, selectedClass, contextItems, dismissedWsContextIds]);

  const cardStyles = useMemo(() => {
    return {
      dark: {
        bg: "bg-[#0E0E10]/95 border-white/[0.08]",
        textPrimary: "text-white",
        textSecondary: "text-white/60",
        buttonPrimary: "bg-[#22d3ee] text-black hover:bg-[#22d3ee]/90 font-bold",
        buttonSecondary: "border-white/[0.08] hover:bg-white/5 text-white/70",
        buttonTertiary: "text-white/40 hover:text-white/80",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        plansBg: "bg-white/[0.02] border-white/[0.04]",
        accentGlow: "rgba(34,211,238,0.15)",
      },
      light: {
        bg: "bg-white border-black/[0.08]",
        textPrimary: "text-black",
        textSecondary: "text-black/60",
        buttonPrimary: "bg-cyan-600 text-white hover:bg-cyan-500 font-bold",
        buttonSecondary: "border-black/[0.08] hover:bg-black/5 text-black/70",
        buttonTertiary: "text-black/40 hover:text-black/80",
        badge: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
        plansBg: "bg-black/[0.02] border-black/[0.04]",
        accentGlow: "rgba(14,165,233,0.1)",
      },
      "high-contrast": {
        bg: "bg-black border-2 border-white",
        textPrimary: "text-white",
        textSecondary: "text-white/80",
        buttonPrimary: "bg-white text-black hover:bg-zinc-200 border border-white font-bold",
        buttonSecondary: "border border-white bg-black hover:bg-zinc-950 text-white",
        buttonTertiary: "text-white underline hover:text-zinc-200",
        badge: "border-white border text-white",
        plansBg: "border border-white bg-black",
        accentGlow: "rgba(255,255,255,0)",
      },
      axis: {
        bg: "bg-[#050607]/95 border-cyan-400/20",
        textPrimary: "text-cyan-50",
        textSecondary: "text-cyan-200/60",
        buttonPrimary: "bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]",
        buttonSecondary: "border-cyan-400/20 hover:bg-cyan-400/5 text-cyan-300",
        buttonTertiary: "text-violet-400 hover:text-violet-300",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        plansBg: "bg-cyan-950/10 border-cyan-500/10",
        accentGlow: "rgba(6,182,212,0.25)",
      },
    }[theme as "dark" | "light" | "high-contrast" | "axis"] || {
      bg: "bg-[#0E0E10]/95 border-white/[0.08]",
      textPrimary: "text-white",
      textSecondary: "text-white/60",
      buttonPrimary: "bg-[#22d3ee] text-black hover:bg-[#22d3ee]/90 font-bold",
      buttonSecondary: "border-white/[0.08] hover:bg-white/5 text-white/70",
      buttonTertiary: "text-white/40 hover:text-white/80",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      plansBg: "bg-white/[0.02] border-white/[0.04]",
      accentGlow: "rgba(34,211,238,0.15)",
    };
  }, [theme]);

  useEffect(() => {
    const handleAddContextItem = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setContextItems((prev) => [customEvent.detail, ...prev]);
        setIsQuickContextOpen(true);
      }
    };
    window.addEventListener("axis-add-context-item", handleAddContextItem);
    return () => {
      window.removeEventListener("axis-add-context-item", handleAddContextItem);
    };
  }, []);

  const activeContextItemsCount = derivedContextItems ? derivedContextItems.filter(i => i.active).length : 0;
  const contextPreviews = [
    `${activeContextItemsCount} Opportunities Available`,
    "Lab 3 Available After Period 4",
    "Upcoming IA Deadline Review",
    "Room 4B Free Period 4"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setContextPreviewIdx((prev) => (prev + 1) % contextPreviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeContextItemsCount, contextPreviews.length]);

  const handleDismissContextItem = (id: string) => {
    if (id.startsWith("ws-ctx-")) {
      const fileId = id.replace("ws-ctx-", "");
      setDismissedWsContextIds(prev => [...prev, id]);
      setActiveTab("workspace");
      setOpenWorkspaceFileId(fileId);
      setIsQuickContextOpen(false);
      return;
    }
    setContextItems(prev => prev.map(item => item.id === id ? { ...item, active: false } : item));
  };

  const handleSaveCapture = (item: CapturedItem) => {
    const enrichedItem = {
      ...item,
      fromEssentialSpace: true,
    };
    setEssentialCaptures(prev => [enrichedItem, ...prev]);
    setContextItems(prev => [enrichedItem, ...prev]);
    updateEngagement((prev) => ({
      ...prev,
      capturesSaved: prev.capturesSaved + 1,
    }));
  };

  const handleDeleteCapture = (id: string) => {
    setEssentialCaptures(prev => prev.filter(c => c.id !== id));
    setContextItems(prev => prev.filter(c => c.id !== id));
  };

  const handleSimulateWorkspaceDocCreation = () => {
    const newItem: WorkspaceItem = {
      id: `ws-tour-${Date.now()}`,
      title: "Guided Tour Lesson Plan",
      type: "document",
      lastModified: "Just now",
      owner: "Aarav Chen",
      department: "Science",
      status: "Draft",
      pinned: true,
      shared: false,
      draft: true,
      content: "# Onboarding Lesson Plan\n\nThis file was created during the Axis Guided Tour.",
      tags: ["Tour", "Lesson Plan"],
    };
    setWorkspaceItems(prev => [newItem, ...prev]);
    setOpenWorkspaceFileId(newItem.id);
  };

  const handleSimulateWorkspaceTogglePin = () => {
    if (workspaceItems.length > 0) {
      setWorkspaceItems(prev => prev.map((item, idx) => idx === 0 ? { ...item, pinned: !item.pinned } : item));
    }
  };

  // Reminder modifications callbacks
  const handleAddReminder = (text: string, targetType: ReminderItem["targetType"], targetName: string) => {
    const newItem: ReminderItem = {
      id: `rem-${Date.now()}`,
      text,
      status: "active",
      targetType,
      targetName,
    };
    setReminders(prev => [...prev, newItem]);
  };

  const handleSnoozeReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: "snoozed" as const } : r));
  };

  const handleArchiveReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: "archived" as const } : r));
  };

  // Attendance modification callbacks
  const handleStatusChange = (studentId: string, newStatus: Student["status"]) => {
    const activeClassData = rosters[selectedClass];
    const updatedRoster = activeClassData.roster.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          status: newStatus,
          proximityVerified: newStatus === "present" || newStatus === "late" ? s.proximityVerified : false,
        };
      }
      return s;
    });

    setRosters({
      ...rosters,
      [selectedClass]: {
        ...activeClassData,
        roster: updatedRoster,
      },
    });
  };

  const handleToggleAutoAttendance = () => {
    const activeClassData = rosters[selectedClass];
    setRosters({
      ...rosters,
      [selectedClass]: {
        ...activeClassData,
        automatedActive: !activeClassData.automatedActive,
      },
    });
  };

  const handleVerifyAttendance = () => {
    setAttendanceVerified(true);
    const now = new Date();
    setLastVerifiedTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
  };

  const activeStep = isTutorialActive ? steps[activeStepIndex] : null;

  // Calculations for Grade 11 Physics (Current Class card) overrides
  const currentClassRoster = rosters["Grade 11 Physics (B)"].roster;
  const currentClassOverrides = currentClassRoster.filter(
    (s) => (s.status === "present" || s.status === "late") && !s.proximityVerified
  ).length;
  const currentClassVerified = currentClassRoster.filter((s) => s.proximityVerified).length;
  const currentClassTotal = currentClassRoster.length;

  const shellBgClass = {
    dark: "bg-[#0A0A0B] text-white",
    light: "bg-[#F3F4F6] text-black",
    "high-contrast": "bg-[#09090b] text-[#f4f4f5] border-2 border-zinc-800",
    axis: "bg-[#050607] text-white",
  }[theme] || "bg-[#0A0A0B] text-white";

  return (
    <div className={`relative flex min-h-screen w-full ${shellBgClass} overflow-hidden antialiased transition-colors duration-500`}>
      <AnimatePresence>
        {isWelcomeScreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050607]/95 backdrop-blur-xl text-white p-6 antialiased"
          >
            {/* Cinematic ambient background glow */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background: "radial-gradient(circle 900px at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 85%)",
              }}
            />
            
            <div className="relative z-10 max-w-xl w-full text-center space-y-6 px-4">
              <div className="space-y-3">
                <motion.div 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#0A0A0B] font-extrabold text-2xl tracking-tighter shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  A
                </motion.div>
                <motion.h2 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="text-2xl font-bold tracking-tight text-white md:text-3xl"
                >
                  Welcome to Axis.
                </motion.h2>
                <motion.p 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="text-xs md:text-sm text-white/70 leading-relaxed max-w-md mx-auto"
                >
                  This demo contains a complete guided walkthrough of the platform.<br />
                  For the best experience, start with the Guided Tour.
                </motion.p>
              </div>

              {/* Explaining Features Grid */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl max-w-md mx-auto space-y-3"
              >
                <div className="text-left">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">The tour explains:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left text-xs text-white/60 font-medium font-sans">
                  {[
                    "Dashboard",
                    "Messages",
                    "Meetings",
                    "Class Space",
                    "Calendar",
                    "My Tasks & Notes",
                    "Workspace",
                    "Resources",
                    "Notifications",
                    "Announcements",
                    "Attention"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-cyan-500/80 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tour statistics card */}
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="py-3 px-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] max-w-sm mx-auto flex flex-col items-center justify-center text-center space-y-0.5"
              >
                <span className="text-[8px] font-bold text-white/35 uppercase tracking-widest">Estimated Time</span>
                <span className="text-sm font-extrabold text-cyan-400">5–7 Minutes</span>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-sm mx-auto pt-2"
              >
                <button
                  type="button"
                  onClick={handleStartTourFromWelcome}
                  className="w-full px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:scale-102 active:scale-98 transition-all shrink-0 uppercase tracking-wider"
                >
                  Start Guided Tour
                </button>
                <button
                  type="button"
                  onClick={handleExploreOnMyOwn}
                  className="w-full px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-transparent text-white/60 hover:text-white font-semibold text-xs hover:bg-white/5 hover:scale-102 active:scale-98 transition-all shrink-0 uppercase tracking-wider"
                >
                  Explore On My Own
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isTutorialActive && (
        <div className="tour-dim-overlay" onClick={(e) => e.stopPropagation()} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .tour-dim-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(0.5px);
          z-index: 35;
          pointer-events: auto;
          transition: all 0.4s ease-in-out;
        }
        .tour-highlight {
          position: relative;
          z-index: 40 !important;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.6), 0 0 45px rgba(6, 182, 212, 0.35) !important;
          border-color: rgba(6, 182, 212, 0.8) !important;
          pointer-events: auto !important;
          transition: all 0.4s ease-in-out;
        }
        .theme-light .tour-highlight {
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.2) !important;
        }
        .tour-highlight * {
          pointer-events: auto !important;
        }
        @keyframes guided-tour-pulse {
          0%, 100% {
            border-color: rgba(34, 211, 238, 0.2);
            box-shadow: 0 0 0 0px rgba(34, 211, 238, 0.1);
          }
          50% {
            border-color: rgba(34, 211, 238, 0.75);
            box-shadow: 0 0 10px 2px rgba(34, 211, 238, 0.3);
          }
        }
        .guided-tour-pulse-btn {
          animation: guided-tour-pulse 2.2s infinite ease-in-out;
        }
      ` }} />
      {theme === "light" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #0f1115 !important; }
          .text-white\\/95 { color: #0f1115 !important; }
          .text-white\\/90 { color: #1f2937 !important; }
          .text-white\\/85 { color: #1f2937 !important; }
          .text-white\\/80 { color: #374151 !important; }
          .text-white\\/75 { color: #374151 !important; }
          .text-white\\/70 { color: #4b5563 !important; }
          .text-white\\/65 { color: #4b5563 !important; }
          .text-white\\/60 { color: #4b5563 !important; }
          .text-white\\/55 { color: #4b5563 !important; }
          .text-white\\/50 { color: #6b7280 !important; }
          .text-white\\/45 { color: #6b7280 !important; }
          .text-white\\/40 { color: #71717a !important; }
          .text-white\\/35 { color: #71717a !important; }
          .text-white\\/30 { color: #8e8e93 !important; }
          .text-white\\/25 { color: #a1a1aa !important; }
          .text-white\\/20 { color: #b1b1b6 !important; }
          .text-white\\/15 { color: #c1c1c6 !important; }
          .text-white\\/10 { color: #d1d1d6 !important; }
          .text-white\\/5 { color: #e5e5ea !important; }
          .text-slate-100 { color: #0f1115 !important; }
          .text-zinc-100 { color: #0f1115 !important; }
          .text-gray-100 { color: #0f1115 !important; }
          .text-neutral-100 { color: #0f1115 !important; }
          .text-slate-200 { color: #1f2937 !important; }
          .text-zinc-200 { color: #1f2937 !important; }
          .text-gray-200 { color: #1f2937 !important; }
          .text-slate-300 { color: #374151 !important; }
          .text-zinc-300 { color: #374151 !important; }
          .text-gray-300 { color: #374151 !important; }
          .border-white\\/\\[0\\.04\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.05\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.06\\] { border-color: rgba(0, 0, 0, 0.08) !important; }
          .border-white\\/\\[0\\.08\\] { border-color: rgba(0, 0, 0, 0.12) !important; }
          .border-white\\/10 { border-color: rgba(0, 0, 0, 0.12) !important; }
          .border-white\\/15 { border-color: rgba(0, 0, 0, 0.16) !important; }
          .border-white\\/20 { border-color: rgba(0, 0, 0, 0.18) !important; }
          .bg-white\\/\\[0\\.01\\] { background-color: rgba(0, 0, 0, 0.015) !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: rgba(0, 0, 0, 0.02) !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: rgba(0, 0, 0, 0.03) !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-white\\/10 { background-color: rgba(0, 0, 0, 0.06) !important; }
          .bg-white\\/15 { background-color: rgba(0, 0, 0, 0.08) !important; }
          .bg-black\\/40 { background-color: rgba(0, 0, 0, 0.05) !important; }
          .bg-black\\/35 { background-color: rgba(0, 0, 0, 0.04) !important; }
          .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.03) !important; }
          .bg-black\\/10 { background-color: rgba(0, 0, 0, 0.02) !important; }
          .bg-black\\/\\[0\\.15\\] { background-color: rgba(0, 0, 0, 0.05) !important; }
          .bg-\\[\\#0C0C0E\\]\\/30 { background-color: #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #f9fafb !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #f3f4f6 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #f9fafb !important; }
          .bg-\\[\\#0A0A0C\\] { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #ffffff !important; }
          .bg-\\[\\#0E0E10\\]\\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
          .bg-\\[\\#0A0A0B\\]\\/85 { background-color: rgba(255, 255, 255, 0.85) !important; }
          .bg-\\[\\#0C0C0E\\] { background-color: #ffffff !important; }
          .bg-\\[\\#08080A\\] { background-color: #ffffff !important; }
          .border-white\\/5 { border-color: rgba(0, 0, 0, 0.06) !important; }
          .border-white\\/10 { border-color: rgba(0, 0, 0, 0.08) !important; }
          .from-white\\/\\[0\\.04\\] { --tw-gradient-from: rgba(0, 0, 0, 0.02) !important; --tw-gradient-to: rgba(0, 0, 0, 0) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
          .to-white\\/\\[0\\.01\\] { --tw-gradient-to: rgba(0, 0, 0, 0.005) !important; }
          .hover\\:text-white:hover { color: #0f1115 !important; }
          .hover\\:text-white\\/80:hover { color: #1f2937 !important; }
          .hover\\:bg-white\\/\\[0\\.04\\]:hover { background-color: rgba(0, 0, 0, 0.05) !important; }
          .hover\\:bg-white\\/\\[0\\.02\\]:hover { background-color: rgba(0, 0, 0, 0.03) !important; }
          .hover\\:border-white\\/20:hover { border-color: rgba(0, 0, 0, 0.15) !important; }
          .hover\\:border-white\\/\\[0\\.08\\]:hover { border-color: rgba(0, 0, 0, 0.12) !important; }
          ::placeholder { color: #6b7280 !important; }
          .placeholder-white\\/20::placeholder { color: #6b7280 !important; opacity: 1 !important; }
          select option { background-color: #ffffff !important; color: #0f1115 !important; }
          
          /* Custom layout overrides for missing backgrounds in Light Theme */
          .bg-zinc-950 { background-color: #ffffff !important; }
          .bg-zinc-900 { background-color: #ffffff !important; }
          .bg-zinc-950\\/80 { background-color: rgba(255, 255, 255, 0.8) !important; }
          .bg-zinc-900\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
          .bg-cyan-950\\/10 { background-color: rgba(6, 182, 212, 0.05) !important; }
          .bg-\\[\\#0E0E10\\]\\/40 { background-color: rgba(255, 255, 255, 0.4) !important; }
          .bg-\\[\\#0A0A0C\\]\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
          .bg-\\[\\#0C0D10\\]\\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
          
          /* Custom hover states overrides under Light Theme */
          .hover\\:bg-white\\/5:hover { background-color: rgba(0, 0, 0, 0.04) !important; }
          .hover\\:bg-white\\/10:hover { background-color: rgba(0, 0, 0, 0.08) !important; }
          .hover\\:bg-white\\/20:hover { background-color: rgba(0, 0, 0, 0.15) !important; }
          .hover\\:bg-white\\/\\[0\\.06\\]:hover { background-color: rgba(0, 0, 0, 0.06) !important; }
          .hover\\:bg-white\\/\\[0\\.08\\]:hover { background-color: rgba(0, 0, 0, 0.08) !important; }
          
          /* Soft light shadows mapping for premium card visual consistency */
          [class*="shadow-\\[0_12px_64px"] { box-shadow: 0 12px 48px -12px rgba(0,0,0,0.08) !important; }
          [class*="shadow-\\[0_24px_80px"] { box-shadow: 0 20px 40px -15px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_8px_32px"] { box-shadow: 0 8px 24px -8px rgba(0,0,0,0.05) !important; }
          [class*="shadow-\\[0_12px_48px"] { box-shadow: 0 12px 36px -10px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_24px_64px"] { box-shadow: 0 16px 48px -12px rgba(0,0,0,0.07) !important; }
          [class*="shadow-\\[0_16px_48px"] { box-shadow: 0 16px 36px -12px rgba(0,0,0,0.06) !important; }
          [class*="shadow-\\[0_12px_36px"] { box-shadow: 0 12px 28px -10px rgba(0,0,0,0.05) !important; }
        ` }} />
      )}
      {theme === "high-contrast" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #f4f4f5 !important; }
          .text-white\\/90 { color: #e4e4e7 !important; }
          .text-white\\/80 { color: #d4d4d8 !important; }
          .text-white\\/70 { color: #a1a1aa !important; }
          .text-white\\/60 { color: #a1a1aa !important; }
          .text-white\\/50 { color: #71717a !important; }
          .text-white\\/45 { color: #71717a !important; }
          .text-white\\/40 { color: #52525b !important; }
          .text-white\\/35 { color: #52525b !important; }
          .text-white\\/30 { color: #3f3f46 !important; }
          .text-white\\/20 { color: #27272a !important; }
          .text-white\\/10 { color: #18181b !important; }
          
          /* Forced high contrast borders (fully white/light) */
          .border-white\\/\\[0\\.04\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.05\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.06\\] { border-color: #e4e4e7 !important; border-width: 1px !important; }
          .border-white\\/\\[0\\.08\\] { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/5 { border-color: #a1a1aa !important; border-width: 1px !important; }
          .border-white\\/10 { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/15 { border-color: #ffffff !important; border-width: 1.5px !important; }
          .border-white\\/20 { border-color: #ffffff !important; border-width: 1.5px !important; }
          
          /* High contrast dark canvas elements */
          .bg-white\\/\\[0\\.01\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: #000000 !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: #000000 !important; }
          .bg-white\\/10 { background-color: #000000 !important; border: 1.5px solid #ffffff !important; }
          .bg-white\\/15 { background-color: #000000 !important; border: 1.5px solid #ffffff !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #000000 !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #000000 !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #000000 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #000000 !important; }
          .bg-\\[\\#0E0E10\\]\\/95 { background-color: #000000 !important; }
          .bg-\\[\\#0A0A0B\\]\\/85 { background-color: #000000 !important; }
          
          select option { background-color: #000000 !important; color: #ffffff !important; }
        ` }} />
      )}
      {theme === "axis" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .text-white { color: #f3f4f6 !important; }
          .border-white\\/\\[0\\.04\\] { border-color: rgba(6, 182, 212, 0.15) !important; }
          .border-white\\/\\[0\\.05\\] { border-color: rgba(6, 182, 212, 0.2) !important; }
          .border-white\\/\\[0\\.06\\] { border-color: rgba(6, 182, 212, 0.25) !important; }
          .border-white\\/\\[0\\.08\\] { border-color: rgba(6, 182, 212, 0.3) !important; }
          .border-white\\/10 { border-color: rgba(6, 182, 212, 0.35) !important; }
          .border-white\\/15 { border-color: rgba(139, 92, 246, 0.4) !important; }
          .bg-white\\/\\[0\\.01\\] { background-color: rgba(6, 182, 212, 0.01) !important; }
          .bg-white\\/\\[0\\.02\\] { background-color: rgba(6, 182, 212, 0.02) !important; }
          .bg-white\\/\\[0\\.03\\] { background-color: rgba(6, 182, 212, 0.03) !important; }
          .bg-white\\/\\[0\\.04\\] { background-color: rgba(6, 182, 212, 0.04) !important; }
          .bg-white\\/\\[0\\.05\\] { background-color: rgba(6, 182, 212, 0.05) !important; }
          .bg-white\\/\\[0\\.06\\] { background-color: rgba(6, 182, 212, 0.08) !important; }
          .bg-\\[\\#0C0C0E\\]\\/40 { background-color: #0b0c0f !important; }
          .bg-\\[\\#0C0C0E\\]\\/60 { background-color: #0f1115 !important; }
          .bg-\\[\\#0C0C0E\\]\\/70 { background-color: #0c0d10 !important; }
          .bg-\\[\\#0A0A0C\\]\\/40 { background-color: #0f1115 !important; }
          .bg-\\[\\#0E0E10\\] { background-color: #0c0d10 !important; }
          .bg-\\[\\#0E0E10\\]\\/50 { background-color: #0b0c0f !important; }
          .bg-white { background-color: #22d3ee !important; color: #000000 !important; }
          .border-white\\/5 { border-color: rgba(6, 182, 212, 0.15) !important; }
          .border-white\\/10 { border-color: rgba(6, 182, 212, 0.25) !important; }
          select option { background-color: #0c0d10 !important; color: #f3f4f6 !important; }
        ` }} />
      )}
      {/* Cinematic ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            theme === "light"
              ? "radial-gradient(circle 900px at 50% -200px, rgba(0,0,0,0.015) 0%, transparent 80%)"
              : "radial-gradient(circle 900px at 50% -200px, rgba(255,255,255,0.035) 0%, transparent 80%)",
        }}
      />

      {/* If fullscreen meeting view is active */}
      {meetingScreenState !== "inactive" ? (
        <div className={`fixed inset-0 z-50 flex flex-col w-screen h-screen overflow-hidden text-white/80 font-sans ${theme === "light" ? "bg-[#F3F4F6] text-black" : theme === "high-contrast" ? "bg-black text-white border-2 border-white" : theme === "axis" ? "bg-[#050607]" : "bg-[#0A0A0B]"}`}>
          <AnimatePresence mode="wait">
            {meetingScreenState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`flex-1 flex flex-col items-center justify-center text-center p-6 ${theme === "light" ? "bg-[#F3F4F6]" : "bg-black"}`}
              >
                <div className="space-y-4 max-w-sm">
                  {/* Cinematic loading elements */}
                  <div className="relative flex items-center justify-center h-20 w-20 mx-auto mb-6">
                    {/* Slow rotating dash-array ring */}
                    <motion.svg
                      className="absolute size-16 text-cyan-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="24 16 8 16"
                        fill="none"
                      />
                    </motion.svg>
                    {/* Outer pulse */}
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-cyan-500/10 opacity-75"></span>
                    {/* Concentric steady glow core */}
                    <div className="h-5 w-5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse"></div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={loadingStage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-xs font-bold uppercase tracking-wider text-white"
                    >
                      {loadingStages[loadingStage]}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-[9px] text-white/35 uppercase tracking-widest">Axis Operating System</p>
                </div>
              </motion.div>
            )}

            {meetingScreenState === "calibration" && (
              <motion.div
                key="calibration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto"
              >
                <div className="w-full max-w-4xl space-y-6">
                  <div className="flex flex-col text-center">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Pre-join Device Setup</span>
                    <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                      Joining: {activeMeetingInfo?.title || "Virtual Meeting Room"}
                    </h2>
                    <p className="text-xs text-white/40 mt-1">Verify and calibrate your camera and audio systems before entering the focused space</p>
                  </div>
                  <DeviceCalibration
                    confirmLabel="Enter Focused Room"
                    onConfirm={() => {
                      playNotificationSound("meeting");
                      setMeetingScreenState("active");
                    }}
                    theme={theme}
                  />
                  <div className="text-center">
                    <button
                      onClick={() => setMeetingScreenState("inactive")}
                      className="text-xs font-semibold text-white/30 hover:text-white/70 transition-colors"
                    >
                      Cancel and Return to Dashboard
                    </button>
                  </div>
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
           {/* Persistent Left Sidebar */}
           <LeftSidebar
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             theme={theme}
             isTutorialActive={isTutorialActive}
             activeStepIndex={activeStepIndex}
           />

          {/* Main Viewport Container - Height locked to h-screen to allow internal scroll */}
          <div className="flex-1 flex flex-col h-screen pl-[72px] overflow-hidden transition-all duration-300">
        
        {/* Top Header Bar */}
        <header className="relative z-20 flex h-24 items-center justify-between border-b border-white/[0.05] px-safe-lg md:px-safe-xl">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Link
                href="/school/experience"
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                ← Exit console
              </Link>
              <span className="size-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">
                {perspectiveLabel} Mode ({perspectiveId})
              </span>
            </div>
            
            <div className="mt-2 flex items-baseline gap-2.5">
              <h1 className="text-sm font-semibold tracking-tight text-white/90">
                Welcome back, Mr. Aarav Chen.
              </h1>
              <span className="text-xs text-white/35 font-normal tracking-tight">
                Monday, August 28 · 2 coordination updates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Announcements & Notifications Popovers */}
            <div className={`flex items-center gap-3 p-1 rounded-xl transition-all duration-300 ${isTutorialActive && activeStepIndex === 14 ? "tour-highlight bg-white/5" : ""}`}>
              <div className={`p-0.5 rounded-lg transition-all ${isTutorialActive && activeStepIndex === 15 ? "tour-highlight bg-white/5" : ""}`}>
                <AnnouncementsPanel 
                  forceOpen={isTutorialActive && activeStepIndex === 15}
                  onOpenChange={(open) => {
                    if (open) {
                      updateEngagement((prev) => ({
                        ...prev,
                        announcementsViewed: prev.announcementsViewed + 1,
                      }));
                    }
                  }}
                />
              </div>
              <div className={`p-0.5 rounded-lg transition-all ${isTutorialActive && activeStepIndex === 16 ? "tour-highlight bg-white/5" : ""}`}>
                <NotificationsSystem 
                  forceOpen={isTutorialActive && activeStepIndex === 16}
                  onOpenChange={(open) => {
                    if (open) {
                      updateEngagement((prev) => ({
                        ...prev,
                        notificationsViewed: prev.notificationsViewed + 1,
                      }));
                    }
                  }}
                />
              </div>
              {/* Profile icon */}
              <div className="size-8 rounded-full bg-[#08080A] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/55 select-none">
                AC
              </div>
            </div>

            <span className="h-4 w-px bg-white/10" />

            {/* Bring Axis To Your School button */}
            <button
              type="button"
              onClick={() => {
                setIsQuickContextOpen(false);
                handleTransitionToAdopt();
              }}
              className="rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-300 hover:scale-102 flex items-center gap-1.5 bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
            >
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Bring Axis To Your School</span>
            </button>

            <span className="h-4 w-px bg-white/10" />

            {/* Guided tour button wrapper */}
            <div className="relative">
              <button
                type="button"
                onClick={isTutorialActive ? handleSkipOrExit : handleStartTourManual}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-300 ${
                  isTutorialActive
                    ? "bg-white text-black border-white hover:bg-white/95"
                    : !hasRunTour
                      ? "bg-cyan-950/20 border-cyan-400/40 text-cyan-400 hover:border-cyan-400 hover:text-white guided-tour-pulse-btn"
                      : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                {isTutorialActive ? "Exit Tour" : "Guided Tour"}
                {!hasRunTour && !isTutorialActive && (
                  <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-400 text-[7px] font-black text-black uppercase tracking-wider scale-90 border border-[#050607]">
                    Recommended
                  </span>
                )}
              </button>

              {/* First-Time User Coach Mark Callout */}
              <AnimatePresence>
                {showCoachMark && !isTutorialActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3.5 z-50 w-72 rounded-2xl border border-cyan-400/30 bg-[#0E0E10]/95 p-safe-md shadow-[0_16px_48px_rgba(0,0,0,0.95)] backdrop-blur-xl text-left"
                  >
                    {/* Arrow pointing up */}
                    <div className="absolute right-8 -top-1.5 size-3 rotate-45 border-l border-t border-cyan-400/30 bg-[#0E0E10]" />
                    
                    <div className="relative space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[11px] leading-relaxed text-white/90 font-medium">
                          Start here for a quick walkthrough of Axis.
                        </p>
                        <button
                          type="button"
                          onClick={handleDismissCoachMark}
                          className="text-white/40 hover:text-white transition-colors p-0.5 text-xs shrink-0 select-none"
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowCoachMark(false);
                          startTutorial();
                        }}
                        className="w-full text-center py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-bold transition-all uppercase tracking-widest shadow-[0_4px_12px_rgba(34,211,238,0.2)]"
                      >
                        Start Guided Tour
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Grid Content */}
        <main className="relative z-10 flex-1 overflow-y-auto px-safe-lg py-safe-lg md:px-safe-xl md:py-safe-xl scrollbar-none">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 gap-safe-lg lg:grid-cols-[1.15fr_0.85fr]"
              >
                {/* Column 1: Today's main flow */}
                <div className="space-y-safe-lg">
                  {/* Current class details */}
                  <div className={`transition-all duration-300 rounded-2xl ${isTutorialActive && activeStepIndex === 1 ? "tour-highlight" : ""}`}>
                    <CurrentClassCard
                      reminders={reminders}
                      onAddReminder={handleAddReminder}
                      onSnoozeReminder={handleSnoozeReminder}
                      onArchiveReminder={handleArchiveReminder}
                      attendanceVerified={attendanceVerified}
                      onVerifyAttendance={handleVerifyAttendance}
                      lastVerifiedTime={lastVerifiedTime}
                      overrideCount={currentClassOverrides}
                      totalStudents={currentClassTotal}
                      verifiedCount={currentClassVerified}
                    />
                  </div>

                  {/* Adaptive schedule list */}
                  <motion.div
                    animate={isTutorialActive && activeStepIndex === 3 ? { borderColor: "rgba(34,211,238,0.3)", scale: 1.01 } : {}}
                    className="rounded-2xl border border-transparent transition-all duration-500"
                  >
                    <AdaptiveTimetable
                      reminders={reminders}
                      onAddReminder={handleAddReminder}
                      onSnoozeReminder={handleSnoozeReminder}
                      onArchiveReminder={handleArchiveReminder}
                    />
                  </motion.div>
                </div>

                {/* Column 2: Side awareness panels */}
                <div className="space-y-safe-lg">
                  {/* Clock component */}
                  <ClockSystem />

                  {/* Status update component */}
                  <motion.div
                    className={`rounded-2xl border border-transparent transition-all duration-500 ${isTutorialActive && activeStepIndex === 2 ? "tour-highlight" : ""}`}
                  >
                    <StatusSystem />
                  </motion.div>

                  {/* Connected Resources */}
                  <motion.div
                    animate={isTutorialActive && activeStepIndex === 11 ? { borderColor: "rgba(34,211,238,0.3)", scale: 1.01 } : {}}
                    className="rounded-2xl border border-transparent transition-all duration-500"
                  >
                    <ConnectedResources />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "timetable" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-4xl mx-auto"
              >
                <AdaptiveTimetable
                  reminders={reminders}
                  onAddReminder={handleAddReminder}
                  onSnoozeReminder={handleSnoozeReminder}
                  onArchiveReminder={handleArchiveReminder}
                />
              </motion.div>
            )}

            {activeTab === "attendance" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-4xl mx-auto"
              >
                <AttendanceWorkspace
                  rosters={rosters}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  onStatusChange={handleStatusChange}
                  onToggleAutoAttendance={handleToggleAutoAttendance}
                  onSubmitRollCall={handleVerifyAttendance}
                />
              </motion.div>
            )}

            {activeTab === "context" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                <ContextLayer fullPage={true} items={derivedContextItems} onDismissItem={handleDismissContextItem} />
              </motion.div>
            )}

            {activeTab === "connected-resources" && (
              <motion.div
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-4xl mx-auto"
              >
                <SettingsWorkspace />
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                <EmailWorkspace />
              </motion.div>
            )}

            {activeTab === "meetings" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                 <MeetingsWorkspace
                   onStartMeetingTransit={(meet) => {
                     setActiveMeetingInfo(meet);
                     setMeetingScreenState("loading");
                   }}
                   theme={theme}
                 />
              </motion.div>
            )}

            {activeTab === "class-space" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                <ClassSpaceWorkspace />
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
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

            {activeTab === "workspace" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full"
              >
                <WorkspaceWorkspace
                  theme={theme}
                  items={workspaceItems}
                  onUpdateItems={setWorkspaceItems}
                  captures={essentialCaptures}
                  selectedFileId={openWorkspaceFileId}
                  onClearSelectedFile={() => setOpenWorkspaceFileId(null)}
                />
              </motion.div>
            )}

            {!["home", "timetable", "attendance", "context", "settings", "messages", "email", "meetings", "class-space", "calendar", "connected-resources", "essential-space", "workspace"].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] p-10"
              >
                <span className="text-xl font-medium tracking-tight text-white/80">Workspace Layer Locked</span>
                <p className="mt-2 text-xs text-white/35 max-w-sm">
                  This segment of the {perspectiveLabel} console is currently locked for this demo iteration. Connect with your system administrator.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Tutorial popover guidance overlay */}
        <AnimatePresence>
          {isTutorialActive && activeStep && (
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="sticky bottom-6 left-6 right-6 z-50 mx-auto max-w-xl rounded-2xl border border-white/15 bg-[#0E0E10]/95 px-6 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              role="dialog"
              aria-label="Guided Tour Notification"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest">
                  Walkthrough · Step {activeStepIndex + 1} of {steps.length} · {Math.round(((activeStepIndex + 1) / steps.length) * 100)}% Complete
                </span>
                <h3 className="mt-2 text-sm font-semibold tracking-tight text-white">{activeStep.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{activeStep.description}</p>
                
                {activeStep.id === "capture" && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const event = new CustomEvent("axis-trigger-capture-demo");
                        window.dispatchEvent(event);
                      }}
                      className="px-4.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <svg className="size-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                      Watch Live Demonstration
                    </button>
                  </div>
                )}
                
                {activeStep.id === "workspace-demo" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateWorkspaceDocCreation}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      📄 Create Doc Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateWorkspaceTogglePin}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      ★ Toggle Pin Status
                    </button>
                  </div>
                )}
                
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
                      Exit Tour
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

        {/* Skip Warning Modal */}
        <AnimatePresence>
          {showSkipWarning && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
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
                  Axis works differently from traditional school platforms.
                  <br /><br />
                  Many features connect together and may feel unfamiliar at first.
                  <br /><br />
                  Taking a few minutes to complete the tour will help you understand how everything fits together and get the most out of the experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <div className="fixed inset-0" onClick={() => {
                setShowCompletionModal(false);
                localStorage.setItem("axis-tour-has-run", "true");
                setHasRunTour(true);
                endTutorial();
                updateEngagement((prev) => ({
                  ...prev,
                  completedTour: true,
                }));
              }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0E0E10]/95 p-6 shadow-2xl text-white space-y-5 text-center z-10"
              >
                <div className="size-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-xl animate-bounce">
                  ✨
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight">You&apos;re Ready.</h3>
                  <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-widest">Axis Onboarding Complete</p>
                </div>
                <div className="h-px bg-white/[0.06] w-full" />
                <p className="text-xs text-white/60 leading-relaxed text-center">
                  You now have an overview of how Axis connects communication, planning, resources, meetings, classes, and daily operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompletionModal(false);
                      localStorage.setItem("axis-tour-has-run", "true");
                      setHasRunTour(true);
                      endTutorial();
                      updateEngagement((prev) => ({
                        ...prev,
                        completedTour: true,
                      }));
                      setActiveTab("home");
                    }}
                    className="flex-1 rounded-xl border border-white/10 hover:border-white/20 bg-transparent text-white font-bold text-xs py-3.5 hover:bg-white/5 transition-all text-center uppercase tracking-wider"
                  >
                    Enter Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompletionModal(false);
                      localStorage.setItem("axis-tour-has-run", "true");
                      setHasRunTour(true);
                      endTutorial();
                      updateEngagement((prev) => ({
                        ...prev,
                        completedTour: true,
                      }));
                      handleTransitionToAdopt();
                    }}
                    className="flex-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs py-3.5 transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] text-center uppercase tracking-wider"
                  >
                    Bring Axis To Your School
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Engagement-based Ecosystem Invitation Modal */}
        <AnimatePresence>
          {showEcosystemInvitation && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
              {/* Soft dismiss on click backdrop */}
              <div 
                className="fixed inset-0" 
                onClick={() => {
                  setShowEcosystemInvitation(false);
                  setShowPlansView(false);
                  updateEngagement((prev) => ({
                    ...prev,
                    dismissedAtScore: engagementScore,
                  }));
                }} 
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full ${showPlansView ? "max-w-4xl" : "max-w-xl"} rounded-3xl border ${cardStyles.bg} p-safe-lg sm:p-safe-xl shadow-2xl backdrop-blur-2xl z-10 transition-all duration-500 overflow-hidden text-left`}
              >
                {/* Glow behind the card */}
                <div 
                  className="pointer-events-none absolute -inset-20 opacity-30 blur-[80px] z-0"
                  style={{
                    background: `radial-gradient(circle, ${cardStyles.accentGlow} 0%, transparent 60%)`
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <AnimatePresence mode="wait">
                    {!showPlansView ? (
                      <motion.div
                        key="invite-main"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cardStyles.badge}`}>
                            Interactive Demo Tour
                          </span>
                          <span className="size-1 rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/40 tracking-wider uppercase">
                            Teacher Experience Verified
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className={`text-xl font-bold tracking-tight ${cardStyles.textPrimary} md:text-2xl`}>
                            You&apos;re beginning to see how Axis works.
                          </h3>
                          <p className={`text-sm leading-relaxed ${cardStyles.textSecondary}`}>
                            You&apos;ve explored the Teacher experience.
                            Want to see how everything connects across the entire school?
                          </p>
                          <p className={`text-sm leading-relaxed ${cardStyles.textSecondary}`}>
                            Teachers, students, coordinators, and families all stay in sync on a single platform.
                          </p>
                        </div>

                        <div className="h-px bg-white/[0.05]" />

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEcosystemInvitation(false);
                              updateEngagement((prev) => ({
                                ...prev,
                                hasAccepted: true,
                              }));
                              router.push("/school/experience");
                            }}
                            className={`flex-1 rounded-xl font-bold text-xs py-3.5 px-5 text-center transition-all ${cardStyles.buttonPrimary}`}
                          >
                            Explore All Roles
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setShowEcosystemInvitation(false);
                              updateEngagement((prev) => ({
                                ...prev,
                                hasAccepted: true,
                              }));
                              handleTransitionToAdopt();
                            }}
                            className={`flex-1 rounded-xl border bg-transparent font-bold text-xs py-3.5 px-5 text-center transition-all ${cardStyles.buttonSecondary}`}
                          >
                            Bring Axis To Your School
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowEcosystemInvitation(false);
                              updateEngagement((prev) => ({
                                ...prev,
                                dismissedAtScore: engagementScore,
                              }));
                            }}
                            className={`sm:flex-none text-xs font-semibold py-3.5 px-5 text-center transition-all ${cardStyles.buttonTertiary}`}
                          >
                            Maybe Later
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="invite-plans"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setShowPlansView(false)}
                              className={`text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5`}
                            >
                              ← Back to invitation
                            </button>
                          </div>
                          <span className="text-[10px] text-white/30 tracking-widest uppercase">
                            Axis Integration Options
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className={`text-lg font-bold tracking-tight ${cardStyles.textPrimary}`}>
                            Axis School Integration Plans
                          </h3>
                          <p className={`text-xs ${cardStyles.textSecondary}`}>
                            Choose the scope that matches your institution&apos;s operational size.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              name: "Faculty Starter",
                              scope: "Departmental pilot",
                              details: "For single departments or grade teams testing connected workspaces.",
                              features: [
                                "Up to 10 staff members",
                                "Essential knowledge spaces",
                                "Shared document creator",
                                "Standard calendar integrations",
                              ],
                              cta: "Request Department Pilot",
                            },
                            {
                              name: "Campus Standard",
                              scope: "Whole school sync",
                              details: "Unified platform connecting all teachers, students, and coordinators.",
                              features: [
                                "Unlimited staff & students",
                                "Context-aware timetable auto-sync",
                                "Parent visibility portal",
                                "Virtual meeting rooms & calibration",
                              ],
                              cta: "Schedule School Demo",
                              recommended: true,
                            },
                            {
                              name: "District Enterprise",
                              scope: "Multi-campus control",
                              details: "Advanced features and analytical controls for school groups and districts.",
                              features: [
                                "Multi-campus hierarchy",
                                "District analytics & reporting",
                                "Active Directory / SIS integration",
                                "24/7 dedicated support SLA",
                              ],
                              cta: "Contact Sales",
                            },
                          ].map((plan) => (
                            <div 
                              key={plan.name}
                              className={`p-5 rounded-2xl border ${plan.recommended ? "border-cyan-400/40 bg-cyan-400/[0.02]" : cardStyles.plansBg} flex flex-col justify-between space-y-4`}
                            >
                              <div className="space-y-2">
                                {plan.recommended && (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest uppercase bg-cyan-400 text-black mb-1">
                                    Recommended
                                  </span>
                                )}
                                <h4 className={`text-sm font-bold ${cardStyles.textPrimary}`}>{plan.name}</h4>
                                <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">{plan.scope}</p>
                                <p className="text-[11px] text-white/50 leading-relaxed">{plan.details}</p>
                                
                                <div className="h-px bg-white/[0.04] my-2" />
                                
                                <ul className="space-y-1.5 text-[10px] text-white/60 leading-relaxed font-sans">
                                  {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-1.5">
                                      <span className="text-cyan-400 font-bold">•</span>
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Thank you for your interest in the ${plan.name} plan! An integration specialist will reach out shortly.`);
                                  setShowEcosystemInvitation(false);
                                  setShowPlansView(false);
                                  updateEngagement((prev) => ({
                                    ...prev,
                                    hasAccepted: true,
                                  }));
                                }}
                                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  plan.recommended 
                                    ? "bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-black"
                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                }`}
                              >
                                {plan.cta}
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Keyboard E Hold Capture System Overlay */}
        <CaptureLayer onSaveCapture={handleSaveCapture} />

        {/* Floating Quick Context Access Entry Point */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center">
          <motion.button
            onClick={() => setIsQuickContextOpen(!isQuickContextOpen)}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-3 bg-[#0E0E10] hover:bg-white/[0.04] text-white border border-white/10 px-5 py-3 rounded-full text-xs font-semibold shadow-2xl transition-all max-w-sm overflow-hidden ${isTutorialActive && activeStepIndex === 17 ? "tour-highlight" : ""}`}
            animate={derivedContextItems.some(i => i.active) ? {
              borderColor: ["rgba(255,255,255,0.1)", "rgba(6,182,212,0.3)", "rgba(255,255,255,0.1)"]
            } : {}}
            transition={derivedContextItems.some(i => i.active) ? {
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          >
            {/* Ambient small pulse dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {derivedContextItems.some(i => i.active) && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${derivedContextItems.some(i => i.active) ? "bg-cyan-500" : "bg-white/20"}`}></span>
            </span>

            <span className="tracking-wide">Context</span>
            <div className="h-3 w-px bg-white/20" />
            
            <AnimatePresence mode="wait">
              <motion.span
                key={contextPreviewIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-white/50 text-[11px] font-normal truncate max-w-[200px]"
              >
                {contextPreviews[contextPreviewIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Lightweight Quick Context Side Sheet */}
        <AnimatePresence>
          {isQuickContextOpen && (
            <>
              {/* Dimmed minimal overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuickContextOpen(false)}
                className="fixed inset-0 z-40 bg-black/80"
              />

              <motion.div
                initial={{ x: "100%", opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-80 sm:w-96 bg-[#0A0A0C]/95 border-l border-white/10 p-5 shadow-2xl overflow-y-auto flex flex-col gap-4 text-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Context</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                  <button
                    onClick={() => setIsQuickContextOpen(false)}
                    className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-all"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Suggestions List */}
                <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto scrollbar-none">
                  {/* Top opportunities category */}
                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                      Daily Attention & Updates
                    </span>
                    <div className="space-y-2">
                      {derivedContextItems.filter(i => i.active).length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-white/30">
                          No active alerts or updates right now.
                        </div>
                      ) : (
                        derivedContextItems.filter(i => i.active).map(item => (
                          <div key={item.id} className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-xl hover:border-white/[0.1] transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-semibold text-white/90 truncate">{item.title}</span>
                              <span className="text-[8px] text-white/30">{item.meta}</span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed">{item.description}</p>
                            {item.actionLabel && (
                              <button
                                onClick={() => {
                                  handleDismissContextItem(item.id);
                                }}
                                className="mt-2 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                {item.actionLabel} →
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Room status */}
                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                      Live Room & Counselor Availability
                    </span>
                    <div className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-xl space-y-2 text-[10px] text-white/60">
                      <div className="flex justify-between items-center">
                        <span>• Lab 3 (Physics Room)</span>
                        <span className="text-[9px] font-bold text-emerald-400">Available after Period 3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>• Room 102 (Sarah Chen)</span>
                        <span className="text-[9px] font-bold text-emerald-400">Available during Period 3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>• Conference Hall B</span>
                        <span className="text-[9px] font-bold text-amber-400">Reserved Period 5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action to full workspace page */}
                <div className="pt-3 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      setActiveTab("context");
                      setIsQuickContextOpen(false);
                    }}
                    className="w-full py-2 bg-white text-zinc-950 text-xs font-bold rounded-lg hover:bg-white/90 text-center transition-all block"
                  >
                    Open Context Workspace
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Full-Screen Transition Overlay to Adopt */}
        <AnimatePresence>
          {isTransitioningToAdopt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#050607] text-white"
            >
              {/* Ambient slow rotating ecosystem orbit */}
              <div className="absolute inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(circle 600px at 50% 50%, rgba(34,211,238,0.06) 0%, transparent 80%)"
              }} />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm px-6">
                {/* Cinematic spinner */}
                <div className="relative flex items-center justify-center h-24 w-24">
                  <motion.svg
                    className="absolute size-20 text-cyan-400/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="30 20 10 20"
                      fill="none"
                    />
                  </motion.svg>
                  <motion.svg
                    className="absolute size-14 text-violet-500/40"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeDasharray="15 15"
                      fill="none"
                    />
                  </motion.svg>
                  <div className="size-4 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] leading-relaxed">
                    Preparing Adoption Experience...
                  </h3>
                  <p className="text-[10px] text-white/45 uppercase tracking-widest leading-relaxed">
                    Moving from product exploration to institutional evaluation
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )}
</div>
  );
}

