import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mementosApi, MementoRequest } from '../api/mementosApi'

export const mementoKeys = {
  all: ['mementos'] as const,
  byTrip: (tripId: string) => [...mementoKeys.all, 'trip', tripId] as const,
}

export function useMementos(tripId: string) {
  return useQuery({
    queryKey: mementoKeys.byTrip(tripId),
    queryFn: () => mementosApi.getByTrip(tripId),
    enabled: !!tripId,
  })
}

export function useAddMemento(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MementoRequest) => mementosApi.create(tripId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: mementoKeys.byTrip(tripId) }),
  })
}

export function useUpdateMemento(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MementoRequest }) =>
      mementosApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: mementoKeys.byTrip(tripId) }),
  })
}

export function useDeleteMemento(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mementosApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: mementoKeys.byTrip(tripId) }),
  })
}
