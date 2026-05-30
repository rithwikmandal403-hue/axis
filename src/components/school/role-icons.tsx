type IconProps = { className?: string };

export function TeacherRoleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3L4 7.5V10.5M12 3L20 7.5V10.5M12 3V12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12.5V16.2C7 17.2 9.2 18.5 12 18.5C14.8 18.5 17 17.2 17 16.2V12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CoordinatorRoleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9H16M8 13H13M8 17H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StudentRoleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 19C6.6 16 8.7 14 12 14C15.3 14 17.4 16 18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ParentRoleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 19C4.5 16.5 6.5 15 9 15C11 15 12 15.5 12 15.5C12 15.5 13 15 15 15C17.2 15 19 16.5 19.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const roleIconMap = {
  teacher: TeacherRoleIcon,
  coordinator: CoordinatorRoleIcon,
  student: StudentRoleIcon,
  parent: ParentRoleIcon,
} as const;
