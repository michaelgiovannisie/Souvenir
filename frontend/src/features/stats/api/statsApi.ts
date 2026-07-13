import { api } from '@/lib/axios'

export interface CountryCount {
  country: string
  count: number
}

export interface Stats {
  totalTrips: number
  completedTrips: number
  ongoingTrips: number
  plannedTrips: number
  totalDestinations: number
  uniqueCountries: number
  uniqueCities: number
  countriesVisited: string[]
  totalDaysTraveled: number
  longestTripDays: number
  longestTripTitle: string | null
  totalMemories: number
  totalPhotos: number
  mostVisitedCountry: string | null
  mostVisitedCountryCount: number
  topCountries: CountryCount[]
}

export const statsApi = {
  get: async (): Promise<Stats> => {
    const { data } = await api.get('/stats')
    return data.data
  },
}
