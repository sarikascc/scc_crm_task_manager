-- Migration 001: Auth and User Management
-- This file consolidates all migrations related to users, roles, and admin setup.

-- 1. Shared helper function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. User Roles and Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'client');
    END IF;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  module_permissions JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_module_permissions ON public.users USING gin (module_permissions);

-- 5. Row Level Security for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;

CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all users"
  ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 6. Updated_at Trigger for Users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Handle New User Function (FAILSAFE version)
-- This function is called by a trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Default to 'staff' if not specified
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Failsafe: return NEW to allow Auth creation even if profile insertion fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Auth Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Admin Seed (Sarika Admin)
-- Use DO block to safely handle insertion
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- This assumes the auth user already exists. 
    -- If not, it will skip silenty, matching current behavior.
    SELECT id INTO admin_id FROM auth.users WHERE email = 'sarika@crm.com';
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (admin_id, 'sarika@crm.com', 'Sarika Admin', 'admin', true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET
          full_name = 'Sarika Admin',
          role = 'admin',
          is_active = true,
          updated_at = NOW();
    END IF;
END $$;
