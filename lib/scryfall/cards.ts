export interface ScryfallSetCardsResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: CardProps[];
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
