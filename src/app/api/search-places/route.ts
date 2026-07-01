import { NextResponse } from 'next/server';
import { getFallbackImage } from '@/lib/fallbacks';
import { places as mockPlaces } from '@/data/places';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { Redis } from '@upstash/redis';

// Initialize Redis gracefully
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Types for our fallback chain
type Intent = {
  location: string;
  category: string;
};

// 1. AI Intent Extraction (Groq + Qwen)
async function extractIntentWithAI(query: string): Promise<Intent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GROQ_API_KEY is missing. Using heuristic fallback.");
    // Heuristic fallback if no API key
    return { location: query, category: "tourist_attractions" };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPTS.INTENT_EXTRACTION
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API Error:", errText);
      throw new Error(`Groq returned ${response.status}`);
    }
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as Intent;
  } catch (error) {
    console.error("AI Extraction failed:", error);
    return { location: query, category: "tourist_attractions" }; // Fallback
  }
}

// 2. Foursquare Places API
async function fetchFoursquare(intent: Intent) {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      near: intent.location,
      query: intent.category,
      limit: '5'
    });
    const response = await fetch(`https://places-api.foursquare.com/places/search?${params}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Places-Api-Version": "2025-06-17",
        "Accept": "application/json"
      }
    });
    if (!response.ok) return null;
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
          description: p.categories?.[0]?.name || "Attraction",
          lat: p.latitude || 13.7563,
          lng: p.longitude || 100.5018,
          status: ["API Data"],
          theme: [intent.category],
          estDuration: 60,
          priceLevel: p.price === 1 ? "฿" : p.price === 2 ? "฿฿" : "฿฿฿",
          operatingHours: "10:00 - 20:00", 
          bestTimeToVisit: "Anytime",
          zone: intent.location,
          keyActivities: ["Explore"],
          imageUrl,
        };
      })
    );

    return enrichedResults;
  } catch (error) {
    console.error("Foursquare API failed:", error);
    return null;
  }
}

// 3. OSM / Nominatim API (Free Alternative Fallback)
async function fetchOSM(query: string) {
  try {
    // Nominatim requires a User-Agent
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
      headers: {
        "User-Agent": "WanderApp/1.0 (test@example.com)"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;

    // Normalize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((p: any) => ({
      id: p.place_id.toString(),
      nameTh: p.name || p.display_name.split(",")[0],
      nameEn: p.name || p.display_name.split(",")[0],
      description: p.display_name,
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lon),
      status: ["OSM Fallback"],
      theme: ["General"],
      estDuration: 60,
      priceLevel: "฿฿",
      operatingHours: "N/A",
      bestTimeToVisit: "Anytime",
      zone: p.type || "OSM Data",
      keyActivities: ["Visit"],
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    }));
  } catch (error) {
    console.error("OSM API failed:", error);
    return null;
  }
}

// 4. LLM Generative Fallback (Qwen)
// Generates places exactly matching our schema when real APIs fail for Thai local areas
async function generatePlacesWithAI(location: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  console.log(`[API] 🧠 Triggering LLM Generation for: "${location}" using Qwen`);
  try {
    const prompt = SYSTEM_PROMPTS.PLACE_GENERATOR
      .replace("[LOCATION]", location)
      .replace("[LIMIT]", "5");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b", // Using proper ID from Preview list
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      console.error("Groq Generation Error:", await response.text());
      return null;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    
    // Validate we got the "places" array from the JSON Object
    if (!parsed || !Array.isArray(parsed.places) || parsed.places.length === 0) {
      return null;
    }

    // Ponytail rule: We don't have images for hallucinated places. Just use a beautiful fallback.
    // AND we must verify coordinates via OSM sequentially to respect Nominatim rate limit (1 req/sec).
    const enrichedPlaces = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of parsed.places) {
      let finalLat = p.lat;
      let finalLng = p.lng;
      
      try {
        const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(p.nameTh)}&format=json&limit=1`, {
          headers: { "User-Agent": "WanderApp/1.0" }
        });
        if (osmRes.ok) {
          const data = await osmRes.json();
          if (data && data.length > 0) {
            finalLat = parseFloat(data[0].lat);
            finalLng = parseFloat(data[0].lon);
          }
        }
        
        // Strict 1.1s delay for Nominatim Anti-Ban
        await new Promise(r => setTimeout(r, 1100));
      } catch (_) {
        console.error("Failed to geocode AI place:", p.nameTh);
      }

      enrichedPlaces.push({
        ...p,
        lat: finalLat,
        lng: finalLng,
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"
      });
    }

    return enrichedPlaces;
  } catch (error) {
    console.error("LLM Generation failed:", error);
    return null;
  }
}

// --- CACHE LAYER (Redis) ---
// We removed the mockCache Map in favor of real Redis caching across Edge functions

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    console.log(`[API] Processing search for: "${query}"`);

    // 0. Cache Check
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[API] ⚡ Redis Cache HIT for "${cacheKey}". Skipping AI and APIs!`);
        return NextResponse.json(cached);
      }
    } else {
      console.warn("⚠️ Redis not configured. Skipping cache check.");
    }

    // 1. AI Parsing
    const intent = await extractIntentWithAI(query);
    console.log(`[API] Extracted Intent:`, intent);

    // 2. OSM / Nominatim API (Free Alternative, run first as requested)
    let results = await fetchOSM(intent.location);
    
    // 3. Foursquare API (Fallback if OSM fails)
    if (!results || results.length === 0) {
      console.log("[API] OSM failed/empty. Falling back to Foursquare...");
      results = await fetchFoursquare(intent);
    }

    // 4. Qwen LLM Generative Fallback (The ultimate AI fallback)
    if (!results || results.length === 0) {
      console.log("[API] Foursquare failed. Triggering Qwen LLM Generator...");
      results = await generatePlacesWithAI(intent.location);
    }

    // 5. Mock Data Fallback (For testing without any API keys)
    if (!results || results.length === 0) {
      console.log("⚠️ [API] All real APIs failed or missing keys. Using Local Mock Data.");
      const isBangkapi = query.includes("บางกะปิ");
      const isSiam = query.includes("สยาม");
      
      if (isBangkapi) {
        results = [{
          id: "mock_bangkapi_1",
          nameTh: "The Mall บางกะปิ",
          nameEn: "The Mall Bangkapi",
          description: "ห้างใหญ่ย่านบางกะปิ เพิ่งรีโนเวทใหม่",
          lat: 13.7663,
          lng: 100.6433,
          status: ["Mock Data"],
          theme: ["Shopping"],
          estDuration: 120,
          priceLevel: "฿฿",
          operatingHours: "10:00 - 22:00",
          bestTimeToVisit: "บ่าย",
          zone: "บางกะปิ",
          keyActivities: ["ช้อปปิ้ง", "กินข้าว"],
          imageUrl: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&q=80"
        }];
      } else if (isSiam) {
        results = [{
          id: "mock_siam_1",
          nameTh: "Siam Paragon",
          nameEn: "Siam Paragon",
          description: "ศูนย์การค้าใจกลางสยาม",
          lat: 13.7468,
          lng: 100.5349,
          status: ["Mock Data"],
          theme: ["Shopping"],
          estDuration: 180,
          priceLevel: "฿฿฿",
          operatingHours: "10:00 - 22:00",
          bestTimeToVisit: "เย็น",
          zone: "สยาม",
          keyActivities: ["ช้อปปิ้ง", "กินข้าว", "เดินเล่น"],
          imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"
        }];
      } else {
        results = mockPlaces.slice(0, 3); // Fallback generic mock
      }
    }

    const responseData = { success: true, intent, results };

    // Save to Cache for future requests
    if (redis) {
      console.log(`[API] 💾 Saving to Redis Cache: "${cacheKey}"`);
      // Cache for 24 hours (86400 seconds)
      await redis.set(cacheKey, responseData, { ex: 86400 });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
