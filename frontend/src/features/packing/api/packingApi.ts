import { api } from '@/lib/axios'

export type PackingCategory =
  | 'CLOTHES'
  | 'TOILETRIES'
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'HEALTH'
  | 'ACCESSORIES'
  | 'MISC'

export interface PackingItem {
  id: string
  tripId: string
  name: string
  category: PackingCategory | null
  quantity: number
  packed: boolean
  createdAt: string
}

export interface PackingItemRequest {
  name?: string
  category?: PackingCategory | null
  quantity?: number
  packed?: boolean
}

export const packingApi = {
  getByTrip: async (tripId: string): Promise<PackingItem[]> => {
    const { data } = await api.get(`/trips/${tripId}/packing`)
    return data.data
  },

  add: async (tripId: string, payload: PackingItemRequest): Promise<PackingItem> => {
    const { data } = await api.post(`/trips/${tripId}/packing`, payload)
    return data.data
  },

  update: async (itemId: string, payload: PackingItemRequest): Promise<PackingItem> => {
    const { data } = await api.patch(`/packing/${itemId}`, payload)
    return data.data
  },

  delete: async (itemId: string): Promise<void> => {
    await api.delete(`/packing/${itemId}`)
  },
}
