"use client";

import { ProfileHeader } from "@/components/layout/ProfileHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { UnifiedInput } from "@/components/home/UnifiedInput";
import { TrendingPlaces } from "@/components/home/TrendingPlaces";
import { useTripContext } from "@/context/TripContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export default function HomePage() {
  const { selectedPlaces } = useTripContext();
  const router = useRouter();
  const { t } = useTranslation("home");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) {
      router.push('/onboarding');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) {
    return <div className="min-h-screen bg-zinc-50" />; // Empty state while checking
  }

  // Frictionless UX: If they just opened the app and have a trip, maybe we want to show it.
  // But since they can click the "My Route" tab, we'll keep Home as pure Discover.

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <ProfileHeader />

      <main className="px-5 pt-8">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-6 whitespace-pre-line">
          {t.whereTo}
        </h1>
        
        <UnifiedInput />
        
        {selectedPlaces.length > 0 && (
          <div className="mt-8 mb-4">
             <button 
                onClick={() => router.push("/route")}
                className="w-full bg-coral-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-coral-500/20 active:scale-95 transition-all"
              >
                <div className="text-left">
                  <p className="font-bold text-sm">{t.resumeTrip}</p>
                  <p className="text-xs text-white/80">{selectedPlaces.length} {t.placesSelected}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                   <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
             </button>
          </div>
        )}

        <TrendingPlaces />
      </main>

      <BottomNav />
    </div>
  );
}
