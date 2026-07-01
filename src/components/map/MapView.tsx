"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Place } from "@/data/places";
import { useTripContext } from "@/context/TripContext";
import { useTranslation } from "@/i18n/useTranslation";

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
function MapController({ places, activePlaceId, markerRefs }: { places: Place[], activePlaceId?: string, markerRefs: React.MutableRefObject<{ [key: string]: L.Marker | null }> }) {
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
        // Programmatically open popup
        setTimeout(() => {
          const marker = markerRefs.current[activePlaceId];
          if (marker) marker.openPopup();
        }, 500); // Wait a bit for flyTo to start
      }
    }
  }, [activePlaceId, places, map, markerRefs]);

  return null;
}

// Component for User Location (Locate Me)
function LocateMeButton({ userLocation, setUserLocation }: { userLocation: [number, number] | null, setUserLocation: (loc: [number, number] | null) => void }) {
  const map = useMap();
  const { t } = useTranslation("map");

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          map.flyTo(coords, 14, { duration: 1.5 });
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Unable to retrieve your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <>
      <div className="absolute top-24 right-4 z-[400]">
        <button 
          onClick={(e) => { e.preventDefault(); handleLocate(); }}
          className="bg-white p-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-zinc-600 hover:text-blue-500 hover:bg-blue-50 transition-all border border-zinc-100"
          title="Locate Me"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </button>
      </div>
      
      {userLocation && (
        <Marker 
          position={userLocation} 
          icon={L.divIcon({
            className: 'user-location-marker',
            html: `<div style="width:16px;height:16px;background-color:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.8);animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup className="custom-popup" closeButton={false}>
            <div className="px-3 py-1.5 text-center text-[11px] font-bold text-blue-600">
              {t.youAreHere}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

interface MapViewProps {
  places: Place[];
  activePlaceId?: string;
  onMarkerClick?: (place: Place) => void;
}

export default function MapView({ places, activePlaceId, onMarkerClick }: MapViewProps) {
  // Fix Leaflet SSR issue
  const [mounted, setMounted] = useState(false);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  
  // Use userLocation from global context
  const { userLocation, setUserLocation } = useTripContext();

  // State for road polyline
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const waypoints: { lat: number; lng: number }[] = [];
    if (userLocation) {
      waypoints.push({ lat: userLocation[0], lng: userLocation[1] });
    }
    places.forEach(p => waypoints.push({ lat: p.lat, lng: p.lng }));

    if (waypoints.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoutePositions([]);
      return;
    }

    const fetchRoute = async () => {
      setIsRouting(true);
      try {
        // Proxy request to our backend
        const coordsStr = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
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
        setRoutePositions(waypoints.map(p => [p.lat, p.lng] as [number, number]));
      } finally {
        setIsRouting(false);
      }
    };

    fetchRoute();
  }, [places, userLocation]);

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
        
        <MapController places={places} activePlaceId={activePlaceId} markerRefs={markerRefs} />
        
        <LocateMeButton userLocation={userLocation} setUserLocation={setUserLocation} />

        {/* Route Line */}
        {routePositions.length > 1 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ color: "#f43f5e", weight: 5, opacity: 0.9 }} 
          />
        )}

        {/* Markers with Popups */}
        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={customIcon}
            ref={(ref) => {
              markerRefs.current[place.id] = ref;
            }}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="w-56 overflow-hidden rounded-xl bg-white">
                <div className="relative h-28 w-full">
                  <img src={place.imageUrl} alt={place.nameTh} className="w-full h-full object-cover" />
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1 shadow-sm">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {place.estDuration}m
                  </div>

                  {/* Theme Badge */}
                  {place.theme && place.theme.length > 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-coral-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] text-white font-bold shadow-sm uppercase tracking-wide">
                      {place.theme[0]}
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-zinc-900 text-[14px] leading-tight line-clamp-2">{place.nameTh}</h3>
                    <span className="text-[10px] font-black text-coral-600 bg-coral-50 border border-coral-100 px-1.5 py-0.5 rounded shrink-0">{place.priceLevel}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1.5 text-zinc-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[11px] font-medium line-clamp-1">{place.zone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[11px] font-medium line-clamp-1">{place.operatingHours}</span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {place.description}
                  </p>
                  
                  <button 
                    onClick={() => onMarkerClick?.(place)}
                    className="mt-3 w-full bg-coral-500 hover:bg-coral-600 text-white text-[12px] font-bold py-2 rounded-lg active:scale-95 transition-all shadow-md shadow-coral-500/30 flex items-center justify-center gap-1.5"
                  >
                    View Details
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          line-height: normal;
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15);
        }
      `}</style>
    </div>
  );
}
