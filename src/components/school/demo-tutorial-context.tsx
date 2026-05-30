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
    description: "Your personal knowledge space. Track captures, collections, notes, saved resources, mind maps, and drafts in one private playground.",
  },
  {
    id: "capture",
    title: "Capture System",
    description: "Double-tap 'E' to open Capture Mode. Drag a box over any screen area, append a note, and save. It routes to Essential Space captures. Let's run a demonstration!",
  },
  {
    id: "workspace-intro",
    title: "Axis Workspace: The Creation Layer",
    description: "Workspace is the primary creative layer of Axis where you create, access, organize, and manage Documents, Presentations, Spreadsheets, PDFs, Notes, and Mind Maps inside Axis. It keeps your work inside the ecosystem, avoiding external distractions.",
  },
  {
    id: "workspace-demo",
    title: "Interactive Workspace Actions",
    description: "Let's interact with the Workspace. Explore the Quick Create panel, Recent files, Pinned items, and template configurations. Try clicking the buttons or starting a Document creation directly!",
  },
  {
    id: "connected-resources",
    title: "Connected Resources",
    description: "Connected Resources connects you to Teaching Resources, the School Hub, Connected Platforms, and Department Libraries. While Essential Space is personal, Connected Resources is your organization's structured knowledge database.",
  },
  {
    id: "top-right-awareness",
    title: "Top Right Operational Awareness",
    description: "Look at the top-right communication area. This is your operational awareness center. It houses Announcements, Notifications, Context status, and your Profile configurations.",
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "Announcements are broadcast communications for the whole school—updates, exam dates, room changes, department notices, assemblies, and policies. Click the megaphone icon to open the panel.",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Notifications are personal updates—direct messages, meeting invites, assignment submissions, reminders, and context alerts. Explore the bell icon to mark read, archive, pin, or dismiss alerts.",
  },
  {
    id: "context",
    title: "Context",
    description: "Context is your live operational awareness. It quietly monitors schedules, room state, upcoming opportunities, and resource needs. It suggests helpful recommendations without ever getting in your way.",
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
