import { useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { X, MapPin, ExternalLink, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { api } from '@/lib/axios'
import { useTripPhotos } from '@/features/photos/hooks/usePhotos'

// ── Types ──────────────────────────────────────────────────────────────────────

interface PhotoPin {
  id: string          // destination id
  tripId: string
  tripTitle: string
  tripStatus: string
  name: string
  country: string
  latitude: number
  longitude: number
  coverPhotoUrl: string | null
}

// ── Icon factory ───────────────────────────────────────────────────────────────

function makePhotoIcon(coverPhotoUrl: string | null, selected: boolean): L.DivIcon {
  const ringColor  = selected ? '#2563eb' : 'white'
  const shadow     = selected
    ? '0 2px 16px rgba(0,0,0,0.35), 0 0 0 3px rgba(37,99,235,0.25)'
    : '0 2px 10px rgba(0,0,0,0.25)'
  const bg = coverPhotoUrl
    ? `url('${coverPhotoUrl}') center/cover no-repeat`
    : 'linear-gradient(135deg,#60a5fa,#818cf8)'

  return L.divIcon({
    html: `
      <div style="position:relative;width:44px;height:50px">
        <div style="
          width:44px;height:44px;border-radius:10px;
          border:2.5px solid ${ringColor};
          box-shadow:${shadow};
          background:${bg};
          transition:transform .15s;
          transform:${selected ? 'scale(1.18)' : 'scale(1)'};
        "></div>
        <div style="
          position:absolute;bottom:0;left:50%;transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;border-right:6px solid transparent;
          border-top:8px solid ${ringColor};
          filter:drop-shadow(0 1px 1px rgba(0,0,0,.2));
        "></div>
      </div>`,
    className: '',
    iconSize:   [44, 50],
    iconAnchor: [22, 50],
  })
}

// ── Photo panel ────────────────────────────────────────────────────────────────

function PhotoPanel({
  pin,
  onClose,
}: {
  pin: PhotoPin
  onClose: () => void
}) {
  const { data: photos = [], isLoading } = useTripPhotos(pin.tripId)

  // Prefer photos tagged to this destination; fall back to all trip photos
  const destPhotos = photos.filter((p) => p.destinationId === pin.id)
  const displayPhotos = destPhotos.length > 0 ? destPhotos : photos

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const prev = useCallback(() => setLightboxIdx((i) => (i !== null ? Math.max(0, i - 1) : 0)), [])
  const next = useCallback(
    () =>
      setLightboxIdx((i) =>
        i !== null ? Math.min(displayPhotos.length - 1, i + 1) : 0
      ),
    [displayPhotos.length]
  )

  return (
    <>
      {/* Panel */}
      <div className="absolute bottom-0 inset-x-0 z-[1000] bg-white rounded-t-2xl shadow-2xl max-h-[55vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-3 flex-shrink-0 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{pin.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{pin.country}</span>
              <span className="text-gray-300">·</span>
              <Link
                to={`/trips/${pin.tripId}`}
                className="text-brand-600 hover:underline flex items-center gap-1 truncate"
              >
                {pin.tripTitle}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </Link>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {isLoading && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && displayPhotos.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Images className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No photos for this trip yet.</p>
            </div>
          )}

          {!isLoading && displayPhotos.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-3">
                {displayPhotos.length} {displayPhotos.length === 1 ? 'photo' : 'photos'}
                {destPhotos.length > 0 && destPhotos.length < photos.length
                  ? ` at this location`
                  : ` from this trip`}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {displayPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightboxIdx(idx)}
                    className="aspect-square rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-brand-400 transition-all focus:outline-none focus:ring-brand-400"
                  >
                    <img
                      src={photo.cloudinaryUrl}
                      alt={photo.caption ?? ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && displayPhotos[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <img
            src={displayPhotos[lightboxIdx].cloudinaryUrl}
            alt={displayPhotos[lightboxIdx].caption ?? ''}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption + date */}
          {(displayPhotos[lightboxIdx].caption || displayPhotos[lightboxIdx].takenAt) && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm rounded-xl px-4 py-2 text-center max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {displayPhotos[lightboxIdx].caption && (
                <p>{displayPhotos[lightboxIdx].caption}</p>
              )}
              {displayPhotos[lightboxIdx].takenAt && (
                <p className="text-white/60 text-xs mt-0.5">
                  {dayjs(displayPhotos[lightboxIdx].takenAt).format('MMM D, YYYY')}
                </p>
              )}
            </div>
          )}

          {/* Next */}
          {lightboxIdx < displayPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
            {lightboxIdx + 1} / {displayPhotos.length}
          </div>
        </div>
      )}
    </>
  )
}

// ── Map markers (memoised to avoid full re-render on panel state changes) ─────

function PhotoMarkers({
  pins,
  selectedId,
  onSelect,
}: {
  pins: PhotoPin[]
  selectedId: string | null
  onSelect: (pin: PhotoPin) => void
}) {
  return (
    <>
      {pins.map((pin) => {
        const icon = makePhotoIcon(pin.coverPhotoUrl, pin.id === selectedId)
        return (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(pin) }}
          />
        )
      })}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function PhotoMapPage() {
  const [selectedPin, setSelectedPin] = useState<PhotoPin | null>(null)

  // Fetch all trips then collect destinations with coordinates + cover photos
  const { data: pins = [], isLoading } = useQuery<PhotoPin[]>({
    queryKey: ['photo-map-pins'],
    queryFn: async () => {
      const { data: tripsData } = await api.get('/trips', { params: { size: 200 } })
      const trips = tripsData.data.content

      const allPins: PhotoPin[] = []
      await Promise.all(
        trips.map(async (trip: any) => {
          const { data: destData } = await api.get(`/trips/${trip.id}/destinations`)
          const destinations = destData.data
          for (const dest of destinations) {
            if (dest.latitude && dest.longitude) {
              allPins.push({
                id: dest.id,
                tripId: trip.id,
                tripTitle: trip.title,
                tripStatus: trip.status,
                name: dest.name,
                country: dest.country,
                latitude: dest.latitude,
                longitude: dest.longitude,
                coverPhotoUrl: trip.coverPhotoUrl ?? null,
              })
            }
          }
        })
      )
      return allPins
    },
    staleTime: 1000 * 60 * 5,
  })

  const handleSelect = useCallback((pin: PhotoPin) => {
    setSelectedPin((prev) => (prev?.id === pin.id ? null : pin))
  }, [])

  const handleClose = useCallback(() => setSelectedPin(null), [])

  // Compute panel height offset so map isn't fully covered
  const panelOpen = selectedPin !== null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading
              ? 'Loading locations…'
              : `${pins.length} ${pins.length === 1 ? 'location' : 'locations'} with photos`}
          </p>
        </div>
        {selectedPin && (
          <button
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Close panel
          </button>
        )}
      </div>

      {/* Map + panel wrapper */}
      <div
        className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
        style={{ height: 'calc(100vh - 10rem)' }}
      >
        {isLoading ? (
          <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
            Loading map…
          </div>
        ) : pins.length === 0 ? (
          <div className="h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
            <p className="text-3xl mb-3">📷</p>
            <p className="font-medium text-gray-500">No locations yet</p>
            <p className="text-sm mt-1">Add destinations with coordinates to your trips.</p>
          </div>
        ) : (
          <>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <PhotoMarkers
                pins={pins}
                selectedId={selectedPin?.id ?? null}
                onSelect={handleSelect}
              />
            </MapContainer>

            {/* Bottom panel */}
            {panelOpen && selectedPin && (
              <PhotoPanel pin={selectedPin} onClose={handleClose} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
