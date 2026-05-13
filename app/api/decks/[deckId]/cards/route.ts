import { NextRequest, NextResponse } from "next/server";
import {
  addCardToDeck,
  updateCardInDeck,
  removeCardFromDeck,
  getDeckStats,
  validateDeck,
  DeckCard,
} from "@/lib/supabase/decks";
import { recordDeckChange } from "@/lib/supabase/deckChanges";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// POST /api/decks/[deckId]/cards - Add card to deck
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await params;
    const body = await request.json();
    const card: DeckCard = body;

    if (!card.card_id || !card.card_name || !card.quantity || !card.section) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: card_id, card_name, quantity, section",
        },
        { status: 400 },
      );
    }

    const deckCard = await addCardToDeck(deckId, card);

    // Record history (fire-and-forget)
    // recordDeckChange({
    //   deckId,
    //   action: "card_added",
    //   cardId: card.card_id,
    //   cardName: card.card_name,
    //   quantityDelta: card.quantity,
    // });

    const stats = await getDeckStats(deckId);
    const validation = await validateDeck(deckId);

    return NextResponse.json(
      { card: deckCard, stats, validation },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error adding card to deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to add card to deck") },
      { status: 500 },
    );
  }
}

// PUT /api/decks/[deckId]/cards - Update card quantity in deck
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await params;
    const body = await request.json();
    const {
      cardId,
      cardName,
      section,
      quantity,
      previousQuantity,
    }: {
      cardId: string;
      cardName?: string;
      section: string;
      quantity: number;
      previousQuantity?: number;
    } = body;

    if (!cardId || !section || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: cardId, section, quantity" },
        { status: 400 },
      );
    }

    const updatedCard = await updateCardInDeck(
      deckId,
      cardId,
      section,
      quantity,
    );

    // Record history — calculate delta if previousQuantity provided
    // if (previousQuantity !== undefined) {
    //   const delta = quantity - previousQuantity;
    //   if (delta !== 0) {
    //     recordDeckChange({
    //       deckId,
    //       action: "card_quantity_changed",
    //       cardId,
    //       cardName: cardName ?? updatedCard.card_name,
    //       quantityDelta: delta,
    //     });
    //   }
    // }

    const stats = await getDeckStats(deckId);
    const validation = await validateDeck(deckId);

    return NextResponse.json({ card: updatedCard, stats, validation });
  } catch (error: unknown) {
    console.error("Error updating card in deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update card in deck") },
      { status: 500 },
    );
  }
}

// DELETE /api/decks/[deckId]/cards - Remove card from deck
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await params;
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const section = searchParams.get("section");
    const cardName = searchParams.get("cardName");
    const quantity = searchParams.get("quantity");

    if (!cardId || !section) {
      return NextResponse.json(
        { error: "Missing required query parameters: cardId, section" },
        { status: 400 },
      );
    }

    await removeCardFromDeck(deckId, cardId, section);

    // Record history
    // recordDeckChange({
    //   deckId,
    //   action: "card_removed",
    //   cardId,
    //   cardName: cardName ?? undefined,
    //   quantityDelta: quantity ? -Math.abs(parseInt(quantity)) : -1,
    // });

    const stats = await getDeckStats(deckId);
    const validation = await validateDeck(deckId);

    return NextResponse.json({ success: true, stats, validation });
  } catch (error: unknown) {
    console.error("Error removing card from deck:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to remove card from deck") },
      { status: 500 },
    );
  }
}
