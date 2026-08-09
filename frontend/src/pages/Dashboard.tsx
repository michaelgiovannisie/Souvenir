import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2, Sparkles } from 'lucide-react'
import { useTrips } from '@/features/trips/hooks/useTrips'
import { useGenerateSampleTrip } from '@/features/trips/hooks/useGenerateSampleTrip'
import { TripCard } from '@/features/trips/components/TripCard'
import { OnThisDayCard } from '@/features/memories/components/OnThisDayCard'
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
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<TripStatus | undefined>(undefined)
  const { data, isLoading, isError } = useTrips({ status: statusFilter })
  const { mutate: generate, isPending: isGenerating } = useGenerateSampleTrip()

  function handleGenerate() {
    generate(undefined, {
      onSuccess: (trip) => navigate(`/trips/${trip.id}`),
    })
  }

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

        <div className="flex items-center gap-2">
          {/* Sample trip generator */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            title="Generate a random sample trip"
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
              isGenerating
                ? 'border-brand-200 text-brand-400 bg-brand-50 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50'
            )}
          >
            {isGenerating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />
            }
            <span className="hidden sm:inline">
              {isGenerating ? 'Generating…' : 'Surprise me'}
            </span>
          </button>

          <Button>
            <Plus className="w-4 h-4 mr-1.5" />
            New Trip
          </Button>
        </div>
      </div>

      {/* On this day */}
      <OnThisDayCard />

      {/* Status filter tabs */}
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

      {/* Trip grid */}
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button>
              <Plus className="w-4 h-4 mr-1.5" />
              Create your first trip
            </Button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                isGenerating
                  ? 'border-brand-200 text-brand-400 bg-brand-50 cursor-not-allowed'
                  : 'border-brand-300 text-brand-700 bg-brand-50 hover:bg-brand-100'
              )}
            >
              {isGenerating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />
              }
              {isGenerating ? 'Generating…' : 'Or try a sample trip'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Generating overlay hint */}
          {isGenerating && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Creating your sample trip with destinations and memories…</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.content.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
