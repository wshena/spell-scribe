/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import type { DeckHistoryItem, DeckWithCards } from '@/lib/supabase/decks'
import { extractManaColors, formatRelativeTime, getColorInfo } from '@/lib/utils/deckUtils'
import { getManaColorSymbolMap } from '@/lib/scryfall/manaSymbols'

interface UserDeckHistoryProps {
  history: DeckHistoryItem[]
}

function getDeckCover(deck: DeckWithCards) {
  const firstCard = deck.cards[0]
  return (
    firstCard?.image_uris?.normal ||
    firstCard?.card_faces?.[0]?.image_uris?.normal ||
    deck.commander?.image_uris?.normal ||
    deck.commander?.card_faces?.[0]?.image_uris?.normal ||
    '/image/empty-deck-bg.png'
  )
}

export default async function UserDeckHistory({ history }: UserDeckHistoryProps) {
  if (!history.length) {
    return null
  }

  const colorSymbolMap = await getManaColorSymbolMap()

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-violet-300">Recent Activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Deck History</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {history.map((item) => {
          const colors = extractManaColors(item.deck.cards)
          const displayColors = colors.length ? colors : item.deck.commander?.color_identity || []

          return (
            <Link
              key={item.id}
              href={`/deck/${item.deck_id}`}
              className="group grid grid-cols-[86px_1fr] gap-4 border border-white/10 bg-[#0f1319] p-3 transition hover:border-violet-400/50 hover:bg-[#151b24]"
            >
              <div className="aspect-[63/88] overflow-hidden bg-slate-900">
                <img
                  src={getDeckCover(item.deck)}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 py-1">
                <p className="truncate text-sm font-semibold text-white">{item.deck.name}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{item.deck.format}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {displayColors.length > 0 ? (
                    displayColors.map((color) => (
                      colorSymbolMap.get(color) ? (
                        <img
                          key={color}
                          src={colorSymbolMap.get(color)}
                          alt={getColorInfo(color).label}
                          title={getColorInfo(color).label}
                          className="h-4 w-4 object-contain"
                        />
                      ) : (
                        <span
                          key={color}
                          title={getColorInfo(color).label}
                          className={`h-4 w-4 rounded-full border border-white/20 ${getColorInfo(color).bg}`}
                        />
                      )
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No color</span>
                  )}
                </div>
                <p className="mt-3 text-xs capitalize text-slate-500">
                  {item.action}ed {formatRelativeTime(item.last_accessed_at)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
