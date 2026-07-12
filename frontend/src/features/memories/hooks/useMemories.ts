import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { memoriesApi, MemoryRequest } from '../api/memoriesApi'
import { tripKeys } from '@/features/trips/hooks/useTrips'

export const memoryKeys = {
  all: ['memories'] as const,
  byTrip: (tripId: string) => [...memoryKeys.all, 'trip', tripId] as const,
}

export function useTripMemories(tripId: string) {
  return useQuery({
    queryKey: memoryKeys.byTrip(tripId),
    queryFn: () => memoriesApi.getByTrip(tripId),
    enabled: !!tripId,
  })
}

export function useCreateMemory(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MemoryRequest) => memoriesApi.create(tripId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memoryKeys.byTrip(tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

export function useUpdateMemory(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MemoryRequest }) =>
      memoriesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memoryKeys.byTrip(tripId) })
    },
  })
}

export function useDeleteMemory(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => memoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memoryKeys.byTrip(tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}
