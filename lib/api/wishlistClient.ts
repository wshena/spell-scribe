import { CardProps } from "@/lib/scryfall/cards";
import type { WishlistItem, WishlistPage } from "@/lib/supabase/wishlist";

// ─── Re-export types for convenience ──────────────────────────────────────
export type { WishlistItem, WishlistPage };

// ─── Client fetch helpers ──────────────────────────────────────────────────

/**
 * Fetch paginated wishlist items.
 */
export async function fetchWishlist(
  page = 1,
  pageSize = 20,
): Promise<WishlistPage> {
  const res = await fetch(`/api/wishlist?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to fetch wishlist");
  }
  return res.json();
}

/**
 * Fetch total wishlist count (lightweight — no items returned).
 */
export async function fetchWishlistCount(): Promise<number> {
  const res = await fetch("/api/wishlist?count=true");
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

/**
 * Check if a card is in the wishlist.
 */
export async function checkInWishlist(
  cardId: string,
): Promise<{ inWishlist: boolean; item: WishlistItem | null }> {
  const res = await fetch(`/api/wishlist/${encodeURIComponent(cardId)}`);
  if (!res.ok) return { inWishlist: false, item: null };
  return res.json();
}

/**
 * Add a card to wishlist.
 * Returns the created WishlistItem.
 */
export async function addCardToWishlist(
  card: CardProps,
  notes?: string,
): Promise<WishlistItem> {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      card_id: card.id,
      card_name: card.name,
      card_data: card,
      notes: notes ?? null,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to add to wishlist");
  return data.item;
}

/**
 * Remove a card from wishlist by card_id.
 */
export async function removeCardFromWishlist(cardId: string): Promise<void> {
  const res = await fetch(`/api/wishlist/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to remove from wishlist");
  }
}

/**
 * Clear entire wishlist.
 */
export async function clearWishlistClient(): Promise<void> {
  const res = await fetch("/api/wishlist?all=true", { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to clear wishlist");
  }
}

/**
 * Update notes for a wishlist item.
 */
export async function updateWishlistNotes(
  cardId: string,
  notes: string | null,
): Promise<WishlistItem> {
  const res = await fetch(`/api/wishlist/${encodeURIComponent(cardId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update wishlist item");
  return data.item;
}
