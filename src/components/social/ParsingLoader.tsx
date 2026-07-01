"use client";

import { useState, useEffect } from "react";

const steps = [
  "Reading the caption...",
  "Spotting place names...",
  "Matching with our database...",
  "Almost there...",
];

interface ParsingLoaderProps {
  onComplete: () => void;
}

export function ParsingLoader({ onComplete }: ParsingLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex < steps.length - 1) {
      const timer = setTimeout(() => setStepIndex((i) => i + 1), 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, onComplete]);

  return (
    <div className="flex flex-col items-center py-16 px-5">
      {/* Typing indicator */}
      <div className="flex items-center gap-1.5 mb-6">
        <span className="w-2.5 h-2.5 bg-coral-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2.5 h-2.5 bg-coral-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2.5 h-2.5 bg-coral-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>

      {/* Progressive text */}
      <p className="text-sm font-medium text-zinc-700 transition-all duration-300">
        {steps[stepIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-zinc-200 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-coral-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
