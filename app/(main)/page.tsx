import DeckCard from "@/components/cards/DeckCard";
import HomeHeroSearch from "@/components/home/HomeHeroSearch";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import { getPublicDecks, getUserDeckHistory } from "@/lib/supabase/decks";
import Link from "next/link";

export default async function Home() {
  const userDeckHistory = await getUserDeckHistory();
  const publicDecks = await getPublicDecks(1, 20);

  return (
    <main className="w-full bg-[#0b0f14] pb-16">
      <HomeHeroSearch />

      <ContentContainer>
        <div className="space-y-15 pt-16">
          {/* user decks */}
          {userDeckHistory.length > 0 && (
            <section className="w-full space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">
                  Pick up where you left off
                </h1>
                <Link
                  href={"/decks/personal"}
                  className="text-sm text-violet-500 hover:text-violet-400"
                >
                  View your personal decks
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {userDeckHistory?.map((deck) => (
                  <li key={deck.deck_id}>
                    <DeckCard deck={deck} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* public decks */}
          {publicDecks.items.length > 0 && (
            <section className="w-full space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Latest public decks</h1>
                <Link
                  href={"/decks"}
                  className="text-sm text-violet-500 hover:text-violet-400"
                >
                  View all public decks
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {publicDecks?.items.map((deck) => (
                  <li key={deck.id}>
                    <DeckCard
                      key={deck.id}
                      deck={{
                        id: deck.id!,
                        deck_id: deck.id!,
                        action: "view",
                        access_count: 0,
                        last_accessed_at: deck.updated_at,
                        deck,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </ContentContainer>
    </main>
  );
}
