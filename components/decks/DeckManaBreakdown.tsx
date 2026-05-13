"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchCardManaSymbols } from "@/lib/scryfall/cardSymbols";
import { cn, getManaColorSymbolMap } from "@/lib/utils";
import { analyzeDeckMana, DeckManaCard } from "@/lib/utils/deckManaAnalytics";

interface DeckManaBreakdownProps {
  cards: DeckManaCard[];
}

const colorTheme: Record<
  string,
  {
    chipClassName: string;
    barClassName: string;
  }
> = {
  W: {
    chipClassName: "bg-[#f3efc5] text-[#3b3421]",
    barClassName: "bg-[#efe9a7]",
  },
  U: {
    chipClassName: "bg-[#3f4c60] text-[#dce7f5]",
    barClassName: "bg-[#5f7695]",
  },
  B: {
    chipClassName: "bg-[#cdc2bb] text-[#241d1a]",
    barClassName: "bg-[#b5a79e]",
  },
  R: {
    chipClassName: "bg-[#e99773] text-[#30160c]",
    barClassName: "bg-[#ef9d78]",
  },
  G: {
    chipClassName: "bg-[#56634e] text-[#edf5e6]",
    barClassName: "bg-[#65755d]",
  },
  C: {
    chipClassName: "bg-[#dfd8cf] text-[#2f2a26]",
    barClassName: "bg-[#d8d0c5]",
  },
};

const DeckManaBreakdown = ({ cards }: DeckManaBreakdownProps) => {
  const analysis = analyzeDeckMana(cards);
  const [colorSymbolMap, setColorSymbolMap] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetchCardManaSymbols();
        setColorSymbolMap(getManaColorSymbolMap(res.data));
      } catch (error) {
        console.error("Failed to load mana symbols:", error);
      }
    };

    fetchSymbols();
  }, []);

  if (!cards.length) {
    return null;
  }

  return (
    <section className="space-y-10">
      <div className="text-center">
        <h2 className="text-md md:text-lg font-semibold uppercase tracking-[0.18em] text-violet-300">
          Mana Breakdown
        </h2>
        <p className="text-sm text-slate-400">
          Calculated from mana costs on cards and mana production on lands.
        </p>
      </div>

      <div className="grid gap-px md:grid-cols-2 xl:grid-cols-6">
        {analysis.stats.map((stat) => {
          const theme = colorTheme[stat.key];

          return (
            <article
              key={stat.key}
              className={cn(
                "p-5",
                stat.demandPercent === 0 ? "opacity-50" : "opacity-100",
              )}
            >
              <div className="mb-5 flex flex-col items-center">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold`}
                >
                  {colorSymbolMap.get(stat.symbol) ? (
                    <Image
                      src={colorSymbolMap.get(stat.symbol) || ""}
                      alt={`${stat.label} mana`}
                      width={34}
                      height={34}
                      className="h-13 w-13"
                    />
                  ) : (
                    stat.symbol
                  )}
                </div>
                <p className="text-4xl font-semibold text-white">
                  {stat.demandPercent}%
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {stat.demandCount} of {analysis.totalDemand} mana symbols
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  {stat.label} Mana Production
                </p>
                <div className="h-3 overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${theme.barClassName}`}
                    style={{ width: `${stat.supplyPercent}%` }}
                  />
                </div>
                <div className="space-y-1 text-xs text-slate-500 text-center">
                  <p>{stat.supplyPercent}% of land mana sources</p>
                  <p>
                    {stat.landCoveragePercent}% of lands can produce this color
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DeckManaBreakdown;
