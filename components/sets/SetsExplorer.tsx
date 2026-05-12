"use client";

import type {
  ScryfallSet,
  SetFilters,
  SetTypeOption,
  SetsPageResult,
} from "@/lib/scryfall/sets";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUtilityStore } from "@/lib/zustand/utilityStore";
import CardsSearchTipsModal from "../ui/modal/CardsSearchTipsModal";
import Image from "next/image";
import GlobalSearchForm from "../ui/search/GlobalSearchForm";

interface SetsExplorerProps {
  initialItems: ScryfallSet[];
  initialHasMore: boolean;
  initialTotalCount: number;
  initialFilters: SetFilters;
  setTypeOptions: SetTypeOption[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function SetsExplorer({
  initialItems,
  initialHasMore,
  initialFilters,
  setTypeOptions,
}: SetsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openModal = useUtilityStore((state) => state.openModal);
  const [isRouting, startRouting] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialFilters.page);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [searchInput, setSearchInput] = useState(initialFilters.q);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initialItems);
    setPage(initialFilters.page);
    setHasMore(initialHasMore);
    setIsLoadingMore(false);
    setLoadMoreError("");
    setSearchInput(initialFilters.q);
  }, [initialFilters.page, initialFilters.q, initialHasMore, initialItems]);

  const queryStringWithoutPage = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    return params.toString();
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | boolean | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const normalizedValue =
          typeof value === "boolean" ? String(value) : value?.trim();

        if (!normalizedValue || normalizedValue === "all") {
          params.delete(key);
          return;
        }

        params.set(key, normalizedValue);
      });

      params.delete("page");

      startRouting(() => {
        router.replace(
          params.toString() ? `${pathname}?${params.toString()}` : pathname,
          {
            scroll: false,
          },
        );
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore || isLoadingMore || isRouting) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        setIsLoadingMore(true);
        setLoadMoreError("");

        const params = new URLSearchParams(queryStringWithoutPage);
        params.set("page", String(page + 1));

        fetch(`/api/sets?${params.toString()}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("Failed to load more sets");
            }

            return (await response.json()) as SetsPageResult;
          })
          .then((result) => {
            setItems((currentItems) => {
              const existingIds = new Set(currentItems.map((item) => item.id));
              const nextItems = result.items.filter(
                (item) => !existingIds.has(item.id),
              );
              return [...currentItems, ...nextItems];
            });
            setPage(result.page);
            setHasMore(result.hasMore);
          })
          .catch(() => {
            setLoadMoreError("Unable to load more sets right now.");
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isRouting, page, queryStringWithoutPage]);

  const handleClearResult = () => {
    setSearchInput("");
    updateQueryParams({ q: undefined, setType: undefined });
  };

  return (
    <section className="space-y-6">
      <div className="text-white">
        <GlobalSearchForm
          searchValue={searchInput}
          onSearchValueChange={setSearchInput}
          placeholder="Search set name, code, or type"
          searchLabel="Search sets"
          selectValue={initialFilters.setType}
          selectOptions={setTypeOptions}
          selectLabel="Filter by set type"
          onSelectChange={(value) =>
            updateQueryParams({
              setType: value,
              q: searchInput,
            })
          }
          onSubmit={(event) => {
            event.preventDefault();
            updateQueryParams({
              q: searchInput,
              setType: initialFilters.setType,
            });
          }}
          showTips
          onTipsClick={() =>
            openModal(<CardsSearchTipsModal />, {
              contentClassName: "w-full max-w-2xl",
            })
          }
          advancedSearchType="sets"
          onClearResult={handleClearResult}
          isLoading={isRouting}
        />
      </div>
      {/* search form */}

      <div className="overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="text-left text-xs capitalize text-slate-400">
              <tr>
                <th className="py-4">Set name</th>
                <th className=" py-4 text-right">Code</th>
                <th className=" py-4 text-right hidden md:table-cell">Cards</th>
                <th className=" py-4 text-right hidden md:table-cell">
                  Release date
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((set) => (
                <tr key={set.id} className="border-t border-white/8">
                  <td className="py-4">
                    <Link
                      href={`/sets/${set.code}`}
                      className="flex items-center gap-3 text-violet-200 hover:text-violet-100 hover:underline"
                    >
                      {set.icon_svg_uri ? (
                        <Image
                          src={set.icon_svg_uri}
                          alt=""
                          width={24}
                          height={24}
                          loading="lazy"
                          className="h-6 w-6 rounded-sm bg-white/90 p-0.5"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-sm bg-white/10" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{set.name}</p>
                        {set.digital && (
                          <p className="text-xs text-cyan-300">Digital</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 text-right uppercase text-slate-200">
                    {set.code}
                  </td>
                  <td className="py-4 text-right text-slate-300 hidden md:table-cell">
                    {set.card_count}
                  </td>
                  <td className="py-4 text-right text-slate-300 hidden md:table-cell">
                    {set.released_at
                      ? dateFormatter.format(new Date(set.released_at))
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!items.length && (
          <div className="px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">No sets found</h2>
            <p className="mt-3 text-sm text-slate-400">
              Try changing the keywords, set type, or advanced search filters.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-white/8 px-6 py-6">
            <div ref={sentinelRef} />
            {isLoadingMore && (
              <p className="text-sm text-slate-400">Loading more sets...</p>
            )}
            {!isLoadingMore && hasMore && (
              <p className="text-sm text-slate-500">
                Keep scrolling for the next result
              </p>
            )}
            {loadMoreError && (
              <p className="text-sm text-rose-300">{loadMoreError}</p>
            )}
            {!hasMore && (
              <p className="text-sm text-slate-500">
                All results have been displayed.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
