import { NextResponse } from 'next/server';
import { getFallbackImage } from '@/lib/fallbacks';
import { Redis } from '@upstash/redis';

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const apiKey = process.env.FOURSQUARE_API_KEY;

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat or lng" }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Cache Strategy: Round coordinates to 2 decimal places (~1.1km radius)
    // Anyone within the same ~1km grid will share the same cached places!
    const roundedLat = parseFloat(lat).toFixed(2);
    const roundedLng = parseFloat(lng).toFixed(2);
    const cacheKey = `nearby:${roundedLat},${roundedLng}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[API] ⚡ Redis Cache HIT for Nearby: ${cacheKey}`);
        return NextResponse.json(cached);
      }
    }

    // Call Foursquare Places API
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: '5000', // 5km radius
      limit: '4',
      categories: '16000,13000,19000' // Landmarks, Dining, Travel
    });

    const response = await fetch(`https://places-api.foursquare.com/places/search?${params}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Places-Api-Version": "2025-06-17",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Fetch photos for each place concurrently
    const enrichedResults = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.results.map(async (p: any) => {
        let imageUrl = getFallbackImage(p.categories?.[0]?.name); // Smart fallback
        
        try {
          const photoRes = await fetch(`https://places-api.foursquare.com/places/${p.fsq_place_id}/photos?limit=1`, {
            headers: { 
              "Authorization": `Bearer ${apiKey}`, 
              "X-Places-Api-Version": "2025-06-17",
              "Accept": "application/json" 
            }
          });
          if (photoRes.ok) {
            const photos = await photoRes.json();
            if (photos && photos.length > 0) {
              imageUrl = `${photos[0].prefix}original${photos[0].suffix}`;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch photo for FSQ ID: ${p.fsq_id}`, e);
        }

        return {
          id: p.fsq_place_id,
          nameTh: p.name,
          nameEn: p.name,
          description: p.categories?.[0]?.name || "Nearby Place",
          lat: p.latitude || parseFloat(lat),
          lng: p.longitude || parseFloat(lng),
          status: ["Realtime Data"],
          theme: ["Nearby"],
          estDuration: 60,
          priceLevel: p.price === 1 ? "฿" : p.price === 2 ? "฿฿" : "฿฿฿",
          operatingHours: "10:00 - 20:00", 
          bestTimeToVisit: "Anytime",
          zone: "Nearby",
          keyActivities: ["Explore"],
          imageUrl,
        };
      })
    );

    const result = { places: enrichedResults };

    if (redis && enrichedResults.length > 0) {
      console.log(`[API] 💾 Saving Nearby Places to Redis: ${cacheKey}`);
      await redis.set(cacheKey, result, { ex: 86400 }); // Cache for 24 hours
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Nearby API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
