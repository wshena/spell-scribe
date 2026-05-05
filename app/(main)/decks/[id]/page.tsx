/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { CardProps, fetchCardsByName } from '@/lib/scryfall/cards'
import { formatDecks } from '@/lib/constants'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import { SearchIcon } from '@/components/icons/Icons'

interface DeckCard {
  id: string
  card_id: string
  card_name: string
  type_line?: string | null
  quantity: number
  section: 'main' | 'sideboard' | 'commander' | 'maybeboard'
  colors?: string[] | null
  color_identity?: string[] | null
  image_uris?: CardProps['image_uris'] | null
  card_faces?: CardProps['card_faces'] | null
}

interface DeckData {
  id: string
  user_id?: string
  name: string
  format: string
  visibility: 'Public' | 'Unlisted' | 'Private'
  commander: CardProps | null
  description: string | null
  cards: DeckCard[]
  created_at: string
  updated_at: string
}

interface DeckResponse {
  deck: DeckData
  isOwner: boolean
}

const typeOrder = ['Commander', 'Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Land', 'Other']

function getImageUri(card?: Pick<DeckCard, 'image_uris' | 'card_faces'> | CardProps | null) {
  return card?.image_uris?.normal || card?.card_faces?.[0]?.image_uris?.normal || null
}

function getPrimaryType(typeLine?: string | null) {
  if (!typeLine) return 'Other'

  const lowerTypeLine = typeLine.toLowerCase()
  const matchedType = typeOrder.find((type) => lowerTypeLine.includes(type.toLowerCase()))
  return matchedType || 'Other'
}

function getSearchCardImage(card: CardProps) {
  return card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || null
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

const DeckPage = () => {
  const params = useParams()
  const router = useRouter()
  const setAlert = useUtilityStore((state) => state.setAlert)
  const searchRef = useRef<HTMLDivElement>(null)

  const [deck, setDeck] = useState<DeckData | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CardProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addingCardId, setAddingCardId] = useState<string | null>(null)
  const [removingCardId, setRemovingCardId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const deckId = params.id as string

  const fetchDeck = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/decks/${deckId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Deck not found')
          return
        }
        throw new Error('Failed to fetch deck')
      }

      const data = (await response.json()) as DeckResponse
      setDeck(data.deck)
      setIsOwner(data.isOwner)
      setError(null)
    } catch (err: unknown) {
      console.error('Error fetching deck:', err)
      setError(getErrorMessage(err, 'Failed to load deck'))
      setAlert({
        label: 'Failed to load deck',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [deckId, setAlert])

  useEffect(() => {
    if (deckId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDeck()
    }
  }, [deckId, fetchDeck])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchCards = async () => {
      if (!isOwner || query.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const cards = await fetchCardsByName(query)
        setSearchResults(cards.slice(0, 10))
      } catch (err) {
        console.error('Error searching cards:', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchCards, 300)
    return () => clearTimeout(debounceTimer)
  }, [isOwner, query])

  const totalCards = useMemo(
    () => deck?.cards.reduce((sum, card) => sum + card.quantity, 0) || 0,
    [deck]
  )

  const groupedCards = useMemo(() => {
    const groups = new Map<string, DeckCard[]>()

    deck?.cards.forEach((card) => {
      const groupName = card.section === 'commander' ? 'Commander' : getPrimaryType(card.type_line)
      const existingGroup = groups.get(groupName) || []
      groups.set(groupName, [...existingGroup, card])
    })

    return Array.from(groups.entries())
      .sort(([a], [b]) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
      .map(([type, cards]) => ({
        type,
        cards: cards.sort((a, b) => a.card_name.localeCompare(b.card_name)),
        total: cards.reduce((sum, card) => sum + card.quantity, 0),
      }))
  }, [deck])

  const formatInfo = deck ? formatDecks.find((format) => format.name === deck.format) : null
  const commanderCard = deck?.cards.find((card) => card.section === 'commander')
  const coverImage = getImageUri(deck?.cards[0]) || getImageUri(deck?.commander)
  const commanderImage = getImageUri(commanderCard) || getImageUri(deck?.commander)

  const handleAddCard = async (card: CardProps) => {
    if (!deck) return

    setAddingCardId(card.id)
    try {
      const response = await fetch(`/api/decks/${deck.id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: card.id,
          card_name: card.name,
          type_line: card.type_line,
          quantity: 1,
          section: 'main',
          colors: card.colors || null,
          color_identity: card.color_identity || null,
          image_uris: card.image_uris || card.card_faces?.[0]?.image_uris || null,
          card_faces: card.card_faces || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to add card')
      }

      setAlert({
        label: `${card.name} added to deck`,
        type: 'success',
      })
      setQuery('')
      setSearchResults([])
      setShowResults(false)
      await fetchDeck()
    } catch (err: unknown) {
      setAlert({
        label: getErrorMessage(err, 'Failed to add card'),
        type: 'error',
      })
    } finally {
      setAddingCardId(null)
    }
  }

  const handleRemoveCard = async (card: DeckCard) => {
    if (!deck) return

    setRemovingCardId(card.id)
    try {
      const response = await fetch(
        `/api/decks/${deck.id}/cards?cardId=${encodeURIComponent(card.card_id)}&section=${encodeURIComponent(card.section)}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to remove card')
      }

      setAlert({
        label: `${card.card_name} removed from deck`,
        type: 'success',
      })
      await fetchDeck()
    } catch (err: unknown) {
      setAlert({
        label: getErrorMessage(err, 'Failed to remove card'),
        type: 'error',
      })
    } finally {
      setRemovingCardId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f14] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p>Loading deck...</p>
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f14] text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Deck Not Found</h1>
          <p className="mb-6 text-slate-400">{error}</p>
          <button
            onClick={() => router.push('/decks/personal')}
            className="bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-500"
          >
            Back to My Decks
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] pb-16 pt-24 text-white">
      <section className="border-b border-white/10 bg-[#10161f]">
        <ContentContainer>
          <div className="grid gap-6 lg:grid-cols-[180px_1fr_280px] lg:items-end">
            <div className="aspect-63/88 overflow-hidden bg-slate-900">
              {coverImage ? (
                <img src={coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No cover</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <span>{deck.format}</span>
                <span className="text-slate-600">/</span>
                <span>{deck.visibility}</span>
                {isOwner && <span className="bg-violet-500/15 px-2 py-1 text-violet-200">Editable</span>}
              </div>
              <div>
                <h1 className="text-3xl font-semibold leading-tight text-white lg:text-5xl">{deck.name}</h1>
                {deck.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{deck.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <span>{totalCards} cards</span>
                <span>Updated {new Date(deck.updated_at).toLocaleDateString()}</span>
                {deck.commander && <span>Commander: {deck.commander.name}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/60 p-3">
                <p className="text-2xl font-semibold">{totalCards}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Cards</p>
              </div>
              <div className="bg-slate-950/60 p-3">
                <p className="text-2xl font-semibold">{groupedCards.length}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Types</p>
              </div>
              <div className="bg-slate-950/60 p-3">
                <p className="text-2xl font-semibold">{formatInfo?.minDeckSize || '-'}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Minimum</p>
              </div>
            </div>
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            {deck.commander && (
              <section className="border border-white/10 bg-[#10161f] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Commander</p>
                {commanderImage && (
                  <img
                    src={commanderImage}
                    alt={deck.commander.name}
                    className="mb-4 aspect-63/88 w-full object-cover"
                  />
                )}
                <p className="font-semibold text-white">{deck.commander.name}</p>
                <p className="mt-1 text-xs text-slate-400">{deck.commander.type_line}</p>
              </section>
            )}

            <section className="border border-white/10 bg-[#10161f] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Deck Stats</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Format</span>
                  <span>{deck.format}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Visibility</span>
                  <span>{deck.visibility}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Created</span>
                  <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
          </aside>

          <section className="space-y-5">
            {isOwner && (
              <div ref={searchRef} className="relative border border-white/10 bg-[#10161f] p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Add card</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setShowResults(true)
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search cards by name..."
                    className="w-full border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-white placeholder-slate-500 outline-none transition focus:border-violet-500"
                  />
                </div>

                {showResults && (
                  <div className="absolute left-4 right-4 top-full z-30 mt-1 max-h-80 overflow-y-auto border border-slate-700 bg-slate-950 shadow-2xl shadow-black/50">
                    {isSearching ? (
                      <div className="px-3 py-3 text-sm text-slate-400">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((card) => {
                        const image = getSearchCardImage(card)

                        return (
                          <button
                            key={card.id}
                            type="button"
                            disabled={addingCardId === card.id}
                            onClick={() => handleAddCard(card)}
                            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                          >
                            <div className="h-12 w-9 shrink-0 overflow-hidden bg-slate-800">
                              {image ? (
                                <img src={image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">?</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{card.name}</p>
                              <p className="truncate text-xs text-slate-400">{card.type_line}</p>
                            </div>
                          </button>
                        )
                      })
                    ) : query.trim().length >= 2 ? (
                      <div className="px-3 py-3 text-sm text-slate-400">No cards found</div>
                    ) : (
                      <div className="px-3 py-3 text-sm text-slate-400">Type at least 2 characters</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {groupedCards.length > 0 ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {groupedCards.map((group) => (
                  <section key={group.type} className="border border-white/10 bg-[#10161f]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
                        {group.type}
                      </h2>
                      <span className="text-sm text-slate-400">{group.total}</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {group.cards.map((card) => {
                        const image = getImageUri(card)

                        return (
                          <div key={card.id} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 px-4 py-3">
                            <div className="h-14 w-10 overflow-hidden bg-slate-900">
                              {image ? (
                                <img src={image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">?</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">{card.quantity}x</span>
                                <p className="truncate text-sm font-medium text-white">{card.card_name}</p>
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-500">{card.type_line || 'Unknown type'}</p>
                            </div>
                            {isOwner && card.section !== 'commander' && (
                              <button
                                type="button"
                                disabled={removingCardId === card.id}
                                onClick={() => handleRemoveCard(card)}
                                className="cursor-pointer text-xs font-medium text-red-400 transition hover:text-red-300 disabled:cursor-wait disabled:opacity-60"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="border border-white/10 bg-[#10161f] p-12 text-center">
                <p className="text-slate-400">No cards in this deck yet.</p>
              </div>
            )}
          </section>
        </div>
      </ContentContainer>
    </main>
  )
}

export default DeckPage
