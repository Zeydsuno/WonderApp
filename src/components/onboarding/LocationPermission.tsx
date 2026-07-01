"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePreferences } from "@/hooks/usePreferences";
import { useTranslation } from "@/i18n/useTranslation";

interface LocationPermissionProps {
  onComplete: (coords: { lat: number; lng: number } | null) => void;
}

export function LocationPermission({ onComplete }: LocationPermissionProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");
  const { updatePreferences } = usePreferences();
  const { t } = useTranslation("onboarding");

  const requestLocation = () => {
    setStatus("loading");
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updatePreferences({ location: coords });
        onComplete(coords);
      },
      () => setStatus("denied")
    );
  };

  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <div className="w-20 h-20 rounded-full bg-coral-50 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-zinc-900 tracking-tight mb-2">
        {t.whereStart}
      </h2>
      <p className="text-base text-zinc-500 mb-8 max-w-[280px]">
        {t.whereStartDesc}
      </p>

      {status === "loading" ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Pinpointing your location...</p>
        </div>
      ) : status === "denied" ? (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-sm text-zinc-500 mb-4">
            No worries. Pick a zone to get started:
          </p>
          <select
            className="w-full h-10 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-coral-100 focus:border-coral-500"
            onChange={(e) => {
              const zones: Record<string, { lat: number; lng: number }> = {
                สยาม: { lat: 13.7454, lng: 100.5340 },
                รามคำแหง: { lat: 13.7563, lng: 100.6243 },
                สุขุมวิท: { lat: 13.7220, lng: 100.5600 },
                สีลม: { lat: 13.7244, lng: 100.5290 },
              };
              const z = zones[e.target.value];
              if (z) {
                updatePreferences({ location: z });
                onComplete(z);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>{t.selectArea}</option>
            <option value="สยาม">สยาม / Siam</option>
            <option value="รามคำแหง">รามคำแหง / Ramkhamhaeng</option>
            <option value="สุขุมวิท">สุขุมวิท / Sukhumvit</option>
            <option value="สีลม">สีลม / Silom</option>
          </select>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <svg className="w-6 h-6 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-xs text-blue-700 font-medium text-left">
              We use your location solely to recommend places near you and calculate travel times accurately. We don&apos;t save your exact coordinates.
            </p>
          </div>
          <Button size="large" onClick={requestLocation} className="w-full">
            Share my location
          </Button>
        </div>
      )}
    </div>
  );
}
