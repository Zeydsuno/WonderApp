"use client";

interface InputProps {
  label?: string;
  helper?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  type?: "text" | "url" | "number";
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function Input({
  label,
  helper,
  error,
  placeholder,
  value,
  onChange,
  type = "text",
  multiline = false,
  rows = 3,
  className = "",
}: InputProps) {
  const inputClass =
    "w-full px-3 py-2 bg-white border rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-100 focus:border-coral-500 " +
    (error ? "border-red-400" : "border-zinc-200");

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-zinc-800">{label}</label>
      )}
      {multiline ? (
        <textarea
          className={inputClass}
          placeholder={placeholder}
          value={value}
          rows={rows}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {helper && !error && (
        <span className="text-xs text-zinc-500">{helper}</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
