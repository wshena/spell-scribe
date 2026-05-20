"use client";

import { SearchIcon } from "@/components/icons/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

type SearchTarget = "decks" | "cards" | "brewers";

const searchTargets: Array<{
  label: string;
  value: SearchTarget;
  placeholder: string;
  path?: string;
}> = [
  {
    label: "Decks",
    value: "decks",
    placeholder: "Search decks",
    path: "/decks",
  },
  {
    label: "Cards",
    value: "cards",
    placeholder: "Search cards",
    path: "/sets",
  },
  {
    label: "Brewers",
    value: "brewers",
    placeholder: "Brewer search is coming soon",
  },
];

export default function HomeHeroSearch() {
  const router = useRouter();
  const [activeTarget, setActiveTarget] = useState<SearchTarget>("decks");
  const [query, setQuery] = useState("");
  const [isRouting, startRouting] = useTransition();

  const activeSearchTarget = useMemo(
    () =>
      searchTargets.find((target) => target.value === activeTarget) ??
      searchTargets[0],
    [activeTarget],
  );

  const advancedHref = activeSearchTarget.path;
  const isBrewers = activeTarget === "brewers";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const targetPath = activeSearchTarget.path;

    if (!targetPath) {
      return;
    }

    const params = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    }

    startRouting(() => {
      router.push(
        params.toString() ? `${targetPath}?${params.toString()}` : targetPath,
      );
    });
  };

  return (
    <section className="relative min-h-148 w-full overflow-hidden bg-[#20152f]">
      <div className="absolute inset-0 bg-[url('/image/hero-bg-new.jpg')] bg-cover bg-center opacity-90" />
      <div className="absolute inset-0 bg-violet-950/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.15),rgba(11,15,20,0.48)_68%)]" />

      <div className="relative z-10 mx-auto flex min-h-148 w-full max-w-4xl flex-col items-center justify-center px-4 pt-24 text-center text-white">
        <h1 className="text-5xl font-semibold tracking-[0.22em] sm:text-6xl md:text-7xl">
          SPELLSCRIBE
        </h1>
        <p className="mt-3 text-sm text-slate-100 sm:text-base">
          A modern deck builder for Magic: The Gathering
        </p>

        <div className="mt-8 w-full max-w-md">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-slate-100">Search:</span>
            <div className="flex rounded-full bg-black/25 p-0.5 shadow-inner shadow-black/30 ring-1 ring-white/10">
              {searchTargets.map((target) => (
                <button
                  key={target.value}
                  type="button"
                  onClick={() => setActiveTarget(target.value)}
                  className={`h-7 rounded-full px-4 text-sm transition ${
                    activeTarget === target.value
                      ? "bg-violet-500/55 text-white ring-1 ring-white/70"
                      : "text-slate-100 hover:bg-white/10"
                  }`}
                >
                  {target.label}
                </button>
              ))}
            </div>

            {advancedHref ? (
              <Link
                href={advancedHref}
                className="text-violet-200 transition hover:text-white"
              >
                Advanced →
              </Link>
            ) : (
              <span className="cursor-not-allowed text-violet-200/50">
                Advanced →
              </span>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex h-11 items-center overflow-hidden rounded-lg border border-violet-300/80 bg-[#0b0b0d] text-left shadow-lg shadow-violet-950/30"
          >
            <label className="relative flex min-w-0 flex-1 items-center">
              <span className="sr-only">
                Search {activeSearchTarget.label.toLowerCase()}
              </span>
              <SearchIcon
                size={15}
                color="currentColor"
                style="pointer-events-none absolute left-5 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={isBrewers}
                placeholder={activeSearchTarget.placeholder}
                className="h-11 w-full bg-transparent px-12 text-sm text-white outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
              />
            </label>
            <button
              type="submit"
              disabled={isBrewers || isRouting}
              className="h-11 px-4 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
