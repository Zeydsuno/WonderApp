"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Place } from "@/data/places";
import { useTranslation } from "@/i18n/useTranslation";

interface ParseResultProps {
  results: { place: Place; confidence: "high" | "medium" }[];
  onAddAll: () => void;
  onRemove: (id: string) => void;
}

export function ParseResult({ results, onAddAll, onRemove }: ParseResultProps) {
  const { t } = useTranslation("social");

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 px-5 text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-700">{t.noPlaces}</p>
        <p className="text-xs text-zinc-400 mt-1">{t.noPlacesDesc}</p>
      </div>
    );
  }

  return (
    <div className="px-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-700">
          {t.found} {results.length} {results.length === 1 ? t.place : t.places}
        </p>
        <Badge variant="coral">{results.length} {t.matched}</Badge>
      </div>

      <div className="space-y-2">
        {results.map(({ place, confidence }) => (
          <div
            key={place.id}
            className="bg-white rounded-xl border border-zinc-200 p-3 flex items-center gap-3 shadow-sm"
          >
            <img src={place.imageUrl} alt={place.nameTh} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{place.nameTh}</p>
              <p className="text-xs text-zinc-500">{place.zone} · {place.estDuration} min</p>
            </div>
            <Badge variant={confidence === "high" ? "coral" : "neutral"}>
              {confidence === "high" ? t.exact : t.close}
            </Badge>
            <button
              onClick={() => onRemove(place.id)}
              className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <Button size="large" className="w-full mt-4" onClick={onAddAll}>
        {t.addAll}
      </Button>
    </div>
  );
}
