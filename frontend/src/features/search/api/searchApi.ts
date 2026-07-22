import { api } from '@/lib/axios'

export interface TripResult {
  id: string
  title: string
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED'
  coverPhotoUrl: string | null
}

export interface DestinationResult {
  id: string
  tripId: string
  tripTitle: string
  name: string
  country: string
  city: string | null
  type: string
}

export interface MemoryResult {
  id: string
  tripId: string
  tripTitle: string
  title: string
  mood: string | null
  memoryDate: string | null
}

export interface BucketListResult {
  id: string
  destinationName: string
  country: string
  completed: boolean
}

export interface SearchResponse {
  trips: TripResult[]
  destinations: DestinationResult[]
  memories: MemoryResult[]
  bucketList: BucketListResult[]
  totalResults: number
}

export const searchApi = {
  search: async (q: string): Promise<SearchResponse> => {
    const { data } = await api.get('/search', { params: { q } })
    return data.data
  },
}
