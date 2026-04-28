'use client'

import { useUtilityStore } from '@/lib/zustand/utilityStore'
import CloseButton from '../button/CloseButton'

const tips = [
  'Find sets with set name like "Dominaria" or "Modern Horizons". Use short set codes like "khm", "neo", or "mh3" for faster results. Filter by set type, such as "core", "expansion", or "masters". Use the advanced search filters to narrow down your results.',
  "Our search is usingScryfall, so you can do powerful things right in the search box. For example:t:creature e:neo cmc>6will search for all creatures from Kamigawa: Neon Dynasty with a mana value above 6. Learn more aboutScryfall's syntax.",
  'If you set up Scryfall defaults in your Account Settings, you can temporarily disable them in your search by adding !defaults anywhere in your search query.',
]

export default function CardsSearchTipsModal() {
  const closeModal = useUtilityStore((state) => state.closeModal)

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#10161f] p-6 text-white shadow-2xl">
      <div className="border-b border-b-white/5 pb-5 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Search tips</p>
        <CloseButton onClick={closeModal} />
      </div>

      <div className="mt-6 space-y-3">
        {tips.map((tip) => (
          <div key={tip} className="text-sm leading-7 text-slate-200">
            {tip}
          </div>
        ))}
      </div>
    </div>
  )
}
