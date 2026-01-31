# Database Migrations

This folder contains SQL migration files for setting up the database schema.

## Migration Files

### 001_create_users_table.sql
Creates the `users` table that extends Supabase auth.users with CRM-specific data:
- User roles (admin, manager, user)
- Active/inactive status
- Full name
- Timestamps

### 002_create_auth_trigger.sql
Creates a trigger that automatically creates a user record in the `users` table when a new user is created in `auth.users`.

### 003_create_sarika_admin_user.sql
Creates the Sarika Admin user in the users table. **Important**: You must create the auth user in Supabase Dashboard first (see instructions in the file).

## How to Apply Migrations

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file
4. Run them in order (001, then 002)

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual Execution
1. Connect to your Supabase database
2. Execute each SQL file in order
3. Verify the tables and policies were created correctly

## Important Notes

1. **Email Confirmation**: Make sure to disable email confirmation in Supabase Auth settings:
   - Go to Authentication > Settings
   - Disable "Enable email confirmations"

2. **User Creation**: Since we're not allowing signup in the UI, users must be created manually:
   - Via Supabase Dashboard (Authentication > Users > Add User)
   - Via Supabase API
   - The trigger will automatically create a corresponding record in the `users` table

3. **RLS Policies**: Row Level Security is enabled on the `users` table. Adjust policies as needed for your use case.

4. **Roles**: Default role is 'user'. Update user roles as needed:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

5. **Creating Users**: To create a new user:
   - First create the auth user in Supabase Dashboard (Authentication > Users)
   - The trigger from migration 002 will auto-create the users table entry
   - Then update the role and other fields as needed
   - See `003_create_sarika_admin_user.sql` for an example

