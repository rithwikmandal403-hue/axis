"use client";

import { useMemo, useState, useEffect } from "react";
import { type Theme } from "@/lib/theme-utils";
import { motion } from "framer-motion";

// Terminology Tooltip Component
function TermTooltip({ term, definition, children }: { term: string; definition: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dashed border-white/20 hover:border-cyan-400/80 transition-colors">
        {children}
      </span>
      {visible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-zinc-950/95 border border-cyan-500/20 text-[10px] text-white/90 leading-relaxed rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none transition-all duration-150">
          <span className="block font-bold text-cyan-400 mb-0.5 uppercase tracking-wide">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}

// Progress Segment Bar helper
function SegmentedProgress({ onTrack, watch, atRisk, overdue }: { onTrack: number; watch: number; atRisk: number; overdue: number }) {
  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div className="h-full bg-emerald-500" style={{ width: `${onTrack}%` }} title={`On Track: ${onTrack}%`} />
        <div className="h-full bg-blue-500" style={{ width: `${watch}%` }} title={`Watch: ${watch}%`} />
        <div className="h-full bg-amber-500" style={{ width: `${atRisk}%` }} title={`At Risk: ${atRisk}%`} />
        <div className="h-full bg-red-500" style={{ width: `${overdue}%` }} title={`Overdue: ${overdue}%`} />
      </div>
      <div className="flex justify-between text-[8px] text-white/40">
        <span className="flex items-center gap-1"><span className="size-1 bg-emerald-500 rounded-full" /> {onTrack}% Track</span>
        <span className="flex items-center gap-1"><span className="size-1 bg-blue-500 rounded-full" /> {watch}% Watch</span>
        <span className="flex items-center gap-1"><span className="size-1 bg-amber-500 rounded-full" /> {atRisk}% Risk</span>
        <span className="flex items-center gap-1"><span className="size-1 bg-red-500 rounded-full" /> {overdue}% Overdue</span>
      </div>
    </div>
  );
}

interface AssessmentMarker {
  name: string;
  date: string;
  avg: string;
  high: string;
  low: string;
  x: number;
  y: number; // Viewport position
}

interface AnalyticsPoint {
  val: number;
  marker: AssessmentMarker;
}

interface StudentTimelineItem {
  period: string;
  grade: number;
  attendance: number;
  submissionState: string;
  assessment: string;
}

interface SubjectPerformanceStudent {
  id: string;
  name: string;
  avgGrade: number;
  attendance: number;
  submissions: number;
  overdueCount: number;
  status: string;
  insight: string;
  timeline: StudentTimelineItem[];
}

interface SubjectPerformanceItem {
  id: string;
  subject: string;
  avg: string;
  change: string;
  direction: string;
  insight: string;
  risk: string;
  suggestedAction: string;
  points: AnalyticsPoint[];
  timeframes: {
    month: AnalyticsPoint[];
    year: AnalyticsPoint[];
    overall: AnalyticsPoint[];
  };
  color: string;
  students: SubjectPerformanceStudent[];
  contextInsights: string[];
}

export function SchoolAnalytics({ theme }: { theme: Theme }) {
  const [showEnrollment, setShowEnrollment] = useState(false);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "year" | "overall">("month");
  const [hoveredMarker, setHoveredMarker] = useState<(AssessmentMarker & { subjectId: string }) | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [hoveredModalMarker, setHoveredModalMarker] = useState<{ marker: AssessmentMarker; x: number; y: number } | null>(null);

  const styling = useMemo(() => {
    return {
      dark: {
        panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
        border: "border-white/[0.06]",
        textMuted: "text-white/40",
        textPrimary: "text-white/90"
      },
      light: {
        panelBg: "bg-white border-zinc-200 shadow-sm",
        border: "border-black/[0.08]",
        textMuted: "text-black/50",
        textPrimary: "text-zinc-900"
      },
      "high-contrast": {
        panelBg: "bg-black border-2 border-white",
        border: "border-2 border-white",
        textMuted: "text-white",
        textPrimary: "text-white font-bold"
      },
      axis: {
        panelBg: "bg-[#121417]/90 border-white/[0.08]",
        border: "border-white/[0.08]",
        textMuted: "text-white/35",
        textPrimary: "text-cyan-50"
      }
    }[theme] || {
      panelBg: "bg-[#0C0C0E]/40 border-white/[0.06]",
      border: "border-white/[0.06]",
      textMuted: "text-white/40",
      textPrimary: "text-white/90"
    };
  }, [theme]);

  // Section 1 Data: Programme Health Overview
  const programmeHealth = [
    { name: "Attendance Stability", value: "95.4%", trend: "Stable", risk: "Low", riskColor: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" },
    { name: "TOK Progress", value: "88.2%", trend: "Slowing", risk: "Medium", riskColor: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
    { name: "EE Completion", value: "76.5%", trend: "Delay Warn", risk: "High", riskColor: "text-red-400 border-red-500/25 bg-red-500/5" },
    { name: "CAS Engagement", value: "91.0%", trend: "Improving", risk: "Low", riskColor: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" },
    { name: "Assessment Completion", value: "82.4%", trend: "Stable", risk: "Medium", riskColor: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
    { name: "University Readiness", value: "65.0%", trend: "Behind Target", risk: "High", riskColor: "text-red-400 border-red-500/25 bg-red-500/5" }
  ];

  // Subject performance and expanded drill-down dataset
  const subjectPerformance: SubjectPerformanceItem[] = useMemo(() => [
    { 
      id: "physics-hl",
      subject: "Physics HL", 
      avg: "5.1 / 7.0",
      change: "-4.2%", 
      direction: "down", 
      insight: "Physics HL performance has declined across three assessment cycles.",
      risk: "High Risk",
      suggestedAction: "Schedule study blocks & review lab data sessions.",
      points: [
        { val: 78, marker: { name: "Unit Test 1", date: "Jan 12", avg: "5.4", high: "7.0", low: "3.5", x: 0, y: 5 } },
        { val: 76, marker: { name: "Mock Exam 1", date: "Feb 18", avg: "5.3", high: "7.0", low: "3.0", x: 33, y: 10 } },
        { val: 72, marker: { name: "IA Draft Submission", date: "Mar 22", avg: "5.0", high: "6.8", low: "2.8", x: 66, y: 22 } },
        { val: 69, marker: { name: "Semester Assessment", date: "Apr 28", avg: "4.8", high: "6.5", low: "2.5", x: 100, y: 32 } }
      ],
      timeframes: {
        month: [
          { val: 78, marker: { name: "Weekly Quiz 1", date: "Apr 05", avg: "5.4", high: "7.0", low: "3.5", x: 0, y: 5 } },
          { val: 75, marker: { name: "Weekly Quiz 2", date: "Apr 12", avg: "5.2", high: "6.9", low: "3.2", x: 33, y: 10 } },
          { val: 72, marker: { name: "Weekly Quiz 3", date: "Apr 19", avg: "5.0", high: "6.8", low: "2.8", x: 66, y: 22 } },
          { val: 69, marker: { name: "Weekly Quiz 4", date: "Apr 26", avg: "4.8", high: "6.5", low: "2.5", x: 100, y: 32 } }
        ],
        year: [
          { val: 77, marker: { name: "Term 1 Exam", date: "Oct 15", avg: "5.3", high: "7.0", low: "3.2", x: 0, y: 8 } },
          { val: 74, marker: { name: "Term 2 Exam", date: "Dec 18", avg: "5.1", high: "6.9", low: "2.9", x: 33, y: 15 } },
          { val: 70, marker: { name: "Term 3 Exam", date: "Mar 12", avg: "4.9", high: "6.7", low: "2.6", x: 66, y: 25 } },
          { val: 68, marker: { name: "Term 4 Exam", date: "Jun 02", avg: "4.7", high: "6.4", low: "2.4", x: 100, y: 34 } }
        ],
        overall: [
          { val: 80, marker: { name: "Year 2024 Avg", date: "2024", avg: "5.6", high: "7.0", low: "3.8", x: 0, y: 2 } },
          { val: 76, marker: { name: "Year 2025 Avg", date: "2025", avg: "5.3", high: "7.0", low: "3.0", x: 33, y: 10 } },
          { val: 72, marker: { name: "Year 2026 Avg", date: "2026", avg: "5.0", high: "6.8", low: "2.8", x: 66, y: 22 } },
          { val: 68, marker: { name: "Year 2027 Proj", date: "2027", avg: "4.7", high: "6.5", low: "2.5", x: 100, y: 32 } }
        ]
      },
      color: "stroke-red-400",
      students: [
        {
          id: "std-chloe",
          name: "Chloe Vance",
          avgGrade: 4.2,
          attendance: 88,
          submissions: 80,
          overdueCount: 2,
          status: "warning",
          insight: "Performance declined from Grade 5 to Grade 4 after attendance dropped below 90% and IA drafts fell behind.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 5, attendance: 94, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 5, attendance: 92, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (IA Draft)", grade: 4, attendance: 88, submissionState: "2 Days Late", assessment: "IA Draft Submission" },
            { period: "Apr (Semester Assessment)", grade: 4, attendance: 87, submissionState: "Overdue", assessment: "Semester Assessment" }
          ]
        },
        {
          id: "std-peter",
          name: "Peter Parker",
          avgGrade: 3.1,
          attendance: 78,
          submissions: 65,
          overdueCount: 4,
          status: "risk",
          insight: "Peter's grade remains critically low at 3, correlating with a severe attendance drop (78% average) and 4 overdue IA drafts.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 4, attendance: 85, submissionState: "1 Day Late", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 3, attendance: 79, submissionState: "2 Days Late", assessment: "Mock Exam 1" },
            { period: "Mar (IA Draft)", grade: 3, attendance: 76, submissionState: "3 Days Late", assessment: "IA Draft Submission" },
            { period: "Apr (Semester Assessment)", grade: 3, attendance: 75, submissionState: "Overdue", assessment: "Semester Assessment" }
          ]
        },
        {
          id: "std-aarav",
          name: "Aarav Chen",
          avgGrade: 6.5,
          attendance: 96,
          submissions: 100,
          overdueCount: 0,
          status: "optimal",
          insight: "Aarav shows steady high growth (Grade 6 to 7), aligned with optimal 96% attendance and 100% on-time submission rate.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 6, attendance: 98, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 6, attendance: 97, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (IA Draft)", grade: 6, attendance: 96, submissionState: "On Time", assessment: "IA Draft Submission" },
            { period: "Apr (Semester Assessment)", grade: 7, attendance: 96, submissionState: "On Time", assessment: "Semester Assessment" }
          ]
        },
        {
          id: "std-lucas",
          name: "Lucas Gray",
          avgGrade: 5.4,
          attendance: 93,
          submissions: 92,
          overdueCount: 1,
          status: "optimal",
          insight: "Lucas maintains a stable average grade above 5, demonstrating high attendance stability (93%).",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 5, attendance: 94, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 5, attendance: 93, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (IA Draft)", grade: 5, attendance: 92, submissionState: "1 Day Late", assessment: "IA Draft Submission" },
            { period: "Apr (Semester Assessment)", grade: 6, attendance: 93, submissionState: "On Time", assessment: "Semester Assessment" }
          ]
        }
      ],
      contextInsights: [
        "Physics HL decline began after Mock Examination 1.",
        "Students missing more than 10% of lessons show lower assessment growth.",
        "Chloe Vance's grade dropped below target following attendance issues."
      ]
    },
    { 
      id: "math-aa-hl",
      subject: "Math AA HL", 
      avg: "6.2 / 7.0",
      change: "+2.1%", 
      direction: "up", 
      insight: "Math AA HL showing positive growth following section expansion.",
      risk: "Optimal",
      suggestedAction: "Monitor workload and verify balance.",
      points: [
        { val: 70, marker: { name: "Unit Test 1", date: "Jan 15", avg: "5.0", high: "6.8", low: "2.8", x: 0, y: 35 } },
        { val: 71, marker: { name: "Mock Exam 1", date: "Feb 20", avg: "5.1", high: "7.0", low: "3.0", x: 33, y: 30 } },
        { val: 73, marker: { name: "Support Session Start", date: "Mar 10", avg: "5.3", high: "7.0", low: "3.2", x: 66, y: 18 } },
        { val: 75, marker: { name: "Semester Assessment", date: "Apr 25", avg: "5.5", high: "7.0", low: "3.5", x: 100, y: 5 } }
      ],
      timeframes: {
        month: [
          { val: 70, marker: { name: "Weekly Quiz 1", date: "Apr 05", avg: "5.0", high: "6.5", low: "3.0", x: 0, y: 35 } },
          { val: 72, marker: { name: "Weekly Quiz 2", date: "Apr 12", avg: "5.1", high: "6.8", low: "3.2", x: 33, y: 30 } },
          { val: 73, marker: { name: "Weekly Quiz 3", date: "Apr 19", avg: "5.3", high: "7.0", low: "3.2", x: 66, y: 18 } },
          { val: 75, marker: { name: "Weekly Quiz 4", date: "Apr 26", avg: "5.5", high: "7.0", low: "3.5", x: 100, y: 5 } }
        ],
        year: [
          { val: 68, marker: { name: "Term 1 Exam", date: "Oct 15", avg: "4.8", high: "6.5", low: "2.5", x: 0, y: 40 } },
          { val: 71, marker: { name: "Term 2 Exam", date: "Dec 18", avg: "5.0", high: "6.8", low: "2.8", x: 33, y: 30 } },
          { val: 73, marker: { name: "Term 3 Exam", date: "Mar 12", avg: "5.2", high: "7.0", low: "3.0", x: 66, y: 20 } },
          { val: 76, marker: { name: "Term 4 Exam", date: "Jun 02", avg: "5.6", high: "7.0", low: "3.5", x: 100, y: 4 } }
        ],
        overall: [
          { val: 65, marker: { name: "Year 2024 Avg", date: "2024", avg: "4.5", high: "6.0", low: "2.5", x: 0, y: 50 } },
          { val: 70, marker: { name: "Year 2025 Avg", date: "2025", avg: "5.0", high: "6.8", low: "2.8", x: 33, y: 35 } },
          { val: 74, marker: { name: "Year 2026 Avg", date: "2026", avg: "5.4", high: "7.0", low: "3.2", x: 66, y: 15 } },
          { val: 78, marker: { name: "Year 2027 Proj", date: "2027", avg: "5.8", high: "7.0", low: "3.5", x: 100, y: 2 } }
        ]
      },
      color: "stroke-emerald-400",
      students: [
        {
          id: "std-chloe",
          name: "Chloe Vance",
          avgGrade: 5.8,
          attendance: 94,
          submissions: 100,
          overdueCount: 0,
          status: "optimal",
          insight: "Chloe shows strong results in Math HL, matching high attendance metrics.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 5, attendance: 94, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 6, attendance: 95, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (Support Session)", grade: 6, attendance: 94, submissionState: "On Time", assessment: "Support Session" },
            { period: "Apr (Semester Assessment)", grade: 6, attendance: 94, submissionState: "On Time", assessment: "Semester Assessment" }
          ]
        },
        {
          id: "std-aarav",
          name: "Aarav Chen",
          avgGrade: 6.8,
          attendance: 98,
          submissions: 100,
          overdueCount: 0,
          status: "optimal",
          insight: "Aarav leads the Math HL cohort with near-perfect marks.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 7, attendance: 98, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 7, attendance: 98, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (Support Session)", grade: 6, attendance: 98, submissionState: "On Time", assessment: "Support Session" },
            { period: "Apr (Semester Assessment)", grade: 7, attendance: 98, submissionState: "On Time", assessment: "Semester Assessment" }
          ]
        }
      ],
      contextInsights: [
        "Math AA HL improvement coincided with additional support sessions.",
        "Cohort average increased 2.1% across the term."
      ]
    },
    { 
      id: "chemistry-hl",
      subject: "Chemistry HL", 
      avg: "5.5 / 7.0",
      change: "Stable", 
      direction: "stable", 
      insight: "Chemistry HL remains stable; lab limits approaching capacity.",
      risk: "Medium Risk",
      suggestedAction: "Initiate syllabus check & review grade moderation.",
      points: [
        { val: 73, marker: { name: "Unit Test 1", date: "Jan 18", avg: "5.4", high: "7.0", low: "3.2", x: 0, y: 20 } },
        { val: 73, marker: { name: "Mock Exam 1", date: "Feb 22", avg: "5.4", high: "7.0", low: "3.0", x: 33, y: 20 } },
        { val: 74, marker: { name: "Midterm Assessment", date: "Mar 15", avg: "5.5", high: "7.0", low: "3.2", x: 66, y: 15 } },
        { val: 73, marker: { name: "Semester Assessment", date: "Apr 29", avg: "5.4", high: "7.0", low: "3.1", x: 100, y: 20 } }
      ],
      timeframes: {
        month: [
          { val: 73, marker: { name: "Weekly Quiz 1", date: "Apr 05", avg: "5.4", high: "7.0", low: "3.2", x: 0, y: 20 } },
          { val: 74, marker: { name: "Weekly Quiz 2", date: "Apr 12", avg: "5.5", high: "7.0", low: "3.3", x: 33, y: 15 } },
          { val: 73, marker: { name: "Weekly Quiz 3", date: "Apr 19", avg: "5.4", high: "7.0", low: "3.2", x: 66, y: 20 } },
          { val: 73, marker: { name: "Weekly Quiz 4", date: "Apr 26", avg: "5.4", high: "7.0", low: "3.1", x: 100, y: 20 } }
        ],
        year: [
          { val: 72, marker: { name: "Term 1 Exam", date: "Oct 15", avg: "5.3", high: "7.0", low: "3.1", x: 0, y: 25 } },
          { val: 73, marker: { name: "Term 2 Exam", date: "Dec 18", avg: "5.4", high: "7.0", low: "3.2", x: 33, y: 20 } },
          { val: 74, marker: { name: "Term 3 Exam", date: "Mar 12", avg: "5.5", high: "7.0", low: "3.3", x: 66, y: 15 } },
          { val: 73, marker: { name: "Term 4 Exam", date: "Jun 02", avg: "5.4", high: "7.0", low: "3.1", x: 100, y: 20 } }
        ],
        overall: [
          { val: 71, marker: { name: "Year 2024 Avg", date: "2024", avg: "5.2", high: "6.8", low: "3.0", x: 0, y: 30 } },
          { val: 73, marker: { name: "Year 2025 Avg", date: "2025", avg: "5.4", high: "7.0", low: "3.2", x: 33, y: 20 } },
          { val: 73, marker: { name: "Year 2026 Avg", date: "2026", avg: "5.4", high: "7.0", low: "3.2", x: 66, y: 20 } },
          { val: 74, marker: { name: "Year 2027 Proj", date: "2027", avg: "5.5", high: "7.0", low: "3.3", x: 100, y: 15 } }
        ]
      },
      color: "stroke-cyan-400",
      students: [
        {
          id: "std-chloe",
          name: "Chloe Vance",
          avgGrade: 5.2,
          attendance: 90,
          submissions: 95,
          overdueCount: 0,
          status: "optimal",
          insight: "Chloe exhibits stable Chemistry grades, with a consistent grade of 5.",
          timeline: [
            { period: "Jan (Unit Test 1)", grade: 5, attendance: 91, submissionState: "On Time", assessment: "Unit Test 1" },
            { period: "Feb (Mock Exam 1)", grade: 5, attendance: 90, submissionState: "On Time", assessment: "Mock Exam 1" },
            { period: "Mar (Midterm)", grade: 5, attendance: 90, submissionState: "On Time", assessment: "Midterm Assessment" },
            { period: "Apr (Semester Assessment)", grade: 5, attendance: 90, submissionState: "On Time", assessment: "Semester Assessment" }
          ]
        }
      ],
      contextInsights: [
        "Chemistry HL remains stable across all terms.",
        "Lab limits are approaching capacity limits."
      ]
    }
  ], []);

  // Section 4 Data: Deadline Health
  const deadlineHealth = [
    { title: "TOK Exhibition", onTrack: 60, watch: 20, atRisk: 15, overdue: 5 },
    { title: "Extended Essay (EE) Drafts", onTrack: 45, watch: 25, atRisk: 20, overdue: 10 },
    { title: "CAS Reflections Logs", onTrack: 70, watch: 15, atRisk: 10, overdue: 5 },
    { title: "Science IA Drafts", onTrack: 50, watch: 30, atRisk: 10, overdue: 10 },
    { title: "University Submissions", onTrack: 35, watch: 30, atRisk: 20, overdue: 15 }
  ];

  // Section 5 Data: Faculty Workload Balance
  const facultyWorkload = [
    { title: "EE supervisor loads", count: "85%", utilLabel: "EE Allocation Capacity", desc: "124 active allocations out of 145 max" },
    { title: "CAS Advisor caseloads", count: "90%", utilLabel: "CAS Capacity", desc: "9 advisors tracking 184 candidates" },
    { title: "TOK Presentation Moderation", count: "95%", utilLabel: "TOK Capacity", desc: "8 teachers moderating 96 reports" },
    { title: "IB Internal Assessment volume", count: "78%", utilLabel: "IA Moderation Limit", desc: "5 departments grading 480 drafts" }
  ];

  // Section 6 Data: Attendance Intelligence
  const weeklyAttendance = [
    { day: "Mon", rate: "97.4%", color: "bg-emerald-500" },
    { day: "Tue", rate: "96.2%", color: "bg-emerald-500" },
    { day: "Wed", rate: "95.8%", color: "bg-emerald-500" },
    { day: "Thu", rate: "96.5%", color: "bg-emerald-500" },
    { day: "Fri", rate: "91.2%", color: "bg-red-400 animate-pulse" }
  ];

  // Section 7 Data: University Readiness
  const universityReadiness = [
    { label: "Predicted Grades Submitted", value: "92%" },
    { label: "Reference Letters Dispatched", value: "78%" },
    { label: "University Applications Completed", value: "64%" }
  ];

  // Section 8 Data: Context Engine Insights
  const intelligenceInsights = [
    { text: "Physics HL attendance has declined 8% this month.", priority: "high" },
    { text: "EE reviews for 12 students are overdue.", priority: "high" },
    { text: "CAS reflections are behind target across DP1.", priority: "medium" },
    { text: "Mathematics enrollment demand may require an additional section next year.", priority: "info" }
  ];

  // Demographic stats
  const enrollmentTrends = [
    { grade: "DP2", count: 88, growth: "+8%" },
    { grade: "DP1", count: 96, growth: "+12%" },
    { grade: "Grade 10", count: 118, growth: "+15%" },
    { grade: "Grade 9", count: 110, growth: "+6%" }
  ];

  // Resolve active drill-down record
  const activeSubject = useMemo(() => {
    return subjectPerformance.find(s => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId, subjectPerformance]);

  // Set default student when subject expands, and reset modal states
  useEffect(() => {
    if (activeSubject && activeSubject.students.length > 0) {
      setSelectedStudentId(activeSubject.students[0].id);
    } else {
      setSelectedStudentId(null);
    }
    setHoveredModalMarker(null);
    setSelectedTimeframe("month");
  }, [selectedSubjectId, activeSubject]);

  const activeStudent = useMemo(() => {
    if (!activeSubject) return null;
    return activeSubject.students.find(st => st.id === selectedStudentId) || null;
  }, [activeSubject, selectedStudentId]);

  return (
    <div className="space-y-6 relative">
      
      {/* ─── INTEL LAYER: CONTEXT ENGINE INSIGHTS ────────────────────────────── */}
      <div className={`p-5 rounded-3xl border ${styling.panelBg} bg-cyan-950/5 border-cyan-500/10`}>
        <div className="flex items-center gap-2 mb-3">
          <svg className="size-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 9l-3.348-3.348L9.813 15.904z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L5.25 13.5M3 16.25V21h4.75" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">Axis Intelligence Tray</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {intelligenceInsights.map((insight, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-start gap-2.5">
              <span className={`size-1.5 rounded-full shrink-0 mt-1 ${
                insight.priority === "high" ? "bg-red-400 animate-ping" : insight.priority === "medium" ? "bg-amber-400" : "bg-cyan-400"
              }`} />
              <p className="text-[10.5px] leading-relaxed text-white/80">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 1. PROGRAMME HEALTH OVERVIEW ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {programmeHealth.map((card, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${styling.panelBg} flex flex-col justify-between h-28`}>
            <div>
              <span className="text-[9px] text-white/35 font-semibold block truncate">{card.name}</span>
              <p className="text-lg font-bold text-white font-mono mt-1 leading-none">{card.value}</p>
            </div>
            <div className="flex justify-between items-center mt-2.5">
              <span className="text-[8px] text-white/40 leading-none">{card.trend}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${card.riskColor}`}>
                {card.risk}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── 2 & 3. SUBJECT PERFORMANCE TRENDS & RISKS ────────────────────── */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${styling.panelBg} space-y-6 relative`}>
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Academic Indicators</span>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Subject Performance Trends</h3>
              <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/20 px-2 py-0.5 rounded uppercase font-mono">
                Click Card to Investigate
              </span>
            </div>
            <p className="text-[11px] text-white/35">Tracking cohort grade point averages over time. Hover graph nodes for markers; click card to explore.</p>
          </div>

          <div className="space-y-4">
            {subjectPerformance.map((sub) => {
              // Draw coordinates
              const yMin = 60;
              const yMax = 82;
              const height = 24;
              const pointsStr = sub.points.map((p, pIdx) => {
                const x = (pIdx / (sub.points.length - 1)) * 100;
                const y = height - ((p.val - yMin) / (yMax - yMin)) * height;
                return `${x},${y}`;
              }).join(" ");

              return (
                <div 
                  key={sub.id} 
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className="p-4 bg-white/[0.01] border border-white/[0.03] hover:border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer transition-all hover:bg-white/[0.02] group/card"
                >
                  <div className="space-y-1 max-w-sm">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white leading-none group-hover/card:text-cyan-400 transition-colors">{sub.subject}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        sub.direction === "down" ? "text-red-400 border-red-500/25 bg-red-500/5" : sub.direction === "up" ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" : "text-cyan-400 border-cyan-500/25 bg-cyan-500/5"
                      }`}>
                        {sub.direction === "down" ? "↘" : sub.direction === "up" ? "↗" : "•"} {sub.change}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-white/70 leading-relaxed">{sub.insight}</p>
                    <div className="pt-1.5 flex flex-wrap gap-2 items-center text-[9px]">
                      <span className="text-white/40 font-bold uppercase">Action:</span>
                      <span className="text-cyan-400 font-semibold">{sub.suggestedAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 self-stretch sm:self-auto justify-between sm:justify-start" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <span className="text-[9px] text-white/30 block">Cycle Average</span>
                      <span className="text-xs font-extrabold text-white font-mono">{sub.avg}</span>
                    </div>
                    
                    {/* SVG Sparkline with Hover Markers */}
                    <div className="w-24 h-6 border-b border-white/5 relative shrink-0">
                      <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={sub.color}
                          points={pointsStr}
                        />
                        {sub.points.map((p, pIdx) => {
                          const x = (pIdx / (sub.points.length - 1)) * 100;
                          const y = height - ((p.val - yMin) / (yMax - yMin)) * height;
                          return (
                            <circle
                              key={pIdx}
                              cx={x}
                              cy={y}
                              r="3.5"
                              className="fill-zinc-950 stroke-white hover:stroke-cyan-400 hover:fill-cyan-400/20 cursor-crosshair transition-all"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const parentRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                setHoveredMarker({
                                  ...p.marker,
                                  subjectId: sub.id,
                                  x: rect.left - (parentRect ? parentRect.left : 0) - 80,
                                  y: rect.top - (parentRect ? parentRect.top : 0) - 65
                                });
                              }}
                              onMouseLeave={() => setHoveredMarker(null)}
                              onClick={() => setSelectedSubjectId(sub.id)}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sparkline tooltip popup */}
            {hoveredMarker && (
              <div 
                className="absolute z-50 p-2.5 bg-zinc-950/95 border border-cyan-500/20 text-[9px] text-white rounded-xl shadow-xl backdrop-blur-xl pointer-events-none w-44 space-y-1"
                style={{ left: hoveredMarker.x, top: hoveredMarker.y }}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="font-extrabold text-cyan-400 uppercase tracking-wide truncate max-w-[100px]">{hoveredMarker.name}</span>
                  <span className="text-white/40 font-mono">{hoveredMarker.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[8px] text-white/60">
                  <div>
                    <span className="block text-white/30">Avg</span>
                    <strong className="text-white font-mono">{hoveredMarker.avg}</strong>
                  </div>
                  <div>
                    <span className="block text-white/30">High</span>
                    <strong className="text-emerald-400 font-mono">{hoveredMarker.high}</strong>
                  </div>
                  <div>
                    <span className="block text-white/30">Low</span>
                    <strong className="text-red-400 font-mono">{hoveredMarker.low}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── 4. DEADLINE HEALTH (PROGRESS SEGMENTS) ────────────────────────── */}
        <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-6`}>
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Milestone Tracking</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Deadline Health Ledger</h3>
            <p className="text-[11px] text-white/35">Target progress distribution segments across core IB DP coordinates.</p>
          </div>

          <div className="space-y-4">
            {deadlineHealth.map((dl, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-white/80">
                  <span>{dl.title}</span>
                </div>
                <SegmentedProgress 
                  onTrack={dl.onTrack} 
                  watch={dl.watch} 
                  atRisk={dl.atRisk} 
                  overdue={dl.overdue} 
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ─── 5. FACULTY WORKLOAD BALANCE ───────────────────────────────────── */}
        <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-5`}>
          <div>
            <TermTooltip term="Supervisor Load" definition="Active students assigned for EE or CAS supervision relative to target loads.">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Supervisor Capacity Utilization</span>
            </TermTooltip>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Faculty Workload Balance</h3>
            <p className="text-[11px] text-white/35">Weekly supervisor ratios for Extended Essays and TOK moderation workload.</p>
          </div>

          <div className="space-y-3">
            {facultyWorkload.map((fw, idx) => (
              <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl space-y-1.5">
                <div className="flex justify-between text-[11px] text-white/85 font-semibold">
                  <span>{fw.title}</span>
                  <TermTooltip term="Capacity Utilization" definition="Facility occupancy or supervisor caseload divided by total capacity limits.">
                    <span className="font-mono text-cyan-400">{fw.count}</span>
                  </TermTooltip>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: fw.count }} />
                </div>
                <p className="text-[9px] text-white/35 leading-tight">{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 6. ATTENDANCE INTELLIGENCE & COMPARISONS ──────────────────────── */}
        <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-5`}>
          <div>
            <TermTooltip term="Attendance Ratio" definition="Percentage of school days attended relative to total active school days.">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Pattern & Cohort Comparisons</span>
            </TermTooltip>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Attendance Intelligence</h3>
            <p className="text-[11px] text-white/35">Anomaly detection highlights and weekly rate patterns.</p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-2.5">
              <span className="text-xs">⚠️</span>
              <div className="space-y-0.5">
                <strong className="text-[11px] text-red-400 block font-bold font-mono">Recurring Pattern Alert</strong>
                <p className="text-[10px] text-red-400/80 leading-relaxed">
                  DP1 attendance has declined every Friday for 4 consecutive weeks. Check advisor logs.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[9px] text-white/40 uppercase tracking-wider block font-bold">Weekly Performance</span>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                {weeklyAttendance.map((att, idx) => (
                  <div key={idx} className="p-2 bg-white/[0.01] border border-white/[0.03] rounded-xl space-y-1">
                    <span className="text-white/40 block leading-none">{att.day}</span>
                    <strong className="font-mono text-white/85 block leading-tight">{att.rate.replace("%", "")}</strong>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${att.color}`} style={{ width: att.rate }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px]">
              <div>
                <span className="text-white/30 block uppercase text-[8px] tracking-wider font-bold">DP1 Average</span>
                <span className="text-white font-mono font-bold">94.2%</span>
              </div>
              <div>
                <span className="text-white/30 block uppercase text-[8px] tracking-wider font-bold">DP2 Average</span>
                <span className="text-white font-mono font-bold">96.5%</span>
              </div>
              <span className="text-[9px] text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded font-mono font-bold">
                +2.3% DP2 Lead
              </span>
            </div>
          </div>
        </div>

        {/* ─── 7. UNIVERSITY & GRADUATION READINESS ───────────────────────────── */}
        <div className={`p-6 rounded-3xl border ${styling.panelBg} space-y-5`}>
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block font-mono">Graduation Track</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">University Readiness</h3>
            <p className="text-[11px] text-white/35">UCAS & CommonApp reference checklists and portfolio submissions.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <strong className="text-[11px] text-amber-400 block font-bold font-mono">UCAS Submission</strong>
                <span className="text-[9px] text-amber-400/70">Main cycle lock approaches</span>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-500/20 font-mono">
                12 Days left
              </span>
            </div>

            <div className="space-y-3.5">
              {universityReadiness.map((ur, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-white/80 font-semibold">
                    <span>{ur.label}</span>
                    <span className="font-mono text-cyan-400">{ur.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: ur.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── 8. SUPPORTING DEMOGRAPHIC DATA (DEMOTED) ───────────────────────── */}
      <div className={`p-4 rounded-2xl border ${styling.panelBg} transition-all`}>
        <button 
          onClick={() => setShowEnrollment(!showEnrollment)}
          className="flex justify-between items-center w-full text-left"
        >
          <div className="flex items-center gap-2">
            <svg className={`size-3.5 text-white/40 transition-transform ${showEnrollment ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Cohort Demographics Reference Logs
            </span>
          </div>
          <span className="text-[9px] text-cyan-400/80 hover:text-cyan-400 font-bold font-mono">
            {showEnrollment ? "Hide Reference" : "View Reference"}
          </span>
        </button>

        {showEnrollment && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {enrollmentTrends.map((e, idx) => (
              <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex justify-between items-center font-semibold">
                <div>
                  <span className="text-[9px] opacity-45">{e.grade}</span>
                  <TermTooltip term="YoY" definition="Year-over-Year comparison against the same period last academic year.">
                    <p className="text-white mt-0.5 font-mono">{e.count} EnrolledLog</p>
                  </TermTooltip>
                </div>
                <TermTooltip term="MoM" definition="Month-over-Month comparison against the preceding month's metrics.">
                  <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/20 px-1.5 py-0.5 rounded">
                    {e.growth} Growth
                  </span>
                </TermTooltip>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── EXPANDED SUBJECT DRILL-DOWN MODAL / PANEL ─────────────────────── */}
      {activeSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-[#0d0f12]/95 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest font-mono">Subject Deep Dive</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                    activeSubject.direction === "down" ? "text-red-400 border-red-500/25 bg-red-500/5" : "text-emerald-400 border-emerald-500/25 bg-emerald-500/5"
                  }`}>
                    {activeSubject.direction === "down" ? "↘" : "↗"} {activeSubject.change} Trend
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white uppercase mt-1 tracking-wider">{activeSubject.subject} Analytics</h2>
                <p className="text-xs text-white/40">{activeSubject.insight}</p>
              </div>
              <button 
                onClick={() => setSelectedSubjectId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all"
              >
                ✕ Close Explorer
              </button>
            </div>

            {/* Modal Workspace */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive Graph & Timeframe Toggles */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Timeframe selector */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-xl">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider pl-2.5">Timeframe View</span>
                  <div className="flex gap-1">
                    {(["month", "year", "overall"] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all ${
                          selectedTimeframe === tf 
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {tf === "month" && "Month"}
                        {tf === "year" && "Year"}
                        {tf === "overall" && "Overall"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expanded Graph Rendering */}
                <div className="p-5 rounded-2xl border border-white/[0.05] bg-white/[0.01] space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider">Cohort Assessment Progression</span>
                      <strong className="block text-xs text-white font-mono mt-0.5">Average Performance (out of 7.0 max)</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-white/30 block">Current Cycle Average</span>
                      <span className="text-sm font-extrabold text-white font-mono">{activeSubject.avg}</span>
                    </div>
                  </div>

                  {/* High Fidelity Interactive SVG Line Chart */}
                  <div className="h-44 w-full relative border-b border-white/5 select-none">
                    {(() => {
                      const activePoints = activeSubject.timeframes[selectedTimeframe] || activeSubject.points;
                      const chartWidth = 350;
                      const chartHeight = 90;
                      const paddingLeft = 25;
                      const paddingTop = 15;

                      const getCoords = (pIdx: number, val: number) => {
                        const x = paddingLeft + (pIdx / (activePoints.length - 1)) * chartWidth;
                        const y = paddingTop + (1 - (val - 55) / 30) * chartHeight;
                        return { x, y };
                      };

                      const pathPoints = activePoints.map((p: AnalyticsPoint, pIdx: number) => {
                        const { x, y } = getCoords(pIdx, p.val);
                        return `${pIdx === 0 ? 'M' : 'L'} ${x},${y}`;
                      });
                      const linePathD = pathPoints.join(" ");
                      
                      const firstX = paddingLeft;
                      const lastX = paddingLeft + chartWidth;
                      const bottomY = paddingTop + chartHeight; // 105
                      const areaPathD = `${linePathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

                      const getXLabel = (idx: number, timeframe: string) => {
                        if (timeframe === "month") {
                          return `Week ${idx + 1}`;
                        } else if (timeframe === "year") {
                          return `Term ${idx + 1}`;
                        } else {
                          const years = ["2024", "2025", "2026", "2027 Proj"];
                          return years[idx] || "";
                        }
                      };

                      return (
                        <svg 
                          viewBox="0 0 400 130" 
                          preserveAspectRatio="none"
                          className="w-full h-full overflow-visible absolute inset-0 z-10"
                        >
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Guidelines */}
                          <line x1="25" y1="15" x2="375" y2="15" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                          <text x="25" y="10" className="fill-white/20 text-[8px] font-mono font-medium">7.0 (Highest)</text>

                          <line x1="25" y1="60" x2="375" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                          <text x="25" y="55" className="fill-white/20 text-[8px] font-mono font-medium">5.0 (Target)</text>

                          <line x1="25" y1="105" x2="375" y2="105" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                          <text x="25" y="100" className="fill-white/20 text-[8px] font-mono font-medium">3.0 (At Risk)</text>

                          {/* Area path with smooth morph animation */}
                          <motion.path
                            d={areaPathD}
                            fill="url(#areaGrad)"
                            animate={{ d: areaPathD }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          />

                          {/* Line path with smooth morph animation */}
                          <motion.path
                            d={linePathD}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            animate={{ d: linePathD }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                          />

                          {/* Interactive node circles with spring glide animation */}
                          {activePoints.map((p: AnalyticsPoint, pIdx: number) => {
                            const { x, y } = getCoords(pIdx, p.val);
                            return (
                              <g key={pIdx} className="group/node">
                                <motion.circle
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  animate={{ cx: x, cy: y }}
                                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                  className="fill-zinc-950 stroke-cyan-400 stroke-2 cursor-pointer hover:r-7 hover:fill-cyan-400 hover:stroke-white transition-all"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const parentRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                    if (parentRect) {
                                      setHoveredModalMarker({
                                        marker: p.marker,
                                        x: rect.left - parentRect.left + 8,
                                        y: rect.top - parentRect.top - 62
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredModalMarker(null)}
                                />
                              </g>
                            );
                          })}

                          {/* Dynamically positioned X-Axis Labels directly inside SVG */}
                          {activePoints.map((p: AnalyticsPoint, pIdx: number) => {
                            const { x } = getCoords(pIdx, p.val);
                            return (
                              <text
                                key={`xlabel-${pIdx}`}
                                x={x}
                                y={124}
                                textAnchor="middle"
                                className="fill-white/30 text-[8.5px] font-mono font-semibold tracking-wider"
                              >
                                {getXLabel(pIdx, selectedTimeframe)}
                              </text>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {/* High Fidelity Tooltip Overlay */}
                    {hoveredModalMarker && (
                      <div 
                        className="absolute z-50 p-2.5 bg-zinc-950/95 border border-cyan-500/20 text-[9px] text-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none w-44 space-y-1 transition-opacity duration-150"
                        style={{ left: hoveredModalMarker.x, top: hoveredModalMarker.y }}
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="font-extrabold text-cyan-400 uppercase tracking-wide truncate max-w-[100px]">{hoveredModalMarker.marker.name}</span>
                          <span className="text-white/40 font-mono">{hoveredModalMarker.marker.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[8px] text-white/60">
                          <div>
                            <span className="block text-white/30">Avg</span>
                            <strong className="text-white font-mono">{hoveredModalMarker.marker.avg}</strong>
                          </div>
                          <div>
                            <span className="block text-white/30">High</span>
                            <strong className="text-emerald-400 font-mono">{hoveredModalMarker.marker.high}</strong>
                          </div>
                          <div>
                            <span className="block text-white/30">Low</span>
                            <strong className="text-red-400 font-mono">{hoveredModalMarker.marker.low}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytical Insights Layer */}
                <div className="p-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block font-extrabold font-mono">Analytical Insights</span>
                  <div className="space-y-2">
                    {activeSubject.contextInsights.map((ci, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10.5px] text-white/85">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{ci}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Student Breakdown & Timeline Correlation */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Student List Table */}
                <div className="p-5 rounded-2xl border border-white/[0.05] bg-white/[0.01] space-y-3">
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block font-mono">Enrolled Student Breakdown</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeSubject.students.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudentId(st.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedStudentId === st.id 
                            ? "bg-cyan-500/10 border-cyan-500/30" 
                            : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <strong className="text-xs text-white block font-bold">{st.name}</strong>
                          <div className="flex gap-2 text-[9px] text-white/40">
                            <span>Att: {st.attendance}%</span>
                            <span>•</span>
                            <span>Sub: {st.submissions}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[8px] text-white/30 block leading-tight">Average</span>
                            <span className="text-xs font-mono font-bold text-white">{st.avgGrade}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            st.status === "optimal" ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/15" : st.status === "warning" ? "text-amber-400 bg-amber-500/5 border border-amber-500/15" : "text-red-400 bg-red-500/5 border border-red-500/15"
                          }`}>
                            {st.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Student Timeline Correlation Panel */}
                {activeStudent && (
                  <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-950/5 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest font-mono">Chloe timeline</span>
                        <h4 className="text-xs font-extrabold text-white">{activeStudent.name}&apos;s Progress Story</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                        activeStudent.status === "optimal" ? "text-emerald-400 border-emerald-500/20" : activeStudent.status === "warning" ? "text-amber-400 border-amber-500/20" : "text-red-400 border-red-500/20"
                      }`}>
                        {activeStudent.status} Track
                      </span>
                    </div>

                    {/* Timeline Log */}
                    <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                      {activeStudent.timeline.map((tl: StudentTimelineItem, idx: number) => (
                        <div key={idx} className="pl-6 relative">
                          <div className={`absolute left-[5px] top-1.5 size-1.5 rounded-full ${
                            tl.grade >= 6 ? "bg-emerald-500" : tl.grade >= 5 ? "bg-cyan-500" : "bg-red-400 animate-pulse"
                          } z-10`} />
                          <div className="flex justify-between items-start text-[10px]">
                            <div>
                              <strong className="text-white block font-bold">{tl.assessment}</strong>
                              <span className="text-white/40 text-[9px]">{tl.period}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-white/80 block font-mono font-bold">Grade {tl.grade}</span>
                              <span className={`text-[8px] block ${
                                tl.submissionState === "On Time" ? "text-white/30" : "text-amber-400"
                              }`}>{tl.submissionState}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Correlation Insight Callout */}
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-[10px] leading-relaxed">
                      <strong className="text-cyan-400 font-bold block mb-1">Attendance Correlation Alert</strong>
                      <p className="text-white/80 font-medium">{activeStudent.insight}</p>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
