import { NextRequest, NextResponse } from 'next/server'
import { getDeck, validateDeck, getDeckStats, recordDeckHistory, updateDeck, DeckData } from '@/lib/supabase/decks'
import { createClient } from '@/utils/supabase/server'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// GET /api/decks/[deckId] - Get single deck by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params

    const deck = await getDeck(deckId)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      )
    }

    await recordDeckHistory(deckId, 'view')

    // Get deck statistics
    const stats = await getDeckStats(deckId)

    // Validate deck
    const validation = await validateDeck(deckId)

    return NextResponse.json({
      deck,
      isOwner: Boolean(user && deck.user_id === user.id),
      stats,
      validation
    })

  } catch (error: unknown) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to fetch deck') },
      { status: 500 }
    )
  }
}

// PUT /api/decks/[deckId] - Update deck by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params
    const body = await request.json()
    const updates = body as Partial<DeckData>

    const deck = await updateDeck(deckId, updates)
    const validation = await validateDeck(deckId)

    return NextResponse.json({ deck, validation })
  } catch (error: unknown) {
    console.error('Error updating deck:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to update deck') },
      { status: 500 }
    )
  }
}

// POST /api/decks/[deckId]/validate - Validate deck
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params

    const validation = await validateDeck(deckId)
    const stats = await getDeckStats(deckId)

    return NextResponse.json({
      validation,
      stats
    })

  } catch (error: unknown) {
    console.error('Error validating deck:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to validate deck') },
      { status: 500 }
    )
  }
}
