-- Create trigger to automatically create user record in users table
-- when a new user is created in auth.users
-- This ensures that every authenticated user has a corresponding record in users table

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: This trigger will automatically create a user record in the users table
-- when a new user signs up via Supabase Auth. However, since we're not allowing
-- signup in the UI, users will need to be created manually in Supabase dashboard
-- or via the Supabase API.

