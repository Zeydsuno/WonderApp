import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200 shadow-sm ${
        hoverable ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
