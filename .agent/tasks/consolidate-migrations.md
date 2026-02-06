# Task: Consolidate Database Migrations

Consolidate the existing 10 migration files into 2 clean, module-wise files to improve maintainability and clarity.

## Objectives
- [ ] Merge User-related migrations into `001_auth_user_management.sql`.
- [ ] Merge Lead-related migrations into `002_lead_management.sql`.
- [ ] Ensure all latest fixes (e.g., FAILSAFE trigger, role enums, soft delete) are included.
- [ ] Maintain idempotency (use `IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`, etc.).
- [ ] Cleanup old migration files.
- [ ] Update documentation.

## Proposed Structure

### File 1: `001_auth_user_management.sql`
- `update_updated_at_column` helper function.
- `user_role` ENUM.
- `users` table including `module_permissions` and `deleted_at`.
- All indexes for `users`.
- RLS policies for `users`.
- Trigger for `updated_at`.
- `handle_new_user` FAILSAFE function.
- `on_auth_user_created` trigger on `auth.users`.
- Admin Seed (Sarika Admin).

### File 2: `002_lead_management.sql`
- `leads` table (the one without `email` and with `follow_up_date`).
- `lead_followups` table.
- Indexes for both.
- RLS policies for both.
- Triggers for both.

## Progress
- [x] Initial research and plan.
- [x] Create consolidated files.
- [x] Remove old files.
- [x] Update README.
