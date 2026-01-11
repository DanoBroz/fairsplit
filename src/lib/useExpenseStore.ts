'use client'

import { useState, useEffect } from 'react'
import { AppState, Expense, Income, CurrencyCode, CURRENCIES } from '@/types'

const STORAGE_KEY = 'fairsplit-data'

const defaultState: AppState = {
  expenses: [],
  income: { you: 0, partner: 0 },
  yourName: 'You',
  partnerName: 'Partner',
  currency: 'USD',
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code
}

export function useExpenseStore() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === 'undefined') return defaultState
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return defaultState
      }
    }
    return defaultState
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const addExpense = (expense: Expense) => {
    setState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }))
  }

  const removeExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }

  const setIncome = (income: Income) => {
    setState((prev) => ({ ...prev, income }))
  }

  const setNames = (yourName: string, partnerName: string) => {
    setState((prev) => ({ ...prev, yourName, partnerName }))
  }

  const setCurrency = (currency: CurrencyCode) => {
    setState((prev) => ({ ...prev, currency }))
  }

  // Calculate proportions based on income
  const totalIncome = state.income.you + state.income.partner
  const yourProportion = totalIncome > 0 ? state.income.you / totalIncome : 0.5
  const partnerProportion = totalIncome > 0 ? state.income.partner / totalIncome : 0.5

  // Calculate expenses
  const householdExpenses = state.expenses.filter(
    (e) => e.type === 'household' || e.includeInHousehold
  )
  const yourPrivateExpenses = state.expenses.filter(
    (e) => e.type === 'private' && !e.includeInHousehold && e.paidBy === 'you'
  )
  const partnerPrivateExpenses = state.expenses.filter(
    (e) => e.type === 'private' && !e.includeInHousehold && e.paidBy === 'partner'
  )

  const totalHousehold = householdExpenses.reduce((sum, e) => sum + e.amount, 0)
  const yourPrivateTotal = yourPrivateExpenses.reduce((sum, e) => sum + e.amount, 0)
  const partnerPrivateTotal = partnerPrivateExpenses.reduce((sum, e) => sum + e.amount, 0)

  // What each person should contribute to household expenses (proportional to income)
  const yourHouseholdShare = totalHousehold * yourProportion
  const partnerHouseholdShare = totalHousehold * partnerProportion

  // What each person actually paid for household expenses
  const yourHouseholdPaid = householdExpenses
    .filter((e) => e.paidBy === 'you')
    .reduce((sum, e) => sum + e.amount, 0)
  const partnerHouseholdPaid = householdExpenses
    .filter((e) => e.paidBy === 'partner')
    .reduce((sum, e) => sum + e.amount, 0)

  return {
    ...state,
    addExpense,
    removeExpense,
    updateExpense,
    setIncome,
    setNames,
    setCurrency,
    // Calculations
    yourProportion,
    partnerProportion,
    totalHousehold,
    yourPrivateTotal,
    partnerPrivateTotal,
    yourHouseholdShare,
    partnerHouseholdShare,
    yourHouseholdPaid,
    partnerHouseholdPaid,
    householdExpenses,
    yourPrivateExpenses,
    partnerPrivateExpenses,
  }
}
