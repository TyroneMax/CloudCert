-- RLS policies for core and business tables

-- certifications
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active certifications" ON public.certifications;
CREATE POLICY "Anyone can view active certifications"
  ON public.certifications FOR SELECT USING (is_active = true);

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT USING (true);

-- certification_translations
ALTER TABLE public.certification_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view" ON public.certification_translations;
CREATE POLICY "Anyone can view" ON public.certification_translations FOR SELECT USING (true);

-- category_translations
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view" ON public.category_translations;
CREATE POLICY "Anyone can view" ON public.category_translations FOR SELECT USING (true);

-- questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access free or purchased questions" ON public.questions;
CREATE POLICY "Users can access free or purchased questions"
  ON public.questions FOR SELECT
  USING (
    status = 'published' AND (
      is_free = true
      OR EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = auth.uid()
        AND (
          certification_id = questions.certification_id
          OR plan_type IN ('monthly', 'yearly')
        )
        AND status = 'active'
      )
    )
  );

-- options
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view options for accessible questions" ON public.options;
CREATE POLICY "Users can view options for accessible questions"
  ON public.options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE questions.id = options.question_id
    )
  );

-- question_translations
ALTER TABLE public.question_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view" ON public.question_translations;
CREATE POLICY "Anyone can view" ON public.question_translations FOR SELECT USING (true);

-- option_translations
ALTER TABLE public.option_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view" ON public.option_translations;
CREATE POLICY "Anyone can view" ON public.option_translations FOR SELECT USING (true);

-- user_attempts
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.user_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.user_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.user_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts"
  ON public.user_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
