import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  createDeck,
  getUserDecks,
  updateDeck,
  deleteDeck,
  validateDeck,
  DeckData,
  DeckCard,
  getPublicDecks,
  updateDeckVisibility,
} from "@/lib/supabase/decks";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// GET /api/decks - Get user's decks or public decks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const visibility = searchParams.get("visibility"); // 'public' to get public decks

    // if (visibility === 'public') {
    //   // Get public decks from all users
    //   const { data: decks, error } = await supabase
    //     .from('decks')
    //     .select(`
    //       *,
    //       deck_cards (
    //         id,
    //         card_id,
    //         card_name,
    //         type_line,
    //         quantity,
    //         section,
    //         colors,
    //         color_identity,
    //         image_uris,
    //         card_faces
    //       )
    //     `)
    //     .eq('visibility', 'Public')
    //     .order('updated_at', { ascending: false })

    //   if (error) {
    //     return NextResponse.json({ error: error.message }, { status: 500 })
    //   }

    //   return NextResponse.json(decks)
    // }

    if (visibility === "public") {
      const page = Number(searchParams.get("page") || 1);
      const limit = Number(searchParams.get("limit") || 12);

      const decks = await getPublicDecks(page, limit);

      return NextResponse.json(decks);
    }

    // Get user's own decks
    const decks = await getUserDecks(userId || undefined);
    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 },
    );
  }
}

// POST /api/decks - Create new deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deckData, cards }: { deckData: DeckData; cards?: DeckCard[] } =
      body;

    if (!deckData.name || !deckData.format || !deckData.visibility) {
      return NextResponse.json(
        { error: "Missing required fields: name, format, visibility" },
        { status: 400 },
      );
    }

    const deck = await createDeck(deckData, cards || []);

    // Validate the deck after creation
    const validation = await validateDeck(deck.id);

    return NextResponse.json(
      {
        deck,
        validation,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create deck") },
      { status: 500 },
    );
  }
}

// PUT /api/decks/[id] - Update deck
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("id");

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const updates: Partial<DeckData> = body;

    const deck = await updateDeck(deckId, updates);

    // Validate the updated deck
    const validation = await validateDeck(deckId);

    return NextResponse.json({
      deck,
      validation,
    });
  } catch (error: unknown) {
    console.error("Error updating deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update deck") },
      { status: 500 },
    );
  }
}

// DELETE /api/decks/[id] - Delete deck
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("id");

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 },
      );
    }

    await deleteDeck(deckId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete deck") },
      { status: 500 },
    );
  }
}

// PATCH /api/decks/[id] - Update deck visibility
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const deckId = searchParams.get("id");

    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { visibility } = body;

    if (!visibility) {
      return NextResponse.json(
        { error: "Visibility is required" },
        { status: 400 },
      );
    }

    const updatedDeck = await updateDeckVisibility(deckId, visibility);

    return NextResponse.json(updatedDeck);
  } catch (error: unknown) {
    console.error("Error updating deck visibility:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update deck visibility",
      },
      { status: 500 },
    );
  }
}
