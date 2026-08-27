import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expensesApi, ExpenseRequest } from '../api/expensesApi'

export const expenseKeys = {
  all: ['expenses'] as const,
  byTrip: (tripId: string) => [...expenseKeys.all, 'trip', tripId] as const,
}

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: expenseKeys.byTrip(tripId),
    queryFn: () => expensesApi.getExpenses(tripId),
    enabled: !!tripId,
  })
}

export function useAddExpense(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExpenseRequest) => expensesApi.addExpense(tripId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.byTrip(tripId) }),
  })
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.deleteExpense(expenseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.byTrip(tripId) }),
  })
}
