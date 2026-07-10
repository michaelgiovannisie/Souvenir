import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { destinationsApi, DestinationRequest } from '../api/destinationsApi'
import { tripKeys } from '@/features/trips/hooks/useTrips'

export const destinationKeys = {
  all: ['destinations'] as const,
  byTrip: (tripId: string) => [...destinationKeys.all, 'trip', tripId] as const,
}

export function useTripDestinations(tripId: string) {
  return useQuery({
    queryKey: destinationKeys.byTrip(tripId),
    queryFn: () => destinationsApi.getByTrip(tripId),
    enabled: !!tripId,
  })
}

export function useAddDestination(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DestinationRequest) => destinationsApi.add(tripId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) })
      // Invalidate the trip itself so destinationCount updates
      qc.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

export function useUpdateDestination(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DestinationRequest }) =>
      destinationsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) })
    },
  })
}

export function useDeleteDestination(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => destinationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}
