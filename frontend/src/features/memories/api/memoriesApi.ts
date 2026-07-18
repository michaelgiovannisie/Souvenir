import { api } from '@/lib/axios'

export interface Memory {
  id: string
  tripId: string
  tripTitle: string
  destinationId: string | null
  destinationName: string | null
  destinationCountry: string | null
  title: string
  journalEntry: string | null
  memoryDate: string | null
  photoCount: number
  createdAt: string
  updatedAt: string
}

export interface MemoryRequest {
  title: string
  journalEntry?: string
  memoryDate?: string | null
  destinationId?: string | null
}

export const memoriesApi = {
  getAll: async (): Promise<Memory[]> => {
    const { data } = await api.get('/memories')
    return data.data
  },

  getByTrip: async (tripId: string): Promise<Memory[]> => {
    const { data } = await api.get(`/trips/${tripId}/memories`)
    return data.data
  },

  create: async (tripId: string, payload: MemoryRequest): Promise<Memory> => {
    const { data } = await api.post(`/trips/${tripId}/memories`, payload)
    return data.data
  },

  update: async (id: string, payload: MemoryRequest): Promise<Memory> => {
    const { data } = await api.put(`/memories/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/memories/${id}`)
  },
}
