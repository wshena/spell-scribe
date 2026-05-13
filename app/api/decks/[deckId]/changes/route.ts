import { NextRequest, NextResponse } from "next/server";
import {
  getDeckChanges,
  recordDeckChange,
  DeckChangeAction,
} from "@/lib/supabase/deckChanges";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// GET /api/decks/[deckId]/changes?page=1&pageSize=10
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await params;
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10");

    const result = await getDeckChanges(deckId, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching deck changes:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch deck changes") },
      { status: 500 },
    );
  }
}

// POST /api/decks/[deckId]/changes — manual insert (for commander/visibility changes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const { deckId } = await params;
    const body = await request.json();

    const {
      action,
      cardId,
      cardName,
      quantityDelta,
      oldValue,
      newValue,
    }: {
      action: DeckChangeAction;
      cardId?: string;
      cardName?: string;
      quantityDelta?: number;
      oldValue?: string;
      newValue?: string;
    } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    await recordDeckChange({
      deckId,
      action,
      cardId,
      cardName,
      quantityDelta,
      oldValue,
      newValue,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording deck change:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to record deck change") },
      { status: 500 },
    );
  }
}
