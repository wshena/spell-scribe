import Card from "@/components/Cards/Card";
import CardPlaceholder from "@/components/Cards/CardPlaceholder";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import { fetchAdvancedSearchServer } from "@/lib/scryfall/advanceSearch";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    q?: string;
    order?: string;
    dir?: string;
    page?: string;
  }>;
}

export default async function DeckSearchPage({ params, searchParams }: Props) {
  const { id } = await params;
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

  return (
    <main className="min-h-screen bg-[#0b0f14] pb-16 pt-24">
      <ContentContainer>
        <p>{result.total_cards} cards found</p>

        {/* render result.data */}
        {/* Cards Grid */}
        <ul className="mt-5 flex flex-col items-center md:items-start md:grid md:grid-cols-5 gap-3">
          {result.data.map((card) => (
            <li key={card.id}>
              <Card data={card} />
            </li>
          ))}

          {/* Loading indicator */}
          {result.data.length <= 0 &&
            Array.from({ length: 5 }).map((_, index) => (
              <li key={`loading-${index}`}>
                <CardPlaceholder />
              </li>
            ))}
        </ul>
      </ContentContainer>
    </main>
  );
}
