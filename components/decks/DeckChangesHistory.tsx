"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils/deckUtils";
import type { DeckChange } from "@/lib/supabase/deckChanges";

interface DeckChangesHistoryProps {
  deckId: string;
  /** Max items shown in collapsed mode */
  previewCount?: number;
}

const ACTION_CONFIG: Record<
  string,
  { label: (change: DeckChange) => string; delta: string | null; color: string }
> = {
  card_added: {
    label: (c) => c.card_name ?? "Unknown card",
    delta: null, // uses quantity_delta
    color: "bg-emerald-600",
  },
  card_removed: {
    label: (c) => c.card_name ?? "Unknown card",
    delta: null,
    color: "bg-rose-600",
  },
  card_quantity_changed: {
    label: (c) => c.card_name ?? "Unknown card",
    delta: null,
    color: "bg-sky-600",
  },
  commander_changed: {
    label: (c) => c.new_value ?? "Unknown",
    delta: "★",
    color: "bg-yellow-600",
  },
  visibility_changed: {
    label: (c) => `Visibility → ${c.new_value}`,
    delta: "⚙",
    color: "bg-slate-500",
  },
  deck_renamed: {
    label: (c) => `Renamed → ${c.new_value}`,
    delta: "✎",
    color: "bg-violet-600",
  },
};

function getDeltaLabel(change: DeckChange): string {
  const config = ACTION_CONFIG[change.action];
  if (!config) return "?";
  if (config.delta !== null) return config.delta;

  // Card-based actions — use quantity_delta
  const delta = change.quantity_delta ?? 1;
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function getDeltaColor(change: DeckChange): string {
  return ACTION_CONFIG[change.action]?.color ?? "bg-slate-600";
}

function getChangeLabel(change: DeckChange): string {
  return ACTION_CONFIG[change.action]?.label(change) ?? change.action;
}

export default function DeckChangesHistory({
  deckId,
  previewCount = 5,
}: DeckChangesHistoryProps) {
  const [changes, setChanges] = useState<DeckChange[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 10;

  const fetchChanges = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await fetch(
          `/api/decks/${deckId}/changes?page=${pageNum}&pageSize=${PAGE_SIZE}`,
        );
        if (!res.ok) return;

        const data: { items: DeckChange[]; hasMore: boolean; total: number } =
          await res.json();

        setChanges((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch {
        // silent
      }
    },
    [deckId],
  );

  useEffect(() => {
    setIsLoading(true);
    fetchChanges(1).finally(() => setIsLoading(false));
  }, [fetchChanges]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchChanges(nextPage, true);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 rounded bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!changes.length) {
    return <p className="text-sm text-slate-500">No changes recorded yet.</p>;
  }

  const displayed = isExpanded ? changes : changes.slice(0, previewCount);

  // Split into two columns
  const mid = Math.ceil(displayed.length / 2);
  const leftCol = displayed.slice(0, mid);
  const rightCol = displayed.slice(mid);

  const ChangeRow = ({ change }: { change: DeckChange }) => (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex h-7 min-w-8 items-center justify-center rounded px-1.5 text-xs font-bold text-white ${getDeltaColor(change)}`}
      >
        {getDeltaLabel(change)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{getChangeLabel(change)}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-500">
        {formatRelativeTime(change.created_at)}
      </span>
    </div>
  );

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Recent History</h2>
          <span className="text-slate-500">–</span>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="cursor-pointer text-sm text-violet-400 hover:text-violet-300 transition"
          >
            {isExpanded ? "Collapse" : `Expand (${total})`}
          </button>
        </div>
        {total > previewCount && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer text-sm text-violet-400 hover:text-violet-300 transition"
          >
            View full history
          </button>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
        <div className="space-y-3">
          {leftCol.map((change) => (
            <ChangeRow key={change.id} change={change} />
          ))}
        </div>
        <div className="space-y-3">
          {rightCol.map((change) => (
            <ChangeRow key={change.id} change={change} />
          ))}
        </div>
      </div>

      {/* Load more */}
      {isExpanded && hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="cursor-pointer text-sm text-violet-400 hover:text-violet-300 transition disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}
