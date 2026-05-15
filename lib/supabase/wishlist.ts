import { createClient } from "@/utils/supabase/server";
import { CardProps } from "@/lib/scryfall/cards";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  card_data: CardProps;
  notes: string | null;
  created_at: string;
}

export interface WishlistPage {
  items: WishlistItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AddToWishlistParams {
  card_id: string;
  card_name: string;
  card_data: CardProps;
  notes?: string;
}

export interface UpdateWishlistParams {
  notes?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// ─── Functions ─────────────────────────────────────────────────────────────

/**
 * Get all wishlist items for the authenticated user, paginated.
 */
export async function getWishlist(
  page = 1,
  pageSize = 20,
): Promise<WishlistPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("wishlists")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    items: (data ?? []) as WishlistItem[],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > to + 1,
  };
}

/**
 * Get a single wishlist item by card_id for the authenticated user.
 * Returns null if not found.
 */
export async function getWishlistItem(
  cardId: string,
): Promise<WishlistItem | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as WishlistItem | null;
}

/**
 * Check if a card is in the authenticated user's wishlist.
 */
export async function isInWishlist(cardId: string): Promise<boolean> {
  const item = await getWishlistItem(cardId);
  return item !== null;
}

/**
 * Add a card to the authenticated user's wishlist.
 * Throws if already in wishlist.
 */
export async function addToWishlist(
  params: AddToWishlistParams,
): Promise<WishlistItem> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      user_id: user.id,
      card_id: params.card_id,
      card_name: params.card_name,
      card_data: params.card_data,
      notes: params.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation — already in wishlist
    if (error.code === "23505") {
      throw new Error(`${params.card_name} is already in your wishlist`);
    }
    throw new Error(error.message);
  }

  return data as WishlistItem;
}

/**
 * Remove a card from the authenticated user's wishlist by card_id.
 */
export async function removeFromWishlist(cardId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("card_id", cardId);

  if (error) throw new Error(error.message);
}

/**
 * Remove a wishlist item by its own id (uuid).
 */
export async function removeFromWishlistById(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Update notes for a wishlist item.
 */
export async function updateWishlistItem(
  cardId: string,
  params: UpdateWishlistParams,
): Promise<WishlistItem> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("wishlists")
    .update({ notes: params.notes ?? null })
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WishlistItem;
}

/**
 * Clear all items from the authenticated user's wishlist.
 */
export async function clearWishlist(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

/**
 * Get total count of wishlist items for the authenticated user.
 */
export async function getWishlistCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) return 0;
  return count ?? 0;
}
