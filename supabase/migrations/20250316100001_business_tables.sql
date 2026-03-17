-- Business tables: user_attempts, admin_users, audit_logs, site_content, stripe_events
-- Note: user_subscriptions already exists in remote DB

-- user_attempts
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_ids uuid[] NOT NULL,
  is_correct boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_question ON public.user_attempts(user_id, question_id, attempted_at DESC);

-- admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role varchar NOT NULL DEFAULT 'editor',
  permissions jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  action varchar NOT NULL,
  target_type varchar NOT NULL,
  target_id uuid,
  details jsonb,
  ip_address varchar,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- site_content
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section varchar NOT NULL,
  content_key varchar NOT NULL,
  content_value text NOT NULL,
  language varchar NOT NULL DEFAULT 'en',
  sort_order int DEFAULT 0,
  is_published boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  updated_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  UNIQUE(section, content_key, language)
);

-- stripe_events
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id varchar PRIMARY KEY,
  event_type varchar NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT NOW()
);
