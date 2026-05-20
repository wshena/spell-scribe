export type DeckExplorerSearchParams = {
  q?: string | string[];
  deckName?: string | string[];
  format?: string | string[];
  commander?: string | string[];
  partner?: string | string[];
  theme?: string | string[];
  boardCard?: string | string[];
  boardSection?: string | string[];
  companion?: string | string[];
  commanderBracketCompare?: string | string[];
  commanderBracket?: string | string[];
  authors?: string | string[];
  sort?: string | string[];
};

export type DeckExplorerFilters = {
  q: string;
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
  sort: string;
};

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function getDeckExplorerFilters(
  searchParams: DeckExplorerSearchParams,
): DeckExplorerFilters {
  return {
    q: getStringParam(searchParams.q),
    deckName: getStringParam(searchParams.deckName),
    format: getStringParam(searchParams.format),
    commander: getStringParam(searchParams.commander),
    partner: getStringParam(searchParams.partner),
    theme: getStringParam(searchParams.theme),
    boardCard: getStringParam(searchParams.boardCard),
    boardSection: getStringParam(searchParams.boardSection) || "main",
    companion: getStringParam(searchParams.companion),
    commanderBracketCompare:
      getStringParam(searchParams.commanderBracketCompare) || "equals",
    commanderBracket: getStringParam(searchParams.commanderBracket),
    authors: getStringParam(searchParams.authors),
    sort: getStringParam(searchParams.sort) || "updated-desc",
  };
}
