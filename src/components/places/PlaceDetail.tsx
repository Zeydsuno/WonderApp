"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/useTranslation";
import type { Place } from "@/data/places";
import { useTripContext } from "@/context/TripContext";
import { useEffect } from "react";

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
  onAdd: (place: Place) => void;
}

export function PlaceDetail({ place, onClose, onAdd }: PlaceDetailProps) {
  const { t } = useTranslation("explore");

  const getPriceLabel = (level: string) => {
    if (level === "Free" || level === "ไม่มีค่าเข้า") return t.free || "Free";
    return level;
  };
  const { addRecentPlace, isPlaceLiked, toggleLikePlace } = useTripContext();
  const isLiked = isPlaceLiked(place.id);

  useEffect(() => {
    addRecentPlace(place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-auto shadow-2xl">
        {/* Image Header with Gradient Overlay */}
        <div className="relative h-56 sm:h-64">
          <img src={place.imageUrl} alt={place.nameTh} className="w-full h-full object-cover rounded-t-3xl sm:rounded-t-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent" />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => toggleLikePlace(place)}
              className="w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className={`w-4 h-4 transition-colors ${isLiked ? 'text-coral-500 fill-coral-500' : 'text-white'}`} fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Titles positioned over the image */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap gap-2 mb-2">
              {place.status?.map((s) => (
                <Badge key={s} variant="coral" className="bg-coral-500/90 text-white border-none shadow-sm backdrop-blur-sm">{s}</Badge>
              ))}
              {place.theme?.map((t) => (
                <Badge key={t} variant="neutral" className="bg-white/20 text-white border-none backdrop-blur-md">{t}</Badge>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{place.nameTh}</h2>
            <p className="text-sm text-zinc-300 mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {place.zone}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 pb-8">
          <p className="text-sm text-zinc-600 leading-relaxed">{place.description}</p>

          {/* Details grid with Icons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-coral-50 text-coral-500 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{t.duration}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{place.estDuration} min</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{t.price}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{getPriceLabel(place.priceLevel)}</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{t.bestTime}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5 truncate">{place.bestTimeToVisit}</p>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{t.hours}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5 truncate">{place.operatingHours}</p>
              </div>
            </div>
          </div>

          {/* Activities */}
          {place.keyActivities && place.keyActivities.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-3">{t.thingsToDo}</p>
              <div className="flex flex-wrap gap-2">
                {place.keyActivities.map((a) => (
                  <Badge key={a} variant="outline" className="bg-white border-zinc-200 text-zinc-700 py-1.5 px-3 rounded-xl shadow-sm">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Button size="large" className="w-full mt-8 shadow-xl shadow-coral-500/20" onClick={() => onAdd(place)}>
            {t.addTimeline}
          </Button>
        </div>
      </div>
    </div>
  );
}
