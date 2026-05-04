export interface Ruling {
  object: string;
  oracle_id: string;
  source: string;
  published_at: string;
  comment: string;
}

export interface RulingResponse {
  object: string;
  has_more: boolean;
  data: Ruling[];
}

export async function fetchCardRulings(cardID: string): Promise<RulingResponse> {
  // Cek apakah window terdefinisi
  const isClient = typeof window !== "undefined";
  
  // Pilih base URL berdasarkan environment
  const baseURL = isClient 
    ? process.env.NEXT_PUBLIC_SCRYFALL_API_URL 
    : process.env.SCRYFALL_API_URL;

  const response = await fetch(`${baseURL}/cards/${cardID}/rulings`, {
    next: {
      revalidate: 60 * 60 * 24,
      tags: ["scryfall-rulings"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Scryfall rulings");
  }

  return (await response.json()) as RulingResponse;
}