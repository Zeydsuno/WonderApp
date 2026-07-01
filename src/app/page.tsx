"use client";

import { ProfileHeader } from "@/components/layout/ProfileHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { useTripContext } from "@/context/TripContext";

export default function HomePage() {
  const router = useRouter();
  const { selectedPlaces } = useTripContext();
  const { t } = useTranslation("home");

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <ProfileHeader />

      {/* Quick actions */}
      <div className="px-5 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <Card
            hoverable
            onClick={() => router.push("/social")}
            className="p-4"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-900">{t.pasteLink}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.pasteLinkDesc}
            </p>
          </Card>

          <Card
            hoverable
            onClick={() => router.push("/explore")}
            className="p-4"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-900">{t.browsePlaces}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.browsePlacesDesc}
            </p>
          </Card>
        </div>
      </div>

      {/* Recent trip preview */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-zinc-900">{t.latestTrip || "Your Trip"}</h2>
          {selectedPlaces.length > 0 && (
            <button
              onClick={() => router.push("/trip")}
              className="text-xs text-coral-500 font-medium cursor-pointer hover:text-coral-600"
            >
              {t.viewAll}
            </button>
          )}
        </div>

        {selectedPlaces.length === 0 ? (
          <Card hoverable onClick={() => router.push("/explore")} className="p-6 text-center border-dashed border-2 bg-zinc-50/50">
            <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-900">Start a New Trip</p>
            <p className="text-xs text-zinc-500 mt-1">Browse places or paste a TikTok link to get started.</p>
          </Card>
        ) : (
          <Card hoverable onClick={() => router.push("/trip")} className="overflow-hidden">
            <div className="flex gap-1 h-28">
              {selectedPlaces.slice(0, 4).map((p, i) => (
                <img
                  key={p.id}
                  src={p.imageUrl}
                  alt={p.nameTh}
                  className={`flex-1 object-cover ${i === 0 ? "rounded-l-xl" : ""} ${i === selectedPlaces.slice(0, 4).length - 1 ? "rounded-r-xl" : ""}`}
                />
              ))}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-zinc-900">My Custom Trip</p>
              <p className="text-xs text-zinc-500 mt-0.5">{selectedPlaces.length} places · Tap to view timeline</p>
            </div>
          </Card>
        )}
      </div>

      {/* Getting started hint */}
      <div className="px-5 mt-6">
        <Card className="p-4 bg-zinc-50 border-dashed">
          <p className="text-sm font-medium text-zinc-700">{t.newHere}</p>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {t.newHereDesc}
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="text-xs text-coral-500 font-medium mt-2 cursor-pointer hover:text-coral-600"
          >
            {t.setupPrefs}
          </button>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
