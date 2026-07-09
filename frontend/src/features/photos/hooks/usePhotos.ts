import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { photosApi } from '../api/photosApi'

export const photoKeys = {
  all: ['photos'] as const,
  byTrip: (tripId: string) => [...photoKeys.all, 'trip', tripId] as const,
}

export function useTripPhotos(tripId: string) {
  return useQuery({
    queryKey: photoKeys.byTrip(tripId),
    queryFn: () => photosApi.getTripPhotos(tripId),
    enabled: !!tripId,
  })
}

export function useDeletePhoto(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) => photosApi.deletePhoto(photoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: photoKeys.byTrip(tripId) }),
  })
}
