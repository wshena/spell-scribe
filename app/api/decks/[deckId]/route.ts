import { NextRequest, NextResponse } from 'next/server'
import { getDeck, validateDeck, getDeckStats } from '@/lib/supabase/decks'

// GET /api/decks/[deckId] - Get single deck by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params

    const deck = await getDeck(deckId)

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      )
    }

    // Get deck statistics
    const stats = await getDeckStats(deckId)

    // Validate deck
    const validation = await validateDeck(deckId)

    return NextResponse.json({
      deck,
      stats,
      validation
    })

  } catch (error: any) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deck' },
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

  } catch (error: any) {
    console.error('Error validating deck:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate deck' },
      { status: 500 }
    )
  }
}