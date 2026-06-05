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
      "Manage classes, schedules, and messages in one quiet workspace.",
    previewVariant: "schedule",
  },
  {
    id: "coordinator",
    label: "Coordinator",
    description:
      "Overview campus schedules, rooms, and daily updates in a single view.",
    previewVariant: "operations",
  },
  {
    id: "student",
    label: "Student",
    description: "View classes, complete tasks, and message your teachers.",
    previewVariant: "learning",
  },
  {
    id: "parent",
    label: "Parent",
    description: "Stay updated on your child's classes, attendance, and school announcements.",
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
