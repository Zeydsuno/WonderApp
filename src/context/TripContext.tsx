"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Place } from "@/data/places";

interface TripContextType {
  selectedPlaces: Place[];
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  clearTrip: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

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

  return (
    <TripContext.Provider value={{ selectedPlaces, addPlace, removePlace, clearTrip }}>
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
