import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTrips } from '@/features/trips/hooks/useTrips'
import { TripCard } from '@/features/trips/components/TripCard'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import type { TripStatus } from '@/features/trips/api/tripsApi'
import { clsx } from 'clsx'

const filters: { label: string; value: TripStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Planned', value: 'PLANNED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
]

export function Dashboard() {
  const { user } = useAuthStore()
  const [statusFilter, setStatusFilter] = useState<TripStatus | undefined>(undefined)
  const { data, isLoading, isError } = useTrips({ status: statusFilter })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here are all your trips</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-1.5" />
          New Trip
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(value)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trips grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-gray-500">Failed to load trips. Please try again.</div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-6">Start documenting your adventures</p>
          <Button>
            <Plus className="w-4 h-4 mr-1.5" />
            Create your first trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.content.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
