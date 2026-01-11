export type ExpenseType = 'household' | 'private'
export type Person = 'you' | 'partner'

export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  type: ExpenseType
  paidBy: Person
  includeInHousehold: boolean
  date: string
}

export interface Income {
  you: number
  partner: number
}

export interface AppState {
  expenses: Expense[]
  income: Income
  yourName: string
  partnerName: string
  currency: CurrencyCode
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
