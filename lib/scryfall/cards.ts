import { fetcher } from "@/utils/fetcher";

export interface ScryfallSetCardsResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: CardProps[];
}

export interface ScryfallAutocompleteResponse {
  object: string;
  total_values: number;
  data: string[];
}

export interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

export interface Legalities {
  standard: string;
  future: string;
  historic: string;
  timeless: string;
  gladiator: string;
  pioneer: string;
  modern: string;
  legacy: string;
  pauper: string;
  vintage: string;
  penny: string;
  commander: string;
  oathbreaker: string;
  standardbrawl: string;
  brawl: string;
  alchemy: string;
  paupercommander: string;
  duel: string;
  oldschool: string;
  premodern: string;
  predh: string;
  tlr: string;
}

export interface Prices {
  usd: string | null;
  usd_foil: string | null;
  usd_etched: string | null;
  eur: string | null;
  eur_foil: string | null;
  tix: string | null;
}

export interface RelatedUris {
  tcgplayer_infinite_articles: string;
  tcgplayer_infinite_decks: string;
  edhrec: string;
}

export interface PurchaseUris {
  tcgplayer: string;
  cardmarket: string;
  cardhoarder: string;
}

export interface CardFace {
  object: string;
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  colors: string[];
  power: string;
  toughness: string;
  flavor_text: string;
  artist: string;
  artist_id: string;
  illustration_id: string;
  image_uris: ImageUris;
}

export interface CardProps {
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  tcgplayer_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris: ImageUris;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  power: string;
  toughness: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Legalities;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  rarity: string;
  artist: string;
  prices: Prices;
  related_uris: RelatedUris;
  purchase_uris: PurchaseUris;
  set: string;
  set_name: string;
  collector_number: string;
  card_faces?: CardFace[];
  flavor_text?: string;
  border_color?: string;
}

function getScryfallBaseURL() {
  const isClient = typeof window !== "undefined";

  return isClient
    ? process.env.NEXT_PUBLIC_SCRYFALL_API_URL
    : process.env.SCRYFALL_API_URL;
}

export async function fetchCardAutocomplete(query: string): Promise<ScryfallAutocompleteResponse> {
  const baseURL = getScryfallBaseURL();

  const response = await fetcher<ScryfallAutocompleteResponse>(`${baseURL}/cards/autocomplete`, {
    params: {
      q: query,
    },
    cacheKey: `card-autocomplete:${query}`,
    revalidate: 60 * 60 * 24,
    tags: ["scryfall-card-autocomplete"],
  });

  if (!response || !response.data) {
    throw new Error("Failed to fetch Scryfall autocomplete results");
  }

  return response;
}

export async function fetchCardBaseOnName(name: string): Promise<CardProps> {
  const baseURL = getScryfallBaseURL();

  const response = await fetcher<CardProps>(`${baseURL}/cards/named`, {
    params: {
      fuzzy: name,
    },
    cacheKey: `card-named:${name}`,
    revalidate: 60 * 60 * 24,
    tags: ["scryfall-card-named"],
  });

  if (!response || !response.name) {
    throw new Error("Failed to fetch Scryfall named card results");
  }

  return response;
}

export function isLegalCommanderCard(card: CardProps): boolean {
  return (
    card.legalities?.commander === "legal" &&
    card.type_line.toLowerCase().includes("legendary")
  );
}

export async function fetchCommanderCards(query: string): Promise<CardProps[]> {
  const baseURL = getScryfallBaseURL();
  const cleanQuery = query.trim().replace(/"/g, '\\"');

  const response = await fetcher<ScryfallSetCardsResponse>(`${baseURL}/cards/search`, {
    params: {
      q: `name:"${cleanQuery}" legal:commander t:legendary`,
      unique: "cards",
      order: "name",
    },
    cacheKey: `commander-search:${cleanQuery}`,
    revalidate: 60 * 60 * 24,
    tags: ["scryfall-commander-search"],
  });

  if (!response || !response.data) {
    return [];
  }

  return response.data.filter(isLegalCommanderCard);
}

export async function fetchCardsByName(query: string): Promise<CardProps[]> {
  const baseURL = getScryfallBaseURL();
  const cleanQuery = query.trim().replace(/"/g, '\\"');

  const response = await fetcher<ScryfallSetCardsResponse>(`${baseURL}/cards/search`, {
    params: {
      q: `name:"${cleanQuery}"`,
      unique: "cards",
      order: "name",
    },
    cacheKey: `card-search:${cleanQuery}`,
    revalidate: 60 * 60 * 24,
    tags: ["scryfall-card-search"],
  });

  if (!response || !response.data) {
    return [];
  }

  return response.data;
}
