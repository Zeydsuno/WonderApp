"use client";

import { useState } from "react";
import { places } from "@/data/places";
import { PlaceList } from "@/components/places/PlaceList";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toast } from "@/components/ui/Toast";
import type { Place } from "@/data/places";
import { useTripContext } from "@/context/TripContext";
import { useTranslation } from "@/i18n/useTranslation";

export default function ExplorePage() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const { addPlace } = useTripContext();
  const { t } = useTranslation("explore");

  const filteredPlaces = places.filter(p => 
    p.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{t.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3.5 h-10">
          <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <PlaceList places={filteredPlaces} onSelect={setSelected} />

      {selected && (
        <PlaceDetail
          place={selected}
          onClose={() => setSelected(null)}
          onAdd={(p) => {
            addPlace(p);
            setSelected(null);
            setToast({ visible: true, message: `${p.nameTh} ${t.addedMsg}` });
          }}
        />
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ visible: false, message: "" })}
      />

      <BottomNav />
    </div>
  );
}
