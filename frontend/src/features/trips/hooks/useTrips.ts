import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripsApi, TripRequest, TripStatus } from '../api/tripsApi'

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filters: { status?: TripStatus; page?: number }) => [...tripKeys.lists(), filters] as const,
  detail: (id: string) => [...tripKeys.all, 'detail', id] as const,
}

export function useTrips(params?: { status?: TripStatus; page?: number; size?: number }) {
  return useQuery({
    queryKey: tripKeys.list({ status: params?.status, page: params?.page }),
    queryFn: () => tripsApi.getTrips(params),
  })
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => tripsApi.getTrip(id),
    enabled: !!id,
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TripRequest) => tripsApi.createTrip(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.lists() }),
  })
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TripRequest) => tripsApi.updateTrip(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.lists() })
      qc.invalidateQueries({ queryKey: tripKeys.detail(id) })
    },
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tripsApi.deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.lists() }),
  })
}
