import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bucketListApi, BucketListRequest } from '../api/bucketListApi'

export const bucketListKeys = {
  all: ['bucket-list'] as const,
  list: () => [...bucketListKeys.all, 'list'] as const,
}

export function useBucketList() {
  return useQuery({
    queryKey: bucketListKeys.list(),
    queryFn: () => bucketListApi.getAll({ size: 200 }), // fetch all, filter client-side
  })
}

export function useAddBucketListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BucketListRequest) => bucketListApi.add(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: bucketListKeys.list() }),
  })
}

export function useToggleBucketListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bucketListApi.toggleComplete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bucketListKeys.list() }),
  })
}

export function useDeleteBucketListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bucketListApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bucketListKeys.list() }),
  })
}
