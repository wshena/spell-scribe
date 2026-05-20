import DeckExplorer from "@/components/decks/DeckExplorer";
import {
  DeckExplorerSearchParams,
  getDeckExplorerFilters,
} from "../search-params";

type Props = {
  searchParams: Promise<DeckExplorerSearchParams>;
};

export default async function LikedDecksPage({ searchParams }: Props) {
  const filters = getDeckExplorerFilters(await searchParams);

  return (
    <DeckExplorer
      initialDecks={[]}
      filters={filters}
      emptyMessage="Decks you like will appear here."
    />
  );
}
