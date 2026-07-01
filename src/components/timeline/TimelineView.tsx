"use client";

import { useState, useCallback } from "react";
import { TimelineSlot } from "@/components/itinerary/TimelineSlot";
import { TransitGap } from "@/components/timeline/TransitGap";
import type { Place } from "@/data/places";

interface SlotData {
  place: Place;
  startTime: string;
  endTime: string;
  transitMin: number;
}

interface TimelineViewProps {
  initialSlots: SlotData[];
}

function recalcTimes(slots: SlotData[]): SlotData[] {
  let currentMinutes = 10 * 60; // Start at 10:00
  return slots.map((slot, i) => {
    if (i > 0) currentMinutes += slot.transitMin; // transit from prev
    const startMin = currentMinutes;
    const endMin = startMin + slot.place.estDuration;
    currentMinutes = endMin;
    const fmt = (m: number) => {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
    };
    return { ...slot, startTime: fmt(startMin), endTime: fmt(endMin) };
  });
}

export function TimelineView({ initialSlots }: TimelineViewProps) {
  const [slots, setSlots] = useState<SlotData[]>(() => recalcTimes(initialSlots));
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((_e: React.DragEvent, index: number) => {
    setDragIdx(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (_e: React.DragEvent, dropIdx: number) => {
      if (dragIdx === null || dragIdx === dropIdx) return;
      setSlots((prev) => {
        const newSlots = [...prev];
        const [moved] = newSlots.splice(dragIdx, 1);
        newSlots.splice(dropIdx, 0, moved);
        return recalcTimes(newSlots);
      });
      setDragIdx(null);
    },
    [dragIdx]
  );

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
    <div className="px-5 mt-2 space-y-0">
      {slots.map((slot, i) => (
        <div key={slot.place.id}>
          <TimelineSlot
            place={slot.place}
            startTime={slot.startTime}
            endTime={slot.endTime}
            index={i}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
          {i < slots.length - 1 && (
            <TransitGap duration={slots[i + 1].transitMin} mode={slots[i + 1].transitMin > 10 ? "drive" : "walk"} />
          )}
        </div>
      ))}
    </div>
  );
}
