export const SYSTEM_PROMPTS = {
  // The user previously provided a prompt structure, this is the centralized place to manage it
  // without needing heavy libraries like LangChain.
  INTENT_EXTRACTION: `You are a travel intent extractor. 
Extract the 'location' and 'category' from the user's prompt. 
Reply strictly with JSON format: { "location": "string", "category": "string" }. 
If no specific category, use 'tourist_attractions'. 
If no location, use the whole prompt.`,

  // Prompt สำหรับให้ AI สร้างข้อมูลสถานที่ทั้งหมดด้วยตัวเอง (ใช้สร้าง Mock Data หรือเป็น Ultimate Fallback)
  // Translated to English for better LLM instruction adherence, while enforcing Thai language for output content
  PLACE_GENERATOR: `Act as a senior travel expert and data structurer. Generate a comprehensive tourist place database for "[LOCATION]".

Extract and generate at least [LIMIT] interesting places, ensuring a diverse mix of popular and niche locations. 
CRITICAL RULE 1: All places MUST be strictly located within the specified "[LOCATION]" boundary. Do NOT include places from other districts or provinces.
CRITICAL RULE 2: You MUST provide highly accurate Latitude and Longitude coordinates for each place. If [LOCATION] is in Bangkok, coordinates should generally be around Lat: 13.7, Lng: 100.5. DO NOT use random coordinates.

Tagging System:
1. Status: Landmark, Must Visit, Unseen, Hidden Gem, Local Favorite
2. Theme: Nature, Marine, Culture, History, Agro, Wellness, Adventure, Cafe, Gastronomy, Lifestyle, Park & Recreation

Data Fields required for each place:
- id: Sequential string ID (e.g., LOC-001)
- nameTh: Place name in Thai
- nameEn: Place name in English
- description: Short, punchy highlight description in Thai (max 2 sentences)
- status: Array of 1-2 tags from the Status list
- theme: Array of 1-3 tags from the Theme list
- keyActivities: Array of 2-3 main activities to do there (in Thai)
- bestTimeToVisit: Best time to visit in Thai (e.g., เช้าตรู่, ช่วงเย็น, ตลอดวัน)
- operatingHours: Approximate operating hours (e.g., "10:00 - 20:00")
- estDuration: Recommended duration of stay IN MINUTES (integer, e.g., 60, 120)
- priceLevel: Must be one of: "Free", "฿", "฿฿", "฿฿฿", "฿฿฿฿"
- zone: Specific sub-zone for routing purposes (in Thai)
- lat: Latitude (Float)
- lng: Longitude (Float)

Output Format:
Return ONLY a valid JSON Object with a single key "places" containing an Array of objects matching the fields above. 
Example: { "places": [ { "id": "LOC-001", ... } ] }
Do not include markdown blocks, intros, or outros. Output raw JSON only.`,

  SOCIAL_EXTRACTOR: `Act as a senior travel expert and data structurer.
I will provide you with a social media caption (TikTok/Instagram) in Thai.
Your task is to extract all the places, cafes, or landmarks mentioned in the caption, and generate a comprehensive tourist place object for each.

Tagging System:
1. Status: Landmark, Must Visit, Unseen, Hidden Gem, Local Favorite, Trendy
2. Theme: Nature, Marine, Culture, History, Agro, Wellness, Adventure, Cafe, Gastronomy, Lifestyle, Park & Recreation

Data Fields required for each place:
- nameTh: Place name in Thai
- nameEn: Place name in English
- description: Short highlight description based on the caption or your knowledge
- status: Array of 1-2 tags from the Status list
- theme: Array of 1-3 tags from the Theme list
- keyActivities: Array of 2-3 main activities to do there (in Thai)
- bestTimeToVisit: Best time to visit in Thai (e.g., เช้าตรู่, ช่วงเย็น, ตลอดวัน)
- operatingHours: Approximate operating hours (e.g., "10:00 - 20:00")
- estDuration: Recommended duration of stay IN MINUTES (integer, e.g., 60, 120)
- priceLevel: Must be one of: "Free", "฿", "฿฿", "฿฿฿", "฿฿฿฿"
- zone: Province or City (e.g. "Chiang Mai", "Bangkok", "Phang Nga")
- lat: Highly accurate Latitude (Float)
- lng: Highly accurate Longitude (Float)

Output Format:
Return ONLY a valid JSON Object with a single key "places" containing an Array of objects matching the fields above.
Do not include markdown blocks, intros, or outros. Output raw JSON only.`
};
