"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentStatsData {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  homeroom: string;
  advisor: string;
  program: string;
  gpa: string;
  predictedGrade: string;
  attendanceRate: string;
  avatarColor: string;
  medicalBadges: string[];
  medicalDetails: {
    conditions: string[];
    allergies: string[];
    emergencyContact: string;
    emergencyPhone: string;
    medication: string[];
    notes: string;
  };
  accommodations: {
    status: string;
    statusColor: string;
    verifiedAccommodations: string[];
    learningSupport: string[];
  };
}

const STATS_DATABASE: StudentStatsData[] = [
  {
    id: "std-1",
    name: "Chloe Vance",
    avatar: "CV",
    grade: "Grade 11-B",
    homeroom: "Homeroom 11-F",
    advisor: "Aarav Chen",
    program: "dp",
    gpa: "3.85",
    predictedGrade: "38 / 45",
    attendanceRate: "97.4%",
    avatarColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
    medicalBadges: ["ADHD (IB Verified)", "Extra Time Approved", "Peanut Allergy", "Asthma", "Learning Support Plan"],
    medicalDetails: {
      conditions: ["Mild Asthma", "ADHD (Verified)"],
      allergies: ["Peanut Allergy", "Penicillin Allergy"],
      emergencyContact: "Elena Vance (Mother)",
      emergencyPhone: "+1 (555) 012-9845",
      medication: ["Albuterol Inhaler (Carry-on)", "Focus Medicine (Morning)"],
      notes: "Asthma triggered by intense physical activities. Inhaler kept in backpack."
    },
    accommodations: {
      status: "IB Verified",
      statusColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      verifiedAccommodations: ["Extra Time (25%)", "Separate Room"],
      learningSupport: ["Anxiety Support Plan"]
    }
  },
  {
    id: "std-2",
    name: "Lucas Gray",
    avatar: "LG",
    grade: "Grade 11-B",
    homeroom: "Homeroom 11-F",
    advisor: "Ananya Rao",
    program: "dp",
    gpa: "3.20",
    predictedGrade: "32 / 45",
    attendanceRate: "91.2%",
    avatarColor: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    medicalBadges: ["Pollen Allergy", "Rest Breaks Approved", "Learning Support Plan", "Fever Watch"],
    medicalDetails: {
      conditions: ["Fever tendencies", "Seasonal Allergies"],
      allergies: ["Pollen Allergy"],
      emergencyContact: "Robert Gray (Father)",
      emergencyPhone: "+1 (555) 234-9082",
      medication: ["Claritin (Seasonal)"],
      notes: "Severe fever episodes check. Rest cycle suggested."
    },
    accommodations: {
      status: "School Verified",
      statusColor: "text-blue-400 border-blue-500/20 bg-blue-500/5",
      verifiedAccommodations: ["Rest Breaks (10 mins)"],
      learningSupport: ["Learning Support Plan (Math focus)"]
    }
  },
  {
    id: "std-5",
    name: "Bruce Wayne",
    avatar: "BW",
    grade: "Grade 12-A",
    homeroom: "Homeroom 12-H",
    advisor: "Marcus Vance",
    program: "dp",
    gpa: "4.00",
    predictedGrade: "44 / 45",
    attendanceRate: "99.1%",
    avatarColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    medicalBadges: ["No Medical Conditions", "Verified Athletic Fit", "High Resilience"],
    medicalDetails: {
      conditions: ["None"],
      allergies: ["None"],
      emergencyContact: "Alfred Pennyworth (Guardian)",
      emergencyPhone: "+1 (555) 900-1939",
      medication: ["None"],
      notes: "Physical endurance is exceptional. Fits overall physical training profile."
    },
    accommodations: {
      status: "IB Verified",
      statusColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      verifiedAccommodations: ["None"],
      learningSupport: ["None"]
    }
  }
];

// Interactive data map for Month, Term, Year, and Multi-Year
interface SubjectTrendPoint {
  period: string;
  grade: number;
  classAvg: number;
  milestone?: { label: string; type: string; score: string; date: string };
}

const DYNAMIC_TIMEFRAME_DATA: Record<
  string, // Student ID
  Record<
    "month" | "term" | "year" | "multi", // Timeframe
    {
      labels: string[];
      overviewAvg: number[];
      subjects: Record<string, SubjectTrendPoint[]>;
    }
  >
> = {
  "std-1": {
    month: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      overviewAvg: [5.4, 5.5, 5.5, 5.6],
      subjects: {
        "Physics HL": [
          { period: "W1", grade: 5.0, classAvg: 5.1, milestone: { label: "Physics Unit Quiz 1", type: "Unit Test", score: "5 / 7", date: "May 2" } },
          { period: "W2", grade: 5.0, classAvg: 5.2 },
          { period: "W3", grade: 5.2, classAvg: 5.2, milestone: { label: "Physics IA Draft Submit", type: "IA Milestone", score: "5.5 / 7", date: "May 18" } },
          { period: "W4", grade: 5.2, classAvg: 5.2 }
        ],
        "Math AA HL": [
          { period: "W1", grade: 6.0, classAvg: 6.2 },
          { period: "W2", grade: 6.0, classAvg: 6.2, milestone: { label: "Calculus Support Quiz", type: "Formative", score: "6 / 7", date: "May 8" } },
          { period: "W3", grade: 6.1, classAvg: 6.1 },
          { period: "W4", grade: 6.2, classAvg: 6.1 }
        ],
        "Chemistry HL": [
          { period: "W1", grade: 5.5, classAvg: 5.5 },
          { period: "W2", grade: 5.5, classAvg: 5.4 },
          { period: "W3", grade: 5.5, classAvg: 5.5 },
          { period: "W4", grade: 5.6, classAvg: 5.5, milestone: { label: "Chem Lab Checklist", type: "Practical", score: "6 / 7", date: "May 26" } }
        ]
      }
    },
    term: {
      labels: ["Term 1", "Term 2", "Term 3"],
      overviewAvg: [5.2, 5.5, 5.7],
      subjects: {
        "Physics HL": [
          { period: "Term 1", grade: 4.8, classAvg: 5.0, milestone: { label: "Semester 1 Exam", type: "Summative", score: "5 / 7", date: "Oct 12" } },
          { period: "Term 2", grade: 5.0, classAvg: 5.1, milestone: { label: "Physics Mock Exam 1", type: "Mock Exam", score: "5 / 7", date: "Feb 18" } },
          { period: "Term 3", grade: 5.5, classAvg: 5.2, milestone: { label: "Physics final IA Check", type: "IA Milestone", score: "6 / 7", date: "May 2" } }
        ],
        "Math AA HL": [
          { period: "Term 1", grade: 5.8, classAvg: 6.0 },
          { period: "Term 2", grade: 6.0, classAvg: 6.1, milestone: { label: "Math Semester Exam", type: "Summative", score: "6 / 7", date: "Feb 22" } },
          { period: "Term 3", grade: 6.2, classAvg: 6.2 }
        ],
        "Chemistry HL": [
          { period: "Term 1", grade: 5.2, classAvg: 5.4 },
          { period: "Term 2", grade: 5.4, classAvg: 5.5 },
          { period: "Term 3", grade: 5.5, classAvg: 5.5, milestone: { label: "Group 4 IA Moderation", type: "IA Milestone", score: "5.5 / 7", date: "May 10" } }
        ]
      }
    },
    year: {
      labels: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
      overviewAvg: [5.1, 5.3, 5.5, 5.6],
      subjects: {
        "Physics HL": [
          { period: "Q1", grade: 4.5, classAvg: 4.8 },
          { period: "Q2", grade: 4.8, classAvg: 5.0 },
          { period: "Q3", grade: 5.1, classAvg: 5.1 },
          { period: "Q4", grade: 5.4, classAvg: 5.2, milestone: { label: "Final Portfolio Grade", type: "Summative", score: "6 / 7", date: "May 25" } }
        ],
        "Math AA HL": [
          { period: "Q1", grade: 5.6, classAvg: 5.9 },
          { period: "Q2", grade: 5.8, classAvg: 6.0 },
          { period: "Q3", grade: 6.0, classAvg: 6.1 },
          { period: "Q4", grade: 6.2, classAvg: 6.2 }
        ],
        "Chemistry HL": [
          { period: "Q1", grade: 5.0, classAvg: 5.3 },
          { period: "Q2", grade: 5.3, classAvg: 5.4 },
          { period: "Q3", grade: 5.5, classAvg: 5.5 },
          { period: "Q4", grade: 5.6, classAvg: 5.5 }
        ]
      }
    },
    multi: {
      labels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      overviewAvg: [4.9, 5.2, 5.6, 5.85],
      subjects: {
        "Physics HL": [
          { period: "Gr 9", grade: 4.2, classAvg: 4.5 },
          { period: "Gr 10", grade: 4.6, classAvg: 4.8 },
          { period: "Gr 11", grade: 5.2, classAvg: 5.1 },
          { period: "Gr 12", grade: 5.5, classAvg: 5.3 }
        ],
        "Math AA HL": [
          { period: "Gr 9", grade: 5.0, classAvg: 5.5 },
          { period: "Gr 10", grade: 5.5, classAvg: 5.8 },
          { period: "Gr 11", grade: 6.0, classAvg: 6.0 },
          { period: "Gr 12", grade: 6.3, classAvg: 6.2 }
        ],
        "Chemistry HL": [
          { period: "Gr 9", grade: 4.5, classAvg: 5.0 },
          { period: "Gr 10", grade: 5.0, classAvg: 5.2 },
          { period: "Gr 11", grade: 5.4, classAvg: 5.4 },
          { period: "Gr 12", grade: 5.6, classAvg: 5.5 }
        ]
      }
    }
  },
  "std-2": {
    month: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      overviewAvg: [4.4, 4.3, 4.2, 4.2],
      subjects: {
        "Chemistry HL": [
          { period: "W1", grade: 4.0, classAvg: 5.5, milestone: { label: "Chem Lab Safety Test", type: "Formative", score: "4 / 7", date: "May 3" } },
          { period: "W2", grade: 4.0, classAvg: 5.4 },
          { period: "W3", grade: 4.1, classAvg: 5.5 },
          { period: "W4", grade: 4.0, classAvg: 5.5 }
        ],
        "Math AA HL": [
          { period: "W1", grade: 5.0, classAvg: 6.2 },
          { period: "W2", grade: 5.0, classAvg: 6.1 },
          { period: "W3", grade: 5.1, classAvg: 6.2 },
          { period: "W4", grade: 5.0, classAvg: 6.2 }
        ],
        "Physics SL": [
          { period: "W1", grade: 4.2, classAvg: 5.1 },
          { period: "W2", grade: 4.2, classAvg: 5.0 },
          { period: "W3", grade: 4.3, classAvg: 5.1 },
          { period: "W4", grade: 4.1, classAvg: 5.1 }
        ]
      }
    },
    term: {
      labels: ["Term 1", "Term 2", "Term 3"],
      overviewAvg: [4.6, 4.4, 4.3],
      subjects: {
        "Chemistry HL": [
          { period: "Term 1", grade: 4.2, classAvg: 5.5, milestone: { label: "T1 Summative", score: "4 / 7", type: "Summative", date: "Oct 18" } },
          { period: "Term 2", grade: 4.1, classAvg: 5.4, milestone: { label: "Chemistry Mock Exam 1", score: "4 / 7", type: "Mock Exam", date: "Feb 22" } },
          { period: "Term 3", grade: 4.0, classAvg: 5.5, milestone: { label: "Chemistry Semester Exam", score: "4 / 7", type: "Summative", date: "Apr 29" } }
        ],
        "Math AA HL": [
          { period: "Term 1", grade: 5.2, classAvg: 6.2 },
          { period: "Term 2", grade: 5.0, classAvg: 6.1 },
          { period: "Term 3", grade: 5.0, classAvg: 6.2 }
        ],
        "Physics SL": [
          { period: "Term 1", grade: 4.5, classAvg: 5.1 },
          { period: "Term 2", grade: 4.3, classAvg: 5.0 },
          { period: "Term 3", grade: 4.1, classAvg: 5.1 }
        ]
      }
    },
    year: {
      labels: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
      overviewAvg: [4.6, 4.5, 4.4, 4.3],
      subjects: {
        "Chemistry HL": [
          { period: "Q1", grade: 4.3, classAvg: 5.5 },
          { period: "Q2", grade: 4.2, classAvg: 5.4 },
          { period: "Q3", grade: 4.1, classAvg: 5.5 },
          { period: "Q4", grade: 4.0, classAvg: 5.5 }
        ],
        "Math AA HL": [
          { period: "Q1", grade: 5.2, classAvg: 6.2 },
          { period: "Q2", grade: 5.1, classAvg: 6.1 },
          { period: "Q3", grade: 5.0, classAvg: 6.2 },
          { period: "Q4", grade: 5.0, classAvg: 6.2 }
        ],
        "Physics SL": [
          { period: "Q1", grade: 4.5, classAvg: 5.1 },
          { period: "Q2", grade: 4.4, classAvg: 5.0 },
          { period: "Q3", grade: 4.3, classAvg: 5.1 },
          { period: "Q4", grade: 4.1, classAvg: 5.1 }
        ]
      }
    },
    multi: {
      labels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      overviewAvg: [4.1, 4.3, 4.4, 4.5],
      subjects: {
        "Chemistry HL": [
          { period: "Gr 9", grade: 3.8, classAvg: 5.0 },
          { period: "Gr 10", grade: 4.0, classAvg: 5.2 },
          { period: "Gr 11", grade: 4.2, classAvg: 5.4 },
          { period: "Gr 12", grade: 4.3, classAvg: 5.5 }
        ],
        "Math AA HL": [
          { period: "Gr 9", grade: 4.5, classAvg: 5.5 },
          { period: "Gr 10", grade: 4.8, classAvg: 5.8 },
          { period: "Gr 11", grade: 5.1, classAvg: 6.0 },
          { period: "Gr 12", grade: 5.2, classAvg: 6.1 }
        ],
        "Physics SL": [
          { period: "Gr 9", grade: 4.0, classAvg: 4.8 },
          { period: "Gr 10", grade: 4.2, classAvg: 5.0 },
          { period: "Gr 11", grade: 4.3, classAvg: 5.1 },
          { period: "Gr 12", grade: 4.4, classAvg: 5.1 }
        ]
      }
    }
  },
  "std-5": {
    month: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      overviewAvg: [6.8, 6.9, 7.0, 7.0],
      subjects: {
        "Advanced Calculus": [
          { period: "W1", grade: 6.9, classAvg: 6.0, milestone: { label: "Calculus Exam 1", type: "Unit Test", score: "7 / 7", date: "Jan 15" } },
          { period: "W2", grade: 7.0, classAvg: 6.1 },
          { period: "W3", grade: 7.0, classAvg: 6.0 },
          { period: "W4", grade: 7.0, classAvg: 6.0 }
        ],
        "Physics HL": [
          { period: "W1", grade: 6.8, classAvg: 5.1 },
          { period: "W2", grade: 6.9, classAvg: 5.2 },
          { period: "W3", grade: 7.0, classAvg: 5.2 },
          { period: "W4", grade: 7.0, classAvg: 5.1 }
        ],
        "Economics HL": [
          { period: "W1", grade: 6.8, classAvg: 5.9 },
          { period: "W2", grade: 6.9, classAvg: 5.9 },
          { period: "W3", grade: 7.0, classAvg: 5.8 },
          { period: "W4", grade: 7.0, classAvg: 5.9 }
        ]
      }
    },
    term: {
      labels: ["Term 1", "Term 2", "Term 3"],
      overviewAvg: [6.8, 6.9, 7.0],
      subjects: {
        "Advanced Calculus": [
          { period: "Term 1", grade: 6.8, classAvg: 6.0 },
          { period: "Term 2", grade: 6.9, classAvg: 6.1 },
          { period: "Term 3", grade: 7.0, classAvg: 6.0 }
        ],
        "Physics HL": [
          { period: "Term 1", grade: 6.7, classAvg: 5.1, milestone: { label: "Physics Mock Exam 1", type: "Mock Exam", score: "7 / 7", date: "Feb 18" } },
          { period: "Term 2", grade: 6.9, classAvg: 5.2 },
          { period: "Term 3", grade: 7.0, classAvg: 5.1 }
        ],
        "Economics HL": [
          { period: "Term 1", grade: 6.7, classAvg: 5.9 },
          { period: "Term 2", grade: 6.8, classAvg: 5.9, milestone: { label: "Economics IA Final", type: "IA Milestone", score: "7 / 7", date: "Mar 22" } },
          { period: "Term 3", grade: 7.0, classAvg: 5.8 }
        ]
      }
    },
    year: {
      labels: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"],
      overviewAvg: [6.7, 6.8, 6.9, 7.0],
      subjects: {
        "Advanced Calculus": [
          { period: "Q1", grade: 6.8, classAvg: 6.0 },
          { period: "Q2", grade: 6.8, classAvg: 6.1 },
          { period: "Q3", grade: 6.9, classAvg: 6.0 },
          { period: "Q4", grade: 7.0, classAvg: 6.0 }
        ],
        "Physics HL": [
          { period: "Q1", grade: 6.6, classAvg: 5.1 },
          { period: "Q2", grade: 6.8, classAvg: 5.2 },
          { period: "Q3", grade: 6.9, classAvg: 5.1 },
          { period: "Q4", grade: 7.0, classAvg: 5.1 }
        ],
        "Economics HL": [
          { period: "Q1", grade: 6.6, classAvg: 5.9 },
          { period: "Q2", grade: 6.7, classAvg: 5.9 },
          { period: "Q3", grade: 6.9, classAvg: 5.8 },
          { period: "Q4", grade: 7.0, classAvg: 5.9 }
        ]
      }
    },
    multi: {
      labels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      overviewAvg: [6.5, 6.7, 6.9, 7.0],
      subjects: {
        "Advanced Calculus": [
          { period: "Gr 9", grade: 6.4, classAvg: 5.8 },
          { period: "Gr 10", grade: 6.6, classAvg: 5.9 },
          { period: "Gr 11", grade: 6.8, classAvg: 6.0 },
          { period: "Gr 12", grade: 7.0, classAvg: 6.0 }
        ],
        "Physics HL": [
          { period: "Gr 9", grade: 6.2, classAvg: 5.0 },
          { period: "Gr 10", grade: 6.5, classAvg: 5.1 },
          { period: "Gr 11", grade: 6.8, classAvg: 5.2 },
          { period: "Gr 12", grade: 7.0, classAvg: 5.1 }
        ],
        "Economics HL": [
          { period: "Gr 9", grade: 6.3, classAvg: 5.7 },
          { period: "Gr 10", grade: 6.5, classAvg: 5.8 },
          { period: "Gr 11", grade: 6.8, classAvg: 5.9 },
          { period: "Gr 12", grade: 7.0, classAvg: 5.9 }
        ]
      }
    }
  }
};

export function StudentStatisticsProfile({
  theme,
  selectedStudentId,
  onBack
}: {
  theme: string;
  selectedStudentId?: string | null;
  onBack?: () => void;
}) {
  const activeStudentId = selectedStudentId || "std-1";
  const [timeframe, setTimeframe] = useState<"month" | "term" | "year" | "multi">("term");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  // States for assessment tooltips
  const [hoveredMarker, setHoveredMarker] = useState<{ label: string; type: string; score: string; date: string } | null>(null);
  const [hoveredMarkerCoords, setHoveredMarkerCoords] = useState<{ x: number; y: number } | null>(null);

  const activeStudent = useMemo(() => {
    return STATS_DATABASE.find((s) => s.id === activeStudentId) || STATS_DATABASE[0];
  }, [activeStudentId]);

  const styling = useMemo(() => {
    return (
      {
        dark: {
          panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
          card: "bg-zinc-900/60 border-zinc-800",
          border: "border-white/[0.06]",
          textMuted: "text-white/40",
          textPrimary: "text-white/90"
        },
        light: {
          panelBg: "bg-white border-zinc-200 shadow-sm",
          card: "bg-white border-zinc-200 shadow-sm",
          border: "border-black/[0.08]",
          textMuted: "text-black/50",
          textPrimary: "text-zinc-900"
        },
        axis: {
          panelBg: "bg-[#121417]/90 border-white/[0.08]",
          card: "bg-[#0A0D14]/80 border-cyan-950/80 backdrop-blur-xl",
          border: "border-white/[0.08]",
          textMuted: "text-white/35",
          textPrimary: "text-cyan-50"
        }
      }[theme] || {
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        card: "bg-zinc-900/60 border-zinc-800",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90"
      }
    );
  }, [theme]);

  // Load genuinely different datasets dynamically based on student ID & timeframe
  const timeframeDataset = useMemo(() => {
    const studentData = DYNAMIC_TIMEFRAME_DATA[activeStudent.id] || DYNAMIC_TIMEFRAME_DATA["std-1"];
    return studentData[timeframe];
  }, [activeStudent.id, timeframe]);

  return (
    <div className="space-y-6">
      
      {/* ─── ACCESS FLOW BACK ACTION ────────────────────────────────────────── */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-black text-cyan-400 hover:text-white transition-colors"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Directory
        </button>
      )}

      {/* ─── LEVEL 1: OVERVIEW CARD (IDENTITY, MEDICAL BADGES & SNAPSHOTS) ───── */}
      <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-5`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className={`size-16 rounded-2xl flex items-center justify-center text-2xl font-black border ${activeStudent.avatarColor} shrink-0`}>
              {activeStudent.avatar}
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight text-white">{activeStudent.name}</h2>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold block font-mono">
                IB {activeStudent.program.toUpperCase()} Candidate
              </span>
              <p className="text-[10.5px] text-white/40 font-medium">
                Advisor: <strong className="text-white/80">{activeStudent.advisor}</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3 text-center">
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
              <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold">GPA</span>
              <strong className="text-sm text-cyan-400 block mt-0.5 font-mono">{activeStudent.gpa}</strong>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
              <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold">Attendance</span>
              <strong className="text-sm text-white block mt-0.5 font-mono">{activeStudent.attendanceRate}</strong>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
              <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold">Predicted</span>
              <strong className="text-sm text-cyan-400 block mt-0.5 font-mono">{activeStudent.predictedGrade}</strong>
            </div>
          </div>
        </div>

        {/* ─── UPFRONT MEDICAL BADGES (Replacing Role Switcher) ───────────────── */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1.5">
            <span className="text-[8px] text-white/30 uppercase tracking-widest font-black block font-mono">Critical Medical & Support Information</span>
            <div className="flex flex-wrap gap-1.5">
              {activeStudent.medicalBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase border ${
                    badge.includes("Verified") || badge.includes("Approved")
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : badge.includes("No Medical")
                      ? "bg-white/5 text-white/60 border-white/10"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowMedicalModal(true)}
            className="text-[9px] uppercase tracking-wider font-extrabold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 self-end sm:self-center"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>[View Details]</span>
          </button>
        </div>
      </div>

      {/* ─── LEVEL 2: DYNAMIC OVERVIEW GRAPH (INTERACTIVE TIMEFRAME CONTROLS) ── */}
      <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-5`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Performance Trajectory</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Overall Grade Performance Overview</h3>
          </div>

          {/* Timeframe switcher buttons affecting the graph */}
          <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
            {(["month", "term", "year", "multi"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  // Reset expanded subject view as different data scales load
                  setActiveSubject(null);
                }}
                className={`px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                  timeframe === t
                    ? "bg-cyan-500 text-black font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Trajectory Graph rendering genuine data points */}
        <div className="h-44 border-b border-white/5 relative pt-4">
          <div className="absolute left-0 right-0 top-0 border-t border-dashed border-white/5 flex justify-between text-[8px] text-white/20">
            <span>7.0 Max</span>
          </div>
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/5 flex justify-between text-[8px] text-white/20">
            <span>5.0 Target</span>
          </div>
          <div className="absolute left-0 right-0 bottom-0 border-t border-dashed border-white/5 flex justify-between text-[8px] text-white/20 font-mono">
            <span>Overall Class Average correlation scale</span>
          </div>

          {/* Draw average SVG curve */}
          <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible absolute inset-0 z-10">
            <defs>
              <linearGradient id="oGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={timeframeDataset.overviewAvg
                .map((pt, idx) => {
                  const x = (idx / (timeframeDataset.overviewAvg.length - 1)) * 300;
                  const y = 120 - ((pt - 3) / 4) * 120;
                  return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`${timeframeDataset.overviewAvg
                .map((pt, idx) => {
                  const x = (idx / (timeframeDataset.overviewAvg.length - 1)) * 300;
                  const y = 120 - ((pt - 3) / 4) * 120;
                  return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                })
                .join(" ")} L 300,120 L 0,120 Z`}
              fill="url(#oGrad)"
            />
            {timeframeDataset.overviewAvg.map((pt, idx) => {
              const x = (idx / (timeframeDataset.overviewAvg.length - 1)) * 300;
              const y = 120 - ((pt - 3) / 4) * 120;
              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    className="fill-zinc-950 stroke-cyan-400 stroke-2"
                  />
                  <text x={x} y={y - 8} textAnchor="middle" className="fill-white font-mono text-[8px] font-bold">
                    {pt.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between text-[8px] text-white/30 uppercase tracking-widest font-mono">
          {timeframeDataset.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      {/* ─── LEVEL 3: SELECTABLE SUBJECT CARDS (PROGRESSIVE DISCLOSURE) ───────── */}
      <div className="space-y-4">
        <div>
          <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Investigate Courses</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Select a Course to Expand analytics</h3>
          <p className="text-[10.5px] text-white/35">Explore timeline checkpoints, assessment markers, and classroom support correlation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.keys(timeframeDataset.subjects).map((subj) => {
            const grades = timeframeDataset.subjects[subj];
            const currentGradePoint = grades[grades.length - 1];
            const isExpanded = activeSubject === subj;

            return (
              <button
                key={subj}
                onClick={() => {
                  setActiveSubject(isExpanded ? null : subj);
                  // Hide any tooltips
                  setHoveredMarker(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isExpanded
                    ? "bg-cyan-500/5 border-cyan-500/40 shadow-[0_4px_20px_rgba(6,182,212,0.08)]"
                    : "bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{subj}</h4>
                    <span className="text-[9px] text-white/30 font-mono block mt-1 uppercase">IB Grade Rating</span>
                  </div>
                  <span className="text-xl font-black text-cyan-400 font-mono">{currentGradePoint.grade.toFixed(1)}</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] text-white/50 border-t border-white/5 pt-2">
                  <span>Class Average: <strong className="text-white/80 font-mono">{currentGradePoint.classAvg.toFixed(1)}</strong></span>
                  <span className="text-cyan-400/80 font-bold uppercase tracking-wider text-[8px]">
                    {isExpanded ? "Collapse ▲" : "Investigate ▼"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── SUBJECT EXPANDED DETAILS PANEL (PROGRESSIVE LEVEL 3) ─────────────── */}
      <AnimatePresence mode="wait">
        {activeSubject && (
          <motion.div
            key={activeSubject}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`p-6 rounded-3xl border border-cyan-500/20 bg-cyan-950/[0.03] space-y-6 relative`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Expanded subject analytics</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">{activeSubject} Analysis</h3>
              </div>
              <button
                onClick={() => setActiveSubject(null)}
                className="text-[9px] text-white/40 hover:text-white uppercase tracking-wider font-extrabold font-mono"
              >
                Close Subject ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Performance Timeline Graph with Assessment Markers */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Timeline & Assessment Markers</h4>
                  <p className="text-[10px] text-white/40">Hover over markers (dots) to reveal assessment details.</p>
                </div>

                <div className="h-44 bg-zinc-950/40 rounded-2xl border border-white/[0.04] p-4 relative">
                  
                  {/* Floating Assessment Tooltip Card */}
                  <AnimatePresence>
                    {hoveredMarker && hoveredMarkerCoords && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                          position: "absolute",
                          left: `${hoveredMarkerCoords.x}px`,
                          top: `${hoveredMarkerCoords.y - 75}px`,
                          transform: "translateX(-50%)"
                        }}
                        className="z-50 w-52 p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none"
                      >
                        <span className="block text-[8px] font-black text-cyan-400 uppercase tracking-widest">{hoveredMarker.type}</span>
                        <strong className="block text-[10.5px] text-white mt-0.5 font-bold leading-snug">{hoveredMarker.label}</strong>
                        <div className="flex justify-between items-center text-[9px] text-white/40 mt-1.5 border-t border-white/5 pt-1.5">
                          <span>Grade Score: <strong className="text-cyan-400 font-mono">{hoveredMarker.score}</strong></span>
                          <span>{hoveredMarker.date}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="h-full relative">
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-white/[0.04] flex justify-between text-[7.5px] text-white/20">
                      <span>7.0 Max</span>
                    </div>
                    <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/[0.04] flex justify-between text-[7.5px] text-white/20">
                      <span>5.0 Target</span>
                    </div>

                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible absolute inset-0 z-10">
                      {/* Class Average Reference Line */}
                      <path
                        d={timeframeDataset.subjects[activeSubject]
                          .map((pt, idx) => {
                            const x = (idx / (timeframeDataset.subjects[activeSubject].length - 1)) * 300;
                            const y = 100 - ((pt.classAvg - 3) / 4) * 100;
                            return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity="0.12"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />

                      {/* Student Grade Curve */}
                      <path
                        d={timeframeDataset.subjects[activeSubject]
                          .map((pt, idx) => {
                            const x = (idx / (timeframeDataset.subjects[activeSubject].length - 1)) * 300;
                            const y = 100 - ((pt.grade - 3) / 4) * 100;
                            return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Nodes and Assessment Markers */}
                      {timeframeDataset.subjects[activeSubject].map((pt, idx) => {
                        const x = (idx / (timeframeDataset.subjects[activeSubject].length - 1)) * 300;
                        const y = 100 - ((pt.grade - 3) / 4) * 100;
                        const hasMilestone = !!pt.milestone;

                        return (
                          <g
                            key={idx}
                            onMouseEnter={(e) => {
                              if (hasMilestone) {
                                // Simple local coordinate layout mapping
                                const bounds = e.currentTarget.parentElement?.getBoundingClientRect();
                                const mouseX = (idx / (timeframeDataset.subjects[activeSubject].length - 1)) * (bounds?.width || 300);
                                const mouseY = 100 - ((pt.grade - 3) / 4) * 100;

                                setHoveredMarker(pt.milestone || null);
                                setHoveredMarkerCoords({ x: mouseX, y: mouseY });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredMarker(null);
                            }}
                            className={hasMilestone ? "cursor-pointer" : ""}
                          >
                            <circle
                              cx={x}
                              cy={y}
                              r={hasMilestone ? 6 : 4}
                              className={
                                hasMilestone
                                  ? "fill-cyan-400 stroke-cyan-500 stroke-2 animate-pulse"
                                  : "fill-zinc-950 stroke-white/40 stroke-2"
                              }
                            />
                            {hasMilestone && (
                              <circle
                                cx={x}
                                cy={y}
                                r="10"
                                className="fill-cyan-400/10 stroke-none hover:fill-cyan-400/20"
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Graph Axis labels */}
                <div className="flex justify-between text-[8px] text-white/30 uppercase tracking-widest font-mono">
                  {timeframeDataset.labels.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Subject statistics details column */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Cohort Comparison */}
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                  <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Cohort comparison</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Candidate Grade</span>
                    <strong className="text-cyan-400 font-mono text-sm">
                      {timeframeDataset.subjects[activeSubject][timeframeDataset.subjects[activeSubject].length - 1].grade.toFixed(1)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Cohort Average</span>
                    <strong className="text-white/80 font-mono text-sm">
                      {timeframeDataset.subjects[activeSubject][timeframeDataset.subjects[activeSubject].length - 1].classAvg.toFixed(1)}
                    </strong>
                  </div>
                  {/* Compare Bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${(timeframeDataset.subjects[activeSubject][timeframeDataset.subjects[activeSubject].length - 1].grade / 7) * 100}%`
                      }}
                      className="bg-cyan-400 h-full"
                    />
                  </div>
                </div>

                {/* Attendance & Support Correlation */}
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-2">
                  <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Attendance Correlation</h4>
                  <p className="text-[10.5px] text-white/75 leading-relaxed font-medium">
                    {activeStudent.id === "std-2"
                      ? "Attendance stands at 91.2%. Math/Chemistry records show a close correlation between late arrivals and downward grade slips."
                      : "Attendance stands at 97.4%. Highly regular attendance patterns show positive correlation with grade stability and milestone delivery."}
                  </p>
                </div>

              </div>

            </div>

            {/* Assessment History Ledger list */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Assessment History Ledger</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {timeframeDataset.subjects[activeSubject]
                  .filter((pt) => pt.milestone)
                  .map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950/20 border border-white/[0.03] rounded-xl flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-white/30 font-mono text-[9px] w-12 shrink-0">{pt.milestone?.date}</span>
                        <div>
                          <strong className="text-white block font-bold">{pt.milestone?.label}</strong>
                          <span className="text-[9.5px] text-cyan-400/80 block leading-none font-mono mt-0.5">{pt.milestone?.type}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{pt.milestone?.score}</span>
                    </div>
                  ))}

                {timeframeDataset.subjects[activeSubject].filter((pt) => pt.milestone).length === 0 && (
                  <span className="text-[10px] text-white/30 italic block text-center py-2">No milestone assessments logged in this timeframe.</span>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DETAILED MEDICAL MODAL (ONE CLICK AWAY) ────────────────────────── */}
      <AnimatePresence>
        {showMedicalModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMedicalModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="z-50 w-full max-w-lg bg-[#0C0C0E] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-5"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">Confidential System log</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Detailed Medical & Accommodations Log</h3>
                </div>
                <button
                  onClick={() => setShowMedicalModal(false)}
                  className="text-white/40 hover:text-white text-xl font-bold font-mono"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                
                {/* Emergency Contact */}
                <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Emergency Contact</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white">{activeStudent.medicalDetails.emergencyContact}</span>
                    <span className="text-cyan-400 font-mono">{activeStudent.medicalDetails.emergencyPhone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1.5">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Conditions</span>
                    <div className="flex flex-wrap gap-1">
                      {activeStudent.medicalDetails.conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase text-[8px]">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1.5">
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Allergies</span>
                    <div className="flex flex-wrap gap-1">
                      {activeStudent.medicalDetails.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase text-[8px]">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1.5">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Accommodations & Learning Plans</span>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60">Status Rating:</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${activeStudent.accommodations.statusColor}`}>
                      {activeStudent.accommodations.status}
                    </span>
                  </div>
                  <div className="space-y-2 pt-1.5 border-t border-white/5">
                    <div>
                      <span className="text-[8px] text-white/30 uppercase tracking-widest block font-bold mb-1">Verified IB Accommodations:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeStudent.accommodations.verifiedAccommodations.map((item, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px]">{item}</span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <span className="text-[8px] text-white/30 uppercase tracking-widest block font-bold mb-1">Learning Support:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeStudent.accommodations.learningSupport.map((item, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px]">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nurse Note */}
                <div className="p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider block">Nurse Notes</span>
                  <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                    {activeStudent.medicalDetails.notes}
                  </p>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowMedicalModal(false)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-cyan-400"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
