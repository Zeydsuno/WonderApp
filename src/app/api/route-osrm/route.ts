import { NextResponse } from 'next/server';
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
    const coordsStr = url.searchParams.get('coords');
    
    if (!coordsStr) {
      return NextResponse.json({ error: "Missing coords parameter" }, { status: 400 });
    }

    // 1. Check Cache
    const cacheKey = `osrm:route:${coordsStr}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[API] ⚡ Redis Cache HIT for OSRM Route: ${coordsStr}`);
        return NextResponse.json(cached);
      }
    }

    // 2. Fetch from OSRM Demo Server (Proxying it server-side)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl, {
      headers: {
        "User-Agent": "WanderAppProxy/1.0"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OSRM Error:", errText);
      return NextResponse.json({ error: "OSRM fetch failed" }, { status: response.status });
    }

    const data = await response.json();

    // 3. Cache the result for 7 days (Routes don't change often)
    if (redis && data.code === "Ok") {
      console.log(`[API] 💾 Saving OSRM Route to Redis: ${coordsStr}`);
      await redis.set(cacheKey, data, { ex: 604800 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("OSRM Proxy API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
