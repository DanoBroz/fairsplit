-- Fix the recursion issue in household_members policies
-- Use the SECURITY DEFINER function to avoid recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view members" ON household_members;
DROP POLICY IF EXISTS "Members can view households" ON households;
DROP POLICY IF EXISTS "Members can update households" ON households;
DROP POLICY IF EXISTS "Owners can delete households" ON households;
DROP POLICY IF EXISTS "Owners can remove members" ON household_members;

-- Ensure the helper function exists
CREATE OR REPLACE FUNCTION get_user_household_ids(user_uuid UUID)
RETURNS TABLE(household_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT hm.household_id
  FROM household_members hm
  WHERE hm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the helper function

-- HOUSEHOLD_MEMBERS: Allow viewing own record OR records in same household
CREATE POLICY "Members can view members"
  ON household_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can always see own membership
    OR household_id IN (  -- Can see others in same household
      SELECT * FROM get_user_household_ids(auth.uid())
    )
  );

-- HOUSEHOLDS: Use helper function to avoid recursion
CREATE POLICY "Members can view households"
  ON households FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT * FROM get_user_household_ids(auth.uid())
    )
  );

CREATE POLICY "Members can update households"
  ON households FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT * FROM get_user_household_ids(auth.uid())
    )
  );

CREATE POLICY "Owners can delete households"
  ON households FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT hm.household_id FROM household_members hm
      WHERE hm.user_id = auth.uid() AND hm.role = 'owner'
    )
  );

CREATE POLICY "Owners can remove members"
  ON household_members FOR DELETE
  TO authenticated
  USING (
    household_id IN (
      SELECT hm.household_id FROM household_members hm
      WHERE hm.user_id = auth.uid() AND hm.role = 'owner'
    )
  );
