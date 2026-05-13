import { createClient } from "@/utils/supabase/server";

export type DeckChangeAction =
  | "card_added"
  | "card_removed"
  | "card_quantity_changed"
  | "commander_changed"
  | "visibility_changed"
  | "deck_renamed";

export interface DeckChange {
  id: string;
  deck_id: string;
  user_id: string;
  action: DeckChangeAction;
  card_id: string | null;
  card_name: string | null;
  quantity_delta: number | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface InsertDeckChangeParams {
  deckId: string;
  action: DeckChangeAction;
  cardId?: string | null;
  cardName?: string | null;
  quantityDelta?: number | null;
  oldValue?: string | null;
  newValue?: string | null;
}

/**
 * Insert a single change record. Silently fails — never block the main operation.
 */
export async function recordDeckChange(
  params: InsertDeckChangeParams,
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("deck_changes").insert({
      deck_id: params.deckId,
      user_id: user.id,
      action: params.action,
      card_id: params.cardId ?? null,
      card_name: params.cardName ?? null,
      quantity_delta: params.quantityDelta ?? null,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
    });
  } catch {
    // Never throw — history is best-effort
  }
}

export interface DeckChangesPage {
  items: DeckChange[];
  hasMore: boolean;
  total: number;
}

/**
 * Fetch paginated changes for a deck, newest first.
 */
export async function getDeckChanges(
  deckId: string,
  page = 1,
  pageSize = 10,
): Promise<DeckChangesPage> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("deck_changes")
    .select("*", { count: "exact" })
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    items: (data ?? []) as DeckChange[],
    hasMore: (count ?? 0) > to + 1,
    total: count ?? 0,
  };
}
