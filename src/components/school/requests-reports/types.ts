export type RequestStatus = "new" | "in_progress" | "waiting" | "resolved" | "archived";
export type RequestPriority = "low" | "medium" | "high" | "urgent";
export type UserRole = "teacher" | "student" | "parent" | "coordinator";

export type TeacherRequestType = 
  | "facility_issue"
  | "technology_issue"
  | "equipment_issue"
  | "maintenance_request"
  | "administrative_request"
  | "suggestion";

export type StudentRequestType = 
  | "suggestion"
  | "facility_issue"
  | "technology_issue"
  | "event_proposal"
  | "club_proposal"
  | "wellbeing_concern"
  | "general_request";

export type ParentRequestType = 
  | "question"
  | "feedback"
  | "concern"
  | "suggestion"
  | "meeting_request";

export type RequestType = TeacherRequestType | StudentRequestType | ParentRequestType;

export interface Request {
  id: string;
  type: RequestType;
  category: string;
  reporter: {
    id: string;
    name: string;
    role: UserRole;
    email?: string;
  };
  location?: {
    type: "room" | "facility" | "general";
    name: string;
    id?: string;
  };
  description: string;
  dateSubmitted: string;
  priority: RequestPriority;
  status: RequestStatus;
  assignedTo?: {
    id: string;
    name: string;
    role: UserRole;
  };
  replies?: Reply[];
  context?: {
    operationalImpact?: string;
    affectedClasses?: string[];
    affectedEvents?: string[];
    relatedRequests?: string[];
  };
  tags?: string[];
}

export interface Reply {
  id: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
  message: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface RequestFilter {
  status?: RequestStatus[];
  priority?: RequestPriority[];
  type?: RequestType[];
  reporter?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DashboardWidgetData {
  newReports: number;
  highPriorityReports: number;
  pendingSuggestions: number;
  outstandingIssues: number;
  recentRequests: Request[];
}
