-- ============================================================
-- WSA Migration v2: Custom Auth → Native Supabase Auth
-- Wedding Speech Analyzer | PUSL3190
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- What this does:
--   1. Drops the password_hash column (no longer needed)
--   2. Removes the self-generating UUID default from profiles.id
--   3. Adds a foreign key from profiles.id → auth.users.id
--   4. Creates a trigger that auto-creates a profiles row whenever
--      Supabase Auth registers a new user (reads name/role from metadata)
--
-- IMPORTANT — Existing data:
--   If public.profiles already has rows, step 3 will fail because
--   those UUIDs don't exist in auth.users. Options:
--     a) Uncomment the TRUNCATE line below to clear all test data (safest).
--     b) Manually delete the FK-violating rows first.
-- ============================================================

-- OPTIONAL: Wipe existing test data so the FK constraint can be added.
-- Cascades to: jobs, audio_files, transcript_segments, highlights, notifications.
-- Uncomment the line below if you have no data worth keeping.
-- TRUNCATE public.profiles CASCADE;

-- Step 1: Drop the password_hash column
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS password_hash;

-- Step 2: Remove the self-generating default from profiles.id
--         (id is now supplied by the trigger, matching auth.users.id)
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;

-- Step 3: Add foreign key to auth.users (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
      AND table_name     = 'profiles'
      AND table_schema   = 'public'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: Trigger function — runs after Supabase Auth creates a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name TEXT;
  _role TEXT;
BEGIN
  -- Read name and role from signUp options.data (user metadata)
  _name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'videographer');

  -- Block admin self-registration at the DB level.
  -- Admins are assigned only via the Admin → User Management page.
  IF _role NOT IN ('videographer', 'editor') THEN
    _role := 'videographer';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (NEW.id, NEW.email, _name, _role, 'active')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Step 5: Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
