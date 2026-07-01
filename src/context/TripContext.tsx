"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Place } from "@/data/places";

interface TripContextType {
  selectedPlaces: Place[];
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  reorderPlaces: (startIndex: number, endIndex: number) => void;
  updatePlaceDuration: (placeId: string, durationMin: number) => void;
  clearTrip: () => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  lastSearchResults: Place[];
  setLastSearchResults: (results: Place[]) => void;
  activeDetailPlace: Place | null;
  setActiveDetailPlace: (place: Place | null) => void;
  activePreviewPlace: Place | null;
  setActivePreviewPlace: (place: Place | null) => void;
  recentPlaces: Place[];
  addRecentPlace: (place: Place) => void;
  likedPlaces: Place[];
  toggleLikePlace: (place: Place) => void;
  isPlaceLiked: (id: string) => boolean;
  tripStartTime: string;
  setTripStartTime: (time: string) => void;
  userLocation: [number, number] | null;
  setUserLocation: (loc: [number, number] | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [lastSearchResults, setLastSearchResults] = useState<Place[]>([]);
  const [activeDetailPlace, setActiveDetailPlace] = useState<Place | null>(null);
  const [activePreviewPlace, setActivePreviewPlace] = useState<Place | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [tripStartTime, setTripStartTime] = useState("10:00");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedPlaces = localStorage.getItem("wanderapp_trip");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedPlaces) setSelectedPlaces(JSON.parse(storedPlaces));
      
      const storedQuery = localStorage.getItem("wanderapp_query");
      if (storedQuery) setLastSearchQuery(storedQuery);
      
      const storedResults = localStorage.getItem("wanderapp_results");
      if (storedResults) setLastSearchResults(JSON.parse(storedResults));

      const storedRecent = localStorage.getItem("wanderapp_recent");
      if (storedRecent) setRecentPlaces(JSON.parse(storedRecent));

      const storedLiked = localStorage.getItem("wanderapp_liked");
      if (storedLiked) setLikedPlaces(JSON.parse(storedLiked));

      const storedStartTime = localStorage.getItem("wanderapp_start_time");
      if (storedStartTime) setTripStartTime(storedStartTime);
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("wanderapp_trip", JSON.stringify(selectedPlaces));
    localStorage.setItem("wanderapp_query", lastSearchQuery);
    localStorage.setItem("wanderapp_results", JSON.stringify(lastSearchResults));
    localStorage.setItem("wanderapp_recent", JSON.stringify(recentPlaces));
    localStorage.setItem("wanderapp_liked", JSON.stringify(likedPlaces));
    localStorage.setItem("wanderapp_start_time", tripStartTime);
  }, [selectedPlaces, lastSearchQuery, lastSearchResults, recentPlaces, likedPlaces, tripStartTime, isLoaded]);

  const addPlace = (place: Place) => {
    setSelectedPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removePlace = (id: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlaceDuration = (placeId: string, durationMin: number) => {
    setSelectedPlaces(prev => prev.map(p => 
      p.id === placeId ? { ...p, estDuration: durationMin } : p
    ));
  };

  const clearTrip = () => {
    setSelectedPlaces([]);
  };

  const addRecentPlace = (place: Place) => {
    setRecentPlaces((prev) => {
      // Remove if it exists, then add to front
      const filtered = prev.filter(p => p.id !== place.id);
      return [place, ...filtered].slice(0, 10); // Keep max 10
    });
  };

  const reorderPlaces = (startIndex: number, endIndex: number) => {
    setSelectedPlaces((prev) => {
      const newPlaces = [...prev];
      const [moved] = newPlaces.splice(startIndex, 1);
      newPlaces.splice(endIndex, 0, moved);
      return newPlaces;
    });
  };

  const toggleLikePlace = (place: Place) => {
    setLikedPlaces((prev) => {
      const exists = prev.some(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      }
      return [place, ...prev];
    });
  };

  const isPlaceLiked = (id: string) => likedPlaces.some(p => p.id === id);

  return (
    <TripContext.Provider value={{ 
      selectedPlaces, addPlace, removePlace, reorderPlaces,
      updatePlaceDuration,
      clearTrip,
      lastSearchQuery, setLastSearchQuery,
      lastSearchResults, setLastSearchResults,
      activeDetailPlace, setActiveDetailPlace,
      activePreviewPlace, setActivePreviewPlace,
      recentPlaces, addRecentPlace,
      likedPlaces, toggleLikePlace, isPlaceLiked,
      tripStartTime, setTripStartTime,
      userLocation, setUserLocation
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
}
