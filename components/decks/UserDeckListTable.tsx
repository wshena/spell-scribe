'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DeckWithCards } from '@/lib/supabase/decks'
import { extractManaColors, formatRelativeTime, getColorInfo } from '@/lib/utils/deckUtils'
import { getManaColorSymbolMap } from '@/lib/scryfall/manaSymbols'
import { SearchIcon, OptionsIcon } from '@/components/icons/Icons'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

type SortOption = 'name' | 'format' | 'updated' | 'cards'

interface UserDeckListTableProps {
  decks: DeckWithCards[]
}

export default function UserDeckListTable({ decks }: UserDeckListTableProps) {
  const router = useRouter()
  const setAlert = useUtilityStore((state) => state.setAlert)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null)
  const [colorSymbolMap, setColorSymbolMap] = useState<Map<string, string>>(new Map())
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
          setOpenMenuId(null)
          setMenuPosition(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    const fetchColorSymbols = async () => {
      try {
        setColorSymbolMap(await getManaColorSymbolMap())
      } catch (error) {
        console.error('Error fetching color mana symbols:', error)
      }
    }

    fetchColorSymbols()
  }, [])

  useEffect(() => {
    if (!openMenuId) return

    const closeMenu = () => {
      setOpenMenuId(null)
      setMenuPosition(null)
    }

    window.addEventListener('resize', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
    return () => {
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('scroll', closeMenu, true)
    }
  }, [openMenuId])

  // Filter and sort decks
  const filteredAndSortedDecks = useMemo(() => {
    let result = [...decks]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
          deck.format.toLowerCase().includes(query) ||
          (deck.description?.toLowerCase().includes(query) || false)
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'format':
          return a.format.localeCompare(b.format)
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'cards':
          const aCards = a.cards.reduce((sum, card) => sum + card.quantity, 0)
          const bCards = b.cards.reduce((sum, card) => sum + card.quantity, 0)
          return bCards - aCards
        default:
          return 0
      }
    })

    return result
  }, [decks, searchQuery, sortBy])

  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (deletingDeckId) return

    const shouldDelete = window.confirm(`Delete "${deckName}"? This cannot be undone.`)
    if (!shouldDelete) {
      setOpenMenuId(null)
      return
    }

    setDeletingDeckId(deckId)
    setOpenMenuId(null)
    setMenuPosition(null)

    try {
      const response = await fetch(`/api/decks?id=${encodeURIComponent(deckId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to delete deck')
      }

      setAlert({
        label: `${deckName} deleted successfully`,
        type: 'success',
      })
      router.refresh()
    } catch (error) {
      setAlert({
        label: error instanceof Error ? error.message : 'Failed to delete deck',
        type: 'error',
      })
    } finally {
      setDeletingDeckId(null)
    }
  }

  const handleToggleMenu = (deckId: string, button: HTMLButtonElement) => {
    if (openMenuId === deckId) {
      setOpenMenuId(null)
      setMenuPosition(null)
      return
    }

    const rect = button.getBoundingClientRect()
    setOpenMenuId(deckId)
    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(16, rect.right - 192),
    })
  }

  const trackDeckHistory = (deckId: string, action: 'view' | 'edit') => {
    fetch(`/api/decks/${deckId}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
      keepalive: true,
    }).catch(() => {})
  }

  if (!decks.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0f1319] p-8 text-center">
        <p className="text-lg font-semibold text-white mb-2">No personal decks found</p>
        <p className="text-sm text-slate-400">
          Create your first deck to start tracking cards and commander builds.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by deck name or format..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm font-medium text-slate-300">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          >
            <option value="updated">Last Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="format">Format</option>
            <option value="cards">Card Count</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-slate-400">
          Found {filteredAndSortedDecks.length} of {decks.length} deck{decks.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Empty search result */}
      {filteredAndSortedDecks.length === 0 && searchQuery && (
        <div className="rounded-lg border border-white/10 bg-[#0f1319] p-8 text-center">
          <p className="text-lg font-semibold text-white mb-2">No decks found</p>
          <p className="text-sm text-slate-400">Try adjusting your search query</p>
        </div>
      )}

      {/* Table */}
      {filteredAndSortedDecks.length > 0 && (
        <div className="relative overflow-visible">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="z-20 border-b border-b-white/10">
                <th className="w-[32%] px-4 py-4 text-left font-semibold text-slate-300 sm:px-6">Name</th>
                <th className="w-[16%] px-4 py-4 text-left font-semibold text-slate-300 sm:px-6">Format</th>
                <th className="w-[14%] px-4 py-4 text-left font-semibold text-slate-300 sm:px-6">Colors</th>
                <th className="w-[12%] px-4 py-4 text-left font-semibold text-slate-300 sm:px-6">Cards</th>
                <th className="w-[18%] px-4 py-4 text-left font-semibold text-slate-300 sm:px-6">Last Updated</th>
                <th className="w-[8%] px-4 py-4 text-right font-semibold text-slate-300 sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDecks.map((deck) => {
                const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0)
                const commanderCard = deck.cards.find((card) => card.section === 'commander')
                const colors = extractManaColors(deck.cards)
                const displayColors = colors.length ? colors : deck.commander?.color_identity || []

                return (
                  <tr key={deck.id} className="border-b border-b-white/5 transition">
                    {/* Name */}
                    <td className="px-4 py-4 sm:px-6">
                      <Link
                        href={`/decks/${deck.id}`}
                        className="block truncate font-medium text-white hover:text-violet-300 transition"
                        onClick={() => trackDeckHistory(deck.id as string, 'view')}
                      >
                        {deck.name}
                      </Link>
                      {deck.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-1">{deck.description}</p>
                      )}
                    </td>

                    {/* Format */}
                    <td className="px-4 py-4 sm:px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-200">
                        {deck.format}
                      </span>
                    </td>

                    {/* Colors */}
                    <td className="px-4 py-4 sm:px-6">
                      {displayColors.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {displayColors.map((color) => (
                            colorSymbolMap.get(color) ? (
                              <Image
                                key={color}
                                src={colorSymbolMap.get(color) || ''}
                                alt={getColorInfo(color).label}
                                width={20}
                                height={20}
                                title={getColorInfo(color).label}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <div
                              key={color}
                              title={getColorInfo(color).label}
                              className={`h-5 w-5 rounded-full border border-white/20 ${getColorInfo(color).bg}`}
                              />
                            )
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {/* Cards Count */}
                    <td className="px-4 py-4 sm:px-6">
                      <span className="text-slate-300">{totalCards}</span>
                      {commanderCard && (
                        <p className="text-xs text-slate-400">+1 commander</p>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-4 sm:px-6">
                      <span className="text-slate-400">{formatRelativeTime(deck.updated_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right sm:px-6">
                      <div>
                        <button
                          onClick={(event) => handleToggleMenu(deck.id as string, event.currentTarget)}
                          className="cursor-pointer p-2 text-slate-400 transition"
                          aria-label="Deck options"
                        >
                          <OptionsIcon size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === deck.id && (
                          <div
                            ref={(el) => {
                              if (el) menuRefs.current[deck.id as string] = el
                            }}
                            style={menuPosition || undefined}
                            className="fixed w-48 bg-slate-900 border border-white/10 z-50 shadow-2xl shadow-black/40"
                          >
                            <Link
                              href={`/decks/${deck.id}`}
                              className="text-left block px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition"
                              onClick={() => {
                                trackDeckHistory(deck.id as string, 'view')
                                setOpenMenuId(null)
                              }}
                            >
                              View Deck
                            </Link>
                            <Link
                              href={`/decks/${deck.id}`}
                              className="text-left block px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition border-t border-white/5"
                              onClick={() => {
                                trackDeckHistory(deck.id as string, 'edit')
                                setOpenMenuId(null)
                              }}
                            >
                              Edit Deck
                            </Link>
                            <button
                              disabled={deletingDeckId === deck.id}
                              className="cursor-pointer w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition border-t border-white/5"
                              onClick={() => handleDeleteDeck(deck.id as string, deck.name)}
                            >
                              {deletingDeckId === deck.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
