import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY";

export const groq = new Groq({ apiKey });

export const SYSTEM_PROMPT = `You are an expert Thai travel entity extractor. 
I will provide you with a social media caption (TikTok/Instagram) in Thai.
Your task is to extract ONLY the exact names of places, landmarks, cafes, or restaurants mentioned.
Do NOT include generic words like 'กรุงเทพ' (Bangkok) unless it is a specific place name.
Output the result strictly as a JSON object with a single key "places" containing an array of strings, without any markdown formatting or explanations.
If no places are found, output { "places": [] }.

Example:
Input: "รีวิวคาเฟ่เปิดใหม่ Nip Coffee แถวลาดพร้าว แวะถ่ายรูปที่เซ็นทรัล"
Output: { "places": ["Nip Coffee", "เซ็นทรัลลาดพร้าว"] }`;
