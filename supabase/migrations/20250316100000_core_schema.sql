-- Core schema: certifications, categories, questions, options, translations
-- Reference: Cursor.md

-- Ensure handle_updated_at exists (may already exist from users migration)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- certifications
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar NOT NULL UNIQUE,
  name varchar NOT NULL,
  provider varchar NOT NULL,
  description text,
  icon_url text,
  total_questions int NOT NULL DEFAULT 0,
  free_question_limit int NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- certification_translations
CREATE TABLE IF NOT EXISTS public.certification_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  language varchar NOT NULL,
  name varchar NOT NULL,
  description text,
  status varchar NOT NULL DEFAULT 'draft',
  UNIQUE(certification_id, language)
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- category_translations
CREATE TABLE IF NOT EXISTS public.category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  language varchar NOT NULL,
  name varchar NOT NULL,
  description text,
  status varchar NOT NULL DEFAULT 'draft',
  UNIQUE(category_id, language)
);

-- questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  explanation text,
  question_type varchar NOT NULL,
  difficulty varchar NOT NULL DEFAULT 'medium',
  status varchar NOT NULL DEFAULT 'published',
  sort_order int NOT NULL,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_cert_sort ON public.questions(certification_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_questions_cert_free ON public.questions(certification_id, is_free);
CREATE INDEX IF NOT EXISTS idx_questions_cert_status ON public.questions(certification_id, status);

-- question_translations
CREATE TABLE IF NOT EXISTS public.question_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  language varchar NOT NULL,
  question_text text NOT NULL,
  explanation text,
  status varchar NOT NULL DEFAULT 'draft',
  UNIQUE(question_id, language)
);

-- options
CREATE TABLE IF NOT EXISTS public.options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_label varchar NOT NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_options_question_sort ON public.options(question_id, sort_order);

-- option_translations
CREATE TABLE IF NOT EXISTS public.option_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  language varchar NOT NULL,
  option_text text NOT NULL,
  status varchar NOT NULL DEFAULT 'draft',
  UNIQUE(option_id, language)
);

-- updated_at triggers
DROP TRIGGER IF EXISTS certifications_updated_at ON public.certifications;
CREATE TRIGGER certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS questions_updated_at ON public.questions;
CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- total_questions sync trigger
CREATE OR REPLACE FUNCTION public.update_cert_question_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.certifications
    SET total_questions = (
      SELECT COUNT(*)::int FROM public.questions
      WHERE certification_id = OLD.certification_id AND status = 'published'
    )
    WHERE id = OLD.certification_id;
    RETURN OLD;
  ELSE
    UPDATE public.certifications
    SET total_questions = (
      SELECT COUNT(*)::int FROM public.questions
      WHERE certification_id = NEW.certification_id AND status = 'published'
    )
    WHERE id = NEW.certification_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_question_count_sync ON public.questions;
CREATE TRIGGER trg_question_count_sync
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_cert_question_count();
