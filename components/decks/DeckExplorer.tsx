"use client";

import { useMemo, useState } from "react";
import { DeckWithCards } from "@/lib/supabase/decks";
import { CancelIcon, SearchIcon } from "../icons/Icons";
import DeckCard from "../cards/DeckCard";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

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
  const pathname = usePathname();

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
            <Link
              key={index}
              href={tab.href}
              className={`rounded-full px-5 py-2 text-sm transition ${
                tab.href === pathname.toLowerCase()
                  ? "bg-white/20 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="flex w-full items-center gap-0 lg:w-[50%]">
            <div className="relative">
              <span className="sr-only">Search Decks</span>
              <input
                type="text"
                placeholder="Search decks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-l-sm bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white"
                  aria-label="Clear search"
                >
                  <CancelIcon size={15} color="white" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="cursor-pointer rounded-r-md bg-violet-500 p-3"
            >
              <SearchIcon size={15} color="white" />
            </button>
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
