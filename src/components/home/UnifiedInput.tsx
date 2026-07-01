"use client";

import { useState, useEffect } from "react";
import { useTripContext } from "@/context/TripContext";
import { type Place } from "@/data/places";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PlaceDetail } from "@/components/places/PlaceDetail";

interface UnifiedInputProps {
  onComplete?: () => void;
}

export function UnifiedInput({ onComplete }: UnifiedInputProps = {}) {
  const { 
    selectedPlaces, addPlace, removePlace,
    lastSearchQuery: query, setLastSearchQuery: setQuery,
    lastSearchResults: searchResults, setLastSearchResults: setSearchResults
  } = useTripContext();
  
  const [loading, setLoading] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [selectedDetailPlace, setSelectedDetailPlace] = useState<Place | null>(null);
  const router = useRouter();
  const { t } = useTranslation("home");

  const isUrl = (str: string) => {
    return str.includes("tiktok.com") || str.includes("instagram.com") || str.startsWith("http");
  };

  const handleAutocomplete = async (val: string) => {
    if (!val || isUrl(val)) {
      setSearchResults([]);
      return;
    }
    setIsAutocompleteLoading(true);
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("Autocomplete error:", e);
    } finally {
      setIsAutocompleteLoading(false);
    }
  };

  const handleSearchPlaces = async (val: string) => {
    if (!val || isUrl(val)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/search-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: val }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleParseSocial = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/parse-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("Parse social error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val && !isUrl(val)) {
      setIsAutocompleteLoading(true);
    }
  };

  // Debounce autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isUrl(query) && query.length > 15) {
        handleParseSocial(query);
      } else {
        handleAutocomplete(query);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isUrl(query)) {
        handleParseSocial(query);
      } else {
        handleSearchPlaces(query); // Smart AI search for long sentences
      }
    }
  };

  const togglePlace = (place: Place) => {
    const isAdded = selectedPlaces.some((p) => p.id === place.id);
    if (isAdded) {
      removePlace(place.id);
    } else {
      addPlace(place);
    }
  };


  return (
    <>
      <div className="w-full relative">
        <div className="relative flex items-center bg-white shadow-xl shadow-zinc-200/50 rounded-2xl border border-zinc-100 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-coral-500/50">
        <div className="pl-4 text-zinc-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t.whereToPlaceholder}
          className="w-full py-4 px-3 text-base text-zinc-900 bg-transparent outline-none placeholder:text-zinc-400 font-medium"
        />
        {loading && (
          <div className="pr-4">
            <div className="w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results / Skeleton Dropdown */}
      {(query || loading) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50">
          
          {/* Skeleton Loading State */}
          {(loading || isAutocompleteLoading) ? (
            <div className="flex flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full flex items-center gap-3 p-3 border-b border-zinc-50 last:border-0 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200" />
                  <div className="flex-1 min-w-0 py-1">
                    <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-zinc-200 rounded w-1/3" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-100" />
                </div>
              ))}
              {loading && (
                <div className="p-3 text-center border-t border-zinc-50 bg-zinc-50/50">
                  <p className="text-xs text-zinc-500 font-medium flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
                    {isUrl(query) ? "AI is parsing places from link..." : `✨ AI is generating best spots in "${query}"...`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Actual Results */
            searchResults.length > 0 ? (
              <div className="flex flex-col">
                {searchResults.slice(0, 5).map((place) => {
                  const isAdded = selectedPlaces.some((p) => p.id === place.id);
                  return (
                    <div
                      key={place.id}
                      className={`w-full flex items-center p-2 transition-colors border-b border-zinc-50 last:border-0 ${
                        isAdded ? "bg-coral-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      {/* Left: View Details */}
                      <button
                        onClick={() => setSelectedDetailPlace(place)}
                        className="flex-1 flex items-center gap-3 text-left overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500/30 p-1"
                      >
                        <img src={place.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"} alt={place.nameTh} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isAdded ? "text-coral-700" : "text-zinc-900"}`}>{place.nameTh}</p>
                          <p className={`text-xs truncate ${isAdded ? "text-coral-600/70" : "text-zinc-500"}`}>{place.zone}</p>
                        </div>
                      </button>

                      {/* Right: Add/Remove Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlace(place);
                        }}
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500/50 ${
                          isAdded ? "bg-coral-500 text-white shadow-md shadow-coral-500/20" : "bg-zinc-100 text-zinc-400 hover:bg-coral-50 hover:text-coral-500"
                        }`}
                        aria-label={isAdded ? "Remove place" : "Add place"}
                      >
                        {isAdded ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
                <div className="p-3 bg-zinc-50/50 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      if (onComplete) onComplete();
                      else router.push("/route");
                    }}
                    className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    View Route ({selectedPlaces.length})
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              !isUrl(query) && (
                <div className="p-4 text-center">
                  <p className="text-sm font-semibold text-zinc-900">ไม่พบสถานที่</p>
                  <p className="text-xs text-zinc-500 mt-1">ลองพิมพ์ชื่อสถานที่ให้ชัดเจนขึ้น หรือกดค้นหาแบบ AI</p>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
      
      {/* Detail Modal */}
      {selectedDetailPlace && (
        <PlaceDetail
          place={selectedDetailPlace}
          onClose={() => setSelectedDetailPlace(null)}
          onAdd={(p) => {
            if (!selectedPlaces.some((sp) => sp.id === p.id)) {
              addPlace(p);
            }
            setSelectedDetailPlace(null);
          }}
        />
      )}
    </>
  );
}
