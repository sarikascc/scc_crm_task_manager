-- Migration 003: Module Permissions RLS
-- Update Leads and Lead Follow-ups policies to respect module_permissions.

-- 1. Leads RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can read own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete all leads" ON public.leads;

CREATE POLICY "Users with lead read access can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') IN ('read', 'write')
        )
    )
  );

CREATE POLICY "Users with lead write access can insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
        )
    )
  );

CREATE POLICY "Users with lead write access can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
        )
    )
  );

CREATE POLICY "Users with lead write access can delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
        )
    )
  );

-- 2. Lead Follow-ups RLS Policies
ALTER TABLE public.lead_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can read own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can read all follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can update own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can update all follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Users can delete own follow-ups" ON public.lead_followups;
DROP POLICY IF EXISTS "Admins can delete all follow-ups" ON public.lead_followups;

CREATE POLICY "Users with follow-up read access can read follow-ups"
  ON public.lead_followups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') IN ('read', 'write')
          OR COALESCE(u.module_permissions->>'follow_ups', 'none') IN ('read', 'write')
        )
    )
  );

CREATE POLICY "Users with follow-up write access can insert follow-ups"
  ON public.lead_followups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
          OR COALESCE(u.module_permissions->>'follow_ups', 'none') = 'write'
        )
    )
  );

CREATE POLICY "Users with follow-up write access can update follow-ups"
  ON public.lead_followups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
          OR COALESCE(u.module_permissions->>'follow_ups', 'none') = 'write'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
          OR COALESCE(u.module_permissions->>'follow_ups', 'none') = 'write'
        )
    )
  );

CREATE POLICY "Users with follow-up write access can delete follow-ups"
  ON public.lead_followups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role = 'admin'
          OR u.role = 'manager'
          OR COALESCE(u.module_permissions->>'leads', 'none') = 'write'
          OR COALESCE(u.module_permissions->>'follow_ups', 'none') = 'write'
        )
    )
  );
