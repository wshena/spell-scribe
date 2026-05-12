export interface CardSymbol {
  object: string;
  symbol: string;
  svg_uri: string;
  loose_variant: string | null;
  english: string;
  transposable: boolean;
  represents_mana: boolean;
  appears_in_mana_costs: boolean;
  mana_value: number;
  hybrid: boolean;
  phyrexian: boolean;
  cmc: number;
  funny: boolean;
  colors: string[];
  gatherer_alternates: string[] | null;
}

interface CardSymbolList {
  object: string;
  has_more: boolean;
  data: CardSymbol[];
}

export async function fetchCardManaSymbols(): Promise<CardSymbolList> {
  // Cek apakah window terdefinisi
  const isClient = typeof window !== "undefined";

  // Pilih base URL berdasarkan environment
  const baseURL = isClient
    ? process.env.NEXT_PUBLIC_SCRYFALL_API_URL
    : process.env.SCRYFALL_API_URL;

  const response = await fetch(`${baseURL}/symbology`, {
    next: {
      revalidate: 60 * 60 * 24,
      tags: ["scryfall-rulings"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Scryfall rulings");
  }

  return (await response.json()) as CardSymbolList;
}
