-- FairSplit Database Schema
-- Simplified single-household design with private expense privacy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- households table
-- Each household represents a shared expense tracking unit (e.g., a couple)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL, -- 8-character code for sharing
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- household_members table
-- Junction table linking users to households
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL, -- How this user appears in the household (e.g., "John", "Sarah")
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  income NUMERIC(10, 2) DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- expenses table
-- All expenses belong to a household
-- Private expenses only visible to creator unless include_in_household is true
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('household', 'private')),
  paid_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  include_in_household BOOLEAN NOT NULL DEFAULT false,
  is_temporary BOOLEAN NOT NULL DEFAULT false,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete for sync purposes
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_expenses_household_id ON expenses(household_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_deleted_at ON expenses(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_households_invite_code ON households(invite_code);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- HOUSEHOLDS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view households they're members of
CREATE POLICY "Users can view their households"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create households
CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update households they own
CREATE POLICY "Owners can update households"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Owners can delete households
CREATE POLICY "Owners can delete households"
  ON households FOR DELETE
  USING (
    id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- HOUSEHOLD_MEMBERS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view members of their households
CREATE POLICY "Users can view household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can join households (insert themselves)
CREATE POLICY "Users can join households"
  ON household_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own membership info
CREATE POLICY "Users can update their membership"
  ON household_members FOR UPDATE
  USING (user_id = auth.uid());

-- Owners can delete members (to remove someone from household)
CREATE POLICY "Owners can remove members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- EXPENSES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view expenses from their households
-- BUT: Private expenses only visible to creator OR if include_in_household is true
CREATE POLICY "Users can view appropriate expenses"
  ON expenses FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
    AND (
      type = 'household'
      OR paid_by = auth.uid()  -- Own private expenses
      OR include_in_household = true  -- Private but shared
    )
  );

-- Users can create expenses in their households
CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid()
    )
    AND paid_by = auth.uid()  -- Can only create expenses for themselves
  );

-- Users can update their own expenses
CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  USING (paid_by = auth.uid());

-- Users can delete (soft delete) their own expenses
CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  USING (paid_by = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar chars (0,O,1,I)
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on households
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on expenses
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View to see household with member info (useful for queries)
CREATE VIEW household_details AS
SELECT
  h.id,
  h.name,
  h.invite_code,
  h.currency,
  h.created_at,
  json_agg(
    json_build_object(
      'user_id', hm.user_id,
      'display_name', hm.display_name,
      'role', hm.role,
      'income', hm.income,
      'joined_at', hm.joined_at
    )
  ) as members
FROM households h
LEFT JOIN household_members hm ON h.id = hm.household_id
GROUP BY h.id, h.name, h.invite_code, h.currency, h.created_at;
