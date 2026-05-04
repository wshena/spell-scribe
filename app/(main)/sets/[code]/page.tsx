import { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ContentContainer from '@/components/ui/containers/ContentContainer'
import { fetchSetDetail } from '@/lib/scryfall/sets'
import { fetcher } from '@/utils/fetcher'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const SetCardsCollection = dynamic(() => import('@/components/sets/SetCardsCollection'))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code: setCode } = await params
  
  try {
    const setDetails = await fetchSetDetail(setCode)
    return {
      title: `${setDetails.name} | SpellScribe - MTG Deck Builder`,
      description: `Explore all cards from the ${setDetails.name} set. Browse cards, build powerful decks with SpellScribe.`,
      keywords: [
        `${setDetails.name}`,
        "MTG set",
        "Magic: The Gathering",
        "deck building",
        "card collection",
      ],
      openGraph: {
        title: `${setDetails.name} | SpellScribe`,
        description: `Explore all cards from ${setDetails.name}`,
        type: "website",
      },
    }
  } catch (error) {
    return {
      title: "Set Not Found | SpellScribe",
      description: "This MTG set could not be found.",
    }
  }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

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
          <div className="space-y-1">
            <Breadcrumb items={[
              {label: 'Sets', href: '/sets'},
              {label: `${setDetails.name}`}
            ]} />

            <div className="flex items-center gap-5">
              {setDetails.icon_svg_uri && (
                <Image 
                  src={setDetails.icon_svg_uri ?? setDetails.icon_svg_uri ?? '/placeholder_set_icon.png'}
                  alt={setDetails.name}
                  width={32}
                  height={32}
                  loading='lazy'
                  className='bg-white/90 p-0.5 rounded-md'
                />
              )}
              <div className="space-y">
                <h1 className="text-2xl font-bold text-white">{setDetails.name}</h1>
                <p className="text-sm text-slate-400">
                  {setDetails.card_count} cards, released on {setDetails.released_at ? dateFormatter.format(new Date(setDetails.released_at)) : '-'}
                </p>
              </div>
            </div>
          </div>

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