-- Adds retry tracking columns for CRM sync
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS crm_retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_crm_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_crm_attempt_at TIMESTAMPTZ;
