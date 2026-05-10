/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import type { DeckHistoryItem, DeckWithCards } from '@/lib/supabase/decks'
import { extractManaColors, formatRelativeTime, getColorInfo } from '@/lib/utils/deckUtils'
import { getManaColorSymbolMap } from '@/lib/scryfall/manaSymbols'
import Image from 'next/image'

interface UserDeckHistoryProps {
  history: DeckHistoryItem[]
}

function getDeckCover(deck: DeckWithCards) {
  const firstCard = deck.cards[0]
  return (
    firstCard?.image_uris?.art_crop ||
    firstCard?.card_faces?.[0]?.image_uris?.art_crop ||
    deck.commander?.image_uris?.art_crop ||
    deck.commander?.card_faces?.[0]?.image_uris?.art_crop ||
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
      {/* header */}
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
              href={`/decks/${item.deck_id}`}
              className="w-90 h-40 relative bg-center bg-cover"
              style={{
                backgroundImage: `url('${getDeckCover(item.deck)}')`
              }}
            >
              <div className="group absolute px-4 py-2 top-0 left-0 w-full h-full bg-black/50 hover:bg-violet-900/40 transition-all duration-150 ease-in-out">
                <div className="flex flex-col items-start justify-between h-full">
                  <div className="space-y-1">
                    <p className="truncate text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-white">{item.deck.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-300">{item.deck.format}</p>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="mt-3 flex flex-wrap gap-1">
                      {displayColors.length > 0 ? (
                        displayColors.map((color) => (
                          colorSymbolMap.get(color) ? (
                            <Image
                              key={color}
                              src={colorSymbolMap.get(color) || '/image/empty-deck-bg.png'}
                              alt={getColorInfo(color).label}
                              title={getColorInfo(color).label}
                              className="h-4 w-4 object-contain"
                              loading={'lazy'}
                              width={16}
                              height={16}
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
                    <p className="mt-3 text-xs capitalize text-slate-300">
                      {item.action}ed {formatRelativeTime(item.last_accessed_at)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
