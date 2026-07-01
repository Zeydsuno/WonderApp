import { useState, useEffect } from 'react';
import type { Place } from '@/data/places';

export interface SlotData {
  id: string;
  place: Place;
  type: "place";
  startTime: string;
  endTime: string;
  transitMin: number;
}

export function useRouteTimes(selectedPlaces: Place[], tripStartTime: string, userLocation: [number, number] | null) {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [initialTransitMin, setInitialTransitMin] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (selectedPlaces.length === 0) {
      setSlots([]);
      setInitialTransitMin(null);
      return;
    }

    let isMounted = true;

    async function calculateRoute() {
      setIsCalculating(true);
      
      const newSlots: SlotData[] = selectedPlaces.map((place, index) => ({
        id: `slot-${place.id}-${index}`,
        place,
        type: "place",
        startTime: "",
        endTime: "",
        transitMin: 15, // default fallback
      }));

      // Fetch initial transit time from user location to first place
      let calculatedInitialTransit: number | null = null;
      if (userLocation) {
        try {
          const dest = selectedPlaces[0];
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${dest.lng},${dest.lat}?overview=false`);
          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              const durationSec = data.routes[0].duration;
              calculatedInitialTransit = Math.max(1, Math.round(durationSec / 60) + 5);
            }
          }
        } catch (error) {
          console.warn("OSRM initial calculation failed", error);
        }
      }

      // Fetch actual transit times between consecutive places
      for (let i = 0; i < selectedPlaces.length - 1; i++) {
        const origin = selectedPlaces[i];
        const dest = selectedPlaces[i + 1];
        
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`);
          if (res.ok) {
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
              const durationSec = data.routes[0].duration;
              // Add 5 mins buffer for parking/walking and round to nearest minute
              const transitMin = Math.max(1, Math.round(durationSec / 60) + 5);
              newSlots[i + 1].transitMin = transitMin;
            }
          }
        } catch (error) {
          console.warn("OSRM calculation failed for", origin.nameTh, "to", dest.nameTh, error);
        }
      }

      if (!isMounted) return;

      // Now calculate all start/end times based on the start time string
      const [startH, startM] = tripStartTime.split(':').map(Number);
      let currentMinutes = (startH * 60) + (startM || 0);

      if (calculatedInitialTransit) {
        currentMinutes += calculatedInitialTransit;
      }

      const computedSlots = newSlots.map((slot, i) => {
        if (i > 0) currentMinutes += slot.transitMin; // add transit from previous place
        
        const startMin = currentMinutes;
        const endMin = startMin + slot.place.estDuration;
        
        currentMinutes = endMin; // advance time for next calculation
        
        const fmt = (m: number) => {
          // Handle past midnight by wrapping around 24*60
          const totalM = m % (24 * 60);
          const h = Math.floor(totalM / 60);
          const mm = totalM % 60;
          return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
        };

        return {
          ...slot,
          startTime: fmt(startMin),
          endTime: fmt(endMin)
        };
      });

      setSlots(computedSlots);
      setInitialTransitMin(calculatedInitialTransit);
      setIsCalculating(false);
    }

    calculateRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedPlaces, tripStartTime, userLocation]);

  return { slots, initialTransitMin, isCalculating };
}
