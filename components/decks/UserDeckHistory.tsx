/* eslint-disable @next/next/no-img-element */

import type { DeckHistoryItem } from "@/lib/supabase/decks";
import { extractManaColors } from "@/lib/utils/deckUtils";
import DeckCard from "../cards/DeckCard";

interface UserDeckHistoryProps {
  history: DeckHistoryItem[];
}

export default async function UserDeckHistory({
  history,
}: UserDeckHistoryProps) {
  if (!history.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-violet-300">
            Recent Activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Deck History
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {history.map((item) => {
          const colors = extractManaColors(item.deck.cards);
          const displayColors = colors.length
            ? colors
            : item.deck.commander?.color_identity || [];

          return <DeckCard deck={item} key={item.id} />;
        })}
      </div>
    </section>
  );
}
