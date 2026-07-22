import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/searchApi'

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
