"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Place } from "@/data/places";
import { useTripContext } from "@/context/TripContext";
import { useEffect } from "react";

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
  onAdd: (place: Place) => void;
}

export function PlaceDetail({ place, onClose, onAdd }: PlaceDetailProps) {
  const { addRecentPlace } = useTripContext();

  useEffect(() => {
    addRecentPlace(place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto shadow-xl">
        {/* Image */}
        <div className="relative h-48">
          <img src={place.imageUrl} alt={place.nameTh} className="w-full h-full object-cover rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {place.status?.map((s) => (
              <Badge key={s} variant={s === "Hidden Gem" ? "coral" : "neutral"}>{s}</Badge>
            ))}
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">{place.nameTh}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{place.nameEn} · {place.zone}</p>
          <p className="text-sm text-zinc-600 mt-3 leading-relaxed">{place.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Duration</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">{place.estDuration} min</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Price</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">{place.priceLevel}</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Hours</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">{place.operatingHours}</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Best time</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">{place.bestTimeToVisit}</p>
            </div>
          </div>

          {/* Activities */}
          <div className="mt-4">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-2">Things to do</p>
            <div className="flex flex-wrap gap-1.5">
              {place.keyActivities?.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button size="large" className="w-full mt-6" onClick={() => onAdd(place)}>
            Add to timeline
          </Button>
        </div>
      </div>
    </div>
  );
}
