import { fetchAdvancedSearchServer } from "@/lib/scryfall/advanceSearch";
import { NextResponse } from "next/server";

// GET /api/cards/search?q=<scryfall_query>&order=name&dir=asc&page=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const order = searchParams.get("order") ?? "name";
    const dir = searchParams.get("dir") ?? "asc";
    const page = parseInt(searchParams.get("page") ?? "1");

    if (!q.trim()) {
      return NextResponse.json(
        { message: "Query parameter 'q' is required." },
        { status: 400 },
      );
    }

    const result = await fetchAdvancedSearchServer({
      rawQuery: q,
      order,
      order_dir: dir === "desc" ? "Descending" : "Ascending",
      page,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Card search error:", error);
    return NextResponse.json(
      { message: "Failed to search cards." },
      { status: 500 },
    );
  }
}
