"use client";

import { useState, useCallback, useEffect } from "react";
import { TimelineSlot } from "@/components/itinerary/TimelineSlot";
import { TransitGap } from "@/components/timeline/TransitGap";
import type { Place } from "@/data/places";
import { useTripContext } from "@/context/TripContext";
import type { SlotData } from "@/hooks/useRouteTimes";

interface TimelineViewProps {
  slots: SlotData[];
  onPlaceClick: (place: Place) => void;
  isCalculating?: boolean;
  initialTransitMin?: number | null;
}

export function TimelineView({ slots, onPlaceClick, isCalculating = false, initialTransitMin }: TimelineViewProps) {
  const { removePlace, reorderPlaces } = useTripContext();

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderPlaces(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < slots.length - 1) {
      reorderPlaces(index, index + 1);
    }
  };

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-700">No places in your timeline yet</p>
        <p className="text-xs text-zinc-400 mt-1">
          Head to Explore or paste a social link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={`px-5 mt-2 space-y-0 transition-opacity duration-300 ${isCalculating ? 'opacity-50' : 'opacity-100'}`}>
      {initialTransitMin != null && initialTransitMin > 0 && slots.length > 0 && (
        <TransitGap duration={initialTransitMin} mode={initialTransitMin > 10 ? "drive" : "walk"} isInitial={true} />
      )}
      {slots.map((slot, i) => (
        <div key={slot.place.id}>
          <TimelineSlot
            place={slot.place}
            startTime={slot.startTime}
            endTime={slot.endTime}
            index={i}
            total={slots.length}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDelete={removePlace}
            onClick={() => onPlaceClick(slot.place)}
          />
          {i < slots.length - 1 && (
            <TransitGap duration={slots[i + 1].transitMin} mode={slots[i + 1].transitMin > 10 ? "drive" : "walk"} />
          )}
        </div>
      ))}
    </div>
  );
}
