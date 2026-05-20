import CardCollection from "@/components/cards/CardCollection";
import CardSearchForm from "@/components/cards/CardSearchForm";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import { fetchAdvancedSearchServer } from "@/lib/scryfall/advanceSearch";
import { Metadata } from "next";

interface Props {
  searchParams: Promise<{
    q?: string;
    order?: string;
    dir?: string;
    page?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Search Cards | SpellScribe - MTG Deck Builder`,
    description: `Search and filter through thousands of Magic: The Gathering cards. Find the latest meta builds, budget options, and community-created decks by format, color, or commander.`,
    keywords: [
      "MTG deck",
      "Magic: The Gathering",
      "deck building",
      "card collection",
    ],
    openGraph: {
      title: `Search Cards | SpellScribe`,
      description: `Search and filter through thousands of Magic: The Gathering cards`,
      type: "website",
    },
  };
}

export default async function CardsSearchPage({ searchParams }: Props) {
  const {
    q = "",
    order = "name",
    dir = "asc",
    page = "1",
  } = await searchParams;

  const result = await fetchAdvancedSearchServer({
    rawQuery: q,
    order,
    order_dir: dir === "desc" ? "Descending" : "Ascending",
    page: parseInt(page),
  });

  const visibleSearchQuery = q.match(/^name:"([^"]*)"$/)?.[1] ?? q;

  return (
    <main className="min-h-screen bg-[#0b0f14] pb-16 pt-24">
      <ContentContainer>
        <div className="mb-6 text-white">
          <CardSearchForm
            context={{ type: "sets" }}
            initialQuery={visibleSearchQuery}
            placeholder="Search card name for this deck"
          />
        </div>

        <p className="mb-10 text-sm md:text-md text-gray-500">
          Search for <span>{q || "all cards"}</span> returned{" "}
          {result.total_cards} cards found
        </p>

        <CardCollection
          key={`${q}-${order}-${dir}-${page}`}
          initialItems={result}
          emptyMessage="No cards found for this search."
          showTabs={false}
          showSort={false}
          initialSortValue={`${order}-${dir}`}
        />
      </ContentContainer>
    </main>
  );
}
