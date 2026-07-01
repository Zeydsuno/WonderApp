"use client";

import { useState } from "react";
import { TimelineView } from "@/components/timeline/TimelineView";
import { useTripContext } from "@/context/TripContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import { motion, PanInfo } from "framer-motion";
import { SearchModal } from "@/components/route/SearchModal";
import { PlaceDetail } from "@/components/places/PlaceDetail";

export function RouteBottomSheet() {
  const { selectedPlaces, activeDetailPlace, setActiveDetailPlace } = useTripContext();
  const [expanded, setExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useTranslation("route");
  const { saveTrip } = useSavedTrips();
  const [isSaving, setIsSaving] = useState(false);

  // Map to slot data
  const slots = selectedPlaces.map(p => ({
    place: p,
    startTime: "", // calculated by TimelineView
    endTime: "",
    transitMin: 15,
  }));

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) setExpanded(true);
    else if (info.offset.y > 50) setExpanded(false);
  };

  return (
    <>
    <motion.div 
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{ height: expanded ? "85vh" : "40vh" }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="absolute bottom-0 left-0 right-0 bg-zinc-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 flex flex-col"
    >
      {/* Drag Handle */}
      <div 
        className="w-full h-10 flex items-center justify-center cursor-pointer shrink-0"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-5 pb-3 border-b border-zinc-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-900">{t.yourRoute}</h2>
          <span className="text-xs font-semibold bg-coral-100 text-coral-600 px-2 py-0.5 rounded-full">
            {selectedPlaces.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedPlaces.length > 0 && (
            <button
              onClick={async () => {
                const name = window.prompt("Name your trip:", "My Awesome Trip");
                if (name) {
                  setIsSaving(true);
                  await saveTrip(name, selectedPlaces);
                  setIsSaving(false);
                  alert("Trip saved to your profile!");
                }
              }}
              disabled={isSaving}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(true)}
            onPointerDown={(e) => e.stopPropagation()} // prevent drag
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Place
          </button>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div 
        className="flex-1 overflow-y-auto pb-24 pt-2"
        onPointerDown={(e) => e.stopPropagation()} // Stop drag when scrolling timeline
      >
        {selectedPlaces.length > 0 ? (
          <TimelineView initialSlots={slots} onPlaceClick={setActiveDetailPlace} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
             <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
             </div>
             <p className="text-zinc-500 text-sm">{t.emptyRoute}</p>
             <p className="text-zinc-400 text-xs mt-1">{t.emptyRouteDesc}</p>
          </div>
        )}
      </div>
    </motion.div>

    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    
    {/* Detail Modal */}
    {activeDetailPlace && (
      <PlaceDetail
        place={activeDetailPlace}
        onClose={() => setActiveDetailPlace(null)}
        onAdd={() => {
          setActiveDetailPlace(null);
        }}
      />
    )}
    </>
  );
}
