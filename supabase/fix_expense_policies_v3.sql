-- FINAL FIX: Drop ALL expense policies including the "own" variants
-- Then recreate clean policies

-- Drop ALL expense policies (including the ones we missed)
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view appropriate expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Members can view appropriate expenses" ON expenses;
DROP POLICY IF EXISTS "Members can create expenses" ON expenses;
DROP POLICY IF EXISTS "Members can update expenses" ON expenses;
DROP POLICY IF EXISTS "Members can delete expenses" ON expenses;
DROP POLICY IF EXISTS "Anyone can create expenses" ON expenses;

-- Verify all dropped (run this after to confirm):
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'expenses';

-- Recreate clean policies

-- SELECT: View household expenses + own private + shared private
CREATE POLICY "View expenses"
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

-- INSERT: Create expenses in your household as yourself
CREATE POLICY "Create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    AND paid_by = auth.uid()
  );

-- UPDATE: Update own expenses OR any household expense
CREATE POLICY "Update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    paid_by = auth.uid()
    OR (
      type = 'household'
      AND household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    )
  );

-- DELETE: Delete own expenses OR any household expense
CREATE POLICY "Delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    paid_by = auth.uid()
    OR (
      type = 'household'
      AND household_id IN (SELECT * FROM get_user_household_ids(auth.uid()))
    )
  );
