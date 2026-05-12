import slugify from "slugify";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CardSymbol } from "./scryfall/cardSymbols";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
}

export function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const createSlug = (input: string) =>
  slugify(input, { lower: true, strict: true });

export function getManaColorSymbolMap(
  symbols: CardSymbol[],
): Map<string, string> {
  return new Map(
    symbols
      .filter(
        (s) =>
          s.appears_in_mana_costs &&
          !s.hybrid &&
          !s.phyrexian &&
          (s.colors.length === 1 || s.symbol === "{C}"),
      )
      .map((s) => [s.symbol === "{C}" ? "C" : s.colors[0], s.svg_uri]),
  );
}
