-- ==============================================================
-- DATABASE DIAGNOSTICS: SIGNUP & AUTH SYNCHRONIZATION AUDIT
-- ==============================================================
-- Run these SQL statements in your Supabase SQL Editor to audit your production database.

-- 1. Identify Orphan Auth Users
-- (Users who exist in Supabase auth.users but have no matching public.users profile row)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT auth_user_id FROM public.users)
  AND id NOT IN (SELECT id FROM public.users)
ORDER BY created_at DESC;

-- 2. Identify Misaligned Profiles
-- (Users where public.users has a record, but their id is not set to their auth_user_id or auth.users.id)
SELECT id, auth_user_id, email, full_name
FROM public.users
WHERE id <> auth_user_id;

-- 3. Identify Missing Users Table Rows
-- (Shows details of all auth.users whose public profiles were not created)
SELECT id, email, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ORDER BY created_at DESC;

-- 4. Identify Invalid Shop Mappings
-- (Users linked to a shop_id that does not exist in the public.shop table)
SELECT id, full_name, email, shop_id
FROM public.users
WHERE shop_id IS NULL
   OR shop_id NOT IN (SELECT id FROM public.shop);

-- 5. Quick Clean-Up Query for Orphan Auth Users
-- NOTE: Replace 'USER_UUID_HERE' with the ID of the orphaned user you want to remove.
-- select auth.delete_user('USER_UUID_HERE');
