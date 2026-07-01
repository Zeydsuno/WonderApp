import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ places: [] });
    }

    // Fuzzy search using Supabase (requires pg_trgm and ilike or textSearch)
    // Here we use ilike for simple matching, or you can create a custom RPC
    const { data: places, error } = await supabase
      .from("places")
      .select("*")
      .ilike("name_th", `%${q}%`)
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ places: places || [] });
  } catch (error: unknown) {
    console.error("Search error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to search places" }, { status: 500 });
  }
}
