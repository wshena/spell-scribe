-- Ensures deck analytics can read full Scryfall card metadata from deck_cards.
-- Safe to run on an existing Supabase project.

ALTER TABLE public.deck_cards
  ADD COLUMN IF NOT EXISTS card_data JSONB;

CREATE INDEX IF NOT EXISTS idx_deck_cards_card_data
  ON public.deck_cards
  USING GIN (card_data);

COMMENT ON COLUMN public.deck_cards.card_data
  IS 'Complete card object from Scryfall API stored as JSON. Contains mana cost, oracle text, produced mana, legalities, and related metadata.';
