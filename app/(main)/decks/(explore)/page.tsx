import DeckExplorer from "@/components/decks/DeckExplorer";
import { getPublicDecks } from "@/lib/supabase/decks";
import {
  DeckExplorerSearchParams,
  getDeckExplorerFilters,
} from "./search-params";

type Props = {
  searchParams: Promise<DeckExplorerSearchParams>;
};

export default async function DecksPage({ searchParams }: Props) {
  const filters = getDeckExplorerFilters(await searchParams);
  const publicDecks = await getPublicDecks(1, 20);

  return (
    <DeckExplorer
      initialDecks={publicDecks.items}
      filters={filters}
    />
  );
}
