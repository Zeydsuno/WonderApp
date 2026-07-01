"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Place } from "@/data/places";

// Custom Coral Marker Icon
const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-fitting bounds and fly-to
function MapController({ places, activePlaceId }: { places: Place[], activePlaceId?: string }) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0 && !activePlaceId) {
      const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map, activePlaceId]);

  useEffect(() => {
    if (activePlaceId) {
      const p = places.find(p => p.id === activePlaceId);
      if (p) {
        map.flyTo([p.lat, p.lng], 16, { duration: 1.5 });
      }
    }
  }, [activePlaceId, places, map]);

  return null;
}

interface MapViewProps {
  places: Place[];
  activePlaceId?: string;
  onMarkerClick?: (place: Place) => void;
}

export default function MapView({ places, activePlaceId, onMarkerClick }: MapViewProps) {
  // Fix Leaflet SSR issue
  const [mounted, setMounted] = useState(false);
  
  // State for road polyline
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (places.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoutePositions([]);
      return;
    }

    const fetchRoute = async () => {
      setIsRouting(true);
      try {
        // Proxy request to our backend
        const coordsStr = places.map(p => `${p.lng},${p.lat}`).join(';');
        const res = await fetch(`/api/route-osrm?coords=${coordsStr}`);
        if (!res.ok) throw new Error("OSRM fetch failed");
        const data = await res.json();
        
        if (data.code === "Ok" && data.routes.length > 0) {
          const geojsonCoords = data.routes[0].geometry.coordinates;
          // Leaflet expects [lat, lng]
          const leafletCoords = geojsonCoords.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRoutePositions(leafletCoords);
        }
      } catch (err) {
        console.error("Routing error, falling back to straight lines:", err);
        // Fallback to straight lines if OSRM fails
        setRoutePositions(places.map(p => [p.lat, p.lng] as [number, number]));
      } finally {
        setIsRouting(false);
      }
    };

    fetchRoute();
  }, [places]);

  if (!mounted) return <div className="w-full h-full bg-zinc-100 animate-pulse" />;

  const center: [number, number] = places.length > 0 ? [places[0].lat, places[0].lng] : [13.7563, 100.5018];

  return (
    <div className="w-full h-full relative z-0">
      {/* Routing Loading Indicator */}
      {isRouting && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-zinc-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <div className="w-4 h-4 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-zinc-700">Calculating route...</span>
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController places={places} activePlaceId={activePlaceId} />

        {/* Route Line */}
        {routePositions.length > 1 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ color: "#f43f5e", weight: 5, opacity: 0.9 }} 
          />
        )}

        {/* Markers */}
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(place)
            }}
          />
        ))}
      </MapContainer>
      
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
