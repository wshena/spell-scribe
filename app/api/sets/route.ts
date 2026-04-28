import { NextResponse } from "next/server";
import { getSetFiltersFromParams, getSetsPage } from "@/lib/scryfall/sets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getSetFiltersFromParams(searchParams);
    const result = await getSetsPage(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to load sets", error);

    return NextResponse.json(
      { message: "Failed to load sets." },
      { status: 500 }
    );
  }
}
