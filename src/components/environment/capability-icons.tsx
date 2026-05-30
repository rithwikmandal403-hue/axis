type IconProps = { className?: string };

export function EssentialSpaceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9H16M8 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AdaptiveTimetableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3V7M16 3V7M4 10H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CounselorAvailabilityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 19C6.6 16 8.7 14 12 14C15.3 14 17.4 16 18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function OpportunityCoordinationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11.5L16 8M8 12.5L16 16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LivePresenceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 5V7M12 17V19M5 12H7M17 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ContextNotificationsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4C9.2 4 7 6.2 7 9V13L5 16H19L17 13V9C17 6.2 14.8 4 12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 18C10.3 19.3 11.1 20 12 20C12.9 20 13.7 19.3 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function WorkflowContinuityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12H9L11 8L13 16L15 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function ConnectedCommunicationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 8H15C16.1 8 17 8.9 17 10V14C17 15.1 16.1 16 15 16H11L7 19V16H5C3.9 16 3 15.1 3 14V10C3 8.9 3.9 8 5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M19 6H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const capabilityIconMap = {
  essentialSpace: EssentialSpaceIcon,
  adaptiveTimetable: AdaptiveTimetableIcon,
  counselorAvailability: CounselorAvailabilityIcon,
  opportunityCoordination: OpportunityCoordinationIcon,
  livePresence: LivePresenceIcon,
  contextNotifications: ContextNotificationsIcon,
  workflowContinuity: WorkflowContinuityIcon,
  connectedCommunication: ConnectedCommunicationIcon,
} as const;

export type CapabilityIconKey = keyof typeof capabilityIconMap;
