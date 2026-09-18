import { api } from '@/lib/axios'
import type { ExpenseCategory } from './expensesApi'

export interface Budget {
  id: string
  category: ExpenseCategory
  amount: number
  currency: string
}

export interface BudgetEntry {
  category: ExpenseCategory
  amount: number
  currency: string
}

export interface BudgetRequest {
  budgets: BudgetEntry[]
}

export const budgetsApi = {
  getBudgets: async (tripId: string): Promise<Budget[]> => {
    const { data } = await api.get(`/trips/${tripId}/budgets`)
    return data.data
  },

  saveBudgets: async (tripId: string, payload: BudgetRequest): Promise<Budget[]> => {
    const { data } = await api.put(`/trips/${tripId}/budgets`, payload)
    return data.data
  },
}
