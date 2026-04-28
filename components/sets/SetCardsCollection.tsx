'use client'

import { CardProps, ScryfallSetCardsResponse } from '@/lib/scryfall/cards'
import { useState, useEffect, useRef, useCallback } from 'react'
import { fetcher } from '@/utils/fetcher'
import { cn } from '@/lib/utils'
import Card from '../Cards/Card'
import CardPlaceholder from '../Cards/CardPlaceholder'

interface SetsExplorerProps {
  initialItems: ScryfallSetCardsResponse
  initialHasMore: boolean
  initialTotalCount: number
  searchUri: string
}

const SetCardsCollection = ({
  initialItems,
  initialHasMore,
  initialTotalCount,
  searchUri
}: SetsExplorerProps) => {
  const [cards, setCards] = useState<CardProps[]>(initialItems.data)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextPage, setNextPage] = useState<string | undefined>(initialItems.next_page)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'mythic' | 'rare' | 'uncommon' | 'common'>('all')
  const [sortValue, setSortValue] = useState<string>('name-asc')

  const observerRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextPage) return

    setLoading(true)
    try {
      const response: ScryfallSetCardsResponse = await fetcher(nextPage)
      setCards(prev => [...prev, ...response.data])
      setHasMore(response.has_more)
      setNextPage(response.next_page)
    } catch (error) {
      console.error('Error loading more cards:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, nextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  const filteredCards = cards.filter(card => {
    if (activeTab === 'all') return true
    return card.rarity === activeTab
  })

  // Sort function
  const [sortBy, sortOrder] = sortValue.split('-') as [string, string]
  const sortedCards = [...filteredCards].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'price') {
      const priceA = a.prices.usd ? parseFloat(a.prices.usd) : 0
      const priceB = b.prices.usd ? parseFloat(b.prices.usd) : 0
      comparison = priceA - priceB
    } else if (sortBy === 'collector_number') {
      // Handle collector numbers that might be mixed with letters and numbers
      const numA = parseInt(a.collector_number) || 0
      const numB = parseInt(b.collector_number) || 0
      if (numA !== numB) {
        comparison = numA - numB
      } else {
        comparison = a.collector_number.localeCompare(b.collector_number)
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const tabs = [
    { key: 'all', label: 'All Cards' },
    { key: 'mythic', label: 'Mythics' },
    { key: 'rare', label: 'Rares' },
    { key: 'uncommon', label: 'Uncommons' },
    { key: 'common', label: 'Commons' }
  ] as const

  if (initialItems.data.length === 0) {
    return (
      <section className="w-full flex items-center justify-center">
        <p>No cards found for this set.</p>
      </section>
    )
  }

  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-0">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-3 md:flex md:space-x-4 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'cursor-pointer text-sm font-medium px-2 py-1 rounded',
                activeTab === tab.key ? 'bg-gray-600 text-white' : 'text-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded text-sm cursor-pointer"
          >
            <option value="name-asc">Name (Asc)</option>
            <option value="name-desc">Name (Desc)</option>
            <option value="price-asc">Price (Asc)</option>
            <option value="price-desc">Price (Desc)</option>
            <option value="collector_number-asc">Collector Number (Asc)</option>
            <option value="collector_number-desc">Collector Number (Desc)</option>
          </select>
        </div>
      </div>
      
      {/* if no card based on rarity filter */}
      {filteredCards.length === 0 && (
        <div className="flex items-center justify-center w-full mt-10">
          <p>No cards found for this rarity.</p>
        </div>
      )}
      
      {/* Cards Grid */}
      <ul className="mt-5 flex flex-col items-center md:items-start md:grid md:grid-cols-5 gap-3">

        {sortedCards.map((card) => (
          <li key={card.id}>
            <Card data={card} />
          </li>
        ))}

        {/* Loading indicator */}
        {loading && Array.from({ length: 5 }).map((_, index) => (
          <li key={`loading-${index}`}>
            <CardPlaceholder />
          </li>
        ))}
      </ul>

      {/* Intersection Observer Target */}
      <div ref={observerRef} className="h-10" />
    </section>
  )
}

export default SetCardsCollection