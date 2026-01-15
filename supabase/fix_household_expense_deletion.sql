-- Fix RLS policies to allow all household members to delete household expenses
-- while maintaining privacy for private expenses

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON expenses;

-- New UPDATE policy: Users can update their own expenses OR household expenses in their household
-- WITH CHECK is permissive to allow soft deletes (just setting deleted_at)
CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  USING (
    paid_by = auth.uid()  -- Can update own expenses
    OR (
      -- Can update household expenses in their household
      type = 'household'
      AND household_id IN (
        SELECT household_id FROM household_members
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (true);  -- Allow the update if USING passed

-- New DELETE policy: Users can delete their own expenses OR household expenses in their household
CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  USING (
    paid_by = auth.uid()  -- Can delete own expenses
    OR (
      -- Can delete household expenses in their household
      type = 'household'
      AND household_id IN (
        SELECT household_id FROM household_members
        WHERE user_id = auth.uid()
      )
    )
  );
