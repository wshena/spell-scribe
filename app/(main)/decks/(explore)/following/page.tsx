import DeckExplorer from "@/components/decks/DeckExplorer";
import {
  DeckExplorerSearchParams,
  getDeckExplorerFilters,
} from "../search-params";

type Props = {
  searchParams: Promise<DeckExplorerSearchParams>;
};

export default async function FollowingDecksPage({ searchParams }: Props) {
  const filters = getDeckExplorerFilters(await searchParams);

  return (
    <DeckExplorer
      initialDecks={[]}
      filters={filters}
      emptyMessage="Decks from people you follow will appear here."
    />
  );
}
