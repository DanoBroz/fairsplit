-- COMPREHENSIVE FIX: Drop ALL expense policies and recreate them
-- This ensures no conflicting policies exist

-- First, list what policies exist (for debugging - run this SELECT first if needed)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'expenses';

-- Drop ALL possible expense policies (covering all names that might exist)
DROP POLICY IF EXISTS "Users can view appropriate expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Members can view expenses" ON expenses;
DROP POLICY IF EXISTS "Members can create expenses" ON expenses;
DROP POLICY IF EXISTS "Members can update expenses" ON expenses;
DROP POLICY IF EXISTS "Members can delete expenses" ON expenses;

-- Recreate SELECT policy
-- Users can view household expenses + their own private expenses + private expenses shared with household
CREATE POLICY "Users can view appropriate expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    AND deleted_at IS NULL
    AND (
      type = 'household'
      OR paid_by = auth.uid()
      OR include_in_household = true
    )
  );

-- Recreate INSERT policy
-- Users can create expenses in their household (only as themselves)
CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    AND paid_by = auth.uid()
  );

-- Recreate UPDATE policy
-- Users can update their own expenses OR any household expense in their household
CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    -- Who can initiate the update:
    paid_by = auth.uid()  -- Own expenses
    OR (
      type = 'household'
      AND household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    )
  );
-- Note: No WITH CHECK means any update is allowed if USING passes

-- Recreate DELETE policy (for hard deletes, though we use soft delete)
CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    paid_by = auth.uid()
    OR (
      type = 'household'
      AND household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    )
  );
