import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { budgetsApi, BudgetRequest } from '../api/budgetsApi'

export const budgetKeys = {
  byTrip: (tripId: string) => ['budgets', 'trip', tripId] as const,
}

export function useGetBudgets(tripId: string) {
  return useQuery({
    queryKey: budgetKeys.byTrip(tripId),
    queryFn: () => budgetsApi.getBudgets(tripId),
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSaveBudgets(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BudgetRequest) => budgetsApi.saveBudgets(tripId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.byTrip(tripId) }),
  })
}
