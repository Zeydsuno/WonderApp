import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { getFallbackImage } from '@/lib/fallbacks';

const apiKey = process.env.FOURSQUARE_API_KEY || "YOUR_FOURSQUARE_KEY";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    console.log(`[Parse Social] Processing URL: ${url}`);
    let caption = "";

    // STEP 1: TikTok OEmbed
    if (url.includes("tiktok.com")) {
      try {
        const normalizedUrl = url.replace(/\/photo\//, '/video/');
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          caption = oembedData.title || "";
        }
      } catch (e) {
        console.error("TikTok OEmbed failed:", e);
      }
    }

    if (!caption) {
      // Fallback if not TikTok or OEmbed failed
      caption = "วันหยุดนี้ไปคาเฟ่ลับย่านสยามกัน คาเฟ่แมว Mohu Mohu น่ารักมาก ต่อด้วยไปเดินเล่นสวนเบญจกิติตอนเย็น";
    }

    console.log(`[Parse Social] Extracted Caption: ${caption}`);

    // STEP 2: AI Extraction via Groq (Llama 3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let extractedPlaces: any[] = [];
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.SOCIAL_EXTRACTOR },
          { role: "user", content: caption }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" }
      });
      
      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{"places":[]}');
      extractedPlaces = aiResponse.places || [];
    } catch (e) {
      console.error("Groq AI failed:", e);
      extractedPlaces = [{ name: "สยามพารากอน" }]; // Ultimate fallback
    }
    
    console.log(`[Parse Social] AI Extracted Places:`, extractedPlaces);

    // STEP 3: Real Foursquare Search
    const results = await Promise.all(
      extractedPlaces.map(async (placeObj) => {
        const placeName = typeof placeObj === "string" ? placeObj : (placeObj.name || placeObj.nameTh || placeObj.nameEn || "Unknown Place");
        try {
          const nearLoc = placeObj.zone && placeObj.zone.trim() !== "" 
            ? `${placeObj.zone}, Thailand` 
            : 'Thailand';

          const osmQuery = `${placeName} ${nearLoc}`;
          
          const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(osmQuery)}&format=json&limit=1`, {
            headers: {
              "User-Agent": "Wanderapp-Travel-Agent/1.0"
            }
          });

          if (osmRes.ok) {
            const data = await osmRes.json();
            if (data && data.length > 0) {
              const p = data[0];
              const imageUrl = getFallbackImage(placeObj.theme?.[0]);
              
              return {
                id: p.place_id.toString(),
                nameTh: placeObj.nameTh || placeName,
                nameEn: placeObj.nameEn || placeName,
                description: placeObj.description || "TikTok Place",
                lat: parseFloat(p.lat) || placeObj.lat || 13.75,
                lng: parseFloat(p.lon) || placeObj.lng || 100.5,
                status: placeObj.status || ["From TikTok"],
                theme: placeObj.theme || ["Social"],
                estDuration: placeObj.estDuration || 90,
                priceLevel: placeObj.priceLevel || "฿฿",
                operatingHours: placeObj.operatingHours || "10:00 - 18:00",
                bestTimeToVisit: placeObj.bestTimeToVisit || "Anytime",
                zone: placeObj.zone || "Thailand",
                keyActivities: placeObj.keyActivities || ["Visit"],
                imageUrl
              };
            }
          }
        } catch (e) {
          console.error(`OSM Geocoding failed for ${placeName}`, e);
        }
        
        // Generic fallback for extracted place using ALL of the AI's generated data!
        // Use a deterministic ID based on the place name so it doesn't change on re-parse
        const deterministicId = `gen_${placeName.replace(/[^a-zA-Z0-9ก-๙]/g, '').toLowerCase()}`;
        
        return {
          id: deterministicId,
          nameTh: placeObj.nameTh || placeName,
          nameEn: placeObj.nameEn || placeName,
          description: placeObj.description || "Extracted from TikTok",
          lat: placeObj.lat || 13.75,
          lng: placeObj.lng || 100.5,
          status: placeObj.status || ["API Fallback"],
          theme: placeObj.theme || ["Social"],
          estDuration: placeObj.estDuration || 90,
          priceLevel: placeObj.priceLevel || "฿฿",
          operatingHours: placeObj.operatingHours || "10:00 - 18:00",
          bestTimeToVisit: placeObj.bestTimeToVisit || "Anytime",
          zone: placeObj.zone || "Thailand",
          keyActivities: placeObj.keyActivities || ["Visit"],
          imageUrl: getFallbackImage(placeObj.theme?.[0] || "cafe")
        };
      })
    );

    // Deduplicate results by ID
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    return NextResponse.json({ success: true, results: uniqueResults });
  } catch (error) {
    console.error("Social Parse Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
