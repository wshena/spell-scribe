import { Metadata } from 'next'
import SetsExplorer from '@/components/sets/SetsExplorer'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import { getSetFiltersFromParams, getSetsPage } from '@/lib/scryfall/sets'

export const metadata: Metadata = {
  title: "Explore Sets | SpellScribe - MTG Deck Building Tool",
  description: "Browse and explore all Magic: The Gathering sets. Discover cards, build powerful decks with SpellScribe.",
  keywords: [
    "MTG sets",
    "Magic sets",
    "Magic: The Gathering sets",
    "MTG cards",
    "deck building",
  ],
  openGraph: {
    title: "Explore Sets | SpellScribe",
    description: "Browse and explore all Magic: The Gathering sets.",
    type: "website",
  },
}

export default async function CardsPage({
  searchParams,
}: PageProps<'/sets'>) {
  const filters = getSetFiltersFromParams(await searchParams)
  const result = await getSetsPage(filters)

  return (
    <section className="min-h-screen w-full bg-[#0b0f14] pt-28 pb-16">
      <ContentContainer>
        <SetsExplorer
          initialItems={result.items}
          initialHasMore={result.hasMore}
          initialTotalCount={result.totalCount}
          initialFilters={result.filters}
          setTypeOptions={result.setTypeOptions}
        />
      </ContentContainer>
    </section>
  )
}
