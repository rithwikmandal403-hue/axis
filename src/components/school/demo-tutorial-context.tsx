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
};

const DemoTutorialContext = createContext<DemoTutorialContextValue | null>(null);

type DemoTutorialProviderProps = {
  children: ReactNode;
  steps?: TutorialStep[];
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

export function DemoTutorialProvider({
  children,
  steps = defaultTeacherSteps,
}: DemoTutorialProviderProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const isTutorialActive = activeStepIndex >= 0;

  const startTutorial = useCallback(() => setActiveStepIndex(0), []);
  const endTutorial = useCallback(() => setActiveStepIndex(-1), []);
  const nextStep = useCallback(
    () => setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1)),
    [steps.length],
  );
  const prevStep = useCallback(
    () => setActiveStepIndex((prev) => Math.max(prev - 1, 0)),
    [],
  );
  const goToStep = useCallback(
    (index: number) => setActiveStepIndex(Math.max(0, Math.min(index, steps.length - 1))),
    [steps.length],
  );

  const value = useMemo(
    () => ({
      steps,
      activeStepIndex,
      isTutorialActive,
      startTutorial,
      nextStep,
      prevStep,
      endTutorial,
      goToStep,
    }),
    [steps, activeStepIndex, isTutorialActive, startTutorial, nextStep, prevStep, endTutorial, goToStep],
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
