import SetCardsCollection from '@/components/sets/SetCardsCollection'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import { fetchSetDetail } from '@/lib/scryfall/sets'
import { fetcher } from '@/utils/fetcher'

const page = async ({params}:{params: Promise<{code:string}>}) => {
  const {code: setCode} = await params
 
  const setDetails = await fetchSetDetail(setCode)
  const allCardsOnSet = await fetcher(
    `${setDetails.search_uri}`,
  )

  return (
    <main className="min-h-screen w-full bg-[#0b0f14] pt-28 pb-16">
      <ContentContainer>
        <div className="space-y-5">
          <Breadcrumb items={[
            {label: 'Sets', href: '/sets'},
            {label: `${setDetails.name}`}
          ]} />

          <SetCardsCollection
            initialItems={allCardsOnSet}
            initialHasMore={allCardsOnSet.has_more}
            initialTotalCount={allCardsOnSet.total_cards}
            searchUri={setDetails.search_uri}
          />
        </div>
      </ContentContainer>
    </main>
  )
}

export default page