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

export interface TripSummary {
  id: string
  title: string
  startDate: string | null
  endDate: string | null
  coverPhotoUrl: string | null
  status: string
  destinationCount: number
}

export interface YearInReview {
  year: number
  tripsCount: number
  daysAbroad: number
  memoriesCount: number
  photosCount: number
  countriesCount: number
  citiesCount: number
  countriesVisited: string[]
  topCountry: string | null
  monthlyActivity: number[]      // length 12, 0-indexed
  moodBreakdown: Record<string, number>
  expenseTotals: Record<string, number>
  tripSummaries: TripSummary[]
}

export const statsApi = {
  get: async (): Promise<Stats> => {
    const { data } = await api.get('/stats')
    return data.data
  },

  getYearInReview: async (year: number): Promise<YearInReview> => {
    const { data } = await api.get('/stats/year-in-review', { params: { year } })
    return data.data
  },
}
