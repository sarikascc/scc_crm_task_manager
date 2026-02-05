-- Add new roles to user_role enum
-- Note: 'ALTER TYPE ... ADD VALUE' cannot be run inside a transaction block in some contexts, but standard migrations usually handle it. 
-- However, for safety in idempotent scripts:
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';

-- Add module_permissions column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS module_permissions JSONB DEFAULT '{}'::jsonb;

-- Create index for faster querying of permissions (optional, but good for performance if filtering by permissions)
CREATE INDEX IF NOT EXISTS idx_users_module_permissions ON public.users USING gin (module_permissions);
