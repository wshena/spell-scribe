'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUtilityStore } from "@/lib/zustand/utilityStore"
import { CardProps } from '@/lib/scryfall/cards'
import { formatDecks } from '@/lib/constants'
import ContentContainer from '@/components/ui/containers/ContentContainer'

interface DeckCard {
  id: string
  card_id: string
  card_name: string
  quantity: number
  section: 'main' | 'sideboard' | 'commander' | 'maybeboard'
}

interface DeckData {
  id: string
  name: string
  format: string
  visibility: 'Public' | 'Unlisted' | 'Private'
  commander: CardProps | null
  description: string | null
  cards: DeckCard[]
  created_at: string
  updated_at: string
}

const DeckPage = () => {
  const params = useParams()
  const router = useRouter()
  const setAlert = useUtilityStore((state) => state.setAlert)

  const [deck, setDeck] = useState<DeckData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const deckId = params.id as string

  useEffect(() => {
    const fetchDeck = async () => {
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

        const data = await response.json()
        setDeck(data.deck)
      } catch (err: any) {
        console.error('Error fetching deck:', err)
        setError(err.message || 'Failed to load deck')
        setAlert({
          label: 'Failed to load deck',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (deckId) {
      fetchDeck()
    }
  }, [deckId, setAlert])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading deck...</p>
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Deck Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/your-decks')}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md transition-colors"
          >
            Back to My Decks
          </button>
        </div>
      </div>
    )
  }

  const formatInfo = formatDecks.find(f => f.name === deck.format)

  // Group cards by section
  const cardsBySection = deck.cards.reduce((acc, card) => {
    if (!acc[card.section]) {
      acc[card.section] = []
    }
    acc[card.section].push(card)
    return acc
  }, {} as Record<string, DeckCard[]>)

  const sections = ['commander', 'main', 'sideboard', 'maybeboard']

  return (
    <div className="w-full bg-[#0b0f14] pt-23 pb-16 text-white">
      {/* Header */}
      <div className="" style={{
        backgroundImage: 'linear-gradient(rgba(115, 31, 161, 0.95), rgba(115, 31, 161, 0.95))'
      }}>
        <ContentContainer>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium">
                {deck.format}
              </span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium">
                {deck.visibility}
              </span>
              {deck.commander && (
                <span className="text-violet-400">
                  Commander: {deck.commander.name}
                </span>
              )}
            </div>
            {deck.description && (
            <p className="mt-3 text-slate-300">{deck.description}</p>
            )}
          </div>
        </ContentContainer>
      </div>

      {/* Deck Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards List */}
          <div className="lg:col-span-2 space-y-6">
            {sections.map(section => {
              const cards = cardsBySection[section] || []
              if (cards.length === 0) return null

              return (
                <div key={section} className="bg-[#161b24] border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize text-violet-300">
                    {section} ({cards.reduce((sum, card) => sum + card.quantity, 0)} cards)
                  </h3>
                  <div className="space-y-2">
                    {cards.map(card => (
                      <div key={card.id} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-sm">
                            {card.quantity}x
                          </span>
                          <span className="text-white">{card.card_name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-white text-sm">
                            Edit
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {deck.cards.length === 0 && (
              <div className="bg-[#161b24] border border-white/10 rounded-lg p-12 text-center">
                <p className="text-slate-400 mb-4">No cards in this deck yet</p>
                <button className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-md transition-colors">
                  Add Cards
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deck Stats */}
            <div className="bg-[#161b24] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-violet-300">Deck Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cards:</span>
                  <span className="text-white font-medium">
                    {deck.cards.reduce((sum, card) => sum + card.quantity, 0)}
                  </span>
                </div>
                {formatInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Format:</span>
                      <span className="text-white">{formatInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Size:</span>
                      <span className="text-white">{formatInfo.minDeckSize}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="text-white">
                    {new Date(deck.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-white">
                    {new Date(deck.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Commander Info */}
            {deck.commander && (
              <div className="bg-[#161b24] border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-violet-300">Commander</h3>
                <div className="text-center">
                  {deck.commander.image_uris?.normal && (
                    <img
                      src={deck.commander.image_uris.normal}
                      alt={deck.commander.name}
                      className="w-32 h-44 object-cover rounded-lg mx-auto mb-4 border border-white/10"
                    />
                  )}
                  <h4 className="font-medium text-white mb-2">{deck.commander.name}</h4>
                  {deck.commander.color_identity && (
                    <div className="flex justify-center gap-1">
                      {deck.commander.color_identity.map(color => (
                        <div
                          key={color}
                          className={`w-4 h-4 rounded-full ${
                            color === 'W' ? 'bg-yellow-400' :
                            color === 'U' ? 'bg-blue-400' :
                            color === 'B' ? 'bg-gray-800' :
                            color === 'R' ? 'bg-red-500' :
                            color === 'G' ? 'bg-green-500' :
                            'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeckPage