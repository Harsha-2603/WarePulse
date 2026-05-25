-- ==============================================================
-- DATABASE MIGRATION: RECURSION-FREE USERS ROW-LEVEL SECURITY
-- ==============================================================
-- Run this SQL in your Supabase SQL Editor if you experience RLS recursion issues.

-- Drop legacy users policies
DROP POLICY IF EXISTS users_select_update_delete ON users;
DROP POLICY IF EXISTS users_insert ON users;

-- 1. Insert Policy: Allow anyone to insert their own profile row during registration
CREATE POLICY users_insert ON users
  FOR INSERT
  WITH CHECK (id = auth.uid() OR auth_user_id = auth.uid());

-- 2. Unified Isolation Policy: Allows users to read, update, or delete profiles in their own shop.
-- Leverages strict non-recursive evaluations matching auth.uid() directly against users' IDs.
CREATE POLICY users_select_update_delete ON users
  FOR ALL
  USING (
    id = auth.uid()
    OR auth_user_id = auth.uid()
    OR shop_id = (
      SELECT shop_id 
      FROM public.users 
      WHERE id = auth.uid() OR auth_user_id = auth.uid() 
      LIMIT 1
    )
  );

console.log("DB: Applied non-recursive RLS policy mapping successfully!");
