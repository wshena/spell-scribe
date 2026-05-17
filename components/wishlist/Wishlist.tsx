"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Card from "@/components/cards/Card";
import type { WishlistItem } from "@/lib/supabase/wishlist";
import type { CardProps } from "@/lib/scryfall/cards";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

interface WishlistExplorerProps {
  initialItems: WishlistItem[];
  initialHasMore: boolean;
  initialTotal: number;
}

function WishlistCardSkeleton() {
  return (
    <div className="w-full aspect-200/280 rounded-md bg-white/5 animate-pulse" />
  );
}

export default function Wishlist({
  initialItems,
  initialHasMore,
  initialTotal,
}: WishlistExplorerProps) {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync if server re-renders with new props (e.g. after revalidation)
  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
    setTotal(initialTotal);
    setPage(1);
  }, [initialItems, initialHasMore, initialTotal]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        setIsLoadingMore(true);
        setLoadMoreError("");

        fetch(`/api/wishlist?page=${page + 1}&pageSize=${PAGE_SIZE}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to load more");
            return res.json() as Promise<{
              items: WishlistItem[];
              hasMore: boolean;
              total: number;
            }>;
          })
          .then((data) => {
            setItems((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const next = data.items.filter((i) => !existingIds.has(i.id));
              return [...prev, ...next];
            });
            setPage((p) => p + 1);
            setHasMore(data.hasMore);
            setTotal(data.total);
          })
          .catch(() => setLoadMoreError("Unable to load more cards right now."))
          .finally(() => setIsLoadingMore(false));
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, page]);

  const handleWishlistChange = useCallback(() => {
    // Reset ke halaman 1 dan re-fetch
    fetch(`/api/wishlist?page=1&pageSize=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(1);
      })
      .catch(console.error);

    // Refresh Server Component cache agar tetap sinkron
    router.refresh();
  }, [router]);

  if (!items.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-xl font-semibold text-white">
          Your wishlist is empty
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Browse cards and add them to your wishlist.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Wishlist</h1>
        <p className="text-sm text-slate-400">
          {total} card{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {items.map((item) => (
          <Card
            key={item.id}
            data={item.card_data as CardProps}
            onWishlistChange={handleWishlistChange}
          />
        ))}
      </div>

      {/* Sentinel + footer */}
      <div className="py-4">
        <div ref={sentinelRef} />
        {isLoadingMore && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <WishlistCardSkeleton key={i} />
            ))}
          </div>
        )}
        {loadMoreError && (
          <p className="text-center text-sm text-rose-300">{loadMoreError}</p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            All {total} cards displayed.
          </p>
        )}
      </div>
    </section>
  );
}
