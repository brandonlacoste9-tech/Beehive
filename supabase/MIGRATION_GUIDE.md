# Database Migration Guide

This guide will help you run the database migrations for AdGenXAI's advanced features.

## Prerequisites

- Supabase project set up
- Supabase CLI installed (optional, for automated migrations)
- Access to Supabase SQL Editor

## Migration Files

### 001_initial_schema.sql
The initial database schema with:
- Users table
- Generations table
- Newsletter subscribers table
- Basic RLS policies

### 002_advanced_features.sql (NEW)
Advanced features schema with:
- Referrals system (referrals, referral_signups)
- Teams system (teams, team_members, team_invites)
- Payments tracking (payments)
- Enhanced users table (bonus_generations, referred_by, usage_alert_sent)

## Running Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/002_advanced_features.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Verify success message: "Migration 002 completed successfully!"

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual SQL Execution

```bash
# Using psql (if you have direct database access)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/002_advanced_features.sql
```

## Verification

After running the migration, verify the tables were created:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'referrals',
  'referral_signups',
  'teams',
  'team_members',
  'team_invites',
  'payments'
);
```

Expected result: 6 rows

```sql
-- Check users table columns were added
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
  'bonus_generations',
  'referred_by',
  'usage_alert_sent'
);
```

Expected result: 3 rows

## Table Structure Reference

### Referrals System

**referrals**
- `id` - UUID primary key
- `user_id` - Reference to users
- `code` - Unique 8-character referral code
- `total_referrals` - Count of signups
- `successful_referrals` - Count of paid conversions
- `total_rewards` - Bonus generations earned

**referral_signups**
- `id` - UUID primary key
- `referrer_id` - User who referred
- `email` - Referred user's email
- `user_id` - Referred user's account
- `converted` - Whether they upgraded to paid
- `reward_claimed` - Whether reward was given

### Teams System

**teams**
- `id` - UUID primary key
- `name` - Team name
- `description` - Team description
- `owner_id` - Team owner (Enterprise user)

**team_members**
- `id` - UUID primary key
- `team_id` - Reference to team
- `user_id` - Reference to user
- `role` - admin | member | viewer
- `invited_by` - Who invited this member

**team_invites**
- `id` - UUID primary key
- `team_id` - Reference to team
- `email` - Invitee's email
- `role` - Role for new member
- `invite_code` - Unique 32-character code
- `expires_at` - Expiry date (7 days)
- `accepted` - Whether invite was accepted

### Payments System

**payments**
- `id` - UUID primary key
- `stripe_customer_id` - Stripe customer ID
- `stripe_invoice_id` - Stripe invoice ID
- `amount` - Payment amount (decimal)
- `currency` - Currency code (default: usd)
- `status` - succeeded | failed | pending | refunded
- `paid_at` - Payment timestamp

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Users** can view/update their own data
- **Team admins** can manage team members and invites
- **Service role** has full access for API operations
- **Referral data** is private to the user who owns it

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- WARNING: This will delete all data in these tables!

DROP TABLE IF EXISTS public.referral_signups CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.team_invites CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;

ALTER TABLE public.users
DROP COLUMN IF EXISTS bonus_generations,
DROP COLUMN IF EXISTS referred_by,
DROP COLUMN IF EXISTS usage_alert_sent;
```

## Troubleshooting

### Error: "relation already exists"
The table was already created. This is safe to ignore if the table structure matches.

### Error: "permission denied"
Ensure you're running the migration with sufficient privileges (postgres role or service_role).

### Error: "column already exists"
The column was already added. This is safe to ignore.

### RLS Policies Not Working
1. Verify RLS is enabled: `SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals';`
2. Check policies: `SELECT * FROM pg_policies WHERE tablename = 'referrals';`
3. Ensure service role key is used in API calls, not anon key

## Next Steps

After running migrations:

1. ✅ Update environment variables (see main README)
2. ✅ Test referral code generation
3. ✅ Test team creation (Enterprise users only)
4. ✅ Verify email notifications work
5. ✅ Check admin analytics dashboard

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify all environment variables are set
3. Ensure service role key has proper permissions
4. Review RLS policies if data access fails

For additional help, see the main README or contact support.
