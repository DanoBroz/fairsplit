// ============================================================================
// CORE TYPES
// ============================================================================

export type ExpenseType = 'household' | 'private'
export type UserRole = 'owner' | 'member'

// Legacy type for backward compatibility (localStorage)
export type Person = 'you' | 'partner'

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export interface User {
  id: string
  email: string
}

// ============================================================================
// HOUSEHOLD TYPES
// ============================================================================

export interface Household {
  id: string
  name: string
  inviteCode: string
  currency: CurrencyCode
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface HouseholdMember {
  id: string
  householdId: string
  userId: string
  displayName: string
  role: UserRole
  income: number
  joinedAt: string
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

// Database expense type (with userId)
export interface Expense {
  id: string
  householdId: string
  amount: number
  description: string
  category: string
  type: ExpenseType
  paidBy: string // userId
  includeInHousehold: boolean
  date: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

// Legacy localStorage expense type (for migration)
export interface LocalExpense {
  id: string
  amount: number
  description: string
  category: string
  type: ExpenseType
  paidBy: Person
  includeInHousehold: boolean
  date: string
}

// ============================================================================
// STATE TYPES
// ============================================================================

// Legacy localStorage state (for migration)
export interface LocalStorageState {
  expenses: LocalExpense[]
  income: { you: number; partner: number }
  yourName: string
  partnerName: string
  currency: CurrencyCode
}

// New Supabase-powered app state
export interface AppState {
  user: User | null
  household: Household | null
  householdMembers: HouseholdMember[]
  expenses: Expense[]
  isLoading: boolean
}

export const CURRENCIES = [
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
] as const

export type CurrencyCode = typeof CURRENCIES[number]['code']

export const CATEGORIES = [
  'Groceries',
  'Utilities',
  'Rent/Mortgage',
  'Transportation',
  'Entertainment',
  'Dining Out',
  'Healthcare',
  'Personal Care',
  'Clothing',
  'Subscriptions',
  'Gifts',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]
