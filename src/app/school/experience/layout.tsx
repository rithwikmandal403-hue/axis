import type { ReactNode } from "react";

export default function SchoolExperienceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#0a0a0b] text-white antialiased">
      {children}
    </div>
  );
}
