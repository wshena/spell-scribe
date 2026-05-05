'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUtilityStore } from "@/lib/zustand/utilityStore"
import { CancelIcon } from "../../icons/Icons"
import { formatDecks } from "@/lib/constants"
import CommanderSearch from "./CommanderSearch"
import { CardProps } from '@/lib/scryfall/cards'
import { createSlug } from '@/lib/utils'

type Visibility = 'Public' | 'Unlisted' | 'Private'

interface DeckFormData {
  name: string
  format: string
  commander: CardProps | null
  visibility: Visibility
}

const CreateNewDeckModal = () => {
  const router = useRouter()
  const closeModal = useUtilityStore((state) => state.closeModal)
  const setAlert = useUtilityStore((state) => state.setAlert)

  const [formData, setFormData] = useState<DeckFormData>({
    name: '',
    format: '',
    commander: null,
    visibility: 'Private'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Generate unique ID with uppercase, lowercase, and numbers
  const generateUniqueId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const selectedFormat = formatDecks.find(f => f.name === formData.format)

  const handleInputChange = (field: keyof DeckFormData, value: string | CardProps | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Deck name is required'
    }

    if (!formData.format) {
      newErrors.format = 'Please select a format'
    }

    if (selectedFormat?.commander && !formData.commander) {
      newErrors.commander = 'Commander is required for this format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Generate unique ID
      const deckId = generateUniqueId()

      // Prepare deck data
      const deckData = {
        name: formData.name.trim(),
        format: formData.format,
        visibility: formData.visibility,
        commander: formData.commander,
        description: null
      }

      // Prepare cards array - include commander if exists
      const cards = []
      if (formData.commander) {
        cards.push({
          card_id: formData.commander.id,
          card_name: formData.commander.name,
          quantity: 1,
          section: 'commander'
        })
      }

      // Create deck via API
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deckData, cards }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create deck')
      }

      const result = await response.json()

      // Show success message
      setAlert({
        label: `${formData.name} created successfully`,
        type: 'success'
      })

      // Close modal
      closeModal()

      // Redirect to the new deck page
      router.push(`/decks/${result.deck.id}`)

    } catch (error: any) {
      console.error('Error creating deck:', error)
      setErrors({ submit: error.message || 'Unable to create deck. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[min(92vw,34rem)] max-h-[95vh] border border-white/10 bg-[#161b24] p-6 text-white overflow-hidden flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
          Create New Deck
        </p>
        <button
          onClick={closeModal}
          className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white shrink-0"
        >
          <CancelIcon size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-slate-800
        [&::-webkit-scrollbar-thumb]:bg-slate-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deck Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deck Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter deck name..."
              className={`w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Format *
            </label>
            <select
              value={formData.format}
              onChange={(e) => handleInputChange('format', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                errors.format ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Select a format...</option>
              {formatDecks.map((format) => (
                <option key={format.name} value={format.name}>
                  {format.name}
                </option>
              ))}
            </select>
            {errors.format && (
              <p className="mt-1 text-sm text-red-400">{errors.format}</p>
            )}

            {selectedFormat && (
              <div className="mt-2 p-3 bg-slate-800 border border-slate-600 rounded-md">
                <div className="text-sm text-slate-300 space-y-1">
                  <div><strong>Min Deck Size:</strong> {selectedFormat.minDeckSize} cards</div>
                  <div><strong>Max Duplicates:</strong> {selectedFormat.maxDuplicates}</div>
                  <div><strong>Sideboard:</strong> {selectedFormat.sideboardSize} cards</div>
                  <div className="mt-2 text-xs text-slate-400">
                    {selectedFormat.specialRules}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commander Search - Only show if format requires commander */}
          {selectedFormat?.commander && (
            <CommanderSearch
              onSelectCommander={(commander) => handleInputChange('commander', commander)}
              selectedCommander={formData.commander}
            />
          )}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Visibility
            </label>
            <div className="space-y-2">
              {(['Public', 'Unlisted', 'Private'] as Visibility[]).map((visibility) => (
                <label key={visibility} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value={visibility}
                    checked={formData.visibility === visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value as Visibility)}
                    className="text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-300">
                    {visibility}
                    {visibility === 'Public' && ' - Anyone can view and copy'}
                    {visibility === 'Unlisted' && ' - Only people with the link can view'}
                    {visibility === 'Private' && ' - Only you can view'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            {errors.submit && (
              <p className="mr-auto self-center text-sm text-red-400">{errors.submit}</p>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNewDeckModal
