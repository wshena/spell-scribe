import { createClient } from "@/utils/supabase/server";
import { CardProps } from "@/lib/scryfall/cards";
import { formatDecks } from "@/lib/constants";

export interface DeckData {
  id?: string;
  user_id?: string;
  name: string;
  format: string;
  visibility: "Public" | "Unlisted" | "Private";
  commander?: CardProps | null;
  description?: string | null;
}

export interface DeckCard {
  id?: string;
  card_id: string;
  card_name: string;
  type_line?: string | null;
  quantity: number;
  section: "main" | "sideboard" | "commander" | "maybeboard";
  colors?: string[] | null;
  color_identity?: string[] | null;
  image_uris?: CardProps["image_uris"] | null;
  card_faces?: CardProps["card_faces"] | null;
  card_data?: CardProps | null; // Complete card object from Scryfall API
}

export interface DeckWithCards extends DeckData {
  cards: DeckCard[];
  created_at: string;
  updated_at: string;
}

export interface DeckHistoryItem {
  id: string;
  deck_id: string;
  action: "view" | "edit";
  access_count: number;
  last_accessed_at: string;
  deck: DeckWithCards;
}

export interface PaginatedDecksResponse {
  items: DeckWithCards[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DeckOwner {
  id: string;
  // username: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

type RawDeckHistoryRow = {
  id: string;
  deck_id: string;
  action: "view" | "edit";
  access_count: number;
  last_accessed_at: string;
  decks:
    | {
        id: string;
        name: string;
        format: string;
        visibility: "Public" | "Unlisted" | "Private";
        commander: CardProps | null;
        description: string | null;
        deck_cards: DeckCard[] | null;
        created_at: string;
        updated_at: string;
      }
    | Array<{
        id: string;
        name: string;
        format: string;
        visibility: "Public" | "Unlisted" | "Private";
        commander: CardProps | null;
        description: string | null;
        deck_cards: DeckCard[] | null;
        created_at: string;
        updated_at: string;
      }>;
};

// CREATE - Create new deck
export async function createDeck(deckData: DeckData, cards: DeckCard[] = []) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Validate format exists
  const selectedFormat = formatDecks.find((f) => f.name === deckData.format);
  if (!selectedFormat) {
    throw new Error("Invalid format selected");
  }

  // Validate commander requirement
  if (selectedFormat.commander && !deckData.commander) {
    throw new Error("Commander is required for this format");
  }

  // Create deck
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      name: deckData.name,
      format: deckData.format,
      visibility: deckData.visibility,
      commander: deckData.commander || null,
      description: deckData.description || null,
    })
    .select()
    .single();

  if (deckError) {
    throw new Error(`Failed to create deck: ${deckError.message}`);
  }

  // Add cards if provided
  if (cards.length > 0) {
    const { error: cardsError } = await supabase.from("deck_cards").insert(
      cards.map((card) => ({
        deck_id: deck.id,
        card_id: card.card_id,
        card_name: card.card_name,
        type_line: card.type_line || null,
        quantity: card.quantity,
        section: card.section,
        colors: card.colors || null,
        color_identity: card.color_identity || null,
        image_uris: card.image_uris || null,
        card_faces: card.card_faces || null,
        card_data: card.card_data || null, // Store complete card object
      })),
    );

    if (cardsError) {
      // If cards insertion fails, delete the deck
      await supabase.from("decks").delete().eq("id", deck.id);
      throw new Error(`Failed to add cards to deck: ${cardsError.message}`);
    }
  }

  return deck;
}

// READ - Get deck by ID
export async function getDeck(deckId: string): Promise<DeckWithCards | null> {
  const supabase = await createClient();

  // Get deck with cards
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select(
      `
      *,
      deck_cards (*)
    `,
    )
    .eq("id", deckId)
    .single();

  if (deckError) {
    if (deckError.code === "PGRST116") {
      return null; // Deck not found
    }
    throw new Error(`Failed to fetch deck: ${deckError.message}`);
  }

  return {
    id: deck.id,
    name: deck.name,
    format: deck.format,
    visibility: deck.visibility,
    user_id: deck.user_id,
    commander: deck.commander,
    description: deck.description,
    cards: deck.deck_cards || [],
    created_at: deck.created_at,
    updated_at: deck.updated_at,
  };
}

// READ - Get user's decks
export async function getUserDecks(userId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("decks")
    .select(
      `
      *,
      deck_cards (
        id,
        card_id,
        card_name,
        type_line,
        quantity,
        section,
        colors,
        color_identity,
        image_uris,
        card_faces,
        card_data
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    query = query.eq("user_id", user.id);
  }

  const { data: decks, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch decks: ${error.message}`);
  }

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    format: deck.format,
    visibility: deck.visibility,
    user_id: deck.user_id,
    commander: deck.commander,
    description: deck.description,
    cards: deck.deck_cards || [],
    created_at: deck.created_at,
    updated_at: deck.updated_at,
  }));
}

// UPDATE - Update deck
export async function updateDeck(deckId: string, updates: Partial<DeckData>) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Validate format if being updated
  if (updates.format) {
    const selectedFormat = formatDecks.find((f) => f.name === updates.format);
    if (!selectedFormat) {
      throw new Error("Invalid format selected");
    }

    // Check if commander is required
    if (selectedFormat.commander && !updates.commander) {
      // Get current deck to check existing commander
      const currentDeck = await getDeck(deckId);
      if (!currentDeck?.commander) {
        throw new Error("Commander is required for this format");
      }
    }
  }

  const { data, error } = await supabase
    .from("decks")
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.format && { format: updates.format }),
      ...(updates.visibility && { visibility: updates.visibility }),
      ...(updates.commander !== undefined && { commander: updates.commander }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
    })
    .eq("id", deckId)
    .eq("user_id", user.id) // Ensure user owns the deck
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update deck: ${error.message}`);
  }

  return data;
}

// DELETE - Delete deck
export async function deleteDeck(deckId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", user.id); // Ensure user owns the deck

  if (error) {
    throw new Error(`Failed to delete deck: ${error.message}`);
  }

  return true;
}

// DECK CARDS CRUD

// Add card to deck
export async function addCardToDeck(deckId: string, card: DeckCard) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Verify deck ownership
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single();

  if (deckError || !deck) {
    throw new Error("Deck not found or access denied");
  }

  const { data: existingCard, error: existingCardError } = await supabase
    .from("deck_cards")
    .select("id, quantity")
    .eq("deck_id", deckId)
    .eq("card_id", card.card_id)
    .eq("section", card.section)
    .maybeSingle();

  if (existingCardError) {
    throw new Error(`Failed to check deck card: ${existingCardError.message}`);
  }

  const cardPayload = {
    card_name: card.card_name,
    type_line: card.type_line || null,
    colors: card.colors || null,
    color_identity: card.color_identity || null,
    image_uris: card.image_uris || null,
    card_faces: card.card_faces || null,
    card_data: card.card_data || null, // Store complete card object
  };

  const query = existingCard
    ? supabase
        .from("deck_cards")
        .update({
          ...cardPayload,
          quantity: existingCard.quantity + card.quantity,
        })
        .eq("id", existingCard.id)
    : supabase.from("deck_cards").insert({
        deck_id: deckId,
        card_id: card.card_id,
        quantity: card.quantity,
        section: card.section,
        ...cardPayload,
      });

  const { data, error } = await query.select().single();

  if (error) {
    throw new Error(`Failed to add card to deck: ${error.message}`);
  }

  return data;
}

// Update card quantity in deck
export async function updateCardInDeck(
  deckId: string,
  cardId: string,
  section: string,
  quantity: number,
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  if (quantity <= 0) {
    // Remove card if quantity is 0 or negative
    return await removeCardFromDeck(deckId, cardId, section);
  }

  const { data, error } = await supabase
    .from("deck_cards")
    .update({ quantity })
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .eq("section", section)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update card in deck: ${error.message}`);
  }

  return data;
}

// Remove card from deck
export async function removeCardFromDeck(
  deckId: string,
  cardId: string,
  section: string,
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("deck_cards")
    .delete()
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .eq("section", section);

  if (error) {
    throw new Error(`Failed to remove card from deck: ${error.message}`);
  }

  return true;
}

// Get deck statistics
export async function getDeckStats(deckId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deck_cards")
    .select("section, quantity")
    .eq("deck_id", deckId);

  if (error) {
    throw new Error(`Failed to get deck stats: ${error.message}`);
  }

  const stats = {
    main: 0,
    sideboard: 0,
    commander: 0,
    maybeboard: 0,
    total: 0,
  };

  data.forEach((card) => {
    stats[card.section as keyof typeof stats] += card.quantity;
    stats.total += card.quantity;
  });

  return stats;
}

// Validate deck against format rules
export async function validateDeck(deckId: string) {
  const supabase = await createClient();

  // Get deck with format
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("format, commander")
    .eq("id", deckId)
    .single();

  if (deckError || !deck) {
    throw new Error("Deck not found");
  }

  // Get deck statistics
  const stats = await getDeckStats(deckId);

  // Get format rules
  const formatRules = formatDecks.find((f) => f.name === deck.format);

  if (!formatRules) {
    throw new Error("Invalid deck format");
  }

  const errors: string[] = [];

  // Check minimum deck size
  if (stats.main < formatRules.minDeckSize) {
    errors.push(
      `Deck must have at least ${formatRules.minDeckSize} cards in main deck`,
    );
  }

  // Check sideboard size
  if (stats.sideboard > formatRules.sideboardSize) {
    errors.push(`Sideboard cannot exceed ${formatRules.sideboardSize} cards`);
  }

  // Check commander requirement
  if (formatRules.commander && !deck.commander) {
    errors.push("This format requires a commander");
  }

  // Check commander count
  if (formatRules.commander && stats.commander !== 1) {
    errors.push("Commander format must have exactly 1 commander");
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats,
  };
}

export async function recordDeckHistory(
  deckId: string,
  action: "view" | "edit" = "view",
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const { data: existing } = await supabase
    .from("deck_history")
    .select("id, access_count")
    .eq("user_id", user.id)
    .eq("deck_id", deckId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("deck_history")
      .update({
        action,
        access_count: (existing.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record deck history: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("deck_history")
    .insert({
      user_id: user.id,
      deck_id: deckId,
      action,
      access_count: 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record deck history: ${error.message}`);
  }

  return data;
}

export async function getUserDeckHistory(
  limit = 8,
): Promise<DeckHistoryItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("deck_history")
    .select(
      `
      id,
      deck_id,
      action,
      access_count,
      last_accessed_at,
      decks (
        *,
        deck_cards (
          id,
          card_id,
          card_name,
          type_line,
          quantity,
          section,
          colors,
          color_identity,
          image_uris,
          card_faces
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("last_accessed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch deck history: ${error.message}`);
  }

  return ((data || []) as unknown as RawDeckHistoryRow[]).map((item) => {
    const deck = Array.isArray(item.decks) ? item.decks[0] : item.decks;

    return {
      id: item.id,
      deck_id: item.deck_id,
      action: item.action,
      access_count: item.access_count,
      last_accessed_at: item.last_accessed_at,
      deck: {
        id: deck.id,
        name: deck.name,
        format: deck.format,
        visibility: deck.visibility,
        commander: deck.commander,
        description: deck.description,
        cards: deck.deck_cards || [],
        created_at: deck.created_at,
        updated_at: deck.updated_at,
      },
    };
  });
}

// get all public decks
export async function getPublicDecks(
  page = 1,
  limit = 12,
): Promise<PaginatedDecksResponse> {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const {
    data: decks,
    error,
    count,
  } = await supabase
    .from("decks")
    .select(
      `
      *,
      deck_cards (
        id,
        card_id,
        card_name,
        type_line,
        quantity,
        section,
        colors,
        color_identity,
        image_uris,
        card_faces,
        card_data
      )
      `,
      { count: "exact" },
    )
    .eq("visibility", "Public")
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch public decks: ${error.message}`);
  }

  const formattedDecks: DeckWithCards[] = (decks || []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    format: deck.format,
    visibility: deck.visibility,
    user_id: deck.user_id,
    commander: deck.commander,
    description: deck.description,
    cards: deck.deck_cards || [],
    created_at: deck.created_at,
    updated_at: deck.updated_at,
  }));

  return {
    items: formattedDecks,
    total: count || 0,
    page,
    limit,
    hasMore: to + 1 < (count || 0),
  };
}

// update deck visibility
export async function updateDeckVisibility(
  deckId: string,
  visibility: "Public" | "Private" | "Unlisted",
) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Update visibility
  const { data, error } = await supabase
    .from("decks")
    .update({
      visibility,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deckId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update deck visibility: ${error.message}`);
  }

  return data;
}

// get deck owner
export async function getDeckOwner(deckId: string): Promise<DeckOwner | null> {
  const supabase = await createClient();

  // Step 1: ambil user_id dari deck
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("user_id")
    .eq("id", deckId)
    .single();

  if (deckError || !deck) return null;

  // Step 2: ambil profile berdasarkan user_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("id", deck.user_id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
}
