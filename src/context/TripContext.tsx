"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Place } from "@/data/places";

interface TripContextType {
  selectedPlaces: Place[];
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  clearTrip: () => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  lastSearchResults: Place[];
  setLastSearchResults: (results: Place[]) => void;
  activeDetailPlace: Place | null;
  setActiveDetailPlace: (place: Place | null) => void;
  recentPlaces: Place[];
  addRecentPlace: (place: Place) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [lastSearchResults, setLastSearchResults] = useState<Place[]>([]);
  const [activeDetailPlace, setActiveDetailPlace] = useState<Place | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
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
  }, [selectedPlaces, lastSearchQuery, lastSearchResults, recentPlaces, isLoaded]);

  const addPlace = (place: Place) => {
    setSelectedPlaces((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removePlace = (id: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
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

  return (
    <TripContext.Provider value={{ 
      selectedPlaces, addPlace, removePlace, clearTrip,
      lastSearchQuery, setLastSearchQuery,
      lastSearchResults, setLastSearchResults,
      activeDetailPlace, setActiveDetailPlace,
      recentPlaces, addRecentPlace
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
