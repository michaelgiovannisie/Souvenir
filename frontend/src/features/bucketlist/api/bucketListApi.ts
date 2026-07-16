import { api } from '@/lib/axios'

export interface BucketListItem {
  id: string
  destinationName: string
  country: string
  notes: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

export interface BucketListRequest {
  destinationName: string
  country: string
  notes?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export const bucketListApi = {
  getAll: async (params?: { page?: number; size?: number }): Promise<PageResponse<BucketListItem>> => {
    const { data } = await api.get('/bucket-list', { params })
    return data.data
  },

  add: async (payload: BucketListRequest): Promise<BucketListItem> => {
    const { data } = await api.post('/bucket-list', payload)
    return data.data
  },

  toggleComplete: async (id: string): Promise<BucketListItem> => {
    const { data } = await api.patch(`/bucket-list/${id}/toggle`)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/bucket-list/${id}`)
  },
}
