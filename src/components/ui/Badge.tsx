import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "coral" | "neutral" | "outline";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    coral: "bg-coral-100 text-coral-700",
    neutral: "bg-zinc-100 text-zinc-700",
    outline: "border border-zinc-200 text-zinc-500 bg-transparent",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
