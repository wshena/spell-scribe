import { fetchAdvancedSearchServer } from "@/lib/scryfall/advanceSearch";

interface Props {
  searchParams: Promise<{
    q?: string;
    order?: string;
    dir?: string;
    page?: string;
  }>;
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

  return (
    <div>
      <p>{result.total_cards} cards found</p>
      {/* render result.data */}
    </div>
  );
}
