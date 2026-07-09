import { api } from '@/lib/axios'

export type TripStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED'

export interface Trip {
  id: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  coverPhotoUrl: string | null
  status: TripStatus
  destinationCount: number
  memoryCount: number
  photoCount: number
  createdAt: string
  updatedAt: string
}

export interface TripRequest {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  status?: TripStatus
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export const tripsApi = {
  getTrips: async (params?: { status?: TripStatus; page?: number; size?: number }): Promise<PageResponse<Trip>> => {
    const { data } = await api.get('/trips', { params })
    return data.data
  },

  getTrip: async (id: string): Promise<Trip> => {
    const { data } = await api.get(`/trips/${id}`)
    return data.data
  },

  createTrip: async (payload: TripRequest): Promise<Trip> => {
    const { data } = await api.post('/trips', payload)
    return data.data
  },

  updateTrip: async (id: string, payload: TripRequest): Promise<Trip> => {
    const { data } = await api.put(`/trips/${id}`, payload)
    return data.data
  },

  deleteTrip: async (id: string): Promise<void> => {
    await api.delete(`/trips/${id}`)
  },
}
