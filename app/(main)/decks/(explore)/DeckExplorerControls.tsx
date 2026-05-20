"use client";

import { formatDecks } from "@/lib/constants";
import { CancelIcon, FilterIcon, SearchIcon } from "@/components/icons/Icons";
import ModalContainer from "@/components/ui/containers/ModalContainer";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

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
    label: "Liked Decks",
    href: "/decks/liked",
  },
];

const sortOptions = [
  {
    label: "Newest Updated",
    value: "updated-desc",
  },
  {
    label: "Oldest Updated",
    value: "updated-asc",
  },
  {
    label: "Name A-Z",
    value: "name-asc",
  },
  {
    label: "Name Z-A",
    value: "name-desc",
  },
];

const themeOptions = [
  "Aggro",
  "Aristocrats",
  "Combo",
  "Control",
  "Lifegain",
  "Midrange",
  "Ramp",
  "Reanimator",
  "Spellslinger",
  "Tokens",
  "Voltron",
];

const boardSectionOptions = [
  {
    label: "Main Deck",
    value: "main",
  },
  {
    label: "Sideboard",
    value: "sideboard",
  },
  {
    label: "Commander",
    value: "commander",
  },
  {
    label: "Maybeboard",
    value: "maybeboard",
  },
];

const commanderBracketOptions = [
  {
    label: "Any Bracket",
    value: "",
  },
  {
    label: "Bracket 1",
    value: "1",
  },
  {
    label: "Bracket 2",
    value: "2",
  },
  {
    label: "Bracket 3",
    value: "3",
  },
  {
    label: "Bracket 4",
    value: "4",
  },
  {
    label: "Bracket 5",
    value: "5",
  },
];

const commanderBracketCompareOptions = [
  {
    label: "Equals",
    value: "equals",
  },
  {
    label: "Less Than",
    value: "lt",
  },
  {
    label: "Greater Than",
    value: "gt",
  },
];

type FilterFormValues = {
  deckName: string;
  format: string;
  commander: string;
  partner: string;
  theme: string;
  boardCard: string;
  boardSection: string;
  companion: string;
  commanderBracketCompare: string;
  commanderBracket: string;
  authors: string;
};

const filterParamKeys = [
  "deckName",
  "format",
  "commander",
  "partner",
  "theme",
  "boardCard",
  "boardSection",
  "companion",
  "commanderBracketCompare",
  "commanderBracket",
  "authors",
] as const;

export default function DeckExplorerControls() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeQuery = searchParams.get("q") ?? "";
  const activeSort = searchParams.get("sort") ?? "updated-desc";
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formatOptions = useMemo(
    () => Array.from(new Set(formatDecks.map((format) => format.name))).sort(),
    [],
  );

  const activeFilters = getFilterValues(searchParams);
  const activeFilterCount = getActiveFilterCount(activeFilters);

  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      const normalizedValue = value?.trim();

      if (!normalizedValue || normalizedValue === "all") {
        params.delete(key);
        return;
      }

      params.set(key, normalizedValue);
    });

    startTransition(() => {
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false },
      );
    });
  };

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <DeckSearchForm
          key={`${pathname}:${activeQuery}`}
          initialQuery={activeQuery}
          isPending={isPending}
          onSearch={(query) => updateQueryParams({ q: query })}
          onClear={() => updateQueryParams({ q: undefined })}
        />

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="cursor-pointer flex h-11 items-center justify-center gap-2 rounded-lg border border-violet-500/40 px-5 text-sm text-violet-200 transition hover:bg-violet-500/10"
        >
          <FilterIcon size={13} color="currentColor" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <label className="sr-only" htmlFor="deck-sort">
          Sort decks
        </label>
        <select
          id="deck-sort"
          value={activeSort}
          onChange={(event) => updateQueryParams({ sort: event.target.value })}
          className="h-11 rounded-lg border border-violet-500/40 bg-[#121820] px-4 text-sm text-violet-200 outline-none transition hover:bg-violet-500/10 focus:border-violet-300"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-violet-500 bg-[#121820]"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <DeckFilterModal
        key={`${pathname}:${searchParams.toString()}`}
        isOpen={isFilterOpen}
        initialValues={activeFilters}
        formatOptions={formatOptions}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          updateQueryParams(
            Object.fromEntries(filterParamKeys.map((key) => [key, undefined])),
          );
          setIsFilterOpen(false);
        }}
        onSave={(values) => {
          updateQueryParams(values);
          setIsFilterOpen(false);
        }}
      />
    </div>
  );
}

function getFilterValues(searchParams: URLSearchParams): FilterFormValues {
  return {
    deckName: searchParams.get("deckName") ?? "",
    format: searchParams.get("format") ?? "",
    commander: searchParams.get("commander") ?? "",
    partner: searchParams.get("partner") ?? "",
    theme: searchParams.get("theme") ?? "",
    boardCard: searchParams.get("boardCard") ?? "",
    boardSection: searchParams.get("boardSection") ?? "main",
    companion: searchParams.get("companion") ?? "",
    commanderBracketCompare:
      searchParams.get("commanderBracketCompare") ?? "equals",
    commanderBracket: searchParams.get("commanderBracket") ?? "",
    authors: searchParams.get("authors") ?? "",
  };
}

function getActiveFilterCount(values: FilterFormValues) {
  return [
    values.deckName,
    values.format,
    values.commander,
    values.partner,
    values.theme,
    values.boardCard,
    values.companion,
    values.commanderBracket,
    values.authors,
  ].filter(Boolean).length;
}

function DeckSearchForm({
  initialQuery,
  isPending,
  onSearch,
  onClear,
}: {
  initialQuery: string;
  isPending: boolean;
  onSearch: (query: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    onClear();
  };

  return (
    <form className="flex w-full items-center gap-0" onSubmit={handleSearch}>
      <div className="relative min-w-0 flex-1">
        <label htmlFor="deck-search" className="sr-only">
          Search Decks
        </label>
        <input
          id="deck-search"
          type="text"
          placeholder="Search decks..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 w-full rounded-l-sm bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white"
            aria-label="Clear search"
          >
            <CancelIcon size={15} color="white" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="h-11 cursor-pointer rounded-r-md bg-violet-500 px-4 disabled:cursor-wait disabled:opacity-70"
        aria-label="Search decks"
        disabled={isPending}
      >
        <SearchIcon size={15} color="white" />
      </button>
    </form>
  );
}

function DeckFilterModal({
  isOpen,
  initialValues,
  formatOptions,
  onClose,
  onReset,
  onSave,
}: {
  isOpen: boolean;
  initialValues: FilterFormValues;
  formatOptions: string[];
  onClose: () => void;
  onReset: () => void;
  onSave: (values: FilterFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);

  const updateValue = (key: keyof FilterFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(values);
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="w-[min(100vw-2rem,31rem)]"
      overlayClassName="bg-black/70"
    >
      <div
        className="max-h-[calc(100vh-2rem)] w-full overflow-auto rounded-md border border-white/10 bg-[#222222] text-slate-200 shadow-2xl shadow-black/50 [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-slate-800
        [&::-webkit-scrollbar-thumb]:bg-slate-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-500"
      >
        <div className="p-6 flex items-start justify-between gap-4 mb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            More Filters
          </p>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white shrink-0"
          >
            <CancelIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="">
          <div className="max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto px-6 py-6">
            <FilterTextRow
              label="Deck Name"
              value={values.deckName}
              onChange={(value) => updateValue("deckName", value)}
            />

            <FilterSelectRow
              label="Format"
              value={values.format}
              onChange={(value) => updateValue("format", value)}
              options={formatOptions.map((format) => ({
                label: format,
                value: format,
              }))}
              placeholder="All Formats"
            />

            <FilterTextRow
              label="Commander"
              value={values.commander}
              onChange={(value) => updateValue("commander", value)}
              showSearchIcon
            />

            <FilterTextRow
              label="Partner"
              value={values.partner}
              onChange={(value) => updateValue("partner", value)}
              showSearchIcon
            />

            <FilterSelectRow
              label="Theme"
              value={values.theme}
              onChange={(value) => updateValue("theme", value)}
              options={themeOptions.map((theme) => ({
                label: theme,
                value: theme,
              }))}
              placeholder="All Themes"
            />

            <FilterBoardRow
              value={values.boardCard}
              section={values.boardSection}
              onValueChange={(value) => updateValue("boardCard", value)}
              onSectionChange={(value) => updateValue("boardSection", value)}
            />

            <FilterTextRow
              label="Companion"
              value={values.companion}
              onChange={(value) => updateValue("companion", value)}
              showSearchIcon
            />

            <FilterBracketRow
              compare={values.commanderBracketCompare}
              bracket={values.commanderBracket}
              onCompareChange={(value) =>
                updateValue("commanderBracketCompare", value)
              }
              onBracketChange={(value) =>
                updateValue("commanderBracket", value)
              }
            />

            <FilterTextRow
              label="Author(s)"
              value={values.authors}
              onChange={(value) => updateValue("authors", value)}
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={onReset}
              className="rounded-md bg-slate-400/70 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-400"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Save Filters
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
}

function FilterTextRow({
  label,
  value,
  onChange,
  showSearchIcon = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showSearchIcon?: boolean;
}) {
  return (
    <label className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr] sm:items-center">
      <span>{label}</span>
      <span className="relative block">
        {showSearchIcon && (
          <SearchIcon
            size={14}
            color="currentColor"
            style="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-9 w-full rounded-md border border-black bg-[#111111] text-sm text-slate-200 outline-none transition focus:border-violet-500 ${
            showSearchIcon ? "px-9" : "px-3"
          }`}
        />
      </span>
    </label>
  );
}

function FilterSelectRow({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
}) {
  return (
    <label className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr] sm:items-center">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-black bg-[#111111] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBoardRow({
  value,
  section,
  onValueChange,
  onSectionChange,
}: {
  value: string;
  section: string;
  onValueChange: (value: string) => void;
  onSectionChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr] sm:items-center">
      <span>Card in Board</span>
      <div className="grid grid-cols-[minmax(0,1fr)_7.75rem] gap-2">
        <span className="relative block">
          <SearchIcon
            size={14}
            color="currentColor"
            style="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            className="h-9 w-full rounded-md border border-black bg-[#111111] px-9 text-sm text-slate-200 outline-none transition focus:border-violet-500"
          />
        </span>
        <select
          value={section}
          onChange={(event) => onSectionChange(event.target.value)}
          className="h-9 w-full rounded-md border border-black bg-[#111111] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
        >
          {boardSectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FilterBracketRow({
  compare,
  bracket,
  onCompareChange,
  onBracketChange,
}: {
  compare: string;
  bracket: string;
  onCompareChange: (value: string) => void;
  onBracketChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr] sm:items-center">
      <span className="flex items-center gap-2">
        Commander Bracket
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold text-[#222222]">
          i
        </span>
      </span>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={compare}
          onChange={(event) => onCompareChange(event.target.value)}
          className="h-9 w-full rounded-md border border-black bg-[#111111] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
        >
          {commanderBracketCompareOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={bracket}
          onChange={(event) => onBracketChange(event.target.value)}
          className="h-9 w-full rounded-md border border-black bg-[#111111] px-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
        >
          {commanderBracketOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
