# Environment Variables Quick Reference

## Required Variables

Create a `.env.local` file in the project root with these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Where to Find Values

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (from "Publishable key" section) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Format: `sb_publishable_...` (new format)
     - **Important**: Use the new "Publishable key", not the legacy "anon" key

## Important Notes

- ✅ File location: `.env.local` in project root (same directory as `package.json`)
- ✅ Variable names are case-sensitive
- ✅ No spaces around `=` sign
- ✅ No quotes around values
- ⚠️ **MUST restart dev server** after creating/updating `.env.local`
- ❌ Never commit `.env.local` to git (already in `.gitignore`)

## Validation

The app validates environment variables at runtime. If missing, you'll see a clear error message with instructions.

## Security

- ✅ `NEXT_PUBLIC_*` variables are safe for browser/client code
- ❌ Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is NOT used in this project
- ❌ Never use service role key in client components

## Troubleshooting

**Error: "Missing required environment variable"**
→ Check that `.env.local` exists and has correct variable names
→ Restart dev server after creating/updating the file

**App still shows errors after adding variables**
→ Verify variable names match exactly (case-sensitive)
→ Check for typos in values
→ Make sure you restarted the dev server

For detailed setup instructions, see [SETUP.md](./SETUP.md).

