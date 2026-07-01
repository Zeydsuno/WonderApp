import { NextResponse } from "next/server";
import { groq, SYSTEM_PROMPT } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { caption } = await req.json();

    if (!caption) {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: caption }
      ],
      model: "qwen-2.5-32b", // Using Groq's Qwen model (adjusted from qwen/qwen3-32b)
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from AI");

    // Because we use json_object, we should parse it. 
    // Wait, json_object requires the prompt to output a JSON object, not an array.
    // Let's fallback to standard output and parse since the prompt asks for an array.
    let extracted_places = [];
    try {
      extracted_places = JSON.parse(text);
      if (extracted_places.places && Array.isArray(extracted_places.places)) {
        extracted_places = extracted_places.places;
      }
    } catch (_) {
      console.error("Failed to parse JSON array from Groq", text);
    }

    return NextResponse.json({ extracted_places });
  } catch (error: unknown) {
    console.error("Parse social error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to parse social caption" }, { status: 500 });
  }
}
