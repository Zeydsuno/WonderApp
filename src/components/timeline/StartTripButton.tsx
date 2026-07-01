"use client";

import { Button } from "@/components/ui/Button";

interface StartTripButtonProps {
  waypoints: { lat: number; lng: number; name: string }[];
}

export function StartTripButton({ waypoints }: StartTripButtonProps) {
  const handleStart = () => {
    if (waypoints.length === 0) return;
    // Build Google Maps Universal Link with waypoints
    const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
    const destination = `${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`;
    const waypointStr = waypoints
      .slice(1, -1)
      .map((w) => `${w.lat},${w.lng}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypointStr) url += `&waypoints=${waypointStr}`;
    url += "&travelmode=driving";

    window.open(url, "_blank");
  };

  return (
    <div className="px-5 py-4">
      <Button size="large" className="w-full" onClick={handleStart}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
        Start trip
      </Button>
    </div>
  );
}
