-- Practice preferences on user_preferences (quiz auto-advance + reveal mode)
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS practice_auto_next_on_correct boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS practice_reveal_immediate boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_preferences.practice_auto_next_on_correct IS 'When true, advance to next question after a correct answer in quiz.';
COMMENT ON COLUMN public.user_preferences.practice_reveal_immediate IS 'When true, show correct answers and explanations without submitting (no user_attempts).';
