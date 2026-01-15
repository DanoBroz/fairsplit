-- Create a SECURITY DEFINER function to handle soft deletes
-- This bypasses RLS and manually checks authorization

CREATE OR REPLACE FUNCTION soft_delete_expense(expense_id UUID)
RETURNS void AS $$
DECLARE
  expense_record RECORD;
  user_household_id UUID;
BEGIN
  -- Get the expense details
  SELECT id, household_id, type, paid_by
  INTO expense_record
  FROM expenses
  WHERE id = expense_id AND deleted_at IS NULL;

  IF expense_record.id IS NULL THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  -- Get user's household
  SELECT household_id INTO user_household_id
  FROM household_members
  WHERE user_id = auth.uid();

  -- Check authorization:
  -- 1. User must be in the same household
  -- 2. Either: expense is household type OR user is the payer
  IF expense_record.household_id = user_household_id
     AND (expense_record.type = 'household' OR expense_record.paid_by = auth.uid()) THEN
    -- Authorized - perform soft delete
    UPDATE expenses SET deleted_at = NOW() WHERE id = expense_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to delete this expense';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_expense(UUID) TO authenticated;
