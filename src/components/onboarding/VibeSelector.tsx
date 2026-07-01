"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { usePreferences } from "@/hooks/usePreferences";

const vibeOptions = [
  { id: "cafe", label: "Cafe", icon: "M18.5 12.5a3 3 0 00-3-3h-1a3 3 0 00-3 3v0a3 3 0 003 3h1a3 3 0 003-3z" },
  { id: "temple", label: "Temple", icon: "M12 2L2 7l10 5 10-5-10-5z" },
  { id: "minimal", label: "Minimal", icon: "M4 5h16M4 12h16M4 19h16" },
  { id: "street-food", label: "Street Food", icon: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" },
  { id: "nature", label: "Nature", icon: "M3 17h4l3-6 4 8 3-4h4" },
  { id: "culture", label: "Culture", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { id: "nightlife", label: "Night Life", icon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" },
  { id: "shopping", label: "Shopping", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
];

interface VibeSelectorProps {
  onComplete: (vibes: string[], hours: number) => void;
}

export function VibeSelector({ onComplete }: VibeSelectorProps) {
  const { preferences, updatePreferences, isLoaded } = usePreferences();
  const [selected, setSelected] = useState<string[]>([]);
  const [hours, setHours] = useState(4);

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(preferences.vibes || []);
      setHours(preferences.hours || 4);
    }
  }, [isLoaded, preferences.vibes, preferences.hours]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
        What is your vibe today?
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Pick a few things you are in the mood for. We will match places to your taste.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {vibeOptions.map((v) => (
          <button
            key={v.id}
            onClick={() => toggle(v.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              selected.includes(v.id)
                ? "bg-coral-50 border-coral-300 text-coral-700"
                : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
            </svg>
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <label className="text-sm font-medium text-zinc-800 mb-3 block">
          How much time do you have? <span className="text-coral-500 font-semibold">{hours} hours</span>
        </label>
        <input
          type="range"
          min={1}
          max={12}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="w-full h-2 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-coral-500"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>1 hr</span>
          <span>12 hrs</span>
        </div>
      </div>

      <Button
        size="large"
        className="w-full"
        disabled={selected.length === 0}
        onClick={() => {
          updatePreferences({ vibes: selected, hours });
          onComplete(selected, hours);
        }}
      >
        {selected.length === 0 ? "Pick at least one vibe" : "Let's explore"}
      </Button>
    </div>
  );
}
