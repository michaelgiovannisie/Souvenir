import { api } from '@/lib/axios'

export type ExpenseCategory =
  | 'ACCOMMODATION'
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACTIVITIES'
  | 'SHOPPING'
  | 'OTHER'

export interface Expense {
  id: string
  tripId: string
  amount: number
  currency: string
  category: ExpenseCategory
  description: string | null
  expenseDate: string
  createdAt: string
}

export interface ExpenseRequest {
  amount: number
  currency?: string
  category?: ExpenseCategory
  description?: string
  expenseDate?: string
}

export const expensesApi = {
  getExpenses: async (tripId: string): Promise<Expense[]> => {
    const { data } = await api.get(`/trips/${tripId}/expenses`)
    return data.data
  },

  addExpense: async (tripId: string, payload: ExpenseRequest): Promise<Expense> => {
    const { data } = await api.post(`/trips/${tripId}/expenses`, payload)
    return data.data
  },

  updateExpense: async (expenseId: string, payload: Partial<ExpenseRequest>): Promise<Expense> => {
    const { data } = await api.patch(`/expenses/${expenseId}`, payload)
    return data.data
  },

  deleteExpense: async (expenseId: string): Promise<void> => {
    await api.delete(`/expenses/${expenseId}`)
  },
}
