'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { CardProps, fetchCardAutocomplete, fetchCardBaseOnName } from '@/lib/scryfall/cards'

interface CommanderSearchProps {
  onSelectCommander: (commander: CardProps | null) => void
  selectedCommander: CardProps | null
}

const CommanderSearch = ({ onSelectCommander, selectedCommander }: CommanderSearchProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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
    const searchCommanders = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetchCardAutocomplete(query)
        setResults(response.data.slice(0, 10))
      } catch (error) {
        console.error('Error searching commander names:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCommanders, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelectCommander = async (commanderName: string) => {
    setIsSelecting(true)
    try {
      const card = await fetchCardBaseOnName(commanderName)
      onSelectCommander(card)
      setQuery(card.name)
      setShowResults(false)
    } catch (error) {
      console.error('Error fetching commander card:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleClearCommander = () => {
    onSelectCommander(null)
    setQuery('')
  }

  return (
    <div ref={searchRef} className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Commander
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for a legendary creature or planeswalker..."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />

        {selectedCommander && (
          <button
            onClick={handleClearCommander}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-slate-400 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            results.map((name) => (
              <button
                key={name}
                onClick={() => handleSelectCommander(name)}
                className="cursor-pointer w-full px-3 py-2 text-left hover:bg-slate-700"
                disabled={isSelecting}
              >
                <span className="text-white text-sm truncate">{name}</span>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="px-3 py-2 text-slate-400 text-sm">No commanders found</div>
          ) : (
            <div className="px-3 py-2 text-slate-400 text-sm">Type at least 2 characters</div>
          )}
        </div>
      )}

      {selectedCommander && (
        <div className="mt-2 p-2 bg-slate-800 border border-slate-600 rounded-md flex items-center gap-3">
          <div className="w-10 h-10 shrink-0">
            {selectedCommander.image_uris?.small ? (
              <Image
                src={selectedCommander.image_uris.small}
                alt={selectedCommander.name}
                width={40}
                height={40}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-slate-600 rounded flex items-center justify-center text-sm text-slate-400">
                ?
              </div>
            )}
          </div>
          <div>
            <div className="text-white text-sm font-medium">
              {selectedCommander.name}
            </div>
            <div className="text-slate-400 text-xs">
              {selectedCommander.type_line}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommanderSearch