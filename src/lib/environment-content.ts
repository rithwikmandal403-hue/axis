export type WorkflowPreview = {
  title: string;
  description: string;
  detail: string;
};

export type ContextualCard = {
  title: string;
  description: string;
};

export type OperationalMetric = {
  value: string;
  unit?: string;
  label: string;
  detail: string;
};

export type OperationalInsightsContent = {
  label: string;
  title: string;
  subtitle?: string;
  metrics: OperationalMetric[];
  observations: string[];
  footnote?: string;
};

export type EcosystemCapability = {
  title: string;
  description: string;
  icon:
    | "essentialSpace"
    | "adaptiveTimetable"
    | "counselorAvailability"
    | "opportunityCoordination"
    | "livePresence"
    | "contextNotifications"
    | "workflowContinuity"
    | "connectedCommunication";
};

export type EcosystemCapabilitiesContent = {
  label: string;
  title: string;
  intro?: string;
  items: EcosystemCapability[];
};

export type EnvironmentContent = {
  slug: string;
  label: string;
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    description: string;
  };
  intro: {
    label: string;
    statement: string;
    paragraphs: string[];
    closing: string;
  };
  workflows: {
    label: string;
    title: string;
    items: WorkflowPreview[];
  };
  contextual: {
    label: string;
    title: string;
    items: ContextualCard[];
  };
  insights?: OperationalInsightsContent;
  capabilities?: EcosystemCapabilitiesContent;
};

export const schoolContent: EnvironmentContent = {
  slug: "school",
  label: "School",
  metadata: {
    title: "Axis for Schools",
    description:
      "Operational clarity for IB and international schools — attendance, communication, and academic coordination in one connected environment.",
  },
  hero: {
    eyebrow: "Schools",
    headline: "Operational clarity\nfor modern schools.",
    subheadline: "Built for educators who need calm, connected systems.",
    description:
      "Axis brings attendance, communication, coordination, and academic operations into one intentional environment — designed for IB and international school contexts.",
  },
  intro: {
    label: "The school challenge",
    statement: "Teaching should not compete with fragmented administration.",
    paragraphs: [
      "Attendance lives in one system. Messages in another. Schedules elsewhere. Context disappears between departments, grade levels, and campuses.",
      "As schools grow — especially across IB programmes and international structures — operational complexity compounds quietly.",
    ],
    closing:
      "Axis restores clarity by connecting the workflows educators rely on every day, without adding another layer of noise.",
  },
  insights: {
    label: "Operational reality",
    title: "The hidden cost of fragmentation",
    subtitle:
      "Modern school operations accumulate quietly — not through failure, but through systems that were never designed to connect.",
    metrics: [
      {
        value: "11",
        label: "disconnected tools",
        detail: "Average number of platforms educators navigate daily across a typical school week.",
      },
      {
        value: "52",
        unit: "min",
        label: "lost to switching",
        detail: "Estimated daily time spent moving between systems instead of teaching or coordinating.",
      },
      {
        value: "64%",
        label: "communication drift",
        detail: "Faculty reporting that critical updates are missed when spread across multiple channels.",
      },
      {
        value: "5.1",
        label: "interruptions / hour",
        detail: "Operational interruptions caused by schedule changes, absences, and fragmented handoffs.",
      },
      {
        value: "38",
        unit: "×",
        label: "daily platform switches",
        detail: "How often teachers move between tools before instructional context is fully restored.",
      },
      {
        value: "41%",
        label: "administrative load",
        detail: "Share of coordination work that competes with instructional time across departments.",
      },
    ],
    observations: [
      "Teachers switch between platforms dozens of times daily.",
      "Operational context is often lost between disconnected systems.",
      "Administrative coordination consumes significant instructional time.",
    ],
    footnote:
      "Directional placeholder metrics based on observed patterns in modern school operations. Not sourced from a single study.",
  },
  capabilities: {
    label: "Ecosystem capabilities",
    title: "Capabilities that respond to how schools actually move",
    intro:
      "Not a feature list — a connected layer where schedule, presence, and opportunity stay aligned as the day unfolds.",
    items: [
      {
        title: "Essential Space",
        icon: "essentialSpace",
        description:
          "Dynamically reveals opportunities created by schedule changes, cancellations, and availability shifts — so students and staff can immediately act on newly available time.",
      },
      {
        title: "Adaptive Timetable",
        icon: "adaptiveTimetable",
        description:
          "Updates in real time when teachers report absences or schedule adjustments, allowing students to instantly see free periods and alternative opportunities.",
      },
      {
        title: "Counselor Availability",
        icon: "counselorAvailability",
        description:
          "Enables counselors and support staff to change their availability status instantly, notifying interested students when appointments or walk-in opportunities become available.",
      },
      {
        title: "Opportunity Coordination",
        icon: "opportunityCoordination",
        description:
          "Helps students use unexpected free time productively by surfacing relevant activities — counseling visits, study sessions, collaborative work, or academic support.",
      },
      {
        title: "Live Operational Presence",
        icon: "livePresence",
        description:
          "Gives the school a continuously updated awareness layer where staff, students, and departments can communicate availability and operational changes without friction.",
      },
      {
        title: "Context-Aware Notifications",
        icon: "contextNotifications",
        description:
          "Delivers relevant updates only to the people affected — reducing unnecessary communication while improving responsiveness across the school environment.",
      },
      {
        title: "Workflow Continuity",
        icon: "workflowContinuity",
        description:
          "Maintains operational flow even when schedules shift unexpectedly, minimizing disruption and helping students and staff adapt naturally throughout the day.",
      },
      {
        title: "Connected Communication",
        icon: "connectedCommunication",
        description:
          "Keeps schedule changes, availability updates, and coordination actions unified within a single operational environment instead of fragmented across disconnected tools.",
      },
    ],
  },
  workflows: {
    label: "Operational workflows",
    title: "What becomes clearer",
    items: [
      {
        title: "Attendance & presence",
        description: "Track presence across classes and programmes with continuity, not duplication.",
        detail: "Morning roll · Substitute handoffs · Programme reporting",
      },
      {
        title: "Teacher communication",
        description: "Coordinate between faculty, leadership, and families in context — not across threads.",
        detail: "Department channels · Parent updates · Internal briefings",
      },
      {
        title: "Academic coordination",
        description: "Align timetables, assessments, and programme requirements without losing oversight.",
        detail: "IB timelines · Assessment windows · Cross-year planning",
      },
      {
        title: "Campus operations",
        description: "See how daily school operations connect — from admin to classroom to leadership.",
        detail: "Events · Resources · Operational handoffs",
      },
    ],
  },
  contextual: {
    label: "School ecosystem",
    title: "Designed for how schools actually operate",
    items: [
      {
        title: "International programmes",
        description: "Structure that respects IB, Cambridge, and multi-curriculum environments without rigid templates.",
      },
      {
        title: "Faculty coordination",
        description: "Shared visibility across departments without overwhelming teachers with another inbox.",
      },
      {
        title: "Administrative calm",
        description: "Operations that feel organized — not like a patchwork of disconnected tools.",
      },
    ],
  },
};

export const workplaceContent: EnvironmentContent = {
  slug: "workplace",
  label: "Workplace",
  metadata: {
    title: "Axis for Workplaces",
    description:
      "Connected team operations — collaboration, workflow continuity, and coordination without context switching.",
  },
  hero: {
    eyebrow: "Workplaces",
    headline: "Teams that move\nas one system.",
    subheadline: "Workflow continuity for modern work.",
    description:
      "Axis unifies how teams communicate, coordinate, and execute — reducing friction between tools, people, and daily operations.",
  },
  intro: {
    label: "The workplace challenge",
    statement: "Work was never meant to happen across twelve disconnected surfaces.",
    paragraphs: [
      "Messages in one channel. Tasks in another. Documents somewhere else. Every handoff costs attention.",
      "As teams scale, coordination debt grows — not because people fail, but because systems do not connect.",
    ],
    closing:
      "Axis is a connected operational layer — not another app competing for your focus.",
  },
  workflows: {
    label: "Team workflows",
    title: "What stays connected",
    items: [
      {
        title: "Collaboration",
        description: "Work together with shared context — decisions, updates, and ownership in one place.",
        detail: "Project threads · Team spaces · Shared briefs",
      },
      {
        title: "Workflow continuity",
        description: "Move from planning to execution without rebuilding context at every step.",
        detail: "Handoffs · Status · Dependencies",
      },
      {
        title: "Connected communication",
        description: "Communication that attaches to work — not detached from it.",
        detail: "Updates · Mentions · Operational signals",
      },
      {
        title: "Daily operations",
        description: "See how team rhythm connects across roles, projects, and priorities.",
        detail: "Standups · Priorities · Cross-functional alignment",
      },
    ],
  },
  contextual: {
    label: "Workplace ecosystem",
    title: "Built for operational rhythm",
    items: [
      {
        title: "Low cognitive load",
        description: "Fewer surfaces, clearer signals — work stays where it belongs.",
      },
      {
        title: "Team alignment",
        description: "Everyone operates from the same connected environment, not parallel silos.",
      },
      {
        title: "Calm execution",
        description: "Premium, restrained tooling that supports focus instead of fragmenting it.",
      },
    ],
  },
};

export const organizationContent: EnvironmentContent = {
  slug: "organization",
  label: "Organization",
  metadata: {
    title: "Axis for Organizations",
    description:
      "Scalable coordination across departments — unified environments and connected operational infrastructure.",
  },
  hero: {
    eyebrow: "Organizations",
    headline: "Infrastructure for\nconnected operations.",
    subheadline: "Scale without losing coherence.",
    description:
      "Axis connects departments, systems, and people across growing structures — restoring operational clarity at scale.",
  },
  intro: {
    label: "The organizational challenge",
    statement: "Growth should not mean fragmentation.",
    paragraphs: [
      "Each department builds its own stack. Communication fragments. Context dies at every boundary.",
      "The larger the organization, the harder it becomes to see how work actually flows between teams.",
    ],
    closing:
      "Axis provides a unified operational environment — modular where needed, connected by design.",
  },
  workflows: {
    label: "Organizational workflows",
    title: "What scales with you",
    items: [
      {
        title: "Department coordination",
        description: "Connect teams across functions without forcing everyone into the same rigid workflow.",
        detail: "Cross-dept visibility · Shared protocols · Role-aware access",
      },
      {
        title: "Connected systems",
        description: "Bridge operational tools into one coherent layer — reduce switching, preserve context.",
        detail: "Integrations · Data continuity · System mapping",
      },
      {
        title: "Scalable coordination",
        description: "Structures that grow with your organization without rebuilding from scratch.",
        detail: "Multi-site · Hierarchies · Governance",
      },
      {
        title: "Operational infrastructure",
        description: "The underlying connective tissue that keeps large environments intelligible.",
        detail: "Reporting · Oversight · Strategic alignment",
      },
    ],
  },
  contextual: {
    label: "Organizational ecosystem",
    title: "Unified by design",
    items: [
      {
        title: "Modular environments",
        description: "Departments maintain their context while remaining part of one connected system.",
      },
      {
        title: "Executive clarity",
        description: "Leadership sees how operations connect — without drowning in dashboards.",
      },
      {
        title: "Intentional scale",
        description: "Infrastructure that feels architectural, not like enterprise software bloat.",
      },
    ],
  },
};

export const environmentBySlug = {
  school: schoolContent,
  workplace: workplaceContent,
  organization: organizationContent,
} as const;
