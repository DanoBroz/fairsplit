-- Add is_temporary flag for one-time / non-recurring expenses.
-- Visual tag only — does not change split math.

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN NOT NULL DEFAULT false;
