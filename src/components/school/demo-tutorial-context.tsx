"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
  highlight?: string;
  buttons?: ("next" | "skip" | "finish")[];
  isFinal?: boolean;
  welcomeMessage?: string;
  primaryButton?: string;
  secondaryButton?: string;
};

type DemoTutorialContextValue = {
  steps: TutorialStep[];
  activeStepIndex: number;
  isTutorialActive: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTutorial: () => void;
  goToStep: (index: number) => void;
  perspective?: "teacher" | "coordinator";
  setPerspective?: (perspective: "teacher" | "coordinator") => void;
};

const DemoTutorialContext = createContext<DemoTutorialContextValue | null>(null);

type DemoTutorialProviderProps = {
  children: ReactNode;
  steps?: TutorialStep[];
  perspective?: "teacher" | "coordinator";
};

const defaultTeacherSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Axis",
    description: "Axis is not a collection of tools. Axis is a connected environment designed to reduce friction and keep everything in one place.",
  },
  {
    id: "dashboard",
    title: "Today's Dashboard",
    description: "The dashboard is your daily starting point. Here you see current classes, upcoming lessons, reminders, attendance, and operational updates.",
  },
  {
    id: "presence",
    title: "Presence & Availability",
    description: "Teachers can communicate availability to students and staff. Presence status integrates with scheduling and communication systems.",
  },
  {
    id: "timetable",
    title: "Timetable",
    description: "The timetable adapts in real time. Half days, schedule changes, room changes, and coordinator updates all update automatically.",
  },
  {
    id: "attendance",
    title: "Attendance",
    description: "Verify presence, homeroom rosters, log overrides, and automated presence validation in one central tool.",
  },
  {
    id: "messages",
    title: "Messages",
    description: "Maintain clean communication lines between teachers, students, departments, and coordinators, using student request-based queues.",
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Instantly launch video calls, plan assemblies, configure guest links, calibrate devices, and handle department reviews.",
  },
  {
    id: "class-space",
    title: "Class Space",
    description: "The operational home of a class. Access unit layouts, assignments, resource material, grading, and assessments.",
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Track working days, official holidays, school events, assessment deadlines, and sync personal plans.",
  },
  {
    id: "essential-space",
    title: "Essential Space",
    description: "Your private space for tracking tasks, notes, saved files, and drafts.",
  },
  {
    id: "capture",
    title: "Capture System",
    description: "Double-tap 'E' to open Capture Mode. Drag a box over any screen area, append a note, and save. It routes to Essential Space captures. Let's run a demonstration!",
  },
  {
    id: "workspace-intro",
    title: "Axis Workspace",
    description: "Workspace is where you create and manage lesson plans, documents, presentations, and draft resources.",
  },
  {
    id: "workspace-demo",
    title: "Interactive Workspace Actions",
    description: "Try out the Workspace. Explore the Quick Create panel, recent files, and templates. Try starting a new document!",
  },
  {
    id: "connected-resources",
    title: "Connected Resources",
    description: "Connected Resources connects you to shared school folders, department files, and external integrations.",
  },
  {
    id: "top-right-awareness",
    title: "Top Right Navigation",
    description: "The top-right header houses announcements, personal notifications, status signals, and profile configurations.",
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "Announcements are broadcast updates for the whole school—such as scheduling changes, room updates, and department notices. Click the megaphone icon to open the panel.",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Notifications are personal updates—direct messages, meeting invites, student requests, and system alerts. Explore the bell icon to pin, snooze, or archive alerts.",
  },
  {
    id: "context",
    title: "Attention",
    description: "Attention displays daily updates, alerts, and opportunities. It quietly monitors schedules, room bookings, and class needs to give you relevant recommendations.",
  },
  {
    id: "settings",
    title: "Settings & Personalization",
    description: "Customize your account themes (Light, Dark, Axis, High Contrast), notification controls, connected hardware devices, and organization details.",
  },
];

const coordinatorSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Axis",
    description: "Axis combines communication, scheduling, oversight, analytics, resources and operations into one connected environment. As a DP Coordinator, this becomes your command center for running the entire programme.",
    highlight: "dashboard",
    buttons: ["next", "skip"],
  },
  {
    id: "overview",
    title: "Programme Overview",
    description: "This dashboard gives you a live operational snapshot of the programme. Attendance trends, academic performance, upcoming deadlines and programme health are surfaced here so you can immediately identify where attention is needed.",
    highlight: "overview",
    buttons: ["next", "skip"],
  },
  {
    id: "students",
    title: "Students",
    description: "The Student Directory is your primary access point to student information. You can locate students, contact families, view academic profiles and access support information from one place.",
    highlight: "students",
    buttons: ["next", "skip"],
  },
  {
    id: "student-profiles",
    title: "Student Statistics Profiles",
    description: "Every student has a detailed statistics profile containing academic performance, attendance history, support accommodations and long-term progress data. This allows coordinators to understand a student's journey over time.",
    highlight: "student-profile",
    buttons: ["next", "skip"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Analytics focuses on trends rather than spreadsheets. Monitor subject performance, workload balance, attendance patterns and programme milestones before issues become larger problems.",
    highlight: "analytics",
    buttons: ["next", "skip"],
  },
  {
    id: "schedule",
    title: "Schedule Management",
    description: "The Schedule area allows programme-wide changes. Create special events, adjust schedules, manage guest speakers and coordinate DP-wide timetable changes.",
    highlight: "schedule",
    buttons: ["next", "skip"],
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Coordinate meetings with advisors, supervisors and leadership teams. Meeting information stays connected to related workflows throughout Axis.",
    highlight: "meetings",
    buttons: ["next", "skip"],
  },
  {
    id: "messages",
    title: "Messages",
    description: "Messages centralize communication between staff, students and families. Files, groups and conversations remain connected to the wider Axis ecosystem.",
    highlight: "messages",
    buttons: ["next", "skip"],
  },
  {
    id: "resources",
    title: "Connected Resources",
    description: "Policies, handbooks, forms and institutional resources are stored centrally. When sending emails or messages, resources can be attached directly from Axis without leaving the platform.",
    highlight: "resources",
    buttons: ["next", "skip"],
  },
  {
    id: "requests",
    title: "Requests & Operations",
    description: "Technical issues, leave requests, approvals and operational concerns are managed through structured workflows. Only actions relevant to the current request are displayed.",
    highlight: "requests",
    buttons: ["next", "skip"],
  },
  {
    id: "essential-space",
    title: "Essential Space",
    description: "Essential Space allows you to capture important information without interrupting your workflow. Save screenshots, notes and references and reuse them across emails, messages and operations.",
    highlight: "essential-space",
    buttons: ["next", "skip"],
  },
  {
    id: "context-engine",
    title: "Context Engine",
    description: "Axis understands operational context in the background. When an email or message references an event, issue or task, the system can surface relevant actions without automatically making decisions for you. The coordinator remains in control.",
    highlight: "context",
    buttons: ["next", "skip"],
  },
  {
    id: "final",
    title: "Everything is One.",
    description: "Axis was built around a simple principle: Communication, resources, scheduling, operations and people should work together naturally. Instead of switching between disconnected systems, everything exists within one connected environment.",
    highlight: "final",
    isFinal: true,
    welcomeMessage: "Welcome to Axis.",
    primaryButton: "Explore Axis",
    secondaryButton: "Replay Tour Later",
    buttons: ["finish"],
  },
];

export { coordinatorSteps };

export function DemoTutorialProvider({
  children,
  steps = defaultTeacherSteps,
  perspective = "teacher",
}: DemoTutorialProviderProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [currentPerspective, setCurrentPerspective] = useState<"teacher" | "coordinator">(perspective);

  const isTutorialActive = activeStepIndex >= 0;

  const currentSteps = currentPerspective === "coordinator" ? coordinatorSteps : steps;

  const startTutorial = useCallback(() => setActiveStepIndex(0), []);
  const endTutorial = useCallback(() => setActiveStepIndex(-1), []);
  const nextStep = useCallback(
    () => setActiveStepIndex((prev) => Math.min(prev + 1, currentSteps.length - 1)),
    [currentSteps.length],
  );
  const prevStep = useCallback(
    () => setActiveStepIndex((prev) => Math.max(prev - 1, 0)),
    [],
  );
  const goToStep = useCallback(
    (index: number) => setActiveStepIndex(Math.max(0, Math.min(index, currentSteps.length - 1))),
    [currentSteps.length],
  );
  const setPerspective = useCallback((newPerspective: "teacher" | "coordinator") => {
    setCurrentPerspective(newPerspective);
    setActiveStepIndex(-1);
  }, []);

  const value = useMemo(
    () => ({
      steps: currentSteps,
      activeStepIndex,
      isTutorialActive,
      startTutorial,
      nextStep,
      prevStep,
      endTutorial,
      goToStep,
      perspective: currentPerspective,
      setPerspective,
    }),
    [currentSteps, activeStepIndex, isTutorialActive, startTutorial, nextStep, prevStep, endTutorial, goToStep, currentPerspective, setPerspective],
  );

  return <DemoTutorialContext.Provider value={value}>{children}</DemoTutorialContext.Provider>;
}

export function useDemoTutorial() {
  const context = useContext(DemoTutorialContext);
  if (!context) {
    throw new Error("useDemoTutorial must be used within DemoTutorialProvider");
  }
  return context;
}
