-- Migration 002: Lead Management
-- This file consolidates all migrations related to leads and lead follow-ups.

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Leads Constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check
CHECK (status IN ('new', 'contacted', 'follow_up', 'converted', 'lost'));

-- 3. Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON public.leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

-- 4. Leads Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can read own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete all leads" ON public.leads;

CREATE POLICY "Authenticated users can insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read own leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can read all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update all leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can delete own leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete all leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 5. Leads Trigger
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Lead Follow-ups Table
CREATE TABLE IF NOT EXISTS public.lead_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  follow_up_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Lead Follow-ups Indexes
CREATE INDEX IF NOT EXISTS idx_lead_followups_lead_id ON public.lead_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_followups_created_by ON public.lead_followups(created_by);
CREATE INDEX IF NOT EXISTS idx_lead_followups_follow_up_date ON public.lead_followups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_lead_followups_lead_date ON public.lead_followups(lead_id, follow_up_date);

-- 8. Lead Follow-ups Row Level Security
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can read own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can read all follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can update own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can update all follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can delete own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can delete all follow-ups" ON public.lead_followups;

CREATE POLICY "Authenticated users can insert follow-ups"
  ON public.lead_followups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read own follow-ups"
  ON public.lead_followups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can read all follow-ups"
  ON public.lead_followups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own follow-ups"
  ON public.lead_followups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update all follow-ups"
  ON public.lead_followups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  )
  WITH CHECK (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  );

CREATE POLICY "Users can delete own follow-ups"
  ON public.lead_followups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete all follow-ups"
  ON public.lead_followups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  );

-- 9. Lead Follow-ups Trigger
DROP TRIGGER IF EXISTS update_lead_followups_updated_at ON public.lead_followups;
CREATE TRIGGER update_lead_followups_updated_at
  BEFORE UPDATE ON public.lead_followups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
