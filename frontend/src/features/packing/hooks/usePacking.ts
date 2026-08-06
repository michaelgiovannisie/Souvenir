import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { packingApi, PackingItemRequest } from '../api/packingApi'

export const packingKeys = {
  all: ['packing'] as const,
  byTrip: (tripId: string) => [...packingKeys.all, 'trip', tripId] as const,
}

export function usePacking(tripId: string) {
  return useQuery({
    queryKey: packingKeys.byTrip(tripId),
    queryFn: () => packingApi.getByTrip(tripId),
    enabled: !!tripId,
  })
}

export function useAddPackingItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PackingItemRequest) => packingApi.add(tripId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: packingKeys.byTrip(tripId) }),
  })
}

export function useUpdatePackingItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: PackingItemRequest }) =>
      packingApi.update(itemId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: packingKeys.byTrip(tripId) }),
  })
}

export function useDeletePackingItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => packingApi.delete(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: packingKeys.byTrip(tripId) }),
  })
}
