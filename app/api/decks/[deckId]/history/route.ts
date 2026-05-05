import { NextRequest, NextResponse } from 'next/server'
import { recordDeckHistory } from '@/lib/supabase/decks'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params
    const body = await request.json().catch(() => ({}))
    const action = body.action === 'edit' ? 'edit' : 'view'

    await recordDeckHistory(deckId, action)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error recording deck history:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to record deck history') },
      { status: 500 }
    )
  }
}
