"use client";

import { useMemo } from "react";
import { DeckWithCards } from "@/lib/supabase/decks";
import DeckCard from "../cards/DeckCard";
import { DeckExplorerFilters } from "@/app/(main)/decks/(explore)/search-params";

type FilterableDeck = DeckWithCards & {
  theme?: string | null;
  themes?: string[] | null;
  commander_bracket?: string | number | null;
  commanderBracket?: string | number | null;
  companion?: {
    name?: string | null;
  } | null;
  partner?: {
    name?: string | null;
  } | null;
  owner?: {
    email?: string | null;
    full_name?: string | null;
    username?: string | null;
  } | null;
  author?: {
    email?: string | null;
    full_name?: string | null;
    username?: string | null;
  } | null;
};

export default function DeckExplorer({
  initialDecks,
  filters,
  emptyMessage = "No decks found.",
}: {
  initialDecks: DeckWithCards[];
  filters: DeckExplorerFilters;
  emptyMessage?: string;
}) {
  const filteredDecks = useMemo(() => {
    const normalizedQuery = filters.q.trim().toLowerCase();
    const normalizedDeckName = filters.deckName.trim().toLowerCase();
    const normalizedFormat = filters.format.trim().toLowerCase();
    const normalizedCommander = filters.commander.trim().toLowerCase();
    const normalizedPartner = filters.partner.trim().toLowerCase();
    const normalizedTheme = filters.theme.trim().toLowerCase();
    const normalizedBoardCard = filters.boardCard.trim().toLowerCase();
    const normalizedCompanion = filters.companion.trim().toLowerCase();
    const normalizedAuthors = filters.authors.trim().toLowerCase();

    const decks = initialDecks.filter((deck) => {
      const filterableDeck = deck as FilterableDeck;
      const deckDescription = deck.description?.toLowerCase() ?? "";
      const commanderName = deck.commander?.name?.toLowerCase() ?? "";
      const partnerName = filterableDeck.partner?.name?.toLowerCase() ?? "";
      const companionName = filterableDeck.companion?.name?.toLowerCase() ?? "";
      const deckThemes = [
        filterableDeck.theme,
        ...(filterableDeck.themes ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const commanderBracket = String(
        filterableDeck.commander_bracket ??
          filterableDeck.commanderBracket ??
          "",
      );
      const authorText = [
        deck.user_id,
        filterableDeck.owner?.email,
        filterableDeck.owner?.full_name,
        filterableDeck.owner?.username,
        filterableDeck.author?.email,
        filterableDeck.author?.full_name,
        filterableDeck.author?.username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        deck.name.toLowerCase().includes(normalizedQuery) ||
        deck.format.toLowerCase().includes(normalizedQuery) ||
        deckDescription.includes(normalizedQuery);

      const matchesDeckName =
        !normalizedDeckName ||
        deck.name.toLowerCase().includes(normalizedDeckName);

      const matchesFormat =
        !normalizedFormat || deck.format.toLowerCase() === normalizedFormat;

      const matchesCommander =
        !normalizedCommander || commanderName.includes(normalizedCommander);

      const matchesPartner =
        !normalizedPartner ||
        partnerName.includes(normalizedPartner) ||
        deck.cards.some(
          (card) =>
            card.section === "commander" &&
            card.card_name.toLowerCase().includes(normalizedPartner),
        );

      const matchesTheme =
        !normalizedTheme ||
        deckThemes.includes(normalizedTheme) ||
        deckDescription.includes(normalizedTheme) ||
        deck.name.toLowerCase().includes(normalizedTheme);

      const matchesBoardCard =
        !normalizedBoardCard ||
        deck.cards.some(
          (card) =>
            card.section === filters.boardSection &&
            card.card_name.toLowerCase().includes(normalizedBoardCard),
        );

      const matchesCompanion =
        !normalizedCompanion ||
        companionName.includes(normalizedCompanion) ||
        deck.cards.some((card) =>
          card.card_name.toLowerCase().includes(normalizedCompanion),
        );

      const matchesCommanderBracket =
        !filters.commanderBracket ||
        compareCommanderBracket(
          commanderBracket,
          filters.commanderBracket,
          filters.commanderBracketCompare,
        );

      const matchesAuthors =
        !normalizedAuthors || authorText.includes(normalizedAuthors);

      return (
        matchesQuery &&
        matchesDeckName &&
        matchesFormat &&
        matchesCommander &&
        matchesPartner &&
        matchesTheme &&
        matchesBoardCard &&
        matchesCompanion &&
        matchesCommanderBracket &&
        matchesAuthors
      );
    });

    return decks.toSorted((a, b) => {
      switch (filters.sort) {
        case "updated-asc":
          return (
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "updated-desc":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });
  }, [filters, initialDecks]);

  return (
    <div className="space-y-8">
      {/* Result Info */}
      <div className="text-sm text-slate-400">
        Showing {filteredDecks.length} results.
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center text-sm text-slate-300">{emptyMessage}</div>
      )}

      {/* Deck Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDecks.map((deck) => (
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
        ))}
      </div>
    </div>
  );
}

function compareCommanderBracket(
  deckBracket: string,
  filterBracket: string,
  comparison: string,
) {
  if (!deckBracket) {
    return false;
  }

  const deckValue = Number(deckBracket);
  const filterValue = Number(filterBracket);

  if (!Number.isFinite(deckValue) || !Number.isFinite(filterValue)) {
    return deckBracket.toLowerCase() === filterBracket.toLowerCase();
  }

  switch (comparison) {
    case "lt":
      return deckValue < filterValue;
    case "gt":
      return deckValue > filterValue;
    case "equals":
    default:
      return deckValue === filterValue;
  }
}
