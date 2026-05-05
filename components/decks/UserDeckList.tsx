import Link from 'next/link'
import { getUserDecks } from '@/lib/supabase/decks'
import type { DeckWithCards } from '@/lib/supabase/decks'
import { formatDecks } from '@/lib/constants'

const formatBadge = (format: string) => {
  const item = formatDecks.find((formatItem) => formatItem.name === format)
  return item ? item.name : format
}

export default async function UserDeckList() {
  const decks = (await getUserDecks()) as DeckWithCards[]

  if (!decks.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0f1319] p-8 text-center text-white">
        <p className="text-lg font-semibold mb-2">No personal decks found</p>
        <p className="text-sm text-slate-400">
          Create your first deck to start tracking cards and commander builds.
        </p>
      </section>
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {decks.map((deck) => {
        const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
        const commanderCount = deck.cards
          .filter((card) => card.section === 'commander')
          .reduce((sum, card) => sum + card.quantity, 0)

        return (
          <article key={deck.id} className="rounded-3xl border border-white/10 bg-[#0f1319] p-6 transition hover:border-violet-500/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{deck.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{deck.description ?? 'No description yet.'}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {deck.visibility}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Format</p>
                <p className="mt-2 text-sm font-medium text-white">{formatBadge(deck.format)}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cards</p>
                <p className="mt-2 text-sm font-medium text-white">{totalCards} total</p>
                {commanderCount > 0 && (
                  <p className="mt-1 text-xs text-slate-400">{commanderCount} commander card</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {deck.commander ? (
                <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs text-violet-200">Commander assigned</span>
              ) : (
                <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs text-slate-300">No commander</span>
              )}
              <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs text-slate-300">Updated {new Date(deck.updated_at).toLocaleDateString()}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/decks/${deck.id}`}
                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                View deck
              </Link>
              <Link
                href={`/decks/${deck.id}`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500 hover:text-white"
              >
                Manage cards
              </Link>
            </div>
          </article>
        )
      })}
    </section>
  )
}
