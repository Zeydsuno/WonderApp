import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Place } from "@/data/places";

export interface SavedTrip {
  id: string;
  user_id?: string;
  title: string;
  places: Place[];
  created_at?: string;
}

export function useSavedTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    
    // Always load from local storage first
    try {
      const local = localStorage.getItem("wanderapp_saved_trips");
      if (local) setTrips(JSON.parse(local));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch(e) {}

    // If logged in, fetch from Supabase
    if (user) {
      const { data, error } = await supabase
        .from('saved_trips')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setTrips(data);
        localStorage.setItem("wanderapp_saved_trips", JSON.stringify(data));
      }
    }
    
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrips();
  }, [loadTrips]);
  const saveTrip = async (title: string, places: Place[]) => {
    const newTrip: SavedTrip = {
      id: crypto.randomUUID(),
      title,
      places,
      created_at: new Date().toISOString()
    };

    const newTrips = [newTrip, ...trips];
    setTrips(newTrips);
    localStorage.setItem("wanderapp_saved_trips", JSON.stringify(newTrips));

    if (user) {
      await supabase.from('saved_trips').insert({
        user_id: user.id,
        title,
        places
      });
      // reload to get actual DB generated ID if needed
      loadTrips();
    }
  };

  const deleteTrip = async (id: string) => {
    const newTrips = trips.filter(t => t.id !== id);
    setTrips(newTrips);
    localStorage.setItem("wanderapp_saved_trips", JSON.stringify(newTrips));

    if (user) {
      await supabase.from('saved_trips').delete().eq('id', id);
    }
  };

  return { trips, isLoading, saveTrip, deleteTrip };
}
