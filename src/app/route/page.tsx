"use client";

import { RouteMapLayer } from "@/components/route/RouteMapLayer";
import { RouteBottomSheet } from "@/components/route/RouteBottomSheet";
import { BottomNav } from "@/components/layout/BottomNav";

export default function RoutePage() {
  return (
    <div className="h-screen w-full flex flex-col bg-zinc-50 relative overflow-hidden">
      
      {/* Background Map Layer */}
      <RouteMapLayer />

      {/* Foreground Bottom Sheet Timeline */}
      <RouteBottomSheet />

      {/* Bottom Navigation */}
      <BottomNav />
      
    </div>
  );
}
