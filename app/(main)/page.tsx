import DeckCard from "@/components/cards/DeckCard";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import { getUserDeckHistory } from "@/lib/supabase/decks";
import Link from "next/link";

export default async function Home() {
  const userDeckHistory = await getUserDeckHistory();

  return (
    <main className="w-full bg-[#0b0f14] pt-28 pb-16">
      <ContentContainer>
        {/* user decks */}
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
      </ContentContainer>
    </main>
  );
}
