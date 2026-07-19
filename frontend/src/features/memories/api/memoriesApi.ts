import { api } from '@/lib/axios'

export type MemoryMood =
  | 'HAPPY' | 'EXCITED' | 'PEACEFUL' | 'EMOTIONAL'
  | 'TIRED' | 'ADVENTUROUS' | 'FUNNY' | 'ROMANTIC'
  | 'GRATEFUL' | 'NOSTALGIC'

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
  mood: MemoryMood | null
  tags: string[]
  photoCount: number
  createdAt: string
  updatedAt: string
}

export interface MemoryRequest {
  title: string
  journalEntry?: string
  memoryDate?: string | null
  destinationId?: string | null
  mood?: MemoryMood | null
  tags?: string[]
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
