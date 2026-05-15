"use client";

import { useMemo, useState } from "react";
import { DeckWithCards } from "@/lib/supabase/decks";
import { SearchIcon } from "../icons/Icons";
import DeckCard from "../cards/DeckCard";

const tabs = [
  {
    label: "All Decks",
    href: "/decks",
  },
  {
    label: "Your Decks",
    href: "/decks/me",
  },
  {
    label: "People You Follow",
    href: "/decks/following",
  },
  {
    label: "Decks You ❤️",
    href: "/decks/liked",
  },
];

export default function DeckExplorer({
  initialDecks,
}: {
  initialDecks: DeckWithCards[];
}) {
  const [query, setQuery] = useState("");

  const filteredDecks = useMemo(() => {
    if (!query.trim()) return initialDecks;

    return initialDecks.filter((deck) => {
      const q = query.toLowerCase();

      return (
        deck.name.toLowerCase().includes(q) ||
        deck.format.toLowerCase().includes(q) ||
        deck.description?.toLowerCase().includes(q)
      );
    });
  }, [initialDecks, query]);

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab, index) => (
            <a
              key={index}
              href={tab.href}
              className={`rounded-full px-5 py-2 text-sm transition ${
                index === 0
                  ? "bg-white/20 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search decks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full sm:w-80 rounded-lg border border-violet-500/40 bg-[#0f1319] pl-4 pr-11 text-sm text-white outline-none transition focus:border-violet-400"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-300">
              <SearchIcon size={18} />
            </div>
          </div>

          {/* Filter Button */}
          <button className="h-11 rounded-lg border border-violet-500/40 px-5 text-sm text-violet-200 transition hover:bg-violet-500/10">
            More Filters
          </button>

          {/* Sort Button */}
          <button className="h-11 rounded-lg border border-violet-500/40 px-5 text-sm text-violet-200 transition hover:bg-violet-500/10">
            Sort
          </button>
        </div>
      </div>

      {/* Result Info */}
      <div className="text-sm text-slate-400">
        Showing {filteredDecks.length} results.
      </div>

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
