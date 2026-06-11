"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAxisTheme, AXIS_TOKENS, type Theme } from "@/lib/theme-utils";
import { ResourcePickerModal } from "./connected-resources";

// ─── Types ──────────────────────────────────────────────────────────────

type EmailFolder = "inbox" | "important" | "sent" | "drafts" | "announcements" | "archived";

type Email = {
  id: string;
  from: string;
  fromRole: string;
  fromAvatar: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  folder: EmailFolder;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
  tags?: string[];
  accountEmail?: string;
};

type ConnectedAccount = {
  email: string;
  label: "work" | "home" | "custom";
  customLabelName?: string;
};

type ContextOverlay = {
  entity: string;
  title: string;
  type: "room" | "class" | "teacher" | "event" | "department" | "context";
  details: string[];
  actionLabel?: string;
  actionType?: string;
} | null;

type RecipientTarget = {
  id: string;
  name: string;
  email: string;
  category: "Faculty" | "Guardians" | "Programme" | "Grade-Level" | "Subject Lead" | "Department" | "Broadcast";
};

// ─── Recipient Suggestion Data ──────────────────────────────────────────

const RECIPIENT_TARGETS: RecipientTarget[] = [
  // Faculty & Staff
  { id: "rec-fac-1", name: "Science Faculty", email: "science.faculty@axis.edu", category: "Faculty" },
  { id: "rec-fac-2", name: "Mathematics Faculty", email: "math.faculty@axis.edu", category: "Faculty" },
  { id: "rec-fac-3", name: "Languages Faculty", email: "languages.faculty@axis.edu", category: "Faculty" },
  { id: "rec-fac-4", name: "All Teaching Staff", email: "all.staff@axis.edu", category: "Faculty" },
  { id: "rec-fac-5", name: "Sarah Chen", email: "sarah.chen@axis.edu", category: "Faculty" },
  { id: "rec-fac-6", name: "Aarav Chen", email: "aarav.chen@axis.edu", category: "Faculty" },
  { id: "rec-fac-7", name: "Marcus Vance", email: "marcus.vance@axis.edu", category: "Faculty" },
  { id: "rec-fac-8", name: "Ananya Rao", email: "ananya.rao@axis.edu", category: "Faculty" },
  { id: "rec-fac-9", name: "Clara Dupont", email: "clara.dupont@axis.edu", category: "Faculty" },
  { id: "rec-fac-10", name: "Robert Blake", email: "robert.blake@axis.edu", category: "Faculty" },

  // Guardians & Parents
  { id: "rec-gdn-1", name: "DP1 Parents/Guardians", email: "dp1.parents@family.com", category: "Guardians" },
  { id: "rec-gdn-2", name: "DP2 Parents/Guardians", email: "dp2.parents@family.com", category: "Guardians" },
  { id: "rec-gdn-3", name: "Grade 11 Parents", email: "g11.parents@family.com", category: "Guardians" },
  { id: "rec-gdn-4", name: "Grade 12 Parents", email: "g12.parents@family.com", category: "Guardians" },
  { id: "rec-gdn-5", name: "David Vance", email: "david.vance@family.com", category: "Guardians" },
  { id: "rec-gdn-6", name: "Helena Watson", email: "helena.watson@family.com", category: "Guardians" },

  // Students
  { id: "rec-std-1", name: "Chloe Vance", email: "chloe.vance@axis.edu", category: "Programme" },
  { id: "rec-std-2", name: "Lucas Gray", email: "lucas.gray@axis.edu", category: "Programme" },
  { id: "rec-std-3", name: "Dilan Patel", email: "dilan.patel@axis.edu", category: "Programme" },
  { id: "rec-std-4", name: "Emma Watson", email: "emma.watson@axis.edu", category: "Programme" },
  { id: "rec-prg-1", name: "IB DP Candidates", email: "dp.candidates@axis.edu", category: "Programme" },
  { id: "rec-prg-2", name: "MYP Students", email: "myp.students@axis.edu", category: "Programme" },
  { id: "rec-prg-3", name: "CP Candidates", email: "cp.candidates@axis.edu", category: "Programme" },

  // Cohorts
  { id: "rec-grd-1", name: "Grade 11 Cohort", email: "g11.cohort@axis.edu", category: "Grade-Level" },
  { id: "rec-grd-2", name: "Grade 12 Cohort", email: "g12.cohort@axis.edu", category: "Grade-Level" },

  // Subject Leads & Departments
  { id: "rec-sub-1", name: "EE Supervisors", email: "ee.supervisors@axis.edu", category: "Subject Lead" },
  { id: "rec-sub-2", name: "TOK Essay Advisors", email: "tok.advisors@axis.edu", category: "Subject Lead" },
  { id: "rec-sub-3", name: "Subject Heads", email: "subject.heads@axis.edu", category: "Subject Lead" },
  { id: "rec-dep-1", name: "Science Department", email: "science.dept@axis.edu", category: "Department" },
  { id: "rec-dep-2", name: "Math Department", email: "math.dept@axis.edu", category: "Department" },
  { id: "rec-dep-3", name: "Admin Staff", email: "admin.staff@axis.edu", category: "Department" },

  // Custom Groups & External Orgs
  { id: "rec-grp-1", name: "DP1 Teachers", email: "dp1.teachers@axis.edu", category: "Faculty" },
  { id: "rec-grp-2", name: "Leadership Team", email: "leadership@axis.edu", category: "Faculty" },
  { id: "rec-grp-3", name: "Parent Representative", email: "parent.rep@family.com", category: "Guardians" },
  { id: "rec-ext-1", name: "External Consultant", email: "consultant.ext@axis.edu", category: "Broadcast" },
  { id: "rec-ext-2", name: "IB Evaluation Board", email: "ib.eval@ib.org", category: "Broadcast" },

  // Broadcasts
  { id: "rec-bdc-1", name: "All School Members", email: "all@axis.edu", category: "Broadcast" },
  { id: "rec-bdc-2", name: "DP Cohort Announcement", email: "dp.announcements@axis.edu", category: "Broadcast" },
];

// ─── Context Entities Details ───────────────────────────────────────────

const ENTITY_CONTEXT: Record<string, { title: string; type: "room" | "class" | "teacher" | "event" | "department" | "context"; details: string[]; actionLabel?: string; actionType?: string }> = {
  "Lab 3": {
    title: "Lab 3 (Physics Laboratory)",
    type: "room",
    details: [
      "Status: Available after Period 3",
      "Next Class: Grade 11 Physics (B) - Period 4",
      "Assigned: Aarav Chen, Marcus Vance",
      "Upcoming: Lab Safety Inspection - May 15",
    ],
    actionLabel: "View Room Schedule",
    actionType: "navigate-map"
  },
  "Room 102": {
    title: "Room 102 (Guidance Office)",
    type: "room",
    details: [
      "Status: Available",
      "Assigned: Sarah Chen (Guidance)",
      "No conflicting bookings today",
    ],
    actionType: "navigate-map"
  },
  "Grade 11 Physics (B)": {
    title: "Grade 11 Physics - Section B",
    type: "class",
    details: [
      "Students: 24 enrolled",
      "Next Class: Period 4, Lab 3",
      "IA Submissions: 22/24 drafts received",
      "Attendance: 94.2% (Weekly Avg)",
    ],
    actionLabel: "Open Class Ledger",
    actionType: "navigate-students"
  },
  "Grade 12 Adv Physics (A)": {
    title: "Grade 12 Advanced Physics - Section A",
    type: "class",
    details: [
      "Students: 18 enrolled",
      "Next Class: Period 2, Room 204",
      "Exam: Unit Test - May 20",
    ],
    actionType: "navigate-students"
  },
  "Physics IA": {
    title: "Physics Internal Assessment",
    type: "event",
    details: [
      "Phase 2 Deadline: May 29",
      "Drafts Received: 22/24",
      "Pending Review: 4 students",
      "Coordinator: Marcus Vance",
    ],
    actionLabel: "Open IA Tracker",
    actionType: "navigate-resources"
  },
  "Period 5": {
    title: "Period 5 Schedule Block",
    type: "event",
    details: [
      "Time: 12:45 PM – 1:30 PM",
      "Status: Free Period / Coordination",
      "Coverage Request: Grade 10 Science (pending)",
    ],
    actionType: "navigate-schedule"
  },
  "PTM": {
    title: "Parent-Teacher Meeting",
    type: "event",
    details: [
      "Date: Saturday, May 24",
      "Time: 9:00 AM – 1:00 PM",
      "Slots: 15-min per parent",
      "Preparation: Progress reports required",
    ],
    actionLabel: "View PTM Schedule",
    actionType: "navigate-meetings"
  },
  "Exam Week": {
    title: "Unit Test Week",
    type: "event",
    details: [
      "Dates: May 18 – 22",
      "Papers Due: May 15",
      "Physics Slot: Mon Period 1–2 (Gr11), Wed Period 3–4 (Gr12)",
    ],
    actionType: "navigate-schedule"
  },
  "Department Meeting": {
    title: "Science Department Meeting",
    type: "department",
    details: [
      "Frequency: Weekly (Wednesdays)",
      "Location: Conference Room B",
      "Chair: Marcus Vance",
      "Next Agenda: Lab protocols, IA workload",
    ],
    actionLabel: "View Agenda",
    actionType: "navigate-meetings"
  },
  "Working Saturday": {
    title: "Working Saturday",
    type: "event",
    details: [
      "Next: May 31 - Thursday timetable",
      "Reason: Compensatory day",
      "All staff required",
    ],
    actionType: "navigate-schedule"
  },
  "Grade 12 Bake Sale on September 18": {
    title: "Grade 12 Bake Sale",
    type: "event",
    details: [
      "Potential Event Reference: September 18",
      "Proposed Location: Central Courtyard",
      "Action required: Create Event in School Calendar",
    ],
    actionLabel: "Create Event",
    actionType: "create-event"
  },
  "TOK Exhibition due next week": {
    title: "TOK Exhibition Guidelines",
    type: "event",
    details: [
      "Academic checkpoint milestone",
      "Missing 4 supervisor review reports",
      "Action recommended: Audit guidelines and checklists",
    ],
    actionLabel: "View TOK Guidelines",
    actionType: "view-tok-resources"
  }
};

// ─── Emails Database ────────────────────────────────────────────────────

const INITIAL_EMAILS: Email[] = [
  {
    id: "em-coord-1",
    from: "David Miller",
    fromRole: "Grade 12 Lead",
    fromAvatar: "DM",
    to: "sarah.thompson@axis.edu",
    subject: "Grade 12 Bake Sale coordination request",
    preview: "Hi Sarah, I wanted to follow up on the planning for the upcoming Grade 12 Bake Sale on September 18...",
    body: "Hi Sarah,\n\nI wanted to follow up on the planning for the upcoming Grade 12 Bake Sale on September 18. We need to book the central courtyard and coordinate parent volunteers.\n\nCould you double check the availability and register this event in the system so that staff and parents are notified?\n\nBest,\nDavid Miller",
    time: "10:45 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: true,
    tags: ["Bake Sale", "Courtyard"],
    accountEmail: "sarah.thompson@axis.edu"
  },
  {
    id: "em-coord-2",
    from: "Sarah Chen",
    fromRole: "Guidance Counselor",
    fromAvatar: "SC",
    to: "sarah.thompson@axis.edu",
    subject: "TOK Exhibition draft moderation checkpoint",
    preview: "Sarah, Please note that the TOK Exhibition due next week must have all advisor comments...",
    body: "Sarah,\n\nPlease note that the TOK Exhibition due next week must have all advisor comments and predicted grades locked. We are still missing 4 supervisor reports.\n\nCould you run a quick status audit and alert the advisors?\n\nThanks,\nSarah Chen",
    time: "09:12 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: false,
    tags: ["TOK Exhibition", "Deadlines"],
    accountEmail: "sarah.thompson@axis.edu"
  },
  {
    id: "em-coord-3",
    from: "Mr. Michael Torres",
    fromRole: "Head of School",
    fromAvatar: "MT",
    to: "sarah.thompson@axis.edu",
    subject: "DP Accreditation Board visit guidelines",
    preview: "Hi Sarah, Ahead of our board review on Friday, please ensure the curriculum audit spreadsheets...",
    body: "Hi Sarah,\n\nAhead of our board review on Friday, please ensure the curriculum audit spreadsheets and syllabus coverage plans for PYP, MYP, and DP are compiled and accessible.\n\nI will need a brief summary outline on Thursday afternoon.\n\nWarm regards,\nMichael",
    time: "Yesterday",
    date: "June 4",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    tags: ["Board Review"],
    accountEmail: "sarah.thompson@axis.edu"
  },
  {
    id: "em-1",
    from: "Marcus Vance",
    fromRole: "Head of Science",
    fromAvatar: "MV",
    to: "sarah.thompson@axis.edu",
    subject: "Lab 3 Schedule Conflict - Period 5 Resolution",
    preview: "Hi Sarah, I wanted to follow up on our coordination call regarding the Lab 3 booking collision...",
    body: "Hi Sarah,\n\nI wanted to follow up on our coordination call regarding the Lab 3 booking collision during Period 5.\n\nAfter reviewing the timetable with the coordination team, we've confirmed that Lab 3 will be available for the Grade 11 Physics (B) revision session on Thursday. The collision experiment has been moved to Lab 4.\n\nPlease update the room logs accordingly.\n\nBest regards,\nMarcus Vance\nHead of Science Department",
    time: "Tuesday",
    date: "June 3",
    folder: "inbox",
    isRead: true,
    isStarred: false,
    tags: ["Lab 3", "Period 5"],
    accountEmail: "sarah.thompson@axis.edu",
  },
  {
    id: "em-3",
    from: "Principal's Office",
    fromRole: "Administration",
    fromAvatar: "PO",
    to: "All Teaching Staff",
    subject: "PTM Saturday - Schedule & Guidelines",
    preview: "Dear colleagues, this is a reminder that the upcoming Parent-Teacher Meeting is scheduled for...",
    body: "Dear colleagues,\n\nThis is a reminder that the upcoming Parent-Teacher Meeting is scheduled for Saturday, May 24th, from 9:00 AM to 1:00 PM.\n\nKey guidelines:\n• 15-minute appointment slots per parent\n• Individual student progress reports must be prepared by Friday, May 23rd\n• Attendance flags should be reviewed and documented\n• Room assignments will be shared by Thursday\n\nGrade 11 and Grade 12 parents have been given priority slots.\n\nRegards,\nOffice of the Principal",
    time: "May 28",
    date: "May 28",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    tags: ["PTM"],
    accountEmail: "sarah.thompson@axis.edu",
  },
  {
    id: "em-7",
    from: "HR & Administration",
    fromRole: "School Administration",
    fromAvatar: "HR",
    to: "All Staff",
    subject: "Working Saturday Reminder - May 31",
    preview: "This is a reminder that Saturday, May 31st is a designated working day. Thursday timetable...",
    body: "This is a reminder that Saturday, May 31st is a designated working day.\n\nThursday timetable will be followed.\n\nAll staff are expected to be present. If you require leave, please submit your application through the HR portal.\n\nRegards,\nHR & Administration",
    time: "May 25",
    date: "May 25",
    folder: "announcements",
    isRead: true,
    isStarred: false,
    tags: ["Working Saturday"],
    accountEmail: "sarah.thompson@axis.edu",
  },
  {
    id: "em-8",
    from: "Sarah Thompson",
    fromRole: "DP Coordinator",
    fromAvatar: "ST",
    to: "Grade 11 Physics (B)",
    subject: "IA Draft Deadline - Final Reminder",
    preview: "Dear students, this is a final reminder that Physics IA Phase 2 drafts are due by...",
    body: "Dear students,\n\nThis is a final reminder that Physics IA Phase 2 drafts are due by May 29th (Thursday).\n\nPlease ensure your draft includes the complete methodology section and error analysis calculations.\n\nBest regards,\nMs. Sarah Thompson\nDP Coordinator",
    time: "May 24",
    date: "May 24",
    folder: "sent",
    isRead: true,
    isStarred: false,
    tags: ["Physics IA", "Grade 11 Physics (B)"],
    accountEmail: "sarah.thompson@axis.edu",
  },
  {
    id: "em-9",
    from: "Sarah Thompson",
    fromRole: "DP Coordinator",
    fromAvatar: "ST",
    to: "Marcus Vance",
    subject: "Draft: Department Meeting Agenda - Week 23",
    preview: "Hi Marcus, here's a draft of the agenda items I'd like to cover in our next department...",
    body: "Hi Marcus,\n\nHere's a draft of the agenda items I'd like to cover in our next department meeting:\n\n1. Lab 3 & Lab 4 booking protocol updates\n2. Unit Test Week invigilation assignments\n3. IA supervision workload distribution\n\nLet me know if you'd like to add anything.\n\nBest,\nSarah",
    time: "May 23",
    date: "May 23",
    folder: "drafts",
    isRead: true,
    isStarred: false,
    tags: ["Lab 3", "Department Meeting"],
    accountEmail: "sarah.thompson@axis.edu",
  },
  {
    id: "em-pers-1",
    from: "Netflix",
    fromRole: "Streaming Service",
    fromAvatar: "NF",
    to: "sarah.personal@gmail.com",
    subject: "Your Next Billing Cycle Reminder",
    preview: "We hope you are enjoying Netflix. This is a quick reminder that your subscription will renew...",
    body: "Hi Sarah,\n\nThis is a reminder that your monthly subscription will renew on June 1st.\n\nPayment method: Visa ending in 4321\nAmount: $15.49\n\nIf you wish to make changes to your plan or update billing info, please visit your Netflix Account page.\n\nThanks,\nNetflix Team",
    time: "Yesterday",
    date: "June 4",
    folder: "inbox",
    isRead: false,
    isStarred: false,
    accountEmail: "sarah.personal@gmail.com",
  },
  {
    id: "em-pers-2",
    from: "Aditya Chen",
    fromRole: "Family",
    fromAvatar: "AC",
    to: "sarah.personal@gmail.com",
    subject: "Family Dinner Plans - Sunday",
    preview: "Hey Sarah, check with mom about Sunday dinner. She wants to make her signature lasagna...",
    body: "Hey Sarah,\n\nJust wanted to check if you're free this Sunday for dinner at mom's place around 6 PM.\n\nShe wants to make her signature lasagna since everyone is in town. Let me know by tomorrow so she can buy the ingredients.\n\nTalk soon,\nAditya",
    time: "May 27",
    date: "May 27",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    accountEmail: "sarah.personal@gmail.com",
  }
];

// ─── Folders Configuration ──────────────────────────────────────────────

const FOLDERS: { id: EmailFolder; label: string; icon: React.ReactNode }[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.399 0V6.106c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0113.648 0c1.131.094 1.976 1.057 1.976 2.192V13.5" />
      </svg>
    ),
  },
  {
    id: "important",
    label: "Important",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    id: "sent",
    label: "Sent",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    id: "drafts",
    label: "Drafts",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.867.867 0 01-1.186-.327 13.674 13.674 0 01-1.183-3.326m3.504-7.04a24.02 24.02 0 01.135 3.52M21.75 12c0 1.608-.401 3.12-1.104 4.443" />
      </svg>
    ),
  },
  {
    id: "archived",
    label: "Archived",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

function parseRecipientsString(str: string): RecipientTarget[] {
  if (!str) return [];
  return str.split(",").map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return null;
    const found = RECIPIENT_TARGETS.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.email.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) return found;
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: trimmed,
      email: trimmed,
      category: "Faculty"
    } as RecipientTarget;
  }).filter(Boolean) as RecipientTarget[];
}

function handleRecipientInputKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  list: RecipientTarget[],
  setList: React.Dispatch<React.SetStateAction<RecipientTarget[]>>,
  searchVal: string,
  setSearchVal: React.Dispatch<React.SetStateAction<string>>
) {
  if (e.key === "Enter" || e.key === "," || e.key === ";") {
    e.preventDefault();
    const trimmed = searchVal.trim().replace(/[;,]$/, "").trim();
    if (!trimmed) return;
    if (list.some((r) => r.email.toLowerCase() === trimmed.toLowerCase())) {
      setSearchVal("");
      return;
    }
    const newRecipient: RecipientTarget = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: trimmed,
      email: trimmed,
      category: "Faculty"
    };
    setList([...list, newRecipient]);
    setSearchVal("");
  } else if (e.key === "Backspace" && !searchVal && list.length > 0) {
    setList(list.slice(0, -1));
  }
}

export function CoordinatorEmail({ theme }: { theme: Theme }) {
  const styles = getAxisTheme(theme);
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>("em-coord-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextOverlay, setContextOverlay] = useState<ContextOverlay>(null);
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);

  // Accounts States
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    { email: "sarah.thompson@axis.edu", label: "work" },
    { email: "sarah.personal@gmail.com", label: "home" },
  ]);
  const [activeAccountEmail, setActiveAccountEmail] = useState<string>("sarah.thompson@axis.edu");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Add Account Form States
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState<"work" | "home" | "custom">("work");
  const [newCustomLabel, setNewCustomLabel] = useState("");

  // Compose Modal States
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [composeTo, setComposeTo] = useState<RecipientTarget[]>([]);
  const [composeCc, setComposeCc] = useState<RecipientTarget[]>([]);
  const [composeBcc, setComposeBcc] = useState<RecipientTarget[]>([]);
  const [toSearch, setToSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [bccSearch, setBccSearch] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState(""); // Stores HTML/Rich text string
  const [composeAttachments, setComposeAttachments] = useState<string[]>([]);
  const [isDragOverAttachment, setIsDragOverAttachment] = useState(false);
  const [draftSavedStatus, setDraftSavedStatus] = useState("");

  // Autocomplete UI Suggestions states
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showCcSuggestions, setShowCcSuggestions] = useState(false);
  const [showBccSuggestions, setShowBccSuggestions] = useState(false);

  // Picker states
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.email === activeAccountEmail) || accounts[0];
  }, [accounts, activeAccountEmail]);

  // Folder count stats for active account
  const unreadCount = useMemo(() => {
    return emails.filter(
      (e) =>
        (e.accountEmail || "sarah.thompson@axis.edu") === activeAccountEmail &&
        !e.isRead &&
        e.folder === "inbox"
    ).length;
  }, [emails, activeAccountEmail]);

  const filteredEmails = useMemo(() => {
    let filtered = emails.filter((e) => {
      const emailAcc = e.accountEmail || "sarah.thompson@axis.edu";
      if (emailAcc !== activeAccountEmail) return false;
      if (activeFolder === "important") return e.isStarred;
      return e.folder === activeFolder;
    });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [emails, activeFolder, searchQuery, activeAccountEmail]);

  const selectedEmail = useMemo(() => {
    const email = emails.find((e) => e.id === selectedEmailId);
    if (!email) return null;
    const emailAcc = email.accountEmail || "sarah.thompson@axis.edu";
    return emailAcc === activeAccountEmail ? email : null;
  }, [emails, selectedEmailId, activeAccountEmail]);

  // Recipient autocompletes list filters
  const filteredToSuggestions = useMemo(() => {
    const q = toSearch.toLowerCase().trim();
    return RECIPIENT_TARGETS.filter((t) => {
      const isAlreadySelected = composeTo.some((r) => r.email.toLowerCase() === t.email.toLowerCase());
      if (isAlreadySelected) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [toSearch, composeTo]);

  const filteredCcSuggestions = useMemo(() => {
    const q = ccSearch.toLowerCase().trim();
    return RECIPIENT_TARGETS.filter((t) => {
      const isAlreadySelected = composeCc.some((r) => r.email.toLowerCase() === t.email.toLowerCase());
      if (isAlreadySelected) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [ccSearch, composeCc]);

  const filteredBccSuggestions = useMemo(() => {
    const q = bccSearch.toLowerCase().trim();
    return RECIPIENT_TARGETS.filter((t) => {
      const isAlreadySelected = composeBcc.some((r) => r.email.toLowerCase() === t.email.toLowerCase());
      if (isAlreadySelected) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [bccSearch, composeBcc]);

  // ─── Draft Auto-Saving ──────────────────────────────────────────────────
  useEffect(() => {
    if (!showComposeModal) return;

    // Check if there is any substantial content to save
    const hasContent =
      composeTo.length > 0 ||
      composeCc.length > 0 ||
      composeBcc.length > 0 ||
      composeSubject.trim() ||
      composeBody.trim() ||
      composeAttachments.length > 0;

    if (!hasContent) return;

    const timer = setTimeout(() => {
      let draftId = activeDraftId;
      if (!draftId) {
        draftId = `draft-${Date.now()}`;
        setActiveDraftId(draftId);
      }

      const draftEmail: Email = {
        id: draftId,
        from: "Ms. Sarah Thompson",
        fromRole: "DP Coordinator",
        fromAvatar: "ST",
        to: composeTo.map((r) => r.name || r.email).join(", "),
        cc: composeCc.map((r) => r.name || r.email).join(", ") || undefined,
        bcc: composeBcc.map((r) => r.name || r.email).join(", ") || undefined,
        subject: composeSubject || "(No Subject)",
        preview: composeBody.replace(/<[^>]*>/g, "").slice(0, 80) || "(No Content)",
        body: composeBody,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: "Today",
        folder: "drafts",
        isRead: true,
        isStarred: false,
        tags: composeAttachments.length > 0 ? ["draft", ...composeAttachments] : ["draft"],
        accountEmail: activeAccountEmail,
      };

      setEmails((prev) => {
        const index = prev.findIndex((e) => e.id === draftId);
        if (index > -1) {
          const next = [...prev];
          next[index] = draftEmail;
          return next;
        } else {
          return [draftEmail, ...prev];
        }
      });

      setDraftSavedStatus("Saved just now");
    }, 1000); // 1-second debounce

    setDraftSavedStatus("Saving...");
    return () => clearTimeout(timer);
  }, [composeTo, composeCc, composeBcc, composeSubject, composeBody, composeAttachments, showComposeModal, activeDraftId, activeAccountEmail]);

  // ─── Student Directory & Deep Linking ───────────────────────────────────
  useEffect(() => {
    const handleCompose = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveDraftId(null);
        setComposeTo(parseRecipientsString(customEvent.detail.to || ""));
        setComposeCc(parseRecipientsString(customEvent.detail.cc || ""));
        setComposeBcc(parseRecipientsString(customEvent.detail.bcc || ""));
        setComposeSubject(customEvent.detail.subject || "");
        setComposeBody(customEvent.detail.body || "");
        setComposeAttachments([]);
        setShowCc(!!customEvent.detail.cc);
        setShowBcc(!!customEvent.detail.bcc);
        setShowComposeModal(true);
        setDraftSavedStatus("");
      }
    };
    window.addEventListener("axis-compose-email", handleCompose);

    const win = window as typeof window & {
      pendingComposeEmail?: { to: string; subject: string; body: string };
    };
    if (typeof window !== "undefined" && win.pendingComposeEmail) {
      const details = win.pendingComposeEmail;
      setActiveDraftId(null);
      setComposeTo(parseRecipientsString(details.to || ""));
      setComposeCc([]);
      setComposeBcc([]);
      setComposeSubject(details.subject || "");
      setComposeBody(details.body || "");
      setComposeAttachments([]);
      setShowCc(false);
      setShowBcc(false);
      setShowComposeModal(true);
      setDraftSavedStatus("");
      delete win.pendingComposeEmail;
    }

    return () => window.removeEventListener("axis-compose-email", handleCompose);
  }, []);

  // Sync Rich Text Editor content editable with composeBody state
  useEffect(() => {
    if (showComposeModal && editorRef.current) {
      if (editorRef.current.innerHTML !== composeBody) {
        editorRef.current.innerHTML = composeBody;
      }
    }
  }, [showComposeModal, composeBody]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((em) => (em.id === id ? { ...em, isStarred: !em.isStarred } : em))
    );
  };

  const handleArchive = (id: string) => {
    setEmails((prev) =>
      prev.map((em) => (em.id === id ? { ...em, folder: "archived" as EmailFolder } : em))
    );
    setSelectedEmailId(null);
    triggerToast("Email archived.");
  };

  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;

    const newAcc: ConnectedAccount = {
      email: newEmail,
      label: newLabel,
      customLabelName: newLabel === "custom" ? newCustomLabel || "Custom" : undefined,
    };

    setAccounts((prev) => [...prev, newAcc]);

    const welcomeEmail: Email = {
      id: `em-welcome-${Date.now()}`,
      from: "Axis System",
      fromRole: "Notification Services",
      fromAvatar: "AX",
      to: newEmail,
      subject: `Welcome to your connected inbox (${newAcc.label === "custom" ? newAcc.customLabelName : newAcc.label})`,
      preview: `Your email account ${newEmail} has been successfully connected to Axis. You can now view messages...`,
      body: `Hello Sarah,\n\nYour email account (${newEmail}) has been successfully integrated into the Axis Coordinator Portal.\n\nYou can now view messages and contextualize planning resources directly in real-time.\n\nRegards,\nAxis Admin System`,
      time: "Just Now",
      date: "Today",
      folder: "inbox",
      isRead: false,
      isStarred: true,
      accountEmail: newEmail,
      tags: ["Axis Connect"],
    };

    setEmails((prev) => [welcomeEmail, ...prev]);
    setActiveAccountEmail(newEmail);
    setSelectedEmailId(welcomeEmail.id);

    setNewEmail("");
    setNewLabel("work");
    setNewCustomLabel("");
    setIsAddAccountOpen(false);
    triggerToast("Inbox connected successfully.");
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (composeTo.length === 0 || !composeSubject.trim() || !composeBody.trim()) return;

    const newSentEmail: Email = {
      id: `em-sent-${Date.now()}`,
      from: "Ms. Sarah Thompson",
      fromRole: "DP Coordinator",
      fromAvatar: "ST",
      to: composeTo.map((r) => r.name || r.email).join(", "),
      cc: composeCc.map((r) => r.name || r.email).join(", ") || undefined,
      bcc: composeBcc.map((r) => r.name || r.email).join(", ") || undefined,
      subject: composeSubject,
      preview: composeBody.replace(/<[^>]*>/g, "").slice(0, 80),
      body: composeBody,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: "Today",
      folder: "sent",
      isRead: true,
      isStarred: false,
      tags: composeAttachments.length > 0 ? [...composeAttachments] : [],
      accountEmail: activeAccountEmail,
    };

    setEmails((prev) => {
      // Remove the draft from emails if we are sending it
      const filtered = activeDraftId ? prev.filter((em) => em.id !== activeDraftId) : prev;
      return [newSentEmail, ...filtered];
    });

    setShowComposeModal(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setToSearch("");
    setCcSearch("");
    setBccSearch("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachments([]);
    setActiveDraftId(null);
    triggerToast("Email dispatched successfully.");
  };

  const handleOpenComposeDraft = () => {
    setActiveDraftId(null);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setToSearch("");
    setCcSearch("");
    setBccSearch("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    setShowComposeModal(true);
    setDraftSavedStatus("");
  };

  const handleDiscardDraft = () => {
    if (activeDraftId) {
      setEmails((prev) => prev.filter((e) => e.id !== activeDraftId));
      setSelectedEmailId(null);
    }
    setShowComposeModal(false);
    setActiveDraftId(null);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setToSearch("");
    setCcSearch("");
    setBccSearch("");
    setComposeSubject("");
    setComposeBody("");
    setComposeAttachments([]);
    triggerToast("Draft discarded.");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAttachment(true);
  };

  const handleDragLeave = () => {
    setIsDragOverAttachment(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverAttachment(false);
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        if (payload && payload.title) {
          if (!composeAttachments.includes(payload.title)) {
            setComposeAttachments((prev) => [...prev, payload.title]);
            triggerToast(`Linked "${payload.title}" as email attachment.`);
          }
        }
      }
    } catch (err) {
      console.error("Error parsing dropped attachment:", err);
    }
  };

  const handleOpenDraft = (draft: Email) => {
    setActiveDraftId(draft.id);
    setComposeTo(parseRecipientsString(draft.to));
    setComposeCc(parseRecipientsString(draft.cc || ""));
    setComposeBcc(parseRecipientsString(draft.bcc || ""));
    setToSearch("");
    setCcSearch("");
    setBccSearch("");
    setComposeSubject(draft.subject);
    setComposeBody(draft.body);
    setComposeAttachments(draft.tags?.filter((t) => t !== "draft") || []);
    setShowCc(!!draft.cc);
    setShowBcc(!!draft.bcc);
    setShowComposeModal(true);
    setDraftSavedStatus("Draft loaded");
  };

  // Inline Attached Document handling
  const handleSelectResource = (doc: { title: string }) => {
    if (!composeAttachments.includes(doc.title)) {
      setComposeAttachments((prev) => [...prev, doc.title]);
    }
    setIsPickerOpen(false);
  };

  const handleRemoveAttachment = (fileName: string) => {
    setComposeAttachments((prev) => prev.filter((name) => name !== fileName));
  };

  const handleFileUploadTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.files[0].name;
      if (!composeAttachments.includes(name)) {
        setComposeAttachments((prev) => [...prev, name]);
      }
    }
  };

  // Rich Text Editor command execution
  const execEditorCommand = (command: string, value: string = "") => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        setComposeBody(editorRef.current.innerHTML);
      }
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyword highlighting
  const renderHighlightedBody = (text: string) => {
    const keywords = Object.keys(ENTITY_CONTEXT);
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    if (sortedKeywords.length === 0) return text;

    const regex = new RegExp(`\\b(${sortedKeywords.map((k) => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const match = sortedKeywords.find((k) => k.toLowerCase() === part.toLowerCase());
      if (match) {
        return (
          <button
            key={index}
            onClick={() => setContextOverlay({ entity: match, ...ENTITY_CONTEXT[match] })}
            className="text-cyan-400 font-bold border-b border-dashed border-cyan-400 hover:text-cyan-300 hover:border-cyan-300 transition-colors pointer-events-auto"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className={`relative flex flex-col lg:flex-row h-[calc(100vh-140px)] w-full border backdrop-blur-xl overflow-hidden ${AXIS_TOKENS.borderRadius.widget} ${AXIS_TOKENS.shadows.card} ${styles.cardBg}`}>

      {/* 1. Left Folders Navigation */}
      <div className={`w-full lg:w-64 flex flex-col border-b lg:border-b-0 lg:border-r ${styles.border} ${theme === "light" ? "bg-black/[0.01]" : "bg-white/[0.01]"} shrink-0`}>
        {/* Connected Accounts Dropdown */}
        <div className={`p-4 border-b ${styles.border} relative`}>
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left border transition-all ${
              theme === "light"
                ? "bg-black/[0.02] border-black/[0.08] hover:bg-black/[0.04]"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className={`text-[9px] uppercase tracking-wider font-extrabold ${theme === "light" ? "text-black/40" : "text-white/40"}`}>Active Inbox</span>
              <span className={`text-xs truncate font-bold ${theme === "light" ? "text-black/80" : "text-white/90"}`}>{activeAccount.email}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                activeAccount.label === "work" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                activeAccount.label === "home" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              }`}>
                {activeAccount.label === "custom" ? (activeAccount.customLabelName || "custom") : activeAccount.label}
              </span>
              <svg className={`size-3.5 ${theme === "light" ? "text-black/40" : "text-white/50"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>

          {/* Accounts Switcher Popover */}
          <AnimatePresence>
            {isAccountDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAccountDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`absolute top-[calc(100%-4px)] left-4 right-4 z-50 rounded-xl border p-1.5 flex flex-col gap-0.5 shadow-2xl ${
                    theme === "light" ? "bg-white border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
                  }`}
                >
                  {accounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        setActiveAccountEmail(acc.email);
                        setIsAccountDropdownOpen(false);
                        setSelectedEmailId(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                        activeAccountEmail === acc.email
                          ? theme === "light" ? "bg-black/[0.05]" : "bg-white/[0.08]"
                          : theme === "light" ? "hover:bg-black/[0.02]" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-bold truncate">{acc.email}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                        acc.label === "work" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                        acc.label === "home" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                        {acc.label === "custom" ? (acc.customLabelName || "custom") : acc.label}
                      </span>
                    </button>
                  ))}
                  <div className={`border-t my-1 ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.08]"}`} />
                  <button
                    onClick={() => {
                      setIsAddAccountOpen(true);
                      setIsAccountDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      theme === "light"
                        ? "text-black/70 hover:text-black bg-black/[0.02] hover:bg-black/[0.05] border border-black/10"
                        : "text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]"
                    }`}
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Connect Account
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Compose Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={handleOpenComposeDraft}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all ${styles.buttonPrimary}`}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Compose Message
          </button>
        </div>

        {/* Folders list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {FOLDERS.map((folder) => {
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolder(folder.id);
                  setSelectedEmailId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? theme === "light" ? "bg-black/[0.06] text-black" : "bg-white/[0.08] text-white"
                    : theme === "light" ? "text-black/60 hover:text-black hover:bg-black/[0.02]" : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-cyan-400" : theme === "light" ? "text-black/35" : "text-white/40"}>
                    {folder.icon}
                  </span>
                  <span>{folder.label}</span>
                </div>
                {folder.id === "inbox" && unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                    theme === "light" ? "bg-cyan-600 text-white" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Email List Pane */}
      <div className={`w-full lg:w-80 flex flex-col border-b lg:border-b-0 lg:border-r ${styles.border} bg-white/[0.005] shrink-0`}>
        {/* Search */}
        <div className={`p-4 border-b ${styles.border}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:outline-none transition-all ${
                theme === "light"
                  ? "bg-black/[0.02] border border-black/[0.08] text-black placeholder:text-black/30 focus:border-black/25"
                  : "bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-white/20"
              }`}
            />
            <svg className={`absolute left-2.5 top-2.5 size-3.5 ${theme === "light" ? "text-black/30" : "text-white/30"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {/* Email Cards */}
        <div className="flex-grow overflow-y-auto p-3 space-y-2.5 scrollbar-none">
          {filteredEmails.length === 0 ? (
            <div className={`text-center py-12 text-xs font-semibold ${theme === "light" ? "text-black/25" : "text-white/30"}`}>No emails found</div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = selectedEmailId === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    if (email.folder === "drafts") {
                      handleOpenDraft(email);
                    } else {
                      handleSelectEmail(email.id);
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? theme === "light" ? "bg-black/[0.04] border-black/20" : "bg-white/[0.07] border-white/20"
                      : theme === "light" ? "bg-white border-black/[0.04] hover:bg-black/[0.01]" : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        theme === "light" ? "bg-black/5 text-black/70" : "bg-white/10 text-white"
                      }`}>
                        {email.fromAvatar}
                      </div>
                      <span className={`text-[11px] truncate ${
                        !email.isRead
                          ? theme === "light" ? "font-bold text-black" : "font-extrabold text-cyan-400"
                          : "font-semibold text-white/90"
                      }`}>
                        {email.from}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold shrink-0 ${theme === "light" ? "text-black/35" : "text-white/30"}`}>{email.time}</span>
                  </div>

                  <h4 className={`text-xs mb-1 truncate ${
                    !email.isRead
                      ? theme === "light" ? "font-bold text-black" : "font-extrabold text-white"
                      : "font-medium text-white/80"
                  }`}>
                    {email.subject}
                  </h4>
                  <p className={`text-[10px] line-clamp-2 leading-relaxed mb-2.5 font-medium ${theme === "light" ? "text-black/45" : "text-white/40"}`}>
                    {email.preview}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {email.tags?.map((tag) => (
                        <span key={tag} className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          theme === "light"
                            ? "bg-black/[0.03] border-black/[0.04] text-black/50"
                            : "bg-white/[0.04] border-white/[0.02] text-white/45"
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {email.folder !== "drafts" && (
                      <button
                        onClick={(e) => handleToggleStar(email.id, e)}
                        className={`hover:text-amber-400 transition-colors p-0.5 shrink-0 ${
                          email.isStarred ? "text-amber-400" : theme === "light" ? "text-black/20" : "text-white/30"
                        }`}
                      >
                        <svg className={`size-3.5 ${email.isStarred ? "fill-amber-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Right Email Detailed View Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C]/5 relative">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className={`p-4 border-b ${styles.border} flex items-center justify-between ${theme === "light" ? "bg-black/[0.005]" : "bg-white/[0.01]"}`}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleArchive(selectedEmail.id)}
                  className={`p-1.5 rounded-lg transition-all ${
                    theme === "light" ? "hover:bg-black/5 text-black/40 hover:text-black" : "hover:bg-white/5 text-white/50 hover:text-white"
                  }`}
                  title="Archive"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const win = window as typeof window & {
                        pendingContextMeeting?: { title: string; description: string; date: string };
                      };
                      win.pendingContextMeeting = {
                        title: `Follow-up: ${selectedEmail.subject}`,
                        description: `Meeting to review: "${selectedEmail.preview}"`,
                        date: "Today"
                      };
                      window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "meetings" } }));
                    }
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                    theme === "light"
                      ? "bg-white border-black/10 hover:bg-black/[0.02] text-black"
                      : "bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.08] text-white"
                  }`}
                >
                  Convert to Meeting
                </button>
              </div>
            </div>

            {/* Email Header */}
            <div className={`p-5 border-b ${styles.border} flex items-start gap-3.5`}>
              <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                theme === "light" ? "bg-black/5 text-black/70" : "bg-white/10 text-white"
              }`}>
                {selectedEmail.fromAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className={`text-xs font-bold ${theme === "light" ? "text-black/85" : "text-white/95"}`}>{selectedEmail.from}</h2>
                  <span className={`text-[9px] font-bold ${theme === "light" ? "text-black/30" : "text-white/40"}`}>{selectedEmail.date} • {selectedEmail.time}</span>
                </div>
                <div className={`text-[10px] font-medium ${theme === "light" ? "text-black/45" : "text-white/50"}`}>
                  Sender: {selectedEmail.fromRole}
                </div>
                <div className={`text-[10px] font-medium ${theme === "light" ? "text-black/35" : "text-white/40"}`}>
                  To: {selectedEmail.to}
                </div>
                {selectedEmail.cc && (
                  <div className={`text-[10px] font-medium ${theme === "light" ? "text-black/35" : "text-white/40"}`}>
                    CC: {selectedEmail.cc}
                  </div>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <h1 className={`text-sm font-bold leading-snug tracking-wide border-b pb-3 ${
                theme === "light" ? "text-black border-black/[0.04]" : "text-white border-white/[0.03]"
              }`}>
                {selectedEmail.subject}
              </h1>
              <div className={`text-xs leading-relaxed whitespace-pre-wrap space-y-4 font-medium ${
                theme === "light" ? "text-black/70" : "text-white/70"
              }`}>
                {renderHighlightedBody(selectedEmail.body)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center p-12 text-center">
            <span className={`text-xs font-extrabold uppercase tracking-widest ${theme === "light" ? "text-black/20" : "text-white/20"}`}>Select an email to view details</span>
          </div>
        )}

        {/* 4. Context Overlay Drawer (Slide-over overlay, absolute positioned to prevent layout shift) */}
        <AnimatePresence>
          {contextOverlay && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={`absolute right-0 top-0 bottom-0 z-30 w-80 border-l shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden ${
                theme === "light"
                  ? "bg-white/98 border-black/10 text-black shadow-[-8px_0_32px_rgba(0,0,0,0.06)]"
                  : "bg-[#0E0E10]/98 border-white/10 text-white shadow-[-8px_0_32px_rgba(0,0,0,0.5)]"
              }`}
            >
              <div className={`p-4 border-b flex items-center justify-between ${theme === "light" ? "border-black/[0.06]" : "border-white/[0.08]"}`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme === "light" ? "text-black/50" : "text-white/80"}`}>Related Context</span>
                <button
                  onClick={() => setContextOverlay(null)}
                  className={`p-1 rounded-lg transition-all ${
                    theme === "light" ? "hover:bg-black/5 text-black/40 hover:text-black" : "hover:bg-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className={`p-4 border rounded-xl ${
                  theme === "light" ? "bg-black/[0.01] border-black/[0.06]" : "bg-white/[0.02] border-white/[0.06]"
                }`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xs font-bold">{contextOverlay.title}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded font-extrabold uppercase tracking-wider leading-none ${
                      theme === "light"
                        ? "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    }`}>
                      {contextOverlay.type}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {contextOverlay.details.map((detail, idx) => (
                      <p key={idx} className={`text-[10px] font-medium leading-relaxed ${theme === "light" ? "text-black/50" : "text-white/60"}`}>
                        • {detail}
                      </p>
                    ))}
                  </div>
                  {contextOverlay.actionLabel && (
                    <button
                      onClick={() => {
                        const type = contextOverlay.actionType;
                        if (type === "create-event") {
                          if (typeof window !== "undefined") {
                            const win = window as typeof window & {
                              pendingContextEvent?: { id: string; title: string; description: string; date: string; type: string; category: string; location: string };
                            };
                            win.pendingContextEvent = {
                              id: "evt-bakesale",
                              title: "Grade 12 Bake Sale",
                              description: "Grade 12 Bake Sale event referenced in emails.",
                              date: "2026-09-18",
                              type: "event",
                              category: "school",
                              location: "Central Courtyard"
                            };
                          }
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "events" } }));
                        } else if (type === "view-tok-resources") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "resources" } }));
                        } else if (type === "navigate-map") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "map" } }));
                        } else if (type === "navigate-students") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "students" } }));
                        } else if (type === "navigate-resources") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "resources" } }));
                        } else if (type === "navigate-meetings") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "meetings" } }));
                        } else if (type === "navigate-schedule") {
                          window.dispatchEvent(new CustomEvent("axis-navigate-tab", { detail: { tab: "schedule" } }));
                        }
                        setContextOverlay(null);
                      }}
                      className={`w-full mt-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                        theme === "light" ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {contextOverlay.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Compose / Edit Draft Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-sm">
            <div className="fixed inset-0 cursor-default" onClick={handleDiscardDraft} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full max-w-2xl border p-5 md:p-6 rounded-2xl shadow-2xl z-10 flex flex-col gap-4 transition-all duration-200 axis-drop-target ${
                isDragOverAttachment ? "ring-2 ring-cyan-400 border-cyan-400/50 scale-[1.01]" : ""
              } ${
                theme === "light" ? "bg-white border-black/10 text-black" : "bg-[#0E0E10] border-white/10 text-white"
              }`}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between border-b pb-3 ${theme === "light" ? "border-black/[0.08]" : "border-white/10"}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {activeDraftId ? "Edit Saved Draft" : "New Axis Message"}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium ${theme === "light" ? "text-black/40" : "text-white/40"}`}>
                    {draftSavedStatus}
                  </span>
                  <button onClick={handleDiscardDraft} className="text-white/40 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/5 transition-all">✕</button>
                </div>
              </div>

              {/* Composition Form */}
              <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs font-bold border-none flex-1 flex flex-col min-h-0">
                {/* To Field with suggestions */}
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Recipient (To)</label>
                    <div className="flex gap-2">
                      {!showCc && (
                        <button type="button" onClick={() => setShowCc(true)} className="text-[9px] font-bold text-cyan-400 hover:underline">+ CC</button>
                      )}
                      {!showBcc && (
                        <button type="button" onClick={() => setShowBcc(true)} className="text-[9px] font-bold text-cyan-400 hover:underline">+ BCC</button>
                      )}
                    </div>
                  </div>
                  <div className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border transition-all ${
                    theme === "light"
                      ? "bg-black/[0.01] border-black/[0.08] text-black focus-within:border-cyan-600"
                      : "bg-zinc-950 border-zinc-800 text-white focus-within:border-cyan-500"
                  }`}>
                    {composeTo.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                          theme === "light" ? "bg-black/5 text-black hover:bg-black/10" : "bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <span>{recipient.name}</span>
                        <button
                          type="button"
                          onClick={() => setComposeTo(composeTo.filter((r) => r.id !== recipient.id))}
                          className="text-white/40 hover:text-white font-bold ml-0.5 text-xs select-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      required={composeTo.length === 0}
                      value={toSearch}
                      onFocus={() => setShowToSuggestions(true)}
                      onKeyDown={(e) => handleRecipientInputKeyDown(e, composeTo, setComposeTo, toSearch, setToSearch)}
                      onChange={(e) => { setToSearch(e.target.value); setShowToSuggestions(true); }}
                      placeholder={composeTo.length === 0 ? "Search groups, departments or enter email..." : ""}
                      className={`flex-grow min-w-[120px] bg-transparent border-none outline-none text-xs ${
                        theme === "light" ? "text-black placeholder-black/35" : "text-white placeholder-white/35"
                      }`}
                    />
                  </div>
                  {showToSuggestions && filteredToSuggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowToSuggestions(false)} />
                      <div className={`absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto z-40 border rounded-xl p-1 shadow-2xl ${
                        theme === "light" ? "bg-white border-black/10" : "bg-[#0A0A0C] border-zinc-850"
                      }`}>
                        {filteredToSuggestions.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              if (!composeTo.some((r) => r.email.toLowerCase() === t.email.toLowerCase())) {
                                setComposeTo([...composeTo, t]);
                              }
                              setToSearch("");
                              setShowToSuggestions(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                              theme === "light" ? "hover:bg-black/5 text-black" : "hover:bg-white/5 text-white"
                            }`}
                          >
                            <span className="font-semibold">{t.name}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              theme === "light" ? "bg-black/5 text-black/40" : "bg-white/5 text-white/40"
                            }`}>{t.category}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* CC Line */}
                {showCc && (
                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center">
                      <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Carbon Copy (CC)</label>
                      <button type="button" onClick={() => { setShowCc(false); setComposeCc([]); }} className="text-[9px] font-bold text-red-400 hover:underline">Remove</button>
                    </div>
                    <div className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      theme === "light"
                        ? "bg-black/[0.01] border-black/[0.08] text-black focus-within:border-cyan-600"
                        : "bg-zinc-950 border-zinc-800 text-white focus-within:border-cyan-500"
                    }`}>
                      {composeCc.map((recipient) => (
                        <div
                          key={recipient.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                            theme === "light" ? "bg-black/5 text-black hover:bg-black/10" : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          <span>{recipient.name}</span>
                          <button
                            type="button"
                            onClick={() => setComposeCc(composeCc.filter((r) => r.id !== recipient.id))}
                            className="text-white/40 hover:text-white font-bold ml-0.5 text-xs select-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={ccSearch}
                        onFocus={() => setShowCcSuggestions(true)}
                        onKeyDown={(e) => handleRecipientInputKeyDown(e, composeCc, setComposeCc, ccSearch, setCcSearch)}
                        onChange={(e) => { setCcSearch(e.target.value); setShowCcSuggestions(true); }}
                        placeholder={composeCc.length === 0 ? "Enter CC recipient..." : ""}
                        className={`flex-grow min-w-[120px] bg-transparent border-none outline-none text-xs ${
                          theme === "light" ? "text-black placeholder-black/35" : "text-white placeholder-white/35"
                        }`}
                      />
                    </div>
                    {showCcSuggestions && filteredCcSuggestions.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowCcSuggestions(false)} />
                        <div className={`absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto z-40 border rounded-xl p-1 shadow-2xl ${
                          theme === "light" ? "bg-white border-black/10" : "bg-[#0A0A0C] border-zinc-850"
                        }`}>
                          {filteredCcSuggestions.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                if (!composeCc.some((r) => r.email.toLowerCase() === t.email.toLowerCase())) {
                                  setComposeCc([...composeCc, t]);
                                }
                                setCcSearch("");
                                setShowCcSuggestions(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                                theme === "light" ? "hover:bg-black/5 text-black" : "hover:bg-white/5 text-white"
                              }`}
                            >
                              <span className="font-semibold">{t.name}</span>
                              <span className="text-[8px] uppercase tracking-widest text-white/30">{t.category}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* BCC Line */}
                {showBcc && (
                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center">
                      <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Blind Carbon Copy (BCC)</label>
                      <button type="button" onClick={() => { setShowBcc(false); setComposeBcc([]); }} className="text-[9px] font-bold text-red-400 hover:underline">Remove</button>
                    </div>
                    <div className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      theme === "light"
                        ? "bg-black/[0.01] border-black/[0.08] text-black focus-within:border-cyan-600"
                        : "bg-zinc-950 border-zinc-800 text-white focus-within:border-cyan-500"
                    }`}>
                      {composeBcc.map((recipient) => (
                        <div
                          key={recipient.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                            theme === "light" ? "bg-black/5 text-black hover:bg-black/10" : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          <span>{recipient.name}</span>
                          <button
                            type="button"
                            onClick={() => setComposeBcc(composeBcc.filter((r) => r.id !== recipient.id))}
                            className="text-white/40 hover:text-white font-bold ml-0.5 text-xs select-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={bccSearch}
                        onFocus={() => setShowBccSuggestions(true)}
                        onKeyDown={(e) => handleRecipientInputKeyDown(e, composeBcc, setComposeBcc, bccSearch, setBccSearch)}
                        onChange={(e) => { setBccSearch(e.target.value); setShowBccSuggestions(true); }}
                        placeholder={composeBcc.length === 0 ? "Enter BCC recipient..." : ""}
                        className={`flex-grow min-w-[120px] bg-transparent border-none outline-none text-xs ${
                          theme === "light" ? "text-black placeholder-black/35" : "text-white placeholder-white/35"
                        }`}
                      />
                    </div>
                    {showBccSuggestions && filteredBccSuggestions.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowBccSuggestions(false)} />
                        <div className={`absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto z-40 border rounded-xl p-1 shadow-2xl ${
                          theme === "light" ? "bg-white border-black/10" : "bg-[#0A0A0C] border-zinc-850"
                        }`}>
                          {filteredBccSuggestions.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                if (!composeBcc.some((r) => r.email.toLowerCase() === t.email.toLowerCase())) {
                                  setComposeBcc([...composeBcc, t]);
                                }
                                setBccSearch("");
                                setShowBccSuggestions(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                                theme === "light" ? "hover:bg-black/5 text-black" : "hover:bg-white/5 text-white"
                              }`}
                            >
                              <span className="font-semibold">{t.name}</span>
                              <span className="text-[8px] uppercase tracking-widest text-white/30">{t.category}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Subject field */}
                <div className="space-y-1">
                  <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Subject</label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="e.g. Extended Essay status review"
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                      theme === "light"
                        ? "bg-black/[0.01] border-black/[0.08] text-black focus:border-cyan-600"
                        : "bg-zinc-950 border-zinc-800 text-white focus:border-cyan-500"
                    }`}
                  />
                </div>

                {/* Rich text editor with formatting toolbar */}
                <div className="space-y-1 flex-grow flex flex-col min-h-0">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Message Body</label>
                    {/* Rich text editing keys */}
                    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => execEditorCommand("bold")}
                        className="size-5 flex items-center justify-center font-bold text-xs rounded hover:bg-white/10 transition-colors"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("italic")}
                        className="size-5 flex items-center justify-center italic text-xs rounded hover:bg-white/10 transition-colors"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("underline")}
                        className="size-5 flex items-center justify-center underline text-xs rounded hover:bg-white/10 transition-colors"
                        title="Underline"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("insertUnorderedList")}
                        className="size-5 flex items-center justify-center font-mono text-[9px] rounded hover:bg-white/10 transition-colors"
                        title="Bulleted List"
                      >
                        •—
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("formatBlock", "blockquote")}
                        className="size-5 flex items-center justify-center font-serif text-[10px] rounded hover:bg-white/10 transition-colors"
                        title="Blockquote"
                      >
                        ❞
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("removeFormat")}
                        className="size-5 flex items-center justify-center font-mono text-[8px] rounded hover:bg-white/10 transition-colors text-red-400"
                        title="Clear Formatting"
                      >
                        ⌫
                      </button>
                    </div>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setComposeBody(e.currentTarget.innerHTML)}
                    className={`w-full min-h-[140px] max-h-[260px] overflow-y-auto px-4 py-3 text-xs rounded-xl border outline-none transition-all font-medium ${
                      theme === "light"
                        ? "bg-black/[0.01] border-black/[0.08] text-black focus:border-cyan-600"
                        : "bg-zinc-950 border-zinc-800 text-white focus:border-cyan-500"
                    }`}
                  />
                </div>

                {/* Attachments Section */}
                <div className={`space-y-1.5 pt-2.5 border-t ${theme === "light" ? "border-black/[0.08]" : "border-white/[0.04]"}`}>
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-zinc-500"}`}>Attached Resources</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleFileUploadTrigger}
                        className="text-[10px] font-extrabold text-cyan-400 hover:underline"
                      >
                        + Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        className="text-[10px] font-extrabold text-cyan-400 hover:underline"
                      >
                        + Choose from Connected Resources
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {composeAttachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {composeAttachments.map((file) => (
                        <div key={file} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-950/20 border border-cyan-500/25 text-cyan-400 text-[10px] font-extrabold w-fit">
                          <span>📄 {file}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(file)}
                            className="text-white/40 hover:text-red-400 font-extrabold text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[10px] italic ${theme === "light" ? "text-black/25" : "text-white/30"}`}>No attachments linked</span>
                  )}
                </div>

                {/* Actions line */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                      theme === "light"
                        ? "border-black/10 bg-black/[0.02] hover:bg-black/[0.04] text-black/70 hover:text-black"
                        : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white"
                    }`}
                  >
                    Discard Draft
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md ${
                      theme === "light"
                        ? "bg-cyan-600 text-white hover:bg-cyan-500"
                        : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    }`}
                  >
                    Send Email
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ResourcePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectResource}
        theme={theme}
        contextText={`${composeSubject} ${composeBody.replace(/<[^>]*>/g, "")}`}
      />

      {/* Connect Account Modal */}
      <AnimatePresence>
        {isAddAccountOpen && (
          <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm border rounded-xl overflow-hidden shadow-2xl ${
                theme === "light" ? "bg-white border-black/10 text-black" : "bg-zinc-900 border-white/10 text-white"
              }`}
            >
              <div className={`px-5 py-4 border-b flex items-center justify-between ${theme === "light" ? "border-black/[0.08]" : "border-white/10"}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Connect New Inbox</h3>
                <button onClick={() => setIsAddAccountOpen(false)} className="text-white/40 hover:text-white text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleConnectAccount} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-white/50"}`}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. personal@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                      theme === "light"
                        ? "bg-black/[0.02] border border-black/[0.08] text-black focus:border-cyan-600"
                        : "bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-white/50"}`}>Tag Label</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["work", "home", "custom"] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewLabel(lbl)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg capitalize border transition-all ${
                          newLabel === lbl
                            ? theme === "light" ? "bg-black border-black text-white" : "bg-white text-zinc-900 border-white"
                            : theme === "light" ? "bg-black/[0.02] text-black/60 border-black/10 hover:bg-black/[0.05]" : "bg-white/[0.03] text-white/70 border-white/[0.06] hover:bg-white/[0.05]"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {newLabel === "custom" && (
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-black/40" : "text-white/50"}`}>Custom Label Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advisory Board"
                      value={newCustomLabel}
                      onChange={(e) => setNewCustomLabel(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                        theme === "light"
                          ? "bg-black/[0.02] border border-black/[0.08] text-black focus:border-cyan-600"
                          : "bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20"
                      }`}
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(false)}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                      theme === "light"
                        ? "border-black/10 bg-black/[0.02] hover:bg-black/[0.04] text-black/70 hover:text-black"
                        : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md ${
                      theme === "light"
                        ? "bg-cyan-600 text-white hover:bg-cyan-500"
                        : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                    }`}
                  >
                    Connect
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: 30, x: "-50%" }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-10 left-1/2 z-[260] border px-5 py-3 rounded-full text-xs flex items-center gap-2.5 backdrop-blur-md shadow-2xl ${
              theme === "light"
                ? "bg-white border-black/10 text-black shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                : "bg-[#0E0E10] border-cyan-500/30 text-white/90 shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
            }`}
          >
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold tracking-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
