import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { tripsApi } from '../api/tripsApi'
import { destinationsApi } from '@/features/destinations/api/destinationsApi'
import { memoriesApi } from '@/features/memories/api/memoriesApi'
import { pickRandomSampleTrip, resolveDates } from '../data/sampleTrips'
import { tripKeys } from './useTrips'
import type { MemoryMood } from '@/features/memories/api/memoriesApi'

export function useGenerateSampleTrip() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const template = pickRandomSampleTrip()
      const { start, end } = resolveDates(template)
      const startDay = dayjs(start)

      // 1. Create trip
      const trip = await tripsApi.createTrip({
        title: template.title,
        description: template.description,
        startDate: start,
        endDate: end,
        status: template.status,
      })

      // 2. Create destinations (sequential — each needs the trip id)
      for (const dest of template.destinations) {
        await destinationsApi.add(trip.id, {
          name: dest.name,
          country: dest.country,
          city: dest.city,
          type: dest.type,
          latitude: dest.latitude,
          longitude: dest.longitude,
          rating: dest.rating,
          notes: dest.notes,
          arrivalDate: startDay.add(dest.arrivalOffset, 'day').format('YYYY-MM-DD'),
          departureDate: startDay.add(dest.departureOffset, 'day').format('YYYY-MM-DD'),
        })
      }

      // 3. Create memories
      for (const mem of template.memories) {
        await memoriesApi.create(trip.id, {
          title: mem.title,
          journalEntry: mem.journalEntry,
          mood: mem.mood as MemoryMood,
          tags: mem.tags,
          memoryDate: startDay.add(mem.dateOffset, 'day').format('YYYY-MM-DD'),
        })
      }

      return trip
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.lists() })
    },
  })
}
