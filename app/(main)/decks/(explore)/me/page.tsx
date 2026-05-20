import DeckExplorer from "@/components/decks/DeckExplorer";
import { DeckWithCards, getUserDecks } from "@/lib/supabase/decks";
import {
  DeckExplorerSearchParams,
  getDeckExplorerFilters,
} from "../search-params";

type Props = {
  searchParams: Promise<DeckExplorerSearchParams>;
};

export default async function MyDecksPage({ searchParams }: Props) {
  const filters = getDeckExplorerFilters(await searchParams);
  const userDecks = (await getUserDecks()) as DeckWithCards[];

  return (
    <DeckExplorer
      initialDecks={userDecks}
      filters={filters}
      emptyMessage="You do not have any decks here yet."
    />
  );
}
