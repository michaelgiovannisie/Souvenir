import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Camera, BookOpen, Clock, ImageOff, Package, Download, StickyNote, Copy, Wallet } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useTrip, useSetCoverPhoto, useRemoveCoverPhoto, useDuplicateTrip } from '@/features/trips/hooks/useTrips'
import { useTripPhotos } from '@/features/photos/hooks/usePhotos'
import { PhotoUploader } from '@/features/photos/components/PhotoUploader'
import { PhotoGallery } from '@/features/photos/components/PhotoGallery'
import { DestinationsTab } from '@/features/destinations/components/DestinationsTab'
import { MemoriesTab } from '@/features/memories/components/MemoriesTab'
import { PackingListTab } from '@/features/packing/components/PackingListTab'
import { usePacking } from '@/features/packing/hooks/usePacking'
import { NotesTab } from '@/features/trips/components/NotesTab'
import { ExpensesTab } from '@/features/expenses/components/ExpensesTab'
import { useExpenses } from '@/features/expenses/hooks/useExpenses'

type Tab = 'photos' | 'destinations' | 'memories' | 'packing' | 'notes' | 'expenses'

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('photos')
  const [showUploader, setShowUploader] = useState(false)

  const { data: trip, isLoading: tripLoading } = useTrip(id!)
  const { data: photos = [], isLoading: photosLoading } = useTripPhotos(id!)
  const { mutate: setCover, isPending: isSettingCover } = useSetCoverPhoto(id!)
  const { mutate: removeCover, isPending: isRemovingCover } = useRemoveCoverPhoto(id!)
  const { data: packingItems = [] } = usePacking(id!)
  const { data: expenses = [] } = useExpenses(id!)
  const { mutate: duplicate, isPending: isDuplicating } = useDuplicateTrip()

  if (tripLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-2xl" />
        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center py-24 text-gray-400 dark:text-gray-500">
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
    { key: 'photos',       label: 'Photos',   icon: Camera,   count: trip.photoCount },
    { key: 'destinations', label: 'Places',   icon: MapPin,   count: trip.destinationCount },
    { key: 'memories',     label: 'Memories', icon: BookOpen, count: trip.memoryCount },
    { key: 'packing',      label: 'Packing',  icon: Package,   count: packingItems.length || undefined },
    { key: 'notes',        label: 'Notes',    icon: StickyNote, count: trip.notes ? 1 : undefined },
    { key: 'expenses',     label: 'Expenses', icon: Wallet,     count: expenses.length || undefined },
  ]

  return (
    <div className="space-y-6">
      {/* Back link + export */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All trips
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => duplicate(id!, { onSuccess: (t) => navigate(`/trips/${t.id}`) })}
            disabled={isDuplicating}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
            title="Duplicate trip"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{isDuplicating ? 'Duplicating…' : 'Duplicate'}</span>
          </button>
          <a
            href={`/trips/${id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 transition-colors"
            title="Export as PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </a>
        </div>
      </div>

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

            {/* Remove cover button — only visible when a cover is set */}
            {trip.coverPhotoUrl && (
              <button
                onClick={() => removeCover()}
                disabled={isRemovingCover}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                title="Remove cover photo"
              >
                <ImageOff className="w-3.5 h-3.5" />
                {isRemovingCover ? 'Removing…' : 'Remove cover'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{trip.description}</p>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:border-gray-600'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span
                  className={clsx(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </h2>
            <button
              onClick={() => setShowUploader((v) => !v)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                showUploader
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              )}
            >
              <Camera className="w-4 h-4" />
              {showUploader ? 'Hide uploader' : 'Upload photos'}
            </button>
          </div>

          {/* Uploader */}
          {showUploader && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <PhotoUploader tripId={id!} />
            </div>
          )}

          {/* Gallery */}
          {photosLoading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-xl bg-gray-200 dark:bg-gray-600 animate-pulse"
                  style={{ height: `${120 + (i % 3) * 60}px` }}
                />
              ))}
            </div>
          ) : (
            <PhotoGallery
            tripId={id!}
            photos={photos}
            currentCoverUrl={trip.coverPhotoUrl}
            onSetCover={(photoId) => setCover(photoId)}
            isSettingCover={isSettingCover}
          />
          )}
        </div>
      )}

      {activeTab === 'destinations' && (
        <DestinationsTab tripId={id!} />
      )}

      {activeTab === 'memories' && (
        <MemoriesTab tripId={id!} />
      )}

      {activeTab === 'packing' && (
        <PackingListTab tripId={id!} />
      )}

      {activeTab === 'notes' && (
        <NotesTab tripId={id!} initialNotes={trip.notes} />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab tripId={id!} />
      )}
    </div>
  )
}
