import { useState } from 'react'
import { MapPin, BookOpen, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useTripDestinations } from '@/features/destinations/hooks/useDestinations'
import { useTripMemories } from '@/features/memories/hooks/useMemories'
import { useTripPhotos } from '@/features/photos/hooks/usePhotos'
import type { Destination, DestinationType } from '@/features/destinations/api/destinationsApi'
import type { Memory, MemoryMood } from '@/features/memories/api/memoriesApi'
import type { Photo } from '@/features/photos/api/photosApi'

// ── Metadata maps ─────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<DestinationType, string> = {
  CITY: '🏙️',
  COUNTRY: '🌍',
  NATIONAL_PARK: '🌲',
  LANDMARK: '🗼',
  BEACH: '🏖️',
  MOUNTAIN: '⛰️',
  OTHER: '📍',
}

const MOOD_META: Record<MemoryMood, { emoji: string; label: string }> = {
  HAPPY:       { emoji: '😊', label: 'Happy' },
  EXCITED:     { emoji: '🤩', label: 'Excited' },
  PEACEFUL:    { emoji: '😌', label: 'Peaceful' },
  EMOTIONAL:   { emoji: '🥹', label: 'Emotional' },
  TIRED:       { emoji: '😴', label: 'Tired' },
  ADVENTUROUS: { emoji: '🧗', label: 'Adventurous' },
  FUNNY:       { emoji: '😄', label: 'Funny' },
  ROMANTIC:    { emoji: '🥰', label: 'Romantic' },
  GRATEFUL:    { emoji: '🙏', label: 'Grateful' },
  NOSTALGIC:   { emoji: '🌅', label: 'Nostalgic' },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  type: 'arrival' | 'departure' | 'memory' | 'photo-strip'
  destination?: Destination
  memory?: Memory
  photos?: Photo[]
}

interface TimelineDay {
  date: string           // YYYY-MM-DD
  dayNumber: number | null
  events: TimelineEvent[]
}

// ── Photo lightbox ────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, onClose }: { photos: Photo[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex)
  const photo = photos[index]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X className="w-6 h-6" />
      </button>
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex(i => i - 1) }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 rounded-full p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex(i => i + 1) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 rounded-full p-2"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
      <div onClick={e => e.stopPropagation()} className="max-w-3xl max-h-[85vh] flex flex-col items-center gap-3">
        <img
          src={photo.cloudinaryUrl}
          alt={photo.caption ?? ''}
          className="max-h-[75vh] max-w-full object-contain rounded-xl"
        />
        {photo.caption && (
          <p className="text-white/70 text-sm text-center">{photo.caption}</p>
        )}
        <p className="text-white/40 text-xs">{index + 1} / {photos.length}</p>
      </div>
    </div>
  )
}

// ── Event cards ───────────────────────────────────────────────────────────────

function DestinationEvent({ d, kind }: { d: Destination; kind: 'arrival' | 'departure' }) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl">
      <span className="text-xl leading-none mt-0.5">{TYPE_EMOJI[d.type]}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-semibold',
            kind === 'arrival'
              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          )}>
            {kind === 'arrival' ? '→ Arrived' : '← Departed'}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{d.name}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {[d.city, d.stateProvince, d.country].filter(Boolean).join(', ')}
          </span>
        </div>
        {d.notes && kind === 'arrival' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{d.notes}</p>
        )}
      </div>
    </div>
  )
}

function MemoryEvent({ m }: { m: Memory }) {
  const mood = m.mood ? MOOD_META[m.mood] : null

  return (
    <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</span>
        </div>
        {mood && (
          <span className="text-base flex-shrink-0" title={mood.label}>{mood.emoji}</span>
        )}
      </div>
      {m.destinationName && (
        <div className="flex items-center gap-1 mt-1 ml-6">
          <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{m.destinationName}</span>
        </div>
      )}
      {m.journalEntry && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 ml-6 line-clamp-3 leading-relaxed">
          {m.journalEntry}
        </p>
      )}
      {m.tags && m.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-6">
          {m.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoStrip({ photos, onPhotoClick }: { photos: Photo[]; onPhotoClick: (i: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Camera className="w-3.5 h-3.5" />
        <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => onPhotoClick(i)}
            className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <img
              src={photo.cloudinaryUrl}
              alt={photo.caption ?? ''}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Day block ─────────────────────────────────────────────────────────────────

function DayBlock({
  day,
  isLast,
  onPhotoClick,
}: {
  day: TimelineDay
  isLast: boolean
  onPhotoClick: (photos: Photo[], index: number) => void
}) {
  const d = dayjs(day.date)

  return (
    <div className="flex gap-4">
      {/* Timeline gutter */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        {/* Dot */}
        <div className="w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white dark:ring-gray-900 flex-shrink-0 mt-1" />
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 bg-gray-200 dark:bg-gray-700 min-h-[2rem]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        {/* Day header */}
        <div className="flex items-baseline gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {d.format('MMM D, YYYY')}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{d.format('dddd')}</span>
          {day.dayNumber !== null && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              Day {day.dayNumber}
            </span>
          )}
        </div>

        {/* Events */}
        <div className="space-y-3">
          {day.events.map((event, i) => {
            if (event.type === 'arrival' || event.type === 'departure') {
              return <DestinationEvent key={i} d={event.destination!} kind={event.type} />
            }
            if (event.type === 'memory') {
              return <MemoryEvent key={i} m={event.memory!} />
            }
            if (event.type === 'photo-strip') {
              return (
                <PhotoStrip
                  key={i}
                  photos={event.photos!}
                  onPhotoClick={(idx) => onPhotoClick(event.photos!, idx)}
                />
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  tripId: string
  tripStartDate?: string | null
}

export function TimelineTab({ tripId, tripStartDate }: Props) {
  const { data: destinations = [], isLoading: destLoading } = useTripDestinations(tripId)
  const { data: memories = [], isLoading: memLoading } = useTripMemories(tripId)
  const { data: photos = [], isLoading: photoLoading } = useTripPhotos(tripId)

  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null)

  const isLoading = destLoading || memLoading || photoLoading

  // ── Build day map ──────────────────────────────────────────────────────────
  const dayMap = new Map<string, {
    arrivals: Destination[]
    departures: Destination[]
    memories: Memory[]
    photos: Photo[]
  }>()

  function getOrCreate(date: string) {
    if (!dayMap.has(date)) {
      dayMap.set(date, { arrivals: [], departures: [], memories: [], photos: [] })
    }
    return dayMap.get(date)!
  }

  for (const d of destinations) {
    if (d.arrivalDate) getOrCreate(d.arrivalDate).arrivals.push(d)
    if (d.departureDate && d.departureDate !== d.arrivalDate) {
      getOrCreate(d.departureDate).departures.push(d)
    }
  }

  for (const m of memories) {
    if (m.memoryDate) getOrCreate(m.memoryDate).memories.push(m)
  }

  for (const p of photos) {
    const date = p.takenAt
      ? p.takenAt.slice(0, 10)
      : p.createdAt.slice(0, 10)
    getOrCreate(date).photos.push(p)
  }

  // Sort dates ascending
  const sortedDates = [...dayMap.keys()].sort()

  // Build TimelineDay array
  const days: TimelineDay[] = sortedDates.map(date => {
    const bucket = dayMap.get(date)!
    const events: TimelineEvent[] = []

    // Arrivals first, then departures
    for (const d of bucket.arrivals) events.push({ type: 'arrival', destination: d })
    for (const d of bucket.departures) events.push({ type: 'departure', destination: d })
    // Memories
    for (const m of bucket.memories) events.push({ type: 'memory', memory: m })
    // Photos as one strip
    if (bucket.photos.length > 0) events.push({ type: 'photo-strip', photos: bucket.photos })

    const dayNumber = tripStartDate
      ? dayjs(date).diff(dayjs(tripStartDate), 'day') + 1
      : null

    return { date, dayNumber: dayNumber !== null && dayNumber >= 1 ? dayNumber : null, events }
  })

  // Undated memories
  const undatedMemories = memories.filter(m => !m.memoryDate)
  // Undated photos
  const undatedPhotos = photos.filter(p => !p.takenAt && !p.createdAt)

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center w-10">
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="w-0.5 flex-1 mt-1 bg-gray-100 dark:bg-gray-800 min-h-[80px]" />
            </div>
            <div className="flex-1 space-y-2 pb-8">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  const hasAnything = days.length > 0 || undatedMemories.length > 0

  if (!hasAnything) {
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-3xl mb-3">🗓️</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No timeline yet</p>
        <p className="text-xs mt-1">Add destinations, memories, or photos with dates to see your trip unfold.</p>
      </div>
    )
  }

  return (
    <>
      <div className="pt-1">
        {/* Dated days */}
        {days.map((day, i) => (
          <DayBlock
            key={day.date}
            day={day}
            isLast={i === days.length - 1 && undatedMemories.length === 0}
            onPhotoClick={(photos, index) => setLightbox({ photos, index })}
          />
        ))}

        {/* Undated section */}
        {(undatedMemories.length > 0 || undatedPhotos.length > 0) && (
          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0 w-10">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-900 flex-shrink-0 mt-1" />
            </div>
            <div className="flex-1 pb-4">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3">No date</h3>
              <div className="space-y-3">
                {undatedMemories.map(m => (
                  <MemoryEvent key={m.id} m={m} />
                ))}
                {undatedPhotos.length > 0 && (
                  <PhotoStrip
                    photos={undatedPhotos}
                    onPhotoClick={(idx) => setLightbox({ photos: undatedPhotos, index: idx })}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
