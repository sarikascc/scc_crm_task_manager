-- Create Sarika Admin User
-- This script creates the user in the users table
-- IMPORTANT: You must create the auth user in Supabase Dashboard first!

-- Step 1: Create auth user in Supabase Dashboard:
--   1. Go to Authentication > Users
--   2. Click "Add User" > "Create new user"
--   3. Email: sarika@crm.com
--   4. Password: (set your desired password)
--   5. Check "Auto Confirm User" ✅
--   6. Click "Create user"

-- Step 2: After creating the auth user, get the user ID:
-- Run this query first to get the auth user ID:
-- SELECT id FROM auth.users WHERE email = 'sarika@crm.com';

-- Step 3: Insert/Update user in users table
-- If the trigger from migration 002 already created the entry, this will update it
-- If not, this will insert it

-- Option A: If trigger already created the user (most common case)
UPDATE public.users 
SET 
  full_name = 'Sarika Admin',
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'sarika@crm.com';

-- Option B: If the UPDATE above affects 0 rows, manually insert
-- First, get the auth user ID by running:
-- SELECT id FROM auth.users WHERE email = 'sarika@crm.com';
-- Then replace 'YOUR_AUTH_USER_ID_HERE' below with the actual UUID

-- Uncomment and use this if UPDATE didn't work:
/*
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'sarika@crm.com';

  IF auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (
      auth_user_id,
      'sarika@crm.com',
      'Sarika Admin',
      'admin',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      updated_at = NOW();
  ELSE
    RAISE EXCEPTION 'Auth user with email sarika@crm.com not found. Please create the user in Supabase Dashboard first.';
  END IF;
END $$;
*/
