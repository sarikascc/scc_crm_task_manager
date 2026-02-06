-- Migration 004: Client Management
-- This file creates tables for clients and client follow-ups.

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  remark TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Clients Constraint
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients
ADD CONSTRAINT clients_status_check
CHECK (status IN ('active', 'inactive'));

-- 3. Clients Indexes
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_lead_id ON public.clients(lead_id) WHERE lead_id IS NOT NULL;

-- 4. Clients Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can read own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can read all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete all clients" ON public.clients;

CREATE POLICY "Authenticated users can insert clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read own clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can read all clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update all clients"
  ON public.clients
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

CREATE POLICY "Users can delete own clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete all clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 5. Clients Trigger
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Client Follow-ups Table
CREATE TABLE IF NOT EXISTS public.client_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  follow_up_date DATE NOT NULL,
  next_follow_up_note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Client Follow-ups Indexes
CREATE INDEX IF NOT EXISTS idx_client_followups_client_id ON public.client_followups(client_id);
CREATE INDEX IF NOT EXISTS idx_client_followups_created_by ON public.client_followups(created_by);
CREATE INDEX IF NOT EXISTS idx_client_followups_follow_up_date ON public.client_followups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_client_followups_client_date ON public.client_followups(client_id, follow_up_date);

-- 8. Client Follow-ups Row Level Security
ALTER TABLE public.client_followups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Users can read own client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Admins can read all client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Users can update own client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Admins can update all client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Users can delete own client follow-ups" ON public.client_followups;
DROP POLICY IF EXISTS "Admins can delete all client follow-ups" ON public.client_followups;

CREATE POLICY "Authenticated users can insert client follow-ups"
  ON public.client_followups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read own client follow-ups"
  ON public.client_followups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can read all client follow-ups"
  ON public.client_followups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own client follow-ups"
  ON public.client_followups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update all client follow-ups"
  ON public.client_followups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  )
  WITH CHECK (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  );

CREATE POLICY "Users can delete own client follow-ups"
  ON public.client_followups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete all client follow-ups"
  ON public.client_followups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS ( SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin' )
  );

-- 9. Client Follow-ups Trigger
DROP TRIGGER IF EXISTS update_client_followups_updated_at ON public.client_followups;
CREATE TRIGGER update_client_followups_updated_at
  BEFORE UPDATE ON public.client_followups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
