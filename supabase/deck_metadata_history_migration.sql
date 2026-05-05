-- Run this on an existing Supabase project to add deck color metadata and deck history.

ALTER TABLE public.deck_cards
  ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS color_identity TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS image_uris JSONB,
  ADD COLUMN IF NOT EXISTS card_faces JSONB;

CREATE TABLE IF NOT EXISTS public.deck_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL DEFAULT 'view' CHECK (action IN ('view', 'edit')),
    access_count INTEGER NOT NULL DEFAULT 1 CHECK (access_count > 0),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, deck_id)
);

CREATE INDEX IF NOT EXISTS idx_deck_history_user_last_accessed
  ON public.deck_history(user_id, last_accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_deck_history_deck_id
  ON public.deck_history(deck_id);

ALTER TABLE public.deck_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_history'
      AND policyname = 'Users can view their own deck history'
  ) THEN
    CREATE POLICY "Users can view their own deck history" ON public.deck_history
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_history'
      AND policyname = 'Users can insert their own deck history'
  ) THEN
    CREATE POLICY "Users can insert their own deck history" ON public.deck_history
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_history'
      AND policyname = 'Users can update their own deck history'
  ) THEN
    CREATE POLICY "Users can update their own deck history" ON public.deck_history
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_history'
      AND policyname = 'Users can delete their own deck history'
  ) THEN
    CREATE POLICY "Users can delete their own deck history" ON public.deck_history
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

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
