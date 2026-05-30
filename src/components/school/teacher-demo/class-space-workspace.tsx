"use client";

import { useState, useMemo } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type ClassItem = {
  id: string;
  name: string;
  unit: string;
  studentCount: number;
  activeTasks: number;
  pendingGrading: number;
  color: string;
  code: string;
};

type UnitPlan = {
  id: string;
  classId: string;
  title: string;
  topics: string[];
  durationWeeks: number;
  objectives: string[];
  attachedResourceId?: string;
  attachedAssessmentId?: string;
};

type CurriculumDoc = {
  id: string;
  classId: string;
  title: string;
  type: string;
  dateAdded: string;
  size: string;
};

type Task = {
  id: string;
  classId: string;
  title: string;
  description: string;
  createdDate: string;
  dueDate: string;
  lateDate: string;
  closeDate: string;
  assessmentCriteria: string;
  maxMarks: number;
  attachedResources: string[];
  visibility: "draft" | "scheduled" | "published" | "archived" | "closed";
};

type Resource = {
  id: string;
  classId: string;
  title: string;
  type: "pdf" | "slides" | "notes" | "worksheet" | "video" | "link" | "exemplar" | "rubric" | "guide";
  folder: string;
  url: string;
  size?: string;
  dateAdded: string;
  tags: string[];
};

type Submission = {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  avatar: string;
  status: "submitted" | "pending" | "late" | "missing" | "graded";
  submittedAt?: string;
  fileName?: string;
  fileContent?: string;
  grade?: number;
  comments?: string;
  rubricScores?: Record<string, number>;
};

// ─── DEMO DATA ──────────────────────────────────────────────────────────────────────────────────

const INITIAL_UNITS: UnitPlan[] = [
  {
    id: "unit-1",
    classId: "cls-1",
    title: "Unit 1: Measurements and Uncertainties",
    topics: ["1.1 Measurements in physics", "1.2 Uncertainties and errors", "1.3 Vectors and scalars"],
    durationWeeks: 2,
    objectives: ["Understand standard SI units", "Calculate absolute, fractional, and percentage uncertainties", "Determine vector components"],
    attachedResourceId: "res-5",
  },
  {
    id: "unit-2",
    classId: "cls-1",
    title: "Unit 2: Mechanics",
    topics: ["2.1 Motion", "2.2 Forces", "2.3 Work, energy and power", "2.4 Momentum and impulse"],
    durationWeeks: 6,
    objectives: ["Apply SUVAT equations of motion", "Formulate free-body force diagrams", "Apply conservation of momentum theorem"],
    attachedAssessmentId: "tsk-2",
  },
  {
    id: "unit-3",
    classId: "cls-1",
    title: "Unit 3: Thermal Physics",
    topics: ["3.1 Thermal concepts", "3.2 Modelling a gas"],
    durationWeeks: 4,
    objectives: ["Differentiate thermal energy, heat, and temperature", "Apply ideal gas equations"],
  },
  {
    id: "unit-4",
    classId: "cls-1",
    title: "Unit 4: Waves",
    topics: ["4.1 Oscillations", "4.2 Travelling waves", "4.3 Wave characteristics"],
    durationWeeks: 5,
    objectives: ["Define simple harmonic motion parameters", "Explain wave characteristics"],
    attachedResourceId: "res-4",
  }
];

const INITIAL_CURRICULUM_DOCS: CurriculumDoc[] = [
  { id: "cd-1", classId: "cls-1", title: "IB Physics HL Syllabus Guide (First Assessment 2025).pdf", type: "Subject Guide", dateAdded: "2026-04-12", size: "3.8 MB" },
  { id: "cd-2", classId: "cls-1", title: "Assessment Mark Scheme - Physics HL Paper 1 & 2.pdf", type: "Mark Scheme", dateAdded: "2026-04-20", size: "1.4 MB" },
  { id: "cd-3", classId: "cls-1", title: "DP Physics Lab Safety Protocol Guide.pdf", type: "Regulations", dateAdded: "2026-04-22", size: "920 KB" },
];

const CLASSES: ClassItem[] = [
  { id: "cls-1", name: "DP1 Physics HL", unit: "Mechanics & Kinematics", studentCount: 24, activeTasks: 3, pendingGrading: 5, color: "from-sky-500/20 to-indigo-500/20", code: "PHY-DP1" },
  { id: "cls-2", name: "DP1 Chemistry HL", unit: "Chemical Bonding & Structure", studentCount: 20, activeTasks: 2, pendingGrading: 2, color: "from-emerald-500/20 to-teal-500/20", code: "CHE-DP1" },
  { id: "cls-3", name: "DP2 Physics HL", unit: "Quantum & Nuclear Physics", studentCount: 18, activeTasks: 4, pendingGrading: 3, color: "from-violet-500/20 to-purple-500/20", code: "PHY-DP2" },
  { id: "cls-4", name: "MYP 4 Science", unit: "Ecosystems & Bio-Energy", studentCount: 22, activeTasks: 2, pendingGrading: 1, color: "from-amber-500/20 to-rose-500/20", code: "SCI-MYP4" },
  { id: "cls-5", name: "Homeroom 11-F", unit: "Advisory & Personal Mentorship", studentCount: 26, activeTasks: 1, pendingGrading: 0, color: "from-pink-500/20 to-orange-500/20", code: "HR-11F" },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "tsk-1",
    classId: "cls-1",
    title: "Physics IA Draft  -  Phase 2",
    description: "Submit the complete draft of your Physics Internal Assessment. Make sure to include your raw data, processed charts, and uncertainty evaluations.",
    createdDate: "2026-05-14",
    dueDate: "2026-05-20",
    lateDate: "2026-05-22",
    closeDate: "2026-05-25",
    assessmentCriteria: "Criterion B (Design) & C (Data)",
    maxMarks: 10,
    attachedResources: ["IA Guide.pdf", "Sample Report.pdf"],
    visibility: "published",
  },
  {
    id: "tsk-2",
    classId: "cls-1",
    title: "Mechanics Momentum Assignment",
    description: "Solve questions 1 through 15 in chapter 4. Submit scans of your hand-written mathematical steps.",
    createdDate: "2026-05-18",
    dueDate: "2026-05-25",
    lateDate: "2026-05-27",
    closeDate: "2026-05-30",
    assessmentCriteria: "Criterion A (Knowledge)",
    maxMarks: 20,
    attachedResources: ["Momentum Worksheet.pdf"],
    visibility: "published",
  },
  {
    id: "tsk-3",
    classId: "cls-1",
    title: "Centripetal Forces Lab Log",
    description: "Log values from the digital rotation simulator and write a brief analysis explaining the centripetal relationship.",
    createdDate: "2026-05-22",
    dueDate: "2026-05-29",
    lateDate: "2026-05-31",
    closeDate: "2026-06-03",
    assessmentCriteria: "Criterion C (Analysis)",
    maxMarks: 10,
    attachedResources: [],
    visibility: "published",
  },
  {
    id: "tsk-4",
    classId: "cls-2",
    title: "Ionic Bonding Lab Sheet",
    description: "Document conductivity changes observed during solutions titration.",
    createdDate: "2026-05-15",
    dueDate: "2026-05-22",
    lateDate: "2026-05-24",
    closeDate: "2026-05-27",
    assessmentCriteria: "Criterion B",
    maxMarks: 15,
    attachedResources: ["Conductivity Guide.pdf"],
    visibility: "published",
  },
];

const INITIAL_RESOURCES: Resource[] = [
  // Physics DP1
  { id: "res-1", classId: "cls-1", title: "IA Guide.pdf", type: "guide", folder: "IA Resources", url: "/files/ia-guide.pdf", size: "2.4 MB", dateAdded: "2026-05-10", tags: ["Physics IA", "Guide"] },
  { id: "res-2", classId: "cls-1", title: "Sample Report.pdf", type: "exemplar", folder: "IA Resources", url: "/files/sample-report.pdf", size: "3.1 MB", dateAdded: "2026-05-12", tags: ["Physics IA", "Exemplar"] },
  { id: "res-3", classId: "cls-1", title: "Momentum Worksheet.pdf", type: "worksheet", folder: "Mechanics", url: "/files/momentum-worksheet.pdf", size: "1.1 MB", dateAdded: "2026-05-02", tags: ["Mechanics", "Momentum"] },
  { id: "res-4", classId: "cls-1", title: "Refraction Prism Slides.pdf", type: "slides", folder: "Waves", url: "/files/refraction-slides.pdf", size: "5.8 MB", dateAdded: "2026-05-15", tags: ["Waves", "Light"] },
  { id: "res-5", classId: "cls-1", title: "Kinematics Formula Sheet.pdf", type: "notes", folder: "Mechanics", url: "/files/kinematics-formulas.pdf", size: "850 KB", dateAdded: "2026-05-01", tags: ["Mechanics", "Quick Sheet"] },
  { id: "res-6", classId: "cls-1", title: "Error Analysis Guide.pdf", type: "guide", folder: "Exam Preparation", url: "/files/error-analysis.pdf", size: "1.7 MB", dateAdded: "2026-05-20", tags: ["Lab Methods", "Uncertainties"] },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    taskId: "tsk-1",
    studentId: "std-1",
    studentName: "Chloe Vance",
    avatar: "CV",
    status: "submitted",
    submittedAt: "2026-05-19 04:12 PM",
    fileName: "Chloe_Vance_IA_Draft.pdf",
    fileContent: "Title: Resonance Effects in Tube Columns.\nAbstract: This investigation explores how sound frequency resonates with different tube lengths...\nData Analysis: Table 1 records heights of water corresponding to air resonance. Uncertainties are evaluated using standard deviations...",
  },
  {
    id: "sub-2",
    taskId: "tsk-1",
    studentId: "std-2",
    studentName: "Dilan Patel",
    avatar: "DP",
    status: "submitted",
    submittedAt: "2026-05-20 10:15 AM",
    fileName: "Dilan_Patel_Air_Resistance_IA.pdf",
    fileContent: "Title: Quadratic Drag Factors in Freefall Drops.\nIntroduction: This study aims to investigate the drag coefficient of spherical objects falling from a 10m height.\nError Calculations: Aerodynamic drag model yields a drag factor of 0.44  ± 0.03. Linear fit does not reconcile data as effectively as a quadratic model...",
  },
  {
    id: "sub-3",
    taskId: "tsk-1",
    studentId: "std-3",
    studentName: "Emma Watson",
    avatar: "EW",
    status: "late",
    submittedAt: "2026-05-21 08:34 AM",
    fileName: "Emma_Watson_Draft_Resonance.pdf",
    fileContent: "Title: Acceleration due to Gravity on Inclined Planes.\nMethodology: Rolling cylinder experiment utilizing motion sensor loggers.\nUnresolved Issues: Friction coefficient measurements contain severe systematic noise...",
  },
  {
    id: "sub-4",
    taskId: "tsk-1",
    studentId: "std-4",
    studentName: "Lucas Gray",
    avatar: "LG",
    status: "missing",
  },
  {
    id: "sub-5",
    taskId: "tsk-1",
    studentId: "std-5",
    studentName: "Aria Thorne",
    avatar: "AT",
    status: "graded",
    submittedAt: "2026-05-19 11:00 AM",
    fileName: "Aria_Thorne_Physics_IA_V2.pdf",
    fileContent: "Title: Magnetic Flux through Solenoid Coils.\nSummary: Exploring magnetic induction dependency on coil turn counts...",
    grade: 9,
    comments: "Excellent methodology and thorough uncertainty calculations. Strengthen your conclusion paragraph by referencing theoretical constants.",
    rubricScores: { "Criterion B": 4, "Criterion C": 5 },
  },
];

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export function ClassSpaceWorkspace() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<"overview" | "planning" | "tasks" | "resources" | "submissions" | "grading">("overview");

  // Core App states
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);

  // Curriculum Planning States
  const [units, setUnits] = useState<UnitPlan[]>(INITIAL_UNITS);
  const [currDocs, setCurrDocs] = useState<CurriculumDoc[]>(INITIAL_CURRICULUM_DOCS);
  
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({
    title: "",
    durationWeeks: 4,
    topicsText: "",
    objectivesText: "",
    attachedResId: "",
    attachedAssId: ""
  });
  
  const [isAddingCurrDoc, setIsAddingCurrDoc] = useState(false);
  const [currDocForm, setCurrDocForm] = useState({
    title: "",
    type: "Subject Guide"
  });

  // UI Interactive States
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [studentPreviewTaskId, setStudentPreviewTaskId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [gradingTaskId, setGradingTaskId] = useState<string>("tsk-1");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Task Form State
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    lateDate: string;
    closeDate: string;
    criteria: string;
    maxMarks: number;
    attachedResources: string[];
    visibility: Task["visibility"];
  }>({
    title: "",
    description: "",
    dueDate: "",
    lateDate: "",
    closeDate: "",
    criteria: "Criterion A",
    maxMarks: 10,
    attachedResources: [],
    visibility: "published",
  });

  // Resource Form State
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "pdf" as Resource["type"],
    folder: "Mechanics",
    tags: "",
  });

  // Grading form state
  const [gradingForm, setGradingForm] = useState({
    grade: 0,
    comments: "",
    criterionScores: { "Criterion B": 0, "Criterion C": 0 } as Record<string, number>,
  });

  // ─── COMPUTED DATA ────────────────────────────────────────────────────────

  const currentClass = useMemo(() => {
    return CLASSES.find((c) => c.id === selectedClassId) || null;
  }, [selectedClassId]);

  const classTasks = useMemo(() => {
    if (!selectedClassId) return [];
    return tasks.filter((t) => t.classId === selectedClassId && t.visibility !== "archived");
  }, [tasks, selectedClassId]);

  const classResources = useMemo(() => {
    if (!selectedClassId) return [];
    return resources.filter((r) => r.classId === selectedClassId);
  }, [resources, selectedClassId]);

  const resourceFolders = useMemo(() => {
    const folders = new Set<string>();
    classResources.forEach((r) => folders.add(r.folder));
    return ["All", ...Array.from(folders)];
  }, [classResources]);

  const filteredResources = useMemo(() => {
    if (selectedFolder === "All") return classResources;
    return classResources.filter((r) => r.folder === selectedFolder);
  }, [classResources, selectedFolder]);

  // Context suggestion system
  const contextSuggestions = useMemo(() => {
    const title = taskForm.title.toLowerCase();
    const suggestions: { text: string; type: "info" | "warning" | "tip"; action?: () => void; actionLabel?: string }[] = [];

    if (title.includes("momentum")) {
      const alreadyAttached = taskForm.attachedResources.includes("Momentum Worksheet.pdf");
      if (!alreadyAttached) {
        suggestions.push({
          text: "You uploaded 'Momentum Worksheet.pdf' 3 weeks ago for DP1 Physics HL.",
          type: "tip",
          actionLabel: "Attach Worksheet",
          action: () => {
            setTaskForm((prev) => ({
              ...prev,
              attachedResources: [...prev.attachedResources, "Momentum Worksheet.pdf"],
            }));
          },
        });
      }
    }

    if (title.includes("ia") || title.includes("internal assessment")) {
      suggestions.push({
        text: "Students struggled with error analysis in this unit last term. Recommend attaching 'Error Analysis Guide.pdf'.",
        type: "info",
        actionLabel: "Attach Guide",
        action: () => {
          setTaskForm((prev) => ({
            ...prev,
            attachedResources: Array.from(new Set([...prev.attachedResources, "Error Analysis Guide.pdf"])),
          }));
        },
      });
    }

    if (taskForm.attachedResources.length === 0) {
      suggestions.push({
        text: "No supporting materials attached. Click below to reference existing worksheets.",
        type: "warning",
      });
    }

    if (taskForm.maxMarks > 15) {
      suggestions.push({
        text: "Tasks above 15 marks typically span multiple criteria. Double check mapping.",
        type: "tip",
      });
    }

    return suggestions;
  }, [taskForm]);

  // Active task for grading selector
  const activeGradingTask = useMemo(() => {
    return tasks.find((t) => t.id === gradingTaskId) || null;
  }, [tasks, gradingTaskId]);

  const taskSubmissions = useMemo(() => {
    return submissions.filter((s) => s.taskId === gradingTaskId);
  }, [submissions, gradingTaskId]);

  const selectedSubmission = useMemo(() => {
    return taskSubmissions.find((s) => s.studentId === selectedStudentId) || null;
  }, [taskSubmissions, selectedStudentId]);

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setActivePane("overview");
    setSelectedFolder("All");
    setSelectedStudentId(null);
    // Auto-select first task of this class for grading default
    const classTasks = tasks.filter((t) => t.classId === classId);
    if (classTasks.length > 0) {
      setGradingTaskId(classTasks[0].id);
    }
  };

  const handleCreateTask = () => {
    if (!selectedClassId) return;
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      classId: selectedClassId,
      title: taskForm.title || "Untitled Assignment",
      description: taskForm.description,
      createdDate: new Date().toISOString().split("T")[0],
      dueDate: taskForm.dueDate || "2026-06-01",
      lateDate: taskForm.lateDate || "2026-06-03",
      closeDate: taskForm.closeDate || "2026-06-05",
      assessmentCriteria: taskForm.criteria,
      maxMarks: taskForm.maxMarks,
      attachedResources: taskForm.attachedResources,
      visibility: taskForm.visibility,
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsCreatingTask(false);
    resetTaskForm();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      lateDate: task.lateDate,
      closeDate: task.closeDate,
      criteria: task.assessmentCriteria,
      maxMarks: task.maxMarks,
      attachedResources: task.attachedResources,
      visibility: task.visibility,
    });
    setIsCreatingTask(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskForm.title,
              description: taskForm.description,
              dueDate: taskForm.dueDate,
              lateDate: taskForm.lateDate,
              closeDate: taskForm.closeDate,
              assessmentCriteria: taskForm.criteria,
              maxMarks: taskForm.maxMarks,
              attachedResources: taskForm.attachedResources,
              visibility: taskForm.visibility,
            }
          : t
      )
    );
    setIsCreatingTask(false);
    setEditingTask(null);
    resetTaskForm();
  };

  const handleDuplicateTask = (task: Task) => {
    const dup: Task = {
      ...task,
      id: `tsk-${Date.now()}`,
      title: `Copy of ${task.title}`,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setTasks((prev) => [dup, ...prev]);
  };

  const handleArchiveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, visibility: "archived" as const } : t))
    );
  };

  const handleCloseTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, visibility: "closed" as const } : t))
    );
  };

  const handleExtendDeadline = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const due = new Date(t.dueDate);
          due.setDate(due.getDate() + 3);
          const late = new Date(t.lateDate);
          late.setDate(late.getDate() + 3);
          const close = new Date(t.closeDate);
          close.setDate(close.getDate() + 3);
          return {
            ...t,
            dueDate: due.toISOString().split("T")[0],
            lateDate: late.toISOString().split("T")[0],
            closeDate: close.toISOString().split("T")[0],
          };
        }
        return t;
      })
    );
  };

  const handleSelectStudentForGrading = (studentId: string) => {
    setSelectedStudentId(studentId);
    const sub = taskSubmissions.find((s) => s.studentId === studentId);
    if (sub) {
      setGradingForm({
        grade: sub.grade || 0,
        comments: sub.comments || "",
        criterionScores: sub.rubricScores || { "Criterion B": 0, "Criterion C": 0 },
      });
    } else {
      setGradingForm({
        grade: 0,
        comments: "",
        criterionScores: { "Criterion B": 0, "Criterion C": 0 },
      });
    }
  };

  const handleSaveGrading = (isFinal: boolean) => {
    if (!selectedStudentId) return;
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.taskId === gradingTaskId && s.studentId === selectedStudentId) {
          return {
            ...s,
            status: isFinal ? "graded" : "submitted",
            grade: gradingForm.grade,
            comments: gradingForm.comments,
            rubricScores: gradingForm.criterionScores,
          };
        }
        return s;
      })
    );
    setSelectedStudentId(null);
  };

  const handleAddResource = () => {
    if (!selectedClassId) return;
    const newRes: Resource = {
      id: `res-${Date.now()}`,
      classId: selectedClassId,
      title: resourceForm.title || "New Document",
      type: resourceForm.type,
      folder: resourceForm.folder,
      url: "#",
      size: "1.2 MB",
      dateAdded: new Date().toISOString().split("T")[0],
      tags: resourceForm.tags.split(",").map((s) => s.trim()).filter(Boolean),
    };
    setResources((prev) => [...prev, newRes]);
    setIsAddingResource(false);
    setResourceForm({ title: "", type: "pdf", folder: "Mechanics", tags: "" });
  };

  const handleAddUnit = () => {
    if (!selectedClassId) return;
    const newUnit: UnitPlan = {
      id: `unit-${Date.now()}`,
      classId: selectedClassId,
      title: unitForm.title || "New Unit",
      durationWeeks: Number(unitForm.durationWeeks) || 1,
      topics: unitForm.topicsText.split("\n").map(t => t.trim()).filter(Boolean),
      objectives: unitForm.objectivesText.split("\n").map(o => o.trim()).filter(Boolean),
      attachedResourceId: unitForm.attachedResId || undefined,
      attachedAssessmentId: unitForm.attachedAssId || undefined,
    };
    setUnits((prev) => [...prev, newUnit]);
    setIsAddingUnit(false);
    setUnitForm({ title: "", durationWeeks: 4, topicsText: "", objectivesText: "", attachedResId: "", attachedAssId: "" });
  };

  const handleMoveUnit = (index: number, direction: "up" | "down") => {
    const classUnits = units.filter(u => u.classId === selectedClassId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= classUnits.length) return;

    const itemA = classUnits[index];
    const itemB = classUnits[targetIndex];

    setUnits(prev => {
      const copy = [...prev];
      const idxA = copy.findIndex(u => u.id === itemA.id);
      const idxB = copy.findIndex(u => u.id === itemB.id);
      if (idxA !== -1 && idxB !== -1) {
        const temp = copy[idxA];
        copy[idxA] = copy[idxB];
        copy[idxB] = temp;
      }
      return copy;
    });
  };

  const handleAddCurrDoc = () => {
    if (!selectedClassId) return;
    const newDoc: CurriculumDoc = {
      id: `cd-${Date.now()}`,
      classId: selectedClassId,
      title: currDocForm.title || "Untitled Document",
      type: currDocForm.type,
      dateAdded: new Date().toISOString().split("T")[0],
      size: "1.5 MB"
    };
    setCurrDocs((prev) => [...prev, newDoc]);
    setIsAddingCurrDoc(false);
    setCurrDocForm({ title: "", type: "Subject Guide" });
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits(prev => prev.filter(u => u.id !== unitId));
  };

  const handleDeleteCurrDoc = (docId: string) => {
    setCurrDocs(prev => prev.filter(d => d.id !== docId));
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      lateDate: "",
      closeDate: "",
      criteria: "Criterion A",
      maxMarks: 10,
      attachedResources: [],
      visibility: "published",
    });
  };

  // ─── RENDERERS ─────────────────────────────────────────────────────────────

  if (!selectedClassId || !currentClass) {
    return (
      <div className="w-full max-w-5xl mx-auto py-10">
        <div className="flex flex-col mb-8">
          <h2 className="text-xl font-bold tracking-tight text-white/95">Class Space</h2>
          <p className="text-xs text-white/40 mt-1">Select an active class group to view tasks, resources, and submissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASSES.map((cls) => {
            const classTaskCount = tasks.filter((t) => t.classId === cls.id && t.visibility !== "archived").length;
            const classResourceCount = resources.filter((r) => r.classId === cls.id).length;
            return (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className="group relative flex flex-col text-left rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/15 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
              >
                {/* Glow backdrop */}
                <div className={`absolute -right-16 -top-16 size-32 rounded-full bg-gradient-to-br ${cls.color} opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500`} />

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/[0.03] text-white/40 uppercase font-semibold">
                        {cls.code}
                      </span>
                      {classTaskCount > 0 && (
                        <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white/90 mt-3 group-hover:text-white transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-white/40 mt-1 line-clamp-1">
                      {cls.unit}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.04] grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Students</span>
                      <span className="text-sm font-semibold text-white/80 mt-1">{cls.studentCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Tasks</span>
                      <span className="text-sm font-semibold text-white/80 mt-1">{classTaskCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Resources</span>
                      <span className="text-sm font-semibold text-white/80 mt-1">{classResourceCount}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-safe-lg">
      {/* Top Banner and class details header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.06] pb-safe-sm gap-safe-md">
        <div className="flex items-center gap-safe-sm">
          <button
            onClick={() => setSelectedClassId(null)}
            className="size-8 rounded-lg border border-white/[0.08] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white transition-all text-xs"
            title="Back to Class Selector"
          >
            ← 
          </button>
          <div>
            <div className="flex items-center gap-safe-sm">
              <h2 className="text-lg font-bold tracking-tight text-white/90">{currentClass.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/[0.03] text-white/40 uppercase font-semibold">
                {currentClass.code}
              </span>
            </div>
            <p className="text-xs text-white/45 mt-1 flex items-center gap-safe-sm">
              <span>Unit: {currentClass.unit}</span>
              <span className="size-1 rounded-full bg-white/20" />
              <span>{currentClass.studentCount} students</span>
            </p>
          </div>
        </div>

        {/* Local Pane Navigation tabs */}
        <div className="flex rounded-xl bg-white/[0.02] border border-white/[0.06] p-0.5 select-none shrink-0 self-start md:self-auto">
          {(["overview", "planning", "tasks", "resources", "submissions", "grading"] as const).map((pane) => {
            const isActive = activePane === pane;
            return (
              <button
                key={pane}
                onClick={() => {
                  setActivePane(pane);
                  setIsCreatingTask(false);
                  setEditingTask(null);
                  setStudentPreviewTaskId(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize tracking-tight transition-all ${
                  isActive
                    ? "bg-white text-black font-bold shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                {pane}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Panels switch */}
      <div className="min-h-[50vh]">
        {/* ─── PANE 1: OVERVIEW ─── */}
        {activePane === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-safe-lg">
            <div className="space-y-safe-lg">
              {/* Core summary metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-safe-md">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Active Tasks</span>
                  <div className="mt-2 flex items-baseline gap-safe-sm">
                    <span className="text-3xl font-extrabold tracking-tight text-white">{classTasks.length}</span>
                    <span className="text-xs text-white/40">assignments</span>
                  </div>
                  <span className="text-[10px] text-white/35">Tasks collecting submissions</span>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pending Grading</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-amber-400">
                      {submissions.filter((s) => s.status === "submitted" || s.status === "late").length}
                    </span>
                    <span className="text-xs text-white/40">files</span>
                  </div>
                  <span className="text-[10px] text-white/35">Unmarked student submissions</span>
                </div>
              </div>

              {/* Tasks Quicklook */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md">
                <div className="flex items-center justify-between mb-safe-md">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Active Assignments</h3>
                  <button onClick={() => setActivePane("tasks")} className="text-[10px] text-white/40 hover:text-white transition-colors">
                    Manage →
                  </button>
                </div>
                <div className="space-y-safe-sm">
                  {classTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-[#0E0E10] px-safe-md py-safe-sm">
                      <div>
                        <span className="text-xs font-semibold text-white/90 block">{t.title}</span>
                        <span className="text-[10px] text-white/30 block mt-0.5">Due: {t.dueDate} · Assessment: {t.assessmentCriteria}</span>
                      </div>
                      <span className="text-[10px] font-medium text-white/50 border border-white/10 px-2 py-0.5 rounded">
                        {t.maxMarks} marks
                      </span>
                    </div>
                  ))}
                  {classTasks.length === 0 && (
                    <span className="text-xs text-white/20 italic block text-center py-4">No active tasks found.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-safe-lg">
              {/* Recently Added Resources */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md">
                <div className="flex items-center justify-between mb-safe-md">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Recent Resources</h3>
                  <button onClick={() => setActivePane("resources")} className="text-[10px] text-white/40 hover:text-white transition-colors">
                    Browse →
                  </button>
                </div>
                <div className="space-y-safe-sm">
                  {classResources.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-white/[0.03] bg-[#0C0C0E]/50 px-safe-md py-safe-sm">
                      <div className="flex items-center gap-safe-sm">
                        <span className="text-xs font-bold text-white/30 uppercase">{r.type}</span>
                        <div>
                          <span className="text-xs font-semibold text-white/80 block">{r.title}</span>
                          <span className="text-[9px] text-white/30 block mt-0.5">Folder: {r.folder} · {r.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {classResources.length === 0 && (
                    <span className="text-xs text-white/20 italic block text-center py-4">No resources uploaded.</span>
                  )}
                </div>
              </div>

              {/* Deadlines timeline */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md">
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-safe-md">Upcoming Milestones</h3>
                <div className="relative border-l border-white/10 pl-safe-md ml-safe-sm space-y-safe-md">
                  {classTasks.map((t) => (
                    <div key={t.id} className="relative">
                      <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-white border-2 border-[#0A0A0B]" />
                      <span className="text-xs font-semibold text-white/85 block">{t.title} Deadline</span>
                      <span className="text-[10px] text-white/30 block mt-0.5">Due: {t.dueDate} · Late: {t.lateDate}</span>
                    </div>
                  ))}
                  {classTasks.length === 0 && (
                    <span className="text-xs text-white/20 italic block py-2">No upcoming milestones.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ——— PANE: PLANNING ——— */}
        {activePane === "planning" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-safe-lg">
            {/* Left side: Course Outline & Units */}
            <div className="space-y-safe-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white/90">Curriculum Units</h3>
                  <p className="text-xs text-white/40 mt-0.5">Sequence, duration estimates, and topic milestones for {currentClass.name}</p>
                </div>
                {!isAddingUnit && (
                  <button
                    onClick={() => setIsAddingUnit(true)}
                    className="rounded-lg bg-white px-safe-md py-safe-sm text-xs font-bold text-black hover:opacity-90 transition-opacity"
                  >
                    + Add Unit Plan
                  </button>
                )}
              </div>

              {/* Add Unit Form */}
              {isAddingUnit && (
                <div className="rounded-xl border border-white/[0.08] bg-[#0E0E10] p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                    <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">New Unit Details</h4>
                    <button onClick={() => setIsAddingUnit(false)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Unit Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Unit 5: Electricity and Magnetism"
                        value={unitForm.title}
                        onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Duration (Weeks)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={unitForm.durationWeeks}
                        onChange={(e) => setUnitForm({ ...unitForm, durationWeeks: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Topics (one per line)</label>
                      <textarea
                        placeholder="5.1 Electric fields&#10;5.2 Heating effect of electric currents"
                        value={unitForm.topicsText}
                        onChange={(e) => setUnitForm({ ...unitForm, topicsText: e.target.value })}
                        className="w-full h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Objectives (one per line)</label>
                      <textarea
                        placeholder="Understand Coulomb's Law&#10;Analyze series and parallel circuits"
                        value={unitForm.objectivesText}
                        onChange={(e) => setUnitForm({ ...unitForm, objectivesText: e.target.value })}
                        className="w-full h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Link Resource (Library)</label>
                      <select
                        value={unitForm.attachedResId}
                        onChange={(e) => setUnitForm({ ...unitForm, attachedResId: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-[#0E0E10] px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Select Resource --</option>
                        {classResources.map((res) => (
                          <option key={res.id} value={res.id}>{res.title} ({res.type})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Link Assessment (Tasks)</label>
                      <select
                        value={unitForm.attachedAssId}
                        onChange={(e) => setUnitForm({ ...unitForm, attachedAssId: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-[#0E0E10] px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Select Assessment --</option>
                        {classTasks.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                    <button onClick={() => setIsAddingUnit(false)} className="px-4 py-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors">Cancel</button>
                    <button onClick={handleAddUnit} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:opacity-90">Save Unit</button>
                  </div>
                </div>
              )}

              {/* Units List */}
              <div className="space-y-4">
                {units.filter(u => u.classId === selectedClassId).map((unit, index, list) => {
                  const attachedRes = resources.find(r => r.id === unit.attachedResourceId);
                  const attachedTask = tasks.find(t => t.id === unit.attachedAssessmentId);
                  return (
                    <div key={unit.id} className="group relative rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/10 p-5 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white/95">{unit.title}</h4>
                          <span className="text-[10px] font-semibold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded mt-1.5 inline-block">
                            Est. Duration: {unit.durationWeeks} {unit.durationWeeks === 1 ? "Week" : "Weeks"}
                          </span>
                        </div>
                        {/* Order & management controls */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveUnit(index, "up")}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/80 disabled:opacity-30 disabled:hover:bg-white/5"
                            title="Move Unit Up"
                          >
                            ▲
                          </button>
                          <button
                            disabled={index === list.length - 1}
                            onClick={() => handleMoveUnit(index, "down")}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/80 disabled:opacity-30 disabled:hover:bg-white/5"
                            title="Move Unit Down"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-[10px] text-rose-400"
                            title="Delete Unit"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.04]">
                        {/* Topics */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Topic Outlines</span>
                          <ul className="space-y-1">
                            {unit.topics.map((t, idx) => (
                              <li key={idx} className="text-xs text-white/70 flex items-start gap-1.5">
                                <span className="text-white/20 mt-0.5">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                            {unit.topics.length === 0 && (
                              <span className="text-xs text-white/20 italic">No topics mapped.</span>
                            )}
                          </ul>
                        </div>

                        {/* Learning Objectives */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Learning Objectives</span>
                          <ul className="space-y-1">
                            {unit.objectives.map((o, idx) => (
                              <li key={idx} className="text-xs text-white/70 flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">✓</span>
                                <span>{o}</span>
                              </li>
                            ))}
                            {unit.objectives.length === 0 && (
                              <span className="text-xs text-white/20 italic">No objectives mapped.</span>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Attachments Section */}
                      {(attachedRes || attachedTask) && (
                        <div className="flex flex-wrap gap-2.5 mt-4 pt-3.5 border-t border-dashed border-white/[0.04]">
                          {attachedRes && (
                            <span className="text-[10px] font-semibold text-white/60 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span className="text-[8px] font-extrabold text-sky-400 uppercase tracking-tighter">RES</span>
                              {attachedRes.title}
                            </span>
                          )}
                          {attachedTask && (
                            <span className="text-[10px] font-semibold text-white/60 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span className="text-[8px] font-extrabold text-amber-400 uppercase tracking-tighter">ASSESSMENT</span>
                              {attachedTask.title}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {units.filter(u => u.classId === selectedClassId).length === 0 && (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                    <span className="text-xs text-white/25 italic">No units registered for this class. Click &quot;+ Add Unit Plan&quot; to begin.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Syllabus & Curriculum Documents */}
            <div className="space-y-safe-lg">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-safe-sm">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Curriculum Documents</span>
                {!isAddingCurrDoc && (
                  <button
                    onClick={() => setIsAddingCurrDoc(true)}
                    className="text-[10px] font-bold text-white/60 hover:text-white transition-colors"
                  >
                    + Upload
                  </button>
                )}
              </div>

              {/* Add Doc Form */}
              {isAddingCurrDoc && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider block">Add Document Link</span>
                  <input
                    type="text"
                    placeholder="Document Title (e.g. Physics HL Syllabus)"
                    value={currDocForm.title}
                    onChange={(e) => setCurrDocForm({ ...currDocForm, title: e.target.value })}
                    className="w-full rounded bg-[#0E0E10] border border-white/10 text-xs px-2.5 py-1.5 text-white placeholder-white/20 focus:outline-none"
                  />
                  <select
                    value={currDocForm.type}
                    onChange={(e) => setCurrDocForm({ ...currDocForm, type: e.target.value })}
                    className="w-full rounded bg-[#0E0E10] border border-white/10 text-xs px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="Subject Guide">Subject Guide</option>
                    <option value="Syllabus Guide">Syllabus Guide</option>
                    <option value="Exam Specification">Exam Specification</option>
                    <option value="Mark Scheme">Mark Scheme</option>
                    <option value="Planning Document">Planning Document</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex gap-1.5 justify-end pt-1">
                    <button onClick={() => setIsAddingCurrDoc(false)} className="text-[10px] text-white/40 px-2 py-1">Cancel</button>
                    <button onClick={handleAddCurrDoc} className="text-[10px] bg-white text-black font-bold px-3 py-1 rounded">Save</button>
                  </div>
                </div>
              )}

              {/* Documents List */}
              <div className="space-y-2">
                {currDocs.filter(d => d.classId === selectedClassId).map((doc) => (
                  <div key={doc.id} className="group relative rounded-lg border border-white/[0.03] bg-[#0E0E10] px-3.5 py-3 flex items-start justify-between">
                    <div className="min-w-0 pr-6">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-0.5">{doc.type}</span>
                      <span className="text-xs font-semibold text-white/80 block truncate" title={doc.title}>
                        {doc.title}
                      </span>
                      <span className="text-[9px] text-white/30 block mt-0.5">Added: {doc.dateAdded} · {doc.size}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCurrDoc(doc.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-white/35 hover:text-rose-400 transition-all text-[10px]"
                      title="Delete document reference"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {currDocs.filter(d => d.classId === selectedClassId).length === 0 && (
                  <span className="text-xs text-white/20 italic block text-center py-4">No curriculum documents uploaded.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ——— PANE 2: TASKS ——— */}
        {activePane === "tasks" && (
          <div className="flex flex-col gap-safe-lg">
            {!isCreatingTask && !studentPreviewTaskId && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white/40">{classTasks.length} tasks registered</span>
                <button
                  onClick={() => setIsCreatingTask(true)}
                  className="rounded-lg bg-white px-safe-md py-safe-sm text-xs font-bold text-black hover:opacity-90 transition-opacity"
                >
                  + Create Task
                </button>
              </div>
            )}

            {/* List View / Creation Split */}
            {isCreatingTask ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-safe-lg">
                {/* Form area */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-lg space-y-safe-md">
                  <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 mb-2">
                    <h3 className="text-sm font-semibold text-white/95">
                      {editingTask ? `Edit Task: ${editingTask.title}` : "New Assignment Details"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsCreatingTask(false);
                        setEditingTask(null);
                        resetTaskForm();
                      }}
                      className="text-xs text-white/45 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics IA Draft  -  Phase 2"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Task Description</label>
                    <textarea
                      placeholder="Specify objectives, guidelines, and submission steps..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="w-full h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Due Date</label>
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Late After Date</label>
                      <input
                        type="date"
                        value={taskForm.lateDate}
                        onChange={(e) => setTaskForm({ ...taskForm, lateDate: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Close Date</label>
                      <input
                        type="date"
                        value={taskForm.closeDate}
                        onChange={(e) => setTaskForm({ ...taskForm, closeDate: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Assessment Criteria</label>
                      <select
                        value={taskForm.criteria}
                        onChange={(e) => setTaskForm({ ...taskForm, criteria: e.target.value })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      >
                        <option value="Criterion A (Knowledge)">Criterion A</option>
                        <option value="Criterion B (Design)">Criterion B</option>
                        <option value="Criterion C (Data / Analysis)">Criterion C</option>
                        <option value="Criterion D (Evaluation)">Criterion D</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Max Marks</label>
                      <input
                        type="number"
                        min="1"
                        value={taskForm.maxMarks}
                        onChange={(e) => setTaskForm({ ...taskForm, maxMarks: parseInt(e.target.value) || 10 })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white focus:border-white/15 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Visibility Status</label>
                      <select
                        value={taskForm.visibility}
                        onChange={(e) => setTaskForm({ ...taskForm, visibility: e.target.value as Task["visibility"] })}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white focus:border-white/15 focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  {/* Attached Resources from class list */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Attached Library Materials</label>
                    <div className="flex flex-wrap gap-2">
                      {classResources.map((res) => {
                        const isAttached = taskForm.attachedResources.includes(res.title);
                        return (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => {
                              if (isAttached) {
                                setTaskForm({
                                  ...taskForm,
                                  attachedResources: taskForm.attachedResources.filter((name) => name !== res.title),
                                });
                              } else {
                                setTaskForm({
                                  ...taskForm,
                                  attachedResources: [...taskForm.attachedResources, res.title],
                                });
                              }
                            }}
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                              isAttached
                                ? "bg-white text-black border-white"
                                : "bg-white/[0.01] border-white/10 text-white/40 hover:border-white/20"
                            }`}
                          >
                            {res.title}
                          </button>
                        );
                      })}
                      {classResources.length === 0 && (
                        <span className="text-xs text-white/20 italic">No resources available in the library yet.</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsCreatingTask(false);
                        setEditingTask(null);
                        resetTaskForm();
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingTask ? handleUpdateTask : handleCreateTask}
                      className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:opacity-95 transition-opacity"
                    >
                      {editingTask ? "Update Assignment" : "Publish Assignment"}
                    </button>
                  </div>
                </div>

                {/* Suggestions sidebar (Context Integration) */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-3">
                      Context Engine Suggestions
                    </span>
                    <div className="space-y-3">
                      {contextSuggestions.map((sug, idx) => (
                        <div key={idx} className="rounded-lg border border-white/[0.03] bg-white/[0.01] p-3 text-xs leading-relaxed">
                          <span className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${
                            sug.type === "warning" ? "text-amber-400" : sug.type === "tip" ? "text-sky-400" : "text-white/40"
                          }`}>
                            {sug.type}
                          </span>
                          <p className="text-white/60 font-medium">{sug.text}</p>
                          {sug.action && (
                            <button
                              onClick={sug.action}
                              className="mt-2 text-[9px] font-bold text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/5 transition-all"
                            >
                              {sug.actionLabel || "Resolve"}
                            </button>
                          )}
                        </div>
                      ))}
                      {contextSuggestions.length === 0 && (
                        <span className="text-xs text-white/25 italic block py-4 text-center">No active suggestions. Start typing a title like &quot;Momentum Assignment&quot; to test relationships.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : studentPreviewTaskId ? (
              /* Student Preview Mode */
              <div className="rounded-xl border border-white/15 bg-[#0C0C0E] p-6 max-w-2xl mx-auto space-y-6">
                {(() => {
                  const pTask = tasks.find((t) => t.id === studentPreviewTaskId);
                  if (!pTask) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-sky-500 text-white font-bold px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                            Student Preview Mode
                          </span>
                          <span className="text-[10px] text-white/40">Visible to students</span>
                        </div>
                        <button
                          onClick={() => setStudentPreviewTaskId(null)}
                          className="text-xs text-white/50 hover:text-white transition-colors"
                        >
                          Exit Preview
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white/90 leading-tight">{pTask.title}</h2>
                        <div className="grid grid-cols-2 gap-4 border-y border-white/[0.04] py-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">Created:</span>
                            <span className="text-white/70 block">{pTask.createdDate} 9:15 AM</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">Due Date:</span>
                            <span className="text-white/80 block font-semibold">{pTask.dueDate} 11:59 PM</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">Late After:</span>
                            <span className="text-white/70 block">{pTask.lateDate} 11:59 PM</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">Closing On:</span>
                            <span className="text-white/70 block">{pTask.closeDate} 11:59 PM</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide block">Task Guidelines:</span>
                          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{pTask.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-3 text-xs">
                          <div>
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide block">Marks Available:</span>
                            <span className="text-white/80 font-bold block mt-0.5">{pTask.maxMarks} marks</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide block">Criteria Mapped:</span>
                            <span className="text-white/80 font-medium block mt-0.5">{pTask.assessmentCriteria}</span>
                          </div>
                        </div>

                        {pTask.attachedResources && pTask.attachedResources.length > 0 && (
                          <div className="space-y-2 border-t border-white/[0.04] pt-4">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide block">Supporting materials:</span>
                            <div className="flex flex-wrap gap-2">
                              {pTask.attachedResources.map((resName, i) => (
                                <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-white/70 flex items-center gap-1.5">
                                  <svg className="size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.121L16.222 6.42" />
                                  </svg>
                                  {resName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-white/[0.04] pt-4 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide block">Your Status:</span>
                            <span className="text-amber-400 font-semibold block mt-0.5">In Progress</span>
                          </div>
                          <button className="rounded-lg bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-500 transition-colors">
                            Upload Submission
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* Regular Active Task List */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classTasks.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/[0.06] bg-white/[0.01] hover:border-white/15 p-5 flex flex-col justify-between transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider">
                          {t.assessmentCriteria}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`size-1.5 rounded-full ${t.visibility === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span className="text-[9px] text-white/40 uppercase font-semibold">{t.visibility}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-white/90 leading-snug">{t.title}</h4>
                      <p className="text-xs text-white/45 mt-2 line-clamp-2 leading-relaxed">{t.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[10px] text-white/30">
                        <span>Due: {t.dueDate}</span>
                        <span>Marks: {t.maxMarks}</span>
                      </div>

                      {t.attachedResources && t.attachedResources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.attachedResources.map((res, i) => (
                            <span key={i} className="text-[9px] text-white/50 bg-white/[0.03] border border-white/[0.06] rounded px-1.5 py-0.5">
                              {res}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action footer */}
                      <div className="flex flex-wrap items-center justify-end gap-1.5 mt-2 pt-2 border-t border-dashed border-white/[0.04]">
                        <button
                          onClick={() => setStudentPreviewTaskId(t.id)}
                          className="rounded px-2 py-1 text-[9px] font-bold bg-sky-950 text-sky-400 border border-sky-800/40 hover:bg-sky-900 transition-colors"
                          title="Simulate student layout"
                        >
                          Student Preview
                        </button>
                        <button
                          onClick={() => handleEditTask(t)}
                          className="rounded px-2 py-1 text-[9px] font-bold text-white/60 hover:text-white hover:bg-white/[0.04] border border-white/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateTask(t)}
                          className="rounded px-2 py-1 text-[9px] font-bold text-white/40 hover:text-white hover:bg-white/[0.04] border border-white/5 transition-colors"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleExtendDeadline(t.id)}
                          className="rounded px-2 py-1 text-[9px] font-bold text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/15 transition-colors"
                          title="Extend due date by 3 days"
                        >
                          Extend +3d
                        </button>
                        <button
                          onClick={() => handleCloseTask(t.id)}
                          className="rounded px-2 py-1 text-[9px] font-bold text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/15 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => handleArchiveTask(t.id)}
                          className="rounded px-2 py-1 text-[9px] font-bold text-white/20 hover:text-rose-500 transition-colors"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => {
                            setGradingTaskId(t.id);
                            setActivePane("grading");
                            setSelectedStudentId(null);
                          }}
                          className="rounded px-2 py-1 text-[9px] font-bold bg-white text-black font-extrabold"
                        >
                          Grade Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {classTasks.length === 0 && (
                  <div className="col-span-2 text-center py-10 border border-dashed border-white/10 rounded-xl">
                    <span className="text-xs text-white/25 italic">No tasks registered for this class. Click &quot;+ Create Task&quot; to begin.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── PANE 3: RESOURCES ─── */}
        {activePane === "resources" && (
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-safe-lg">
            {/* Left folder checklist */}
            <div className="flex flex-col gap-safe-sm">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Library Folders</span>
              <div className="space-y-1">
                {resourceFolders.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold tracking-tight transition-all ${
                      selectedFolder === f
                        ? "bg-white/[0.06] text-white"
                        : "text-white/45 hover:bg-white/[0.02] hover:text-white/80"
                    }`}
                  >
                    <span>{f}</span>
                    <span className="text-[10px] text-white/25 font-normal">
                      {f === "All" ? classResources.length : classResources.filter((r) => r.folder === f).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* simulated upload card */}
              <div className="mt-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-center flex flex-col items-center justify-center min-h-36">
                {!isAddingResource ? (
                  <>
                    <svg className="size-6 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <button
                      onClick={() => setIsAddingResource(true)}
                      className="text-[10px] font-bold text-white/70 hover:text-white transition-colors"
                    >
                      + Add Material
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 text-left w-full">
                    <span className="text-[8px] font-bold text-white/45 uppercase tracking-wider block">Add to Library</span>
                    <input
                      type="text"
                      placeholder="Title (e.g. Gravity Study.pdf)"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                      className="w-full rounded bg-white/[0.05] border border-white/10 text-[10px] px-2 py-1 text-white placeholder-white/25 focus:outline-none"
                    />
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as Resource["type"] })}
                      className="w-full rounded bg-white/[0.05] border border-white/10 text-[10px] px-2 py-1 text-white focus:outline-none"
                    >
                      <option value="pdf">PDF File</option>
                      <option value="slides">Slides</option>
                      <option value="notes">Lecture Notes</option>
                      <option value="worksheet">Worksheet</option>
                      <option value="exemplar">Exemplar Rubric</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)"
                      value={resourceForm.tags}
                      onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                      className="w-full rounded bg-white/[0.05] border border-white/10 text-[10px] px-2 py-1 text-white placeholder-white/25 focus:outline-none"
                    />
                    <div className="flex gap-1.5 justify-end pt-1">
                      <button onClick={() => setIsAddingResource(false)} className="text-[9px] text-white/40 px-1.5 py-0.5">Cancel</button>
                      <button onClick={handleAddResource} className="text-[9px] bg-white text-black font-bold px-2 py-0.5 rounded">Save</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right materials grid */}
            <div className="space-y-safe-md">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{selectedFolder} Folder Materials</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-safe-sm">
                {filteredResources.map((res) => (
                  <div key={res.id} className="rounded-lg border border-white/[0.04] bg-[#0E0E10] px-safe-md py-safe-sm flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex size-7 items-center justify-center rounded bg-white/10 text-[8px] font-extrabold text-white/80 tracking-tighter uppercase shrink-0">
                        {res.type}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white/90 truncate block">{res.title}</span>
                        <span className="text-[10px] text-white/30 block mt-0.5">Added: {res.dateAdded} · {res.size || "1.0 MB"}</span>
                        {res.tags && res.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {res.tags.map((t, i) => (
                              <span key={i} className="text-[8px] text-white/45 bg-white/[0.03] border border-white/5 rounded-md px-1.5 py-0.2">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredResources.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <span className="text-xs text-white/20 italic">No files in this category.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── PANE 4: SUBMISSIONS ─── */}
        {activePane === "submissions" && (
          <div className="space-y-safe-md">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-safe-sm">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Grading Status & Submission Roster</span>
              <div className="flex items-center gap-safe-sm">
                <span className="text-xs text-white/40">Select Assignment:</span>
                <select
                  value={gradingTaskId}
                  onChange={(e) => {
                    setGradingTaskId(e.target.value);
                    setSelectedStudentId(null);
                  }}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-safe-sm py-safe-sm text-xs text-white focus:outline-none"
                >
                  {classTasks.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0E0E10] text-white/45 font-medium">
                    <th className="p-4">Student</th>
                    <th className="p-4">Date Uploaded</th>
                    <th className="p-4">Attached File</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {submissions.map((sub) => {
                    const statusColors = {
                      submitted: "bg-sky-400 text-sky-400",
                      pending: "bg-amber-400 text-amber-400",
                      late: "bg-orange-400 text-orange-400",
                      missing: "bg-rose-500 text-rose-500",
                      graded: "bg-emerald-400 text-emerald-400",
                    };
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/80">
                            {sub.avatar}
                          </span>
                          <span className="font-semibold text-white/90">{sub.studentName}</span>
                        </td>
                        <td className="p-4 text-white/50">{sub.submittedAt || " - "}</td>
                        <td className="p-4 text-white/60 font-mono text-[11px] max-w-xs truncate">{sub.fileName || " - "}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`size-1.5 rounded-full ${statusColors[sub.status].split(" ")[0]}`} />
                            <span className="font-semibold capitalize text-[11px] text-white/70">{sub.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(sub.studentId);
                              setGradingTaskId("tsk-1"); // mock task ID matching submissions
                              setGradingForm({
                                grade: sub.grade || 0,
                                comments: sub.comments || "",
                                criterionScores: sub.rubricScores || { "Criterion B": 0, "Criterion C": 0 },
                              });
                              setActivePane("grading");
                            }}
                            className="rounded bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] px-3 py-1.5 font-semibold text-white/80 transition-all text-[11px]"
                          >
                            {sub.status === "graded" ? "View Grade" : "Evaluate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── PANE 5: GRADING ─── */}
        {activePane === "grading" && (
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-safe-lg">
            {/* Left student list */}
            <div className="flex flex-col gap-safe-sm">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Student</span>
              <div className="space-y-1">
                {submissions.map((sub) => {
                  const isSelected = selectedStudentId === sub.studentId;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectStudentForGrading(sub.studentId)}
                      className={`w-full flex items-center justify-between rounded-lg px-safe-md py-safe-sm text-left text-xs transition-all ${
                        isSelected
                          ? "bg-white/[0.06] text-white"
                          : "text-white/45 hover:bg-white/[0.02] hover:text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-white/80">
                          {sub.avatar}
                        </span>
                        <span className="font-semibold truncate">{sub.studentName}</span>
                      </div>
                      <span className={`size-1.5 rounded-full ${
                        sub.status === "graded" ? "bg-emerald-400" : sub.status === "submitted" ? "bg-sky-400" : "bg-white/20"
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Grading Panel */}
            <div className="min-w-0">
              {selectedSubmission ? (
                <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-safe-lg">
                  {/* Student paper view */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md space-y-safe-sm">
                    <div className="border-b border-white/[0.06] pb-safe-sm">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Submission document</span>
                      <h4 className="text-xs font-semibold text-white/90 mt-1">{selectedSubmission.fileName || "No document uploaded"}</h4>
                    </div>

                    {selectedSubmission.fileContent ? (
                      <div className="bg-[#08080A] rounded-lg p-4 border border-white/[0.03] h-96 overflow-y-auto font-mono text-[11px] text-white/60 leading-relaxed whitespace-pre-wrap">
                        {selectedSubmission.fileContent}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                        <span className="text-xs text-white/20 italic">No text file available. Student status is: {selectedSubmission.status}.</span>
                      </div>
                    )}
                  </div>

                  {/* Grading score card inputs */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md space-y-safe-lg">
                    <div>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Assessment Score</span>
                      <h3 className="text-sm font-semibold text-white/90 mt-1">{activeGradingTask?.title || "Physics IA Draft"}</h3>
                    </div>

                    {/* Marks slider or input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Evaluation Mark</label>
                        <span className="text-xs font-bold text-white/80">{gradingForm.grade} / {activeGradingTask?.maxMarks || 10}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={activeGradingTask?.maxMarks || 10}
                        value={gradingForm.grade}
                        onChange={(e) => setGradingForm({ ...gradingForm, grade: parseInt(e.target.value) || 0 })}
                        className="w-full accent-white"
                      />
                    </div>

                    {/* Rubric Mappings checklist */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Rubric Criteria Mapping</label>
                      
                      <div className="space-y-2">
                        {["Criterion B", "Criterion C"].map((criterion) => (
                          <div key={criterion} className="rounded-lg border border-white/[0.03] bg-[#0E0E10] p-3 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-white/80">{criterion}</span>
                              <select
                                value={gradingForm.criterionScores[criterion] || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setGradingForm({
                                    ...gradingForm,
                                    criterionScores: {
                                      ...gradingForm.criterionScores,
                                      [criterion]: val,
                                    },
                                  });
                                }}
                                className="rounded bg-white/5 border border-white/10 text-[10px] px-1.5 py-0.5 text-white"
                              >
                                {[0, 1, 2, 3, 4, 5, 6].map((score) => (
                                  <option key={score} value={score}>Score {score}</option>
                                ))}
                              </select>
                            </div>
                            <span className="text-[10px] text-white/35 leading-tight">
                              {criterion === "Criterion B" 
                                ? "Evaluate student layout structure, procedural designs, and device safety factors." 
                                : "Assess precision, error margins, and clarity of graphs."
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* written feedback */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Feedback Comments</label>
                      <textarea
                        placeholder="Provide detailed, actionable recommendations for improvement..."
                        value={gradingForm.comments}
                        onChange={(e) => setGradingForm({ ...gradingForm, comments: e.target.value })}
                        className="w-full h-24 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white placeholder-white/20 focus:border-white/15 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSaveGrading(false)}
                        className="px-3.5 py-2 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={() => handleSaveGrading(true)}
                        className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                      >
                        Return Work
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <span className="text-xs text-white/25 italic">Select a student on the left to review and grade.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

