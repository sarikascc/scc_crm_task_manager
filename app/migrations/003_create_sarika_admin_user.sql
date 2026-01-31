-- Insert user if UPDATE didn't work (replace USER_ID with actual auth user ID)
-- First, get the auth user ID:
SELECT id FROM auth.users WHERE email = 'sarika@crm.com';

-- Then use that ID in this INSERT:
INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  id,
  'sarika@crm.com',
  'Sarika Admin',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'sarika@crm.com'
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'Sarika Admin',
  role = 'admin',
  is_active = true,
  updated_at = NOW();