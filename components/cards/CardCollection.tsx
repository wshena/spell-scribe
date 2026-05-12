"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CardProps, ScryfallSetCardsResponse } from "@/lib/scryfall/cards";
import { cn } from "@/lib/utils";
import { fetcher } from "@/utils/fetcher";
import Card from "./Card";
import CardPlaceholder from "./CardPlaceholder";

type RarityTab = "all" | "mythic" | "rare" | "uncommon" | "common";

interface CardCollectionTab {
  key: RarityTab;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface CardCollectionProps {
  initialItems: ScryfallSetCardsResponse;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  showTabs?: boolean;
  showSort?: boolean;
  tabs?: readonly CardCollectionTab[];
  sortOptions?: readonly SortOption[];
  initialSortValue?: string;
  gridClassName?: string;
}

const defaultTabs = [
  { key: "all", label: "All Cards" },
  { key: "mythic", label: "Mythics" },
  { key: "rare", label: "Rares" },
  { key: "uncommon", label: "Uncommons" },
  { key: "common", label: "Commons" },
] as const;

const defaultSortOptions = [
  { value: "name-asc", label: "Name (Asc)" },
  { value: "name-desc", label: "Name (Desc)" },
  { value: "price-asc", label: "Price (Asc)" },
  { value: "price-desc", label: "Price (Desc)" },
  { value: "collector_number-asc", label: "Collector Number (Asc)" },
  { value: "collector_number-desc", label: "Collector Number (Desc)" },
] as const;

function getCardPrice(card: CardProps) {
  return card.prices?.usd ? parseFloat(card.prices.usd) : 0;
}

function getSortValue(
  sortValue: string,
  sortOptions: readonly SortOption[],
  fallback: string,
) {
  return sortOptions.some((option) => option.value === sortValue)
    ? sortValue
    : fallback;
}

function getCollectorNumber(card: CardProps) {
  return parseInt(card.collector_number, 10) || 0;
}

function sortCards(cards: CardProps[], sortValue: string) {
  const [sortBy, sortOrder] = sortValue.split("-") as [string, string];

  return [...cards].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "price") {
      comparison = getCardPrice(a) - getCardPrice(b);
    } else if (sortBy === "collector_number") {
      const numberA = getCollectorNumber(a);
      const numberB = getCollectorNumber(b);

      comparison =
        numberA !== numberB
          ? numberA - numberB
          : a.collector_number.localeCompare(b.collector_number);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

const CardCollection = ({
  initialItems,
  emptyMessage = "No cards found.",
  emptyFilterMessage = "No cards found for this filter.",
  showTabs = true,
  showSort = true,
  tabs = defaultTabs,
  sortOptions = defaultSortOptions,
  initialSortValue = "name-asc",
  gridClassName,
}: CardCollectionProps) => {
  const normalizedInitialSortValue = getSortValue(
    initialSortValue,
    sortOptions,
    sortOptions[0]?.value ?? "name-asc",
  );
  const [cards, setCards] = useState<CardProps[]>(initialItems.data);
  const [hasMore, setHasMore] = useState(initialItems.has_more);
  const [nextPage, setNextPage] = useState<string | undefined>(
    initialItems.next_page,
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<RarityTab>("all");
  const [sortValue, setSortValue] = useState(normalizedInitialSortValue);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextPage) return;

    setLoading(true);
    try {
      const response = await fetcher<ScryfallSetCardsResponse>(nextPage);
      setCards((prev) => [...prev, ...response.data]);
      setHasMore(response.has_more);
      setNextPage(response.next_page);
    } catch (error) {
      console.error("Error loading more cards:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    const observerElement = observerRef.current;
    if (observerElement) {
      observer.observe(observerElement);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const filteredCards =
    showTabs && activeTab !== "all"
      ? cards.filter((card) => card.rarity === activeTab)
      : cards;
  const visibleCards = showSort ? sortCards(filteredCards, sortValue) : filteredCards;

  if (initialItems.data.length === 0) {
    return (
      <section className="flex w-full items-center justify-center">
        <p>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="w-full">
      {(showTabs || showSort) && (
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          {showTabs && (
            <div className="mb-4 grid grid-cols-3 gap-3 md:flex md:space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "cursor-pointer rounded px-2 py-1 text-sm font-medium",
                    activeTab === tab.key
                      ? "bg-gray-600 text-white"
                      : "text-gray-200",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {showSort && (
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                value={sortValue}
                onChange={(event) => setSortValue(event.target.value)}
                className="cursor-pointer rounded bg-gray-700 px-3 py-2 text-sm text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="mt-10 flex w-full items-center justify-center">
          <p>{emptyFilterMessage}</p>
        </div>
      )}

      <ul
        className={cn(
          "mt-5 flex flex-col items-center gap-3 md:grid md:grid-cols-5 md:items-start",
          gridClassName,
        )}
      >
        {visibleCards.map((card) => (
          <li key={card.id}>
            <Card data={card} />
          </li>
        ))}

        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <li key={`loading-${index}`}>
              <CardPlaceholder />
            </li>
          ))}
      </ul>

      <div ref={observerRef} className="h-10" />
    </section>
  );
};

export default CardCollection;
