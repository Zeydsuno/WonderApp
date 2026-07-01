"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { places } from "@/data/places";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Place } from "@/data/places";
import { useTranslation } from "@/i18n/useTranslation";
import { useRouter } from "next/navigation";
import { useTripContext } from "@/context/TripContext";

// Disable SSR for Leaflet map component
const MapView = dynamic(() => import("@/components/map/MapView"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 animate-pulse" />
});

export default function MapPage() {
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const { selectedPlaces: tripPlaces } = useTripContext();
  const { t } = useTranslation("map");
  const router = useRouter();

  if (tripPlaces.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col bg-zinc-50 relative">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">{t.title}</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-[250px]">No places to show yet. Go to Explore or paste a social link to build your route.</p>
          <button 
            onClick={() => router.push("/explore")}
            className="px-6 py-2.5 bg-coral-500 text-white font-semibold rounded-full text-sm shadow-sm active:scale-95 transition-all"
          >
            Go to Explore
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-50 relative">
      {/* Map Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-5 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{t.title}</h1>
        <p className="text-sm text-white/90 drop-shadow-md font-medium">{t.subtitle}</p>
      </div>

      {/* Fullscreen Map */}
      <div className="flex-1 w-full relative z-0">
        <MapView 
          places={tripPlaces} 
          activePlaceId={activePlace?.id}
          onMarkerClick={(p) => setActivePlace(p)}
        />
      </div>

      {/* Floating Bottom Sheet (Mini Timeline) */}
      <div className="absolute bottom-20 left-0 right-0 z-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{t.placesOnRoute}</span>
            <span className="text-xs font-medium text-coral-500 bg-coral-50 px-2 py-0.5 rounded-full">{tripPlaces.length} {t.spots}</span>
          </div>
          <div className="flex overflow-x-auto p-3 gap-3 snap-x pb-4 scrollbar-hide">
            {tripPlaces.map((place) => (
              <div 
                key={place.id}
                onClick={() => setActivePlace(place)}
                className={`shrink-0 w-48 rounded-xl border p-2 cursor-pointer transition-all snap-start ${
                  activePlace?.id === place.id 
                    ? "border-coral-500 shadow-md bg-coral-50/50" 
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex gap-2">
                  <img src={place.imageUrl} alt={place.nameTh} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{place.nameTh}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{place.zone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
