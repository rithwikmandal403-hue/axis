/**
 * Teacher Context Engine
 * Detects pedagogical and coordination opportunities in messages, emails, and tasks
 * Never interrupts teacher, surfaces only when confidence is high
 */

export type ContextType = "event" | "meeting" | "task" | "reminder" | "assignment" | "followup" | "announcement" | "calendar";

export type DetectedContext = {
  id: string;
  type: ContextType;
  trigger: string;
  confidence: number;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  targetGroup?: string;
  participants?: string[];
  actionLabel: string;
  icon: string;
};

/**
 * Core pattern matching for context detection
 * Aggressive patterns optimized for teacher interactions
 */
const CONTEXT_PATTERNS = {
  meetings: [
    // Direct meeting requests - HIGHEST PRIORITY
    /can\s+we\s+(?:meet|schedule|have\s+(?:a\s+)?(?:meeting|call|sync))\s+([a-z\s]+?)[\?.!]/gi,
    /(?:let'?s?|should\s+we)\s+(?:meet|schedule|discuss|coordinate)\s+([a-z\s]+?)[\?.!]/gi,
    /(?:can\s+you|are\s+you)\s+(?:available|free)\s+(?:for|on)\s+(?:a\s+)?(?:meeting|sync|call)\s+([a-z\s\d]+?)[\?.!]/gi,
    /meeting\s+(?:about|regarding|on|for|with)\s+([a-z\s\d]+?)[\?.!]/gi,
    /(?:available|free)\s+(?:for|at)\s+([a-z\s\d]+?)(?:\?|for\s+(?:a\s+)?(?:meeting|sync|call))/gi,
  ],
  
  tasks: [
    // Student submission deadlines - CRITICAL TEACHER CONTEXT
    /(?:students?|class|grade\s+\d+|all)\s+(?:must\s+)?(?:submit|turn\s+in|hand\s+in|provide|complete|finish|do)\s+([a-z\s\d]+?)\s+(?:by|before|until|on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
    /(?:students?|everyone|all|class)\s+need\s+to\s+(?:submit|provide|complete|turn\s+in|do|finish)\s+([a-z\s\d]+?)\s+(?:by|on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
    /deadline\s+(?:for|is)\s+(?:submitting|turning\s+in|handing\s+in)\s+([a-z\s\d]+?)\s+(?:is|on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
    /(?:assignment|homework|project|task|worksheet|paper)\s+(?:due|deadline)\s+(?:is|on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
  ],
  
  events: [
    // Event mentions
    /(?:schedule|planning|organizing|planning\s+the|schedule\s+a)\s+([a-z\s\d]+?(?:evening|exhibition|event|fair|presentation|workshop|meeting|discussion|seminar|conference|assembly))\s+([a-z\s\d]+?)[\?.!]/gi,
    /(?:event|activity|presentation|fair|workshop|seminar|conference|assembly|meeting)\s+(?:is\s+)?(?:happening|scheduled|coming|on|this|next|take\s+place)\s+([a-z\s\d]+?)[\?.!]/gi,
    /(?:this|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)\s+([a-z\s\d]+?)[\?.!]/gi,
  ],
  
  reminders: [
    // Reminder triggers
    /(?:remember|don't\s+forget|make\s+sure|be\s+sure|don't\s+forget\s+to)\s+(?:to\s+)?([a-z\s\d]+?)[\?.!]/gi,
    /reminder:\s*([a-z\s\d]+?)[\?.!]/gi,
  ],
  
  assignments: [
    // Assignment mentions
    /(?:assignment|homework|project|worksheet|paper)\s+(?:on|for|about|covering)\s+([a-z\s\d]+?)\s+(?:due|by|on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
    /work\s+on\s+([a-z\s\d]+?)\s+(?:for|by|on|until)\s+(?:next\s+)?(?:class|lesson|monday|tuesday|wednesday|thursday|friday|tomorrow|this\s+week)[\?.!]/gi,
  ],

  announcements: [
    /(?:reminder\s+that|please\s+note\s+that|important\s+notice|announcement:?)\s+([a-z\s\d]+?)[\?.!]/gi,
    /reminder:\s*([a-z\s\d]+?)\s+(?:are\s+due|is\s+due|due\s+by|due\s+on)\s+([a-z\s\d]+?)[\?.!]/gi,
  ],

  calendar: [
    /([a-z\s\d\-]+?)\s+(?:will\s+take\s+place|is\s+scheduled|happening)\s+(?:on|at)\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?|[a-z\s\d]+?)[\?.!]/gi,
    /(?:mark\s+your\s+calendars?\s+for|add\s+to\s+calendars?)\s+([a-z\s\d]+?)\s+(?:on|for)\s+([a-z\s\d]+?)[\?.!]/gi,
  ],

  followups: [
    /(?:need\s+to|let's|should\s+we)\s+(?:discuss|follow\s+up|revisit)\s+([a-z\s\d]+?)[\?.!]/gi,
    /follow-up\s+(?:on|regarding|about)\s+([a-z\s\d]+?)[\?.!]/gi,
  ],
};

/**
 * Extract and format detected context
 */
export function detectContextInText(text: string): DetectedContext[] {
  const contexts: DetectedContext[] = [];

  // Meeting detection - MOST CRITICAL
  for (const pattern of CONTEXT_PATTERNS.meetings) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      // Check if it looks more like an event
      const isEventKeyword = /evening|exhibition|fair|seminar|conference|assembly/i.test(match[0]);
      if (isEventKeyword) return;

      const confidence = 0.95; // Very high confidence
      if (confidence > 0.7) {
        contexts.push({
          id: `meet-${Date.now()}-${idx}`,
          type: "meeting",
          trigger: match[0],
          confidence,
          title: `Meeting: ${match[1] || "Coordination"}`,
          actionLabel: "Create Meeting",
          icon: "users",
        });
      }
    });
  }

  // Task detection (teacher-specific) - HIGHEST CONFIDENCE
  for (const pattern of CONTEXT_PATTERNS.tasks) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.95; // Highest confidence
      if (confidence > 0.7) {
        const dueDate = extractDateFromText(match[2] || match[1] || "");
        const targetGroup = extractTargetGroup(text);
        
        contexts.push({
          id: `task-${Date.now()}-${idx}`,
          type: "task",
          trigger: match[0],
          confidence,
          title: `Task: ${match[1] || "Student Submission"}`,
          description: `Students need to submit: ${match[1] || "assignment"}`,
          date: dueDate,
          targetGroup,
          actionLabel: "Create Task",
          icon: "checklist",
        });
      }
    });
  }

  // Event detection
  for (const pattern of CONTEXT_PATTERNS.events) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.95;
      if (confidence > 0.7) {
        const targetGroup = extractTargetGroup(text);
        contexts.push({
          id: `evt-${Date.now()}-${idx}`,
          type: "event",
          trigger: match[0],
          confidence,
          title: `${match[1] || "Event"}`,
          description: match[0],
          date: extractDateFromText(match[2] || match[0] || ""),
          targetGroup,
          actionLabel: "Create Event",
          icon: "calendar",
        });
      }
    });
  }

  // Announcement detection
  for (const pattern of CONTEXT_PATTERNS.announcements) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.90;
      if (confidence > 0.7) {
        const targetGroup = extractTargetGroup(text);
        contexts.push({
          id: `ann-${Date.now()}-${idx}`,
          type: "announcement",
          trigger: match[0],
          confidence,
          title: `Announcement: ${match[1] || "Broad Notice"}`,
          description: match[0],
          date: extractDateFromText(match[2] || match[1] || ""),
          targetGroup,
          actionLabel: "Create Announcement",
          icon: "bell",
        });
      }
    });
  }

  // Calendar detection
  for (const pattern of CONTEXT_PATTERNS.calendar) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.90;
      if (confidence > 0.7) {
        contexts.push({
          id: `cal-${Date.now()}-${idx}`,
          type: "calendar",
          trigger: match[0],
          confidence,
          title: `Calendar: ${match[1] || "Entry"}`,
          description: match[0],
          date: extractDateFromText(match[2] || match[1] || match[0]),
          actionLabel: "Add To Calendar",
          icon: "calendar",
        });
      }
    });
  }

  // Reminder detection
  for (const pattern of CONTEXT_PATTERNS.reminders) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.80;
      if (confidence > 0.7) {
        contexts.push({
          id: `remind-${Date.now()}-${idx}`,
          type: "reminder",
          trigger: match[0],
          confidence,
          title: `Reminder: ${match[1] || "Follow-up"}`,
          actionLabel: "Create Reminder",
          icon: "bell",
        });
      }
    });
  }

  // Assignment detection
  for (const pattern of CONTEXT_PATTERNS.assignments) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.85;
      if (confidence > 0.7) {
        contexts.push({
          id: `assign-${Date.now()}-${idx}`,
          type: "assignment",
          trigger: match[0],
          confidence,
          title: `Assignment: ${match[1] || "Coursework"}`,
          date: extractDateFromText(match[2] || match[1] || ""),
          actionLabel: "Create Assignment",
          icon: "document",
        });
      }
    });
  }

  // Follow-up detection
  for (const pattern of CONTEXT_PATTERNS.followups) {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match, idx) => {
      const confidence = 0.80;
      if (confidence > 0.7) {
        contexts.push({
          id: `follow-${Date.now()}-${idx}`,
          type: "followup",
          trigger: match[0],
          confidence,
          title: `Follow-up: ${match[1] || "Action Item"}`,
          description: match[0],
          date: extractDateFromText(match[0]),
          actionLabel: "Create Follow-up",
          icon: "arrow-right",
        });
      }
    });
  }

  return contexts;
}

/**
 * Extract date/time from natural language text
 */
export function extractDateFromText(text: string): string | undefined {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const textLower = text.toLowerCase();

  if (textLower.includes("today")) {
    return today.toISOString().split("T")[0];
  }
  if (textLower.includes("tomorrow")) {
    return tomorrow.toISOString().split("T")[0];
  }

  // Day names
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayDayName = dayNames[today.getDay()];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + i);
    const nextDayName = dayNames[nextDay.getDay()];
    if (textLower.includes(nextDayName) && nextDayName !== todayDayName) {
      return nextDay.toISOString().split("T")[0];
    }
  }

  // Date patterns (e.g., "May 29", "29th", "29/05", "on the 18th")
  const datePatterns = [
    /(\d{1,2})(?:st|nd|rd|th)?[\s\/-]?([a-z]{3,9})/i,
    /([a-z]{3,9})[\s\/-]?(\d{1,2})/i,
    /on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return extractDateFromMatch(match);
    }
  }

  return undefined;
}

/**
 * Extract target group/class from message
 */
export function extractTargetGroup(text: string): string | undefined {
  // Check for grade mentions
  const gradeMatch = text.match(/grade\s+(\d+(?:\s*[ab])?)/i);
  if (gradeMatch) return `Grade ${gradeMatch[1]}`;

  // Check for program codes
  const programMatch = text.match(/(DP\d?|MYP|PYP|CP|IB)/i);
  if (programMatch) return programMatch[1];

  // Check for specific classes
  const classMatch = text.match(/(Physics|Chemistry|Biology|Math|English|History|Geography|Economics|Business)\s*(HL|SL|AA|AI)?/i);
  if (classMatch) return classMatch[0];

  // Check for groups
  const groupMatch = text.match(/(homeroom|advisory|cas|tok|counselor)\s*([a-z0-9\-]*)/i);
  if (groupMatch) return `${groupMatch[1]} ${groupMatch[2] || ""}`.trim();

  // Check for "all students" or specific group
  const allMatch = text.match(/(?:all|every)\s+([a-z0-9\s]+)\s+students?/i);
  if (allMatch) return `${allMatch[1]} Students`;

  return undefined;
}

/**
 * Parse extracted date match
 */
function extractDateFromMatch(match: RegExpMatchArray): string | undefined {
  const months: { [key: string]: number } = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  let day: number | undefined;
  let month: number | undefined;

  if (match[1] && !isNaN(parseInt(match[1]))) {
    day = parseInt(match[1]);
    const monthStr = match[2]?.toLowerCase();
    if (monthStr) month = months[monthStr];
  } else if (match[2] && !isNaN(parseInt(match[2]))) {
    day = parseInt(match[2]);
    const monthStr = match[1]?.toLowerCase();
    if (monthStr) month = months[monthStr];
  }

  // If we just got a day of the month without a month (e.g. "on the 18th"), assume the current month
  if (day !== undefined && month === undefined) {
    month = new Date().getMonth();
  }

  if (day && month !== undefined) {
    const year = new Date().getFullYear();
    const date = new Date(year, month, day);
    // If date is in the past, assume next year
    if (date < new Date()) {
      date.setFullYear(year + 1);
    }
    return date.toISOString().split("T")[0];
  }

  return undefined;
}

/**
 * Format context for display in UI
 */
export function formatContextForDisplay(context: DetectedContext): {
  title: string;
  description: string;
  meta?: string;
} {
  let description = "";
  let meta = "";

  switch (context.type) {
    case "event":
      description = `Calendar event for ${context.date || "upcoming date"}`;
      meta = context.date ? `${formatDate(context.date)}` : "Date to be confirmed";
      break;
    case "meeting":
      description = "Schedule a meeting with participants";
      meta = "Meeting coordination";
      break;
    case "task":
      description = `Students: ${context.description || "complete assignment"}`;
      meta = `Target: ${context.targetGroup || "All Students"} · Due: ${context.date ? formatDate(context.date) : "TBD"}`;
      break;
    case "reminder":
      description = `Don't forget: ${context.title || "follow-up"}`;
      meta = "Personal reminder";
      break;
    case "assignment":
      description = `Create assignment for students`;
      meta = `Due: ${context.date ? formatDate(context.date) : "TBD"}`;
      break;
    case "followup":
      description = "Add follow-up action";
      meta = "Action item";
      break;
    case "announcement":
      description = `Broadcast announcement to students or staff`;
      meta = `Target: ${context.targetGroup || "TBD"} · Date: ${context.date ? formatDate(context.date) : "TBD"}`;
      break;
    case "calendar":
      description = `Add item to academic calendar`;
      meta = `Scheduled: ${context.date ? formatDate(context.date) : "TBD"}`;
      break;
  }

  return {
    title: context.title || "Context Detected",
    description,
    meta,
  };
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    
    return `${dayName} ${monthName} ${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Get icon SVG for context type
 */
export function getContextIcon(type: ContextType): string {
  switch (type) {
    case "event":
      return "calendar";
    case "meeting":
      return "users";
    case "task":
      return "checklist";
    case "reminder":
      return "bell";
    case "assignment":
      return "document";
    case "followup":
      return "arrow-right";
    case "announcement":
      return "bell";
    case "calendar":
      return "calendar";
    default:
      return "lightbulb";
  }
}
