
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getDeck } from '@/lib/supabase/decks'
import DeckDetails from '@/components/decks/DeckDetails'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: id } = await params
  
  try {
    const deckDetails = await getDeck(id)
    return {
      title: `${deckDetails?.name} | SpellScribe - MTG Deck Builder`,
      description: `Explore the ${deckDetails?.name} deck. Browse cards, build powerful decks with SpellScribe.`,
      keywords: [
        `${deckDetails?.name}`,
        "MTG deck",
        "Magic: The Gathering",
        "deck building",
        "card collection",
      ],
      openGraph: {
        title: `${deckDetails?.name} | SpellScribe`,
        description: `Explore the ${deckDetails?.name} deck`,
        type: "website",
      },
    }
  } catch (error) {
    return {
      title: "Deck Not Found | SpellScribe",
      description: "This MTG deck could not be found.",
    }
  }
}

const DeckPage = () => {
  return (
    <DeckDetails />
  )
}

export default DeckPage
