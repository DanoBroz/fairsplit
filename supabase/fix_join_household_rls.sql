-- Fix RLS to allow users to search for households by invite code when joining

DROP POLICY IF EXISTS "Members can view households" ON households;

-- Allow viewing households if you're a member OR if searching by invite code
CREATE POLICY "Members can view households"
  ON households FOR SELECT
  TO authenticated
  USING (
    -- You're already a member
    id IN (
      SELECT * FROM get_user_household_ids(auth.uid())
    )
    -- OR the invite code is being used (for joining)
    -- This allows finding households to join
  );

-- Better approach: Create a separate public function to lookup by invite code
CREATE OR REPLACE FUNCTION find_household_by_invite(code TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  currency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.name, h.currency
  FROM households h
  WHERE h.invite_code = code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
