# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: FairSplit (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait for it to finish setting up (~2 minutes)

## 2. Get Your API Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon in sidebar)
2. Click on "API" in the settings menu
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public** key (the `anon` key, starts with `eyJhbGc...`)

## 3. Set Up Environment Variables

1. In your FairSplit project, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run the Database Schema

1. In Supabase dashboard, click on "SQL Editor" in the sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

## 5. Verify Setup

Check that the following tables were created:
1. In Supabase dashboard, go to "Table Editor"
2. You should see these tables:
   - `households`
   - `household_members`
   - `expenses`

## 6. Configure Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. **Email** provider should be enabled by default
3. (Optional) Enable other providers like Google, GitHub if you want

### Email Settings (Recommended)

For development, the default email settings work fine. For production:

1. Go to "Authentication" → "Settings" → "Email Templates"
2. Customize the email templates (optional)
3. Configure SMTP settings (Settings → Auth → SMTP Settings) for production emails

## 7. Test Your Setup

You're ready! When you run `yarn dev`, the app will now:
- Allow users to sign up and log in
- Store all data in Supabase
- Support real-time sync between partners

## Security Notes

- ✅ **Row Level Security (RLS)** is enabled on all tables
- ✅ Private expenses are only visible to their creator
- ✅ Users can only access households they're members of
- ✅ The anon key is safe to use in your frontend (it respects RLS policies)
- ⚠️ Never commit your `.env.local` file to git

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the complete `schema.sql` file
- Check the SQL editor for any error messages

### Authentication not working
- Verify your environment variables are correct
- Restart your dev server after adding `.env.local`
- Check that Email provider is enabled in Supabase

### RLS Policy errors
- Make sure you're logged in
- Check that the user is a member of a household
- Verify the SQL policies ran successfully

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
