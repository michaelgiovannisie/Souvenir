import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const aiApi = axios.create({
  baseURL: '/ai',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

aiApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface SuggestionsRequest {
  destination: string
  startDate?: string
  endDate?: string
  interests?: string[]
}

export interface PackingListRequest {
  destination: string
  startDate?: string
  endDate?: string
  tripType?: string
}

export interface ItineraryRequest {
  destination: string
  startDate?: string
  endDate?: string
  style?: string
}

export const aiApiClient = {
  getSuggestions: (data: SuggestionsRequest) =>
    aiApi.post<{ success: boolean; data: any }>('/suggestions', data),

  getPackingList: (data: PackingListRequest) =>
    aiApi.post<{ success: boolean; data: any }>('/packing-list', data),

  getItinerary: (data: ItineraryRequest) =>
    aiApi.post<{ success: boolean; data: any }>('/itinerary', data),

  health: () => aiApi.get('/health'),
}
