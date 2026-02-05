-- Add deleted_at column for soft delete
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at);
