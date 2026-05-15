import CardSearchForm from "@/components/cards/CardSearchForm";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import Wishlist from "@/components/wishlist/Wishlist";
import { getWishlist } from "@/lib/supabase/wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Your Magic The Gathering Wishlist | SpellScribe - MTG Deck Building Tool",
  description:
    "Browse and explore all Magic: The Gathering sets. Discover cards, build powerful decks with SpellScribe.",
  keywords: [
    "MTG sets",
    "Magic sets",
    "Magic: The Gathering sets",
    "MTG cards",
    "deck building",
  ],
  openGraph: {
    title: "Your Magic The Gathering Wishlist",
    description: "Browse and explore all Magic: The Gathering sets.",
    type: "website",
  },
};

interface Props {
  searchParams: Promise<{
    q?: string;
    order?: string;
    dir?: string;
    page?: string;
  }>;
}

export default async function WishlistPage({ searchParams }: Props) {
  const userWishlist = await getWishlist(1, 20);

  const {
    q = "",
    order = "name",
    dir = "asc",
    page = "1",
  } = await searchParams;

  const visibleSearchQuery = q.match(/^name:"([^"]*)"$/)?.[1] ?? q;

  return (
    <main className="w-full pt-28 pb-16 bg-[#121820]">
      {/* banner */}
      <ContentContainer>
        <section className="w-full text-white mb-10">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
            Wishlist
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Future pickups</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Keep an eye on upgrades, sideboard ideas, and the next cards you
            want to chase down.
          </p>

          <div className="w-full mt-7">
            <CardSearchForm
              context={{ type: "sets" }}
              initialQuery={visibleSearchQuery}
              placeholder="Search card name for this deck"
            />
          </div>
        </section>

        {/* user wishlist */}
        <Wishlist
          initialItems={userWishlist.items}
          initialHasMore={userWishlist.hasMore}
          initialTotal={userWishlist.total}
        />
      </ContentContainer>
    </main>
  );
}
