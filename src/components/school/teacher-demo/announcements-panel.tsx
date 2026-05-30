"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

type Priority = "info" | "important" | "urgent";
type AnnouncementStatus = "active" | "scheduled" | "archived" | "expired";

type AudienceScope = {
  id: string;
  label: string;
  type: "class" | "homeroom" | "department" | "year-group" | "staff" | "school";
  count: number;
};

type Attachment = {
  id: string;
  name: string;
  type: "pdf" | "image" | "document" | "link";
  size?: string;
};

type ContextSuggestion = {
  id: string;
  text: string;
  type: "deadline" | "related" | "follow-up";
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  status: AnnouncementStatus;
  author: {
    name: string;
    initials: string;
    role: string;
    department: string;
  };
  audience: AudienceScope[];
  postedAt: string;
  postedRelative: string;
  scheduledFor?: string;
  expiresAt?: string;
  attachments: Attachment[];
  pinned: boolean;
  read: boolean;
  readCount: number;
  totalRecipients: number;
  category: "school-wide" | "department" | "class" | "staff";
  contextSuggestions: ContextSuggestion[];
};

type ComposeData = {
  title: string;
  body: string;
  priority: Priority;
  selectedAudiences: string[];
  scheduledFor: string;
  expiresAt: string;
  attachments: Attachment[];
  isScheduled: boolean;
  hasExpiry: boolean;
};

// ── Demo Data & Configs ────────────────────────────────────────────────────────

const AVAILABLE_AUDIENCES: AudienceScope[] = [
  { id: "aud-1", label: "Grade 11 Physics (B)", type: "class", count: 28 },
  { id: "aud-2", label: "Grade 12 Adv Physics (A)", type: "class", count: 24 },
  { id: "aud-3", label: "Grade 10 Science (C)", type: "class", count: 31 },
  { id: "aud-10", label: "Homeroom 10B", type: "homeroom", count: 26 },
  { id: "aud-5", label: "Science Department", type: "department", count: 14 },
  { id: "aud-6", label: "Year 10", type: "year-group", count: 156 },
  { id: "aud-7", label: "Year 11", type: "year-group", count: 142 },
  { id: "aud-8", label: "All Staff", type: "staff", count: 68 },
  { id: "aud-9", label: "Whole School", type: "school", count: 820 },
];

const PERSONAS = {
  subject_teacher: {
    name: "Aarav Chen",
    role: "Subject Teacher",
    department: "Science",
    initials: "AC",
    allowedScopes: ["class"],
  },
  homeroom_teacher: {
    name: "Aarav Chen",
    role: "Homeroom Teacher",
    department: "Science",
    initials: "AC",
    allowedScopes: ["class", "homeroom"],
  },
  dept_head: {
    name: "Aarav Chen",
    role: "Department Head",
    department: "Science",
    initials: "AC",
    allowedScopes: ["class", "department"],
  },
  coordinator: {
    name: "Aarav Chen",
    role: "Year Coordinator",
    department: "Science",
    initials: "AC",
    allowedScopes: ["class", "homeroom", "department", "year-group", "staff", "school"],
  }
};

type PersonaType = keyof typeof PERSONAS;

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Fire Drill Scheduled - Wednesday 11:00 AM",
    body: "A scheduled fire drill will take place on Wednesday at 11:00 AM. All staff must ensure students evacuate calmly via their designated routes. Assembly point is the main sports field. Please review evacuation procedures with your classes before Wednesday.\n\nKey reminders:\n- Close all windows and doors when leaving\n- Take attendance at the assembly point\n- Report any missing students immediately to the fire marshal\n- Do not allow students to return for personal belongings\n\nEstimated duration: 15 minutes. Normal lessons resume at 11:20 AM.",
    priority: "urgent",
    status: "active",
    author: { name: "Principal Davies", initials: "PD", role: "Principal", department: "Administration" },
    audience: [{ id: "aud-9", label: "Whole School", type: "school", count: 820 }],
    postedAt: "Today, 07:45 AM",
    postedRelative: "2h ago",
    expiresAt: "Wed 4 Jun, 12:00 PM",
    attachments: [
      { id: "att-1", name: "Evacuation_Routes_Map.pdf", type: "pdf", size: "1.2 MB" },
    ],
    pinned: true,
    read: true,
    readCount: 712,
    totalRecipients: 820,
    category: "school-wide",
    contextSuggestions: [
      { id: "cs-1", text: "Fire drill is in 2 days - review evacuation routes with Period 1 class", type: "follow-up" },
    ],
  },
  {
    id: "ann-2",
    title: "Year 10 Mock Exam Timetable Released",
    body: "The Year 10 mock examination timetable has been published and is now available on the school portal. Exams begin Monday 16 June and run through Friday 27 June.\n\nPlease ensure all coursework deadlines are met before the exam period begins. Students should receive a printed copy of their individual timetable by end of this week.\n\nRevision sessions will be held during lunch breaks in the library from next Monday. Subject teachers are encouraged to coordinate revision resources through Class Space.",
    priority: "important",
    status: "active",
    author: { name: "Dr. Amara Osei", initials: "AO", role: "Exam Coordinator", department: "Academic Affairs" },
    audience: [
      { id: "aud-6", label: "Year 10", type: "year-group", count: 156 },
      { id: "aud-8", label: "All Staff", type: "staff", count: 68 },
    ],
    postedAt: "Today, 08:30 AM",
    postedRelative: "1h ago",
    expiresAt: "Fri 27 Jun, 4:00 PM",
    attachments: [
      { id: "att-2", name: "Year10_Mock_Timetable.pdf", type: "pdf", size: "340 KB" },
      { id: "att-3", name: "Revision_Guide_Links.pdf", type: "document", size: "128 KB" },
    ],
    pinned: true,
    read: true,
    readCount: 189,
    totalRecipients: 224,
    category: "school-wide",
    contextSuggestions: [
      { id: "cs-2", text: "Exam period starts in 2 weeks - coursework deadlines approaching", type: "deadline" },
      { id: "cs-3", text: "Related: Year 10 Science coursework due before mock period", type: "related" },
    ],
  },
  {
    id: "ann-3",
    title: "Room Change: 10B Maths Moved to Lab 3",
    body: "Due to a maintenance issue with the heating system in Room 204, all Grade 10B Mathematics lessons will be held in Lab 3 for the remainder of this week.\n\nPlease update your lesson plans accordingly. Lab 3 has limited whiteboard space but projector access is available. A portable whiteboard has been arranged.\n\nNormal room assignment resumes Monday.",
    priority: "important",
    status: "active",
    author: { name: "Aarav Chen", initials: "AC", role: "Subject Teacher", department: "Science" },
    audience: [{ id: "aud-10", label: "Homeroom 10B", type: "homeroom", count: 26 }],
    postedAt: "Today, 09:15 AM",
    postedRelative: "45m ago",
    expiresAt: "Fri 6 Jun, 3:30 PM",
    attachments: [],
    pinned: false,
    read: false,
    readCount: 18,
    totalRecipients: 26,
    category: "class",
    contextSuggestions: [
      { id: "cs-4", text: "Room change affects your timetable this week - Lab 3 for 10B periods", type: "related" },
    ],
  },
  {
    id: "ann-4",
    title: "Science Department Meeting - Friday 3:30 PM",
    body: "Reminder: Our weekly department meeting is scheduled for Friday at 3:30 PM in the Science Staff Room.\n\nAgenda items:\n1. Lab equipment audit results\n2. Year 11 practical assessment moderation\n3. New safety protocols for chemistry labs\n4. Budget allocation for next term\n5. Any other business\n\nPlease bring your assessment data for moderation discussion. Expected duration: 45 minutes.",
    priority: "info",
    status: "active",
    author: { name: "Prof. Elara Whitfield", initials: "EW", role: "Department Head", department: "Science" },
    audience: [{ id: "aud-5", label: "Science Department", type: "department", count: 14 }],
    postedAt: "Yesterday, 4:10 PM",
    postedRelative: "Yesterday",
    attachments: [
      { id: "att-4", name: "Meeting_Agenda_June6.pdf", type: "pdf", size: "89 KB" },
    ],
    pinned: false,
    read: true,
    readCount: 12,
    totalRecipients: 14,
    category: "department",
    contextSuggestions: [
      { id: "cs-5", text: "Department meeting in 2 days - prepare assessment moderation data", type: "follow-up" },
    ],
  },
  {
    id: "ann-5",
    title: "Sports Day Volunteer Signup",
    body: "Sports Day is confirmed for Friday 20 June. We need staff volunteers for the following roles:\n\n- Track marshals (6 needed)\n- Field event judges (4 needed)\n- First aid support (2 needed)\n- Registration desk (3 needed)\n- Refreshment coordination (2 needed)\n\nPlease sign up via the shared document on the staff portal or reply to this announcement with your preferred role. Volunteer briefing will be held Thursday 19 June at 4:00 PM.\n\nThank you for your support in making this a memorable event for our students.",
    priority: "info",
    status: "active",
    author: { name: "Coach Brennan", initials: "CB", role: "Head of PE", department: "Physical Education" },
    audience: [{ id: "aud-8", label: "All Staff", type: "staff", count: 68 }],
    postedAt: "Yesterday, 2:00 PM",
    postedRelative: "Yesterday",
    expiresAt: "Thu 19 Jun, 12:00 PM",
    attachments: [
      { id: "att-5", name: "Volunteer_Signup_Form.pdf", type: "document", size: "56 KB" },
    ],
    pinned: false,
    read: true,
    readCount: 54,
    totalRecipients: 68,
    category: "staff",
    contextSuggestions: [],
  },
  {
    id: "ann-6",
    title: "IA Draft Deadline Reminder",
    body: "The deadline for the Year 11 Physics Internal Assessment first draft is Friday 13 June.\n\nStudents who have not yet submitted their research question for approval should do so immediately. Late submissions will be accepted until Wednesday but will receive reduced feedback time.\n\nPlease remind your Year 11 students during registration. Resources and exemplars are available on Class Space.",
    priority: "important",
    status: "active",
    author: { name: "Aarav Chen", initials: "AC", role: "Subject Teacher", department: "Science" },
    audience: [{ id: "aud-1", label: "Grade 11 Physics (B)", type: "class", count: 28 }],
    postedAt: "2 days ago, 11:30 AM",
    postedRelative: "2 days ago",
    expiresAt: "Fri 13 Jun, 11:59 PM",
    attachments: [
      { id: "att-6", name: "IA_Guidelines_2025.pdf", type: "pdf", size: "2.1 MB" },
      { id: "att-7", name: "Research_Question_Template.pdf", type: "document", size: "45 KB" },
    ],
    pinned: false,
    read: true,
    readCount: 25,
    totalRecipients: 28,
    category: "class",
    contextSuggestions: [
      { id: "cs-6", text: "Deadline changed 3 days ago - IA drafts now due 13 June", type: "deadline" },
      { id: "cs-7", text: "Related assignment: Research question approval pending for 3 students", type: "related" },
    ],
  },
  {
    id: "ann-7",
    title: "New Marking Policy Document Available",
    body: "The updated Whole-School Marking and Feedback Policy has been published on the staff portal. All teaching staff are required to review this document before the end of term.\n\nKey changes include:\n- Standardised feedback codes across all departments\n- New turnaround time expectations (5 working days)\n- Digital marking guidelines for Class Space submissions\n- Peer assessment framework for KS4 and KS5\n\nDepartment heads should discuss implementation strategies at their next team meeting.",
    priority: "info",
    status: "active",
    author: { name: "Vice Principal Harlow", initials: "VH", role: "Vice Principal", department: "Administration" },
    audience: [{ id: "aud-8", label: "All Staff", type: "staff", count: 68 }],
    postedAt: "3 days ago, 9:00 AM",
    postedRelative: "3 days ago",
    attachments: [
      { id: "att-8", name: "Marking_Policy_v4.2.pdf", type: "pdf", size: "1.8 MB" },
    ],
    pinned: false,
    read: true,
    readCount: 61,
    totalRecipients: 68,
    category: "staff",
    contextSuggestions: [],
  },
  {
    id: "ann-8",
    title: "End-of-Term Assembly - Thursday Period 5",
    body: "The end-of-term assembly will be held on Thursday during Period 5 in the Main Hall.\n\nAll students and staff are expected to attend. Please escort your class to the hall by 2:10 PM. Seating will be arranged by year group.\n\nThe assembly will include:\n- Principal's address\n- Academic achievement awards\n- Music performance by the Year 12 ensemble\n- Sports Day preview\n\nDismissal will be from the hall at the usual time.",
    priority: "important",
    status: "active",
    author: { name: "Principal Davies", initials: "PD", role: "Principal", department: "Administration" },
    audience: [{ id: "aud-9", label: "Whole School", type: "school", count: 820 }],
    postedAt: "3 days ago, 8:00 AM",
    postedRelative: "3 days ago",
    attachments: [],
    pinned: false,
    read: true,
    readCount: 798,
    totalRecipients: 820,
    category: "school-wide",
    contextSuggestions: [],
  },
  {
    id: "ann-9",
    title: "Grade 11 Physics Lab Rescheduled",
    body: "The Grade 11 Physics (B) practical session originally scheduled for Wednesday Period 3 has been moved to Thursday Period 4 due to lab maintenance.\n\nPlease ensure your students are aware. The experiment topic remains unchanged: electromagnetic induction.\n\nLab coats and safety goggles are required.",
    priority: "info",
    status: "archived",
    author: { name: "Aarav Chen", initials: "AC", role: "Subject Teacher", department: "Science" },
    audience: [{ id: "aud-1", label: "Grade 11 Physics (B)", type: "class", count: 28 }],
    postedAt: "4 days ago, 3:45 PM",
    postedRelative: "4 days ago",
    attachments: [],
    pinned: false,
    read: true,
    readCount: 28,
    totalRecipients: 28,
    category: "class",
    contextSuggestions: [],
  },
  {
    id: "ann-10",
    title: "Parent-Teacher Conference Schedule",
    body: "The annual parent-teacher conference is scheduled for Thursday 26 June from 4:00 PM to 7:30 PM.\n\nBooking slots will open to parents on Monday 9 June via the school portal. Each slot is 10 minutes.\n\nPlease ensure your availability is updated on the booking system by Friday 6 June.",
    priority: "info",
    status: "scheduled",
    author: { name: "Principal Davies", initials: "PD", role: "Principal", department: "Administration" },
    audience: [{ id: "aud-8", label: "All Staff", type: "staff", count: 68 }],
    postedAt: "Scheduled",
    postedRelative: "Publishes Mon 9 Jun",
    scheduledFor: "Mon 9 Jun, 08:00 AM",
    attachments: [],
    pinned: false,
    read: true,
    readCount: 0,
    totalRecipients: 68,
    category: "staff",
    contextSuggestions: [],
  },
];

const priorityConfig: Record<Priority, { label: string; dot: string; bg: string; text: string; border: string }> = {
  urgent: { label: "Urgent", dot: "bg-rose-400", bg: "bg-rose-400/10", text: "text-rose-300", border: "border-rose-400/20" },
  important: { label: "Important", dot: "bg-amber-400", bg: "bg-amber-400/10", text: "text-amber-300", border: "border-amber-400/20" },
  info: { label: "Info", dot: "bg-sky-400", bg: "bg-sky-400/10", text: "text-sky-300", border: "border-sky-400/20" },
};


const categoryLabels: Record<string, string> = {
  "school-wide": "School",
  "department": "Department",
  "class": "Class",
  "staff": "Staff",
};

const attachmentIcons: Record<string, string> = {
  pdf: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  image: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  document: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  link: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-3.497l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757",
};

// History Filter Tabs
type HistoryTab = "sent" | "scheduled" | "archived";

export function AnnouncementsPanel({ forceOpen, onOpenChange }: { forceOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setPanelOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    onOpenChange?.(panelOpen);
  }, [panelOpen, onOpenChange]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<HistoryTab>("sent");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("subject_teacher");

  const [composeData, setComposeData] = useState<ComposeData>({
    title: "",
    body: "",
    priority: "info",
    selectedAudiences: [],
    scheduledFor: "",
    expiresAt: "",
    attachments: [],
    isScheduled: false,
    hasExpiry: false,
  });

  const currentTeacher = "Aarav Chen";

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePersonaChange = (persona: PersonaType) => {
    setCurrentPersona(persona);
    const allowedTypes = PERSONAS[persona].allowedScopes;
    setComposeData((prev) => ({
      ...prev,
      selectedAudiences: prev.selectedAudiences.filter((audId) => {
        const aud = AVAILABLE_AUDIENCES.find((a) => a.id === audId);
        return aud ? allowedTypes.includes(aud.type) : false;
      }),
    }));
  };

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)));
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "archived" ? "active" : "archived" as AnnouncementStatus } : a
      )
    );
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = announcements.find((a) => a.id === id);
    if (!source) return;
    setComposeData({
      title: `${source.title} (Copy)`,
      body: source.body,
      priority: source.priority,
      selectedAudiences: source.audience.map((a) => a.id),
      scheduledFor: "",
      expiresAt: "",
      attachments: [...source.attachments],
      isScheduled: false,
      hasExpiry: false,
    });
    setEditingId(null);
    setShowCompose(true);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = announcements.find((a) => a.id === id);
    if (!source) return;
    setComposeData({
      title: source.title,
      body: source.body,
      priority: source.priority,
      selectedAudiences: source.audience.map((a) => a.id),
      scheduledFor: source.scheduledFor || "",
      expiresAt: source.expiresAt || "",
      attachments: [...source.attachments],
      isScheduled: !!source.scheduledFor,
      hasExpiry: !!source.expiresAt,
    });
    setEditingId(id);
    setShowCompose(true);
  };

  const handlePublish = () => {
    if (!composeData.title.trim() || !composeData.body.trim()) return;

    const selectedScopes = AVAILABLE_AUDIENCES.filter((a) => composeData.selectedAudiences.includes(a.id));
    const totalRecipients = selectedScopes.reduce((sum, s) => sum + s.count, 0);

    const announcementData: Announcement = {
      id: editingId || `ann-new-${Date.now()}`,
      title: composeData.title,
      body: composeData.body,
      priority: composeData.priority,
      status: composeData.isScheduled && composeData.scheduledFor ? "scheduled" : "active",
      author: {
        name: PERSONAS[currentPersona].name,
        initials: PERSONAS[currentPersona].initials,
        role: PERSONAS[currentPersona].role,
        department: PERSONAS[currentPersona].department,
      },
      audience: selectedScopes,
      postedAt: composeData.isScheduled ? "Scheduled" : "Just now",
      postedRelative: composeData.isScheduled ? `Publishes ${composeData.scheduledFor}` : "Just now",
      scheduledFor: composeData.isScheduled ? composeData.scheduledFor : undefined,
      expiresAt: composeData.hasExpiry ? composeData.expiresAt : undefined,
      attachments: composeData.attachments,
      pinned: false,
      read: true,
      readCount: 0,
      totalRecipients,
      category: selectedScopes.some((s) => s.type === "school")
        ? "school-wide"
        : selectedScopes.some((s) => s.type === "department")
        ? "department"
        : selectedScopes.some((s) => s.type === "staff")
        ? "staff"
        : "class",
      contextSuggestions: [],
    };

    if (editingId) {
      setAnnouncements((prev) => prev.map((a) => (a.id === editingId ? { ...announcementData, readCount: a.readCount, read: a.read, pinned: a.pinned } : a)));
    } else {
      setAnnouncements((prev) => [announcementData, ...prev]);
    }
    setSelectedId(announcementData.id);
    resetCompose();
  };

  const resetCompose = () => {
    setShowCompose(false);
    setEditingId(null);
    setComposeData({ title: "", body: "", priority: "info", selectedAudiences: [], scheduledFor: "", expiresAt: "", attachments: [], isScheduled: false, hasExpiry: false });
  };

  const toggleAudience = (audId: string) => {
    setComposeData((prev) => ({
      ...prev,
      selectedAudiences: prev.selectedAudiences.includes(audId)
        ? prev.selectedAudiences.filter((id) => id !== audId)
        : [...prev.selectedAudiences, audId],
    }));
  };

  const addAttachment = () => {
    const demoFiles = [
      { name: "Document.pdf", type: "pdf" as const, size: "256 KB" },
      { name: "Handout.pdf", type: "document" as const, size: "128 KB" },
      { name: "Reference_Image.png", type: "image" as const, size: "1.4 MB" },
    ];
    const file = demoFiles[composeData.attachments.length % demoFiles.length];
    setComposeData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, { id: `att-new-${Date.now()}`, ...file }],
    }));
  };

  const removeAttachment = (attId: string) => {
    setComposeData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attId),
    }));
  };

  // ── Filtering Logic ────────────────────────────────────────────────────────

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    // 1. History Tab Filtering
    if (historyTab === "sent") {
      result = result.filter((a) => a.status === "active" || a.status === "expired");
    } else if (historyTab === "scheduled") {
      result = result.filter((a) => a.status === "scheduled");
    } else if (historyTab === "archived") {
      result = result.filter((a) => a.status === "archived");
    }

    // 2. Category Filter (School / Dept / Class / Homeroom)
    if (categoryFilter !== "all") {
      result = result.filter((a) => {
        if (categoryFilter === "school") return a.category === "school-wide" || a.category === "staff";
        if (categoryFilter === "department") return a.category === "department";
        if (categoryFilter === "class") return a.category === "class" && !a.audience.some((aud) => aud.type === "homeroom");
        if (categoryFilter === "homeroom") return a.audience.some((aud) => aud.type === "homeroom");
        return true;
      });
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [announcements, historyTab, categoryFilter, searchQuery]);


  return (
    <div className="relative">
      {/* Top Bar Announcements Trigger Button */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={`relative flex h-9 items-center justify-center rounded-xl border px-3.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
          panelOpen
            ? "bg-white text-[#0A0A0B] border-white"
            : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
        }`}
        title="Broadcast Announcements"
      >
        <span>Announcements</span>
        {announcements.filter((a) => !a.read && a.status === "active").length > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-black border border-[#0A0A0B]">
            {announcements.filter((a) => !a.read && a.status === "active").length}
          </span>
        )}
      </button>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-[430px] border-l border-white/[0.08] bg-[#0A0A0C]/95 p-safe-lg shadow-[-16px_0_64px_rgba(0,0,0,0.85)] backdrop-blur-xl text-white flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-safe-md mb-safe-md shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-white/95 tracking-tight">Broadcast Notices</h3>
                  <p className="text-[10px] text-white/35 mt-0.5">Communication layer & system announcements</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { resetCompose(); setShowCompose(true); }}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-zinc-950 shadow-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New
                  </button>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 text-white/35 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* History Tabs */}
              <div className="flex gap-0.5 rounded-lg bg-white/[0.02] border border-white/[0.05] p-0.5 shrink-0 mb-safe-sm">
                {(["sent", "scheduled", "archived"] as HistoryTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setHistoryTab(tab); setSelectedId(null); }}
                    className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider capitalize transition-all ${
                      historyTab === tab
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search & Category Filter */}
              <div className="space-y-2 mb-safe-md shrink-0">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search announcements..."
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-8 pr-3 text-[10px] text-white/80 placeholder:text-white/25 outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition-all"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Scopes" },
                    { id: "school", label: "School" },
                    { id: "department", label: "Dept" },
                    { id: "class", label: "Class" },
                    { id: "homeroom", label: "Homeroom" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setCategoryFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-semibold border transition-all ${
                        categoryFilter === filter.id
                          ? "bg-white/[0.08] border-white/20 text-white"
                          : "bg-transparent border-white/[0.04] text-white/40 hover:border-white/[0.08] hover:text-white/60"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Announcements Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-none">
                {filteredAnnouncements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <svg className="size-8 text-white/10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09" />
                    </svg>
                    <p className="text-[10px] text-white/25">No announcements in this category</p>
                  </div>
                ) : (
                  filteredAnnouncements.map((ann) => {
                    const isSelected = selectedId === ann.id;
                    const prio = priorityConfig[ann.priority];
                    const isArchived = ann.status === "archived" || ann.status === "expired";
                    const isHomeroom = ann.audience.some((aud) => aud.type === "homeroom");
                    const originLabel = isHomeroom ? "Homeroom" : categoryLabels[ann.category] || "Scope";

                    return (
                      <div
                        key={ann.id}
                        onClick={() => setSelectedId(isSelected ? null : ann.id)}
                        className={`w-full text-left rounded-xl border p-safe-md transition-all duration-200 cursor-pointer ${
                          isArchived ? "opacity-50" : ""
                        } ${
                          isSelected
                            ? "bg-white/[0.05] border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                            : ann.read
                            ? "bg-transparent border-white/[0.03] hover:bg-white/[0.01] hover:border-white/[0.06]"
                            : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`block size-2 rounded-full mt-1.5 shrink-0 ${prio.dot}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">
                                {originLabel} Broadcast
                              </span>
                              <span className="text-[8px] text-white/20">{ann.postedRelative}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-white/85 leading-snug mt-1">
                              {ann.title}
                            </p>
                            <p className={`text-[10px] text-white/45 mt-1 leading-normal ${isSelected ? "" : "line-clamp-2"}`}>
                              {ann.body}
                            </p>

                            {/* Detail Drawer overlay elements inline when selected */}
                            {isSelected && (
                              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3" onClick={(e) => e.stopPropagation()}>
                                {/* Metadata Row */}
                                <div className="flex justify-between items-center text-[9px] text-white/40">
                                  <span>From: <strong className="text-white/60">{ann.author.name} ({ann.author.role})</strong></span>
                                  <span>Sent: <strong className="text-white/60">{ann.postedAt}</strong></span>
                                </div>

                                {/* Audiences */}
                                <div className="flex flex-wrap gap-1">
                                  {ann.audience.map((a) => (
                                    <span key={a.id} className="text-[8px] bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded text-white/50">
                                      {a.label} ({a.count})
                                    </span>
                                  ))}
                                </div>

                                {/* Attachments */}
                                {ann.attachments.length > 0 && (
                                  <div className="space-y-1 pt-1">
                                    <p className="text-[8px] font-bold text-white/25 uppercase tracking-wider">Attachments</p>
                                    {ann.attachments.map((att) => (
                                      <div key={att.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-1.5 hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <svg className="size-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={attachmentIcons[att.type] || attachmentIcons.document} />
                                          </svg>
                                          <span className="text-[9.5px] text-white/60 truncate">{att.name}</span>
                                          {att.size && <span className="text-[8px] text-white/25 shrink-0">{att.size}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Read stats analytics (for creator Aarav Chen) */}
                                {ann.author.name === currentTeacher && (
                                  <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px]">
                                      <span className="text-white/45 font-medium">Read Delivery Analytics</span>
                                      <span className="text-white/70 font-semibold">{ann.readCount} of {ann.totalRecipients} read</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500/80 rounded-full"
                                        style={{ width: `${ann.totalRecipients > 0 ? Math.round((ann.readCount / ann.totalRecipients) * 100) : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons for Sent tab details */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                  {ann.author.name === currentTeacher ? (
                                    <div className="flex items-center gap-1.5">
                                      {ann.status === "active" && (
                                        <button
                                          onClick={(e) => handleEdit(ann.id, e)}
                                          className="px-2.5 py-1 text-[9px] font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded transition-all"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => handleDuplicate(ann.id, e)}
                                        className="px-2.5 py-1 text-[9px] font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded transition-all"
                                      >
                                        Duplicate
                                      </button>
                                      <button
                                        onClick={(e) => handleArchive(ann.id, e)}
                                        className="px-2.5 py-1 text-[9px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded transition-all"
                                      >
                                        {ann.status === "archived" ? "Restore" : "Archive"}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[8px] text-white/20">Read-only institutional update</span>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePin(ann.id, e); }}
                                    className={`p-1.5 rounded border transition-all ${
                                      ann.pinned
                                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                        : "border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/60"
                                    }`}
                                  >
                                    <svg className="size-3" fill={ann.pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Compose / Edit Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) resetCompose(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#111113] shadow-[0_32px_100px_rgba(0,0,0,0.9)] overflow-hidden text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-safe-lg py-safe-md">
                <div>
                  <h3 className="text-[14px] font-semibold text-white/90 tracking-tight">
                    {editingId ? "Edit Announcement" : "Create Announcement"}
                  </h3>
                  <p className="text-[10px] text-white/35 mt-0.5">Broadcast to your classes and groups</p>
                </div>
                <button onClick={resetCompose} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-safe-lg py-safe-md space-y-safe-md max-h-[60vh] overflow-y-auto scrollbar-none">

                {/* Persona Switcher (Scope Gating Demonstration) */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-safe-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Demo Persona (Scope Control)</span>
                    <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-400/10 text-emerald-300 border border-emerald-400/10 px-1.5 py-0.5 rounded">
                      <span className="size-1 rounded-full bg-emerald-400 animate-ping" />
                      Auto-gating Active
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 rounded-lg bg-white/[0.02] border border-white/[0.05] p-0.5">
                    {(Object.keys(PERSONAS) as PersonaType[]).map((roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handlePersonaChange(roleKey)}
                        className={`rounded-md py-1.5 text-[9px] font-medium transition-all ${
                          currentPersona === roleKey
                            ? "bg-white text-zinc-950 shadow-sm font-semibold"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {PERSONAS[roleKey].role.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8.5px] text-white/30 mt-2 leading-normal">
                    Acting as <strong className="text-white/60">{PERSONAS[currentPersona].role}</strong>. Allowed scopes:{" "}
                    <span className="text-white/50">{PERSONAS[currentPersona].allowedScopes.join(", ")}</span>. Others will be locked.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={composeData.title}
                    onChange={(e) => setComposeData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Announcement title..."
                    className="mt-2 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Message</label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData((prev) => ({ ...prev, body: e.target.value }))}
                    placeholder="Write your announcement..."
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition-all resize-none"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Priority</label>
                  <div className="mt-2 flex gap-2">
                    {(["info", "important", "urgent"] as Priority[]).map((p) => {
                      const cfg = priorityConfig[p];
                      const isActive = composeData.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setComposeData((prev) => ({ ...prev, priority: p }))}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-medium transition-all ${
                            isActive ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Audience</label>
                  <p className="text-[10px] text-white/30 mt-1 mb-3">Select target audiences for the broadcast</p>
                  {[
                    { label: "Homeroom", types: ["homeroom"] as const },
                    { label: "Your Classes", types: ["class"] as const },
                    { label: "Department", types: ["department"] as const },
                    { label: "Year Groups, Staff & School", types: ["year-group", "staff", "school"] as const },
                  ].map((group) => {
                    const items = AVAILABLE_AUDIENCES.filter((a) => (group.types as readonly string[]).includes(a.type));
                    if (items.length === 0) return null;
                    return (
                      <div key={group.label} className="mb-3">
                        <p className="text-[9px] text-white/20 uppercase tracking-wider font-medium mb-1.5">{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((aud) => {
                            const isAllowed = PERSONAS[currentPersona].allowedScopes.includes(aud.type);
                            const isSelected = composeData.selectedAudiences.includes(aud.id) && isAllowed;
                            return (
                              <button
                                key={aud.id}
                                type="button"
                                disabled={!isAllowed}
                                onClick={() => toggleAudience(aud.id)}
                                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all ${
                                  !isAllowed
                                    ? "border-white/[0.02] bg-transparent text-white/15 cursor-not-allowed"
                                    : isSelected
                                    ? "border-white/[0.15] bg-white/[0.08] text-white/85"
                                    : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                                }`}
                                title={!isAllowed ? `Restricted for ${PERSONAS[currentPersona].role}` : undefined}
                              >
                                <span className={`size-3 rounded border flex items-center justify-center transition-all ${
                                  !isAllowed
                                    ? "border-white/[0.05] bg-transparent"
                                    : isSelected
                                    ? "bg-white border-white"
                                    : "border-white/[0.15] bg-transparent"
                                }`}>
                                  {!isAllowed ? (
                                    <svg className="size-2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                  ) : isSelected ? (
                                    <svg className="size-2 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                  ) : null}
                                </span>
                                {aud.label}
                                <span className="text-[8px] text-white/20">{aud.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Schedule & Expiry Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setComposeData((prev) => ({ ...prev, isScheduled: !prev.isScheduled, scheduledFor: "" }))}
                        className={`size-3.5 rounded border flex items-center justify-center transition-all ${composeData.isScheduled ? "bg-white border-white" : "border-white/[0.15] bg-transparent"}`}
                      >
                        {composeData.isScheduled && (
                          <svg className="size-2 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </button>
                      <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Schedule</label>
                    </div>
                    {composeData.isScheduled && (
                      <input
                        type="text"
                        value={composeData.scheduledFor}
                        onChange={(e) => setComposeData((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                        placeholder="e.g. Mon 9 Jun, 08:00 AM"
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-white/[0.12] transition-all"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setComposeData((prev) => ({ ...prev, hasExpiry: !prev.hasExpiry, expiresAt: "" }))}
                        className={`size-3.5 rounded border flex items-center justify-center transition-all ${composeData.hasExpiry ? "bg-white border-white" : "border-white/[0.15] bg-transparent"}`}
                      >
                        {composeData.hasExpiry && (
                          <svg className="size-2 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </button>
                      <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Expiry Date</label>
                    </div>
                    {composeData.hasExpiry && (
                      <input
                        type="text"
                        value={composeData.expiresAt}
                        onChange={(e) => setComposeData((prev) => ({ ...prev, expiresAt: e.target.value }))}
                        placeholder="e.g. Fri 13 Jun, 11:59 PM"
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-white/[0.12] transition-all"
                      />
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Attachments</label>
                    <button
                      onClick={addAttachment}
                      className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                    >
                      <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add File
                    </button>
                  </div>
                  {composeData.attachments.length > 0 && (
                    <div className="space-y-1">
                      {composeData.attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <svg className="size-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={attachmentIcons[att.type] || attachmentIcons.document} />
                            </svg>
                            <span className="text-[10px] text-white/60 truncate">{att.name}</span>
                            {att.size && <span className="text-[8px] text-white/25 shrink-0">{att.size}</span>}
                          </div>
                          <button onClick={() => removeAttachment(att.id)} className="text-white/25 hover:text-rose-400 transition-colors ml-2 shrink-0">
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-safe-lg py-safe-md">
                <div className="text-[10px] text-white/30">
                  {composeData.selectedAudiences.length > 0
                    ? `${AVAILABLE_AUDIENCES.filter((a) => composeData.selectedAudiences.includes(a.id)).reduce((s, a) => s + a.count, 0)} recipients selected`
                    : "No audience selected"}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetCompose} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] text-white/50 hover:text-white/70 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={!composeData.title.trim() || !composeData.body.trim() || composeData.selectedAudiences.length === 0}
                    className="rounded-lg bg-white px-5 py-2 text-[11px] font-semibold text-zinc-950 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {editingId ? "Update" : composeData.isScheduled ? "Schedule" : "Publish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
