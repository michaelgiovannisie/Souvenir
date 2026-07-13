import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/statsApi'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
    staleTime: 1000 * 60 * 2, // 2 minutes — stats don't change that often
  })
}
