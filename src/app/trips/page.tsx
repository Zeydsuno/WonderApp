"use client";

import { useRouter } from "next/navigation";
import { useSavedTrips } from "@/hooks/useSavedTrips";
import { useTripContext } from "@/context/TripContext";
import { useState } from "react";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function TripsPage() {
  const router = useRouter();
  const { trips, isLoading, deleteTrip } = useSavedTrips();
  const { clearTrip, addPlace, likedPlaces, activeDetailPlace, setActiveDetailPlace } = useTripContext();
  const [activeTab, setActiveTab] = useState<'trips' | 'places'>('trips');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadTripToRoute = (trip: any) => {
    clearTrip();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trip.places.forEach((p: any) => addPlace(p));
    router.push('/route');
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-8 rounded-b-[40px] shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-zinc-900">Saved</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'trips' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
            }`}
          >
            Trips
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'places' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
            }`}
          >
            Places
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={tripToDelete !== null}
        title="Delete Saved Trip?"
        description="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Yes, delete it"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (tripToDelete) {
            deleteTrip(tripToDelete);
            setTripToDelete(null);
          }
        }}
        onCancel={() => setTripToDelete(null)}
      />

      {/* Content */}
      <div className="px-5 mt-6 flex flex-col gap-4 pb-12">
        {activeTab === 'trips' ? isLoading ? (
          <div className="text-center text-zinc-500 py-10 animate-pulse">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center text-center mt-12">
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">No saved trips yet</h2>
            <p className="text-sm text-zinc-500 mb-8 max-w-[250px]">
              Places you save or itineraries you generate will appear here.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="bg-coral-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-coral-500/30 active:scale-95 transition-all"
            >
              Explore Places
            </button>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-zinc-900 text-lg">{trip.title}</h3>
                <button 
                  onClick={() => setTripToDelete(trip.id)}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-colors hover:bg-red-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-4">{trip.places.length} places • {new Date(trip.created_at || new Date().toISOString()).toLocaleDateString()}</p>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {trip.places.slice(0, 3).map((p, i) => (
                  <span key={i} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    {p.nameEn}
                  </span>
                ))}
                {trip.places.length > 3 && (
                  <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">+{trip.places.length - 3}</span>
                )}
              </div>
              
              <button 
                onClick={() => loadTripToRoute(trip)}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-coral-500 hover:bg-coral-600 active:scale-95 transition-all shadow-md shadow-coral-500/30"
              >
                Load Trip
              </button>
            </div>
          ))
        ) : (
          likedPlaces.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-12">
              <div className="w-24 h-24 bg-coral-50 rounded-full flex items-center justify-center mb-6 text-coral-300">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">No liked places yet</h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-[250px]">
                Tap the heart icon on any place to save it here for later.
              </p>
              <button 
                onClick={() => router.push('/')}
                className="bg-coral-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-coral-500/30 active:scale-95 transition-all"
              >
                Explore Places
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {likedPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={() => setActiveDetailPlace(place)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {activeDetailPlace && (
        <PlaceDetail
          place={activeDetailPlace}
          onClose={() => setActiveDetailPlace(null)}
          onAdd={(p) => {
            addPlace(p);
            setActiveDetailPlace(null);
            router.push('/route');
          }}
        />
      )}
    </div>
  );
}
