'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { addExpense as addExpenseApi, updateExpense as updateExpenseApi, deleteExpense as deleteExpenseApi } from '@/hooks/useExpenses'
import { updateMember as updateMemberApi } from '@/hooks/useHousehold'
import type { Expense, Household, HouseholdMember } from '@/types'

type ExpenseAdd = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
type ExpenseUpdate = Partial<Omit<Expense, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>>
type MemberUpdate = { displayName?: string; income?: number }

interface PreviewModeContextValue {
  expenses: Expense[]
  members: HouseholdMember[]
  household: Household | null
  currentUserId: string | null

  isActive: boolean
  pendingChangeCount: number
  simulatedIncomeCount: number
  isSaving: boolean
  saveError: string | null

  enter: () => void
  save: () => Promise<void>
  discard: () => void

  addExpense: (expense: ExpenseAdd) => Promise<void>
  updateExpense: (id: string, updates: ExpenseUpdate) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  updateOwnProfile: (memberId: string, updates: MemberUpdate) => Promise<void>
  simulateMemberIncome: (memberId: string, income: number) => void
}

const PreviewModeContext = createContext<PreviewModeContextValue | undefined>(undefined)

interface PreviewModeProviderProps {
  baseExpenses: Expense[]
  baseMembers: HouseholdMember[]
  baseHousehold: Household | null
  currentUserId: string | null
  refetchExpenses: () => void
  refetchHousehold: () => void
  children: React.ReactNode
}

const DRAFT_ID_PREFIX = 'draft-'

function isDraftId(id: string): boolean {
  return id.startsWith(DRAFT_ID_PREFIX)
}

export function PreviewModeProvider({
  baseExpenses,
  baseMembers,
  baseHousehold,
  currentUserId,
  refetchExpenses,
  refetchHousehold,
  children,
}: PreviewModeProviderProps) {
  const [isActive, setIsActive] = useState(false)
  const [pendingAdds, setPendingAdds] = useState<Expense[]>([])
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set())
  const [pendingEdits, setPendingEdits] = useState<Map<string, ExpenseUpdate>>(new Map())
  const [pendingOwnMemberPatch, setPendingOwnMemberPatch] = useState<{ memberId: string; updates: MemberUpdate } | null>(null)
  const [simulatedMemberIncomes, setSimulatedMemberIncomes] = useState<Map<string, number>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const clearBuffer = useCallback(() => {
    setPendingAdds([])
    setPendingDeletes(new Set())
    setPendingEdits(new Map())
    setPendingOwnMemberPatch(null)
    setSimulatedMemberIncomes(new Map())
    setSaveError(null)
  }, [])

  const expenses = useMemo<Expense[]>(() => {
    if (!isActive) return baseExpenses
    const surviving = baseExpenses
      .filter((e) => !pendingDeletes.has(e.id))
      .map((e) => {
        const edit = pendingEdits.get(e.id)
        return edit ? { ...e, ...edit } : e
      })
    return [...pendingAdds, ...surviving]
  }, [isActive, baseExpenses, pendingAdds, pendingDeletes, pendingEdits])

  const members = useMemo<HouseholdMember[]>(() => {
    if (!isActive) return baseMembers
    return baseMembers.map((m) => {
      let next = m
      const simulated = simulatedMemberIncomes.get(m.id)
      if (simulated !== undefined) next = { ...next, income: simulated }
      if (pendingOwnMemberPatch && pendingOwnMemberPatch.memberId === m.id) {
        const { displayName, income } = pendingOwnMemberPatch.updates
        next = {
          ...next,
          ...(displayName !== undefined ? { displayName } : {}),
          ...(income !== undefined ? { income } : {}),
        }
      }
      return next
    })
  }, [isActive, baseMembers, simulatedMemberIncomes, pendingOwnMemberPatch])

  const pendingChangeCount =
    pendingAdds.length +
    pendingDeletes.size +
    pendingEdits.size +
    (pendingOwnMemberPatch ? 1 : 0)

  const simulatedIncomeCount = simulatedMemberIncomes.size

  const enter = useCallback(() => {
    clearBuffer()
    setIsActive(true)
  }, [clearBuffer])

  const discard = useCallback(() => {
    clearBuffer()
    setIsActive(false)
  }, [clearBuffer])

  const addExpense = useCallback<PreviewModeContextValue['addExpense']>(
    async (expense) => {
      if (!isActive) {
        await addExpenseApi(expense)
        refetchExpenses()
        return
      }
      const now = new Date().toISOString()
      const draft: Expense = {
        ...expense,
        id: `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`,
        createdAt: now,
        updatedAt: now,
      }
      setPendingAdds((prev) => [draft, ...prev])
    },
    [isActive, refetchExpenses]
  )

  const updateExpense = useCallback<PreviewModeContextValue['updateExpense']>(
    async (id, updates) => {
      if (!isActive) {
        await updateExpenseApi(id, updates)
        refetchExpenses()
        return
      }
      if (isDraftId(id)) {
        setPendingAdds((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
        return
      }
      setPendingEdits((prev) => {
        const next = new Map(prev)
        next.set(id, { ...next.get(id), ...updates })
        return next
      })
    },
    [isActive, refetchExpenses]
  )

  const deleteExpense = useCallback<PreviewModeContextValue['deleteExpense']>(
    async (id) => {
      if (!isActive) {
        await deleteExpenseApi(id)
        refetchExpenses()
        return
      }
      if (isDraftId(id)) {
        setPendingAdds((prev) => prev.filter((e) => e.id !== id))
        return
      }
      setPendingEdits((prev) => {
        if (!prev.has(id)) return prev
        const next = new Map(prev)
        next.delete(id)
        return next
      })
      setPendingDeletes((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    },
    [isActive, refetchExpenses]
  )

  const updateOwnProfile = useCallback<PreviewModeContextValue['updateOwnProfile']>(
    async (memberId, updates) => {
      if (!isActive) {
        await updateMemberApi(memberId, updates)
        refetchHousehold()
        return
      }
      setPendingOwnMemberPatch((prev) => ({
        memberId,
        updates: { ...prev?.updates, ...updates },
      }))
    },
    [isActive, refetchHousehold]
  )

  const simulateMemberIncome = useCallback<PreviewModeContextValue['simulateMemberIncome']>(
    (memberId, income) => {
      if (!isActive) return
      if (currentUserId) {
        const ownMember = baseMembers.find((m) => m.userId === currentUserId)
        if (ownMember && ownMember.id === memberId) return
      }
      setSimulatedMemberIncomes((prev) => {
        const next = new Map(prev)
        next.set(memberId, income)
        return next
      })
    },
    [isActive, currentUserId, baseMembers]
  )

  const save = useCallback<PreviewModeContextValue['save']>(async () => {
    if (!isActive) return
    setIsSaving(true)
    setSaveError(null)
    try {
      for (const id of pendingDeletes) {
        await deleteExpenseApi(id)
      }
      setPendingDeletes(new Set())

      for (const [id, updates] of pendingEdits) {
        if (pendingDeletes.has(id)) continue
        await updateExpenseApi(id, updates)
      }
      setPendingEdits(new Map())

      for (const draft of pendingAdds) {
        const { id: _draftId, createdAt: _c, updatedAt: _u, ...rest } = draft
        void _draftId; void _c; void _u
        await addExpenseApi(rest)
      }
      setPendingAdds([])

      if (pendingOwnMemberPatch) {
        await updateMemberApi(pendingOwnMemberPatch.memberId, pendingOwnMemberPatch.updates)
        setPendingOwnMemberPatch(null)
      }

      setSimulatedMemberIncomes(new Map())
      setIsActive(false)
      refetchExpenses()
      refetchHousehold()
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      setSaveError(message)
      refetchExpenses()
      refetchHousehold()
    } finally {
      setIsSaving(false)
    }
  }, [isActive, pendingAdds, pendingDeletes, pendingEdits, pendingOwnMemberPatch, refetchExpenses, refetchHousehold])

  const value: PreviewModeContextValue = {
    expenses,
    members,
    household: baseHousehold,
    currentUserId,
    isActive,
    pendingChangeCount,
    simulatedIncomeCount,
    isSaving,
    saveError,
    enter,
    save,
    discard,
    addExpense,
    updateExpense,
    deleteExpense,
    updateOwnProfile,
    simulateMemberIncome,
  }

  return <PreviewModeContext.Provider value={value}>{children}</PreviewModeContext.Provider>
}

export function usePreviewMode() {
  const ctx = useContext(PreviewModeContext)
  if (!ctx) throw new Error('usePreviewMode must be used within a PreviewModeProvider')
  return ctx
}
