export const SETS_PAGE_SIZE = 20;

export type SetSortOption =
  | "released_desc"
  | "released_asc"
  | "name_asc"
  | "name_desc"
  | "card_count_desc";

export interface ScryfallSet {
  id: string;
  code: string;
  name: string;
  released_at: string | null;
  card_count: number;
  set_type: string;
  icon_svg_uri: string | null;
  digital: boolean;
  search_uri: string;
  uri: string;
  scryfall_uri: string;
  nonfoil_only: boolean;
  foil_only: boolean;
}

export interface SetFilters {
  page: number;
  q: string;
  setType: string;
  sort: SetSortOption;
  exactCode: string;
  includeDigital: boolean;
}

export interface SetTypeOption {
  value: string;
  label: string;
}

export interface SetsPageResult {
  items: ScryfallSet[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: SetFilters;
  setTypeOptions: SetTypeOption[];
}

interface ScryfallSetsResponse {
  data: ScryfallSet[];
}

const SET_TYPE_LABELS: Record<string, string> = {
  alchemy: "Alchemy",
  arsenal: "Arsenal",
  box: "Box Set",
  commander: "Commander",
  core: "Core Set",
  draft_innovation: "Draft Innovation",
  duel_deck: "Duel Deck",
  expansion: "Expansion",
  from_the_vault: "From the Vault",
  funny: "Funny",
  masterpiece: "Masterpiece",
  masters: "Masters",
  memorabilia: "Memorabilia",
  minigame: "Minigame",
  premium_deck: "Premium Deck",
  promo: "Promo",
  spellbook: "Spellbook",
  starter: "Starter",
  token: "Token",
};

const SET_TYPE_ORDER = [
  "expansion",
  "core",
  "masters",
  "commander",
  "draft_innovation",
  "alchemy",
  "funny",
  "promo",
  "token",
  "spellbook",
  "masterpiece",
  "from_the_vault",
  "duel_deck",
  "premium_deck",
  "box",
  "starter",
  "arsenal",
  "minigame",
  "memorabilia",
];

const DEFAULT_FILTERS: SetFilters = {
  page: 1,
  q: "",
  setType: "all",
  sort: "released_desc",
  exactCode: "",
  includeDigital: true,
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const parseBoolean = (value: string | null | undefined, fallback: boolean) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value === "true";
};

const parsePage = (value: string | null | undefined) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const parseSort = (value: string | null | undefined): SetSortOption => {
  const options: SetSortOption[] = [
    "released_desc",
    "released_asc",
    "name_asc",
    "name_desc",
    "card_count_desc",
  ];

  return options.includes(value as SetSortOption)
    ? (value as SetSortOption)
    : DEFAULT_FILTERS.sort;
};

export const getSetFiltersFromParams = (
  params:
    | URLSearchParams
    | Record<string, string | string[] | undefined>
    | undefined
): SetFilters => {
  const getValue = (key: string) => {
    if (!params) {
      return undefined;
    }

    if (params instanceof URLSearchParams) {
      return params.get(key) ?? undefined;
    }

    const rawValue = params[key];
    return Array.isArray(rawValue) ? rawValue[0] : rawValue;
  };

  return {
    page: parsePage(getValue("page")),
    q: getValue("q")?.trim() ?? DEFAULT_FILTERS.q,
    setType: getValue("setType")?.trim() || DEFAULT_FILTERS.setType,
    sort: parseSort(getValue("sort")),
    exactCode: getValue("code")?.trim() ?? DEFAULT_FILTERS.exactCode,
    includeDigital: parseBoolean(getValue("includeDigital"), DEFAULT_FILTERS.includeDigital),
  };
};

const compareDates = (left: string | null, right: string | null) => {
  const leftValue = left ? new Date(left).getTime() : 0;
  const rightValue = right ? new Date(right).getTime() : 0;
  return leftValue - rightValue;
};

const sortSets = (sets: ScryfallSet[], sort: SetSortOption) => {
  return [...sets].sort((left, right) => {
    switch (sort) {
      case "released_asc":
        return compareDates(left.released_at, right.released_at);
      case "name_asc":
        return left.name.localeCompare(right.name);
      case "name_desc":
        return right.name.localeCompare(left.name);
      case "card_count_desc":
        return right.card_count - left.card_count || right.name.localeCompare(left.name);
      case "released_desc":
      default:
        return compareDates(right.released_at, left.released_at);
    }
  });
};

const getSetTypeOptions = (sets: ScryfallSet[]): SetTypeOption[] => {
  const available = [...new Set(sets.map((set) => set.set_type))];

  available.sort((left, right) => {
    const leftIndex = SET_TYPE_ORDER.indexOf(left);
    const rightIndex = SET_TYPE_ORDER.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

  return [
    { value: "all", label: "All set types" },
    ...available.map((value) => ({
      value,
      label: SET_TYPE_LABELS[value] ?? value.replaceAll("_", " "),
    })),
  ];
};

const filterSets = (sets: ScryfallSet[], filters: SetFilters) => {
  const query = normalizeText(filters.q);
  const exactCode = normalizeText(filters.exactCode);

  return sets.filter((set) => {
    if (!filters.includeDigital && set.digital) {
      return false;
    }

    if (filters.setType !== "all" && set.set_type !== filters.setType) {
      return false;
    }

    if (exactCode && normalizeText(set.code) !== exactCode) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystacks = [
      set.name,
      set.code,
      set.set_type,
    ].map(normalizeText);

    return haystacks.some((value) => value.includes(query));
  });
};

export async function fetchAllSets(): Promise<ScryfallSet[]> {
  const response = await fetch(`${process.env.SCRYFALL_API_URL}/sets`, {
    next: {
      revalidate: 60 * 60 * 24,
      tags: ["scryfall-sets"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Scryfall sets");
  }

  const payload = (await response.json()) as ScryfallSetsResponse;

  return payload.data.filter((set) => set.card_count > 0);
}

export async function fetchSetDetail(setCode: string): Promise<ScryfallSet> {
  const response = await fetch(`${process.env.SCRYFALL_API_URL}/sets/${setCode}`, {
    next: {
      revalidate: 60 * 60 * 24,
      tags: ["scryfall-sets"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Scryfall sets");
  }

  const payload = (await response.json()) as ScryfallSet;

  return payload;
}

export async function getSetsPage(filters: SetFilters): Promise<SetsPageResult> {
  const sets = await fetchAllSets();
  const filteredSets = sortSets(filterSets(sets, filters), filters.sort);
  const startIndex = (filters.page - 1) * SETS_PAGE_SIZE;
  const items = filteredSets.slice(startIndex, startIndex + SETS_PAGE_SIZE);

  return {
    items,
    totalCount: filteredSets.length,
    page: filters.page,
    pageSize: SETS_PAGE_SIZE,
    hasMore: startIndex + SETS_PAGE_SIZE < filteredSets.length,
    filters,
    setTypeOptions: getSetTypeOptions(sets),
  };
}
