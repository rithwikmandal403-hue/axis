"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

type DPClass = {
  subject: string;
  teacher: string;
  room: string;
  studentsCount: number;
  conflict?: string;
  exception?: string;
};

type TimetablePeriod = {
  id: string;
  name: string;
  time: string;
  durationMin: number;
  type: "class" | "break" | "lunch";
  classes: {
    dp1: DPClass[];
    dp2: DPClass[];
  };
  isOverridden?: boolean;
  overrideDetails?: OverrideEvent;
  isPreview?: boolean;
};

type OverrideEvent = {
  id: string;
  day: string;
  periodId: string;
  cohort: "dp1" | "dp2";
  type: string;
  customType?: string;
  title: string;
  description?: string;
  affectedClasses: string[]; // subjects
  replacementBehavior: string;
  notifyUsers: string[];
};

const PERIODS_SCHEDULE: Record<string, TimetablePeriod[]> = {
  Monday: [
    {
      id: "p-advisory",
      name: "Advisory Block",
      time: "08:00  -  08:30",
      durationMin: 30,
      type: "class",
      classes: {
        dp1: [{ subject: "DP1 Advisory Sync", teacher: "Ms. Sarah Thompson", room: "Library", studentsCount: 30 }],
        dp2: [{ subject: "DP2 Advisory Sync", teacher: "Mr. Aarav Chen", room: "Seminar Room", studentsCount: 28 }],
      }
    },
    {
      id: "p2",
      name: "Period 2",
      time: "08:30  -  09:50",
      durationMin: 80,
      type: "class",
      classes: {
        dp1: [
          { subject: "Mathematics AA HL", teacher: "Mr. Marcus Vance", room: "Room 204", studentsCount: 18 },
          { subject: "Physics HL", teacher: "Mr. Aarav Chen", room: "Science Lab 3", studentsCount: 20, conflict: "Lab 3 ventilation audit scheduled at 09:00" },
          { subject: "Economics HL", teacher: "Mr. Robert Blake", room: "Room 102", studentsCount: 15 }
        ],
        dp2: [
          { subject: "Chemistry HL", teacher: "Ms. Ananya Rao", room: "Science Lab 2", studentsCount: 15 },
          { subject: "Geography SL", teacher: "Mr. Robert Blake", room: "Room 104", studentsCount: 11 },
          { subject: "French B SL", teacher: "Ms. Martin", room: "Room 202", studentsCount: 16 }
        ]
      }
    },
    {
      id: "p-break",
      name: "Morning Break",
      time: "09:50  -  10:05",
      durationMin: 15,
      type: "break",
      classes: {
        dp1: [],
        dp2: []
      }
    },
    {
      id: "p3",
      name: "Period 3",
      time: "10:05  -  11:20",
      durationMin: 75,
      type: "class",
      classes: {
        dp1: [
          { subject: "English A Literature", teacher: "Ms. Clara Dupont", room: "Room 3A", studentsCount: 22 },
          { subject: "Chemistry SL", teacher: "Ms. Ananya Rao", room: "Science Lab 2", studentsCount: 12 },
          { subject: "Visual Arts HL", teacher: "Ms. Allen", room: "Art Studio", studentsCount: 10 }
        ],
        dp2: [
          { subject: "Physics HL", teacher: "Mr. Aarav Chen", room: "Science Lab 3", studentsCount: 18 },
          { subject: "Mathematics AI HL", teacher: "Mr. Marcus Vance", room: "Room 204", studentsCount: 14 },
          { subject: "Economics SL", teacher: "Mr. Robert Blake", room: "Room 102", studentsCount: 12 }
        ]
      }
    },
    {
      id: "p4",
      name: "Period 4",
      time: "11:30  -  12:50",
      durationMin: 80,
      type: "class",
      classes: {
        dp1: [
          { subject: "Theory of Knowledge", teacher: "Ms. Sarah Thompson", room: "Library", studentsCount: 25 },
          { subject: "Biology HL", teacher: "Ms. Davis", room: "Science Lab 1", studentsCount: 16 }
        ],
        dp2: [
          { subject: "English A Lang & Lit", teacher: "Ms. Clara Dupont", room: "Room 3A", studentsCount: 20 },
          { subject: "Computer Science HL", teacher: "Mr. Patel", room: "Computer Lab 4", studentsCount: 10 }
        ]
      }
    },
    {
      id: "p-lunch",
      name: "Lunch Block",
      time: "12:50  -  13:40",
      durationMin: 50,
      type: "lunch",
      classes: {
        dp1: [],
        dp2: []
      }
    },
    {
      id: "p5",
      name: "Period 5",
      time: "13:40  -  15:00",
      durationMin: 80,
      type: "class",
      classes: {
        dp1: [
          { subject: "History HL", teacher: "Mr. Robert Blake", room: "Room 105", studentsCount: 14 },
          { subject: "Environmental Systems SL", teacher: "Ms. Ananya Rao", room: "Room 206", studentsCount: 11 }
        ],
        dp2: [
          { subject: "Theory of Knowledge", teacher: "Ms. Sarah Thompson", room: "Library", studentsCount: 24 },
          { subject: "Business Management HL", teacher: "Ms. Scott", room: "Room 208", studentsCount: 17 }
        ]
      }
    }
  ]
};

// Generates Tuesday-Friday schedules based on Monday with slight variations to feel alive!
const getScheduleForDay = (day: string): TimetablePeriod[] => {
  const base = PERIODS_SCHEDULE.Monday;
  const cloned = JSON.parse(JSON.stringify(base)) as TimetablePeriod[];
  if (day === "Tuesday") {
    cloned[1].classes.dp1[0].room = "Room 210";
    cloned[1].classes.dp2[1].room = "Room 108";
  } else if (day === "Wednesday") {
    cloned[3].classes.dp1[1].teacher = "Ms. Rao (Cover)";
    cloned[3].classes.dp1[1].exception = "Assigned substitute cover";
  } else if (day === "Thursday") {
    cloned[4].classes.dp2[1].studentsCount = 12;
  } else if (day === "Friday") {
    cloned[6].classes.dp1[0].room = "Room 106";
  }
  return cloned;
};

export function AcademicScheduling({ theme }: { theme: string; activeProgramme?: string }) {
  const styles = getAxisTheme(theme as Theme);
  const isLight = theme === "light";

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // State Management
  const [selectedCohort, setSelectedCohort] = useState<"dp1" | "dp2">("dp1");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>("p2"); // Default Period 2 open

  // Override events list
  const [overrides, setOverrides] = useState<OverrideEvent[]>([]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Add Event Form State
  const [formCohort, setFormCohort] = useState<"dp1" | "dp2">("dp1");
  const [formDay, setFormDay] = useState<string>("Monday");
  const [formPeriodId, setFormPeriodId] = useState<string>("p3");
  const [formType, setFormType] = useState<string>("Guest Speaker");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formCustomType, setFormCustomType] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formAffectedClasses, setFormAffectedClasses] = useState<string[]>([]);
  const [formReplacementBehavior, setFormReplacementBehavior] = useState<string>("Replace Classes Entirely");
  const [formNotifyUsers, setFormNotifyUsers] = useState<string[]>(["Students", "Faculty"]);

  // Send Announcement along with Override states
  const [sendAnnWithOverride, setSendAnnWithOverride] = useState<boolean>(true);
  const [showAnnReviewModal, setShowAnnReviewModal] = useState<boolean>(false);
  const [annDraftTitle, setAnnDraftTitle] = useState<string>("");
  const [annDraftBody, setAnnDraftBody] = useState<string>("");
  const [annDraftAudience, setAnnDraftAudience] = useState<string>("");
  const [annDraftPriority, setAnnDraftPriority] = useState<"info" | "reminder" | "important" | "urgent" | "emergency">("important");

  // Preview Mode State
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCompareMode, setPreviewCompareMode] = useState<"proposed" | "current">("proposed");

  // Helper: show toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic schedule list for current selected day
  const rawPeriods = useMemo(() => {
    return getScheduleForDay(selectedDay);
  }, [selectedDay]);

  // Lookup classes available for form settings
  const currentFormPeriodClasses = useMemo(() => {
    const dayPeriods = getScheduleForDay(formDay);
    const p = dayPeriods.find((x) => x.id === formPeriodId);
    if (!p) return [];
    return formCohort === "dp1" ? p.classes.dp1 : p.classes.dp2;
  }, [formDay, formPeriodId, formCohort]);

  const previewOverride: OverrideEvent | null = useMemo(() => {
    if (!formPeriodId) return null;
    return {
      id: "preview-temp",
      day: formDay,
      periodId: formPeriodId,
      cohort: formCohort,
      type: formType,
      customType: formType === "Other" ? formCustomType : undefined,
      title: formTitle || (formType === "Other" && formCustomType ? `${formCustomType} - Event Override` : `${formType} - Event Override`),
      description: formDescription,
      affectedClasses: formAffectedClasses.length ? formAffectedClasses : currentFormPeriodClasses.map(c => c.subject),
      replacementBehavior: formReplacementBehavior,
      notifyUsers: formNotifyUsers
    };
  }, [formDay, formPeriodId, formCohort, formType, formCustomType, formTitle, formDescription, formAffectedClasses, formReplacementBehavior, formNotifyUsers, currentFormPeriodClasses]);

  // Derived periods with overrides applied
  const periods = useMemo(() => {
    return rawPeriods.map((period) => {
      // Inject preview override if we are in proposed comparison preview mode
      if (isPreviewMode && previewCompareMode === "proposed" && previewOverride && previewOverride.day === selectedDay && previewOverride.periodId === period.id && previewOverride.cohort === selectedCohort) {
        return {
          ...period,
          isOverridden: true,
          overrideDetails: previewOverride,
          isPreview: true
        } as TimetablePeriod & { isPreview?: boolean };
      }

      const match = overrides.find(
        (o) => o.day === selectedDay && o.periodId === period.id && o.cohort === selectedCohort
      );
      if (match) {
        return {
          ...period,
          isOverridden: true,
          overrideDetails: match
        };
      }
      return period;
    });
  }, [rawPeriods, overrides, selectedCohort, selectedDay, isPreviewMode, previewCompareMode, previewOverride]);

  // Determine period status (simulation based on Monday)
  const getPeriodState = (periodId: string): "past" | "current" | "future" => {
    if (selectedDay !== "Monday") return "future";
    if (periodId === "p-advisory") return "past";
    if (periodId === "p2") return "current";
    return "future";
  };

  // Pre-populates the wizard when triggering form creation
  const handleTriggerAddEvent = (periodId: string, preselectedClassSubject?: string) => {
    setFormCohort(selectedCohort);
    setFormDay(selectedDay);
    setFormPeriodId(periodId);
    setFormType("Guest Speaker");
    setFormTitle("");
    setFormCustomType("");
    setFormDescription("");
    setFormReplacementBehavior("Replace Classes Entirely");
    setFormNotifyUsers(["Students", "Faculty"]);

    const p = rawPeriods.find((x) => x.id === periodId);
    if (p) {
      const classes = selectedCohort === "dp1" ? p.classes.dp1 : p.classes.dp2;
      const subjects = classes.map((c) => c.subject);
      if (preselectedClassSubject) {
        setFormAffectedClasses([preselectedClassSubject]);
      } else {
        setFormAffectedClasses(subjects);
      }
    } else {
      setFormAffectedClasses([]);
    }
    setShowAddEventModal(true);
  };

  // Trigger Change Room wizard
  const handleTriggerChangeRoom = (periodId: string, cls: DPClass) => {
    setFormCohort(selectedCohort);
    setFormDay(selectedDay);
    setFormPeriodId(periodId);
    setFormType("Room Change");
    setFormTitle(`Room Change: ${cls.subject}`);
    setFormCustomType("");
    setFormDescription(`Relocating ${cls.subject} from ${cls.room} to newly allocated classroom.`);
    setFormAffectedClasses([cls.subject]);
    setFormReplacementBehavior("Alternate Room Assignment");
    setFormNotifyUsers(["Students", "Faculty"]);
    setShowAddEventModal(true);
  };

  // Trigger Assign Substitute Cover wizard
  const handleTriggerAssignCover = (periodId: string, cls: DPClass) => {
    setFormCohort(selectedCohort);
    setFormDay(selectedDay);
    setFormPeriodId(periodId);
    setFormType("Substitute Cover");
    setFormTitle(`Substitute Cover: ${cls.subject}`);
    setFormCustomType("");
    setFormDescription(`Assigning cover supervisor for ${cls.subject} during ${cls.teacher}'s scheduled absence.`);
    setFormAffectedClasses([cls.subject]);
    setFormReplacementBehavior("Assign Cover Supervisor");
    setFormNotifyUsers(["Faculty"]);
    setShowAddEventModal(true);
  };


  // Compute Affected Counts for Confirmation Modal
  const confirmationImpact = useMemo(() => {
    const dayPeriods = getScheduleForDay(formDay);
    const p = dayPeriods.find((x) => x.id === formPeriodId);
    if (!p) return { classes: 0, students: 0, teachers: [] as string[], rooms: 0 };
    const classes = formCohort === "dp1" ? p.classes.dp1 : p.classes.dp2;
    const selectedClassesInfo = classes.filter((c) => formAffectedClasses.includes(c.subject));
    
    const studentsCount = selectedClassesInfo.reduce((sum, c) => sum + c.studentsCount, 0);
    const teachersList = Array.from(new Set(selectedClassesInfo.map((c) => c.teacher)));
    const roomsList = Array.from(new Set(selectedClassesInfo.map((c) => c.room)));

    return {
      classes: selectedClassesInfo.length,
      students: studentsCount,
      teachers: teachersList,
      rooms: roomsList.length
    };
  }, [formDay, formPeriodId, formCohort, formAffectedClasses]);

  // Generate the announcement draft based on override settings
  const generateAnnouncementDraft = () => {
    const periodName = rawPeriods.find(p => p.id === formPeriodId)?.name || formPeriodId;
    const dateStr = formDay;
    const cohortLabel = formCohort === "dp1" ? "DP1 (Grade 11)" : "DP2 (Grade 12)";
    const displayType = formType === "Other" && formCustomType ? formCustomType : formType;
    
    const title = `Schedule Update: ${formTitle || displayType}`;
    
    let body = `Please note that on ${dateStr}, ${periodName} will be replaced by a ${displayType} session ("${formTitle || displayType}").\n\n`;
    
    if (formDescription.trim()) {
      body += `Reason: ${formDescription}\n\n`;
    }
    
    body += `Affected Cohort: ${cohortLabel}\n`;
    body += `Affected Classes: ${formAffectedClasses.join(", ")}\n`;
    body += `Replacement Behavior: ${formReplacementBehavior}\n\n`;
    body += `Please check your updated timeline under the Programme Schedule in your Axis console.`;

    setAnnDraftTitle(title);
    setAnnDraftBody(body);
    setAnnDraftAudience(formCohort === "dp1" ? "aud-dp1" : "aud-dp2");
    
    if (formType === "Emergency Closure") {
      setAnnDraftPriority("emergency");
    } else if (formType === "Guest Speaker" || formType === "TOK Workshop" || formType === "Exam Briefing") {
      setAnnDraftPriority("important");
    } else {
      setAnnDraftPriority("reminder");
    }
  };

  // Save the Override event & Optional Announcement
  const handleConfirmOverride = () => {
    const newOverride: OverrideEvent = {
      id: `override-${Date.now()}`,
      day: formDay,
      periodId: formPeriodId,
      cohort: formCohort,
      type: formType,
      customType: formType === "Other" ? formCustomType : undefined,
      title: formTitle || (formType === "Other" && formCustomType ? `${formCustomType} - Event Override` : `${formType} - Event Override`),
      description: formDescription,
      affectedClasses: formAffectedClasses,
      replacementBehavior: formReplacementBehavior,
      notifyUsers: formNotifyUsers
    };
    setOverrides((prev) => [newOverride, ...prev]);

    if (sendAnnWithOverride) {
      try {
        const saved = window.sessionStorage.getItem("axis-announcements");
        let currentList = [];
        if (saved) {
          currentList = JSON.parse(saved);
        }
        
        const cohortLabel = formCohort === "dp1" ? "DP1 (Grade 11)" : "DP2 (Grade 12)";
        const recipientCount = formCohort === "dp1" ? 142 : 138;
        
        const newAnn = {
          id: `ann-custom-${Date.now()}`,
          title: annDraftTitle,
          body: annDraftBody,
          priority: annDraftPriority,
          audience: [
            { id: annDraftAudience, label: cohortLabel, count: recipientCount }
          ],
          author: {
            name: "Sarah Chen",
            role: "IB DP Coordinator",
            department: "DP Administration",
            initials: "SC"
          },
          postedAt: "Just now",
          postedRelative: "Just now",
          attachments: [],
          pinned: false,
          read: false,
          readCount: 0,
          totalRecipients: recipientCount,
          category: "school-wide" as const,
          contextSuggestions: []
        };
        
        const updatedList = [newAnn, ...currentList];
        window.sessionStorage.setItem("axis-announcements", JSON.stringify(updatedList));
        window.dispatchEvent(new Event("axis-announcements-update"));
      } catch (err) {
        console.error("Failed to publish announcement along with override", err);
      }
    }

    setShowConfirmModal(false);
    setShowAddEventModal(false);
    setShowAnnReviewModal(false);
    setIsPreviewMode(false);
    triggerToast(
      sendAnnWithOverride 
        ? "Timetable override & DP Notice broadcasted successfully." 
        : "Timetable adjusted successfully across all student consoles."
    );
  };

  const getPeriodSubjectsText = (period: TimetablePeriod) => {
    const list = selectedCohort === "dp1" ? period.classes.dp1 : period.classes.dp2;
    if (list.length === 0) return "";
    return list.map((c) => c.subject).join("  ·  ");
  };

  const handlePeriodSelectorChange = (id: string) => {
    setFormPeriodId(id);
    const dayPeriods = getScheduleForDay(formDay);
    const p = dayPeriods.find((x) => x.id === id);
    if (p) {
      const classes = formCohort === "dp1" ? p.classes.dp1 : p.classes.dp2;
      setFormAffectedClasses(classes.map((c) => c.subject));
    } else {
      setFormAffectedClasses([]);
    }
  };

  const updateFormPeriodAndResetClasses = (periodId: string, day: string, cohort: "dp1" | "dp2") => {
    setFormPeriodId(periodId);
    const dayPeriods = getScheduleForDay(day);
    const p = dayPeriods.find((x) => x.id === periodId);
    if (p) {
      const classes = cohort === "dp1" ? p.classes.dp1 : p.classes.dp2;
      setFormAffectedClasses(classes.map((c) => c.subject));
    } else {
      setFormAffectedClasses([]);
    }
  };

  return (
    <div className={`relative rounded-2xl border ${styles.cardBg} p-6 shadow-[0_12px_64px_rgba(0,0,0,0.7)] backdrop-blur-md md:p-8 select-none`}>
      <div className="flex flex-col gap-6">
        
        {/* Timetable Header area */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? "text-black/40" : "text-white/35"}`}>
                IB Programme Coordination
              </span>
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-medium text-cyan-400">Timetable Orchestrator</span>
            </div>
            <h3 className={`text-xl font-medium tracking-tight mt-1 ${isLight ? "text-black" : "text-white"}`}>
              Schedule Center
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* DP Cohort Selection segmented control */}
            <div className={`flex flex-wrap sm:flex-nowrap rounded-xl p-0.5 sm:p-1 border ${
              isLight ? "bg-black/5 border-black/5" : "bg-white/[0.02] border-white/[0.05]"
            }`}>
              <button
                onClick={() => {
                  setSelectedCohort("dp1");
                  setExpandedPeriodId("p2");
                }}
                className={`flex-1 sm:flex-initial text-center px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all ${
                  selectedCohort === "dp1"
                    ? isLight
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#22d3ee] text-black font-extrabold shadow-md"
                    : isLight
                    ? "text-black/55 hover:text-black"
                    : "text-white/40 hover:text-white"
                }`}
              >
                DP1 Cohort
              </button>
              <button
                onClick={() => {
                  setSelectedCohort("dp2");
                  setExpandedPeriodId("p2");
                }}
                className={`flex-1 sm:flex-initial text-center px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all ${
                  selectedCohort === "dp2"
                    ? isLight
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#22d3ee] text-black font-extrabold shadow-md"
                    : isLight
                    ? "text-black/55 hover:text-black"
                    : "text-white/40 hover:text-white"
                }`}
              >
                DP2 Cohort
              </button>
            </div>

            {/* General override CTA */}
            <button
              onClick={() => handleTriggerAddEvent("p3")}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${styles.buttonPrimary}`}
            >
              <span>+ Add Schedule Event</span>
            </button>
          </div>
        </div>

        {isPreviewMode && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`rounded-2xl border p-5 shadow-xl space-y-4 ${
              isLight ? "bg-cyan-50/80 border-cyan-200 text-black" : "bg-cyan-950/20 border-cyan-500/30 text-white"
            }`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Proposed Change Preview</span>
                  <h4 className="text-sm font-bold mt-0.5">
                    {formTitle || (formType === "Other" && formCustomType ? `${formCustomType} - Event Override` : `${formType} - Event Override`)}
                  </h4>
                </div>
              </div>

              {/* Before/After Toggle Switcher */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${isLight ? "text-black/55" : "text-cyan-300/60"}`}>Schedule View:</span>
                <div className={`flex rounded-lg p-0.5 border ${isLight ? "bg-black/5 border-black/5" : "bg-black/45 border-white/[0.05]"}`}>
                  <button
                    type="button"
                    onClick={() => setPreviewCompareMode("current")}
                    className={`px-3 py-1 rounded text-[9.5px] font-extrabold uppercase tracking-wider transition-all ${
                      previewCompareMode === "current"
                        ? isLight ? "bg-white text-black shadow-sm" : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 animate-pulse"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Current (Before)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCompareMode("proposed")}
                    className={`px-3 py-1 rounded text-[9.5px] font-extrabold uppercase tracking-wider transition-all ${
                      previewCompareMode === "proposed"
                        ? isLight ? "bg-white text-black shadow-sm" : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Proposed (After)
                  </button>
                </div>
              </div>
            </div>

            {/* Change Summary Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-1 text-xs">
              <div className={`p-3 rounded-xl border ${isLight ? "bg-white border-cyan-100" : "bg-black/25 border-cyan-950/50"}`}>
                <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/40" : "text-white/40"}`}>Affected Students</span>
                <strong className="text-sm text-cyan-400 font-extrabold">{confirmationImpact.students}</strong>
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? "bg-white border-cyan-100" : "bg-black/25 border-cyan-950/50"}`}>
                <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/40" : "text-white/40"}`}>Affected Classes</span>
                <strong className="text-sm text-cyan-400 font-extrabold">{confirmationImpact.classes}</strong>
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? "bg-white border-cyan-100" : "bg-black/25 border-cyan-950/50"}`}>
                <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/40" : "text-white/40"}`}>Affected Teachers</span>
                <strong className="text-sm text-cyan-400 font-extrabold">{confirmationImpact.teachers.length}</strong>
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? "bg-white border-cyan-100" : "bg-black/25 border-cyan-950/50"}`}>
                <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/40" : "text-white/40"}`}>Periods Modified</span>
                <strong className="text-sm text-cyan-400 font-extrabold">1</strong>
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? "bg-white border-cyan-100" : "bg-black/25 border-cyan-950/50"}`}>
                <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-black/40" : "text-white/40"}`}>Rooms Modified</span>
                <strong className="text-sm text-cyan-400 font-extrabold">{confirmationImpact.rooms}</strong>
              </div>
            </div>

            {/* Context Awareness Section */}
            <div className={`p-3 rounded-xl border text-[10px] leading-relaxed space-y-1 ${
              isLight ? "bg-white border-cyan-100 text-black/70" : "bg-black/15 border-cyan-950/40 text-white/70"
            }`}>
              <span className={`block text-[8px] uppercase tracking-wider font-extrabold ${isLight ? "text-cyan-600" : "text-cyan-400"}`}>Impacted Systems Overview</span>
              <p>
                This override adjusts <strong className={`${isLight ? "text-black font-bold" : "text-white font-bold"}`}>{formAffectedClasses.join(", ")}</strong> courses.
                Upon publication, the Axis platform will automatically trigger:
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-semibold text-cyan-400">
                <span className="flex items-center gap-1">✓ Calendar Synchronization</span>
                <span className="flex items-center gap-1">✓ Attendance Flag Update</span>
                <span className="flex items-center gap-1">✓ Push Notification Alert</span>
                <span className="flex items-center gap-1">✓ Context Engine Invalidation</span>
              </div>
            </div>

            {/* Preview Action Controls */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewMode(false);
                }}
                className={`py-2 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isLight ? "border-black/10 text-black/60 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/5"
                }`}
              >
                Cancel Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewMode(false);
                  setShowAddEventModal(true);
                }}
                className={`py-2 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isLight ? "border-cyan-200 text-cyan-700 hover:bg-cyan-50" : "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                }`}
              >
                ← Edit Details
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sendAnnWithOverride) {
                    generateAnnouncementDraft();
                    setShowAnnReviewModal(true);
                  } else {
                    handleConfirmOverride();
                    setIsPreviewMode(false);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-center transition-all ${styles.buttonPrimary}`}
              >
                Publish Override
              </button>
            </div>
          </motion.div>
        )}

        {/* Day Navigator */}
        <div className={`flex rounded-xl p-1 border select-none ${
          isLight ? "bg-black/5 border-black/5" : "bg-white/[0.02] border-white/[0.05]"
        }`}>
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setExpandedPeriodId("p2"); // Expand Period 2 when switching days
                }}
                className="relative flex-1 py-2.5 text-xs font-semibold tracking-tight text-center rounded-lg focus:outline-none"
              >
                {isSelected && (
                  <motion.div
                    layoutId="coordTimelineDayBG"
                    className={`absolute inset-0 rounded-lg border ${
                      isLight
                        ? "bg-white border-black/[0.04] shadow-sm"
                        : "bg-white/[0.06] border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${
                  isSelected
                    ? isLight
                      ? "text-black"
                      : "text-white font-bold"
                    : isLight
                    ? "text-black/55 hover:text-black"
                    : "text-white/45 hover:text-white/80"
                }`}>
                  {day}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accordion Timetable List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedDay}-${selectedCohort}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {periods.map((period) => {
                const isExpanded = expandedPeriodId === period.id;
                const state = getPeriodState(period.id);
                const cohortClasses = selectedCohort === "dp1" ? period.classes.dp1 : period.classes.dp2;
                const isOverridden = period.isOverridden;
                const override = period.overrideDetails;

                const collapsedSubjectsText = override
                  ? `${override.title} (Schedule Adjusted)`
                  : period.type === "break" || period.type === "lunch"
                  ? period.name
                  : getPeriodSubjectsText(period);

                return (
                  <div
                    key={period.id}
                    onClick={() => setExpandedPeriodId(isExpanded ? null : period.id)}
                    className={`relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer select-none ${
                      period.isPreview
                        ? isLight
                          ? "border-dashed border-blue-500 bg-blue-500/5 shadow-[0_4px_20px_rgba(59,130,246,0.15)] scale-[1.008]"
                          : "border-dashed border-blue-500 bg-blue-500/[0.03] shadow-[0_8px_32px_rgba(59,130,246,0.15)] scale-[1.008]"
                        : state === "past"
                        ? "opacity-50 border-white/[0.02] bg-white/[0.005] hover:opacity-75"
                        : state === "current"
                        ? isOverridden
                          ? "border-cyan-400 bg-cyan-950/15 shadow-[0_8px_32px_rgba(6,182,212,0.15)] scale-[1.008]"
                          : "border-white/20 bg-gradient-to-r from-white/[0.04] to-white/[0.01] shadow-[0_8px_32px_-6px_rgba(0,0,0,0.6)] scale-[1.008]"
                        : isOverridden
                        ? "border-cyan-500/30 bg-cyan-950/5 shadow-md animate-pulse-border"
                        : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"
                    }`}
                  >
                    {/* Active period breathing outer line glow */}
                    {state === "current" && (
                      <motion.div
                        className={`absolute inset-0 pointer-events-none rounded-2xl border ${
                          isOverridden ? "border-cyan-400/40" : "border-white/25"
                        }`}
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                    )}

                    {/* Proposed change preview border glow */}
                    {period.isPreview && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-2xl border border-blue-500/35"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                    )}

                    <div className="flex flex-col md:flex-row md:items-stretch min-h-[80px]">
                      
                      {/* Left side card block */}
                      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <span className={`font-mono text-xs font-semibold ${isLight ? "text-black/50" : "text-white/35"}`}>
                            {period.time}
                          </span>
                          <span className={`text-[10px] ${isLight ? "text-black/30" : "text-white/20"}`}>
                            ({period.durationMin}m)
                          </span>
                          <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            isLight ? "bg-black/5 text-black/60" : "bg-white/[0.05] text-white/55"
                          }`}>
                            {period.name}
                          </span>
                          
                          {period.isPreview ? (
                            <span className="rounded bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[8px] font-extrabold text-blue-400 uppercase tracking-widest leading-none">
                              Proposed Preview Change
                            </span>
                          ) : isOverridden ? (
                            <span className="rounded bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 text-[8px] font-extrabold text-cyan-400 uppercase tracking-widest leading-none">
                              Schedule Adjusted
                            </span>
                          ) : null}
                        </div>

                        {/* Collapsed view subjects dot separation list */}
                        {!isExpanded && (
                          <div className={`text-xs font-medium tracking-tight ${
                            period.isPreview
                              ? "text-blue-400 font-bold"
                              : isOverridden
                              ? "text-cyan-400 font-bold"
                              : isLight
                              ? "text-black/85"
                              : "text-white/80"
                          }`}>
                            {collapsedSubjectsText}
                          </div>
                        )}

                        {/* Active current progression bar */}
                        {state === "current" && (
                          <div className="mt-2 space-y-1.5 pr-6">
                            <div className={`flex items-center justify-between text-[8px] font-semibold uppercase tracking-widest leading-none ${
                              isLight ? "text-black/30" : "text-white/30"
                            }`}>
                              <span>Active Progression</span>
                              <span>~52% Elapsed (42m remaining)</span>
                            </div>
                            <div className={`h-1 w-full rounded-full overflow-hidden ${
                              isLight ? "bg-black/10" : "bg-white/10"
                            }`}>
                              <motion.div
                                className={isLight ? "h-full bg-cyan-600" : "h-full bg-cyan-400"}
                                initial={{ width: "0%" }}
                                animate={{ width: "52%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side status container */}
                      <div className={`w-full md:w-44 shrink-0 border-t md:border-t-0 md:border-l p-5 flex flex-col justify-center items-start md:items-end ${
                        isLight
                          ? "border-black/[0.05] bg-black/[0.005]"
                          : "border-white/[0.05] bg-white/[0.005]"
                      }`}>
                        <span className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${
                          isLight ? "text-black/30" : "text-white/30"
                        }`}>
                          Status
                        </span>
                        <span className={`text-xs font-bold ${
                          period.isPreview
                            ? "text-blue-400"
                            : isOverridden
                            ? "text-cyan-400"
                            : state === "past"
                            ? "text-white/30"
                            : state === "current"
                            ? "text-emerald-400"
                            : isLight
                            ? "text-black/60"
                            : "text-white/60"
                        }`}>
                          {period.isPreview ? "Proposed Preview" : isOverridden ? "Program Override" : state === "current" ? "Active Now" : state === "past" ? "Completed" : "Scheduled"}
                        </span>
                        <span className={`text-[9px] mt-1 ${isLight ? "text-black/45" : "text-white/45"}`}>
                          {period.type === "break" ? "Recess" : period.type === "lunch" ? "Dining" : `${cohortClasses.length} Courses`}
                        </span>
                      </div>
                    </div>

                    {/* Collapsible details layout */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className={`overflow-hidden border-t p-5 space-y-4 cursor-default ${
                            isLight
                              ? "border-black/[0.05] bg-zinc-50/50"
                              : "border-white/[0.05] bg-black/[0.15]"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isOverridden && override ? (
                            // Expanded Override View details
                            <div className={`p-4 rounded-xl border ${
                              period.isPreview
                                ? isLight ? "bg-blue-50/50 border-blue-200/50 text-black" : "bg-blue-950/15 border-blue-800/30 text-white"
                                : isLight ? "bg-cyan-50/50 border-cyan-200/50 text-black" : "bg-cyan-950/15 border-cyan-800/30 text-white"
                            } space-y-3`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className={`text-[9px] font-extrabold uppercase tracking-widest block font-mono ${period.isPreview ? "text-blue-400" : "text-cyan-400"}`}>
                                    {period.isPreview ? "Proposed Preview Override" : "Coordinator Override"}
                                  </span>
                                  <h4 className="text-sm font-bold mt-0.5">{override.title}</h4>
                                  {override.description && <p className={`text-xs mt-1 ${isLight ? "text-black/60" : "text-white/50"}`}>{override.description}</p>}
                                </div>
                                {!period.isPreview && (
                                  <button
                                    onClick={() => {
                                      setOverrides(overrides.filter((o) => o.id !== override.id));
                                      triggerToast("Override event cleared successfully.");
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase transition-all"
                                  >
                                    Delete Override
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-cyan-800/20 text-[10px]">
                                <div>
                                  <span className={`block font-bold uppercase text-[9px] ${isLight ? "text-black/35" : "text-white/30"}`}>Impact Scope</span>
                                  <span className={`font-semibold ${period.isPreview ? "text-blue-400" : "text-cyan-400"}`}>
                                    {override.affectedClasses.length === cohortClasses.length ? "All classes in period" : `${override.affectedClasses.length} selected class(es)`}
                                  </span>
                                </div>
                                <div>
                                  <span className={`block font-bold uppercase text-[9px] ${isLight ? "text-black/35" : "text-white/30"}`}>Replacement Behavior</span>
                                  <span className="font-semibold">{override.replacementBehavior}</span>
                                </div>
                                <div>
                                  <span className={`block font-bold uppercase text-[9px] ${isLight ? "text-black/35" : "text-white/30"}`}>Alert Broadcasts</span>
                                  <span className="font-semibold">{override.notifyUsers.join(", ")}</span>
                                </div>
                              </div>
                            </div>
                          ) : period.type === "break" || period.type === "lunch" ? (
                            <div className={`p-4 text-center text-xs ${isLight ? "text-black/40" : "text-white/35"} font-medium`}>
                              Recess block. No academic courses scheduled.
                            </div>
                          ) : (
                            // Expanded Course Roster Display list
                            <div className="space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? "text-black/40" : "text-white/35"}`}>
                                  Roster & Space Assignments ({cohortClasses.length})
                                </span>
                                <button
                                  onClick={() => handleTriggerAddEvent(period.id)}
                                  className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-3.5 py-1 transition-all ${
                                    isLight
                                      ? "border-black/10 bg-black/[0.02] text-black/75 hover:bg-black/[0.05]"
                                      : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05] hover:text-white"
                                  }`}
                                >
                                  + Create Override Event
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {cohortClasses.map((cls, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-4 rounded-xl border flex flex-col justify-between gap-4 ${
                                      cls.conflict
                                        ? "border-yellow-500/20 bg-yellow-500/[0.02]"
                                        : isLight
                                        ? "border-black/[0.05] bg-white text-black"
                                        : "border-white/[0.04] bg-[#0E0E10]/40 text-white"
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-xs">{cls.subject}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider font-mono border ${
                                          isLight ? "bg-black/5 border-black/10 text-black/60" : "bg-white/5 border-white/10 text-white/50"
                                        }`}>
                                          {selectedCohort.toUpperCase()}
                                        </span>
                                      </div>

                                      <div className={`grid grid-cols-3 gap-2 text-[10px] leading-tight ${isLight ? "text-black/60" : "text-white/50"}`}>
                                        <div>
                                          <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Supervisor</span>
                                          <span className="font-semibold">{cls.teacher}</span>
                                        </div>
                                        <div>
                                          <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Location</span>
                                          <span className="font-mono font-semibold text-cyan-400">{cls.room}</span>
                                        </div>
                                        <div>
                                          <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Roster Size</span>
                                          <span className="font-semibold">{cls.studentsCount} candidates</span>
                                        </div>
                                      </div>

                                      {cls.conflict && (
                                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[9px] text-yellow-400 font-medium">
                                          ⚠️ {cls.conflict}
                                        </div>
                                      )}
                                      {cls.exception && (
                                        <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[9px] text-cyan-400 font-medium">
                                          ℹ {cls.exception}
                                        </div>
                                      )}
                                    </div>

                                    {/* Authority levels Actions */}
                                    <div className={`pt-3 border-t flex flex-wrap gap-1.5 ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                                      <button
                                        onClick={() => handleTriggerChangeRoom(period.id, cls)}
                                        className={`px-2.5 py-1 rounded bg-white/5 border text-[9px] font-bold uppercase transition-all ${
                                          isLight ? "border-black/10 text-black hover:bg-black/5" : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                        }`}
                                      >
                                        Change Room
                                      </button>
                                      <button
                                        onClick={() => handleTriggerAssignCover(period.id, cls)}
                                        className={`px-2.5 py-1 rounded bg-white/5 border text-[9px] font-bold uppercase transition-all ${
                                          isLight ? "border-black/10 text-black hover:bg-black/5" : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                        }`}
                                      >
                                        Assign Substitute
                                      </button>
                                      <button
                                        onClick={() => handleTriggerAddEvent(period.id, cls.subject)}
                                        className={`px-2.5 py-1 rounded bg-white/5 border text-[9px] font-bold uppercase transition-all ${
                                          isLight ? "border-black/10 text-black hover:bg-black/5" : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                        }`}
                                      >
                                        Schedule Exception
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* EVENT OVERRIDE WIZARD DIALOG STEP 1 */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEventModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Wizard Step 1 of 2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Create Timetable Event Override</h3>
                </div>
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${isLight ? "text-black/50 hover:text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Cohort & Day Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Cohort</label>
                    <select
                      value={formCohort}
                      onChange={(e) => {
                        const newCohort = e.target.value as "dp1" | "dp2";
                        setFormCohort(newCohort);
                        updateFormPeriodAndResetClasses(formPeriodId, formDay, newCohort);
                      }}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                      }`}
                    >
                      <option value="dp1">DP Grade 11 (DP1)</option>
                      <option value="dp2">DP Grade 12 (DP2)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Day</label>
                    <select
                      value={formDay}
                      onChange={(e) => {
                        setFormDay(e.target.value);
                        updateFormPeriodAndResetClasses(formPeriodId, e.target.value, formCohort);
                      }}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                      }`}
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Period Selector */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Affected Period</label>
                  <select
                    value={formPeriodId}
                    onChange={(e) => handlePeriodSelectorChange(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                    }`}
                  >
                    {rawPeriods.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.time})</option>
                    ))}
                  </select>
                </div>

                {/* Event Type & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Event Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                      }`}
                    >
                      <option value="Guest Speaker">Guest Speaker Visit</option>
                      <option value="University Fair">University Fair</option>
                      <option value="Assembly">Extended Assembly</option>
                      <option value="Exam Briefing">Exam Briefing</option>
                      <option value="TOK Workshop">TOK Workshop</option>
                      <option value="CAS Event">CAS Event</option>
                      <option value="Emergency Closure">Emergency Closure</option>
                      <option value="Room Change">Room Change</option>
                      <option value="Substitute Cover">Substitute Cover</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Event Title</label>
                    <input
                      type="text"
                      placeholder="e.g. TOK Exhibition Briefing"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 placeholder-black/30" : "bg-black/40 border-white/[0.08] placeholder-white/20"
                      }`}
                    />
                  </div>
                </div>

                {formType === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1.5 ${isLight ? "text-black/40" : "text-white/35"}`}>Custom Event Type</label>
                    <input
                      type="text"
                      placeholder="e.g. University Admissions Workshop"
                      value={formCustomType}
                      onChange={(e) => setFormCustomType(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10 placeholder-black/30" : "bg-black/40 border-white/[0.08] placeholder-white/20"
                      }`}
                    />
                  </motion.div>
                )}

                {/* Details / Description */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Description / Memo Details</label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional instructions or exceptions list..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10 placeholder-black/30" : "bg-black/40 border-white/[0.08] placeholder-white/20"
                    }`}
                  />
                </div>

                {/* Checklist for affected classes */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1.5 ${isLight ? "text-black/40" : "text-white/35"}`}>Select Affected Classes</label>
                  {currentFormPeriodClasses.length === 0 ? (
                    <div className="p-2 border border-dashed rounded text-center opacity-45">No academic courses scheduled in this block.</div>
                  ) : (
                    <div className={`p-3 rounded-lg border max-h-[110px] overflow-y-auto space-y-2 ${
                      isLight ? "bg-zinc-50 border-black/5" : "bg-black/20 border-white/5"
                    }`}>
                      {currentFormPeriodClasses.map((c) => {
                        const isChecked = formAffectedClasses.includes(c.subject);
                        return (
                          <label key={c.subject} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setFormAffectedClasses(formAffectedClasses.filter((x) => x !== c.subject));
                                } else {
                                  setFormAffectedClasses([...formAffectedClasses, c.subject]);
                                }
                              }}
                              className="size-3.5 rounded border border-white/20 bg-transparent text-cyan-400"
                            />
                            <span className="font-semibold text-[11px]">{c.subject} ({c.teacher})</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Replacement Behavior */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Replacement Action Behavior</label>
                  <select
                    value={formReplacementBehavior}
                    onChange={(e) => setFormReplacementBehavior(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                    }`}
                  >
                    <option value="Replace Classes Entirely">Replace Selected Classes Entirely</option>
                    <option value="Merge Sessions">Merge Selected Sessions</option>
                    <option value="Alternate Room Assignment">Alternate Room Assignment</option>
                    <option value="Postpone to Study Block">Postpone to Study Block</option>
                    <option value="Assign Cover Supervisor">Assign Cover Supervisor</option>
                  </select>
                </div>

                {/* Alerts / Broadcast channels */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wide mb-1.5 ${isLight ? "text-black/40" : "text-white/35"}`}>Notification Channels</label>
                  <div className="flex gap-4">
                    {["Students", "Parents", "Faculty"].map((scope) => {
                      const isChecked = formNotifyUsers.includes(scope);
                      return (
                        <label key={scope} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormNotifyUsers(formNotifyUsers.filter((x) => x !== scope));
                              } else {
                                setFormNotifyUsers([...formNotifyUsers, scope]);
                              }
                            }}
                            className="size-3.5 rounded border border-white/20 bg-transparent text-cyan-400"
                          />
                          <span className="font-bold text-[10px] uppercase tracking-wide">{scope}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Send Announcement Checkbox */}
                <div className={`p-3 rounded-xl border mt-1.5 ${
                  isLight ? "bg-cyan-500/5 border-cyan-500/10" : "bg-cyan-500/5 border-cyan-500/15"
                }`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendAnnWithOverride}
                      onChange={(e) => setSendAnnWithOverride(e.target.checked)}
                      className="size-3.5 rounded border border-cyan-500/40 bg-transparent text-cyan-400"
                    />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[10px] text-cyan-400 uppercase tracking-wide">Send Announcement With Override</span>
                      <span className="text-[9px] text-white/40 font-medium mt-0.5">Generate an announcement notice draft for review before publishing.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    isLight ? "border-black/10 text-black/60 hover:text-black" : "border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formTitle.trim()) {
                      triggerToast("Event Title is required to proceed.");
                      return;
                    }
                    if (formAffectedClasses.length === 0 && currentFormPeriodClasses.length > 0) {
                      triggerToast("At least one affected class must be selected.");
                      return;
                    }
                    setShowConfirmModal(false);
                    setShowAddEventModal(false);
                    setIsPreviewMode(true);
                    setPreviewCompareMode("proposed");
                  }}
                  className={`rounded-xl px-5 py-2 text-xs font-bold transition-all uppercase tracking-wider ${styles.buttonPrimary}`}
                >
                  Review Changes →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION LAYER MODAL STEP 2 */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-left flex flex-col gap-4 ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-3 border-white/5">
                <svg className="size-5 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 17.01L12.01 16.998" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Wizard Step 2 of 2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Confirm Schedule Update</h3>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-black/60" : "text-white/60"}`}>
                  Releasing this adjustment triggers a programme-wide schedule update. Please carefully review the calculated impact details below:
                </p>

                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? "bg-zinc-50 border-black/5" : "bg-black/40 border-white/5"
                }`}>
                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Review Change Event</span>
                    <strong className="text-xs text-cyan-400 font-bold">
                      {formTitle || (formType === "Other" && formCustomType ? `${formCustomType} - Event Override` : `${formType} - Event Override`)}
                    </strong>
                    <span className={`block text-[10px] mt-0.5 ${isLight ? "text-black/60" : "text-white/50"}`}>
                      Allocated for {formDay} ({formCohort.toUpperCase()}) during {rawPeriods.find((x) => x.id === formPeriodId)?.name || formPeriodId}.
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 pt-1.5 border-t border-dashed ${isLight ? "border-black/5" : "border-white/5"}`}>
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Event Type</span>
                      <strong className="text-xs text-white">{formType}</strong>
                    </div>
                    {formType === "Other" && (
                      <div>
                        <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Custom Type</span>
                        <strong className="text-xs text-cyan-400 font-bold">{formCustomType || "Not Specified"}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Classes ({confirmationImpact.classes})</span>
                    <p className={`text-[10px] font-semibold mt-0.5 leading-tight ${isLight ? "text-black/75" : "text-white/80"}`}>
                      {formAffectedClasses.join("  ·  ")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Students</span>
                      <strong className="text-xs text-white">{confirmationImpact.students} Candidates</strong>
                    </div>
                    <div>
                      <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Affected Faculty</span>
                      <strong className="text-xs text-white">{confirmationImpact.teachers.length} Subject Leads</strong>
                    </div>
                  </div>

                  <div>
                    <span className={`block text-[8px] uppercase tracking-wider ${isLight ? "text-black/35" : "text-white/30"}`}>Notifications To Be Sent</span>
                    <p className="text-[10px] text-cyan-400/90 font-medium">
                      ⚠️ Instant push notifications and email bulletins will be dispatched immediately to: <strong className="font-bold">{formNotifyUsers.join(", ")}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-white/5 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all text-center ${
                    isLight ? "border-black/10 text-black/65 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  ← Adjust Details
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOverride}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider text-center ${styles.buttonPrimary}`}
                >
                  Confirm Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ANNOUNCEMENT DRAFT REVIEW MODAL */}
      <AnimatePresence>
        {showAnnReviewModal && (
          <div className="fixed inset-0 z-[230] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnnReviewModal(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] text-left flex flex-col gap-4 max-h-[90vh] overflow-y-auto ${
                isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10] border-white/[0.08] text-white"
              }`}
            >
              <div className="flex items-center gap-3 border-b pb-3 border-white/5">
                <svg className="size-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.867.867 0 01-1.186-.327 13.674 13.674 0 01-1.183-3.326m3.504-7.04a24.02 24.02 0 01.135 3.52M21.75 12c0 1.608-.401 3.12-1.104 4.443" />
                </svg>
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Workflow Step 2 of 2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Review Announcement Notice</h3>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-black/60" : "text-white/60"}`}>
                  A draft announcement has been automatically generated for this override. Review, edit the wording, and broadcast it to target groups.
                </p>

                {/* Announcement Title */}
                <div>
                  <label className={`block text-[9px] uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Announcement Title</label>
                  <input
                    type="text"
                    value={annDraftTitle}
                    onChange={(e) => setAnnDraftTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                      isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                    }`}
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className={`block text-[9px] uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Message Content</label>
                  <textarea
                    rows={6}
                    value={annDraftBody}
                    onChange={(e) => setAnnDraftBody(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none font-bold resize-none ${
                      isLight ? "bg-zinc-50 border-black/10" : "bg-[#050506] border-white/[0.08]"
                    }`}
                  />
                </div>

                {/* Target Audience & Importance Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[9px] uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Target Audience</label>
                    <div className={`p-2.5 rounded-lg border font-bold text-[10.5px] ${
                      isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                    }`}>
                      📢 {formCohort === "dp1" ? "DP1 (Grade 11)" : "DP2 (Grade 12)"}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-[9px] uppercase tracking-wide mb-1 ${isLight ? "text-black/40" : "text-white/35"}`}>Priority Level</label>
                    <select
                      value={annDraftPriority}
                      onChange={(e) => setAnnDraftPriority(e.target.value as "info" | "reminder" | "important" | "urgent" | "emergency")}
                      className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                        isLight ? "bg-zinc-50 border-black/10" : "bg-black/40 border-white/[0.08]"
                      }`}
                    >
                      <option value="info">Info</option>
                      <option value="reminder">Reminder</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-white/5 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnReviewModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all text-center ${
                    isLight ? "border-black/10 text-black/65 hover:bg-black/5" : "border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOverride}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider text-center ${styles.buttonPrimary}`}
                >
                  Publish Broadcast & Override
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AMBIENT SUCCESS TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[250] flex items-center gap-3.5 rounded-2xl border px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.9)] max-w-sm ${
              isLight ? "bg-white border-black/[0.08] text-black" : "bg-[#0E0E10]/95 border-cyan-500/20 text-white"
            }`}
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/[0.12] border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
              ✓
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold leading-none">Timetable Synchronized</span>
              <span className={`text-[10px] leading-tight ${isLight ? "text-black/50" : "text-white/45"}`}>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
