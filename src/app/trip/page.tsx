"use client";

import { useState } from "react";
import { ItineraryHeader } from "@/components/itinerary/ItineraryHeader";
import { TimelineView } from "@/components/timeline/TimelineView";
import { BudgetEstimate } from "@/components/itinerary/BudgetEstimate";
import { StartTripButton } from "@/components/timeline/StartTripButton";
import { PlaceCard } from "@/components/places/PlaceCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toast } from "@/components/ui/Toast";
import { places } from "@/data/places";
import { useTranslation } from "@/i18n/useTranslation";

import { useRouter } from "next/navigation";
import { useTripContext } from "@/context/TripContext";

export default function TripPage() {
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: "" });
  const { selectedPlaces, removePlace } = useTripContext();
  const { t } = useTranslation("trip");

  const slots = selectedPlaces.map((place, index) => {
    return {
      place,
      startTime: `${10 + index}:00`,
      endTime: `${10 + index + Math.floor(place.estDuration / 60)}:${(place.estDuration % 60).toString().padStart(2, "0")}`,
      transitMin: 15
    };
  });

  const handleShuffle = () => {
    setToast({ visible: true, message: t.shuffledMsg });
  };

  const handleRemoveSlot = (index: number) => {
    removePlace(slots[index].place.id);
    setToast({ visible: true, message: "Place removed from timeline" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <ItineraryHeader
        placeCount={slots.length}
        budgetRange="150 - 500 THB"
        onShuffle={handleShuffle}
      />

      <div className="flex-1 p-5 overflow-y-auto">
        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-sm text-zinc-500 mb-4">{t.noPlacesDesc}</p>
            <button
              onClick={() => router.push("/explore")}
              className="px-4 py-2 bg-coral-500 text-white rounded-xl text-sm font-semibold hover:bg-coral-600 transition-colors"
            >
              Find places to go
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-zinc-200 ml-4 space-y-6">
            {slots.map((slot, index) => (
              <div key={`${slot.place.id}-${index}`} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-coral-500 rounded-full" />
                
                {/* Time */}
                <div className="text-xs font-semibold text-coral-600 mb-2">
                  {slot.startTime} - {slot.endTime}
                </div>
                
                {/* Swipe-to-delete Wrapper */}
                <div className="relative overflow-hidden rounded-2xl -mx-4 px-4">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full pb-2">
                    {/* The Place Card */}
                    <div className="w-full shrink-0 snap-center">
                      <PlaceCard place={slot.place} />
                    </div>
                    
                    {/* Delete Action (revealed by swiping left) */}
                    <div 
                      className="w-20 shrink-0 snap-center bg-red-500 rounded-2xl ml-3 flex flex-col items-center justify-center text-white shadow-inner cursor-pointer active:bg-red-600 transition-colors"
                      onClick={() => handleRemoveSlot(index)}
                    >
                      <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wider">DELETE</span>
                    </div>
                  </div>
                </div>

                {/* Transit line */}
                {index < slots.length - 1 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 font-medium bg-zinc-100 rounded-lg p-2 w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    {slots[index + 1].transitMin} min {t.drive}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BudgetEstimate range="150 - 500 THB" />

      <StartTripButton
        waypoints={slots.map((s) => ({
          lat: s.place.lat,
          lng: s.place.lng,
          name: s.place.nameTh,
        }))}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ visible: false, message: "" })}
      />

      <BottomNav />
    </div>
  );
}
