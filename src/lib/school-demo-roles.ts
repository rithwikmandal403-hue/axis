export const SHARED_DEMO_PATH = "/school/experience/demo";

export type SchoolDemoRoleId = "teacher" | "coordinator" | "student" | "parent";

export type SchoolDemoRole = {
  id: SchoolDemoRoleId;
  label: string;
  description: string;
  previewVariant: "schedule" | "operations" | "learning" | "visibility";
};

export const schoolDemoRoles: SchoolDemoRole[] = [
  {
    id: "teacher",
    label: "Teacher",
    description:
      "Operational continuity across teaching, communication, and coordination.",
    previewVariant: "schedule",
  },
  {
    id: "coordinator",
    label: "Coordinator",
    description:
      "Real-time awareness across schedules, workflows, and institutional operations.",
    previewVariant: "operations",
  },
  {
    id: "student",
    label: "Student",
    description: "Context-aware learning, scheduling, and communication.",
    previewVariant: "learning",
  },
  {
    id: "parent",
    label: "Parent",
    description: "Connected visibility into progress, communication, and school operations.",
    previewVariant: "visibility",
  },
];

export function getSchoolDemoRole(id: string | null | undefined) {
  if (!id) return schoolDemoRoles[0];
  return schoolDemoRoles.find((role) => role.id === id) ?? schoolDemoRoles[0];
}

export function getDemoHref(roleId: SchoolDemoRoleId) {
  return `${SHARED_DEMO_PATH}?role=${roleId}`;
}
