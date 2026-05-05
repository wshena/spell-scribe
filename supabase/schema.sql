-- Create deck table
CREATE TABLE public.decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('Public', 'Unlisted', 'Private')),
    commander JSONB, -- Store commander card data if applicable
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create deck_cards table for storing cards in decks
CREATE TABLE public.deck_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    card_id VARCHAR(255) NOT NULL, -- Scryfall card ID
    card_name VARCHAR(255) NOT NULL, -- Card name for quick reference
    type_line TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    section VARCHAR(50) NOT NULL DEFAULT 'main' CHECK (section IN ('main', 'sideboard', 'commander', 'maybeboard')),
    colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    color_identity TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_uris JSONB,
    card_faces JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Ensure unique card per deck per section
    UNIQUE(deck_id, card_id, section)
);

-- Create deck_history table for recent deck activity
CREATE TABLE public.deck_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL DEFAULT 'view' CHECK (action IN ('view', 'edit')),
    access_count INTEGER NOT NULL DEFAULT 1 CHECK (access_count > 0),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    UNIQUE(user_id, deck_id)
);

-- Create indexes for better performance
CREATE INDEX idx_decks_user_id ON public.decks(user_id);
CREATE INDEX idx_decks_format ON public.decks(format);
CREATE INDEX idx_decks_visibility ON public.decks(visibility);
CREATE INDEX idx_deck_cards_deck_id ON public.deck_cards(deck_id);
CREATE INDEX idx_deck_cards_section ON public.deck_cards(section);
CREATE INDEX idx_deck_history_user_last_accessed ON public.deck_history(user_id, last_accessed_at DESC);
CREATE INDEX idx_deck_history_deck_id ON public.deck_history(deck_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decks
CREATE POLICY "Users can view public decks" ON public.decks
    FOR SELECT USING (visibility = 'Public');

CREATE POLICY "Users can view their own decks" ON public.decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks" ON public.decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON public.decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON public.decks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for deck_cards
CREATE POLICY "Users can view cards from public decks" ON public.deck_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE decks.id = deck_cards.deck_id
            AND (decks.visibility = 'Public' OR decks.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage cards in their own decks" ON public.deck_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE decks.id = deck_cards.deck_id
            AND decks.user_id = auth.uid()
        )
    );

-- RLS Policies for deck_history
CREATE POLICY "Users can view their own deck history" ON public.deck_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deck history" ON public.deck_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deck history" ON public.deck_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deck history" ON public.deck_history
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_decks_updated_at
    BEFORE UPDATE ON public.decks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_deck_cards_updated_at
    BEFORE UPDATE ON public.deck_cards
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to record recent deck activity for a user
CREATE OR REPLACE FUNCTION public.record_deck_history(
    p_deck_id UUID,
    p_action VARCHAR DEFAULT 'view'
) RETURNS public.deck_history AS $$
DECLARE
    history_row public.deck_history;
BEGIN
    INSERT INTO public.deck_history (user_id, deck_id, action, access_count, last_accessed_at)
    VALUES (auth.uid(), p_deck_id, p_action, 1, TIMEZONE('utc'::text, NOW()))
    ON CONFLICT (user_id, deck_id)
    DO UPDATE SET
        action = EXCLUDED.action,
        access_count = public.deck_history.access_count + 1,
        last_accessed_at = EXCLUDED.last_accessed_at
    RETURNING * INTO history_row;

    RETURN history_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to validate deck format rules
CREATE OR REPLACE FUNCTION public.validate_deck_format(
    p_deck_id UUID,
    p_format_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    deck_size INTEGER;
    sideboard_size INTEGER;
    commander_count INTEGER;
    format_rules JSONB;
BEGIN
    -- Get deck statistics
    SELECT
        COALESCE(SUM(CASE WHEN section = 'main' THEN quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN section = 'sideboard' THEN quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN section = 'commander' THEN quantity ELSE 0 END), 0)
    INTO deck_size, sideboard_size, commander_count
    FROM public.deck_cards
    WHERE deck_id = p_deck_id;

    -- Basic validation based on format
    -- You can extend this with more detailed rules
    CASE p_format_name
        WHEN 'Commander / EDH' THEN
            RETURN deck_size >= 100 AND commander_count = 1;
        WHEN 'Standard' THEN
            RETURN deck_size >= 60 AND deck_size <= 100 AND sideboard_size <= 15;
        WHEN 'Modern' THEN
            RETURN deck_size >= 60 AND sideboard_size <= 15;
        WHEN 'Legacy' THEN
            RETURN deck_size >= 60 AND sideboard_size <= 15;
        WHEN 'Vintage' THEN
            RETURN deck_size >= 60 AND sideboard_size <= 15;
        WHEN 'Pauper' THEN
            RETURN deck_size >= 60 AND sideboard_size <= 15;
        ELSE
            RETURN deck_size >= 60; -- Default minimum
    END CASE;
END;
$$ LANGUAGE plpgsql;
