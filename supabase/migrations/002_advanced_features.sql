-- =====================================================
-- Migration 002: Advanced Features
-- Phase 2-4: Referrals, Teams, Payments, Enhanced Users
-- =====================================================

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bonus_generations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS usage_alert_sent BOOLEAN DEFAULT FALSE;

-- Create index on referred_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- =====================================================
-- REFERRALS SYSTEM
-- =====================================================

-- Referrals table: Store user referral codes and statistics
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  total_rewards INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_referral UNIQUE(user_id)
);

-- Referral signups table: Track referred users
CREATE TABLE IF NOT EXISTS public.referral_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  converted BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_referral_email UNIQUE(email)
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referrer ON public.referral_signups(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_email ON public.referral_signups(email);
CREATE INDEX IF NOT EXISTS idx_referral_signups_user ON public.referral_signups(user_id);

-- RLS Policies for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own referral data
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their referred signups
CREATE POLICY "Users can view own referral signups"
  ON public.referral_signups FOR SELECT
  USING (auth.uid() = referrer_id);

-- Service role can manage all referral data
CREATE POLICY "Service role full access to referrals"
  ON public.referrals FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to referral_signups"
  ON public.referral_signups FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TEAMS SYSTEM
-- =====================================================

-- Teams table: Store team information
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table: Store team membership
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);

-- Team invites table: Store pending team invitations
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  accepted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_team ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_code ON public.team_invites(invite_code);

-- RLS Policies for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Users can view teams they are members of
CREATE POLICY "Users can view own teams"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team owners can update their teams
CREATE POLICY "Owners can update teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_id);

-- Enterprise users can create teams
CREATE POLICY "Enterprise users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.plan = 'enterprise'
    )
  );

-- Users can view team members of their teams
CREATE POLICY "Users can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members AS my_membership
      WHERE my_membership.team_id = team_members.team_id
      AND my_membership.user_id = auth.uid()
    )
  );

-- Team admins can manage team members
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_members.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Users can view team invites for their teams
CREATE POLICY "Admins can view team invites"
  ON public.team_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invites.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Team admins can create invites
CREATE POLICY "Admins can create team invites"
  ON public.team_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invites.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Service role can manage all team data
CREATE POLICY "Service role full access to teams"
  ON public.teams FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to team_members"
  ON public.team_members FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to team_invites"
  ON public.team_invites FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PAYMENTS SYSTEM
-- =====================================================

-- Payments table: Store payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT NOT NULL,
  stripe_invoice_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

-- RLS Policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.stripe_customer_id = payments.stripe_customer_id
      AND users.id = auth.uid()
    )
  );

-- Service role can manage all payments
CREATE POLICY "Service role full access to payments"
  ON public.payments FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_referrals_updated_at ON public.referrals;
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily usage alert flag
CREATE OR REPLACE FUNCTION reset_daily_usage_alert()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET usage_alert_sent = FALSE
  WHERE daily_usage_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.referrals IS 'User referral codes and statistics';
COMMENT ON TABLE public.referral_signups IS 'Track users who signed up via referral';
COMMENT ON TABLE public.teams IS 'Enterprise team information';
COMMENT ON TABLE public.team_members IS 'Team membership and roles';
COMMENT ON TABLE public.team_invites IS 'Pending team invitations';
COMMENT ON TABLE public.payments IS 'Payment transaction history';

COMMENT ON COLUMN public.users.bonus_generations IS 'Bonus generations earned from referrals';
COMMENT ON COLUMN public.users.referred_by IS 'User ID who referred this user';
COMMENT ON COLUMN public.users.usage_alert_sent IS 'Whether 80% usage alert has been sent today';

COMMENT ON COLUMN public.referrals.code IS 'Unique referral code (8 characters)';
COMMENT ON COLUMN public.referrals.total_referrals IS 'Total number of signups via this code';
COMMENT ON COLUMN public.referrals.successful_referrals IS 'Number of signups who converted to paid';
COMMENT ON COLUMN public.referrals.total_rewards IS 'Total bonus generations earned';

COMMENT ON COLUMN public.team_members.role IS 'admin: full access, member: can generate, viewer: read-only';
COMMENT ON COLUMN public.team_invites.invite_code IS 'Unique 32-character invite code';
COMMENT ON COLUMN public.team_invites.expires_at IS 'Invitation expiry date (7 days from creation)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT SELECT ON public.referral_signups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT, INSERT ON public.team_invites TO authenticated;
GRANT SELECT ON public.payments TO authenticated;

-- Grant full access to service role
GRANT ALL ON public.referrals TO service_role;
GRANT ALL ON public.referral_signups TO service_role;
GRANT ALL ON public.teams TO service_role;
GRANT ALL ON public.team_members TO service_role;
GRANT ALL ON public.team_invites TO service_role;
GRANT ALL ON public.payments TO service_role;

-- =====================================================
-- SAMPLE DATA (Optional - Remove in production)
-- =====================================================

-- Insert sample referral for testing (uncomment if needed)
-- INSERT INTO public.referrals (user_id, code, total_referrals, successful_referrals, total_rewards)
-- VALUES (
--   (SELECT id FROM public.users LIMIT 1),
--   'TEST1234',
--   5,
--   2,
--   200
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('referrals', 'referral_signups', 'teams', 'team_members', 'team_invites', 'payments')) = 6,
    'Not all required tables were created';

  RAISE NOTICE 'Migration 002 completed successfully!';
  RAISE NOTICE 'Created tables: referrals, referral_signups, teams, team_members, team_invites, payments';
  RAISE NOTICE 'Updated users table with: bonus_generations, referred_by, usage_alert_sent';
END $$;
