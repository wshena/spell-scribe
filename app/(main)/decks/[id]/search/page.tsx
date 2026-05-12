import CardCollection from "@/components/cards/CardCollection";
import CardSearchForm from "@/components/cards/CardSearchForm";
import { AngleLeftIcon } from "@/components/icons/Icons";
import ContentContainer from "@/components/ui/containers/ContentContainer";
import { fetchAdvancedSearchServer } from "@/lib/scryfall/advanceSearch";
import { CardProps } from "@/lib/scryfall/cards";
import { DeckCard, getDeck } from "@/lib/supabase/decks";
import { formatRelativeTime } from "@/lib/utils/deckUtils";
import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    q?: string;
    order?: string;
    dir?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: id } = await params;

  try {
    const deckDetails = await getDeck(id);
    return {
      title: `${deckDetails?.name} | SpellScribe - MTG Deck Builder`,
      description: `Explore the ${deckDetails?.name} deck. Browse cards, build powerful decks with SpellScribe.`,
      keywords: [
        `${deckDetails?.name}`,
        "MTG deck",
        "Magic: The Gathering",
        "deck building",
        "card collection",
      ],
      openGraph: {
        title: `${deckDetails?.name} | SpellScribe`,
        description: `Explore the ${deckDetails?.name} deck`,
        type: "website",
      },
    };
  } catch {
    return {
      title: "Deck Not Found | SpellScribe",
      description: "This MTG deck could not be found.",
    };
  }
}

export default async function DeckSearchPage({ params, searchParams }: Props) {
  const { id } = await params;

  const deck = await getDeck(id);
  const totalCards =
    (deck && deck?.cards.reduce((sum, card) => sum + card.quantity, 0)) || 0;

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

  function getImageArtCrop(
    card?: Pick<DeckCard, "image_uris" | "card_faces"> | CardProps | null,
  ) {
    return (
      card?.image_uris?.art_crop ||
      card?.card_faces?.[0]?.image_uris?.art_crop ||
      null
    );
  }

  const artCropImage =
    getImageArtCrop(deck?.cards[0]) || getImageArtCrop(deck?.commander);

  const visibleSearchQuery = q.match(/^name:"([^"]*)"$/)?.[1] ?? q;

  return (
    <main className="min-h-screen bg-[#0b0f14] pb-16 pt-24">
      {/* banner */}
      <section className="relative overflow-hidden bg-[#10161f]">
        <div className="absolute inset-0">
          {artCropImage ? (
            <>
              {/* Art crop di kanan */}
              <div
                className="absolute inset-0 bg-cover bg-right bg-no-repeat"
                style={{ backgroundImage: `url(${artCropImage})` }}
              />
              {/* Gradient: solid ungu di kiri, fade ke transparan di kanan */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4a148c_30%,rgba(74,20,140,0.85)_55%,transparent_100%)]" />
              {/* Overlay tipis supaya teks tetap terbaca */}
              <div className="absolute inset-0 bg-[#4a148c]/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-950" />
          )}
        </div>

        <div className="relative z-10">
          <ContentContainer>
            <div className="py-15">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight text-white lg:text-5xl">
                    {deck?.name}
                  </h1>
                  {deck?.description && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                      {deck?.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <span>{deck?.format}</span>
                  <span className="text-slate-600">/</span>
                  <span>{deck?.visibility}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>{totalCards} cards</span>
                  {deck?.updated_at && (
                    <span>Updated {formatRelativeTime(deck?.updated_at)}</span>
                  )}
                  {deck?.commander && (
                    <span>Commander: {deck?.commander.name}</span>
                  )}
                </div>

                <Link href={`/deck/${id}`}>
                  <div className="p-2 w-fit flex items-center gap-3 rounded-sm text-white bg-violet-500 capitalize">
                    <AngleLeftIcon size={15} color="white" />
                    <span>back to deck</span>
                  </div>
                </Link>
              </div>
            </div>
          </ContentContainer>
        </div>
      </section>
      {/* banner */}

      <ContentContainer>
        <div className="mb-6 text-white">
          <CardSearchForm
            context={{ type: "deck", deckId: id }}
            initialQuery={visibleSearchQuery}
            placeholder="Search card name for this deck"
          />
        </div>

        <p className="mb-10 text-sm md:text-md text-gray-500">
          Search for <span>{q || "all cards"}</span> returned{" "}
          {result.total_cards} cards found
        </p>

        <CardCollection
          key={`${q}-${order}-${dir}-${page}`}
          initialItems={result}
          emptyMessage="No cards found for this search."
          showTabs={false}
          showSort={false}
          initialSortValue={`${order}-${dir}`}
        />
      </ContentContainer>
    </main>
  );
}
