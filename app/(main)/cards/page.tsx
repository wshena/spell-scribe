import CardsExplorer from '@/components/cards/CardsExplorer'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import { getSetFiltersFromParams, getSetsPage } from '@/lib/scryfall/sets'

export default async function CardsPage({
  searchParams,
}: PageProps<'/cards'>) {
  const filters = getSetFiltersFromParams(await searchParams)
  const result = await getSetsPage(filters)

  return (
    <main className="min-h-screen w-full bg-[#0b0f14] pt-28 pb-16">
      <ContentContainer>
        <CardsExplorer
          initialItems={result.items}
          initialHasMore={result.hasMore}
          initialTotalCount={result.totalCount}
          initialFilters={result.filters}
          setTypeOptions={result.setTypeOptions}
        />
      </ContentContainer>
    </main>
  )
}
