"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────

type EmailFolder = "inbox" | "important" | "sent" | "drafts" | "announcements" | "archived";

type Email = {
  id: string;
  from: string;
  fromRole: string;
  fromAvatar: string;
  to: string;
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
  accountEmail?: string; // Target email account
};

type ConnectedAccount = {
  email: string;
  label: "work" | "home" | "custom";
  customLabelName?: string;
};

type ContextOverlay = {
  entity: string;
  title: string;
  type: "room" | "class" | "teacher" | "event" | "department";
  details: string[];
  actionLabel?: string;
} | null;

// ─── Demo Data ──────────────────────────────────────────────────────────

const EMAILS: Email[] = [
  {
    id: "em-1",
    from: "Marcus Vance",
    fromRole: "Head of Science",
    fromAvatar: "MV",
    to: "aarav.chen@axis.edu",
    subject: "Lab 3 Schedule Conflict  -  Period 5 Resolution",
    preview: "Hi Aarav, I wanted to follow up on our coordination call regarding the Lab 3 booking collision...",
    body: `Hi Aarav,

I wanted to follow up on our coordination call regarding the Lab 3 booking collision during Period 5.

After reviewing the timetable with the coordination team, we've confirmed that Lab 3 will be available for your Grade 11 Physics (B) revision session on Thursday. The collision experiment has been moved to Lab 4.

Please update your lesson plan accordingly and confirm with the students. Sarah Chen has also been notified about the room change for her guidance sessions.

Let me know if you need anything else.

Best regards,
Marcus Vance
Head of Science Department`,
    time: "10:42 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: true,
    tags: ["Lab 3", "Period 5", "Grade 11 Physics (B)"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-2",
    from: "Sarah Chen",
    fromRole: "Guidance Counselor",
    fromAvatar: "SC",
    to: "aarav.chen@axis.edu",
    subject: "Re: Chloe Vance  -  Workload Concern",
    preview: "Thanks for flagging this Aarav. I've reviewed her attendance pattern and IA submission timeline...",
    body: `Thanks for flagging this Aarav.

I've reviewed her attendance pattern and IA submission timeline. The pattern suggests she may be experiencing some academic overload  -  particularly with the Physics IA and Extended Essay deadlines overlapping.

I've scheduled a support meeting with Chloe for Thursday during her free period. Could you provide a brief summary of her Physics IA progress? This would help me contextualize during our conversation.

Also, I noticed Room 102 is available after Period 3 if you'd like to join the session briefly.

Warm regards,
Sarah Chen
Student Guidance & Wellbeing`,
    time: "09:15 AM",
    date: "Today",
    folder: "inbox",
    isRead: false,
    isStarred: false,
    tags: ["Room 102", "Physics IA"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-3",
    from: "Principal's Office",
    fromRole: "Administration",
    fromAvatar: "PO",
    to: "All Teaching Staff",
    subject: "PTM Saturday  -  Schedule & Guidelines",
    preview: "Dear colleagues, this is a reminder that the upcoming Parent-Teacher Meeting is scheduled for...",
    body: `Dear colleagues,

This is a reminder that the upcoming Parent-Teacher Meeting is scheduled for Saturday, May 24th, from 9:00 AM to 1:00 PM.

Key guidelines:
• 15-minute appointment slots per parent
• Individual student progress reports must be prepared by Friday, May 23rd
• Attendance flags should be reviewed and documented
• Room assignments will be shared by Thursday

Department Heads: please ensure all teachers in your department have completed their progress documentation.

Grade 11 and Grade 12 parents have been given priority slots. Grade 10 parents will be accommodated in the afternoon if needed.

Thank you for your preparation and professionalism.

Regards,
Office of the Principal`,
    time: "Yesterday",
    date: "May 28",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    tags: ["PTM"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-4",
    from: "Exam Coordination",
    fromRole: "Academic Office",
    fromAvatar: "EC",
    to: "Science Department",
    subject: "Unit Test Week  -  Question Paper Submission Reminder",
    preview: "Reminder: All question papers for the upcoming Unit Test Week (May 18–22) must be submitted by...",
    body: `Reminder: All question papers for the upcoming Unit Test Week (May 18–22) must be submitted by Thursday, May 15th, COB.

Submission requirements:
• Digital copy to examcoord@school.edu
• Physical copy to the Exam Coordination Office (Room 108)
• Include marking scheme and answer key
• Invigilation roster has been confirmed  -  please check your assigned slots

Physics Department:
- Grade 11 Physics (B): Slot A  -  Monday, May 18, Period 1–2
- Grade 12 Adv Physics (A): Slot C  -  Wednesday, May 20, Period 3–4

Contact the Exam Coordination team for any scheduling concerns.

Regards,
Exam Coordination Office`,
    time: "May 27",
    date: "May 27",
    folder: "inbox",
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    tags: ["Exam Week"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-5",
    from: "Dilan Patel",
    fromRole: "Grade 11 Student",
    fromAvatar: "DP",
    to: "aarav.chen@axis.edu",
    subject: "Physics IA  -  Air Resistance Calculation Query",
    preview: "Dear Mr. Chen, I wanted to confirm whether the air resistance model needs to account for...",
    body: `Dear Mr. Chen,

I wanted to confirm whether the air resistance model needs to account for variable drag coefficients in the error analysis section of the Physics IA.

I've reviewed page 4 of the guidelines as you suggested, but I'm still unsure whether a linear approximation is sufficient or if a quadratic model is expected.

Could I schedule a brief meeting during my free period tomorrow to clarify this? I want to make sure my approach is correct before the Phase 2 deadline.

Thank you for your guidance.

Best regards,
Dilan Patel
Grade 11 Physics (B)`,
    time: "May 26",
    date: "May 26",
    folder: "inbox",
    isRead: true,
    isStarred: false,
    tags: ["Physics IA", "Grade 11 Physics (B)"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-6",
    from: "Aarav Chen",
    fromRole: "Physics Teacher",
    fromAvatar: "AC",
    to: "Dilan Patel",
    subject: "Re: Physics IA  -  Air Resistance Calculation Query",
    preview: "Hi Dilan, great question. For the IB assessment criteria, a quadratic drag model would...",
    body: `Hi Dilan,

Great question. For the IB assessment criteria, a quadratic drag model would strengthen your error analysis significantly. However, a well-justified linear approximation with clear uncertainty discussion is also acceptable.

I'm available during Period 4 tomorrow in Lab 3. Come prepared with your current calculations and we can review together.

Best,
Mr. Chen`,
    time: "May 26",
    date: "May 26",
    folder: "sent",
    isRead: true,
    isStarred: false,
    tags: ["Physics IA", "Lab 3"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-7",
    from: "HR & Administration",
    fromRole: "School Administration",
    fromAvatar: "HR",
    to: "All Staff",
    subject: "Working Saturday Reminder  -  May 31",
    preview: "This is a reminder that Saturday, May 31st is a designated working day. Thursday timetable...",
    body: `This is a reminder that Saturday, May 31st is a designated working day.

Thursday timetable will be followed.

All staff are expected to be present. If you require leave, please submit your application through the HR portal by Wednesday, May 28th.

Bus transport will follow the regular Thursday schedule.

Regards,
HR & Administration`,
    time: "May 25",
    date: "May 25",
    folder: "announcements",
    isRead: true,
    isStarred: false,
    tags: ["Working Saturday"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-8",
    from: "Aarav Chen",
    fromRole: "Physics Teacher",
    fromAvatar: "AC",
    to: "Grade 11 Physics (B)",
    subject: "IA Draft Deadline  -  Final Reminder",
    preview: "Dear students, this is a final reminder that Physics IA Phase 2 drafts are due by...",
    body: `Dear students,

This is a final reminder that Physics IA Phase 2 drafts are due by May 29th (Thursday).

Please ensure:
• Your draft includes the complete methodology section
• Error analysis calculations are documented
• All data tables are formatted according to IB guidelines
• Bibliography follows the required citation format

Late submissions will not be accepted without prior arrangement.

If you have questions, I'm available during Period 4 in Lab 3 this week.

Best regards,
Mr. Aarav Chen
Physics Department`,
    time: "May 24",
    date: "May 24",
    folder: "sent",
    isRead: true,
    isStarred: false,
    tags: ["Physics IA", "Grade 11 Physics (B)", "Lab 3"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-9",
    from: "Aarav Chen",
    fromRole: "Physics Teacher",
    fromAvatar: "AC",
    to: "Marcus Vance",
    subject: "Draft: Department Meeting Agenda  -  Week 23",
    preview: "Hi Marcus, here's a draft of the agenda items I'd like to cover in our next department...",
    body: `Hi Marcus,

Here's a draft of the agenda items I'd like to cover in our next department meeting:

1. Lab 3 & Lab 4 booking protocol updates
2. Unit Test Week invigilation assignments
3. IA supervision workload distribution
4. Equipment audit findings
5. PTM preparation checklist

Let me know if you'd like to add anything.

Best,
Aarav`,
    time: "May 23",
    date: "May 23",
    folder: "drafts",
    isRead: true,
    isStarred: false,
    tags: ["Lab 3", "Department Meeting"],
    accountEmail: "aarav.chen@axis.edu",
  },
  {
    id: "em-pers-1",
    from: "Netflix",
    fromRole: "Streaming Service",
    fromAvatar: "NF",
    to: "aarav.personal@gmail.com",
    subject: "Your Next Billing Cycle Reminder",
    preview: "We hope you are enjoying Netflix. This is a quick reminder that your subscription will renew...",
    body: `Hi Aarav,

This is a reminder that your monthly subscription will renew on June 1st. 

Payment method: Visa ending in 4321
Amount: $15.49

If you wish to make changes to your plan or update billing info, please visit your Netflix Account page.

Thanks,
Netflix Team`,
    time: "Yesterday",
    date: "May 28",
    folder: "inbox",
    isRead: false,
    isStarred: false,
    accountEmail: "aarav.personal@gmail.com",
  },
  {
    id: "em-pers-2",
    from: "Aditya Chen",
    fromRole: "Family",
    fromAvatar: "AC",
    to: "aarav.personal@gmail.com",
    subject: "Family Dinner Plans - Sunday",
    preview: "Hey Aarav, check with mom about Sunday dinner. She wants to make her signature lasagna...",
    body: `Hey Aarav,

Just wanted to check if you're free this Sunday for dinner at mom's place around 6 PM.

She wants to make her signature lasagna since everyone is in town. Let me know by tomorrow so she can buy the ingredients.

Also, did you finish grading those Physics papers? You've been super busy lately!

Talk soon,
Aditya`,
    time: "May 27",
    date: "May 27",
    folder: "inbox",
    isRead: true,
    isStarred: true,
    accountEmail: "aarav.personal@gmail.com",
  }
];

// ─── Entity Context Data ────────────────────────────────────────────────

const ENTITY_CONTEXT: Record<string, { title: string; type: "room" | "class" | "teacher" | "event" | "department"; details: string[]; actionLabel?: string }> = {
  "Lab 3": {
    title: "Lab 3 (Physics Laboratory)",
    type: "room",
    details: [
      "Status: Available after Period 3",
      "Next Class: Grade 11 Physics (B)  -  Period 4",
      "Assigned: Aarav Chen, Marcus Vance",
      "Upcoming: Lab Safety Inspection  -  May 15",
    ],
    actionLabel: "View Room Schedule",
  },
  "Room 102": {
    title: "Room 102 (Guidance Office)",
    type: "room",
    details: [
      "Status: Available",
      "Assigned: Sarah Chen (Guidance)",
      "No conflicting bookings today",
    ],
  },
  "Grade 11 Physics (B)": {
    title: "Grade 11 Physics  -  Section B",
    type: "class",
    details: [
      "Students: 24 enrolled",
      "Next Class: Period 4, Lab 3",
      "IA Submissions: 22/24 drafts received",
      "Attendance: 94.2% (Weekly Avg)",
    ],
    actionLabel: "Open Class Ledger",
  },
  "Grade 12 Adv Physics (A)": {
    title: "Grade 12 Advanced Physics  -  Section A",
    type: "class",
    details: [
      "Students: 18 enrolled",
      "Next Class: Period 2, Room 204",
      "Exam: Unit Test  -  May 20",
    ],
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
  },
  "Period 5": {
    title: "Period 5 Schedule Block",
    type: "event",
    details: [
      "Time: 12:45 PM – 1:30 PM",
      "Status: Free Period / Coordination",
      "Coverage Request: Grade 10 Science (pending)",
    ],
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
  },
  "Exam Week": {
    title: "Unit Test Week",
    type: "event",
    details: [
      "Dates: May 18 – 22",
      "Papers Due: May 15",
      "Physics Slot: Mon Period 1–2 (Gr11), Wed Period 3–4 (Gr12)",
    ],
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
  },
  "Working Saturday": {
    title: "Working Saturday",
    type: "event",
    details: [
      "Next: May 31  -  Thursday timetable",
      "Reason: Compensatory day",
      "All staff required",
    ],
  },
};

// ─── Folders Config ─────────────────────────────────────────────────────

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

export function EmailWorkspace() {
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>("em-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [contextOverlay, setContextOverlay] = useState<ContextOverlay>(null);
  const [emails, setEmails] = useState<Email[]>(EMAILS);

  // Accounts State
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    { email: "aarav.chen@axis.edu", label: "work" },
    { email: "aarav.personal@gmail.com", label: "home" },
  ]);
  const [activeAccountEmail, setActiveAccountEmail] = useState<string>("aarav.chen@axis.edu");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Form State
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState<"work" | "home" | "custom">("work");
  const [newCustomLabel, setNewCustomLabel] = useState("");

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.email === activeAccountEmail) || accounts[0];
  }, [accounts, activeAccountEmail]);

  // Folder count stats for active account
  const unreadCount = useMemo(() => {
    return emails.filter((e) => (e.accountEmail || "aarav.chen@axis.edu") === activeAccountEmail && !e.isRead && e.folder === "inbox").length;
  }, [emails, activeAccountEmail]);

  const filteredEmails = useMemo(() => {
    let filtered = emails.filter((e) => {
      const emailAcc = e.accountEmail || "aarav.chen@axis.edu";
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
    const emailAcc = email.accountEmail || "aarav.chen@axis.edu";
    return emailAcc === activeAccountEmail ? email : null;
  }, [emails, selectedEmailId, activeAccountEmail]);

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
  };

  // Connect New Account Callback
  const handleConnectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;

    const newAcc: ConnectedAccount = {
      email: newEmail,
      label: newLabel,
      customLabelName: newLabel === "custom" ? newCustomLabel || "Custom" : undefined,
    };

    // Add account to state
    setAccounts((prev) => [...prev, newAcc]);

    // Create a mock welcome email for this account
    const welcomeEmail: Email = {
      id: `em-welcome-${Date.now()}`,
      from: "Axis System",
      fromRole: "Notification Services",
      fromAvatar: "AX",
      to: newEmail,
      subject: `Welcome to your connected inbox (${newAcc.label === "custom" ? newAcc.customLabelName : newAcc.label})`,
      preview: `Your email account ${newEmail} has been successfully connected to Axis. You can now view messages...`,
      body: `Hello Aarav,

Your email account (${newEmail}) has been successfully integrated into the Axis Teacher Portal.

This connection allows you to view updates and link keywords (like "Lab 3" or "Physics IA") directly to your planning resources, classes, and schedules in real-time.

Label category applied: ${newAcc.label === "custom" ? newAcc.customLabelName : newAcc.label.toUpperCase()}

If you wish to change labels or remove this inbox, navigate to settings.

Regards,
Axis Admin System`,
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

    // Reset Form
    setNewEmail("");
    setNewLabel("work");
    setNewCustomLabel("");
    setIsAddAccountOpen(false);
  };

  // Render body text with highlighted keywords for Context
  const renderHighlightedBody = (text: string) => {
    const keywords = Object.keys(ENTITY_CONTEXT);
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    if (sortedKeywords.length === 0) return text;

    const regex = new RegExp(`\\b(${sortedKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const match = sortedKeywords.find(k => k.toLowerCase() === part.toLowerCase());
      if (match) {
        return (
          <button
            key={index}
            onClick={() => setContextOverlay({ entity: match, ...ENTITY_CONTEXT[match] })}
            className="text-cyan-400 font-medium border-b border-dashed border-cyan-400 hover:text-cyan-300 hover:border-cyan-300 transition-colors"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-full flex flex-row overflow-hidden bg-black/10 backdrop-blur-md rounded-xl border border-white/10">
      {/* 1. Left Navigation Mail Column */}
      <div className="w-64 flex flex-col border-r border-white/10 bg-white/[0.01]">
        {/* Connected Accounts Switcher Header */}
        <div className="p-safe-md border-b border-white/10 relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all rounded-lg text-left"
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Active Inbox</span>
              <span className="text-xs text-white/90 truncate font-medium">{activeAccount.email}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                activeAccount.label === "work" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                activeAccount.label === "home" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              }`}>
                {activeAccount.label === "custom" ? (activeAccount.customLabelName || "custom") : activeAccount.label}
              </span>
              <svg className="size-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>

          {/* Accounts Dropdown Popover */}
          <AnimatePresence>
            {isAccountDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAccountDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-[calc(100%-4px)] left-3 right-3 z-50 bg-zinc-950 border border-white/10 rounded-lg shadow-2xl p-1.5 flex flex-col gap-0.5"
                >
                  {accounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        setActiveAccountEmail(acc.email);
                        setIsAccountDropdownOpen(false);
                        setSelectedEmailId(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-all ${
                        activeAccountEmail === acc.email ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs text-white/90 truncate font-medium">{acc.email}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${
                        acc.label === "work" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                        acc.label === "home" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                        {acc.label === "custom" ? (acc.customLabelName || "custom") : acc.label}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-white/[0.08] my-1" />
                  <button
                    onClick={() => {
                      setIsAddAccountOpen(true);
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-md transition-all"
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="p-safe-md">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#09090b] bg-white hover:bg-white/90 rounded-lg shadow-md transition-all">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Compose Message
          </button>
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {FOLDERS.map((folder) => {
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-white" : "text-white/40"}>
                    {folder.icon}
                  </span>
                  <span>{folder.label}</span>
                </div>
                {folder.id === "inbox" && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Email List Column */}
      <div className="w-80 flex flex-col border-r border-white/10 bg-white/[0.005]">
        {/* Search */}
        <div className="p-safe-md border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
            />
            <svg className="absolute left-2.5 top-2 size-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {/* Email Cards Container */}
        <div className="flex-1 overflow-y-auto p-safe-sm space-y-safe-sm">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-xs">No emails in this folder</div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = selectedEmailId === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  className={`p-safe-md rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.07] border-white/20"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="size-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {email.fromAvatar}
                      </div>
                      <span className={`text-xs truncate text-white/90 ${!email.isRead ? "font-bold" : "font-medium"}`}>
                        {email.from}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 shrink-0 font-medium">{email.time}</span>
                  </div>

                  <h4 className={`text-xs mb-1 truncate text-white/80 ${!email.isRead ? "font-bold text-white" : ""}`}>
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed mb-2">
                    {email.preview}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {email.tags?.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.2 bg-white/[0.04] text-white/50 rounded text-[9px] border border-white/[0.02]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => handleToggleStar(email.id, e)}
                      className={`text-white/30 hover:text-amber-400 transition-colors p-0.5 shrink-0`}
                    >
                      <svg className={`size-3.5 ${email.isStarred ? "fill-amber-400 text-amber-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Right Email Reader / Detailed pane */}
      <div className="flex-1 flex overflow-hidden">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white/[0.002]">
            {/* Toolbar */}
            <div className="p-safe-md border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleArchive(selectedEmail.id)}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-all"
                  title="Archive"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </button>
              </div>
              <div>
                <button className="bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] px-3 py-1.5 text-[11px] text-white font-medium rounded transition-all">
                  Convert to Meeting
                </button>
              </div>
            </div>

            {/* Email Header */}
            <div className="p-safe-lg border-b border-white/10 flex items-start gap-4">
              <div className="size-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {selectedEmail.fromAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-white/95">{selectedEmail.from}</h2>
                  <span className="text-[10px] text-white/40">{selectedEmail.date} • {selectedEmail.time}</span>
                </div>
                <div className="text-[11px] text-white/50 mb-1">
                  From: {selectedEmail.from} ({selectedEmail.fromRole})
                </div>
                <div className="text-[11px] text-white/40">
                  To: {selectedEmail.to}
                </div>
              </div>
            </div>

            {/* Email Subject & Body */}
            <div className="flex-1 overflow-y-auto p-safe-lg md:p-safe-xl">
              <h1 className="text-base font-bold text-white mb-6 leading-snug">
                {selectedEmail.subject}
              </h1>
              <div className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap space-y-4">
                {renderHighlightedBody(selectedEmail.body)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-12 bg-white/[0.002]">
            <div className="max-w-xs">
              <span className="text-xs text-white/20 font-medium">Select an email to view context</span>
            </div>
          </div>
        )}

        {/* 4. Context Overlay drawer column */}
        <AnimatePresence>
          {contextOverlay && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-col overflow-hidden shrink-0"
            >
              <div className="p-safe-md border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                <span className="text-xs font-semibold text-white/90">Related Context</span>
                <button
                  onClick={() => setContextOverlay(null)}
                  className="p-1 hover:bg-white/10 text-white/40 hover:text-white rounded transition-all"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-safe-md flex-1 overflow-y-auto space-y-safe-md">
                <div className="p-safe-md bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-white">{contextOverlay.title}</span>
                    <span className="px-1.5 py-0.5 text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-semibold uppercase tracking-wider">
                      {contextOverlay.type}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {contextOverlay.details.map((detail, idx) => (
                      <p key={idx} className="text-[11px] text-white/60 leading-relaxed">
                        • {detail}
                      </p>
                    ))}
                  </div>
                  {contextOverlay.actionLabel && (
                    <button className="w-full mt-3 py-1.5 bg-white text-zinc-950 text-[10px] font-semibold rounded hover:bg-white/90 transition-all">
                      {contextOverlay.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connect Account Modal Overlay */}
      <AnimatePresence>
        {isAddAccountOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="px-safe-lg py-safe-md border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Connect New Email</h3>
                <button
                  onClick={() => setIsAddAccountOpen(false)}
                  className="text-white/40 hover:text-white transition-all p-1"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleConnectAccount} className="p-safe-lg space-y-safe-md">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. personal@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Account Tag Label</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["work", "home", "custom"] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewLabel(lbl)}
                        className={`py-1.5 text-[11px] font-medium rounded-lg capitalize border transition-all ${
                          newLabel === lbl
                            ? "bg-white text-zinc-900 border-white"
                            : "bg-white/[0.03] text-white/70 border-white/[0.06] hover:bg-white/[0.05]"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {newLabel === "custom" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Custom Label Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admin, School Board"
                      value={newCustomLabel}
                      onChange={(e) => setNewCustomLabel(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(false)}
                    className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white hover:bg-white/90 text-zinc-900 rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    Connect
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


