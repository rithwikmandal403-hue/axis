"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, type Theme } from "@/lib/theme-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type EnrolledClass = {
  id: string;
  name: string;
  subtitle: string;
  activeAssignments: number;
  teacher: string;
  studentCount: number;
  gradient: string;
  accent: string;
};

type CriterionDetail = {
  name: string;
  maxMarks: number;
  descriptor: string;
  /** Only present on graded/submitted work */
  awarded?: number;
};

type Assignment = {
  id: string;
  title: string;
  due: string;
  status: "pending" | "submitted" | "graded";
  grade: string;
  maxMarks: number;
  description: string;
  instructions: string[];
  attachments: { name: string; type: "PDF" | "Link" | "DOCX" }[];
  criteria: CriterionDetail[];
  /** Teacher feedback — only for graded work */
  feedback?: { comment: string; date: string };
  submittedFiles?: string[];
  submissionText?: string;
  submissionDate?: string;
  submissionTime?: string;
  submissionVersion?: string;
};

type ResourceFile = { id: string; name: string; type: "PDF" | "Link" | "DOCX" | "PPTX"; size?: string };
type ResourceFolder = { id: string; name: string; files: ResourceFile[] };

type ClassMember = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

type RoadmapUnit = {
  id: string;
  title: string;
  subtitle: string;
  weeks: string;
  status: "completed" | "current" | "upcoming";
  topics: string[];
  keyAssessment?: string;
};

type TabId = "assignments" | "resources" | "roadmap" | "members";

// ─── Data ────────────────────────────────────────────────────────────────────

const ENROLLED_CLASSES: EnrolledClass[] = [
  { id: "physics", name: "DP1 Physics HL", subtitle: "Mechanics & Kinematics", activeAssignments: 3, teacher: "Aarav Chen", studentCount: 18, gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent", accent: "bg-cyan-500" },
  { id: "math", name: "Math AA HL", subtitle: "Calculus & Functions", activeAssignments: 2, teacher: "Dr. Sarah Chen", studentCount: 22, gradient: "from-purple-500/20 via-purple-500/5 to-transparent", accent: "bg-purple-500" },
  { id: "english", name: "English A HL", subtitle: "Literary Analysis", activeAssignments: 1, teacher: "James Morrison", studentCount: 16, gradient: "from-amber-500/20 via-amber-500/5 to-transparent", accent: "bg-amber-500" },
  { id: "chemistry", name: "Chemistry SL", subtitle: "Chemical Bonding", activeAssignments: 2, teacher: "Dr. Priya Sharma", studentCount: 20, gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent", accent: "bg-emerald-500" },
  { id: "psychology", name: "Psychology SL", subtitle: "Cognitive & Abnormal", activeAssignments: 1, teacher: "Dr. Marcus Vance", studentCount: 15, gradient: "from-orange-500/20 via-orange-500/5 to-transparent", accent: "bg-orange-500" },
  { id: "spanish", name: "Spanish B SL", subtitle: "Language & Culture", activeAssignments: 2, teacher: "Señora Isabella Ruiz", studentCount: 18, gradient: "from-yellow-500/20 via-yellow-500/5 to-transparent", accent: "bg-yellow-500" },
];

const IB_COMPONENTS: EnrolledClass[] = [
  { id: "ee", name: "Extended Essay", subtitle: "Research & Writing", activeAssignments: 2, teacher: "Dr. Sarah Chen", studentCount: 1, gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent", accent: "bg-indigo-500" },
  { id: "tok-core", name: "Theory of Knowledge (TOK)", subtitle: "Exhibition & Essay", activeAssignments: 2, teacher: "Michael Torres", studentCount: 28, gradient: "from-rose-500/20 via-rose-500/5 to-transparent", accent: "bg-rose-500" },
  { id: "cas", name: "CAS Portfolio", subtitle: "Creativity, Activity, Service", activeAssignments: 3, teacher: "Aarav Chen", studentCount: 1, gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent", accent: "bg-emerald-500" },
  { id: "ia", name: "Internal Assessments", subtitle: "Subject IA Tracker", activeAssignments: 2, teacher: "Academic Coordinator", studentCount: 28, gradient: "from-rose-500/20 via-rose-500/5 to-transparent", accent: "bg-rose-500" },
];

const CLASS_ASSIGNMENTS: Record<string, Assignment[]> = {
  physics: [
    {
      id: "d1", title: "Physics IA Draft Phase 2", due: "Tomorrow", status: "submitted", grade: "Pending", maxMarks: 24,
      description: "Submit your second draft of the Physics Internal Assessment. This draft should include your complete methodology, raw data tables, and initial analysis with linearisation. Your research question must be clearly stated and linked to the IB syllabus.",
      instructions: [
        "Upload your draft as a single PDF document (max 12 pages excluding appendix).",
        "Include all raw data tables with appropriate uncertainties.",
        "Ensure your RQ is explicitly stated in the introduction.",
        "Reference at least 3 academic sources using APA format.",
      ],
      attachments: [
        { name: "Physics_IA_Rubric_2026.pdf", type: "PDF" },
        { name: "IA_Sample_Grade_A.pdf", type: "PDF" },
        { name: "Linearisation Guide", type: "Link" },
      ],
      criteria: [
        { name: "Personal Engagement", maxMarks: 2, descriptor: "Evidence of personal significance, interest, or curiosity in the exploration." },
        { name: "Exploration", maxMarks: 6, descriptor: "Focused research question, relevant methodology, sufficient background information." },
        { name: "Analysis", maxMarks: 6, descriptor: "Correct and detailed data processing, interpretation of results with uncertainties." },
        { name: "Evaluation", maxMarks: 6, descriptor: "Strengths and weaknesses of the methodology, realistic improvements suggested." },
        { name: "Communication", maxMarks: 4, descriptor: "Clear structure, appropriate terminology, and coherent argumentation throughout." },
      ],
      submittedFiles: ["Physics_IA_Draft2_ChloeV.pdf"],
      submissionText: "Here is my second draft of the Physics IA. I have incorporated the suggestions for uncertainties on the raw data tables and verified all formulas.",
      submissionDate: "Jun 11, 2026",
      submissionTime: "16:20",
      submissionVersion: "Version 1.0 (Final)",
    },
    {
      id: "d2", title: "Momentum Assignment", due: "In 3 days", status: "pending", grade: "-", maxMarks: 15,
      description: "Complete the worksheet on conservation of momentum problems. Focus on both elastic and inelastic collisions, applying Newton's third law in each scenario. Show all working and include free-body diagrams.",
      instructions: [
        "Answer all 8 questions showing full working.",
        "Draw free-body diagrams for questions 3, 5, and 7.",
        "Use appropriate significant figures and units throughout.",
      ],
      attachments: [
        { name: "Momentum_Worksheet.pdf", type: "PDF" },
      ],
      criteria: [
        { name: "Criterion A: Knowledge & Understanding", maxMarks: 8, descriptor: "Correct application of momentum conservation equations and Newton's laws." },
        { name: "Criterion D: Communication", maxMarks: 7, descriptor: "Clarity of working, correct use of notation, units, and diagrams." },
      ],
    },
    {
      id: "a3", title: "Centripetal Forces Lab Log", due: "In 9 days", status: "pending", grade: "-", maxMarks: 20,
      description: "Conduct the centripetal force experiment using the rotating platform apparatus. Record all observations, measurements, and uncertainties in your lab notebook. Complete the post-lab analysis section including a graph of F vs. v².",
      instructions: [
        "Work in pairs. Both partners must submit individual lab logs.",
        "Record at least 5 data points for each radius setting.",
        "Include absolute and percentage uncertainties for all measurements.",
        "Plot F vs. v² using Desmos or Logger Pro and export the graph.",
        "Answer the 4 post-lab discussion questions.",
      ],
      attachments: [
        { name: "Lab_Log_Template.docx", type: "DOCX" },
        { name: "Centripetal_Force_Pre-Lab_Video", type: "Link" },
      ],
      criteria: [
        { name: "Criterion B: Inquiry & Design", maxMarks: 6, descriptor: "Clear variables identification, appropriate method, controlled variables." },
        { name: "Criterion C: Processing & Evaluation", maxMarks: 6, descriptor: "Correct data processing, graphing, uncertainty propagation, evaluation of method." },
        { name: "Criterion E: Lab Skills", maxMarks: 8, descriptor: "Safe and competent use of apparatus, efficient data collection, teamwork." },
      ],
    },
  ],
  math: [
    {
      id: "d5", title: "Calculus Problem Set 7", due: "In 7 days", status: "pending", grade: "-", maxMarks: 20,
      description: "This problem set covers integration by parts, substitution, and definite integrals. Each question builds in complexity. Questions 7–10 are extension problems for students aiming at level 7.",
      instructions: [
        "Show all steps clearly. Marks are awarded for method.",
        "Use correct mathematical notation (integral signs, limits, dx).",
        "Extension problems (7–10) are optional but strongly recommended for HL students.",
      ],
      attachments: [{ name: "Problem_Set_7.pdf", type: "PDF" }],
      criteria: [
        { name: "Criterion A: Knowledge & Understanding", maxMarks: 12, descriptor: "Correct application of integration techniques including substitution and by-parts." },
        { name: "Criterion B: Problem Solving", maxMarks: 8, descriptor: "Logical approach, correct setup, and interpretation of results." },
      ],
    },
    {
      id: "m2", title: "Limits & Derivatives Quiz", due: "Past", status: "graded", grade: "6/7", maxMarks: 10,
      description: "In-class quiz covering limits, first principles differentiation, and basic derivative rules.",
      instructions: ["Completed in class under timed conditions."],
      attachments: [],
      criteria: [
        { name: "Criterion A: Knowledge", maxMarks: 6, descriptor: "Recall and application of limit laws and derivative rules.", awarded: 5 },
        { name: "Criterion C: Communication", maxMarks: 4, descriptor: "Correct mathematical notation and logical presentation.", awarded: 3 },
      ],
      feedback: { comment: "Excellent technique on the chain rule questions. Minor notation errors on Q4 — remember to write the limit statement before evaluating. Overall, very strong performance.", date: "May 12, 2026" },
    },
  ],
  english: [
    {
      id: "d3", title: "Poem Analysis Essay", due: "In 4 days", status: "pending", grade: "-", maxMarks: 25,
      description: "Write a guided literary analysis essay on one of the three assigned poems. Your essay should demonstrate close reading skills, identify literary devices, and develop a clear thesis about the poem's central meaning.",
      instructions: [
        "Choose ONE poem from the provided list (Plath, Hughes, or Duffy).",
        "Write 800–1200 words.",
        "Include at least 6 embedded quotations with analysis.",
        "Structure: Introduction (thesis), 3 body paragraphs (each with a device + effect), Conclusion.",
        "Submit as a Word document via Axis.",
      ],
      attachments: [
        { name: "Poem_Anthology_Selection.pdf", type: "PDF" },
        { name: "Literary_Devices_Reference.pdf", type: "PDF" },
        { name: "Essay_Writing_Rubric.pdf", type: "PDF" },
      ],
      criteria: [
        { name: "Criterion A: Knowledge & Understanding", maxMarks: 5, descriptor: "Understanding of the poem's content, context, and the writer's choices." },
        { name: "Criterion B: Analysis & Evaluation", maxMarks: 5, descriptor: "Insightful analysis of how literary devices create meaning and effect." },
        { name: "Criterion C: Focus & Organization", maxMarks: 5, descriptor: "Coherent structure, clear thesis, effective use of topic sentences." },
        { name: "Criterion D: Language", maxMarks: 5, descriptor: "Appropriate register, varied vocabulary, accurate grammar and spelling." },
        { name: "Criterion E: Originality & Insight", maxMarks: 5, descriptor: "Personal voice, original interpretations, depth of engagement." },
      ],
    },
  ],
  chemistry: [
    {
      id: "d4", title: "Stoichiometry Lab Report", due: "In 5 days", status: "pending", grade: "-", maxMarks: 20,
      description: "Write a formal lab report for the stoichiometry titration experiment. Determine the concentration of the unknown hydrochloric acid solution using standardised sodium hydroxide.",
      instructions: [
        "Use the formal lab report template provided.",
        "Include a balanced equation with state symbols.",
        "Show mole calculations with appropriate significant figures.",
        "Discuss sources of systematic and random error.",
      ],
      attachments: [
        { name: "Lab_Report_Template.docx", type: "DOCX" },
        { name: "Titration_Data_Sheet.pdf", type: "PDF" },
      ],
      criteria: [
        { name: "Criterion B: Inquiry & Design", maxMarks: 6, descriptor: "Appropriate method, identification of variables, safety considerations." },
        { name: "Criterion C: Processing & Evaluation", maxMarks: 14, descriptor: "Accurate calculations, uncertainty analysis, evaluation of method." },
      ],
    },
    {
      id: "ia-chem", title: "Chemistry IA Final Draft", due: "In 15 days", status: "pending", grade: "-", maxMarks: 24,
      description: "Submit the final draft of your Chemistry Internal Assessment. This should be a complete, polished document ready for IB moderation.",
      instructions: [
        "Maximum 12 pages (excluding bibliography and appendices).",
        "Ensure your RQ links directly to the Chemistry syllabus.",
        "Include processed data with appropriate statistical analysis.",
        "Proofread for clarity, coherence, and academic tone.",
      ],
      attachments: [{ name: "Chemistry_IA_Rubric.pdf", type: "PDF" }, { name: "IA_Checklist.pdf", type: "PDF" }],
      criteria: [
        { name: "Personal Engagement", maxMarks: 2, descriptor: "Evidence of personal significance and curiosity." },
        { name: "Exploration", maxMarks: 6, descriptor: "Research question, methodology, and background." },
        { name: "Analysis", maxMarks: 6, descriptor: "Data processing, interpretation, and uncertainties." },
        { name: "Evaluation", maxMarks: 6, descriptor: "Strengths, weaknesses, and realistic improvements." },
        { name: "Communication", maxMarks: 4, descriptor: "Structure, terminology, and coherence." },
      ],
    },
  ],
  psychology: [
    {
      id: "psy-ia", title: "Psychology IA Rough Draft", due: "In 6 days", status: "pending", grade: "-", maxMarks: 22,
      description: "Submit your rough draft for the Psychology Internal Assessment. This is a simple experimental study replicating or modifying a published study. Focus on clarity of your aim, hypothesis, and ethical considerations.",
      instructions: [
        "1800–2200 words maximum.",
        "Include an appendix with your raw data, consent forms, and debriefing notes.",
        "Use APA 7th edition referencing.",
      ],
      attachments: [{ name: "Psychology_IA_Guide.pdf", type: "PDF" }],
      criteria: [
        { name: "Introduction", maxMarks: 6, descriptor: "Aim, background, and hypothesis linked to a study being replicated." },
        { name: "Exploration (Method)", maxMarks: 6, descriptor: "Design, participants, materials, procedure, and ethics." },
        { name: "Analysis", maxMarks: 6, descriptor: "Descriptive statistics, graph, interpretation of results." },
        { name: "Evaluation", maxMarks: 4, descriptor: "Strengths, limitations, and suggestions for modification." },
      ],
    },
  ],
  spanish: [
    {
      id: "esp-vocab", title: "Vocabulario Temático Exercise", due: "Tomorrow", status: "graded", grade: "12/15", maxMarks: 15,
      description: "Complete the themed vocabulary exercise focusing on environmental and sustainability vocabulary in Spanish.",
      instructions: ["Complete all exercises in the workbook pages 45–48."],
      attachments: [],
      criteria: [
        { name: "Comprensión Escrita", maxMarks: 8, descriptor: "Accuracy of vocabulary usage in context.", awarded: 7 },
        { name: "Expresión Escrita", maxMarks: 7, descriptor: "Grammatical accuracy and range of vocabulary.", awarded: 5 },
      ],
      feedback: { comment: "Buen trabajo con el vocabulario de sostenibilidad. Trabaja en las formas del subjuntivo — los errores en ejercicio 3 afectan la precisión. Revisa las conjugaciones irregulares.", date: "Jun 10, 2026" },
    },
    {
      id: "ia-esp", title: "Spanish IA Individual Oral Plan", due: "In 10 days", status: "pending", grade: "-", maxMarks: 30,
      description: "Prepare your plan and source material for the Individual Oral assessment. Choose a literary extract and a non-literary text linked to a global issue.",
      instructions: [
        "Select one literary extract from the studied works.",
        "Select one non-literary document (article, image, advert) linked to a global issue.",
        "Write a brief plan (bullet points) for your 15-minute oral.",
        "Practise with a timer — 3-4 min per extract, plus 5 min discussion.",
      ],
      attachments: [{ name: "IO_Planning_Template.pdf", type: "PDF" }, { name: "Global_Issues_List", type: "Link" }],
      criteria: [
        { name: "Criterion A: Language", maxMarks: 12, descriptor: "Range, accuracy, and fluency of spoken language." },
        { name: "Criterion B: Message", maxMarks: 10, descriptor: "Relevance, depth, and development of ideas." },
        { name: "Criterion C: Interactive Skills", maxMarks: 8, descriptor: "Engagement, spontaneity, and ability to sustain discussion." },
      ],
    },
  ],
  ee: [
    {
      id: "ee-proposal", title: "EE Research Proposal", due: "Past", status: "graded", grade: "Approved", maxMarks: 6,
      description: "Submit your Extended Essay research proposal with a clear research question, methodology outline, and initial source list.",
      instructions: ["Use the official EE Proposal Form.", "Include at least 8 preliminary sources."],
      attachments: [{ name: "EE_Proposal_Form.pdf", type: "PDF" }],
      criteria: [
        { name: "Focus & Method", maxMarks: 3, descriptor: "Clarity and feasibility of the research question and proposed method.", awarded: 3 },
        { name: "Knowledge & Understanding", maxMarks: 3, descriptor: "Evidence of initial research and understanding of the topic.", awarded: 3 },
      ],
      feedback: { comment: "Excellent research question. Make sure your methodology relies on primary data sources as proposed. Your initial source list is strong — I'd recommend adding Feynman's lectures as a secondary source.", date: "May 10, 2026" },
      submittedFiles: ["EE_Proposal_ChloeVance.pdf"],
      submissionText: "My Extended Essay proposal on gravitational anomalies. I have outlined the core math models and added 10 resources in the bibliography.",
      submissionDate: "May 08, 2026",
      submissionTime: "11:30",
      submissionVersion: "Version 1.0",
    },
    {
      id: "ee-draft1", title: "EE First Draft (2000 words)", due: "In 14 days", status: "pending", grade: "-", maxMarks: 34,
      description: "Submit the first 2000 words of your Extended Essay. This should include your introduction, literature review, and the beginning of your analysis.",
      instructions: [
        "Follow the EE structure: Introduction → Literature Review → Methodology → Analysis.",
        "Include in-text citations (APA 7th edition).",
        "Submit as a Word document with page numbers.",
      ],
      attachments: [{ name: "EE_Structure_Guide.pdf", type: "PDF" }, { name: "EE_Rubric_2026.pdf", type: "PDF" }],
      criteria: [
        { name: "Focus & Method", maxMarks: 6, descriptor: "Clear topic, RQ, and appropriate methodology." },
        { name: "Knowledge & Understanding", maxMarks: 6, descriptor: "Relevant, accurate subject knowledge and terminology." },
        { name: "Critical Thinking", maxMarks: 12, descriptor: "Research, analysis, discussion, and evaluation." },
        { name: "Presentation", maxMarks: 4, descriptor: "Structure, layout, and referencing." },
        { name: "Engagement", maxMarks: 6, descriptor: "Intellectual initiative and reflective process." },
      ],
    },
  ],
  "tok-core": [
    {
      id: "tok-exh", title: "TOK Exhibition Final Submission", due: "Past", status: "graded", grade: "9/10", maxMarks: 10,
      description: "Submit your final TOK Exhibition with three objects linked to one of the IA prompts.",
      instructions: ["Three objects, each with a 950-word commentary.", "Include images of your objects."],
      attachments: [],
      criteria: [
        { name: "Object Link to Prompt", maxMarks: 5, descriptor: "How effectively each object is linked to the chosen IA prompt.", awarded: 5 },
        { name: "Explanation & Justification", maxMarks: 5, descriptor: "Depth and clarity of the commentary for each object.", awarded: 4 },
      ],
      feedback: { comment: "Excellent choice of objects. Your justification for the link between the objects and the prompt was clear and well-argued. The third object could have been explored more deeply.", date: "May 15, 2026" },
      submittedFiles: ["TOK_Exhibition_Final.pdf", "Exhibition_Object_Images.zip"],
      submissionText: "Here is the final version of my TOK Exhibition. The chosen prompt is 'What makes something knowledge?' and I have used my grandfather's watch, a scientific calculator, and a copy of the Magna Carta.",
      submissionDate: "May 12, 2026",
      submissionTime: "14:15",
      submissionVersion: "Version 1.0 (Final)",
    },
    {
      id: "tok-essay", title: "TOK Essay Draft", due: "In 18 days", status: "pending", grade: "-", maxMarks: 10,
      description: "Write your TOK essay responding to one of the six prescribed titles for the May 2027 session.",
      instructions: [
        "Choose one of the six prescribed titles.",
        "1200–1600 words.",
        "Reference at least two Areas of Knowledge.",
        "Include real-life examples and counter-arguments.",
      ],
      attachments: [{ name: "TOK_Prescribed_Titles_2027.pdf", type: "PDF" }, { name: "TOK_Essay_Rubric.pdf", type: "PDF" }],
      criteria: [
        { name: "Understanding Knowledge Questions", maxMarks: 5, descriptor: "Depth of understanding of the KQ and its implications." },
        { name: "Quality of Analysis", maxMarks: 5, descriptor: "Effective use of examples, counter-claims, and perspectives." },
      ],
    },
  ],
  cas: [
    {
      id: "cas-prop", title: "CAS Project Proposal", due: "Past", status: "graded", grade: "Approved", maxMarks: 0,
      description: "Submit your CAS project proposal outlining your community garden initiative.",
      instructions: ["Use the CAS Project Planning Form."],
      attachments: [{ name: "CAS_Project_Form.pdf", type: "PDF" }],
      criteria: [
        { name: "Collaboration", maxMarks: 3, descriptor: "Evidence of collaborative planning with community partners.", awarded: 3 },
        { name: "Engagement", maxMarks: 2, descriptor: "Personal initiative and commitment to the project.", awarded: 2 },
      ],
      feedback: { comment: "Great initiative. The community garden project meets all service learning outcomes. Ensure you document your reflections throughout the project.", date: "Apr 20, 2026" },
      submittedFiles: ["CAS_Proposal_CommunityGarden.pdf"],
      submissionText: "This is our proposed plan for setting up the community garden in the south block. We will cooperate with the local neighborhood council.",
      submissionDate: "Apr 15, 2026",
      submissionTime: "09:00",
      submissionVersion: "Version 1.0",
    },
    {
      id: "cas-ref1", title: "Creativity Reflection: Piano Practice", due: "In 2 days", status: "pending", grade: "-", maxMarks: 0,
      description: "Write a structured reflection on your piano practice sessions over the past month, linking your experience to the CAS learning outcomes.",
      instructions: ["300–500 words.", "Reference at least 2 CAS learning outcomes explicitly.", "Include evidence (photo, video link, or log)."],
      attachments: [{ name: "CAS_Reflection_Template.pdf", type: "PDF" }],
      criteria: [
        { name: "Reflection Quality", maxMarks: 0, descriptor: "Depth, honesty, and connection to CAS learning outcomes. (Pass/Fail)" },
      ],
    },
    {
      id: "cas-ref2", title: "Activity Reflection: Football Tournament", due: "In 5 days", status: "pending", grade: "-", maxMarks: 0,
      description: "Reflect on your participation in the inter-school football tournament, focusing on teamwork, challenge, and personal growth.",
      instructions: ["300–500 words.", "Link to at least 2 CAS learning outcomes."],
      attachments: [],
      criteria: [
        { name: "Reflection Quality", maxMarks: 0, descriptor: "Depth, honesty, and connection to CAS learning outcomes. (Pass/Fail)" },
      ],
    },
  ],
};

const CLASS_RESOURCES: Record<string, ResourceFolder[]> = {
  physics: [
    { id: "f-ref", name: "Reference Materials", files: [
      { id: "r1", name: "IB Physics Data Booklet", type: "PDF", size: "2.1MB" },
      { id: "r2", name: "Mechanics Formula Sheet", type: "PDF", size: "420KB" },
      { id: "r_policy", name: "Axis_Assessment_Policy.pdf", type: "PDF", size: "240KB" },
    ]},
    { id: "f-lab", name: "Lab Resources", files: [
      { id: "r3", name: "Lab Safety Protocol", type: "PDF", size: "920KB" },
      { id: "r4", name: "Kinematics Simulation", type: "Link" },
      { id: "r5", name: "Data Collection Template", type: "DOCX", size: "180KB" },
    ]},
    { id: "f-ia", name: "IA Support", files: [
      { id: "r6", name: "Physics IA Rubric 2026", type: "PDF", size: "340KB" },
      { id: "r7", name: "Sample IA Grade A", type: "PDF", size: "1.8MB" },
      { id: "r8", name: "Linearisation Guide", type: "Link" },
    ]},
  ],
  math: [
    { id: "f-ref", name: "Reference Materials", files: [
      { id: "r_m1", name: "IB Mathematics HL Formula Booklet", type: "PDF", size: "1.8MB" },
    ]},
    { id: "f-ps", name: "Problem Sets & Answers", files: [
      { id: "r_m2", name: "Problem Set 7 Solutions", type: "PDF", size: "620KB" },
      { id: "r_m3", name: "Past Paper Pack (2020–2025)", type: "PDF", size: "4.2MB" },
    ]},
    { id: "f-ia", name: "IA Resources", files: [
      { id: "r_m4", name: "Math IA Criteria Breakdown", type: "PDF", size: "280KB" },
      { id: "r_m5", name: "Sample Explorations (Grade 7)", type: "PDF", size: "3.1MB" },
    ]},
  ],
  english: [
    { id: "f-texts", name: "Set Texts & Anthologies", files: [
      { id: "r_e1", name: "Poem Anthology Selection", type: "PDF", size: "1.1MB" },
      { id: "r_e2", name: "DP Poetry Syllabus Overview", type: "Link" },
    ]},
    { id: "f-writing", name: "Writing Support", files: [
      { id: "r_e3", name: "Literary Devices Reference", type: "PDF", size: "520KB" },
      { id: "r_e4", name: "Essay Structure Guide", type: "PDF", size: "340KB" },
    ]},
  ],
  chemistry: [
    { id: "f-ref", name: "Reference Materials", files: [
      { id: "r_c1", name: "IB Chemistry Data Booklet", type: "PDF", size: "3.2MB" },
      { id: "r_c2", name: "Periodic Table (Annotated)", type: "PDF", size: "850KB" },
    ]},
    { id: "f-lab", name: "Lab Templates", files: [
      { id: "r_c3", name: "Formal Lab Report Template", type: "DOCX", size: "220KB" },
      { id: "r_c4", name: "Titration Data Sheet", type: "PDF", size: "150KB" },
    ]},
  ],
  psychology: [
    { id: "f-ref", name: "Course Materials", files: [
      { id: "r_p1", name: "IB Psychology Guide 2026", type: "PDF", size: "1.9MB" },
      { id: "r_p2", name: "Cognitive Approach Study Pack", type: "PDF", size: "950KB" },
    ]},
    { id: "f-ia", name: "IA Resources", files: [
      { id: "r_p3", name: "Psychology IA Guide", type: "PDF", size: "680KB" },
      { id: "r_p4", name: "APA 7th Referencing Guide", type: "Link" },
    ]},
  ],
  spanish: [
    { id: "f-lang", name: "Language Resources", files: [
      { id: "r_s1", name: "Spanish B Grammar Guide", type: "PDF", size: "1.2MB" },
      { id: "r_s2", name: "Audios de Comprensión Oral", type: "Link" },
    ]},
    { id: "f-io", name: "Individual Oral Prep", files: [
      { id: "r_s3", name: "IO Planning Template", type: "PDF", size: "180KB" },
      { id: "r_s4", name: "Global Issues List", type: "Link" },
    ]},
  ],
  ee: [
    { id: "f-guide", name: "EE Guidance", files: [
      { id: "r_ee1", name: "IB Extended Essay Guide 2026", type: "PDF", size: "2.4MB" },
      { id: "r_ee2", name: "EE Assessment Rubric & Criteria", type: "PDF", size: "850KB" },
      { id: "r_ee3", name: "Sample Extended Essays (Grade A)", type: "Link" },
    ]},
  ],
  "tok-core": [
    { id: "f-tok", name: "TOK Materials", files: [
      { id: "r_t1", name: "TOK Exhibition Planning Template", type: "PDF", size: "180KB" },
      { id: "r_t2", name: "TOK Essay Prompts & Rubric 2026", type: "PDF", size: "310KB" },
    ]},
  ],
  cas: [
    { id: "f-cas", name: "CAS Handbook & Forms", files: [
      { id: "r_ca1", name: "CAS Handbook 2025-2027", type: "PDF", size: "1.2MB" },
      { id: "r_ca2", name: "CAS Reflection Guidelines", type: "PDF", size: "320KB" },
      { id: "r_ca3", name: "CAS Activity Approval Form", type: "Link" },
    ]},
  ],
};

const CLASS_MEMBERS: ClassMember[] = [
  { id: "m1", name: "Anika Patel", initials: "AP", color: "bg-cyan-500/20 text-cyan-400" },
  { id: "m2", name: "Lucas Kim", initials: "LK", color: "bg-indigo-500/20 text-indigo-400" },
  { id: "m3", name: "Sofia Martinez", initials: "SM", color: "bg-amber-500/20 text-amber-400" },
  { id: "m4", name: "Ethan Okonkwo", initials: "EO", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "m5", name: "Mei-Ling Wu", initials: "MW", color: "bg-rose-500/20 text-rose-400" },
];

const UNIT_ROADMAPS: Record<string, RoadmapUnit[]> = {
  physics: [
    { id: "u1", title: "Unit 1: Measurements & Uncertainties", subtitle: "Foundations of experimental physics", weeks: "Weeks 1–3", status: "completed", topics: ["SI Units", "Uncertainty & Error", "Vectors & Scalars"], keyAssessment: "Lab: Pendulum Uncertainty Analysis" },
    { id: "u2", title: "Unit 2: Mechanics", subtitle: "Kinematics, dynamics, and energy", weeks: "Weeks 4–10", status: "completed", topics: ["Kinematics (SUVAT)", "Newton's Laws", "Work, Energy & Power", "Momentum & Impulse"], keyAssessment: "Test: Mechanics" },
    { id: "u3", title: "Unit 3: Thermal Physics", subtitle: "Heat, temperature, and gas laws", weeks: "Weeks 11–14", status: "current", topics: ["Thermal Concepts", "Gas Laws (Ideal Gas)", "Internal Energy", "Specific Heat & Latent Heat"], keyAssessment: "Lab: Specific Heat Capacity" },
    { id: "u4", title: "Unit 4: Waves", subtitle: "Oscillations, wave behaviour, and sound", weeks: "Weeks 15–20", status: "upcoming", topics: ["Simple Harmonic Motion", "Travelling Waves", "Wave Characteristics", "Standing Waves", "Doppler Effect"], keyAssessment: "Test: Waves" },
    { id: "u5", title: "Unit 5: Electricity & Magnetism", subtitle: "Circuits, fields, and electromagnetic induction", weeks: "Weeks 21–27", status: "upcoming", topics: ["Electric Fields", "Circuits (Kirchhoff's)", "Magnetic Fields", "Electromagnetic Induction (HL)"], keyAssessment: "Lab: Ohm's Law & Circuits" },
    { id: "u6", title: "Unit 6: Circular Motion & Gravitation", subtitle: "Orbital mechanics and gravitational fields", weeks: "Weeks 28–31", status: "upcoming", topics: ["Centripetal Force", "Newton's Law of Gravitation", "Orbital Motion"], keyAssessment: "Test: Circular Motion" },
  ],
  math: [
    { id: "u1", title: "Unit 1: Algebra & Functions", subtitle: "Sequences, series, and function theory", weeks: "Weeks 1–5", status: "completed", topics: ["Arithmetic & Geometric Sequences", "Binomial Theorem", "Functions & Transformations"], keyAssessment: "Test: Algebra" },
    { id: "u2", title: "Unit 2: Trigonometry", subtitle: "Circular functions and identities", weeks: "Weeks 6–9", status: "completed", topics: ["Unit Circle", "Trig Identities", "Solving Trig Equations", "Compound Angles (HL)"] },
    { id: "u3", title: "Unit 3: Calculus — Differentiation", subtitle: "Limits, derivatives, and applications", weeks: "Weeks 10–16", status: "completed", topics: ["Limits & Continuity", "First Principles", "Chain, Product, Quotient Rules", "Applications of Differentiation"], keyAssessment: "Quiz: Limits & Derivatives" },
    { id: "u4", title: "Unit 4: Calculus — Integration", subtitle: "Antiderivatives and definite integrals", weeks: "Weeks 17–22", status: "current", topics: ["Indefinite Integrals", "Integration by Substitution", "Integration by Parts (HL)", "Definite Integrals & Areas"], keyAssessment: "Problem Set 7" },
    { id: "u5", title: "Unit 5: Statistics & Probability", subtitle: "Distributions, inference, and hypothesis testing", weeks: "Weeks 23–28", status: "upcoming", topics: ["Descriptive Statistics", "Probability", "Binomial & Normal Distributions", "Hypothesis Testing (HL)"], keyAssessment: "Test: Probability" },
    { id: "u6", title: "Unit 6: Vectors", subtitle: "3D vectors, lines, and planes", weeks: "Weeks 29–33", status: "upcoming", topics: ["Vector Operations", "Scalar & Cross Product", "Lines & Planes in 3D"], keyAssessment: "Test: Vectors" },
  ],
  english: [
    { id: "u1", title: "Unit 1: Approaches to Poetry", subtitle: "Close reading and analysis", weeks: "Weeks 1–6", status: "completed", topics: ["Poetic Forms & Conventions", "Imagery & Symbolism", "Tone & Voice", "Guided Literary Analysis"], keyAssessment: "Essay: Poem Analysis" },
    { id: "u2", title: "Unit 2: The Novel", subtitle: "Narrative technique and characterisation", weeks: "Weeks 7–14", status: "current", topics: ["Narrative Perspective", "Characterisation", "Setting & Atmosphere", "Theme Development"], keyAssessment: "Paper 1 Practice" },
    { id: "u3", title: "Unit 3: Drama", subtitle: "Staging, dialogue, and dramatic irony", weeks: "Weeks 15–21", status: "upcoming", topics: ["Dramatic Structure", "Dialogue Analysis", "Stage Directions", "Performance vs. Text"], keyAssessment: "Oral Commentary" },
    { id: "u4", title: "Unit 4: Non-literary Texts", subtitle: "Media, rhetoric, and persuasion", weeks: "Weeks 22–27", status: "upcoming", topics: ["Advertising", "Speeches", "Visual Texts", "Bias & Rhetoric"] },
  ],
  chemistry: [
    { id: "u1", title: "Unit 1: Stoichiometry", subtitle: "Moles, equations, and limiting reagents", weeks: "Weeks 1–4", status: "completed", topics: ["Mole Concept", "Empirical & Molecular Formulae", "Limiting Reagent Calculations"] },
    { id: "u2", title: "Unit 2: Atomic Structure", subtitle: "Electron configuration and periodicity", weeks: "Weeks 5–8", status: "completed", topics: ["Isotopes", "Electron Configuration", "Ionisation Energy Trends"] },
    { id: "u3", title: "Unit 3: Bonding & Structure", subtitle: "Ionic, covalent, and metallic bonding", weeks: "Weeks 9–14", status: "current", topics: ["Ionic Bonding", "Covalent Bonding & VSEPR", "Intermolecular Forces", "Metallic Bonding"], keyAssessment: "Lab: Stoichiometry Titration" },
    { id: "u4", title: "Unit 4: Energetics", subtitle: "Enthalpy changes and Hess's law", weeks: "Weeks 15–19", status: "upcoming", topics: ["Enthalpy Changes", "Calorimetry", "Hess's Law", "Bond Enthalpies"], keyAssessment: "Test: Energetics" },
  ],
  psychology: [
    { id: "u1", title: "Unit 1: Biological Approach", subtitle: "Brain, behaviour, and biology", weeks: "Weeks 1–7", status: "completed", topics: ["Brain Localisation", "Neurotransmitters", "Hormones & Behaviour", "Genetics & Behaviour"] },
    { id: "u2", title: "Unit 2: Cognitive Approach", subtitle: "Memory, perception, and cognition", weeks: "Weeks 8–15", status: "current", topics: ["Multi-Store Memory Model", "Schema Theory", "Cognitive Biases", "Reliability of Cognitive Processes"], keyAssessment: "Psychology IA Rough Draft" },
    { id: "u3", title: "Unit 3: Sociocultural Approach", subtitle: "Culture, identity, and social influence", weeks: "Weeks 16–22", status: "upcoming", topics: ["Social Identity Theory", "Cultural Dimensions", "Enculturation & Acculturation", "Stereotypes & Discrimination"], keyAssessment: "Test: Sociocultural" },
  ],
  spanish: [
    { id: "u1", title: "Unidad 1: Identidades", subtitle: "Personal identity and relationships", weeks: "Semanas 1–6", status: "completed", topics: ["Familia y Relaciones", "Tradiciones Culturales", "Vocabulario de Identidad"] },
    { id: "u2", title: "Unidad 2: Experiencias", subtitle: "Leisure, travel, and migration", weeks: "Semanas 7–12", status: "completed", topics: ["Viajes y Turismo", "Migración", "Tiempo Libre"], keyAssessment: "Oral Mock Presentation" },
    { id: "u3", title: "Unidad 3: Ingenio Humano", subtitle: "Technology, science, and sustainability", weeks: "Semanas 13–18", status: "current", topics: ["Tecnología", "Medioambiente y Sostenibilidad", "Vocabulario Temático"], keyAssessment: "Vocabulario Temático Exercise" },
    { id: "u4", title: "Unidad 4: Organización Social", subtitle: "Education, law, and community", weeks: "Semanas 19–24", status: "upcoming", topics: ["Educación", "Justicia Social", "Comunidad y Servicio"], keyAssessment: "Individual Oral" },
  ],
  ee: [
    { id: "u1", title: "Phase 1: Topic Selection", subtitle: "Choosing subject and research question", weeks: "Weeks 1–4", status: "completed", topics: ["Subject Selection", "Initial Reading", "Research Question Draft"], keyAssessment: "EE Research Proposal" },
    { id: "u2", title: "Phase 2: Research & Writing", subtitle: "Data collection and first draft", weeks: "Weeks 5–16", status: "current", topics: ["Literature Review", "Primary/Secondary Data", "First Draft (2000 words)"], keyAssessment: "EE First Draft" },
    { id: "u3", title: "Phase 3: Revision & Submission", subtitle: "Final editing and Viva Voce", weeks: "Weeks 17–24", status: "upcoming", topics: ["Final Draft (4000 words)", "Referencing & Formatting", "Viva Voce Preparation"] },
  ],
  "tok-core": [
    { id: "u1", title: "Part 1: Core Theme", subtitle: "Knowledge and the Knower", weeks: "Weeks 1–8", status: "completed", topics: ["Scope of Knowledge", "Personal vs. Shared Knowledge", "Knowledge Communities"] },
    { id: "u2", title: "Part 2: Optional Themes", subtitle: "Knowledge and Technology / Language", weeks: "Weeks 9–16", status: "completed", topics: ["Technology & Knowledge Production", "Language & Knowledge", "Bias in Digital Knowledge"] },
    { id: "u3", title: "Part 3: Areas of Knowledge", subtitle: "Natural Sciences & Human Sciences", weeks: "Weeks 17–24", status: "current", topics: ["Scientific Method", "Paradigm Shifts", "Ethics in Research", "Cultural Perspectives"], keyAssessment: "TOK Exhibition" },
    { id: "u4", title: "Part 4: TOK Essay", subtitle: "Prescribed title response", weeks: "Weeks 25–32", status: "upcoming", topics: ["Title Selection", "Argument Structure", "Counter-claims", "Real-life Examples"], keyAssessment: "TOK Essay Draft" },
  ],
  cas: [
    { id: "u1", title: "Phase 1: Planning", subtitle: "Setting goals and identifying activities", weeks: "Term 1", status: "completed", topics: ["CAS Learning Outcomes", "Activity Selection", "Project Proposal"], keyAssessment: "CAS Project Proposal" },
    { id: "u2", title: "Phase 2: Active Engagement", subtitle: "Doing activities and reflecting", weeks: "Term 2–3", status: "current", topics: ["Creativity Activities", "Physical Activities", "Service Initiatives", "Ongoing Reflections"], keyAssessment: "Creativity Reflection: Piano" },
    { id: "u3", title: "Phase 3: Final Portfolio", subtitle: "Compiling evidence and summative reflection", weeks: "Term 4", status: "upcoming", topics: ["Portfolio Compilation", "Summative Reflection", "CAS Interview Preparation"] },
  ],
};

const TABS: { id: TabId; label: string }[] = [
  { id: "assignments", label: "Assignments" },
  { id: "resources", label: "Resources" },
  { id: "roadmap", label: "Unit Roadmap" },
  { id: "members", label: "Members" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusStyle = (status: Assignment["status"], isLight: boolean) => {
  switch (status) {
    case "graded":
      return isLight ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "submitted":
      return isLight ? "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" : "bg-cyan-500/15 text-cyan-400 border-cyan-500/20";
    case "pending":
      return isLight ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
};

const getMemberAvatarStyle = (memberColor: string, isLight: boolean) => {
  if (isLight) {
    return memberColor
      .replace("text-cyan-400", "text-cyan-700").replace("text-indigo-400", "text-indigo-700")
      .replace("text-amber-400", "text-amber-700").replace("text-emerald-400", "text-emerald-700")
      .replace("text-rose-400", "text-rose-700").replace("bg-cyan-500/20", "bg-cyan-500/10")
      .replace("bg-indigo-500/20", "bg-indigo-500/10").replace("bg-amber-500/20", "bg-amber-500/10")
      .replace("bg-emerald-500/20", "bg-emerald-500/10").replace("bg-rose-500/20", "bg-rose-500/10");
  }
  return memberColor;
};

const fadeSlide = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClassCard({ cls, index, onSelect, theme }: { cls: EnrolledClass; index: number; onSelect: () => void; theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const isIb = ["ee", "tok-core", "cas"].includes(cls.id);
  const teacherLabel = isIb ? (cls.id === "ee" || cls.id === "cas" ? "Advisor" : "Coordinator") : "Teacher";
  const studentText = isIb ? (cls.id === "ee" || cls.id === "cas" ? "Individual Project" : "Core Component") : `${cls.studentCount} students`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-colors ${styles.cardBg} ${
        isLight ? "hover:border-black/[0.15]" : "hover:border-white/[0.15]"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${cls.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute top-0 left-0 h-[2px] w-full ${cls.accent} opacity-50 group-hover:opacity-80 transition-opacity`} />
      <div className="relative z-10 p-5 space-y-4 flex flex-col justify-between h-full min-h-[140px]">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-semibold leading-tight ${styles.textPrimary}`}>{cls.name}</h3>
            <span className={`flex-shrink-0 h-2 w-2 rounded-full ${cls.accent} mt-1`} />
          </div>
          <p className={`text-xs mt-0.5 ${styles.textSecondary} opacity-60`}>{cls.subtitle}</p>
        </div>
        <div className="space-y-2">
          <div className={`flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest ${styles.textSecondary} opacity-60`}>
            <span>{studentText}</span>
            <span>•</span>
            <span>{teacherLabel}: {cls.teacher}</span>
          </div>
          {cls.activeAssignments > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className={`text-[10px] font-semibold ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                {cls.activeAssignments} active assignment{cls.activeAssignments > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
 const MOCK_PERSONAL_DB = [
  {
    id: "p-drafts",
    name: "My Drafts",
    files: [
      { name: "Physics_IA_Draft2_ChloeV.pdf", type: "PDF", size: "1.2 MB" },
      { name: "Physics_IA_Final.pdf", type: "PDF", size: "1.4 MB" },
      { name: "TOK_Exhibition_Draft.pdf", type: "PDF", size: "980 KB" },
      { name: "Math_Exploration_Draft.pdf", type: "PDF", size: "1.1 MB" },
      { name: "English_Analysis_Outline.docx", type: "DOCX", size: "340 KB" },
      { name: "Calculus_ProblemSet7_v1.docx", type: "DOCX", size: "150 KB" }
    ]
  },
  {
    id: "p-research",
    name: "Research & Data",
    files: [
      { name: "Kinematics_Lab_Raw_Data.xlsx", type: "XLSX", size: "45 KB" },
      { name: "Linearisation_Data_Tables.xlsx", type: "XLSX", size: "28 KB" }
    ]
  },
  {
    id: "p-documents",
    name: "Admissions Docs",
    files: [
      { name: "resume_2026.pdf", type: "PDF", size: "820 KB" },
      { name: "recommendation_request.pdf", type: "PDF", size: "110 KB" },
      { name: "University_Essay_Draft.pdf", type: "PDF", size: "640 KB" }
    ]
  }
];

const RECENT_FILES = [
  { name: "Physics_IA_Final.pdf", type: "PDF", size: "1.4 MB" },
  { name: "TOK_Exhibition_Draft.pdf", type: "PDF", size: "980 KB" },
  { name: "Math_Exploration_Draft.pdf", type: "PDF", size: "1.1 MB" },
  { name: "University_Essay_Draft.pdf", type: "PDF", size: "640 KB" }
];

function TaskDetailModal({
  task,
  theme,
  classId,
  onClose,
  onSubmit,
}: {
  task: Assignment;
  theme: Theme;
  classId: string;
  onClose: () => void;
  onSubmit?: (files: string[], text: string) => void;
}) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const [attachedFiles, setAttachedFiles] = useState<string[]>(task.submittedFiles || []);
  const [submissionText, setSubmissionText] = useState(task.submissionText || "");
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [activePickerSource, setActivePickerSource] = useState<"computer" | "personal" | "resources" | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showFilePicker && (activePickerSource === "personal" || activePickerSource === "resources")) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showFilePicker, activePickerSource]);

  useEffect(() => {
    setSearchQuery("");
  }, [activePickerSource]);

  useEffect(() => {
    setAttachedFiles(task.submittedFiles || []);
    setSubmissionText(task.submissionText || "");
    setShowFilePicker(false);
    setActivePickerSource(null);
    setExpandedFolderId(null);
    setActivePreviewFile(null);
  }, [task.id, task.submittedFiles, task.submissionText]);

  const getMockFilesForSource = (source: "computer" | "personal" | "resources") => {
    switch (source) {
      case "computer":
        return [
          `Chloe_Vance_Submission_${task.id}.pdf`,
          `Draft_Revision_${task.id}.docx`,
          `Scan_Document_Image.jpg`
        ];
      case "personal":
        return [
          `${task.title.replace(/ /g, "_")}_Final_Draft.pdf`,
          `resume_2026.pdf`,
          `Essential_Space_Note_Import.pdf`
        ];
      case "resources":
        return [
          `Linearisation_Guide.pdf`,
          `IB_Physics_Data_Booklet.pdf`,
          `Mechanics_Formula_Sheet.pdf`
        ];
      default:
        return [];
    }
  };

  const getSmartSuggestions = (source: "personal" | "resources") => {
    const titleLower = task.title.toLowerCase();
    const descLower = task.description.toLowerCase();
    
    const allFiles: { name: string; type: string; size?: string; folderName: string }[] = [];
    const folders = source === "personal" ? MOCK_PERSONAL_DB : (CLASS_RESOURCES[classId] || CLASS_RESOURCES["physics"] || []);
    folders.forEach((f) => {
      f.files.forEach((file) => {
        allFiles.push({ ...file, folderName: f.name });
      });
    });

    const keywords = [...titleLower.split(/[\s_.-]+/), ...descLower.split(/[\s_.-]+/)].filter(k => k.length > 2);
    
    const scored = allFiles.map((file) => {
      let score = 0;
      const nameLower = file.name.toLowerCase();
      if (titleLower.includes("physics") && nameLower.includes("physics")) score += 10;
      if (titleLower.includes("ia") && nameLower.includes("ia")) score += 10;
      if (titleLower.includes("math") && nameLower.includes("math")) score += 10;
      if (titleLower.includes("essay") && nameLower.includes("essay")) score += 10;
      if (titleLower.includes("tok") && nameLower.includes("tok")) score += 10;
      if (titleLower.includes("cas") && nameLower.includes("cas")) score += 10;
      if (titleLower.includes("momentum") && nameLower.includes("data")) score += 5;
      
      keywords.forEach((kw) => {
        if (nameLower.includes(kw)) score += 3;
      });

      return { file, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedNames: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        selectedNames.push(e.target.files[i].name);
      }
      setAttachedFiles((prev) => {
        const updated = [...prev];
        selectedNames.forEach((name) => {
          if (!updated.includes(name)) updated.push(name);
        });
        return updated;
      });
      setShowFilePicker(false);
      setActivePickerSource(null);
    }
  };

  const totalAwarded = task.criteria.reduce((s, c) => s + (c.awarded ?? 0), 0);
  const totalMax = task.criteria.reduce((s, c) => s + c.maxMarks, 0);
  const hasGrades = task.status === "graded";

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 pt-12 pb-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${isLight ? "bg-white border-black/[0.08]" : "bg-[#0e0e10] border-white/[0.08]"}`}
      >
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-5 border-b ${isLight ? "border-black/[0.07]" : "border-white/[0.07]"}`}>
          <div className="min-w-0 flex-1 mr-4">
            <h2 className={`text-base font-bold ${styles.textPrimary}`}>{task.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs ${styles.textSecondary} opacity-60`}>Due: {task.due}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusStyle(task.status, isLight)}`}>
                {task.status === "submitted" ? "Awaiting Grading" : task.status}
              </span>
              {task.status === "graded" && task.grade !== "-" && (
                <span className={`text-xs font-semibold ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>{task.grade}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className={`text-sm mt-1 ${styles.textSecondary} opacity-40 hover:opacity-80 transition-opacity`}>✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto relative">

          {/* Teacher Feedback Focus Panel (Only for Graded tasks) */}
          {task.status === "graded" && task.feedback && (
            <div className={`rounded-3xl border p-5 ${
              isLight ? "bg-emerald-50/50 border-emerald-500/25" : "bg-[#111818]/60 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
            }`}>
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? "text-emerald-800" : "text-emerald-400"}`}>Teacher Evaluation & Remarks</p>
                </div>
                <span className={`text-[10px] ${styles.textSecondary} opacity-50`}>Graded on {task.feedback.date}</span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className={`shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 border ${
                  isLight ? "bg-emerald-500/10 border-emerald-500/25" : "bg-emerald-500/5 border-emerald-500/20"
                } w-20 h-20`}>
                  <p className={`text-[9px] uppercase tracking-widest ${styles.textSecondary} opacity-40 leading-none`}>Grade</p>
                  <p className={`text-2xl font-black text-emerald-500 leading-none mt-1.5`}>{task.grade}</p>
                  <p className={`text-[9px] ${styles.textSecondary} opacity-50 mt-1`}>{totalMax > 0 ? `${totalAwarded}/${totalMax}` : "Passed"}</p>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className={`text-xs font-semibold ${styles.textPrimary}`}>Teacher Comments:</p>
                  <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-90 italic`}>
                    "{task.feedback.comment}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${styles.textSecondary} opacity-40`}>Task Description</p>
            <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-80`}>{task.description}</p>
          </div>

          {/* Instructions */}
          {task.instructions.length > 0 && (
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${styles.textSecondary} opacity-40`}>Teacher Instructions</p>
              <ul className="space-y-1.5">
                {task.instructions.map((inst, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className={`shrink-0 mt-0.5 ${isLight ? "text-cyan-600" : "text-cyan-500"}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                    <span className={`${styles.textSecondary} opacity-80`}>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attached Files */}
          {task.attachments.length > 0 && (
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${styles.textSecondary} opacity-40`}>Attached Resources</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((att, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-medium transition-colors cursor-pointer ${
                    isLight ? "border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.04] text-black/70" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                  }`}>
                    {att.type === "PDF" ? (
                      <svg className="w-3 h-3 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    ) : att.type === "Link" ? (
                      <svg className="w-3 h-3 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.25" /></svg>
                    ) : (
                      <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    )}
                    {att.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Box (Only for Pending tasks) */}
          {task.status === "pending" && (
            <div className="space-y-4">
              {/* Submission Text Box */}
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Option 1: Write Directly in Axis</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your response or add notes for the teacher here..."
                  className={`w-full h-24 p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                    isLight ? "bg-white border-black/[0.12] text-black focus:border-cyan-500" : "bg-[#141416] border-white/[0.12] text-white focus:border-cyan-500"
                  }`}
                />
              </div>

              {/* Uploader section */}
              <div className="space-y-2.5">
                <label className={`text-[10px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Option 2: Attach Submission File</label>
                
                {attachedFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Selected Files ({attachedFiles.length})</p>
                    {attachedFiles.map((file, i) => (
                      <div key={i} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold ${isLight ? "bg-black/[0.01] border-black/[0.08]" : "bg-white/[0.01] border-white/[0.08]"}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                          <span className={`truncate ${styles.textPrimary}`}>{file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${isLight ? "border-rose-500/20 text-rose-600 hover:bg-rose-500/10" : "border-rose-500/20 text-rose-400 hover:bg-rose-500/10"}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Three Source Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePickerSource("computer");
                        setShowFilePicker(true);
                        // Trigger native file uploader
                        fileInputRef.current?.click();
                      }}
                      className={`flex flex-col items-center justify-center border rounded-xl p-3 text-center transition-all ${
                        activePickerSource === "computer"
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : isLight ? "border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.03] text-black/60" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                      }`}
                    >
                      <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                      <span className="text-[10px] font-semibold leading-tight">My Computer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePickerSource("personal");
                        setShowFilePicker(true);
                        setExpandedFolderId(null);
                      }}
                      className={`flex flex-col items-center justify-center border rounded-xl p-3 text-center transition-all ${
                        activePickerSource === "personal" && showFilePicker
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : isLight ? "border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.03] text-black/60" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                      }`}
                    >
                      <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      <span className="text-[10px] font-semibold leading-tight">Personal Database</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePickerSource("resources");
                        setShowFilePicker(true);
                        setExpandedFolderId(null);
                      }}
                      className={`flex flex-col items-center justify-center border rounded-xl p-3 text-center transition-all ${
                        activePickerSource === "resources" && showFilePicker
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : isLight ? "border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.03] text-black/60" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] text-white/60"
                      }`}
                    >
                      <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                      </svg>
                      <span className="text-[10px] font-semibold leading-tight">Connected Res.</span>
                    </button>
                  </div>

                  {/* Hidden Input for Computer Files */}
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Folder/File Directory Browser */}
                  {showFilePicker && (activePickerSource === "personal" || activePickerSource === "resources") && (
                    <div className={`rounded-2xl border p-4 mt-2 ${isLight ? "bg-black/[0.02] border-black/[0.08]" : "bg-white/[0.02] border-white/[0.08]"}`}>
                      
                      {/* Title & Close */}
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                        <p className={`text-[10px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-60`}>
                          {activePickerSource === "personal" ? "Personal Database" : "Connected Resources"}
                        </p>
                        {expandedFolderId && !searchQuery && (
                          <button
                            type="button"
                            onClick={() => setExpandedFolderId(null)}
                            className="text-[10px] text-cyan-500 hover:text-cyan-400 font-semibold"
                          >
                            ← Back to Folders
                          </button>
                        )}
                      </div>

                      {/* Search Bar */}
                      <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={activePickerSource === "personal" ? "Search files, drafts, documents..." : "Search resources, booklets, sheets..."}
                          className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                            isLight ? "bg-white border-black/[0.12] text-black focus:border-cyan-500" : "bg-[#141416] border-white/[0.12] text-white focus:border-cyan-500"
                          }`}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Content Area */}
                      {searchQuery ? (
                        /* SEARCH RESULTS VIEW */
                        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                          <p className={`text-[9px] uppercase tracking-wider font-bold mb-1.5 ${styles.textSecondary} opacity-40`}>Search Results</p>
                          {(() => {
                            const q = searchQuery.toLowerCase();
                            const folders = activePickerSource === "personal" ? MOCK_PERSONAL_DB : (CLASS_RESOURCES[classId] || CLASS_RESOURCES["physics"] || []);
                            const matched: any[] = [];
                            folders.forEach((folder) => {
                              folder.files.forEach((file) => {
                                const nameMatches = file.name.toLowerCase().includes(q);
                                const folderMatches = folder.name.toLowerCase().includes(q);
                                if (nameMatches || folderMatches) {
                                  matched.push({ ...file, folderName: folder.name });
                                }
                              });
                            });

                            if (matched.length === 0) {
                              return <p className="text-xs italic opacity-40 py-2">No matching files found.</p>;
                            }

                            return matched.map((file) => (
                              <button
                                type="button"
                                key={file.name}
                                onClick={() => {
                                  setAttachedFiles((prev) => {
                                    if (prev.includes(file.name)) return prev;
                                    return [...prev, file.name];
                                  });
                                  setShowFilePicker(false);
                                  setActivePickerSource(null);
                                  setSearchQuery("");
                                }}
                                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                  isLight ? "hover:bg-black/[0.04] text-black/80" : "hover:bg-white/[0.04] text-white/80"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="truncate font-semibold">{file.name}</span>
                                </div>
                                <span className="text-[9px] opacity-40 shrink-0 uppercase">{file.folderName} · {file.type || "FILE"}</span>
                              </button>
                            ));
                          })()}
                        </div>
                      ) : (
                        /* DEFAULT BROWSE VIEW (Suggestions + Recents + Folder Tree) */
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                          
                          {/* Smart Suggestions */}
                          {(() => {
                            const suggestions = getSmartSuggestions(activePickerSource);
                            if (suggestions.length === 0) return null;
                            return (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                  <p className={`text-[9px] uppercase tracking-wider font-bold ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>Smart Suggestions</p>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {suggestions.map((file: any) => (
                                    <button
                                      type="button"
                                      key={file.name}
                                      onClick={() => {
                                        setAttachedFiles((prev) => {
                                          if (prev.includes(file.name)) return prev;
                                          return [...prev, file.name];
                                        });
                                        setShowFilePicker(false);
                                        setActivePickerSource(null);
                                      }}
                                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors hover:scale-[1.005] ${
                                        isLight ? "border-cyan-500/20 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.04] text-black" : "border-cyan-500/15 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.04] text-cyan-200"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <span className="truncate font-semibold">{file.name}</span>
                                      </div>
                                      <span className="text-[9px] opacity-50 shrink-0">{file.folderName}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Recent Files */}
                          <div className="space-y-1.5">
                            <p className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Recent Files</p>
                            <div className="grid grid-cols-2 gap-2">
                              {RECENT_FILES.map((file) => (
                                <button
                                  type="button"
                                  key={file.name}
                                  onClick={() => {
                                    setAttachedFiles((prev) => {
                                      if (prev.includes(file.name)) return prev;
                                      return [...prev, file.name];
                                    });
                                    setShowFilePicker(false);
                                    setActivePickerSource(null);
                                  }}
                                  className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-colors text-xs ${
                                    isLight ? "border-black/[0.06] hover:bg-black/[0.03]" : "border-white/[0.06] hover:bg-white/[0.03]"
                                  }`}
                                >
                                  <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="truncate text-[10px] font-semibold">{file.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Manual Folder Browsing */}
                          <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
                            <p className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Browse Folders</p>
                            
                            {expandedFolderId === null ? (
                              <div className="grid grid-cols-2 gap-2">
                                {(activePickerSource === "personal" ? MOCK_PERSONAL_DB : (CLASS_RESOURCES[classId] || CLASS_RESOURCES["physics"] || [])).map((folder: any) => (
                                  <button
                                    type="button"
                                    key={folder.id}
                                    onClick={() => setExpandedFolderId(folder.id)}
                                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all hover:scale-[1.01] text-xs ${
                                      isLight ? "border-black/[0.06] hover:bg-black/[0.03]" : "border-white/[0.06] hover:bg-white/[0.03]"
                                    }`}
                                  >
                                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <div className="min-w-0">
                                      <p className="font-semibold truncate text-[11px]">{folder.name}</p>
                                      <p className="text-[9px] opacity-50 mt-0.5">{folder.files.length} file{folder.files.length !== 1 && "s"}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              /* List files inside expanded folder */
                              <div className="space-y-1.5">
                                {(() => {
                                  const activeFolder = (activePickerSource === "personal" ? MOCK_PERSONAL_DB : (CLASS_RESOURCES[classId] || CLASS_RESOURCES["physics"] || [])).find(
                                    (f: any) => f.id === expandedFolderId
                                  );
                                  if (!activeFolder) return <p className="text-xs opacity-50">Folder not found.</p>;
                                  return activeFolder.files.map((file: any) => (
                                    <button
                                      type="button"
                                      key={file.name}
                                      onClick={() => {
                                        setAttachedFiles((prev) => {
                                          if (prev.includes(file.name)) return prev;
                                          return [...prev, file.name];
                                        });
                                        setShowFilePicker(false);
                                        setActivePickerSource(null);
                                        setExpandedFolderId(null);
                                      }}
                                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                        isLight ? "hover:bg-black/[0.04] text-black/80" : "hover:bg-white/[0.04] text-white/80"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="truncate">{file.name}</span>
                                      </div>
                                      <span className="text-[9px] opacity-40 shrink-0 uppercase">{file.type || "FILE"} · {file.size}</span>
                                    </button>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Your Submission (Only for Submitted / Graded tasks) */}
          {(task.status === "submitted" || task.status === "graded") && (
            <div className="space-y-4 rounded-2xl border p-4 bg-white/[0.01] border-white/[0.08]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Your Submission</p>
                  <p className={`text-xs font-semibold ${styles.textPrimary} mt-0.5`}>
                    {task.status === "graded" ? "Graded & Reviewed" : "Awaiting Grading"}
                  </p>
                </div>
                {task.submissionVersion && (
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${isLight ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-700" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"}`}>
                    {task.submissionVersion}
                  </span>
                )}
              </div>

              {/* Submission Meta Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className={`opacity-50 ${styles.textSecondary}`}>Submitted Date:</span>
                  <p className={`font-semibold ${styles.textPrimary} mt-0.5`}>{task.submissionDate || "June 12, 2026"}</p>
                </div>
                <div>
                  <span className={`opacity-50 ${styles.textSecondary}`}>Submitted Time:</span>
                  <p className={`font-semibold ${styles.textPrimary} mt-0.5`}>{task.submissionTime || "13:58"}</p>
                </div>
              </div>

              {/* Student Notes */}
              {task.submissionText && (
                <div className={`rounded-xl p-3 text-xs leading-relaxed border ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"}`}>
                  <p className={`text-[9px] uppercase tracking-wider font-bold mb-1.5 ${styles.textSecondary} opacity-50`}>Submission Text Response</p>
                  <p className={`${styles.textPrimary} opacity-90 whitespace-pre-wrap`}>{task.submissionText}</p>
                </div>
              )}

              {/* Files Attached List */}
              <div className="space-y-2">
                <p className={`text-[9px] uppercase tracking-wider font-bold ${styles.textSecondary} opacity-40`}>Attached Submission Files</p>
                {attachedFiles.length > 0 ? (
                  attachedFiles.map((file, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${isLight ? "border-black/[0.06] bg-black/[0.01]" : "border-white/[0.06] bg-white/[0.01]"}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        <span className={`truncate ${styles.textPrimary}`}>{file}</span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActivePreviewFile(file)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            isLight ? "border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/10" : "border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
                          }`}
                        >
                          View
                        </button>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading ${file} to local system...`);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            isLight ? "border-black/[0.12] text-black/60 hover:bg-black/5" : "border-white/[0.12] text-white/60 hover:bg-white/5"
                          }`}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-xs italic ${styles.textSecondary} opacity-50`}>No files uploaded (Text submission only).</p>
                )}
              </div>
            </div>
          )}

          {/* Assessment Criteria Table */}
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${styles.textSecondary} opacity-40`}>
              Assessment Criteria {totalMax > 0 && `· ${hasGrades ? `${totalAwarded}/${totalMax}` : `${totalMax} marks total`}`}
            </p>
            <div className={`rounded-2xl border overflow-hidden ${isLight ? "border-black/[0.06]" : "border-white/[0.06]"}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${isLight ? "bg-black/[0.02]" : "bg-white/[0.02]"}`}>
                    <th className={`text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50`}>Criterion</th>
                    <th className={`text-center px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50 w-16`}>Marks</th>
                    {hasGrades && <th className={`text-center px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50 w-16`}>Score</th>}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-black/[0.04]" : "divide-white/[0.04]"}`}>
                  {task.criteria.map((c, i) => (
                    <tr key={i} className="group">
                      <td className="px-4 py-3">
                        <p className={`font-medium ${styles.textPrimary}`}>{c.name}</p>
                        <p className={`text-[10px] mt-0.5 ${styles.textSecondary} opacity-50 leading-relaxed`}>{c.descriptor}</p>
                      </td>
                      <td className={`text-center px-3 py-3 font-semibold tabular-nums ${styles.textSecondary} opacity-60`}>{c.maxMarks > 0 ? c.maxMarks : "—"}</td>
                      {hasGrades && (
                        <td className={`text-center px-3 py-3 font-bold tabular-nums ${c.awarded !== undefined ? (isLight ? "text-cyan-700" : "text-cyan-400") : `${styles.textSecondary} opacity-30`}`}>
                          {c.awarded !== undefined ? c.awarded : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* File Previewer Overlay Panel */}
          {activePreviewFile && (
            <div className="absolute inset-0 z-[310] flex flex-col bg-black/95 text-white p-5 rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Document Viewer</p>
                  <h3 className="text-sm font-semibold truncate">{activePreviewFile}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePreviewFile(null)}
                  className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                >
                  Close Preview
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-[#141416] p-6 text-center space-y-4">
                <svg className="w-16 h-16 text-cyan-500/80 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold">Simulated Axis Secure PDF Sandbox</p>
                  <p className="text-[10px] text-white/40 mt-1">Authenticating file integrity and rendering digital signature...</p>
                </div>
                <div className="w-full max-w-sm bg-white/5 rounded-xl p-3 border border-white/5 text-left font-mono text-[10px] text-cyan-300/80 leading-relaxed overflow-y-auto max-h-40">
                  {"// SECURE_SANDBOX_HEADER //\n"}
                  FILE: {activePreviewFile}
                  {"\n"}
                  SIZE: 1,420 KB
                  {"\n"}
                  STATUS: ENCRYPTED_VERIFIED
                  {"\n"}
                  HASH: SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649
                  {"\n\n"}
                  {"// CONTENT_PREVIEW //\n"}
                  ...[Simulated Academic Work Preview]...
                  {"\n"}
                  Chloe Vance - DP1 Student Portal.
                  {"\n"}
                  Assignment: {task.title}
                  {"\n"}
                  Verified submit date: {task.submissionDate || "June 12, 2026"}
                </div>
              </div>
            </div>
          )}

          {/* Submit button (Only for Pending tasks) */}
          {task.status === "pending" && (attachedFiles.length > 0 || submissionText.trim().length > 0) && (
            <button
              type="button"
              onClick={() => onSubmit?.(attachedFiles, submissionText)}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
            >
              Submit Assignment
            </button>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isLight ? "border-black/[0.07]" : "border-white/[0.07]"} flex justify-end`}>
          <button type="button" onClick={onClose} className={`text-xs font-semibold px-5 py-2 rounded-xl transition-all ${isLight ? "bg-black/[0.05] text-black/60 hover:bg-black/[0.1]" : "bg-white/[0.05] text-white/50 hover:bg-white/[0.1]"}`}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Assignments Tab ─────────────────────────────────────────────────────────

function AssignmentsTab({
  theme,
  classId,
  assignments,
  onSubmitTask,
  highlightTaskId,
}: {
  theme: Theme;
  classId: string;
  assignments: Assignment[];
  onSubmitTask: (taskId: string, files: string[], text: string) => void;
  highlightTaskId?: string | null;
}) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const pending = assignments.filter((a) => a.status === "pending");
  const completed = assignments.filter((a) => a.status === "submitted" || a.status === "graded");

  const openTask = assignments.find((a) => a.id === openTaskId) || null;

  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (highlightTaskId && targetRef.current) { setTimeout(() => targetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); } }, [highlightTaskId]);

  const renderCard = (a: Assignment) => {
    const isHighlighted = a.id === highlightTaskId;
    return (
      <motion.div
        key={a.id}
        ref={isHighlighted ? targetRef : undefined}
        variants={fadeSlide}
        onClick={() => setOpenTaskId(a.id)}
        className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-all duration-300 group ${styles.cardBg} ${
          isHighlighted ? "ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.35)] bg-cyan-500/[0.02]" : ""
        } ${isLight ? "hover:border-black/[0.15] hover:bg-black/[0.01]" : "hover:border-white/[0.12] hover:bg-white/[0.01]"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className={`text-sm font-medium truncate ${styles.textPrimary} group-hover:underline underline-offset-2 decoration-cyan-500/30`}>{a.title}</h4>
            <p className={`text-xs mt-0.5 ${styles.textSecondary} opacity-60`}>Due: {a.due}</p>
          </div>
          <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${statusStyle(a.status, isLight)}`}>
            {a.status === "submitted" ? "Awaiting Grading" : a.status}
          </span>
        </div>
        <div className={`flex items-center gap-4 text-xs ${styles.textSecondary} opacity-60`}>
          {a.status === "graded" && (
            <>
              <span>Grade: <span className={styles.textPrimary}>{a.grade}</span></span>
              <span className={`h-3 w-px ${isLight ? "bg-black/[0.08]" : "bg-white/[0.08]"}`} />
            </>
          )}
          <span>Max: <span className={styles.textPrimary}>{a.maxMarks > 0 ? a.maxMarks : "—"}</span></span>
          <span className={`h-3 w-px ${isLight ? "bg-black/[0.08]" : "bg-white/[0.08]"}`} />
          <span>{a.criteria.length} criteria</span>
        </div>
        {a.status === "graded" && a.feedback && (
          <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
            Teacher feedback available
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {pending.length > 0 && (
          <div className="space-y-3">
            <h4 className={`text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50 px-1`}>Action Required / Due ({pending.length})</h4>
            <div className="space-y-3">{pending.map(renderCard)}</div>
          </div>
        )}
        {completed.length > 0 && (
          <div className="space-y-3">
            <h4 className={`text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} opacity-50 px-1`}>Submitted & Graded ({completed.length})</h4>
            <div className="space-y-3">{completed.map(renderCard)}</div>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {openTask && (
          <TaskDetailModal
            task={openTask}
            theme={theme}
            classId={classId}
            onClose={() => setOpenTaskId(null)}
            onSubmit={(files, text) => {
              onSubmitTask(openTask.id, files, text);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Resources Tab (with Folders) ────────────────────────────────────────────

function ResourcesTab({ theme, classId }: { theme: Theme; classId: string }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const folders = CLASS_RESOURCES[classId] || [];
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const openFolder = folders.find((f) => f.id === openFolderId);

  if (folders.length === 0) return <div className={`text-center py-8 text-xs ${styles.textSecondary} opacity-60`}>No resources uploaded for this class.</div>;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
      {openFolder ? (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setOpenFolderId(null)} className={`flex items-center gap-1 text-xs transition-colors group ${styles.textSecondary} opacity-60 hover:opacity-100`}>
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              <span>All Folders</span>
            </button>
            <span className={`text-xs ${styles.textSecondary} opacity-30`}>/</span>
            <span className={`text-xs font-medium ${styles.textPrimary}`}>{openFolder.name}</span>
          </div>
          {/* Files list */}
          {openFolder.files.map((r) => (
            <motion.div key={r.id} variants={fadeSlide}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 group transition-colors cursor-pointer ${styles.cardBg} ${isLight ? "hover:border-black/15" : "hover:border-white/12"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  r.type === "PDF" ? (isLight ? "bg-rose-500/10 text-rose-600" : "bg-rose-500/10 text-rose-400")
                  : r.type === "Link" ? (isLight ? "bg-cyan-500/10 text-cyan-600" : "bg-cyan-500/10 text-cyan-400")
                  : (isLight ? "bg-blue-500/10 text-blue-600" : "bg-blue-500/10 text-blue-400")
                }`}>
                  {r.type === "PDF" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  ) : r.type === "Link" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${styles.textPrimary}`}>{r.name}</p>
                  <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${styles.textSecondary} opacity-50`}>{r.type}{r.size && ` · ${r.size}`}</p>
                </div>
              </div>
              <div className={`flex-shrink-0 text-[10px] uppercase tracking-widest ${styles.textSecondary} opacity-40 group-hover:opacity-75 transition-opacity`}>
                {r.type === "Link" ? "Open" : "Download"}
              </div>
            </motion.div>
          ))}
        </>
      ) : (
        /* Folder cards */
        folders.map((folder) => (
          <motion.div key={folder.id} variants={fadeSlide}
            onClick={() => setOpenFolderId(folder.id)}
            className={`flex items-center gap-4 rounded-xl border px-4 py-4 cursor-pointer transition-all group ${styles.cardBg} ${isLight ? "hover:border-black/[0.15] hover:bg-black/[0.01]" : "hover:border-white/[0.12] hover:bg-white/[0.01]"}`}>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isLight ? "bg-amber-500/10 text-amber-600" : "bg-amber-500/10 text-amber-400"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${styles.textPrimary}`}>{folder.name}</p>
              <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${styles.textSecondary} opacity-50`}>{folder.files.length} file{folder.files.length !== 1 && "s"}</p>
            </div>
            <svg className={`w-4 h-4 ${styles.textSecondary} opacity-30 group-hover:opacity-60 transition-all group-hover:translate-x-0.5`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

// ─── Unit Roadmap Tab ────────────────────────────────────────────────────────

function UnitRoadmapTab({ theme, classId }: { theme: Theme; classId: string }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const units = UNIT_ROADMAPS[classId] || [];

  if (units.length === 0) return <div className={`text-center py-8 text-xs ${styles.textSecondary} opacity-60`}>No unit roadmap available for this class.</div>;

  const statusColors = (s: RoadmapUnit["status"]) => {
    switch (s) {
      case "completed": return { node: isLight ? "bg-emerald-500" : "bg-emerald-500", line: isLight ? "bg-emerald-500/30" : "bg-emerald-500/30", badge: isLight ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Completed" };
      case "current": return { node: "bg-cyan-500", line: isLight ? "bg-cyan-500/30" : "bg-cyan-500/30", badge: isLight ? "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "In Progress" };
      case "upcoming": return { node: isLight ? "bg-black/20" : "bg-white/20", line: isLight ? "bg-black/[0.06]" : "bg-white/[0.06]", badge: isLight ? "bg-black/[0.04] text-black/40 border-black/[0.06]" : "bg-white/[0.04] text-white/30 border-white/[0.06]", label: "Upcoming" };
    }
  };

  return (
    <div className="relative space-y-0">
      {units.map((unit, i) => {
        const sc = statusColors(unit.status);
        const isLast = i === units.length - 1;
        return (
          <motion.div key={unit.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex gap-4">
            {/* Timeline line + node */}
            <div className="flex flex-col items-center shrink-0 w-6">
              <div className={`w-3 h-3 rounded-full shrink-0 mt-5 ${sc.node} ${unit.status === "current" ? "ring-4 ring-cyan-500/20" : ""}`} />
              {!isLast && <div className={`w-0.5 flex-1 ${sc.line} my-1`} />}
            </div>
            {/* Card */}
            <div className={`flex-1 rounded-2xl border p-4 mb-3 transition-all ${styles.cardBg} ${
              unit.status === "current" ? (isLight ? "border-cyan-500/25 bg-cyan-500/[0.02]" : "border-cyan-500/20 bg-cyan-500/[0.02]") : ""
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className={`text-sm font-semibold ${styles.textPrimary} ${unit.status === "upcoming" ? "opacity-50" : ""}`}>{unit.title}</h4>
                  <p className={`text-[10px] mt-0.5 ${styles.textSecondary} opacity-50`}>{unit.subtitle}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full shrink-0 ${sc.badge}`}>{sc.label}</span>
              </div>
              <p className={`text-[10px] font-mono mb-3 ${styles.textSecondary} opacity-40`}>{unit.weeks}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {unit.topics.map((t) => (
                  <span key={t} className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                    isLight ? "border-black/[0.06] bg-black/[0.02] text-black/60" : "border-white/[0.06] bg-white/[0.02] text-white/50"
                  } ${unit.status === "upcoming" ? "opacity-50" : ""}`}>
                    {t}
                  </span>
                ))}
              </div>
              {unit.keyAssessment && (
                <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isLight ? "text-cyan-700" : "text-cyan-400"} ${unit.status === "upcoming" ? "opacity-40" : "opacity-70"}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                  Key Assessment: {unit.keyAssessment}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CLASS_MEMBERS.map((m) => (
        <motion.div key={m.id} variants={fadeSlide} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${styles.cardBg}`}>
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getMemberAvatarStyle(m.color, isLight)}`}>{m.initials}</div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium truncate ${styles.textPrimary}`}>{m.name}</p>
            <p className={`text-[10px] uppercase tracking-wider ${styles.textSecondary} opacity-50`}>Classmate</p>
          </div>
          <button className={`flex-shrink-0 rounded-lg border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors ${styles.buttonSecondary}`}>Message</button>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Custom Workspaces for Core Components ───────────────────────────────────

function CasWorkspace({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"experiences" | "reflections" | "progress">("experiences");

  const outcomes = [
    { name: "Identify own strengths and develop areas for growth", val: 75, color: "bg-cyan-500" },
    { name: "Demonstrate that challenges have been undertaken, developing new skills", val: 80, color: "bg-blue-500" },
    { name: "Demonstrate how to initiate and plan a CAS experience", val: 90, color: "bg-emerald-500" },
    { name: "Show commitment to and perseverance in CAS experiences", val: 85, color: "bg-indigo-500" },
    { name: "Demonstrate the skills and recognize the benefits of working collaboratively", val: 70, color: "bg-purple-500" },
    { name: "Demonstrate engagement with issues of global significance", val: 60, color: "bg-rose-500" },
    { name: "Recognize and consider the ethics of choices and actions", val: 85, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-1 rounded-xl border p-1 mb-6 ${styles.cardBg}`}>
        {[
          { id: "experiences" as const, label: "Experiences" },
          { id: "reflections" as const, label: "Reflections" },
          { id: "progress" as const, label: "Progress Tracking" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex-1 text-center ${
              activeTab === tab.id ? styles.textPrimary : `${styles.textSecondary} opacity-50 hover:opacity-85`
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeCasTab"
                className={`absolute inset-0 rounded-lg ${
                  isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.07] border border-white/[0.08]"
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "experiences" && (
            <div className="space-y-4">
              {[
                { title: "School Community Garden Project", cat: "Service", hours: "35 hrs", status: "Approved", desc: "Setting up a community food crop patch in the school south sector to supply local kitchens.", date: "Ongoing" },
                { title: "Intermediate Classical Piano Practice", cat: "Creativity", hours: "45 hrs", status: "Approved", desc: "Structured piano logs targeting Chopin Nocturne in C-sharp minor and scales velocity.", date: "Ongoing" },
                { title: "Varsity Football Tournament", cat: "Activity", hours: "32 hrs", status: "Approved", desc: "Weekly training sessions and league matches with high focus on collaborative defensive strategies.", date: "Completed" },
              ].map((exp, idx) => (
                <div key={idx} className={`border rounded-2xl p-5 ${styles.cardBg} space-y-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-sm font-bold ${styles.textPrimary}`}>{exp.title}</h3>
                      <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                        exp.cat === "Creativity" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        exp.cat === "Activity" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>{exp.cat}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${styles.textPrimary} block`}>{exp.hours}</span>
                      <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">{exp.status}</span>
                    </div>
                  </div>
                  <p className={`text-xs ${styles.textSecondary} opacity-75 leading-relaxed`}>{exp.desc}</p>
                  <div className={`text-[10px] ${styles.textSecondary} opacity-40 pt-2 border-t ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"}`}>
                    Timeline: {exp.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reflections" && (
            <div className="space-y-4">
              {[
                { title: "Piano practice session 12: Scales speed & expression", date: "2 days ago", exp: "Intermediate Classical Piano", outcome: "Challenge & skills", text: "Today I focused on the triplet transitions in the middle sections. Finding the correct tempo acceleration without losing timing accuracy was challenging, but constant repetition helped solidify muscle memory.", files: ["piano_log_jun10.mp3"] },
                { title: "Garden weeding & irrigation assembly", date: "Jun 05, 2026", exp: "School Community Garden Project", outcome: "Initiative & planning", text: "We successfully hooked up the drip lines today. The team split into coordinate groups. Taking initiative to check water pressure and coordinate flow valves helped avoid leak damage.", files: ["garden_drip_schema.png"] },
                { title: "Football Tournament: Match day reflection", date: "May 28, 2026", exp: "Varsity Football Tournament", outcome: "Collaborative skills", text: "Even though we lost 2-1, the defensive line worked together much better. We communicated constant rotations and covered gaps quickly, applying insights from our training drills.", files: [] },
              ].map((ref, idx) => (
                <div key={idx} className={`border rounded-2xl p-5 ${styles.cardBg} space-y-3`}>
                  <div className="flex items-start justify-between gap-3 border-b pb-3.5 border-black/[0.04] dark:border-white/[0.04]">
                    <div>
                      <h3 className={`text-xs font-bold ${styles.textPrimary}`}>{ref.title}</h3>
                      <span className={`block text-[9px] ${styles.textSecondary} opacity-50 mt-0.5`}>Linked Experience: {ref.exp}</span>
                    </div>
                    <span className={`text-[10px] ${styles.textSecondary} opacity-40`}>{ref.date}</span>
                  </div>
                  <p className={`text-xs ${styles.textSecondary} opacity-85 leading-relaxed italic`}>
                    "{ref.text}"
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[9px] uppercase font-bold tracking-wider">
                    <span className="text-cyan-400">Outcome: {ref.outcome}</span>
                    {ref.files.length > 0 && (
                      <div className="flex items-center gap-1.5 opacity-65">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 12.728m0 5.656l3.536 3.536" /></svg>
                        <span>{ref.files[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "progress" && (
            <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-6`}>
              <div>
                <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Learning Outcomes Progress</h3>
                <p className={`text-xs ${styles.textSecondary} opacity-60 mt-1`}>You must demonstrate engagement with all 7 outcomes by term completion.</p>
              </div>
              <div className="space-y-4">
                {outcomes.map((o, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={`truncate max-w-[85%] ${styles.textPrimary}`}>{o.name}</span>
                      <span className="text-cyan-400">{o.val}%</span>
                    </div>
                    <div className={`h-2 w-full overflow-hidden rounded-full ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${o.val}%` }}
                        transition={{ duration: 1, delay: idx * 0.08 }}
                        className={`h-full rounded-full ${o.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EeWorkspace({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"status" | "notes" | "milestones">("status");

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-1 rounded-xl border p-1 mb-6 ${styles.cardBg}`}>
        {[
          { id: "status" as const, label: "Current Status" },
          { id: "notes" as const, label: "Supervisor Notes" },
          { id: "milestones" as const, label: "Milestones" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex-1 text-center ${
              activeTab === tab.id ? styles.textPrimary : `${styles.textSecondary} opacity-50 hover:opacity-85`
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeEeTab"
                className={`absolute inset-0 rounded-lg ${
                  isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.07] border border-white/[0.08]"
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "status" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`border rounded-2xl p-5 ${styles.cardBg} flex flex-col justify-between md:col-span-1 min-h-[160px]`}>
                  <div>
                    <span className={`text-[9px] uppercase tracking-widest font-extrabold ${styles.textSecondary} opacity-40`}>EE Draft Progress</span>
                    <span className="text-4xl font-black text-cyan-400 block mt-2">2,150 <span className={`text-xs font-semibold ${styles.textSecondary} opacity-50`}>/ 4,000 words</span></span>
                  </div>
                  <div className="w-full">
                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${isLight ? "bg-black/[0.06]" : "bg-white/[0.06]"} mb-1`}>
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: "54%" }} />
                    </div>
                    <span className={`text-[9px] ${styles.textSecondary} opacity-50 block text-right`}>54% Draft Completed</span>
                  </div>
                </div>

                <div className={`border rounded-2xl p-5 ${styles.cardBg} md:col-span-2 space-y-3`}>
                  <span className={`text-[9px] uppercase tracking-widest font-extrabold ${styles.textSecondary} opacity-40`}>Registered Topic & Supervisor</span>
                  <div>
                    <span className={`text-xs ${styles.textSecondary} opacity-50 block`}>Research Question:</span>
                    <h3 className={`text-sm font-bold ${styles.textPrimary} leading-snug mt-0.5`}>
                      "How do localized gravitational anomalies affect high-accuracy orbital trajectory predictions in low-altitude orbital platforms?"
                    </h3>
                  </div>
                  <div className={`flex items-center justify-between pt-2 border-t ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"} text-xs`}>
                    <div>
                      <span className={`opacity-50 ${styles.textSecondary}`}>Supervisor:</span>
                      <span className={`font-semibold ${styles.textPrimary} ml-1`}>Dr. Sarah Chen</span>
                    </div>
                    <div>
                      <span className={`opacity-50 ${styles.textSecondary}`}>Subject Group:</span>
                      <span className="font-semibold text-cyan-400 ml-1">Physics HL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`border rounded-2xl p-5 ${styles.cardBg} space-y-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary}`}>Submitted Draft File</h4>
                <div className={`rounded-xl border p-3 flex items-center justify-between text-xs ${isLight ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.01] border-white/[0.06]"}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span className={`font-semibold ${styles.textPrimary}`}>EE_Proposal_ChloeVance.pdf</span>
                  </div>
                  <span className={`text-[10px] ${styles.textSecondary} opacity-40`}>Approved by Dr. Sarah Chen</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {[
                { date: "Yesterday", author: "Dr. Sarah Chen", text: "Chloe's literature review section is well-argued. I would suggest referencing the orbital decay measurements from the ESA 2024 catalog to ground your simulated trajectory calculations. Next meeting, bring your revised mathematical model charts." },
                { date: "May 15, 2026", author: "Dr. Sarah Chen", text: "Excellent research question selection. Make sure your physics formulation handles relativistic corrections if you are aiming for high-precision orbit levels. The RPPF meeting notes have been updated." },
              ].map((note, idx) => (
                <div key={idx} className={`border rounded-2xl p-5 ${styles.cardBg} space-y-2.5`}>
                  <div className="flex items-center justify-between border-b pb-2 border-black/[0.04] dark:border-white/[0.04]">
                    <span className={`text-xs font-bold ${styles.textPrimary}`}>{note.author}</span>
                    <span className={`text-[10px] ${styles.textSecondary} opacity-40`}>{note.date}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${styles.textSecondary} opacity-85 italic`}>
                    "{note.text}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "milestones" && (
            <div className={`border rounded-2xl p-6 ${styles.cardBg} space-y-4`}>
              <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Extended Essay Timeline</h3>
              <div className="relative border-l pl-5 ml-2 space-y-5 border-indigo-500/20">
                {[
                  { title: "EE Research Proposal Form", date: "May 08, 2026", desc: "Select supervisor, define research question scope, and compile preliminary bibliography.", status: "Completed" },
                  { title: "First Draft (2000 words)", date: "In 14 days", desc: "Incorporate literature review, orbital anomalies equation layouts, and first trajectory graphs.", status: "In Progress" },
                  { title: "Viva Voce & Final RPPF Hand-off", date: "Oct 15, 2026", desc: "Final 15-minute consultation review with supervisor Dr. Sarah Chen.", status: "Upcoming" },
                ].map((m, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0E0E10] ${
                      m.status === "Completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                      m.status === "In Progress" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                      "bg-indigo-500"
                    }`} />
                    <div>
                      <span className={`text-[9px] font-semibold ${
                        m.status === "Completed" ? "text-emerald-500" :
                        m.status === "In Progress" ? "text-amber-500" :
                        "text-indigo-400"
                      }`}>{m.status} &bull; {m.date}</span>
                      <h4 className={`text-xs font-bold ${styles.textPrimary} mt-0.5`}>{m.title}</h4>
                      <p className={`text-xs ${styles.textSecondary} opacity-70 mt-1 max-w-xl leading-relaxed`}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function IaWorkspace({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"tracker" | "completed" | "pending">("tracker");

  const ias = [
    { subject: "DP1 Physics HL", title: "Physics IA Draft Phase 2", status: "submitted", due: "Tomorrow", score: "Pending Review" },
    { subject: "Chemistry SL", title: "Chemistry IA Final Draft", status: "pending", due: "In 15 days", score: "-" },
    { subject: "Psychology SL", title: "Psychology IA Rough Draft", status: "pending", due: "In 6 days", score: "-" },
    { subject: "Spanish B SL", title: "Spanish IA Individual Oral Plan", status: "pending", due: "In 10 days", score: "-" },
    { subject: "Math AA HL", title: "Limits & Derivatives Quiz", status: "graded", due: "Past", score: "6/7 (Graded)" },
  ];

  const filteredIas = ias.filter((ia) => {
    if (activeTab === "completed") return ia.status === "submitted" || ia.status === "graded";
    if (activeTab === "pending") return ia.status === "pending";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-1 rounded-xl border p-1 mb-6 ${styles.cardBg}`}>
        {[
          { id: "tracker" as const, label: "Submission Tracker" },
          { id: "completed" as const, label: "Completed Assessments" },
          { id: "pending" as const, label: "Pending Assessments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex-1 text-center ${
              activeTab === tab.id ? styles.textPrimary : `${styles.textSecondary} opacity-50 hover:opacity-85`
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeIaTab"
                className={`absolute inset-0 rounded-lg ${
                  isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.07] border border-white/[0.08]"
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {filteredIas.map((ia, idx) => (
            <div key={idx} className={`border rounded-2xl p-5 ${styles.cardBg} space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold ${styles.textSecondary} opacity-50`}>{ia.subject}</span>
                  <h3 className={`text-sm font-bold ${styles.textPrimary} mt-1 leading-snug`}>{ia.title}</h3>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                    ia.status === "graded" ? isLight ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                    ia.status === "submitted" ? isLight ? "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" : "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" :
                    isLight ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  }`}>
                    {ia.status === "submitted" ? "Awaiting Grading" : ia.status}
                  </span>
                  <span className={`text-[10px] mt-1.5 ${styles.textSecondary} opacity-60`}>Due: {ia.due}</span>
                </div>
              </div>

              <div className={`flex items-center justify-between pt-3.5 border-t ${isLight ? "border-black/[0.04]" : "border-white/[0.04]"} text-xs`}>
                <span className={`${styles.textSecondary} opacity-60`}>Score: <span className={`font-semibold ${
                  ia.status === "graded" ? "text-emerald-400" :
                  ia.status === "submitted" ? "text-cyan-400" :
                  styles.textPrimary
                }`}>{ia.score}</span></span>

                {ia.status === "pending" && (
                  <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-wider">
                    Upload Internal Assessment →
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function StudentClassSpace({
  theme = "dark",
  initialClassId = null,
  initialTab = "assignments",
  initialTaskId = null,
}: {
  theme?: Theme;
  initialClassId?: string | null;
  initialTab?: TabId;
  initialTaskId?: string | null;
}) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(initialTaskId);
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>(CLASS_ASSIGNMENTS);
  const styles = getAxisTheme(theme);
  const isLight = theme === "light";

  useEffect(() => {
    if (initialClassId !== undefined) setSelectedClassId(initialClassId);
    if (initialTab !== undefined) setActiveTab(initialTab as TabId);
    if (initialTaskId !== undefined) setHighlightTaskId(initialTaskId);
  }, [initialClassId, initialTab, initialTaskId]);

  const selectedClass = ENROLLED_CLASSES.find((c) => c.id === selectedClassId) || IB_COMPONENTS.find((c) => c.id === selectedClassId) || null;
  const isIb = selectedClass ? ["ee", "tok-core", "cas"].includes(selectedClass.id) : false;
  const teacherLabel = isIb ? (selectedClass?.id === "ee" || selectedClass?.id === "cas" ? "Advisor" : "Coordinator") : "Teacher";
  const studentText = isIb ? (selectedClass?.id === "ee" || selectedClass?.id === "cas" ? "Individual Project" : "Core Component") : `${selectedClass?.studentCount} students`;

  const handleSelectClass = (id: string) => { setSelectedClassId(id); setActiveTab("assignments"); setHighlightTaskId(null); };
  const handleBack = () => { setSelectedClassId(null); setHighlightTaskId(null); };

  return (
    <div className={`min-h-full w-full ${styles.bg} ${styles.textPrimary} transition-colors duration-200`}>
      <AnimatePresence mode="wait">
        {!selectedClass ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="mx-auto max-w-5xl px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-8">
              <p className={`text-[10px] uppercase tracking-widest mb-1 ${styles.textSecondary} opacity-50`}>Student · Class Space</p>
              <h1 className={`text-2xl font-semibold ${styles.textPrimary}`}>My Classes</h1>
              <p className={`text-sm mt-1 ${styles.textSecondary} opacity-60`}>{ENROLLED_CLASSES.length} enrolled classes · {ENROLLED_CLASSES.reduce((s, c) => s + c.activeAssignments, 0)} active assignments</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ENROLLED_CLASSES.map((cls, i) => <ClassCard key={cls.id} cls={cls} index={i} onSelect={() => handleSelectClass(cls.id)} theme={theme} />)}
            </div>
            <div className={`my-10 border-t ${isLight ? "border-black/[0.08]" : "border-white/[0.08]"}`} />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="mb-6">
              <h2 className={`text-lg font-semibold ${styles.textPrimary}`}>IB Core Components</h2>
              <p className={`text-xs mt-1 ${styles.textSecondary} opacity-60`}>Diploma Programme core requirements and internal assessments</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {IB_COMPONENTS.map((cls, i) => <ClassCard key={cls.id} cls={cls} index={i + ENROLLED_CLASSES.length} onSelect={() => handleSelectClass(cls.id)} theme={theme} />)}
            </div>
          </motion.div>
        ) : (
          <motion.div key="class" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="mx-auto max-w-4xl px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
              <button onClick={handleBack} className={`flex items-center gap-1.5 text-xs transition-colors mb-3 group ${styles.textSecondary} opacity-60 hover:opacity-100`}>
                <span className="transition-transform group-hover:-translate-x-0.5">←</span><span>My Classes</span>
              </button>
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedClass.accent}`} />
                <div>
                  <h1 className={`text-xl font-semibold ${styles.textPrimary}`}>{selectedClass.name}</h1>
                  <p className={`text-xs mt-0.5 ${styles.textSecondary} opacity-60`}>{selectedClass.subtitle} · {teacherLabel}: {selectedClass.teacher} · {studentText}</p>
                </div>
              </div>
            </motion.div>

            {selectedClass.id === "cas" ? (
              <CasWorkspace theme={theme} />
            ) : selectedClass.id === "ee" ? (
              <EeWorkspace theme={theme} />
            ) : selectedClass.id === "ia" ? (
              <IaWorkspace theme={theme} />
            ) : (
              <>
                {/* Tab Bar */}
                <div className={`flex items-center gap-1 rounded-xl border p-1 mb-6 ${styles.cardBg}`}>
                  {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`relative rounded-lg px-4 py-2 text-xs font-medium transition-colors ${activeTab === tab.id ? styles.textPrimary : `${styles.textSecondary} opacity-50 hover:opacity-80`}`}>
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className={`absolute inset-0 rounded-lg ${isLight ? "bg-black/[0.04] border border-black/[0.06]" : "bg-white/[0.07] border border-white/[0.08]"}`}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                    {activeTab === "assignments" && (
                      <AssignmentsTab
                        theme={theme}
                        classId={selectedClass.id}
                        assignments={assignments[selectedClass.id] || []}
                        onSubmitTask={(taskId, files, text) => {
                          setAssignments((prev) => {
                            const classTasks = prev[selectedClass.id] || [];
                            const now = new Date();
                            const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                            const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                            
                            const updatedTasks = classTasks.map((t) => {
                              if (t.id === taskId) {
                                return {
                                  ...t,
                                  status: "submitted" as const,
                                  submittedFiles: files,
                                  submissionText: text,
                                  grade: "Pending",
                                  submissionDate: dateStr,
                                  submissionTime: timeStr,
                                  submissionVersion: "Version 1.0",
                                };
                              }
                              return t;
                            });
                            return {
                              ...prev,
                              [selectedClass.id]: updatedTasks,
                            };
                          });
                        }}
                        highlightTaskId={highlightTaskId}
                      />
                    )}
                    {activeTab === "resources" && <ResourcesTab theme={theme} classId={selectedClass.id} />}
                    {activeTab === "roadmap" && <UnitRoadmapTab theme={theme} classId={selectedClass.id} />}
                    {activeTab === "members" && <MembersTab theme={theme} />}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
