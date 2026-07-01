"use client";

import { useState, useEffect } from "react";
import { places as allPlaces, Place } from "@/data/places";
import { tripThemes, type TripTheme } from "@/data/themes";
import { useTripContext } from "@/context/TripContext";
import { useRouter } from "next/navigation";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { ThemeDetail } from "@/components/home/ThemeDetail";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

export function TrendingPlaces() {
  const { addPlace, recentPlaces, activeDetailPlace, setActiveDetailPlace } = useTripContext();
  const router = useRouter();
  
  const [greeting, setGreeting] = useState("Discover");
  const [timeBasedPlaces, setTimeBasedPlaces] = useState<Place[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [activeTheme, setActiveTheme] = useState<TripTheme | null>(null);

  // Time-based logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGreeting("Good Morning ☀️");
      setTimeBasedPlaces(allPlaces.filter(p => p.theme.includes("Cafe") || p.bestTimeToVisit.includes("เช้า")).slice(0, 4));
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon 🌤️");
      setTimeBasedPlaces(allPlaces.filter(p => p.theme.includes("Shopping") || p.theme.includes("Culture")).slice(0, 4));
    } else {
      setGreeting("Good Evening 🌙");
      setTimeBasedPlaces(allPlaces.filter(p => p.theme.includes("Nightlife") || p.operatingHours.includes("24:00")).slice(0, 4));
    }
  }, []);

  const handleAddTheme = (themePlaces: Place[]) => {
    themePlaces.forEach(addPlace);
    router.push("/route");
  };

  const handleExploreNearMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`/api/nearby?lat=${latitude}&lng=${longitude}`);
            if (!res.ok) throw new Error("Failed to fetch nearby places");
            const data = await res.json();
            if (data.places) {
              setNearbyPlaces(data.places);
            }
          } catch (e: unknown) {
            const err = e as Error;
            console.warn("Nearby API fallback triggered:", err.message);
            alert("Could not load nearby places from Foursquare (API Key issue). Showing mock data instead.");
            // Fallback to sorting mock data
            const sorted = [...allPlaces].sort((a, b) => {
              return getDistance(latitude, longitude, a.lat, a.lng) - getDistance(latitude, longitude, b.lat, b.lng);
            });
            setNearbyPlaces(sorted.slice(0, 4));
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Please enable location services to see places near you.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      
      {/* 1. Recent Places (If any) */}
      {recentPlaces.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-zinc-900 mb-3 px-1">
            Recently Viewed
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {recentPlaces.map(place => (
              <button
                key={`recent-${place.id}`}
                onClick={() => setActiveDetailPlace(place)}
                className="snap-start shrink-0 w-32 relative h-40 rounded-2xl overflow-hidden active:scale-95 transition-transform"
              >
                <img src={place.imageUrl} alt={place.nameTh} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-left pr-3">
                  <p className="text-white font-bold text-xs leading-tight shadow-sm line-clamp-2">{place.nameTh}</p>
                  <p className="text-white/80 text-[10px] mt-1">{place.zone}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 2. One-Click Trip Ideas (Themes) */}
      <section>
        <h2 className="text-sm font-bold text-zinc-900 mb-3 px-1">
          Trip Ideas
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
          {tripThemes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme)}
              className="snap-start shrink-0 w-64 relative h-32 rounded-2xl overflow-hidden active:scale-95 transition-transform group"
            >
              <img src={theme.coverImage} alt={theme.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-left">
                <span className="text-2xl mb-1">{theme.emoji}</span>
                <p className="text-white font-black text-lg leading-tight">{theme.title}</p>
                <p className="text-white/80 text-xs mt-0.5">{theme.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Location Aware / GPS */}
      <section>
        <div className="flex items-center justify-between px-1 mb-4">
          <h2 className="text-sm font-bold text-zinc-900">
            {nearbyPlaces.length > 0 ? "📍 Near You" : "Explore"}
          </h2>
          {nearbyPlaces.length === 0 && (
            <button 
              onClick={handleExploreNearMe}
              disabled={isLocating}
              className="text-xs font-semibold text-coral-500 hover:text-coral-600 active:scale-95 transition-all flex items-center gap-1 bg-coral-50 px-3 py-1.5 rounded-full"
            >
              {isLocating ? "Locating..." : "Use GPS"}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {(nearbyPlaces.length > 0 ? nearbyPlaces : timeBasedPlaces).map((place) => (
            <button
              key={`explore-${place.id}`}
              onClick={() => setActiveDetailPlace(place)}
              className="group relative h-48 rounded-2xl overflow-hidden active:scale-95 transition-transform"
            >
              <img src={place.imageUrl} alt={place.nameTh} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{greeting.split(' ')[1]}</span>
              </div>
              <div className="absolute bottom-3 left-3 text-left pr-3">
                <p className="text-white font-bold text-sm leading-tight shadow-sm line-clamp-2">{place.nameTh}</p>
                <p className="text-white/80 text-[10px] mt-1">{place.zone}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Detail Modals */}
      {activeDetailPlace && (
        <PlaceDetail
          place={activeDetailPlace}
          onClose={() => setActiveDetailPlace(null)}
          onAdd={(p) => {
            addPlace(p);
            setActiveDetailPlace(null);
          }}
        />
      )}

      {activeTheme && (
        <ThemeDetail
          theme={activeTheme}
          onClose={() => setActiveTheme(null)}
          onAddAll={(theme) => {
            handleAddTheme(theme.places);
            setActiveTheme(null);
          }}
        />
      )}
    </div>
  );
}
