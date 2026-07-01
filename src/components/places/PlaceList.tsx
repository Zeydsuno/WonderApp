"use client";

import { useState } from "react";
import { PlaceCard } from "./PlaceCard";
import type { Place } from "@/data/places";

const filters = ["All", "Cafe", "Temple", "Nature", "Hidden Gem"];

interface PlaceListProps {
  places: Place[];
  onSelect: (place: Place) => void;
}

export function PlaceList({ places, onSelect }: PlaceListProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? places
    : activeFilter === "Hidden Gem"
      ? places.filter((p) => p.status.includes("Hidden Gem"))
      : places.filter((p) => p.theme.includes(activeFilter));

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 px-5 scrollbar-hide snap-x snap-mandatory">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 snap-start px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeFilter === f
                ? "bg-coral-500 text-white"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 space-y-3 mt-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-700">No places found</p>
            <p className="text-xs text-zinc-400 mt-1">Try a different filter or expand your search.</p>
          </div>
        ) : (
          filtered.map((place) => (
            <PlaceCard key={place.id} place={place} onClick={() => onSelect(place)} />
          ))
        )}
      </div>
    </div>
  );
}
