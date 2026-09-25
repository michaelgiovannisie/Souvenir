import { api } from '@/lib/axios'

export type MementoType = 'PERSON' | 'SOUVENIR'

export interface Memento {
  id: string
  type: MementoType
  name: string
  description: string | null
  location: string | null
  createdAt: string
}

export interface MementoRequest {
  type: MementoType
  name: string
  description?: string
  location?: string
}

export const mementosApi = {
  getByTrip: async (tripId: string): Promise<Memento[]> => {
    const { data } = await api.get(`/trips/${tripId}/mementos`)
    return data.data
  },

  create: async (tripId: string, payload: MementoRequest): Promise<Memento> => {
    const { data } = await api.post(`/trips/${tripId}/mementos`, payload)
    return data.data
  },

  update: async (id: string, payload: MementoRequest): Promise<Memento> => {
    const { data } = await api.put(`/mementos/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/mementos/${id}`)
  },
}
