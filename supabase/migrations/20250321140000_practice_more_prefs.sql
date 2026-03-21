ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS practice_always_show_explanation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS practice_auto_submit boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.user_preferences.practice_always_show_explanation IS 'After answering, always show explanation (including when correct).';
COMMENT ON COLUMN public.user_preferences.practice_auto_submit IS 'When true, evaluate when selected count matches correct count; when false, require explicit Submit.';
