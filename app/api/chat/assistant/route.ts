import { GoogleGenAI, type Content } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
  getDeck,
  type DeckCard,
  type DeckWithCards,
} from "@/lib/supabase/decks";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type AssistantMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

type AssistantRequestBody = {
  messages?: AssistantMessage[];
  currentPath?: string;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const MAX_MESSAGES = 12;
const MAX_CARDS_IN_CONTEXT = 140;
const MAX_OUTPUT_TOKENS = 4096;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getDeckIdFromPath(path?: string) {
  if (!path) return null;
  const match = path.match(/^\/decks\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function isAssistantMessage(value: unknown): value is AssistantMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as AssistantMessage;
  return (
    (message.role === "user" || message.role === "model") &&
    Array.isArray(message.parts) &&
    message.parts.every((part) => typeof part?.text === "string")
  );
}

function sanitizeMessages(messages: AssistantMessage[] = []): Content[] {
  return messages
    .filter(isAssistantMessage)
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      parts: [
        {
          text: message.parts
            .map((part) => part.text)
            .join("\n")
            .slice(0, 4000),
        },
      ],
    }));
}

function getCardManaValue(card: DeckCard) {
  const value = card.card_data?.cmc;
  return typeof value === "number" ? value : null;
}

function summarizeCard(card: DeckCard) {
  const tags = [
    card.section !== "main" ? card.section : null,
    card.type_line || null,
    card.colors?.length ? `colors:${card.colors.join("")}` : null,
    card.color_identity?.length
      ? `identity:${card.color_identity.join("")}`
      : null,
    getCardManaValue(card) !== null ? `mv:${getCardManaValue(card)}` : null,
  ].filter(Boolean);

  return `${card.quantity}x ${card.card_name}${tags.length ? ` (${tags.join("; ")})` : ""}`;
}

function buildDeckContext(deck: DeckWithCards) {
  const totalCards = deck.cards.reduce(
    (total, card) => total + card.quantity,
    0,
  );
  const commander =
    deck.cards.find((card) => card.section === "commander")?.card_name ||
    deck.commander?.name ||
    "None";
  const sections = deck.cards.reduce<Record<string, number>>((counts, card) => {
    counts[card.section] = (counts[card.section] || 0) + card.quantity;
    return counts;
  }, {});
  const typeCounts = deck.cards.reduce<Record<string, number>>(
    (counts, card) => {
      const typeLine = card.type_line || "Unknown";
      const primaryType =
        [
          "Creature",
          "Planeswalker",
          "Instant",
          "Sorcery",
          "Artifact",
          "Enchantment",
          "Battle",
          "Land",
        ].find((type) => typeLine.includes(type)) || "Other";
      counts[primaryType] = (counts[primaryType] || 0) + card.quantity;
      return counts;
    },
    {},
  );

  const cardLines = deck.cards
    .slice()
    .sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.card_name.localeCompare(b.card_name);
    })
    .slice(0, MAX_CARDS_IN_CONTEXT)
    .map(summarizeCard);

  return [
    `Deck name: ${deck.name}`,
    `Format: ${deck.format}`,
    `Visibility: ${deck.visibility}`,
    `Commander: ${commander}`,
    `Description: ${deck.description || "None"}`,
    `Total cards: ${totalCards}`,
    `Section counts: ${JSON.stringify(sections)}`,
    `Type counts: ${JSON.stringify(typeCounts)}`,
    `Cards${deck.cards.length > MAX_CARDS_IN_CONTEXT ? " (truncated)" : ""}:`,
    ...cardLines,
  ].join("\n");
}

function buildSystemInstruction(deckContext: string) {
  return `You are SpellScribe Assistant, an expert Magic: The Gathering deck-building assistant focused on Commander/EDH and general MTG deck construction.

You help with:
- Analyze Deck
- Suggest Cuts
- Suggest Upgrades
- Generate Commander Deck
- Explain Combo Lines
- Estimate Power Level (EDH)

Rules:
- Use the provided deck context as the source of truth.
- Be practical and specific: mention card names, quantities, role issues, mana curve, ramp, draw, removal, win conditions, synergy, and format concerns when relevant.
- For EDH power level, give a 1-10 estimate plus a short justification. Treat it as an estimate, not an official rating.
- If asked for upgrades, include budget-aware alternatives when the user asks for a budget.
- If asked to generate a Commander deck, provide a structured shell by role/category and make it clear it is a starting list.
- If information is missing, say what assumption you are making and continue.
- Do not claim live card prices or newly released legality changes unless the user provides them.
- Keep answers concise enough for a chat modal. Prefer Bahasa Indonesia if the user writes Indonesian, otherwise use the user's language.

Current deck context:
${deckContext}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssistantRequestBody;
    const deckId = getDeckIdFromPath(body.currentPath);

    if (!deckId) {
      return NextResponse.json(
        { error: "Assistant is only available on deck detail pages." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY or GOOGLE_API_KEY." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const deck = await getDeck(deckId);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found." }, { status: 404 });
    }

    if (deck.visibility === "Private" && deck.user_id !== user?.id) {
      return NextResponse.json(
        { error: "You do not have access to this deck." },
        { status: 403 },
      );
    }

    const contents = sanitizeMessages(body.messages);
    if (!contents.length) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: {
        systemInstruction: buildSystemInstruction(buildDeckContext(deck)),
        temperature: 0.45,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        abortSignal: request.signal,
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Assistant route error:", error);
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to generate assistant response."),
      },
      { status: 500 },
    );
  }
}
