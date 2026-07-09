import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { TravelMap, MapPin } from '@/features/map/components/TravelMap'

export function MapPage() {
  const { data: pins = [], isLoading } = useQuery<MapPin[]>({
    queryKey: ['map-pins'],
    queryFn: async () => {
      // Fetch all trips, then collect destinations with coordinates
      const { data: tripsData } = await api.get('/trips', { params: { size: 100 } })
      const trips = tripsData.data.content

      const allPins: MapPin[] = []
      for (const trip of trips) {
        const { data: destData } = await api.get(`/trips/${trip.id}/destinations`)
        const destinations = destData.data
        for (const dest of destinations) {
          if (dest.latitude && dest.longitude) {
            allPins.push({
              id: dest.id,
              tripId: trip.id,
              tripTitle: trip.title,
              name: dest.name,
              latitude: dest.latitude,
              longitude: dest.longitude,
              country: dest.country,
            })
          }
        }
      }
      return allPins
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Map</h1>
        <p className="text-gray-500 mt-1">
          {pins.length} {pins.length === 1 ? 'place' : 'places'} visited
        </p>
      </div>

      {isLoading ? (
        <div className="h-[500px] bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <TravelMap pins={pins} height="600px" />
      )}
    </div>
  )
}
