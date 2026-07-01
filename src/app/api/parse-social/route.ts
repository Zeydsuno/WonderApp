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
        const placeName = typeof placeObj === "string" ? placeObj : placeObj.name;
        try {
          const params = new URLSearchParams({
            query: placeName,
            limit: '1',
            near: 'Thailand' // Search entire country for travel destinations
          });
          
          const fsqRes = await fetch(`https://places-api.foursquare.com/places/search?${params}`, {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "X-Places-Api-Version": "2025-06-17",
              "Accept": "application/json"
            }
          });

          if (fsqRes.ok) {
            const data = await fsqRes.json();
            if (data.results && data.results.length > 0) {
              const p = data.results[0];
              const imageUrl = getFallbackImage(p.categories?.[0]?.name);
              
              return {
                id: p.fsq_place_id,
                nameTh: placeObj.nameTh || p.name,
                nameEn: placeObj.nameEn || p.name,
                description: placeObj.description || p.categories?.[0]?.name || "TikTok Place",
                lat: p.latitude || placeObj.lat || 13.75,
                lng: p.longitude || placeObj.lng || 100.5,
                status: placeObj.status || ["From TikTok"],
                theme: placeObj.theme || ["Social"],
                estDuration: placeObj.estDuration || 90,
                priceLevel: placeObj.priceLevel || "฿฿",
                operatingHours: placeObj.operatingHours || "10:00 - 18:00",
                bestTimeToVisit: placeObj.bestTimeToVisit || "Anytime",
                zone: p.location?.locality || p.location?.region || placeObj.zone || "Thailand",
                keyActivities: placeObj.keyActivities || ["Visit"],
                imageUrl
              };
            }
          }
        } catch (e) {
          console.error(`Foursquare failed for ${placeName}`, e);
        }
        
        // Generic fallback for extracted place using ALL of the AI's generated data!
        return {
          id: `gen_${Math.random().toString(36).substr(2, 9)}`,
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
