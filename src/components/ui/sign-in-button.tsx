"use client";

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 4H15C16.1 4 17 4.9 17 6V18C17 19.1 16.1 20 15 20H7V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.1 4 19 4H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13.5" cy="12" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function SignInButton() {
  return (
    <button
      type="button"
      aria-label="Sign in"
      className="group grid h-9 grid-cols-[36px_0fr] items-center overflow-hidden rounded-full border border-axis-line bg-axis-card/90 text-axis-text shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-[grid-template-columns,background-color,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:grid-cols-[36px_1fr] hover:border-axis-text/20 hover:bg-white focus-visible:grid-cols-[36px_1fr] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
    >
      <span className="grid size-9 place-items-center">
        <DoorIcon className="size-[17px] text-axis-text/85" />
      </span>

      <span className="min-w-0 overflow-hidden">
        <span className="block whitespace-nowrap pl-1 pr-4 text-sm font-medium opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-hover:delay-75 group-focus-visible:opacity-100 group-focus-visible:delay-75">
          Sign in
        </span>
      </span>
    </button>
  );
}
