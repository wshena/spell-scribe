"use client";

import CardCollection from "@/components/cards/CardCollection";
import { ScryfallSetCardsResponse } from "@/lib/scryfall/cards";

interface SetCardsCollectionProps {
  initialItems: ScryfallSetCardsResponse;
  initialHasMore: boolean;
  initialTotalCount: number;
  searchUri?: string;
  showTabs?: boolean;
  showSort?: boolean;
}

const SetCardsCollection = ({
  initialItems,
  showTabs = true,
  showSort = true,
}: SetCardsCollectionProps) => {
  return (
    <CardCollection
      initialItems={initialItems}
      emptyMessage="No cards found for this set."
      emptyFilterMessage="No cards found for this rarity."
      showTabs={showTabs}
      showSort={showSort}
    />
  );
};

export default SetCardsCollection;
