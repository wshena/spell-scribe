-- Add card_data JSONB column to deck_cards table to store complete card object from Scryfall API
ALTER TABLE public.deck_cards
ADD COLUMN card_data JSONB DEFAULT NULL;

-- Create index on card_data for better query performance
CREATE INDEX idx_deck_cards_card_data ON public.deck_cards USING GIN (card_data);

-- Comment on the new column
COMMENT ON COLUMN public.deck_cards.card_data IS 'Complete card object from Scryfall API stored as JSON. Contains all card details like mana cost, power/toughness, legalities, etc.';
