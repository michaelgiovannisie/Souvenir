import { api } from '@/lib/axios'

export type DestinationType =
  | 'CITY'
  | 'COUNTRY'
  | 'NATIONAL_PARK'
  | 'LANDMARK'
  | 'BEACH'
  | 'MOUNTAIN'
  | 'OTHER'

export interface Destination {
  id: string
  tripId: string
  name: string
  country: string
  stateProvince: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  type: DestinationType
  arrivalDate: string | null
  departureDate: string | null
  notes: string | null
  rating: number | null
  createdAt: string
}

export interface DestinationRequest {
  name: string
  country: string
  stateProvince?: string
  city?: string
  latitude?: number | null
  longitude?: number | null
  type: DestinationType
  arrivalDate?: string | null
  departureDate?: string | null
  notes?: string
  rating?: number | null
}

export const destinationsApi = {
  getByTrip: async (tripId: string): Promise<Destination[]> => {
    const { data } = await api.get(`/trips/${tripId}/destinations`)
    return data.data
  },

  add: async (tripId: string, payload: DestinationRequest): Promise<Destination> => {
    const { data } = await api.post(`/trips/${tripId}/destinations`, payload)
    return data.data
  },

  update: async (id: string, payload: DestinationRequest): Promise<Destination> => {
    const { data } = await api.put(`/destinations/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/destinations/${id}`)
  },
}
