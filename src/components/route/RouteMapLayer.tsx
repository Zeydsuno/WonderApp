"use client";

import dynamic from "next/dynamic";
import { useTripContext } from "@/context/TripContext";

// Disable SSR for Leaflet map component
const MapView = dynamic(() => import("@/components/map/MapView"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 animate-pulse" />
});

export function RouteMapLayer() {
  const { selectedPlaces, activePreviewPlace, setActiveDetailPlace } = useTripContext();

  return (
    <div className="absolute inset-0 z-0">
      <MapView 
        places={selectedPlaces} 
        activePlaceId={activePreviewPlace?.id}
        onMarkerClick={setActiveDetailPlace} 
      />
    </div>
  );
}
