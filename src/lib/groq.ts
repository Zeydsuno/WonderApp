import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY";

export const groq = new Groq({ apiKey });

export const SYSTEM_PROMPT = `You are an expert Thai travel entity extractor. 
I will provide you with a social media caption (TikTok/Instagram) in Thai.
Your task is to extract the exact names of places, landmarks, cafes, or restaurants mentioned.
Do NOT include generic words like 'กรุงเทพ' (Bangkok) unless it is a specific place name.
For each place, ALSO estimate reasonable values for:
- priceLevel: "฿", "฿฿", "฿฿฿", or "฿฿฿฿"
- operatingHours: e.g. "10:00 - 18:00" or "N/A"
- estDuration: estimated time spent there in minutes (e.g. 60, 90, 120)

Output the result strictly as a JSON object with a single key "places" containing an array of objects, without any markdown formatting or explanations.
If no places are found, output { "places": [] }.

Example:
Input: "รีวิวคาเฟ่เปิดใหม่ Nip Coffee แถวลาดพร้าว แวะถ่ายรูปที่เซ็นทรัล"
Output: { 
  "places": [
    { "name": "Nip Coffee", "priceLevel": "฿฿", "operatingHours": "08:00 - 17:00", "estDuration": 60 },
    { "name": "เซ็นทรัลลาดพร้าว", "priceLevel": "฿฿", "operatingHours": "10:00 - 22:00", "estDuration": 180 }
  ] 
}`;
