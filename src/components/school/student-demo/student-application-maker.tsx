"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

// ─── Types ───────────────────────────────────────────────────────────────────

type UniversityApp = {
  id: string;
  university: string;
  major: string;
  country: string;
  deadline: string;
  priority: "Dream Choice" | "First Choice" | "Target" | "Match" | "Safety" | "Backup" | "Custom";
  platform: "CommonApp" | "UCAS" | "Direct" | "Coalition" | "OUAC";
  status: "Drafting" | "Counselor Review" | "Ready";
  reviewStatus: "Changes Requested" | "Approved" | "Under Review";
  requirements: string[];
};

type MaterialState = {
  method: "write" | "upload" | "db" | "resources" | "essential" | "draft";
  fileName?: string;
  textContent?: string;
};

type Comment = {
  id: number;
  author: string;
  role: string;
  time: string;
  text: string;
  avatar: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const PERSONAL_DB_FILES = [
  { name: "Chloe_Vance_Resume_2026.pdf", size: "420KB", type: "PDF" },
  { name: "Extended_Essay_Final_Draft.pdf", size: "2.4MB", type: "PDF" },
  { name: "Physics_IA_Inductance.pdf", size: "1.8MB", type: "PDF" },
  { name: "Calculus_Limits_Exercise.docx", size: "820KB", type: "DOCX" },
  { name: "Activity_Profile_Aarav.xlsx", size: "150KB", type: "XLSX" },
];

const CONNECTED_RESOURCES_FILES = [
  { name: "Imperial_Physics_Personal_Statement_Rubric.pdf", type: "PDF" },
  { name: "UCAS_Reference_Guideline_2026.pdf", type: "PDF" },
  { name: "CommonApp_Activity_Outline_Framework.docx", type: "DOCX" },
  { name: "MIT_Physics_Core_Expectations.txt", type: "TXT" },
];

const ESSENTIAL_SPACE_ITEMS = [
  { name: "Physics IA Draft Outline", type: "Note", content: "Personal outline structure for Physics Internal Assessment." },
  { name: "Syllabus Verification Chart", type: "Screenshot", content: "Screenshot of Math AA HL limits graph." },
  { name: "CAS Community Garden Proposal", type: "Note", content: "Draft planning notes for CAS group project." },
];

const DEFAULT_ESSAY_DRAFT = `When studying the quantum alignment of particles under magnetic flux, I realized that the boundaries between theoretical calculations and physical phenomena are where discovery happens. In my Physics HL class, under Aarav Chen's guidance, I designed an IA investigating magnetic inductance variables, which sparked my deep curiosity. I wish to explore this further at the collegiate level, combining advanced physics with computing models...`;

const INITIAL_UNIVERSITIES: UniversityApp[] = [
  {
    id: "imperial",
    university: "Imperial College London",
    major: "BSc Physics (Honours)",
    country: "UK",
    deadline: "2026-10-15",
    priority: "First Choice",
    platform: "UCAS",
    status: "Drafting",
    reviewStatus: "Changes Requested",
    requirements: ["Personal Statement", "Resume", "Transcript"],
  },
  {
    id: "mit",
    university: "MIT",
    major: "BSc Physics & Computer Science",
    country: "US",
    deadline: "2027-01-01",
    priority: "Dream Choice",
    platform: "CommonApp",
    status: "Counselor Review",
    reviewStatus: "Under Review",
    requirements: ["Personal Statement", "Resume", "Transcript", "SAT Scores"],
  },
  {
    id: "edinburgh",
    university: "University of Edinburgh",
    major: "BSc Astrophysics",
    country: "UK",
    deadline: "2027-01-15",
    priority: "Target",
    platform: "UCAS",
    status: "Ready",
    reviewStatus: "Approved",
    requirements: ["Personal Statement", "Transcript", "Recommendation Letter"],
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function StudentApplicationMaker({ theme = "dark" }: { theme?: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"console" | "readiness">("console");
  const [selectedAppId, setSelectedAppId] = useState<string>("imperial");
  const [selectedRequirement, setSelectedRequirement] = useState<string>("Personal Statement");

  // Core app state
  const [universities, setUniversities] = useState<UniversityApp[]>(INITIAL_UNIVERSITIES);
  const [materials, setMaterials] = useState<Record<string, MaterialState>>({
    "imperial-Transcript": { method: "upload", fileName: "Official_Transcript_G9_G11.pdf" },
    "mit-Personal Statement": { method: "write", textContent: DEFAULT_ESSAY_DRAFT },
    "mit-Transcript": { method: "upload", fileName: "Official_Transcript_G9_G11.pdf" },
    "mit-SAT Scores": { method: "upload", fileName: "SAT_Score_Report_2026.pdf" },
    "edinburgh-Personal Statement": { method: "write", textContent: "Astrophysics has always been the boundary..." },
    "edinburgh-Transcript": { method: "upload", fileName: "Official_Transcript_G9_G11.pdf" },
    "edinburgh-Recommendation Letter": { method: "upload", fileName: "Aarav_Chen_Recommendation.pdf" },
  });

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterCountry, setFilterCountry] = useState<string>("All");

  // New university form modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formUni, setFormUni] = useState("");
  const [formMajor, setFormMajor] = useState("");
  const [formCountry, setFormCountry] = useState("US");
  const [formDeadline, setFormDeadline] = useState("2027-01-01");
  const [formPriority, setFormPriority] = useState<UniversityApp["priority"]>("Target");
  const [formPlatform, setFormPlatform] = useState<UniversityApp["platform"]>("CommonApp");
  const [formRequirements, setFormRequirements] = useState<string[]>([
    "Personal Statement",
    "Resume",
    "Transcript",
  ]);

  // Document Editor states
  const [editorText, setEditorText] = useState("");
  const [simulatedUploading, setSimulatedUploading] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Counselor comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    "imperial-Personal Statement": [
      {
        id: 1,
        author: "Aarav Chen",
        role: "College Counselor & Advisor",
        time: "Yesterday, 02:40 PM",
        text: "Chloe, this draft is looking great, but your description of the Physics lab transition needs to focus more on your specific IA methodology. Let's get that updated.",
        avatar: "AC",
      },
    ],
  });
  const [newCommentText, setNewCommentText] = useState("");

  // Assembly Engine states
  const [assemblingAppId, setAssemblingAppId] = useState<string | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [assembledPackages, setAssembledPackages] = useState<Record<string, string>>({});

  // AI Advisor chat states
  type ChatMsg = { id: number; from: "ai" | "user"; text: string; time: string };
  const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 1,
      from: "ai",
      text: "Hi Chloe! 👋 I'm your AI Admissions Advisor. Based on your current profile (Tier A — Strong), here's what I recommend focusing on to push toward Tier S:\n\n• **Complete your Extended Essay** — it's currently your lowest-scoring area at 45%. A strong EE could meaningfully strengthen your Imperial College application.\n• **Add a second Recommendation Letter** — MIT strongly prefers two academic references. You only have one on file.\n• **Upload your SAT Score Report** for Edinburgh — their system shows this as missing.\n\nAsk me anything about your application!",
      time: "Now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);

  const AI_RESPONSES: Record<string, string> = {
    default: "Great question! Based on your profile, the highest-impact next step is completing your Extended Essay draft and getting a second recommendation letter uploaded. Both are flagged as gaps compared to typical admits at your target schools.",
    essay: "Your Personal Statement is solid, but admissions officers at Imperial and MIT love specificity. Try adding a concrete anecdote from your Physics IA on magnetic inductance — it directly links your coursework to your intended major. Aim for 650 words max and have Aarav Chen review it before submitting.",
    recommendation: "You currently have one recommendation letter on file. MIT's CommonApp requires two academic references, and Imperial strongly recommends a science teacher reference. Reach out to Dr. Priya Sharma (Chemistry SL) or Dr. Sarah Chen (Math HL) to request a second letter — ideally within the next 2 weeks.",
    sat: "Your SAT Score Report is marked as missing for your Edinburgh application. Upload it via the Application Maker → Edinburgh → SAT Scores component. If your score is below 1450, consider whether a strong predicted IB score (36+) can substitute — Edinburgh accepts both.",
    ee: "Your Extended Essay is at 45% completion, which is the biggest risk to your Tier A ranking. Focus on: (1) finalising your research question, (2) completing the 4000-word draft by next week, and (3) scheduling a Viva Voce session with your EE supervisor Aarav Chen.",
    cas: "Your CAS Portfolio is at 72% — good, but you need to log at least 3 more reflections before applications close. Focus on the Community Garden project and your piano practice logs. Ensure each reflection clearly links to the CAS learning outcomes.",
    tok: "Your TOK Assessment score is strong at 80%. Make sure your TOK Exhibition commentary is uploaded as a PDF and that your essay title aligns with one of the six official prompts. A strong TOK grade can help offset weaker areas.",
    imperial: "For Imperial College London, the key priorities are: (1) a physics-focused Personal Statement that references lab experience, (2) a strong predicted score of 38+ IB, and (3) early UCAS submission before October 15. Your profile is a strong match — don't let the deadline slip!",
    mit: "MIT is your Dream Choice and your most competitive application. They're looking for intellectual curiosity beyond coursework. Consider adding a research paper, a coding project, or a science competition result to your extracurriculars section. Your Physics IA could be reframed as a research highlight.",
    edinburgh: "Edinburgh is well within reach. Your predicted IB of 36 meets their typical offer. Make sure your Personal Statement mentions astrophysics specifically — vague statements hurt Edinburgh applicants. Upload the missing SAT report and you'll be in great shape.",
  };

  const handleChatSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMsg: ChatMsg = { id: Date.now(), from: "user", text: trimmed, time: nowTime() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatTyping(true);
    const lower = trimmed.toLowerCase();
    const key =
      lower.includes("essay") || lower.includes("personal statement") ? "essay" :
      lower.includes("recommendation") || lower.includes("letter") ? "recommendation" :
      lower.includes("sat") || lower.includes("score") ? "sat" :
      lower.includes("extended essay") || lower.includes(" ee") ? "ee" :
      lower.includes("cas") ? "cas" :
      lower.includes("tok") ? "tok" :
      lower.includes("imperial") ? "imperial" :
      lower.includes("mit") ? "mit" :
      lower.includes("edinburgh") ? "edinburgh" : "default";
    setTimeout(() => {
      setChatTyping(false);
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, from: "ai", text: AI_RESPONSES[key], time: nowTime() }]);
    }, 1400);
  };

  const activeApp = universities.find((u) => u.id === selectedAppId) || universities[0];

  // Sync editor when active app or selected requirement changes
  useEffect(() => {
    if (!activeApp) return;
    const materialKey = `${activeApp.id}-${selectedRequirement}`;
    const saved = materials[materialKey];
    if (saved && saved.method === "write") {
      setEditorText(saved.textContent || "");
    } else {
      setEditorText("");
    }
  }, [selectedAppId, selectedRequirement, materials]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const handleSaveWrittenEssay = () => {
    if (!activeApp) return;
    const materialKey = `${activeApp.id}-${selectedRequirement}`;
    setMaterials((prev) => ({
      ...prev,
      [materialKey]: {
        method: "write",
        textContent: editorText,
      },
    }));
    alert("Saved draft coordinates successfully!");
  };

  const handleImportFile = (fileName: string, method: MaterialState["method"]) => {
    if (!activeApp) return;
    const materialKey = `${activeApp.id}-${selectedRequirement}`;
    setMaterials((prev) => ({
      ...prev,
      [materialKey]: {
        method,
        fileName,
      },
    }));
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeApp) return;

    setSimulatedUploading(true);
    setSimulatedProgress(0);

    const interval = setInterval(() => {
      setSimulatedProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSimulatedUploading(false);
            const materialKey = `${activeApp.id}-${selectedRequirement}`;
            setMaterials((prev) => ({
              ...prev,
              [materialKey]: {
                method: "upload",
                fileName: file.name,
              },
            }));
          }, 300);
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleAddUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUni.trim()) return;

    const newId = formUni.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newApp: UniversityApp = {
      id: newId,
      university: formUni,
      major: formMajor || "Undeclared",
      country: formCountry,
      deadline: formDeadline,
      priority: formPriority,
      platform: formPlatform,
      status: "Drafting",
      reviewStatus: "Under Review",
      requirements: formRequirements,
    };

    setUniversities((prev) => [...prev, newApp]);
    setSelectedAppId(newId);
    setSelectedRequirement(formRequirements[0] || "Personal Statement");
    setShowAddModal(false);

    // Reset Form
    setFormUni("");
    setFormMajor("");
    setFormCountry("US");
    setFormDeadline("2027-01-01");
    setFormPriority("Target");
    setFormPlatform("CommonApp");
  };

  const handleRemoveUniversity = (id: string) => {
    if (confirm("Are you sure you want to remove this university application? This action cannot be undone.")) {
      setUniversities((prev) => prev.filter((u) => u.id !== id));
      if (selectedAppId === id) {
        const remaining = universities.filter((u) => u.id !== id);
        if (remaining.length > 0) {
          setSelectedAppId(remaining[0].id);
          setSelectedRequirement(remaining[0].requirements[0]);
        }
      }
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeApp) return;

    const commentKey = `${activeApp.id}-${selectedRequirement}`;
    const newComment: Comment = {
      id: Date.now(),
      author: "Chloe Vance",
      role: "Student (You)",
      time: "Just Now",
      text: newCommentText,
      avatar: "CV",
    };

    setComments((prev) => ({
      ...prev,
      [commentKey]: [...(prev[commentKey] || []), newComment],
    }));
    setNewCommentText("");
  };

  const handleSimulateCounselorFeedback = (status: "Approved" | "Changes Requested") => {
    if (!activeApp) return;

    // Toggle review status
    setUniversities((prev) =>
      prev.map((u) => (u.id === activeApp.id ? { ...u, reviewStatus: status } : u))
    );

    const commentKey = `${activeApp.id}-${selectedRequirement}`;
    const feedbackText = status === "Approved"
      ? "✓ [System Action] Counselor Aarav Chen has reviewed and APPROVED this component."
      : "⚠️ [System Action] Counselor Aarav Chen requested revisions for this component.";

    const systemComment: Comment = {
      id: Date.now(),
      author: "Aarav Chen",
      role: "College Counselor & Advisor",
      time: "Just Now",
      text: feedbackText,
      avatar: "AC",
    };

    setComments((prev) => ({
      ...prev,
      [commentKey]: [...(prev[commentKey] || []), systemComment],
    }));
  };

  const handleAssemblePackage = () => {
    if (!activeApp) return;
    setAssemblingAppId(activeApp.id);
    setAssemblyProgress(0);

    const interval = setInterval(() => {
      setAssemblyProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAssemblingAppId(null);
            setAssembledPackages((prev) => ({
              ...prev,
              [activeApp.id]: `chloe_vance_${activeApp.id}_package.zip`,
            }));
            // Mark app as ready
            setUniversities((prev) =>
              prev.map((u) => (u.id === activeApp.id ? { ...u, status: "Ready" } : u))
            );
          }, 400);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  // ─── Filter logic ────────────────────────────────────────────────────────────

  const filteredUniversities = universities.filter((u) => {
    if (filterStatus !== "All" && u.status !== filterStatus) return false;
    if (filterPriority !== "All" && u.priority !== filterPriority) return false;
    if (filterCountry !== "All" && u.country !== filterCountry) return false;
    return true;
  });

  // Calculate health metrics for active app
  const appMaterialsCount = activeApp ? activeApp.requirements.length : 0;
  const appCompletedCount = activeApp
    ? activeApp.requirements.filter((req) => !!materials[`${activeApp.id}-${req}`]).length
    : 0;
  const isAssemblyAllowed = appMaterialsCount > 0 && appCompletedCount === appMaterialsCount;

  return (
    <div className={`p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto ${styles.bg} ${styles.textPrimary} transition-colors duration-200`}>
      
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">University Tools</span>
          <h1 className={`text-2xl font-bold tracking-tight mt-1 ${styles.textPrimary}`}>Application Maker</h1>
          <p className={`text-xs mt-1 ${styles.textSecondary} opacity-60`}>Assemble final packages, connect database documents, and track counselor approvals.</p>
        </div>

        {/* Tab switcher */}
        <div className={`flex rounded-xl border p-1 shrink-0 ${
          isLight ? "bg-black/[0.02] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.06]"
        }`}>
          <button
            onClick={() => setActiveSubTab("console")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "console"
                ? isLight
                  ? "bg-[#111827] text-white shadow-sm"
                  : "bg-cyan-500 text-black shadow-sm"
                : `text-xs ${styles.textSecondary} hover:opacity-100 opacity-60`
            }`}
          >
            Applications Console
          </button>
          <button
            onClick={() => setActiveSubTab("readiness")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "readiness"
                ? isLight
                  ? "bg-[#111827] text-white shadow-sm"
                  : "bg-cyan-500 text-black shadow-sm"
                : `text-xs ${styles.textSecondary} hover:opacity-100 opacity-60`
            }`}
          >
            <span>AI Readiness Assessment</span>
            <span className="text-[8.5px] uppercase px-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-extrabold tracking-wider">Beta</span>
          </button>
        </div>
      </motion.div>

      {/* Reworked Application Console View */}
      <AnimatePresence mode="wait">
        {activeSubTab === "console" ? (
          <motion.div
            key="console"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            
            {/* 1. Permanent Explanation Panel */}
            <motion.div {...fadeUp(0.05)} className={`border rounded-2xl p-5 ${styles.cardBg} border-cyan-500/15 bg-cyan-500/[0.01]`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">How Application Maker Works</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                {[
                  { step: "1", title: "Add Target List", desc: "Define your universities" },
                  { step: "2", title: "Attach Materials", desc: "Upload PDFs or write in Axis" },
                  { step: "3", title: "Counselor Review", desc: "Collaborate on feedback" },
                  { step: "4", title: "Monitor Health", desc: "Track missing documents" },
                  { step: "5", title: "Assemble Zip", desc: "Compile complete packages" },
                  { step: "6", title: "Submit Portals", desc: "Upload to CommonApp/UCAS" },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center space-y-1.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <span className="size-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">{s.step}</span>
                    <span className={`font-semibold text-xs block ${styles.textPrimary}`}>{s.title}</span>
                    <span className={`text-[9px] text-white/40 block leading-tight`}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 2. Main Three-Column Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: University List Manager (4 Columns) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Section Title & Add Button */}
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} opacity-60`}>
                    University List ({filteredUniversities.length})
                  </h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <span>+ Add Uni</span>
                  </button>
                </div>

                {/* Search & Filters Panel */}
                <div className={`border rounded-2xl p-4 space-y-3 ${styles.cardBg}`}>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Status Filter */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider opacity-40">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`w-full rounded-lg border p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${
                          isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0C0C0E]/70 border-white/[0.08] text-white"
                        }`}
                      >
                        <option value="All">All</option>
                        <option value="Drafting">Drafting</option>
                        <option value="Counselor Review">Review</option>
                        <option value="Ready">Ready</option>
                      </select>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider opacity-40">Country</label>
                      <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className={`w-full rounded-lg border p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${
                          isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0C0C0E]/70 border-white/[0.08] text-white"
                        }`}
                      >
                        <option value="All">All</option>
                        <option value="UK">UK</option>
                        <option value="US">US</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider opacity-40">Priority</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className={`w-full rounded-lg border p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${
                          isLight ? "bg-[#F9FAFB] border-black/10 text-black" : "bg-[#0C0C0E]/70 border-white/[0.08] text-white"
                        }`}
                      >
                        <option value="All">All</option>
                        <option value="Dream Choice">Dream</option>
                        <option value="First Choice">First</option>
                        <option value="Target">Target</option>
                        <option value="Safety">Safety</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Universities list */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredUniversities.length === 0 ? (
                    <div className={`text-center py-12 text-xs border rounded-2xl border-dashed ${styles.textSecondary} opacity-40 ${styles.cardBg}`}>
                      No universities match the filters.
                    </div>
                  ) : (
                    filteredUniversities.map((app) => {
                      const matCount = app.requirements.length;
                      const completedCount = app.requirements.filter((req) => !!materials[`${app.id}-${req}`]).length;
                      const progressPct = matCount > 0 ? (completedCount / matCount) * 100 : 0;
                      const isSelected = selectedAppId === app.id;

                      const missingReqs = app.requirements.filter((req) => !materials[`${app.id}-${req}`]);

                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setSelectedRequirement(app.requirements[0] || "Personal Statement");
                          }}
                          className={`border rounded-2xl p-4 cursor-pointer relative overflow-hidden transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-cyan-500/40 bg-cyan-500/[0.04] shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                              : `${styles.cardBg} hover:bg-white/[0.02] border-white/[0.06]`
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                                {app.priority}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveUniversity(app.id);
                                }}
                                className={`text-[10px] hover:text-rose-500 opacity-30 hover:opacity-100 transition-opacity p-1`}
                                title="Remove school"
                              >
                                ✕
                              </button>
                            </div>

                            <div>
                              <h4 className={`text-sm font-bold truncate ${styles.textPrimary}`}>{app.university}</h4>
                              <p className={`text-[10px] ${styles.textSecondary} opacity-60 mt-0.5`}>{app.major}</p>
                            </div>

                            {/* Health Indicators */}
                            <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.05]">
                              {/* Requirement completion progress */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] opacity-50 uppercase tracking-wider">
                                  <span>Materials Health</span>
                                  <span>{completedCount} / {matCount} Complete</span>
                                </div>
                                <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                                  <div className={`h-full rounded-full bg-cyan-500 transition-all duration-300`} style={{ width: `${progressPct}%` }} />
                                </div>
                              </div>

                              {/* Missing Requirements List */}
                              {missingReqs.length > 0 ? (
                                <div className="text-[9px] leading-tight">
                                  <span className="text-rose-500 font-medium">Missing: </span>
                                  <span className={`opacity-60 ${styles.textSecondary}`}>{missingReqs.join(", ")}</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                                  <span>✓ All Materials Uploaded</span>
                                </div>
                              )}

                              {/* Platform & Deadlines */}
                              <div className="flex items-center justify-between text-[9px] opacity-45 pt-1">
                                <span>Platform: {app.platform}</span>
                                <span className="font-mono">{app.deadline}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* MIDDLE COLUMN: Materials Component Editor & Input Hub (5 Columns) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Components Checklist header */}
                <div className={`border rounded-2xl p-5 ${styles.cardBg} border-white/[0.06]`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} opacity-60 mb-3`}>
                    Application Components
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeApp.requirements.map((req) => {
                      const material = materials[`${activeApp.id}-${req}`];
                      const isComplete = !!material;
                      const isSelected = selectedRequirement === req;

                      return (
                        <button
                          key={req}
                          onClick={() => setSelectedRequirement(req)}
                          className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-500 text-black font-semibold"
                              : isComplete
                                ? `bg-emerald-500/10 border-emerald-500/30 text-emerald-400`
                                : `bg-[#0C0C0E]/40 border-white/[0.08] text-white/50 hover:text-white/80`
                          }`}
                        >
                          {isComplete && <span className="text-[9.5px]">✓</span>}
                          <span>{req}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Method Hub Console */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} border-white/[0.06] space-y-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.06]">
                    <div>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${styles.textPrimary}`}>{selectedRequirement}</h3>
                      <p className={`text-[10px] ${styles.textSecondary} opacity-60 mt-0.5`}>Select how to link this application material.</p>
                    </div>
                  </div>

                  {/* Tabbed Picker for Input Methods */}
                  <div className="space-y-4">
                    
                    {/* Input selector tabs */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 rounded-xl p-1 bg-black/45 border border-white/[0.06]">
                      {[
                        { id: "write", label: "Write" },
                        { id: "upload", label: "Upload" },
                        { id: "db", label: "Vault" },
                        { id: "resources", label: "Guides" },
                        { id: "essential", label: "Captured" },
                        { id: "draft", label: "Draft" },
                      ].map((tab) => {
                        const savedKey = `${activeApp.id}-${selectedRequirement}`;
                        const saved = materials[savedKey];

                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              // If draft is clicked, fill automatically
                              if (tab.id === "draft") {
                                handleImportFile(selectedRequirement + "_draft.docx", "draft");
                                setMaterials((prev) => ({
                                  ...prev,
                                  [savedKey]: { method: "draft", textContent: DEFAULT_ESSAY_DRAFT, fileName: `${selectedRequirement}_draft.docx` },
                                }));
                              } else if (tab.id === "write") {
                                setMaterials((prev) => ({
                                  ...prev,
                                  [savedKey]: { method: "write", textContent: prev[savedKey]?.textContent || "" },
                                }));
                              } else {
                                // Reset attachment
                                setMaterials((prev) => {
                                  const c = { ...prev };
                                  delete c[savedKey];
                                  return c;
                                });
                              }
                            }}
                            className={`rounded-lg py-1.5 text-[9px] font-bold uppercase tracking-wider text-center transition-all ${
                              saved?.method === tab.id
                                ? "bg-cyan-500 text-black"
                                : "text-white/40 hover:text-white/80"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab panels */}
                    <div className="pt-2">
                      
                      {/* 1. WRITE PANEL */}
                      {(!materials[`${activeApp.id}-${selectedRequirement}`] || materials[`${activeApp.id}-${selectedRequirement}`]?.method === "write") && (
                        <div className="space-y-3">
                          <textarea
                            value={editorText}
                            onChange={(e) => setEditorText(e.target.value)}
                            placeholder="Write your response directly inside Axis..."
                            className={`w-full h-40 rounded-xl border p-3.5 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${
                              isLight ? "bg-black/[0.01] border-black/[0.08] text-black" : "bg-black/50 border-white/[0.08] text-white/90"
                            }`}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40">
                              Word Count: {editorText.split(/\s+/).filter(Boolean).length} / 650
                            </span>
                            <button
                              onClick={handleSaveWrittenEssay}
                              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors"
                            >
                              Save Draft
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. UPLOAD PANEL */}
                      {materials[`${activeApp.id}-${selectedRequirement}`]?.method === "upload" && (
                        <div className="space-y-3">
                          {materials[`${activeApp.id}-${selectedRequirement}`]?.fileName ? (
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📄</span>
                                <span className="font-medium text-emerald-400">{materials[`${activeApp.id}-${selectedRequirement}`].fileName}</span>
                              </div>
                              <span className="text-[10px] text-emerald-400/80">Uploaded Successfully</span>
                            </div>
                          ) : (
                            <div className="border border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:bg-white/[0.01] transition-all cursor-pointer relative">
                              <input
                                type="file"
                                onChange={handleSimulatedUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-2">
                                <span className="text-2xl block">📂</span>
                                <span className="text-xs text-white/60 block">Drag & Drop or click to browse local files</span>
                                <span className="text-[9px] text-white/30 block">Supports PDF, DOCX, TXT, PNG</span>
                              </div>
                            </div>
                          )}

                          {simulatedUploading && (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[10px] text-white/50">
                                <span>Uploading file...</span>
                                <span>{simulatedProgress}%</span>
                              </div>
                              <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${simulatedProgress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. VAULT PANEL */}
                      {materials[`${activeApp.id}-${selectedRequirement}`]?.method === "db" && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Import from Personal Vault</p>
                          {PERSONAL_DB_FILES.map((file) => {
                            const isAttached = materials[`${activeApp.id}-${selectedRequirement}`]?.fileName === file.name;

                            return (
                              <button
                                type="button"
                                key={file.name}
                                onClick={() => handleImportFile(file.name, "db")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                                  isAttached
                                    ? "border-emerald-500/40 bg-emerald-500/[0.02] text-emerald-400"
                                    : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                                }`}
                              >
                                <span className="truncate">{file.name} ({file.size})</span>
                                <span className="text-[9px] uppercase tracking-wider opacity-60">{isAttached ? "Attached" : "Attach"}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. GUIDES PANEL */}
                      {materials[`${activeApp.id}-${selectedRequirement}`]?.method === "resources" && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Connected Templates & Guides</p>
                          {CONNECTED_RESOURCES_FILES.map((file) => {
                            const isAttached = materials[`${activeApp.id}-${selectedRequirement}`]?.fileName === file.name;

                            return (
                              <button
                                type="button"
                                key={file.name}
                                onClick={() => handleImportFile(file.name, "resources")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                                  isAttached
                                    ? "border-emerald-500/40 bg-emerald-500/[0.02] text-emerald-400"
                                    : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                                }`}
                              >
                                <span className="truncate">{file.name}</span>
                                <span className="text-[9px] uppercase tracking-wider opacity-60">{isAttached ? "Attached" : "Attach"}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 5. CAPTURED PANEL */}
                      {materials[`${activeApp.id}-${selectedRequirement}`]?.method === "essential" && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Import from Essential Space</p>
                          {ESSENTIAL_SPACE_ITEMS.map((item) => {
                            const isAttached = materials[`${activeApp.id}-${selectedRequirement}`]?.fileName === `${item.name}.txt`;

                            return (
                              <button
                                type="button"
                                key={item.name}
                                onClick={() => handleImportFile(`${item.name}.txt`, "essential")}
                                className={`w-full flex flex-col p-3 rounded-xl border text-xs text-left transition-all ${
                                  isAttached
                                    ? "border-emerald-500/40 bg-emerald-500/[0.02] text-emerald-400"
                                    : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full font-semibold">
                                  <span>{item.name}</span>
                                  <span className="text-[9px] uppercase tracking-wider opacity-50">{item.type}</span>
                                </div>
                                <span className="text-[9px] text-white/40 mt-1 truncate max-w-xs">{item.content}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 6. DRAFT PANEL */}
                      {materials[`${activeApp.id}-${selectedRequirement}`]?.method === "draft" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📝</span>
                              <span className="font-medium text-emerald-400">{selectedRequirement}_draft.docx</span>
                            </div>
                            <span className="text-[10px] text-emerald-400/80">Draft Loaded</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed italic">
                            &quot;{DEFAULT_ESSAY_DRAFT.slice(0, 150)}...&quot;
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Counselor Review & Collaborator comments */}
                <div className={`border rounded-2xl p-6 ${styles.cardBg} border-white/[0.06] space-y-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary}`}>Counselor Review & Comments</h3>
                    
                    {/* Counselor simulation buttons */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSimulateCounselorFeedback("Approved")}
                        className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleSimulateCounselorFeedback("Changes Requested")}
                        className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-[9px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Revise
                      </button>
                    </div>
                  </div>

                  {/* Comments thread list */}
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                    {(comments[`${activeApp.id}-${selectedRequirement}`] || []).length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-white/30 italic">
                        No messages on this component. Ask your counselor for feedback.
                      </div>
                    ) : (
                      (comments[`${activeApp.id}-${selectedRequirement}`] || []).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2 text-xs">
                          <div className={`size-7 rounded-full border flex items-center justify-center font-bold shrink-0 text-[9px] ${
                            comment.author.includes("Aarav Chen")
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-white/5 border-white/10"
                          }`}>
                            {comment.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between">
                              <span className={`font-semibold text-xs ${styles.textPrimary}`}>{comment.author}</span>
                              <span className={`text-[8px] opacity-40`}>{comment.time}</span>
                            </div>
                            <span className="text-[8.5px] text-cyan-500 font-semibold block leading-none">{comment.role}</span>
                            <p className="mt-1 leading-relaxed text-white/70 text-[11px]">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment compose input */}
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.05]">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Ask Aarav Chen a question or request a review..."
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/20 ${
                        isLight ? "bg-[#F9FAFB] border-black/[0.08] text-black" : "bg-[#0C0C0E]/70 border-white/[0.08] text-white"
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: Application Assembly Engine & Insight (3 Columns) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* 1. Assembly Engine Panel */}
                <div className={`border rounded-2xl p-5 ${styles.cardBg} border-white/[0.06] space-y-4`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>
                    Assembly Engine
                  </h3>

                  <div className="space-y-3">
                    {/* Health Checklist items */}
                    {activeApp.requirements.map((req) => {
                      const complete = !!materials[`${activeApp.id}-${req}`];
                      return (
                        <div key={req} className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.03] last:border-none last:pb-0">
                          <span className={`opacity-80 truncate max-w-[150px] ${styles.textPrimary}`}>{req}</span>
                          <span className={`text-[9px] font-bold ${complete ? "text-emerald-400" : "text-amber-500"}`}>
                            {complete ? "✓ Ready" : "🔲 Missing"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Assembled package status */}
                  {assembledPackages[activeApp.id] ? (
                    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                      <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] text-center space-y-2">
                        <span className="text-2xl block animate-bounce">📦</span>
                        <div className="text-xs font-bold text-emerald-400">Package Compiled!</div>
                        <div className="text-[9px] text-white/40 truncate">{assembledPackages[activeApp.id]}</div>
                      </div>

                      <button
                        onClick={() => {
                          alert(`Final Assembled Package (${assembledPackages[activeApp.id]}) downloaded successfully! Extract and review files, then upload to UCAS/CommonApp portal.`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                      >
                        Download & Review
                      </button>
                    </div>
                  ) : assemblingAppId === activeApp.id ? (
                    <div className="space-y-3 pt-3 border-t border-white/[0.06] text-center">
                      <div className="size-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mx-auto" />
                      <div className="text-[10px] text-white/50 uppercase tracking-widest animate-pulse">Assembling Package...</div>
                      <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${assemblyProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-white/[0.06] space-y-3">
                      {isAssemblyAllowed ? (
                        <>
                          <div className="text-[10px] text-white/60 leading-relaxed text-center">
                            All required components are complete! Compile everything into a unified package.
                          </div>
                          <button
                            onClick={handleAssemblePackage}
                            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Assemble Package
                          </button>
                        </>
                      ) : (
                        <div className="text-[10px] text-white/30 leading-relaxed text-center py-2 border border-dashed border-white/[0.06] rounded-xl">
                          Attach all missing components to unlock the Assembly Engine.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Context Engine Insight panel */}
                <div className={`border rounded-2xl p-5 ${styles.cardBg} border-white/[0.06] space-y-4`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06] dark:border-white/[0.04]">
                    <span className="text-sm">💡</span>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Application Insights</h3>
                  </div>

                  <div className="space-y-3.5 text-[11px] leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500 shrink-0">⚠️</span>
                      <p className="text-white/60">
                        <strong>{activeApp.university}</strong>: Deadline is approaching. Revisit the Counselor comments log to check if revisions are completed.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-cyan-500 shrink-0">&bull;</span>
                      <p className="text-white/60">
                        Import documents directly from your private **Vault** (Personal Database) to avoid copying essay drafts.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        ) : (
          /* SUPPORTING TAB: AI Readiness Assessment Benchmarking (Disclaimers included) */
          <motion.div
            key="readiness"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Disclaimer card */}
            <div className="border rounded-2xl p-5 border-amber-500/20 bg-amber-500/[0.02] text-xs leading-relaxed flex items-start gap-3">
              <span className="text-lg shrink-0 mt-0.5">⚠️</span>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-500 uppercase tracking-widest text-[10px]">AI Readiness Assessment Console (Beta Release)</h4>
                <p className="opacity-80">
                  This system compares your academic profile, activities, achievements, coursework, and application-related information against historical applicant profiles.
                </p>
                <p className="font-bold text-[10px] text-amber-500/80">
                  Disclaimer: This tool is designed purely for guidance and benchmarking. It does NOT predict admissions decisions, guarantee acceptances, or represent final decisions.
                </p>
              </div>
            </div>

            {/* Score Rank Card (Full-width, Centered) */}
            <div className={`relative border rounded-2xl p-8 text-center overflow-hidden ${styles.cardBg}`}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-cyan-500/[0.06] blur-3xl" />
              </div>
              
              <p className={`text-[10px] uppercase tracking-widest mb-4 font-medium relative z-10 ${styles.textSecondary} opacity-50`}>
                Assessed Readiness Tier
              </p>

              <div className="relative z-10 mb-4">
                <span className={`text-[96px] leading-none font-black ${isLight ? "text-cyan-600" : "text-cyan-400"} drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]`}>
                  A
                </span>
              </div>

              <div className="relative z-10 space-y-2 max-w-lg mx-auto">
                <p className={`text-base font-semibold tracking-tight ${styles.textPrimary}`}>
                  Strong Match Cohort
                </p>
                <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-70`}>
                  You currently resemble successful applicants at this level. Your profile aligns well with historical admit records, but target areas (like your Extended Essay draft review) should be completed to consolidate your competitiveness.
                </p>
              </div>
            </div>

            {/* Rank Scale Reference (Full-width) */}
            <div className={`border rounded-2xl p-6 ${styles.cardBg}`}>
              <p className={`text-[10px] uppercase tracking-widest mb-4 font-medium ${styles.textSecondary} opacity-50`}>
                Rank Scale Reference
              </p>
              <div className="flex items-stretch gap-2">
                {[
                  { letter: "S", label: "Exceptional", color: isLight ? "text-indigo-600" : "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                  { letter: "A", label: "Strong", color: isLight ? "text-cyan-600" : "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                  { letter: "B", label: "Developing", color: isLight ? "text-emerald-600" : "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { letter: "C", label: "Attention Needed", color: isLight ? "text-amber-600" : "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                  { letter: "D", label: "Critical", color: isLight ? "text-rose-600" : "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                ].map((tier) => {
                  const isCurrent = tier.letter === "A";
                  return (
                    <div
                      key={tier.letter}
                      className={`flex-1 rounded-xl p-3 text-center border transition-all ${
                        isCurrent
                          ? `${tier.bg} ${tier.border} ring-1 ring-cyan-500/10`
                          : isLight 
                            ? "bg-black/[0.01] border-black/[0.04]" 
                            : "bg-white/[0.02] border-white/[0.04]"
                      }`}
                    >
                      <p className={`text-xl font-black mb-1 ${
                        isCurrent ? tier.color : isLight ? "text-black/15" : "text-white/15"
                      }`}>
                        {tier.letter}
                      </p>
                      <p className={`text-[9px] font-medium leading-none ${
                        isCurrent ? styles.textPrimary : isLight ? "text-black/30" : "text-white/20"
                      }`}>
                        {tier.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Grid (2-Column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Strength Bars */}
              <div className={`border rounded-2xl p-5 ${styles.cardBg} space-y-4`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>Profile Strength Breakdown</h3>
                
                <div className="space-y-4">
                  {[
                    { label: "Academic Record", value: 78, color: "bg-cyan-500" },
                    { label: "Extracurriculars", value: 65, color: "bg-emerald-500" },
                    { label: "CAS Portfolio", value: 72, color: "bg-violet-500" },
                    { label: "Extended Essay", value: 45, color: "bg-amber-500", note: "Needs Attention" },
                    { label: "TOK Assessment", value: 80, color: "bg-cyan-500" },
                  ].map((s) => (
                    <div key={s.label} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium ${styles.textPrimary}`}>{s.label}</span>
                          {s.note && (
                            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                              {s.note}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold tabular-nums opacity-60">{s.value}%</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${s.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* University Target Alignment */}
              <div className={`border rounded-2xl p-5 ${styles.cardBg} space-y-4`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>Target School Benchmarking</h3>
                
                <div className="space-y-3">
                  {[
                    { name: "Imperial College London", match: "Strong Match", note: "Academic profile aligns with typical admits.", allowed: true },
                    { name: "University of Edinburgh", match: "Strong Match", note: "Predicted IB meets median historical offer.", allowed: true },
                    { name: "MIT", match: "Reach", note: "Your profile is currently weaker in Extended Essay completion compared to typical admits.", allowed: false },
                  ].map((uni) => (
                    <div key={uni.name} className="flex flex-col gap-1 border-b pb-3 border-black/[0.06] dark:border-white/[0.04] last:border-none last:pb-0 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <span className={`font-bold ${styles.textPrimary}`}>{uni.name}</span>
                        <span className={`text-[8.5px] uppercase font-semibold border px-1.5 py-0.5 rounded ${
                          uni.allowed
                            ? isLight ? "text-cyan-700 bg-cyan-500/10 border-cyan-500/20" : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                            : isLight ? "text-amber-700 bg-amber-500/10 border-amber-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}>
                          {uni.match}
                        </span>
                      </div>
                      <p className={`text-[10px] ${styles.textSecondary} opacity-70 mt-0.5 leading-relaxed`}>{uni.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── AI Admissions Advisor Chat ─────────────────────────────── */}
            <div className={`border rounded-2xl overflow-hidden ${styles.cardBg}`}>
              {/* Header */}
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${
                isLight ? "border-black/[0.06]" : "border-white/[0.06]"
              }`}>
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black">AI</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0A0B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${styles.textPrimary}`}>AI Admissions Advisor</p>
                  <p className={`text-[10px] ${styles.textSecondary} opacity-50`}>Personalised guidance · Profile-aware · Always available</p>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Beta</span>
              </div>

              {/* Messages */}
              <div className={`h-72 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth ${
                isLight ? "bg-black/[0.01]" : "bg-white/[0.01]"
              }`}>
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${ msg.from === "user" ? "flex-row-reverse" : "flex-row" }`}>
                    {/* Avatar */}
                    {msg.from === "ai" ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-[8px] font-black shrink-0 mt-0.5">AI</div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[8px] font-black shrink-0 mt-0.5">CV</div>
                    )}
                    <div className={`max-w-[78%] space-y-1`}>
                      <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        msg.from === "ai"
                          ? isLight
                            ? "bg-black/[0.04] border border-black/[0.06] text-black/80"
                            : "bg-white/[0.05] border border-white/[0.06] text-white/80"
                          : "bg-cyan-500/15 border border-cyan-500/20 text-cyan-100"
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[9px] ${styles.textSecondary} opacity-40 ${ msg.from === "user" ? "text-right" : "text-left" } px-1`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {chatTyping && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-[8px] font-black shrink-0">AI</div>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.05] border border-white/[0.06]"
                    }`}>
                      <div className="flex gap-1 items-center h-3">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested prompts */}
              <div className={`px-5 py-2 flex gap-2 flex-wrap border-t ${
                isLight ? "border-black/[0.05]" : "border-white/[0.05]"
              }`}>
                {[
                  "What should I add to my EE?",
                  "How do I strengthen my MIT app?",
                  "Am I missing any documents?",
                  "Improve my CAS portfolio",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setChatInput(prompt); }}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all hover:scale-105 ${
                      isLight
                        ? "border-black/[0.08] bg-black/[0.03] text-black/50 hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:text-cyan-700"
                        : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:text-cyan-400"
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <div className={`flex items-center gap-2 px-4 py-3 border-t ${
                isLight ? "border-black/[0.06]" : "border-white/[0.06]"
              }`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  placeholder="Ask about your application… e.g. 'What's missing for Imperial?'"
                  className={`flex-1 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all ${
                    isLight
                      ? "bg-black/[0.04] border border-black/[0.06] placeholder:text-black/30 text-black/80"
                      : "bg-white/[0.04] border border-white/[0.06] placeholder:text-white/25 text-white/80"
                  }`}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatTyping}
                  className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Drawer / Modal for Adding University */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className={`relative w-full max-w-lg rounded-3xl border border-white/[0.08] p-6 shadow-2xl space-y-5 z-10 ${styles.cardBg} text-white`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Add University Application</h3>
                <button onClick={() => setShowAddModal(false)} className="text-xs text-white/50 hover:text-white/80">✕</button>
              </div>

              <form onSubmit={handleAddUniversity} className="space-y-4 text-xs">
                
                {/* School Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">University Name</label>
                  <input
                    type="text"
                    required
                    value={formUni}
                    onChange={(e) => setFormUni(e.target.value)}
                    placeholder="e.g. University of Toronto"
                    className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Major/Course */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Intended Major / Course</label>
                  <input
                    type="text"
                    required
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    placeholder="e.g. BSc Computer Science"
                    className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Grid for parameters */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Country</label>
                    <select
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                    >
                      <option value="US">United States (US)</option>
                      <option value="UK">United Kingdom (UK)</option>
                      <option value="Canada">Canada</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Europe">Europe</option>
                    </select>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white"
                    />
                  </div>

                  {/* Priority Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Priority Category</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                    >
                      <option value="Dream Choice">Dream Choice</option>
                      <option value="First Choice">First Choice</option>
                      <option value="Target">Target Match</option>
                      <option value="Safety">Safety</option>
                      <option value="Backup">Backup</option>
                      <option value="Custom">Custom Category</option>
                    </select>
                  </div>

                  {/* Application Platform */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Application Platform</label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value as any)}
                      className="w-full bg-[#0C0C0E]/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                    >
                      <option value="CommonApp">CommonApp</option>
                      <option value="UCAS">UCAS (UK)</option>
                      <option value="Direct">Direct Portal</option>
                      <option value="Coalition">Coalition</option>
                      <option value="OUAC">OUAC (Ontario)</option>
                    </select>
                  </div>
                </div>

                {/* Requirements Checklist tags */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider opacity-60 font-semibold block">Required Components</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Personal Statement",
                      "Resume",
                      "Transcript",
                      "Syllabus Reference",
                      "SAT Scores",
                      "Recommendation Letter",
                      "References",
                    ].map((req) => {
                      const selected = formRequirements.includes(req);
                      return (
                        <button
                          key={req}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setFormRequirements((prev) => prev.filter((r) => r !== req));
                            } else {
                              setFormRequirements((prev) => [...prev, req]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] transition-all ${
                            selected
                              ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400 font-medium"
                              : "bg-transparent border-white/[0.06] text-white/40 hover:text-white/70"
                          }`}
                        >
                          {req}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider transition-all"
                  >
                    Add University
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/[0.08] bg-transparent text-white/70 hover:bg-white/5 font-semibold uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
