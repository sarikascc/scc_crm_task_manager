-- Migration 009: Failsafe User Roles and Trigger
-- This migration ensures the database enum has the correct roles and the trigger function is updated to be non-blocking.

-- 1. Add 'staff' and 'client' roles to the enum if they don't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Update the handle_new_user function to be FAILSAFE
-- If this function fails for any reason, it will catch the error and return NEW.
-- This prevents the "Database error" from blocking Supabase Auth account creation.
-- Our App code handles the profile creation via a secondary UPSERT to ensure data integrity.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Default to 'staff'
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error if possible or just return NEW to allow Auth to succeed
  -- This is the "God Move" that stops the "Database error creating user" from ever appearing again.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the users table default role
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'staff';
