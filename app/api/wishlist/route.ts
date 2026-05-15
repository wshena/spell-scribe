import { NextRequest, NextResponse } from "next/server";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
} from "@/lib/supabase/wishlist";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// GET /api/wishlist?page=1&pageSize=20
// GET /api/wishlist?count=true  — returns only total count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("count") === "true") {
      const count = await getWishlistCount();
      return NextResponse.json({ count });
    }

    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const result = await getWishlist(page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch wishlist") },
      { status: 500 },
    );
  }
}

// POST /api/wishlist — add card
// Body: { card_id, card_name, card_data, notes? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_id, card_name, card_data, notes } = body;

    if (!card_id || !card_name || !card_data) {
      return NextResponse.json(
        { error: "Missing required fields: card_id, card_name, card_data" },
        { status: 400 },
      );
    }

    const item = await addToWishlist({ card_id, card_name, card_data, notes });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    // Return 409 for already-in-wishlist
    const message = getErrorMessage(error, "Failed to add to wishlist");
    const isConflict = message.toLowerCase().includes("already");
    return NextResponse.json(
      { error: message },
      { status: isConflict ? 409 : 500 },
    );
  }
}

// DELETE /api/wishlist?cardId=xxx  — remove single card
// DELETE /api/wishlist?all=true    — clear entire wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const all = searchParams.get("all") === "true";

    if (all) {
      await clearWishlist();
      return NextResponse.json({ success: true });
    }

    if (!cardId) {
      return NextResponse.json(
        { error: "Missing required query parameter: cardId" },
        { status: 400 },
      );
    }

    await removeFromWishlist(cardId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to remove from wishlist") },
      { status: 500 },
    );
  }
}
