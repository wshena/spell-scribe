import { fetcher } from "@/utils/fetcher";
import { ScryfallSetCardsResponse } from "@/lib/scryfall/cards";
import axios from "axios";

export interface AdvancedSearchParams {
  name?: string;
  set?: string;
  oracle_text?: string;
  card_type?: string;
  mana_cost?: string;
  mana_value?: string;
  mana_value_compare?: string;
  power?: string;
  power_compare?: string;
  toughness?: string;
  toughness_compare?: string;
  loyalty?: string;
  loyalty_compare?: string;
  order?: string;
  order_dir?: string;
  colors?: string[];
  color_mode?: string;
  color_identity?: string[];
  color_identity_mode?: string;
  page?: number;
}

const COMPARE_MAP: Record<string, string> = {
  Equals: "=",
  "Less than": "<",
  "Greater than": ">",
  "Less than or equal": "<=",
  "Greater than or equal": ">=",
};

export const ORDER_MAP: Record<string, string> = {
  Name: "name",
  "Release Date": "released",
  "Spoiler Date": "spoiled",
  "Set/Number": "set",
  Rarity: "rarity",
  Color: "color",
  "Price: USD": "usd",
  "Price: TIX": "tix",
  "Price: EUR": "eur",
  "Mana Value": "cmc",
  Power: "power",
  Toughness: "toughness",
  "Artist Name": "artist",
  "EDHREC Rank": "edhrec",
  "Set Review": "review",
};

const COLOR_MODE_MAP: Record<string, string> = {
  "Must have all selected": ">=",
  "Must have exactly these": "=",
  "Must have at least one": ">=",
  "Must not have any": "!",
};

function getEmptySearchResult(): ScryfallSetCardsResponse {
  return { object: "list", total_cards: 0, has_more: false, data: [] };
}

export function buildScryfallQuery(params: AdvancedSearchParams): string {
  const parts: string[] = [];

  if (params.name?.trim()) parts.push(`name:"${params.name.trim()}"`);
  if (params.set?.trim()) parts.push(`set:${params.set.trim()}`);
  if (params.oracle_text?.trim())
    parts.push(`o:"${params.oracle_text.trim()}"`);
  if (params.card_type?.trim()) parts.push(`t:${params.card_type.trim()}`);
  if (params.mana_cost?.trim()) parts.push(`mana:${params.mana_cost.trim()}`);

  if (params.mana_value?.trim()) {
    const op = COMPARE_MAP[params.mana_value_compare || "Equals"] ?? "=";
    parts.push(`cmc${op}${params.mana_value.trim()}`);
  }
  if (params.power?.trim()) {
    const op = COMPARE_MAP[params.power_compare || "Equals"] ?? "=";
    parts.push(`pow${op}${params.power.trim()}`);
  }
  if (params.toughness?.trim()) {
    const op = COMPARE_MAP[params.toughness_compare || "Equals"] ?? "=";
    parts.push(`tou${op}${params.toughness.trim()}`);
  }
  if (params.loyalty?.trim()) {
    const op = COMPARE_MAP[params.loyalty_compare || "Equals"] ?? "=";
    parts.push(`loy${op}${params.loyalty.trim()}`);
  }
  if (params.colors && params.colors.length > 0) {
    const op =
      COLOR_MODE_MAP[params.color_mode || "Must have all selected"] ?? ">=";
    parts.push(`c${op}${params.colors.join("")}`);
  }
  if (params.color_identity && params.color_identity.length > 0) {
    const op =
      COLOR_MODE_MAP[params.color_identity_mode || "Must have all selected"] ??
      ">=";
    parts.push(`id${op}${params.color_identity.join("")}`);
  }

  return parts.join(" ");
}

export function buildSearchURLParams(
  params: AdvancedSearchParams,
): URLSearchParams {
  const q = buildScryfallQuery(params);
  const order = ORDER_MAP[params.order || "Name"] ?? "name";
  const dir = params.order_dir === "Descending" ? "desc" : "asc";

  const urlParams = new URLSearchParams();
  if (q) urlParams.set("q", q);
  urlParams.set("order", order);
  urlParams.set("dir", dir);
  if (params.page) urlParams.set("page", String(params.page));

  return urlParams;
}

/**
 * Client-side fetch — calls internal API route.
 */
export async function fetchAdvancedSearch(
  params: AdvancedSearchParams,
): Promise<ScryfallSetCardsResponse> {
  const urlParams = buildSearchURLParams(params);
  const res = await fetch(`/api/cards/search?${urlParams.toString()}`);

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to fetch cards");
  }

  return res.json();
}

/**
 * Server-side fetch — used in API routes or Server Components.
 * Accepts a pre-built raw Scryfall query string via `rawQuery`,
 * or builds one from params if rawQuery is not provided.
 */
export async function fetchAdvancedSearchServer(
  params: AdvancedSearchParams & { rawQuery?: string },
): Promise<ScryfallSetCardsResponse> {
  const q = params.rawQuery ?? buildScryfallQuery(params);
  const order = ORDER_MAP[params.order || "Name"] ?? "name";
  const dir = params.order_dir === "Descending" ? "desc" : "asc";

  if (!q.trim()) {
    return getEmptySearchResult();
  }

  try {
    const response = await fetcher<ScryfallSetCardsResponse>(
      `${process.env.SCRYFALL_API_URL}/cards/search`,
      {
        params: {
          q,
          order,
          dir,
          ...(params.page ? { page: String(params.page) } : {}),
        },
        cacheKey: `advanced-search:${q}:${order}:${dir}:${params.page ?? 1}`,
        revalidate: 60 * 60,
        tags: ["scryfall-advanced-search"],
      },
    );

    if (!response || !response.data) {
      return getEmptySearchResult();
    }

    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return getEmptySearchResult();
    }

    throw error;
  }
}
