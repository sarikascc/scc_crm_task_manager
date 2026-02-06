-- Migration 005: Make follow-up date and note optional
-- This allows users to add interaction notes without setting a reminder date,
-- or set a reminder date without adding a note (at least one must be provided)

-- 1. Make follow_up_date optional in lead_followups
ALTER TABLE public.lead_followups
  ALTER COLUMN follow_up_date DROP NOT NULL;

-- 2. Make note optional in lead_followups (allows reminder-only entries)
ALTER TABLE public.lead_followups
  ALTER COLUMN note DROP NOT NULL;

-- 3. Make follow_up_date optional in client_followups
ALTER TABLE public.client_followups
  ALTER COLUMN follow_up_date DROP NOT NULL;

-- 4. Make note optional in client_followups (allows reminder-only entries)
ALTER TABLE public.client_followups
  ALTER COLUMN note DROP NOT NULL;

-- 5. Remove next_follow_up_note column from client_followups (if it exists)
ALTER TABLE public.client_followups
  DROP COLUMN IF EXISTS next_follow_up_note;

-- 6. Add constraint to ensure at least one of note or follow_up_date is provided
-- Note: This constraint will be enforced at the application level for better error messages
-- Database-level constraint would be: CHECK (note IS NOT NULL OR follow_up_date IS NOT NULL)
-- But we'll handle this in application validation for better UX
