import { NextResponse } from 'next/server';
import { places as mockPlaces } from '@/data/places';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ results: [] });

  const apiKey = process.env.MAPBOX_API_KEY;

  if (!apiKey) {
    // Simulated fast autocomplete without API key
    const filtered = mockPlaces.filter(p => 
      p.nameTh.includes(query) || p.nameEn.toLowerCase().includes(query.toLowerCase())
    );
    return NextResponse.json({ results: filtered });
  }

  try {
    // Fast Mapbox Geocoding Call
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${apiKey}&types=poi,place&limit=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Mapbox API failed');
    
    const data = await res.json();
    
    // Normalize to our Place format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.features.map((f: any) => ({
      id: f.id,
      nameTh: f.text,
      nameEn: f.text,
      description: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
      status: ["Autocomplete"],
      theme: ["General"],
      estDuration: 60,
      priceLevel: "฿฿",
      operatingHours: "N/A",
      bestTimeToVisit: "Anytime",
      zone: f.context?.[0]?.text || "Unknown Zone",
      keyActivities: ["Visit"],
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Autocomplete Error:", error);
    // Ultimate fallback if Mapbox fails
    return NextResponse.json({ results: mockPlaces.slice(0, 3) });
  }
}
