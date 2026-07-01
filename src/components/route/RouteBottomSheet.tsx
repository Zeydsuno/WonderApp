"use client";

import { useState } from "react";
import { TimelineView } from "@/components/timeline/TimelineView";
import { useTripContext } from "@/context/TripContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import { motion, PanInfo, useDragControls } from "framer-motion";
import { SearchModal } from "@/components/route/SearchModal";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { SaveTripModal } from "@/components/route/SaveTripModal";
import { useRouteTimes } from "@/hooks/useRouteTimes";

export function RouteBottomSheet() {
  const { selectedPlaces, activeDetailPlace, setActiveDetailPlace, setActivePreviewPlace, clearTrip, tripStartTime, setTripStartTime, userLocation } = useTripContext();
  const [expanded, setExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useTranslation("route");
  const { saveTrip } = useSavedTrips();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const dragControls = useDragControls();

  const { slots, initialTransitMin, isCalculating } = useRouteTimes(selectedPlaces, tripStartTime, userLocation);

  const handleOpenGoogleMaps = () => {
    if (selectedPlaces.length === 0) return;
    
    let originStr = "";
    if (userLocation) {
      originStr = `${userLocation[0]},${userLocation[1]}`;
    } else {
      originStr = encodeURIComponent(`${selectedPlaces[0].nameTh} ${selectedPlaces[0].zone}`);
    }

    const destPlace = selectedPlaces[selectedPlaces.length - 1];
    const destStr = encodeURIComponent(`${destPlace.nameTh} ${destPlace.zone}`);

    let waypoints = "";
    const waypointPlaces = userLocation ? selectedPlaces.slice(0, -1) : selectedPlaces.slice(1, -1);
    
    if (waypointPlaces.length > 0) {
      waypoints = waypointPlaces.map(p => encodeURIComponent(`${p.nameTh} ${p.zone}`)).join('|');
    }

    let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    window.open(url, '_blank');
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) setExpanded(true);
    else if (info.offset.y > 50) setExpanded(false);
  };

  return (
    <>
    <motion.div 
      drag="y"
      dragControls={dragControls}
      dragListener={false}
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
        className="w-full h-10 flex items-center justify-center cursor-pointer shrink-0 touch-none"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 pb-3 border-b border-zinc-200 shrink-0 flex items-center justify-between gap-1.5 md:gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-bold text-zinc-900 truncate">{t.yourRoute}</h2>
          <span className="text-[10px] font-bold bg-coral-100 text-coral-600 px-1.5 py-0.5 rounded-full shrink-0">
            {selectedPlaces.length}
          </span>
          {selectedPlaces.length > 0 && (
            <div className="flex items-center bg-zinc-100 rounded-lg px-2 py-1 ml-1" onPointerDown={(e) => e.stopPropagation()}>
              <svg className="w-3 h-3 text-zinc-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input 
                type="time" 
                value={tripStartTime}
                onChange={(e) => setTripStartTime(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-700 outline-none w-[60px]"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedPlaces.length > 0 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if(window.confirm(t.clearRouteAlert)) {
                    clearTrip();
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()} // Crucial for framer-motion to not swallow the click!
                className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                title="Clear Route"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => setIsSearchOpen(true)}
            onPointerDown={(e) => e.stopPropagation()} // prevent drag
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden min-[375px]:inline">{t.addPlace}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Timeline */}
      <div 
        className="flex-1 overflow-y-auto pt-2"
        onPointerDown={(e) => e.stopPropagation()} 
        onTouchStart={(e) => e.stopPropagation()} 
        onWheel={(e) => e.stopPropagation()}
      >
        {selectedPlaces.length > 0 ? (
          <div className="flex flex-col h-full">
            <TimelineView 
              slots={slots} 
              isCalculating={isCalculating}
              initialTransitMin={initialTransitMin}
              onPlaceClick={(place) => {
                setActivePreviewPlace(place);
                setExpanded(false);
              }} 
            />
            {/* Spacer for sticky footer */}
            <div className="h-44 shrink-0 pointer-events-none" />
          </div>
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

      {/* Sticky Footer */}
      {selectedPlaces.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-20 bg-white/90 backdrop-blur-md border-t border-zinc-200/50 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
          <button
            onClick={handleOpenGoogleMaps}
            className="flex-1 py-3.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex-[2] py-3.5 bg-coral-500 text-white rounded-xl font-bold shadow-lg shadow-coral-500/30 hover:bg-coral-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t.saveItinerary}
          </button>
        </div>
      )}
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

    {/* Custom Save Trip Modal */}
    <SaveTripModal 
      isOpen={isSaveModalOpen} 
      onClose={() => setIsSaveModalOpen(false)} 
      onSave={async (name) => {
        await saveTrip(name, selectedPlaces);
      }} 
    />
    </>
  );
}
