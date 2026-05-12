import { CardProps } from "@/lib/scryfall/cards";

export const MANA_COLORS = ["W", "U", "B", "R", "G", "C"] as const;

export type ManaColor = (typeof MANA_COLORS)[number];

export interface DeckManaCard {
  quantity: number;
  type_line?: string | null;
  colors?: string[] | null;
  color_identity?: string[] | null;
  card_faces?: CardProps["card_faces"] | null;
  card_data?: CardProps | null;
}

export interface DeckManaStat {
  key: ManaColor;
  label: string;
  symbol: string;
  demandCount: number;
  demandPercent: number;
  supplyCount: number;
  supplyPercent: number;
  landCoverageCount: number;
  landCoveragePercent: number;
}

export interface DeckManaAnalysis {
  stats: DeckManaStat[];
  totalDemand: number;
  totalSupply: number;
  totalLandCards: number;
}

const COLOR_LABELS: Record<ManaColor, string> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
  C: "Colorless",
};

function roundPercent(value: number) {
  return Math.round(value);
}

function getCardData(card: DeckManaCard) {
  return card.card_data ?? null;
}

function getTypeLine(card: DeckManaCard) {
  return getCardData(card)?.type_line || card.type_line || "";
}

function isLandCard(card: DeckManaCard) {
  return getTypeLine(card).toLowerCase().includes("land");
}

function getManaCosts(card: DeckManaCard) {
  const cardData = getCardData(card);

  if (cardData?.mana_cost) {
    return [cardData.mana_cost];
  }

  if (cardData?.card_faces?.length) {
    return cardData.card_faces
      .map((face) => face.mana_cost)
      .filter((cost): cost is string => Boolean(cost));
  }

  if (card.card_faces?.length) {
    return card.card_faces
      .map((face) => face.mana_cost)
      .filter((cost): cost is string => Boolean(cost));
  }

  return [];
}

function getOracleTexts(card: DeckManaCard) {
  const cardData = getCardData(card);
  const texts = new Set<string>();

  if (cardData?.oracle_text) {
    texts.add(cardData.oracle_text);
  }

  cardData?.card_faces?.forEach((face) => {
    if (face.oracle_text) {
      texts.add(face.oracle_text);
    }
  });

  card.card_faces?.forEach((face) => {
    if (face.oracle_text) {
      texts.add(face.oracle_text);
    }
  });

  return [...texts];
}

function getProducedMana(card: DeckManaCard) {
  const producedMana = getCardData(card)?.produced_mana;
  if (producedMana?.length) {
    return producedMana.filter((symbol): symbol is ManaColor =>
      MANA_COLORS.includes(symbol as ManaColor),
    );
  }

  const manaFromText = new Set<ManaColor>();

  getOracleTexts(card).forEach((text) => {
    if (!text.toLowerCase().includes("add")) {
      return;
    }

    const matches = text.match(/\{([WUBRGC])\}/g) || [];
    matches.forEach((match) => {
      const symbol = match.replace(/[{}]/g, "") as ManaColor;
      if (MANA_COLORS.includes(symbol)) {
        manaFromText.add(symbol);
      }
    });
  });

  if (manaFromText.size > 0) {
    return [...manaFromText];
  }

  const fallbackColors =
    card.color_identity?.length ? card.color_identity : card.colors;

  return (fallbackColors || []).filter((symbol): symbol is ManaColor =>
    MANA_COLORS.includes(symbol as ManaColor),
  );
}

function getManaSymbolsFromCosts(card: DeckManaCard) {
  const manaSymbols = new Map<ManaColor, number>();

  getManaCosts(card).forEach((cost) => {
    const matches = cost.match(/\{([^}]+)\}/g) || [];

    matches.forEach((match) => {
      const token = match.replace(/[{}]/g, "");

      MANA_COLORS.forEach((color) => {
        if (token.includes(color)) {
          manaSymbols.set(color, (manaSymbols.get(color) || 0) + 1);
        }
      });
    });
  });

  if (manaSymbols.size > 0) {
    return manaSymbols;
  }

  const fallbackColors =
    card.colors?.length ? card.colors : card.color_identity || [];

  fallbackColors.forEach((color) => {
    if (MANA_COLORS.includes(color as ManaColor)) {
      const manaColor = color as ManaColor;
      manaSymbols.set(manaColor, (manaSymbols.get(manaColor) || 0) + 1);
    }
  });

  return manaSymbols;
}

export function analyzeDeckMana(cards: DeckManaCard[]) {
  const demandCounts = new Map<ManaColor, number>();
  const supplyCounts = new Map<ManaColor, number>();
  const landCoverageCounts = new Map<ManaColor, number>();

  let totalDemand = 0;
  let totalSupply = 0;
  let totalLandCards = 0;

  cards.forEach((card) => {
    if (card.quantity <= 0) {
      return;
    }

    const quantity = card.quantity;
    const manaSymbols = getManaSymbolsFromCosts(card);

    manaSymbols.forEach((count, color) => {
      const weightedCount = count * quantity;
      demandCounts.set(color, (demandCounts.get(color) || 0) + weightedCount);
      totalDemand += weightedCount;
    });

    if (!isLandCard(card)) {
      return;
    }

    totalLandCards += quantity;

    const producedMana = getProducedMana(card);
    producedMana.forEach((color) => {
      supplyCounts.set(color, (supplyCounts.get(color) || 0) + quantity);
      landCoverageCounts.set(
        color,
        (landCoverageCounts.get(color) || 0) + quantity,
      );
      totalSupply += quantity;
    });
  });

  const stats = MANA_COLORS.map((color) => {
    const demandCount = demandCounts.get(color) || 0;
    const supplyCount = supplyCounts.get(color) || 0;
    const landCoverageCount = landCoverageCounts.get(color) || 0;

    return {
      key: color,
      label: COLOR_LABELS[color],
      symbol: color,
      demandCount,
      demandPercent: totalDemand ? roundPercent((demandCount / totalDemand) * 100) : 0,
      supplyCount,
      supplyPercent: totalSupply ? roundPercent((supplyCount / totalSupply) * 100) : 0,
      landCoverageCount,
      landCoveragePercent: totalLandCards
        ? roundPercent((landCoverageCount / totalLandCards) * 100)
        : 0,
    };
  });

  return {
    stats,
    totalDemand,
    totalSupply,
    totalLandCards,
  } satisfies DeckManaAnalysis;
}
