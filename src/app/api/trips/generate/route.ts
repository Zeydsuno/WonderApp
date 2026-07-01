import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { knapsackSelect, greedyTSP, buildTimeline, PlaceModel } from "@/lib/itinerary-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { placeIds, startTime = "10:00", timeBudget = 360 } = body;

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json({ error: "placeIds array is required" }, { status: 400 });
    }

    // 1. Fetch places from DB
    const { data: placesData, error } = await supabase
      .from("places")
      .select("*")
      .in("id", placeIds);

    if (error) throw error;
    if (!placesData || placesData.length === 0) {
      return NextResponse.json({ itinerary: [] });
    }

    // Map to PlaceModel
    const places: PlaceModel[] = placesData.map(p => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      estDuration: p.est_duration,
      nameTh: p.name_th
    }));

    // 2. Select places within time budget (Knapsack)
    const selectedPlaces = knapsackSelect(places, timeBudget);

    // 3. Order places by distance (Greedy TSP)
    const orderedPlaces = greedyTSP(selectedPlaces);

    // 4. Build timeline
    const itinerary = buildTimeline(orderedPlaces, startTime);

    // Calculate budget estimate (mocked based on counts for now, or could use DB field)
    let minBudget = 0;
    let maxBudget = 0;
    placesData.forEach(p => {
      if (p.price_level === "฿") { minBudget += 50; maxBudget += 150; }
      else if (p.price_level === "฿฿") { minBudget += 150; maxBudget += 300; }
      else if (p.price_level === "฿฿฿") { minBudget += 300; maxBudget += 1000; }
    });

    const estimatedBudget = minBudget === 0 ? "Free" : `${minBudget} - ${maxBudget} THB`;

    return NextResponse.json({ 
      itinerary,
      estimatedBudget,
      places: placesData // Send back full place info for UI
    });
  } catch (error: unknown) {
    console.error("Generate trip error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to generate trip" }, { status: 500 });
  }
}
