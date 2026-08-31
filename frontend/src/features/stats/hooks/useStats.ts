import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/statsApi'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
    staleTime: 1000 * 60 * 2,
  })
}

export function useYearInReview(year: number) {
  return useQuery({
    queryKey: ['stats', 'year-in-review', year],
    queryFn: () => statsApi.getYearInReview(year),
    staleTime: 1000 * 60 * 5,
  })
}
