import { NextRequest, NextResponse } from "next/server";
import {
  getWishlistItem,
  removeFromWishlist,
  updateWishlistItem,
} from "@/lib/supabase/wishlist";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// GET /api/wishlist/[cardId] — check if card is in wishlist + get item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const item = await getWishlistItem(cardId);
    return NextResponse.json({ item, inWishlist: item !== null });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to check wishlist") },
      { status: 500 },
    );
  }
}

// PATCH /api/wishlist/[cardId] — update notes
// Body: { notes: string | null }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { notes } = body;

    const item = await updateWishlistItem(cardId, { notes });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update wishlist item") },
      { status: 500 },
    );
  }
}

// DELETE /api/wishlist/[cardId] — remove by cardId
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  try {
    const { cardId } = await params;
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
