"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentSupportFlag } from "../student-support-context";

interface IBAccommodationHistory {
  date: string;
  user: string;
  action: string;
}

interface IBAccommodation {
  status: "Verified by IB" | "Pending Verification" | "Documentation Under Review" | "Expired" | "Not Applicable";
  statusColor: string;
  planActive: boolean;
  approvalDate: string;
  expiryDate?: string;
  nextReviewDate: string;
  documentationStatus: string;
  provisions: string[];
  notes: string;
  history: IBAccommodationHistory[];
  documentRef?: string;
  documentName?: string;
}

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
  ibAccommodations: IBAccommodation;
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
    },
    ibAccommodations: {
      status: "Verified by IB",
      statusColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      planActive: true,
      approvalDate: "Sep 12, 2025",
      expiryDate: "May 2027",
      nextReviewDate: "Oct 15, 2026",
      documentationStatus: "Verified & Uploaded",
      provisions: ["Extra Time (25%)", "Separate Room", "Rest Breaks"],
      notes: "Student has been approved by the IB for 25% additional time during examinations. Separate testing environment required. Accommodation documentation verified and active.",
      documentRef: "IB-REF-2025-DP-9821-CV",
      documentName: "IB_AccessArrangements_ChloeVance_FormD1.pdf",
      history: [
        { date: "Jan 15, 2026", user: "Aarav Chen", action: "Review note: Checked room assignments for May 2026 exams to ensure separate environment is booked." },
        { date: "Sep 12, 2025", user: "IB Portal", action: "Official IB Approval granted for 25% Extra Time, Rest Breaks, and Separate Room." },
        { date: "Sep 05, 2025", user: "Aarav Chen", action: "Medical documentation and psychoeducational report uploaded to IB portal." },
        { date: "Aug 20, 2025", user: "Aarav Chen", action: "Initial accommodations request drafted and parent consent obtained." }
      ]
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
    },
    ibAccommodations: {
      status: "Pending Verification",
      statusColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      planActive: true,
      approvalDate: "Jan 18, 2026",
      expiryDate: "Jun 2027",
      nextReviewDate: "Sep 05, 2026",
      documentationStatus: "Documentation Under Review",
      provisions: ["Rest Breaks (10 mins)"],
      notes: "Request submitted for 10-minute rest breaks per hour. Medical certificates uploaded. Awaiting final IB response.",
      documentRef: "IB-REF-2026-DP-1042-LG",
      documentName: "IB_AccessArrangements_LucasGray_Request.pdf",
      history: [
        { date: "Jan 18, 2026", user: "Ananya Rao", action: "Accommodation request submitted to IB (Pending Verification)." },
        { date: "Jan 10, 2026", user: "Ananya Rao", action: "Rest break request medical certification uploaded." }
      ]
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
    },
    ibAccommodations: {
      status: "Not Applicable",
      statusColor: "text-white/40 border-white/10 bg-white/5",
      planActive: false,
      approvalDate: "N/A",
      nextReviewDate: "N/A",
      documentationStatus: "No Documentation Required",
      provisions: [],
      notes: "No active accommodations or access arrangements requested or required for the DP programme cycles.",
      documentRef: "N/A",
      documentName: "N/A",
      history: [
        { date: "Sep 01, 2025", user: "Marcus Vance", action: "No special accommodations requested for candidate." }
      ]
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

interface SubjectTrendPoint {
  period: string;
  grade: number;
  classAvg: number;
  milestone?: { label: string; type: string; score: string; date: string };
}

function ExpandableSubjectCard({
  subj,
  timeframeDataset,
  timeframe,
  activeSubject,
  setActiveSubject,
  hoveredMarker,
  setHoveredMarker,
  hoveredMarkerCoords,
  setHoveredMarkerCoords
}: {
  subj: string;
  timeframeDataset: {
    labels: string[];
    overviewAvg: number[];
    subjects: Record<string, SubjectTrendPoint[]>;
  };
  timeframe: string;
  activeSubject: string | null;
  setActiveSubject: (subj: string | null) => void;
  hoveredMarker: { label: string; type: string; score: string; date: string } | null;
  setHoveredMarker: (marker: { label: string; type: string; score: string; date: string } | null) => void;
  hoveredMarkerCoords: { x: number; y: number } | null;
  setHoveredMarkerCoords: (coords: { x: number; y: number } | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeSubject === subj;

  // Auto-scroll safety: scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      const timeoutId = setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }, 250); // Wait for the height animation to kick off
      return () => clearTimeout(timeoutId);
    }
  }, [isExpanded]);

  // Resolve Concept Mastery
  const concepts = useMemo(() => {
    if (subj.toLowerCase().includes("physics")) {
      return [
        { name: "Mechanics & Kinematics", percentage: 88 },
        { name: "Electromagnetism & Induction", percentage: 62 },
        { name: "Thermodynamics & Waves", percentage: 75 }
      ];
    } else if (subj.toLowerCase().includes("math") || subj.toLowerCase().includes("calculus")) {
      return [
        { name: "Calculus & Analysis", percentage: 90 },
        { name: "Algebra & Functions", percentage: 95 },
        { name: "Probability & Statistics", percentage: 82 }
      ];
    } else if (subj.toLowerCase().includes("chemistry")) {
      return [
        { name: "Organic Chemistry", percentage: 74 },
        { name: "Stoichiometry & Gas Laws", percentage: 81 },
        { name: "Chemical Kinetics & Thermo", percentage: 68 }
      ];
    } else {
      return [
        { name: "Core Syllabus Theory", percentage: 85 },
        { name: "Practical Lab Work", percentage: 78 },
        { name: "Exam Prep & Mock Papers", percentage: 82 }
      ];
    }
  }, [subj]);

  // Resolve Teacher Feedback
  const feedback = useMemo(() => {
    if (subj.toLowerCase().includes("physics")) {
      return {
        text: "Chloe shows excellent logical deductions in problem-solving. Extended Essay draft requires refined methodology, but core IA experimental setup is solid.",
        teacher: "Dr. Alistair Vance, Head of Physics"
      };
    } else if (subj.toLowerCase().includes("math") || subj.toLowerCase().includes("calculus")) {
      return {
        text: "Outstanding speed in differentiation work. Needs minor practice on vector proofs under exam conditions.",
        teacher: "Mrs. Sarah Jenkins, Senior Mathematics Lecturer"
      };
    } else if (subj.toLowerCase().includes("chemistry")) {
      return {
        text: "Lab reporting has improved dramatically. Focus on organic compound naming conventions for the final exam.",
        teacher: "Dr. Monica Geller, Chemistry Director"
      };
    } else {
      return {
        text: "Regular attendance and consistent performance across all classroom checkpoints. Continues to track well against predicted goals.",
        teacher: "Class Subject Tutor"
      };
    }
  }, [subj]);

  // Resolve Growth & AI Predictions
  const growth = useMemo(() => {
    if (subj.toLowerCase().includes("physics")) {
      return {
        growthText: "+0.8 grade points over 3mo",
        predictionText: "6.0 predicted (90% conf)"
      };
    } else if (subj.toLowerCase().includes("math")) {
      return {
        growthText: "+0.4 grade points over 3mo",
        predictionText: "7.0 predicted (85% conf)"
      };
    } else if (subj.toLowerCase().includes("chemistry")) {
      return {
        growthText: "+0.3 grade points over 3mo",
        predictionText: "6.0 predicted (92% conf)"
      };
    } else {
      return {
        growthText: "+0.5 grade points over 3mo",
        predictionText: "6.0 predicted (88% conf)"
      };
    }
  }, [subj]);

  const grades = timeframeDataset.subjects[subj];
  if (!grades || grades.length === 0) return null;
  const currentGradePoint = grades[grades.length - 1];

  return (
    <div
      ref={cardRef}
      className={`rounded-3xl border transition-all duration-500 relative overflow-hidden ${
        isExpanded
          ? "bg-cyan-950/[0.03] border-cyan-500/30 shadow-[0_10px_40px_rgba(6,182,212,0.12),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          : "bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10"
      }`}
    >
      {/* Clickable Header Row */}
      <button
        type="button"
        onClick={() => {
          setActiveSubject(isExpanded ? null : subj);
          setHoveredMarker(null);
        }}
        className="w-full p-5 flex items-center justify-between text-left transition-colors relative z-20 group"
      >
        <div className="flex items-center gap-4">
          {/* Active/Expanded State Indicator Dot with pulsing animation */}
          <div className="relative flex size-2 shrink-0">
            {isExpanded && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex size-2 rounded-full transition-colors ${isExpanded ? "bg-cyan-400" : "bg-white/15"}`}></span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white tracking-wide transition-colors group-hover:text-cyan-400">{subj}</h4>
            <span className="text-[9px] text-white/30 font-mono block mt-0.5 uppercase tracking-wider">IB Course Progress</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[8px] text-white/30 font-mono block uppercase tracking-wider">IB Grade</span>
            <span className="text-base font-black text-cyan-400 font-mono leading-none">{currentGradePoint.grade.toFixed(1)}</span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[8px] text-white/30 font-mono block uppercase tracking-wider">Class Avg</span>
            <span className="text-xs font-bold text-white/60 font-mono leading-none">{currentGradePoint.classAvg.toFixed(1)}</span>
          </div>

          {/* Chevron icon with animation */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/45 group-hover:text-white"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expanded Details Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.04] overflow-hidden relative z-10"
          >
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Performance Timeline Graph with Assessment Markers */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Timeline & Assessment Markers</h4>
                    <p className="text-[10px] text-white/40">Hover over markers (dots) to reveal assessment details.</p>
                  </div>

                  <div className="h-44 bg-zinc-950/40 rounded-2xl border border-white/[0.04] relative select-none">
                    
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
                            top: `${hoveredMarkerCoords.y}px`,
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

                    {(() => {
                      const activeSubjectData = timeframeDataset.subjects[subj];
                      if (!activeSubjectData || activeSubjectData.length === 0) return null;

                      const chartWidth = 350;
                      const chartHeight = 90;
                      const paddingLeft = 25;
                      const paddingTop = 15;

                      const getCoords = (idx: number, grade: number) => {
                        const denom = activeSubjectData.length > 1 ? activeSubjectData.length - 1 : 1;
                        const x = paddingLeft + (idx / denom) * chartWidth;
                        const y = paddingTop + (1 - (grade - 3) / 4) * chartHeight;
                        return { x, y };
                      };

                      const classAvgPoints = activeSubjectData.map((pt: SubjectTrendPoint, idx: number) => {
                        const { x, y } = getCoords(idx, pt.classAvg);
                        return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                      });
                      const classAvgPathD = classAvgPoints.join(" ");

                      const studentPoints = activeSubjectData.map((pt: SubjectTrendPoint, idx: number) => {
                        const { x, y } = getCoords(idx, pt.grade);
                        return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                      });
                      const studentPathD = studentPoints.join(" ");

                      const firstX = paddingLeft;
                      const lastX = paddingLeft + chartWidth;
                      const bottomY = paddingTop + chartHeight; // 105
                      const areaPathD = `${studentPathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

                      return (
                        <>
                          <svg 
                            viewBox="0 0 400 130" 
                            preserveAspectRatio="none"
                            className="w-full h-full overflow-visible absolute inset-0 z-10"
                          >
                            <defs>
                              <linearGradient id={`subjGrad-${subj}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Guidelines */}
                            <line x1="25" y1="15" x2="375" y2="15" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                            <line x1="25" y1="60" x2="375" y2="60" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                            <line x1="25" y1="105" x2="375" y2="105" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />

                            {/* Class Average Reference Line */}
                            <motion.path
                              key={`${subj}-${timeframe}-class-avg`}
                              d={classAvgPathD}
                              fill="none"
                              stroke="#ffffff"
                              strokeOpacity="0.12"
                              strokeWidth="1.5"
                              strokeDasharray="3,3"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.12 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />

                            {/* Area Gradient under Student Grade Curve */}
                            <motion.path
                              key={`${subj}-${timeframe}-area`}
                              d={areaPathD}
                              fill={`url(#subjGrad-${subj})`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />

                            {/* Student Grade Curve */}
                            <motion.path
                              key={`${subj}-${timeframe}-student-line`}
                              d={studentPathD}
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </svg>

                          {/* Guidelines labels */}
                          <div className="absolute inset-0 pointer-events-none z-20">
                            <div className="absolute left-[6.25%] top-[7.69%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">7.0 Max</div>
                            <div className="absolute left-[6.25%] top-[42.3%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">5.0 Target</div>
                            <div className="absolute left-[6.25%] top-[76.92%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">3.0 Baseline</div>
                          </div>

                          {/* Nodes Overlay */}
                          <div className="absolute inset-0 z-20 pointer-events-auto">
                            {activeSubjectData.map((pt: SubjectTrendPoint, idx: number) => {
                              const denom = activeSubjectData.length > 1 ? activeSubjectData.length - 1 : 1;
                              const xPercent = 6.25 + (idx / denom) * 87.5;
                              const yPercent = 11.54 + (1 - (pt.grade - 3) / 4) * 69.23;
                              const hasMilestone = !!pt.milestone;

                              return (
                                <motion.div
                                  key={`${subj}-${timeframe}-node-${idx}`}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ type: "spring", stiffness: 100, damping: 10, delay: idx * 0.05 }}
                                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                  style={{
                                    left: `${xPercent}%`,
                                    top: `${yPercent}%`
                                  }}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const parent = e.currentTarget.parentElement?.parentElement;
                                    if (parent) {
                                      const parentRect = parent.getBoundingClientRect();
                                      setHoveredMarker(pt.milestone || {
                                        label: `Grade Status: ${pt.grade.toFixed(1)}`,
                                        type: "Grade Point",
                                        score: `${pt.grade.toFixed(1)} / 7.0`,
                                        date: pt.period
                                      });
                                      setHoveredMarkerCoords({
                                        x: rect.left - parentRect.left + rect.width / 2,
                                        y: rect.top - parentRect.top - 68
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredMarker(null);
                                  }}
                                >
                                  {/* Circle Node */}
                                  <div className={`rounded-full transition-all border-2 ${
                                    hasMilestone
                                      ? "size-3 bg-cyan-400 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] cursor-pointer"
                                      : "size-2 bg-zinc-950 border-white/40 cursor-pointer hover:border-cyan-400"
                                  }`} />
                                  {hasMilestone && (
                                    <div className="absolute size-5 rounded-full bg-cyan-400/10 -z-10 hover:bg-cyan-400/20 transition-all cursor-pointer" />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* X-Axis Labels Overlay */}
                          <div className="absolute left-0 right-0 bottom-1 h-5 z-20 pointer-events-none">
                            {timeframeDataset.labels.map((l: string, idx: number) => {
                              const denom = timeframeDataset.labels.length > 1 ? timeframeDataset.labels.length - 1 : 1;
                              const xPercent = 6.25 + (idx / denom) * 87.5;
                              return (
                                <div
                                  key={l}
                                  className="absolute -translate-x-1/2 text-[8.5px] font-mono font-semibold tracking-wider text-white/30 text-center"
                                  style={{ left: `${xPercent}%` }}
                                >
                                  {l}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
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
                        {currentGradePoint.grade.toFixed(1)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">Cohort Average</span>
                      <strong className="text-white/80 font-mono text-sm">
                        {currentGradePoint.classAvg.toFixed(1)}
                      </strong>
                    </div>
                    {/* Compare Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div
                        style={{
                          width: `${(currentGradePoint.grade / 7) * 100}%`
                        }}
                        className="bg-cyan-400 h-full"
                      />
                    </div>
                  </div>

                  {/* Growth & Predictions */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                    <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Growth & Projections</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Growth Metric</span>
                        <span className="text-emerald-400 font-bold font-mono">{growth.growthText}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">AI Predicted Trend</span>
                        <span className="text-cyan-400 font-extrabold font-mono">{growth.predictionText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Concept Mastery */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                    <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Concept Mastery</h4>
                    <div className="space-y-2.5">
                      {concepts.map((c) => (
                        <div key={c.name} className="space-y-1">
                          <div className="flex justify-between text-[9.5px] font-semibold leading-none">
                            <span className="text-white/75 truncate pr-2">{c.name}</span>
                            <span className="text-cyan-400 font-mono shrink-0">{c.percentage}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div style={{ width: `${c.percentage}%` }} className="h-full bg-cyan-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Lower Section: Ledger List & Teacher Observation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-white/5 pt-5">
                
                {/* Assessment History Ledger list */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Assessment History Ledger</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {grades
                      .filter((pt: SubjectTrendPoint) => pt.milestone)
                      .map((pt: SubjectTrendPoint, idx: number) => (
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

                    {grades.filter((pt: SubjectTrendPoint) => pt.milestone).length === 0 && (
                      <span className="text-[10px] text-white/30 italic block text-center py-2">No milestone assessments logged in this timeframe.</span>
                    )}
                  </div>
                </div>

                {/* Teacher observation feedback */}
                <div className="lg:col-span-5 space-y-3">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Teacher Observation</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-2 flex flex-col justify-between h-[135px]">
                    <p className="text-[10.5px] text-white/75 italic leading-relaxed font-semibold">
                      &ldquo;{feedback.text}&rdquo;
                    </p>
                    <div className="text-[9px] text-white/35 text-right font-mono font-bold">
                      — {feedback.teacher}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StudentStatisticsProfile({
  theme,
  selectedStudentId,
  onBack,
  isTeacher = false
}: {
  theme: string;
  selectedStudentId?: string | null;
  onBack?: () => void;
  isTeacher?: boolean;
}) {
  const activeStudentId = selectedStudentId || "std-1";
  const [timeframe, setTimeframe] = useState<"month" | "term" | "year" | "multi">("term");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  // Accommodations workflow states
  const [students, setStudents] = useState<StudentStatsData[]>(STATS_DATABASE);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReviewNotesModal, setShowReviewNotesModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Reset expanded subject when active student changes to prevent crash from missing subject
  useEffect(() => {
    setActiveSubject(null);
    setDownloadSuccess(false);
  }, [activeStudentId]);

  // States for assessment tooltips
  const [hoveredMarker, setHoveredMarker] = useState<{ label: string; type: string; score: string; date: string } | null>(null);
  const [hoveredMarkerCoords, setHoveredMarkerCoords] = useState<{ x: number; y: number } | null>(null);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Form states for updating accommodations
  const [formStatus, setFormStatus] = useState<"Verified by IB" | "Pending Verification" | "Documentation Under Review" | "Expired" | "Not Applicable">("Verified by IB");
  const [formActive, setFormActive] = useState(false);
  const [formExpiry, setFormExpiry] = useState("");
  const [formProvisions, setFormProvisions] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState("");
  const [reviewNoteText, setReviewNoteText] = useState("");

  // Sync form states when activeStudent or showUpdateModal changes
  useEffect(() => {
    if (activeStudent) {
      setFormStatus(activeStudent.ibAccommodations.status);
      setFormActive(activeStudent.ibAccommodations.planActive);
      setFormExpiry(activeStudent.ibAccommodations.expiryDate || "");
      setFormProvisions(activeStudent.ibAccommodations.provisions);
      setFormNotes(activeStudent.ibAccommodations.notes);
    }
  }, [showUpdateModal, activeStudent]);

  useEffect(() => {
    if (showReviewNotesModal) {
      setReviewNoteText("");
    }
  }, [showReviewNotesModal]);

  const handleSaveAccommodations = () => {
    const statusColors: Record<string, string> = {
      "Verified by IB": "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      "Pending Verification": "text-amber-400 border-amber-500/20 bg-amber-500/5",
      "Documentation Under Review": "text-amber-400 border-amber-500/20 bg-amber-500/5",
      "Expired": "text-rose-400 border-rose-500/20 bg-rose-500/5",
      "Not Applicable": "text-white/40 border-white/10 bg-white/5"
    };

    const updatedStudents = students.map((s) => {
      if (s.id === activeStudent.id) {
        const currentDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit"
        });
        const actionMessage = `Accommodation records updated (Status: ${formStatus}, Plan Active: ${formActive ? "Yes" : "No"}).`;
        const newHistoryItem = {
          date: currentDate,
          user: "Aarav Chen",
          action: actionMessage
        };

        return {
          ...s,
          ibAccommodations: {
            ...s.ibAccommodations,
            status: formStatus,
            statusColor: statusColors[formStatus] || "text-white/40 border-white/10 bg-white/5",
            planActive: formActive,
            expiryDate: formExpiry || "N/A",
            provisions: formProvisions,
            notes: formNotes,
            history: [newHistoryItem, ...s.ibAccommodations.history]
          }
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setShowUpdateModal(false);
  };

  const handleSaveReviewNotes = () => {
    if (!reviewNoteText.trim()) return;

    const updatedStudents = students.map((s) => {
      if (s.id === activeStudent.id) {
        const currentDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit"
        });
        const newHistoryItem = {
          date: currentDate,
          user: "Aarav Chen",
          action: `Review note: ${reviewNoteText}`
        };

        return {
          ...s,
          ibAccommodations: {
            ...s.ibAccommodations,
            history: [newHistoryItem, ...s.ibAccommodations.history]
          }
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setShowReviewNotesModal(false);
  };

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
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                {activeStudent.name}
                <StudentSupportFlag studentName={activeStudent.name} theme={theme} />
              </h2>
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
        {!isTeacher && (
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
        )}

        {/* ─── IB ACCOMMODATIONS & ACCESS ARRANGEMENTS ────────────────────────── */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-white/30 uppercase tracking-widest font-black block font-mono">
              IB Accommodations & Access Arrangements
            </span>
            {activeStudent.ibAccommodations.planActive && (
              <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                Active arrangements
              </span>
            )}
          </div>

          {isTeacher ? (
            /* Teacher Perspective: Operational adjustments only */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold font-mono">Required Provisions</span>
                  {activeStudent.ibAccommodations.provisions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activeStudent.ibAccommodations.provisions.map((provision, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[8.5px] font-extrabold uppercase font-mono"
                        >
                          {provision}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[9px] text-white/30 italic">No access arrangements or provisions registered.</div>
                  )}
                </div>
                {activeStudent.ibAccommodations.expiryDate && activeStudent.ibAccommodations.expiryDate !== "N/A" && (
                  <div className="shrink-0">
                    <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold font-mono">Valid Until</span>
                    <span className="text-[10.5px] text-cyan-400 font-mono font-bold block mt-1">{activeStudent.ibAccommodations.expiryDate}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold font-mono">Academic Support Notes</span>
                <p className="text-[11px] text-white/75 leading-relaxed font-medium">
                  {activeStudent.ibAccommodations.notes}
                </p>
              </div>
            </div>
          ) : (
            /* Coordinator Perspective: Complete record details */
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Status Summary Card (Span 4) */}
                <div className="md:col-span-4 p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[8px] text-white/35 uppercase tracking-widest block font-bold font-mono">IB Accommodation Status</span>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${
                      activeStudent.ibAccommodations.status === "Verified by IB"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : activeStudent.ibAccommodations.status === "Pending Verification" || activeStudent.ibAccommodations.status === "Documentation Under Review"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : activeStudent.ibAccommodations.status === "Expired"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}>
                      {activeStudent.ibAccommodations.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-white/45 block font-semibold">
                      Documentation: <strong className="text-white/80">{activeStudent.ibAccommodations.documentationStatus}</strong>
                    </span>
                    {activeStudent.ibAccommodations.expiryDate && activeStudent.ibAccommodations.expiryDate !== "N/A" && (
                      <span className="text-[9px] text-white/45 block font-semibold">
                        Approved Until: <strong className="text-cyan-400 font-mono">{activeStudent.ibAccommodations.expiryDate}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Provisions & Notes (Span 8) */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                  {/* Provisions list */}
                  {activeStudent.ibAccommodations.provisions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activeStudent.ibAccommodations.provisions.map((provision, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8.5px] font-extrabold uppercase font-mono"
                        >
                          {provision}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[9px] text-white/30 italic">No access arrangements or provisions registered.</div>
                  )}
                  {/* plain notes */}
                  <p className="text-[11px] text-white/75 leading-relaxed font-medium">
                    {activeStudent.ibAccommodations.notes}
                  </p>
                </div>
              </div>

              {/* Timeline Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">Approval Date</span>
                  <span className="text-[10px] text-white/80 font-mono font-bold">{activeStudent.ibAccommodations.approvalDate}</span>
                </div>
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">Expiry Date</span>
                  <span className="text-[10px] text-white/80 font-mono font-bold">{activeStudent.ibAccommodations.expiryDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">Next Review Date</span>
                  <span className="text-[10px] text-white/80 font-mono font-bold">{activeStudent.ibAccommodations.nextReviewDate}</span>
                </div>
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">Supporting Documentation</span>
                  <span className="text-[10px] text-white/80 font-bold">{activeStudent.ibAccommodations.documentationStatus}</span>
                </div>
              </div>

              {/* Coordinator Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 justify-end">
                <button
                  onClick={() => setShowDocsModal(true)}
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-[8.5px] uppercase tracking-wider font-black text-cyan-400 transition-all font-mono"
                >
                  [View Documentation]
                </button>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-[8.5px] uppercase tracking-wider font-black text-cyan-400 transition-all font-mono"
                >
                  [View History]
                </button>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-[8.5px] uppercase tracking-wider font-black text-cyan-400 transition-all font-mono"
                >
                  [Update Records]
                </button>
                <button
                  onClick={() => setShowReviewNotesModal(true)}
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-[8.5px] uppercase tracking-wider font-black text-cyan-400 transition-all font-mono"
                >
                  [Record Review Notes]
                </button>
              </div>
            </>
          )}
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
        <div className="h-44 border-b border-white/5 relative select-none">
          {(() => {
            const chartWidth = 350;
            const chartHeight = 90;
            const paddingLeft = 25;
            const paddingTop = 15;

            const getCoords = (idx: number, pt: number) => {
              const x = paddingLeft + (idx / (timeframeDataset.overviewAvg.length - 1)) * chartWidth;
              const y = paddingTop + (1 - (pt - 3) / 4) * chartHeight;
              return { x, y };
            };

            const pathPoints = timeframeDataset.overviewAvg.map((pt, idx) => {
              const { x, y } = getCoords(idx, pt);
              return `${idx === 0 ? "M" : "L"} ${x},${y}`;
            });
            const linePathD = pathPoints.join(" ");

            const firstX = paddingLeft;
            const lastX = paddingLeft + chartWidth;
            const bottomY = paddingTop + chartHeight; // 105
            const areaPathD = `${linePathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

            return (
              <>
                <svg 
                  viewBox="0 0 400 130" 
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible absolute inset-0 z-10"
                >
                  <defs>
                    <linearGradient id="oGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guidelines */}
                  <line x1="25" y1="15" x2="375" y2="15" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="25" y1="60" x2="375" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="25" y1="105" x2="375" y2="105" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                  {/* Area path with spring transition */}
                  <motion.path
                    d={areaPathD}
                    fill="url(#oGrad)"
                    animate={{ d: areaPathD }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  />

                  {/* Line path with spring transition */}
                  <motion.path
                    d={linePathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ d: linePathD }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  />
                </svg>

                {/* Guidelines labels (HTML overlay, no distortion) */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute left-[6.25%] top-[7.69%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">7.0 Max</div>
                  <div className="absolute left-[6.25%] top-[42.3%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">5.0 Target</div>
                  <div className="absolute left-[6.25%] top-[76.92%] text-[8px] font-mono font-medium text-white/20 -translate-y-1/2">Overall Class Average correlation scale</div>
                </div>

                {/* Nodes & Labels Overlay (HTML overlay, no distortion) */}
                <div className="absolute inset-0 z-20 pointer-events-auto">
                  {timeframeDataset.overviewAvg.map((pt, idx) => {
                    const xPercent = 6.25 + (idx / (timeframeDataset.overviewAvg.length - 1)) * 87.5;
                    const yPercent = 11.54 + (1 - (pt - 3) / 4) * 69.23;
                    return (
                      <div
                        key={idx}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`
                        }}
                      >
                        {/* Floating Value */}
                        <span className="text-[8px] font-bold font-mono text-white mb-1.5 block -translate-y-3 pointer-events-none select-none">
                          {pt.toFixed(2)}
                        </span>
                        {/* Circle Node */}
                        <div className="size-2 rounded-full bg-zinc-950 border-2 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels Overlay */}
                <div className="absolute left-0 right-0 bottom-1 h-5 z-20 pointer-events-none">
                  {timeframeDataset.labels.map((l, idx) => {
                    const xPercent = 6.25 + (idx / (timeframeDataset.labels.length - 1)) * 87.5;
                    return (
                      <div
                        key={l}
                        className="absolute -translate-x-1/2 text-[8.5px] font-mono font-semibold tracking-wider text-white/30 text-center"
                        style={{ left: `${xPercent}%` }}
                      >
                        {l}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ─── LEVEL 3: SELECTABLE SUBJECT CARDS (PROGRESSIVE DISCLOSURE) ───────── */}
      <div className="space-y-4">
        <div>
          <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Investigate Courses</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Select a Course to Expand analytics</h3>
          <p className="text-[10.5px] text-white/35">Explore timeline checkpoints, assessment markers, and classroom support correlation.</p>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(timeframeDataset.subjects).map((subj) => (
            <ExpandableSubjectCard
              key={subj}
              subj={subj}
              timeframeDataset={timeframeDataset}
              timeframe={timeframe}
              activeSubject={activeSubject}
              setActiveSubject={setActiveSubject}
              hoveredMarker={hoveredMarker}
              setHoveredMarker={setHoveredMarker}
              hoveredMarkerCoords={hoveredMarkerCoords}
              setHoveredMarkerCoords={setHoveredMarkerCoords}
            />
          ))}
        </div>
      </div>

      {/* ─── DETAILED MEDICAL MODAL (ONE CLICK AWAY) ────────────────────────── */}
      <AnimatePresence>
        {showMedicalModal && !isTeacher && (
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

      {/* ─── VIEW DOCUMENTATION MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showDocsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDocsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="z-50 w-full max-w-lg bg-[#0C0C0E] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-5"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">IB Official Document Repository</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Access Arrangement Documentation</h3>
                </div>
                <button onClick={() => setShowDocsModal(false)} className="text-white/40 hover:text-white text-xl font-bold font-mono">×</button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-950/60 border border-white/[0.04] rounded-2xl space-y-3 font-semibold text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Candidate Name:</span>
                    <span className="text-white">{activeStudent.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Document Ref:</span>
                    <span className="text-cyan-400 font-mono">{activeStudent.ibAccommodations.documentRef || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">File Registered:</span>
                    <span className="text-white/80 max-w-[200px] truncate font-mono text-[10.5px]">{activeStudent.ibAccommodations.documentName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Verification Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${activeStudent.ibAccommodations.statusColor}`}>
                      {activeStudent.ibAccommodations.status}
                    </span>
                  </div>
                </div>

                {/* Simulated Document Preview Area */}
                <div className="relative h-44 bg-zinc-900 border border-white/5 rounded-2xl flex flex-col justify-between p-4 overflow-hidden select-none">
                  {/* Watermark/Stamp */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <div className="text-white font-mono text-[9px] border border-white p-2 rotate-12 scale-150">INTERNATIONAL BACCALAUREATE</div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] text-white/30 font-mono block">IB CARDIFF GLOBAL OFFICE</span>
                      <strong className="text-[10px] text-white/90 font-bold block uppercase tracking-wide">Official Assessment Authorization</strong>
                    </div>
                    <div className="size-8 rounded border border-white/10 bg-white/5 flex items-center justify-center text-[9.5px] text-white/60 font-black font-mono">IB</div>
                  </div>

                  <div className="space-y-1.5 py-2">
                    <span className="text-[8px] text-white/40 uppercase block">Approved Access Provisions:</span>
                    <div className="flex flex-wrap gap-1">
                      {activeStudent.ibAccommodations.provisions.length > 0 ? (
                        activeStudent.ibAccommodations.provisions.map((prov, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px] font-mono">{prov}</span>
                        ))
                      ) : (
                        <span className="text-[9px] text-white/30 italic">No accommodations authorized.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-2 text-[8px] font-mono text-white/30">
                    <span>AUTHORIZED SIGN-OFF: Dr. E. Rostova</span>
                    <span>ISSUED: {activeStudent.ibAccommodations.approvalDate}</span>
                  </div>
                </div>

                {downloadSuccess ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-emerald-400 text-[10.5px] font-bold animate-pulse">
                    ✓ PDF Download Simulated: {activeStudent.ibAccommodations.documentName} saved to local storage.
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (activeStudent.ibAccommodations.documentName !== "N/A") {
                      setDownloadSuccess(true);
                      setTimeout(() => setDownloadSuccess(false), 3000);
                    }
                  }}
                  disabled={activeStudent.ibAccommodations.documentName === "N/A"}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowDocsModal(false);
                    setDownloadSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── VIEW HISTORY MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="z-50 w-full max-w-lg bg-[#0C0C0E] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-5"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">System Audit Log</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Accommodation History & Reviews</h3>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-white/40 hover:text-white text-xl font-bold font-mono">×</button>
              </div>

              <div className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                  {activeStudent.ibAccommodations.history.map((log, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] text-cyan-400 font-mono font-bold">{log.date}</span>
                        <span className="text-[8.5px] text-white/40 uppercase tracking-wider font-mono">By: {log.user}</span>
                      </div>
                      <p className="text-[10.5px] text-white/80 leading-relaxed font-semibold">{log.action}</p>
                    </div>
                  ))}

                  {activeStudent.ibAccommodations.history.length === 0 && (
                    <div className="text-[10.5px] text-white/30 italic text-center py-6">No historical entries found.</div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-cyan-400"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── UPDATE ACCOMMODATION RECORDS MODAL ────────────────────────── */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpdateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="z-50 w-full max-w-lg bg-[#0C0C0E] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Record Custodian Panel</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Update Accommodation Records</h3>
                </div>
                <button onClick={() => setShowUpdateModal(false)} className="text-white/40 hover:text-white text-xl font-bold font-mono">×</button>
              </div>

              <div className="space-y-3.5 text-xs text-white/80 font-semibold max-h-[400px] overflow-y-auto pr-1">
                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-[8.5px] text-white/40 uppercase tracking-widest font-mono block">Verification Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormStatus(e.target.value as "Verified by IB" | "Pending Verification" | "Documentation Under Review" | "Expired" | "Not Applicable")
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="Verified by IB">Verified by IB</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Documentation Under Review">Documentation Under Review</option>
                    <option value="Expired">Expired</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                {/* Plan active checkbox */}
                <div className="flex items-center gap-2.5 p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
                  <input
                    type="checkbox"
                    id="planActiveCheck"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="size-3.5 accent-cyan-500 rounded border-white/10 bg-zinc-900 cursor-pointer"
                  />
                  <label htmlFor="planActiveCheck" className="text-[11px] text-white cursor-pointer select-none">
                    Accommodation Plan Active
                  </label>
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-[8.5px] text-white/40 uppercase tracking-widest font-mono block">Expiry Date (e.g. May 2027)</label>
                  <input
                    type="text"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    placeholder="May 2027"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Provisions checklist */}
                <div className="space-y-1.5">
                  <label className="text-[8.5px] text-white/40 uppercase tracking-widest font-mono block">Approved Provisions</label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-950/60 border border-white/[0.03] rounded-2xl max-h-[120px] overflow-y-auto">
                    {[
                      "Extra Time (25%)",
                      "Separate Room",
                      "Rest Breaks",
                      "Scribe",
                      "Reader",
                      "Assistive Technology",
                      "Modified Papers"
                    ].map((provision) => {
                      const isChecked = formProvisions.includes(provision);
                      return (
                        <div key={provision} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`prov-${provision}`}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormProvisions([...formProvisions, provision]);
                              } else {
                                setFormProvisions(formProvisions.filter((p) => p !== provision));
                              }
                            }}
                            className="size-3.5 accent-cyan-500 rounded border-white/10 bg-zinc-900 cursor-pointer"
                          />
                          <label htmlFor={`prov-${provision}`} className="text-[10px] text-white/70 truncate cursor-pointer select-none">
                            {provision}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[8.5px] text-white/40 uppercase tracking-widest font-mono block">Accommodation Notes</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Enter plain language accommodation summary..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-medium leading-relaxed resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSaveAccommodations}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-cyan-400"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── RECORD REVIEW NOTES MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showReviewNotesModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewNotesModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="z-50 w-full max-w-md bg-[#0C0C0E] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Case Management</span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Record Review Notes</h3>
                </div>
                <button onClick={() => setShowReviewNotesModal(false)} className="text-white/40 hover:text-white text-xl font-bold font-mono">×</button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-white/55 font-semibold leading-relaxed">
                  Log a progress note or record an evaluation session for {activeStudent.name}. This note will be appended to the official accommodation audit history.
                </p>
                <div className="space-y-1">
                  <label className="text-[8.5px] text-white/40 uppercase tracking-widest font-mono block">Review Note</label>
                  <textarea
                    rows={4}
                    value={reviewNoteText}
                    onChange={(e) => setReviewNoteText(e.target.value)}
                    placeholder="Enter details of review session (e.g. Verified with student, updated exam accommodations schedule...)"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 font-semibold leading-relaxed resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSaveReviewNotes}
                  disabled={!reviewNoteText.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowReviewNotesModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold uppercase tracking-wider text-[10px] transition-all hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
