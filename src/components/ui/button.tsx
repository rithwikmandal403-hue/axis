import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <span aria-hidden>→</span>
    </button>
  );
}
