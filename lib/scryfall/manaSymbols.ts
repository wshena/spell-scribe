import { fetchCardManaSymbols } from './cardSymbols';

export interface ManaSymbolInfo {
  symbol: string;
  svgUri: string;
}

export interface ManaTextToken {
  type: 'text' | 'symbol';
  text: string;
  symbol?: string;
  svgUri?: string;
}

/**
 * Parse mana cost string (e.g., "{U}{B}{2}") into individual symbols
 * Returns symbols with braces, e.g., ["{U}", "{B}", "{2}"]
 */
export function parseManaSymbols(manaCost: string): string[] {
  if (!manaCost) return [];

  const symbols: string[] = [];
  const regex = /\{[^}]+\}/g;
  let match;

  while ((match = regex.exec(manaCost)) !== null) {
    symbols.push(match[0]); // Include the braces
  }

  return symbols;
}

/**
 * Fetch all mana symbols and create a map for quick lookup
 */
export async function getManaSymbolMap(): Promise<Map<string, string>> {
  try {
    const symbolList = await fetchCardManaSymbols();
    const symbolMap = new Map<string, string>();

    symbolList.data.forEach((symbol) => {
      symbolMap.set(symbol.symbol, symbol.svg_uri);
    });

    return symbolMap;
  } catch (error) {
    console.error("Failed to fetch mana symbols:", error);
    return new Map();
  }
}

/**
 * Fetch mana symbol SVGs for deck color identity display.
 */
export async function getManaColorSymbolMap(): Promise<Map<string, string>> {
  const symbolMap = await getManaSymbolMap();
  const colorSymbolMap = new Map<string, string>();

  ['W', 'U', 'B', 'R', 'G', 'C'].forEach((color) => {
    const svgUri = symbolMap.get(`{${color}}`);
    if (svgUri) {
      colorSymbolMap.set(color, svgUri);
    }
  });

  return colorSymbolMap;
}

/**
 * Tokenize text and convert mana symbols inside it into token objects.
 */
export function tokenizeManaText(text: string, symbolMap: Map<string, string>): ManaTextToken[] {
  if (!text) return [{ type: 'text', text: '' }];

  const tokens: ManaTextToken[] = [];
  const regex = /(\{[^}]+\})/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: text.slice(lastIndex, match.index) });
    }

    const symbol = match[1];
    const svgUri = symbolMap.get(symbol);

    if (svgUri) {
      tokens.push({ type: 'symbol', text: symbol, symbol, svgUri });
    } else {
      tokens.push({ type: 'text', text: symbol });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Get mana symbol SVG URIs for a mana cost string using a pre-built symbol map.
 */
export function getManaCostSymbolsFromMap(manaCost: string, symbolMap: Map<string, string>): ManaSymbolInfo[] {
  if (!manaCost || symbolMap.size === 0) return [];

  return parseManaSymbols(manaCost)
    .map((symbol) => ({
      symbol,
      svgUri: symbolMap.get(symbol) || '',
    }))
    .filter((info) => info.svgUri);
}
