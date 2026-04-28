'use client'

import type { SetSortOption, SetTypeOption } from '@/lib/scryfall/sets'
import { useEffect, useState } from 'react'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import CloseButton from '../button/CloseButton'

interface CardsAdvancedSearchModalProps {
  initialExactCode: string
  initialIncludeDigital: boolean
  initialSort: SetSortOption
  initialSetType: string
  setTypeOptions: SetTypeOption[]
  onApply: (payload: {
    exactCode: string
    includeDigital: boolean
    sort: SetSortOption
    setType: string
  }) => void
}

export default function CardsAdvancedSearchModal({
  initialExactCode,
  initialIncludeDigital,
  initialSort,
  initialSetType,
  setTypeOptions,
  onApply,
}: CardsAdvancedSearchModalProps) {
  const closeModal = useUtilityStore((state) => state.closeModal)
  const [exactCode, setExactCode] = useState(initialExactCode)
  const [includeDigital, setIncludeDigital] = useState(initialIncludeDigital)
  const [sort, setSort] = useState<SetSortOption>(initialSort)
  const [setType, setSetType] = useState(initialSetType)

  useEffect(() => {
    setExactCode(initialExactCode)
    setIncludeDigital(initialIncludeDigital)
    setSort(initialSort)
    setSetType(initialSetType)
  }, [initialExactCode, initialIncludeDigital, initialSetType, initialSort])

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#10161f] p-6 text-white shadow-2xl">
      <div className="border-b border-b-white/5 pb-5 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Advanced search</p>
        <CloseButton onClick={closeModal} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Exact set code</span>
          <input
            value={exactCode}
            onChange={(event) => setExactCode(event.target.value)}
            placeholder="mis. mh3"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SetSortOption)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
          >
            <option value="released_desc">Newest release first</option>
            <option value="released_asc">Oldest release first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="card_count_desc">Largest card pool</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-200">Set type</span>
          <select
            value={setType}
            onChange={(event) => setSetType(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
          >
            {setTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="cursor-pointer flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={includeDigital}
            onChange={(event) => setIncludeDigital(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-slate-200">Include digital-only sets</span>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={closeModal}
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onApply({ exactCode, includeDigital, sort, setType })
            closeModal()
          }}
          className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400"
        >
          Apply filters
        </button>
      </div>
    </div>
  )
}
