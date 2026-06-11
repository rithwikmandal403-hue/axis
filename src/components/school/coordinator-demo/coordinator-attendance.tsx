"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, AXIS_TOKENS, type Theme } from "@/lib/theme-utils";
import { StudentSupportFlag, ACCOMMODATIONS_MAP, type StudentSupportInfo } from "../student-support-context";
import { StudentStatisticsProfile } from "./student-statistics-profile";

type AttendanceStatus = "present" | "absent" | "late" | "medical" | "excused";

type StudentAttendance = {
  id: string;
  name: string;
  avatar: string;
  status: AttendanceStatus;
  deviceSynced: boolean;
  checkInTime: string | null;
};

type ClassInfo = {
  name: string;
  period: string;
  room: string;
  teacher: string;
  attendancePercent: number;
  trends: number[]; // last 5 sessions
  roster: StudentAttendance[];
};

type DayTimetable = {
  [day: string]: ClassInfo[];
};

type GradeData = {
  [grade: string]: DayTimetable;
};

const MOCK_STUDENTS: Record<string, { name: string; avatar: string }> = {
  "std-1": { name: "Chloe Vance", avatar: "CV" },
  "std-2": { name: "Lucas Gray", avatar: "LG" },
  "std-3": { name: "Dilan Patel", avatar: "DP" },
  "std-4": { name: "Emma Watson", avatar: "EW" },
  "std-5": { name: "Sophia Alpin", avatar: "SA" },
  "std-6": { name: "Jin Woo", avatar: "JW" },
  "std-7": { name: "Oliver Queen", avatar: "OQ" },
  "std-8": { name: "Selina Kyle", avatar: "SK" },
  "std-9": { name: "Bruce Wayne", avatar: "BW" },
  "std-10": { name: "Gwen Stacy", avatar: "GS" },
  "std-11": { name: "Miles Morales", avatar: "MM" },
  "std-12": { name: "Peter Parker", avatar: "PP" },
};

function generateRoster(statuses: AttendanceStatus[]): StudentAttendance[] {
  return Object.entries(MOCK_STUDENTS).map(([id, info], idx) => {
    const status = statuses[idx % statuses.length];
    return {
      id,
      name: info.name,
      avatar: info.avatar,
      status,
      deviceSynced: status === "present" || status === "late",
      checkInTime: status === "present" ? "8:25 AM" : status === "late" ? "8:38 AM" : null
    };
  });
}

const ATTENDANCE_DATABASE: GradeData = {
  "DP1": {
    "Monday": [
      { name: "Physics HL", period: "Period 1 (8:30 - 9:30)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 92, trends: [95, 92, 88, 95, 92], roster: generateRoster(["present", "present", "late", "present", "absent", "medical"]) },
      { name: "Chemistry HL", period: "Period 2 (9:35 - 10:35)", room: "Lab 2", teacher: "Ananya Rao", attendancePercent: 95, trends: [100, 95, 95, 92, 95], roster: generateRoster(["present", "present", "present", "excused", "present", "present"]) },
      { name: "Math AA HL", period: "Period 3 (10:50 - 11:50)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 88, trends: [92, 88, 85, 92, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) },
      { name: "English A", period: "Period 4 (11:55 - 12:55)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 100, trends: [100, 100, 95, 100, 100], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "TOK", period: "Period 5 (13:50 - 14:50)", room: "Library", teacher: "Sarah Chen", attendancePercent: 90, trends: [95, 92, 90, 88, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "Visual Arts", period: "Period 6 (15:00 - 16:00)", room: "Art Studio", teacher: "Robert Blake", attendancePercent: 96, trends: [96, 96, 92, 100, 96], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) }
    ],
    "Tuesday": [
      { name: "Biology HL", period: "Period 1 (8:30 - 9:30)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 90, trends: [92, 90, 88, 95, 90], roster: generateRoster(["present", "absent", "present", "present", "present", "excused"]) },
      { name: "German B SL", period: "Period 2 (9:35 - 10:35)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 95, trends: [95, 92, 95, 95, 95], roster: generateRoster(["present", "present", "present", "present", "late", "present"]) },
      { name: "History HL", period: "Period 3 (10:50 - 11:50)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 92, trends: [92, 88, 95, 92, 92], roster: generateRoster(["present", "present", "absent", "present", "present", "present"]) },
      { name: "Math AA HL", period: "Period 4 (11:55 - 12:55)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 88, trends: [92, 90, 85, 88, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) },
      { name: "TOK", period: "Period 5 (13:50 - 14:50)", room: "Library", teacher: "Sarah Chen", attendancePercent: 94, trends: [96, 94, 94, 90, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) }
    ],
    "Wednesday": [
      { name: "Physics HL", period: "Period 1 (8:30 - 9:30)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 95, trends: [92, 95, 92, 95, 95], roster: generateRoster(["present", "present", "present", "present", "late", "present"]) },
      { name: "English A", period: "Period 2 (9:35 - 10:35)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 100, trends: [100, 100, 96, 100, 100], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "Chemistry HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 2", teacher: "Ananya Rao", attendancePercent: 92, trends: [95, 92, 92, 88, 92], roster: generateRoster(["present", "present", "absent", "present", "late", "present"]) },
      { name: "TOK", period: "Period 4 (11:55 - 12:55)", room: "Library", teacher: "Sarah Chen", attendancePercent: 90, trends: [92, 90, 90, 95, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "Extended Essay Seminar", period: "Period 5 (13:50 - 14:50)", room: "Library", teacher: "Sarah Chen", attendancePercent: 85, trends: [88, 85, 90, 85, 85], roster: generateRoster(["present", "absent", "absent", "excused", "present", "medical"]) }
    ],
    "Thursday": [
      { name: "German B SL", period: "Period 1 (8:30 - 9:30)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 92, trends: [95, 92, 92, 92, 92], roster: generateRoster(["present", "present", "present", "absent", "present", "present"]) },
      { name: "History HL", period: "Period 2 (9:35 - 10:35)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 88, trends: [90, 88, 88, 85, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) },
      { name: "Biology HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 94, trends: [96, 94, 90, 94, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "Math AA HL", period: "Period 4 (11:55 - 12:55)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 90, trends: [92, 90, 90, 88, 90], roster: generateRoster(["present", "late", "present", "absent", "present", "present"]) },
      { name: "English A", period: "Period 5 (13:50 - 14:50)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 98, trends: [100, 98, 98, 95, 98], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) }
    ],
    "Friday": [
      { name: "Physics HL", period: "Period 1 (8:30 - 9:30)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 94, trends: [95, 94, 92, 94, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "Chemistry HL", period: "Period 2 (9:35 - 10:35)", room: "Lab 2", teacher: "Ananya Rao", attendancePercent: 96, trends: [98, 96, 96, 92, 96], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "Biology HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 92, trends: [92, 92, 88, 95, 92], roster: generateRoster(["present", "absent", "present", "present", "late", "present"]) },
      { name: "German B SL", period: "Period 4 (11:55 - 12:55)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 90, trends: [92, 90, 90, 88, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "History HL", period: "Period 5 (13:50 - 14:50)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 88, trends: [90, 88, 85, 90, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) }
    ]
  },
  "DP2": {
    "Monday": [
      { name: "Math AA HL", period: "Period 1 (8:30 - 9:30)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 94, trends: [95, 94, 92, 94, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "English A", period: "Period 2 (9:35 - 10:35)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 98, trends: [100, 98, 95, 100, 98], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "Physics HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 90, trends: [92, 90, 88, 95, 90], roster: generateRoster(["present", "absent", "present", "present", "late", "present"]) },
      { name: "Chemistry HL", period: "Period 4 (11:55 - 12:55)", room: "Lab 2", teacher: "Ananya Rao", attendancePercent: 95, trends: [98, 95, 92, 95, 95], roster: generateRoster(["present", "present", "present", "excused", "present", "present"]) },
      { name: "Theory of Knowledge", period: "Period 5 (13:50 - 14:50)", room: "Library", teacher: "Sarah Chen", attendancePercent: 92, trends: [92, 92, 90, 95, 92], roster: generateRoster(["present", "late", "present", "present", "absent", "present"]) }
    ],
    "Tuesday": [
      { name: "German B SL", period: "Period 1 (8:30 - 9:30)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 100, trends: [100, 100, 95, 100, 100], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "Biology HL", period: "Period 2 (9:35 - 10:35)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 92, trends: [95, 92, 88, 95, 92], roster: generateRoster(["present", "present", "late", "present", "absent", "medical"]) },
      { name: "History HL", period: "Period 3 (10:50 - 11:50)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 90, trends: [92, 90, 90, 88, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "Math AA HL", period: "Period 4 (11:55 - 12:55)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 96, trends: [96, 96, 92, 100, 96], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "Theory of Knowledge", period: "Period 5 (13:50 - 14:50)", room: "Library", teacher: "Sarah Chen", attendancePercent: 95, trends: [98, 95, 95, 92, 95], roster: generateRoster(["present", "present", "present", "excused", "present", "present"]) }
    ],
    "Wednesday": [
      { name: "Math AA HL", period: "Period 1 (8:30 - 9:30)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 92, trends: [95, 92, 92, 88, 92], roster: generateRoster(["present", "present", "absent", "present", "late", "present"]) },
      { name: "English A", period: "Period 2 (9:35 - 10:35)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 100, trends: [100, 100, 96, 100, 100], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "Physics HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 90, trends: [92, 90, 90, 95, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "Chemistry HL", period: "Period 4 (11:55 - 12:55)", room: "Lab 2", teacher: "Ananya Rao", attendancePercent: 95, trends: [95, 92, 95, 95, 95], roster: generateRoster(["present", "present", "present", "present", "late", "present"]) }
    ],
    "Thursday": [
      { name: "German B SL", period: "Period 1 (8:30 - 9:30)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 94, trends: [96, 94, 90, 94, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "History HL", period: "Period 2 (9:35 - 10:35)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 90, trends: [92, 90, 90, 88, 90], roster: generateRoster(["present", "late", "present", "absent", "present", "present"]) },
      { name: "Biology HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 98, trends: [100, 98, 98, 95, 98], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "Physics HL", period: "Period 4 (11:55 - 12:55)", room: "Lab 3", teacher: "Aarav Chen", attendancePercent: 92, trends: [95, 92, 92, 92, 92], roster: generateRoster(["present", "present", "present", "absent", "present", "present"]) },
      { name: "English A", period: "Period 5 (13:50 - 14:50)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 88, trends: [90, 88, 88, 85, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) }
    ],
    "Friday": [
      { name: "Math AA HL", period: "Period 1 (8:30 - 9:30)", room: "Room 204", teacher: "Marcus Vance", attendancePercent: 96, trends: [98, 96, 96, 92, 96], roster: generateRoster(["present", "present", "present", "present", "present", "present"]) },
      { name: "English A", period: "Period 2 (9:35 - 10:35)", room: "Room 105", teacher: "Clara Dupont", attendancePercent: 94, trends: [95, 94, 92, 94, 94], roster: generateRoster(["present", "present", "present", "present", "present", "late"]) },
      { name: "Biology HL", period: "Period 3 (10:50 - 11:50)", room: "Lab 1", teacher: "Ananya Rao", attendancePercent: 92, trends: [92, 92, 88, 95, 92], roster: generateRoster(["present", "absent", "present", "present", "late", "present"]) },
      { name: "German B SL", period: "Period 4 (11:55 - 12:55)", room: "Room 108", teacher: "Clara Dupont", attendancePercent: 90, trends: [92, 90, 90, 88, 90], roster: generateRoster(["present", "late", "present", "excused", "absent", "present"]) },
      { name: "History HL", period: "Period 5 (13:50 - 14:50)", room: "Room 202", teacher: "Robert Blake", attendancePercent: 88, trends: [90, 88, 85, 90, 88], roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"]) }
    ]
  }
};

const HOMEROOM_DATABASE: ClassInfo[] = [
  {
    name: "DP1-A Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 101",
    teacher: "Sarah Chen",
    attendancePercent: 94,
    trends: [96, 92, 94, 94, 94],
    roster: generateRoster(["present", "present", "present", "present", "late", "present"])
  },
  {
    name: "DP1-B Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 102",
    teacher: "Aarav Chen",
    attendancePercent: 90,
    trends: [92, 90, 88, 95, 90],
    roster: generateRoster(["present", "absent", "present", "present", "present", "excused"])
  },
  {
    name: "DP2-A Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 201",
    teacher: "Marcus Vance",
    attendancePercent: 96,
    trends: [98, 96, 96, 92, 96],
    roster: generateRoster(["present", "present", "present", "present", "present", "present"])
  },
  {
    name: "DP2-B Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 202",
    teacher: "Robert Blake",
    attendancePercent: 92,
    trends: [92, 92, 88, 95, 92],
    roster: generateRoster(["present", "absent", "present", "present", "late", "present"])
  },
  {
    name: "CP1 Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 103",
    teacher: "Clara Dupont",
    attendancePercent: 95,
    trends: [95, 92, 95, 95, 95],
    roster: generateRoster(["present", "present", "present", "present", "late", "present"])
  },
  {
    name: "CP2 Homeroom",
    period: "Homeroom (8:00 - 8:25)",
    room: "Room 104",
    teacher: "Ananya Rao",
    attendancePercent: 88,
    trends: [92, 88, 85, 92, 88],
    roster: generateRoster(["present", "absent", "late", "absent", "present", "medical"])
  }
];

export function CoordinatorAttendance({ theme }: { theme: Theme }) {
  const [selectedGrade, setSelectedGrade] = useState<"DP1" | "DP2">("DP1");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(0);
  const [selectedHomeroomName, setSelectedHomeroomName] = useState<string | null>(null);
  const [isHomeroomExpanded, setIsHomeroomExpanded] = useState(false);
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [showClassAccommodations, setShowClassAccommodations] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Fetch classes for selected grade and day
  const classesForDay = useMemo(() => {
    return ATTENDANCE_DATABASE[selectedGrade]?.[selectedDay] || [];
  }, [selectedGrade, selectedDay]);

  // Adjust active class index if it goes out of bounds, or return selected homeroom
  const activeClass = useMemo(() => {
    if (selectedHomeroomName) {
      return HOMEROOM_DATABASE.find((hr) => hr.name === selectedHomeroomName) || null;
    }
    if (classesForDay.length === 0) return null;
    const index = selectedClassIndex === null || selectedClassIndex >= classesForDay.length ? 0 : selectedClassIndex;
    return classesForDay[index];
  }, [classesForDay, selectedClassIndex, selectedHomeroomName]);

  const classAccommodations = useMemo(() => {
    if (!activeClass) return [];
    return activeClass.roster
      .map((student) => {
        const info = ACCOMMODATIONS_MAP[student.name];
        if (info && info.planActive) {
          return { student, ...info };
        }
        return null;
      })
      .filter(Boolean) as (StudentSupportInfo & { student: StudentAttendance })[];
  }, [activeClass]);

  // Compute stats for current active class roster
  const stats = useMemo(() => {
    if (!activeClass) return { present: 0, absent: 0, late: 0, medical: 0, excused: 0, total: 0 };
    const roster = activeClass.roster;
    return {
      present: roster.filter((s) => s.status === "present").length,
      absent: roster.filter((s) => s.status === "absent").length,
      late: roster.filter((s) => s.status === "late").length,
      medical: roster.filter((s) => s.status === "medical").length,
      excused: roster.filter((s) => s.status === "excused").length,
      total: roster.length
    };
  }, [activeClass]);

  const styles = getAxisTheme(theme);

  return (
    <div className={`${AXIS_TOKENS.borderRadius.widget} border p-safe-lg ${AXIS_TOKENS.shadows.card} md:p-safe-xl ${styles.cardBg}`}>
      <div className="flex flex-col gap-safe-lg">
        {/* Step 1: Choose DP1 or DP2 */}
        <div className={`flex flex-col gap-safe-md md:flex-row md:items-center md:justify-between border-b pb-4 ${styles.border}`}>
          <div>
            <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block animate-pulse">
              DP Programme Monitoring
            </span>
            <h3 className={`text-xl font-semibold tracking-tight mt-1 ${styles.textPrimary}`}>
              Programme Attendance Oversight
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <span className={`text-[9px] uppercase font-bold tracking-wider mr-1.5 ${styles.textSecondary}`}>
              Cohort:
            </span>
            <div className="flex gap-2">
              {(["DP1", "DP2"] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(grade);
                    setSelectedClassIndex(0);
                    setSelectedHomeroomName(null);
                    setIsHomeroomExpanded(false);
                  }}
                  className={`rounded-xl border px-4 py-1.5 text-xs font-bold transition-all ${
                    selectedGrade === grade
                      ? styles.buttonPrimary
                      : styles.buttonSecondary
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Week Timetable Display */}
        <div className="space-y-2">
          <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
            Timetable Weekly Rhythm
          </span>
          <div className="grid grid-cols-5 gap-2.5">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDay === day;
              const classesCount = ATTENDANCE_DATABASE[selectedGrade]?.[day]?.length || 0;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedClassIndex(0);
                    setSelectedHomeroomName(null);
                    setIsHomeroomExpanded(false);
                  }}
                  className={`rounded-xl border p-3.5 text-left transition-all duration-300 ${
                    isSelected
                      ? styles.buttonPrimary + " scale-[1.01]"
                      : styles.buttonSecondary
                  }`}
                >
                  <span className={`text-xs font-bold block ${isSelected ? (theme === "light" ? "text-white" : "text-black") : styles.textPrimary}`}>
                    {day}
                  </span>
                  <span className={`text-[9px] mt-1 block ${isSelected ? (theme === "light" ? "text-white/80" : "text-black/60") : styles.textSecondary}`}>
                    {classesCount} Scheduled
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Day scheduled classes selection */}
        <div className="space-y-3 pt-2">
          <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
            Classes on {selectedDay} (Select to inspect)
          </span>

          <div className="flex flex-col gap-3">
            {/* Homeroom Collapsible Category Section */}
            <div className={`rounded-xl border ${styles.border} ${styles.inputBg} p-2.5 transition-all`}>
              <button
                type="button"
                onClick={() => setIsHomeroomExpanded(!isHomeroomExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`size-2 rounded-full ${selectedHomeroomName ? "bg-cyan-400 animate-pulse" : "bg-zinc-600"}`} />
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${styles.textPrimary}`}>Homeroom Attendance</span>
                    <span className={`text-[8px] ${styles.textSecondary}`}>Collapsible Dropdown • 6 Groups</span>
                  </div>
                  {selectedHomeroomName && (
                    <span className="ml-2 text-[8px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Active: {selectedHomeroomName.replace(" Homeroom", "")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${styles.textSecondary}`}>
                    {selectedHomeroomName ? "Selected" : "Expand"}
                  </span>
                  <svg
                    className={`size-3.5 transition-transform duration-200 ${styles.textSecondary} ${
                      isHomeroomExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isHomeroomExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3">
                      {["DP1-A", "DP1-B", "DP2-A", "DP2-B", "CP1", "CP2"].map((hrKey) => {
                        const hrFullName = `${hrKey} Homeroom`;
                        const isSelected = selectedHomeroomName === hrFullName;
                        return (
                          <button
                            key={hrKey}
                            type="button"
                            onClick={() => {
                              setSelectedHomeroomName(hrFullName);
                              setSelectedClassIndex(null);
                            }}
                            className={`rounded-xl border px-3 py-2 text-xs font-bold tracking-tight transition-all text-center ${
                              isSelected
                                ? styles.buttonPrimary
                                : styles.buttonSecondary
                            }`}
                          >
                            {hrKey}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Academic period classes */}
            <div className="flex flex-wrap gap-2">
              {classesForDay.map((cls, idx) => {
                const isSelected = selectedClassIndex === idx && !selectedHomeroomName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedClassIndex(idx);
                      setSelectedHomeroomName(null);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-xs font-semibold tracking-tight transition-all text-left flex items-center gap-2 ${
                      isSelected
                        ? styles.buttonPrimary
                        : styles.buttonSecondary
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${isSelected ? (theme === "light" ? "bg-white" : "bg-black") : "bg-cyan-400"}`} />
                    <div className="flex flex-col">
                      <span className="font-bold">{cls.name}</span>
                      <span className={`text-[8px] leading-none mt-0.5 ${isSelected ? (theme === "light" ? "text-white/70" : "text-black/60") : styles.textSecondary}`}>{cls.period.split(" ")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Attendance details and statistics */}
        <AnimatePresence mode="wait">
          {activeClass && (
            <motion.div
              key={`${selectedGrade}-${selectedDay}-${selectedClassIndex}-${selectedHomeroomName}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t ${styles.border}`}
            >
              {/* Class Stats Column */}
              <div className={`rounded-xl border p-5 flex flex-col justify-between ${styles.plansBg}`}>
                <div>
                  <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                    Class Sync & Oversight
                  </span>
                  <h4 className={`text-base font-bold mt-1 ${styles.textPrimary}`}>
                    {activeClass.name}
                  </h4>
                  <div className={`text-xs mt-1 space-y-1 ${styles.textSecondary}`}>
                    <p>Instructor: <strong className={styles.textPrimary}>{activeClass.teacher}</strong></p>
                    <p>Facility Room: <strong className={styles.textPrimary}>{activeClass.room}</strong></p>
                    <p>Rhythm Schedule: <strong className={styles.textPrimary}>{activeClass.period}</strong></p>
                  </div>
                </div>

                <div className={`my-5 border-t ${styles.border} pt-4 flex flex-col justify-center items-center text-center`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${styles.textSecondary}`}>
                    Attendance Rate
                  </span>
                  <p className={`text-4xl font-extrabold mt-1 tracking-tightest ${styles.textPrimary}`}>
                    {activeClass.attendancePercent}%
                  </p>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/[0.08] px-2 py-0.5 rounded-full border border-emerald-500/10 mt-1 font-semibold">
                    Healthy Cohort
                  </span>
                </div>

                <div className={`space-y-3 pt-3 border-t ${styles.border}`}>
                  <div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
                      Presence Summary ({stats.total} candidates)
                    </span>
                    <div className="grid grid-cols-5 gap-1 mt-2 text-center text-[10px] font-bold">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 rounded">
                        <span>{stats.present}</span>
                        <span className="text-[7px] block uppercase opacity-60">Prs</span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-1 rounded">
                        <span>{stats.late}</span>
                        <span className="text-[7px] block uppercase opacity-60">Lat</span>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-1 rounded">
                        <span>{stats.absent}</span>
                        <span className="text-[7px] block uppercase opacity-60">Abs</span>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-1 rounded">
                        <span>{stats.medical}</span>
                        <span className="text-[7px] block uppercase opacity-60">Med</span>
                      </div>
                      <div className="bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 p-1 rounded">
                        <span>{stats.excused}</span>
                        <span className="text-[7px] block uppercase opacity-60">Exd</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
                      Recent Attendance Trends
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      {activeClass.trends.map((t, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className={`w-full h-6 rounded relative overflow-hidden flex items-end ${styles.inputBg}`}>
                            <div className="w-full bg-cyan-400/35" style={{ height: `${t}%` }} />
                          </div>
                          <span className={`text-[8px] mt-1 ${styles.textSecondary}`}>{t}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[8px] font-semibold text-cyan-400 bg-cyan-500/[0.05] p-2 rounded-lg border border-cyan-500/10 animate-pulse">
                    <span className="tracking-wider uppercase">READ-ONLY OVERSIGHT MODE</span>
                    <span className="opacity-70">TIMELINE LIVE</span>
                  </div>

                  {/* Access Arrangements Overview Block */}
                  {classAccommodations.length > 0 && (
                    <div className={`pt-3 border-t ${styles.border} space-y-2`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
                          Access Arrangements ({classAccommodations.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowClassAccommodations(!showClassAccommodations)}
                          className="text-[8px] uppercase tracking-wider font-extrabold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          {showClassAccommodations ? "[Collapse]" : "[Expand]"}
                        </button>
                      </div>
                      {showClassAccommodations && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {classAccommodations.map(({ student, provisions, status }) => (
                            <div key={student.id} className="p-2 rounded bg-white/[0.02] border border-white/5 space-y-1 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${styles.textPrimary} flex items-center`}>
                                  {student.name}
                                  <StudentSupportFlag studentName={student.name} onViewProfile={() => setProfileStudentId(student.name === "Chloe Vance" ? "std-1" : "std-4")} />
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase border ${
                                  status === "Verified by IB"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {status.split(" ")[0]}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {provisions.map((p: string) => (
                                  <span key={p} className="px-1 py-0.2 rounded bg-cyan-500/5 text-cyan-300/80 border border-cyan-500/10 text-[8px] font-medium">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Roster Ledger Table Column */}
              <div className={`lg:col-span-2 rounded-xl border p-5 ${styles.plansBg}`}>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest block ${styles.textSecondary}`}>
                  Candidate Attendance Ledger
                </span>
                
                <div className="overflow-y-auto max-h-[360px] pr-1 mt-4 scrollbar-none">
                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className={`border-b text-[9px] uppercase tracking-wider ${styles.border} ${styles.textSecondary} opacity-60`}>
                        <th className="pb-3 pl-2">Student</th>
                        <th className="pb-3 text-center">System Sync</th>
                        <th className="pb-3 text-center">Verified Check-in</th>
                        <th className="pb-3 text-right">Roster Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeClass.roster.map((student) => (
                        <tr key={student.id} className={`border-b hover:transition-all ${styles.border} hover:bg-white/[0.01]`}>
                          <td className="py-3 pl-2 flex items-center gap-3">
                            <div className={`flex size-7 items-center justify-center rounded-full text-[10px] font-bold ${styles.inputBg}`}>
                              {student.avatar}
                            </div>
                            <span className={`text-xs font-semibold ${styles.textPrimary} flex items-center`}>
                              {student.name}
                              <StudentSupportFlag studentName={student.name} onViewProfile={() => setProfileStudentId(student.name === "Chloe Vance" ? "std-1" : student.name === "Lucas Gray" ? "std-4" : null)} />
                            </span>
                          </td>
                          <td className="py-3 text-center text-xs">
                            <span className={`inline-block size-1.5 rounded-full ${student.deviceSynced ? "bg-cyan-400" : "bg-white/10"}`} />
                          </td>
                          <td className="py-3 text-center text-xs font-medium text-zinc-400">
                            {student.checkInTime ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                student.status === "present"
                                  ? "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20"
                                  : "text-amber-400 bg-amber-500/[0.08] border-amber-500/20"
                              }`}>
                                {student.checkInTime}
                              </span>
                            ) : (
                              <span className={`text-[10px] ${styles.textSecondary} opacity-40`}>--</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className={`inline-flex rounded-lg border p-0.5 select-none pointer-events-none ${styles.border} ${styles.inputBg}`}>
                              {(["present", "absent", "late", "medical", "excused"] as const).map((status) => {
                                const isSelected = student.status === status;
                                return (
                                  <span
                                    key={status}
                                    className={`rounded px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                      isSelected
                                        ? status === "present"
                                          ? "bg-emerald-500/20 text-emerald-400"
                                          : status === "late"
                                          ? "bg-amber-500/20 text-amber-400"
                                          : status === "absent"
                                          ? "bg-red-500/20 text-red-400"
                                          : status === "medical"
                                          ? "bg-blue-500/20 text-blue-400"
                                          : "bg-zinc-500/20 text-zinc-400"
                                        : "text-white/10"
                                    }`}
                                  >
                                    {status.slice(0, 3)}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coordinator Slide-Over Support Profile Drawer */}
      <AnimatePresence>
        {profileStudentId && (
          <div className="fixed inset-0 z-[150] flex justify-end text-left normal-case">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setProfileStudentId(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-2xl bg-zinc-950 border-l border-white/10 p-6 overflow-y-auto shadow-2xl"
            >
              <StudentStatisticsProfile
                theme="axis"
                selectedStudentId={profileStudentId}
                isTeacher={false}
                onBack={() => setProfileStudentId(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
