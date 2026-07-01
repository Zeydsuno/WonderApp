import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

interface Preferences {
  notificationsEnabled: boolean;
  vibes: string[];
  hours: number;
  location: { lat: number; lng: number } | null;
  hasOnboarded: boolean;
}

const defaultPreferences: Preferences = {
  notificationsEnabled: true,
  vibes: [],
  hours: 4,
  location: null,
  hasOnboarded: false,
};

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferencesState] = useState<Preferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Load from LocalStorage first (for instant UI)
    const localPrefs = localStorage.getItem("wanderapp_prefs");
    if (localPrefs) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferencesState({ ...defaultPreferences, ...JSON.parse(localPrefs) });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }

    // 2. If logged in, sync from Supabase
    if (user && user.user_metadata?.preferences) {
      const dbPrefs = user.user_metadata.preferences;
      setPreferencesState({ ...defaultPreferences, ...dbPrefs });
      // Overwrite local storage with the cloud version
      localStorage.setItem("wanderapp_prefs", JSON.stringify(dbPrefs));
    }
    
    setIsLoaded(true);
  }, [user]);

  const updatePreferences = async (updates: Partial<Preferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferencesState(newPrefs);
    localStorage.setItem("wanderapp_prefs", JSON.stringify(newPrefs));

    if (user) {
      // Sync to Supabase in the background
      await supabase.auth.updateUser({
        data: { preferences: newPrefs }
      });
    }
  };

  return { preferences, updatePreferences, isLoaded };
}
