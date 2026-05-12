import { buildSearchURLParams } from "@/lib/scryfall/advanceSearch";

export type CardSearchContext =
  | { type: "deck"; deckId: string }
  | { type: "sets" };

export function buildCardSearchPath(
  context: CardSearchContext,
  query: string,
) {
  const urlParams = buildSearchURLParams({ name: query });
  const queryString = urlParams.toString();

  if (context.type === "deck") {
    return `/decks/${context.deckId}/search?${queryString}`;
  }

  return `/cards/search?${queryString}`;
}
