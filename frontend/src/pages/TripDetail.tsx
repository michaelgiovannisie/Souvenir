import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Camera, BookOpen, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useTrip } from '@/features/trips/hooks/useTrips'
import { useTripPhotos } from '@/features/photos/hooks/usePhotos'
import { PhotoUploader } from '@/features/photos/components/PhotoUploader'
import { PhotoGallery } from '@/features/photos/components/PhotoGallery'

type Tab = 'photos' | 'destinations' | 'memories'

const statusColors = {
  PLANNED: 'bg-yellow-100 text-yellow-700',
  ONGOING: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const statusLabels = {
  PLANNED: 'Planned',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
}

export function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('photos')
  const [showUploader, setShowUploader] = useState(false)

  const { data: trip, isLoading: tripLoading } = useTrip(id!)
  const { data: photos = [], isLoading: photosLoading } = useTripPhotos(id!)

  if (tripLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p>Trip not found.</p>
        <Link to="/dashboard" className="text-brand-600 hover:underline text-sm mt-2 block">
          Back to trips
        </Link>
      </div>
    )
  }

  const duration =
    trip.startDate && trip.endDate
      ? dayjs(trip.endDate).diff(dayjs(trip.startDate), 'day') + 1
      : null

  const tabs: { key: Tab; label: string; icon: typeof Camera; count?: number }[] = [
    { key: 'photos', label: 'Photos', icon: Camera, count: trip.photoCount },
    { key: 'destinations', label: 'Places', icon: MapPin, count: trip.destinationCount },
    { key: 'memories', label: 'Memories', icon: BookOpen, count: trip.memoryCount },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All trips
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-56 bg-gradient-to-br from-brand-400 to-brand-700">
        {trip.coverPhotoUrl && (
          <img
            src={trip.coverPhotoUrl}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span
                className={clsx(
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2',
                  statusColors[trip.status]
                )}
              >
                {statusLabels[trip.status]}
              </span>
              <h1 className="text-2xl font-bold text-white">{trip.title}</h1>
              <div className="flex items-center gap-4 mt-1.5 text-white/70 text-sm">
                {(trip.startDate || trip.endDate) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.startDate ? dayjs(trip.startDate).format('MMM D, YYYY') : '?'}
                    {trip.endDate ? ` — ${dayjs(trip.endDate).format('MMM D, YYYY')}` : ''}
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {duration} {duration === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <p className="text-gray-600 text-sm leading-relaxed">{trip.description}</p>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span
                  className={clsx(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Upload toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </h2>
            <button
              onClick={() => setShowUploader((v) => !v)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                showUploader
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              )}
            >
              <Camera className="w-4 h-4" />
              {showUploader ? 'Hide uploader' : 'Upload photos'}
            </button>
          </div>

          {/* Uploader */}
          {showUploader && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <PhotoUploader tripId={id!} />
            </div>
          )}

          {/* Gallery */}
          {photosLoading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-xl bg-gray-200 animate-pulse"
                  style={{ height: `${120 + (i % 3) * 60}px` }}
                />
              ))}
            </div>
          ) : (
            <PhotoGallery tripId={id!} photos={photos} />
          )}
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📍</div>
          <p className="text-sm font-medium text-gray-500">Destinations — coming soon</p>
        </div>
      )}

      {activeTab === 'memories' && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📖</div>
          <p className="text-sm font-medium text-gray-500">Memories — coming soon</p>
        </div>
      )}
    </div>
  )
}
