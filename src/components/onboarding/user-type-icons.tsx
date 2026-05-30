type IconProps = {
  className?: string;
};

export function SchoolIcon({ className }: IconProps) {
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
      <path d="M20 10.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WorkplaceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="8"
        width="16"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 8V6.5C9 5.67 9.67 5 10.5 5H13.5C14.33 5 15 5.67 15 6.5V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 13H20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function OrganizationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 7H10M14 7H15M9 11H10M14 11H15M9 15H10M14 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OtherIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 12H10M14 12H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
