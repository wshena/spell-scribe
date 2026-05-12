import { fetchAllSets } from "@/lib/scryfall/sets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sets = await fetchAllSets();
    return NextResponse.json(sets);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load sets." },
      { status: 500 },
    );
  }
}
