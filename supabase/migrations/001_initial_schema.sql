-- AdGenXAI Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Subscription info
  plan TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Usage tracking
  daily_limit INTEGER NOT NULL DEFAULT 10,
  monthly_limit INTEGER NOT NULL DEFAULT 300,
  daily_usage INTEGER NOT NULL DEFAULT 0,
  monthly_usage INTEGER NOT NULL DEFAULT 0,
  daily_usage_date DATE DEFAULT CURRENT_DATE,

  -- Timestamps
  subscription_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_plan CHECK (plan IN ('free', 'pro', 'enterprise')),
  CONSTRAINT valid_subscription_status CHECK (
    subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')
  )
);

-- Generations table (ad generation history)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Input parameters
  product TEXT NOT NULL,
  audience TEXT NOT NULL,
  tone TEXT NOT NULL,

  -- Generated output
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  image_prompt TEXT NOT NULL,

  -- Metadata
  model TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_tone CHECK (
    tone IN ('professional', 'casual', 'exciting', 'friendly', 'urgent', 'luxury')
  )
);

-- Payments table (Stripe payment history)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_customer_id TEXT NOT NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,

  -- Timestamps
  paid_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('succeeded', 'failed', 'pending'))
);

-- Newsletter subscribers (Beehiv integration)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  publication_id TEXT,
  status TEXT,

  -- Timestamps
  subscribed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'unsubscribed'))
);

-- Newsletter campaigns (Beehiv integration)
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  campaign_id TEXT,
  sentiment TEXT,
  tags TEXT[],

  -- Beehiv data
  beehiv_post_id TEXT UNIQUE,

  -- Analytics
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON public.generations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns(sent_at DESC);

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Generations: Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON public.generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Generations: Users can insert their own generations
CREATE POLICY "Users can insert own generations"
  ON public.generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.stripe_customer_id = payments.stripe_customer_id
    )
  );

-- Newsletter: Public can read (for stats)
CREATE POLICY "Public can view newsletter data"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view campaigns"
  ON public.newsletter_campaigns
  FOR SELECT
  USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset daily usage counters
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET
    daily_usage = 0,
    daily_usage_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE daily_usage_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a cron job to run daily reset
-- (Requires pg_cron extension - may need Supabase Pro)
-- SELECT cron.schedule('reset-daily-usage', '0 0 * * *', 'SELECT public.reset_daily_usage()');

COMMENT ON TABLE public.users IS 'User profiles with subscription and usage data';
COMMENT ON TABLE public.generations IS 'AI ad generation history';
COMMENT ON TABLE public.payments IS 'Stripe payment records';
COMMENT ON TABLE public.newsletter_subscribers IS 'Beehiv newsletter subscribers';
COMMENT ON TABLE public.newsletter_campaigns IS 'Newsletter campaign history';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
