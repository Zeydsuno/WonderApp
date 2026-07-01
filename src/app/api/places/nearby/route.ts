import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5"; // default 5 km

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    // Call the SQL function created in schema.sql
    const { data: places, error } = await supabase
      .rpc("get_nearby_places", {
        p_lat: parseFloat(lat),
        p_lng: parseFloat(lng),
        p_radius_km: parseFloat(radius)
      });

    if (error) throw error;

    return NextResponse.json({ places: places || [] });
  } catch (error: unknown) {
    console.error("Nearby places error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to fetch nearby places" }, { status: 500 });
  }
}
