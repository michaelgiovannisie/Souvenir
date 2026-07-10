import { useState } from 'react'
import { Plus, Map } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useTripDestinations, useDeleteDestination } from '../hooks/useDestinations'
import { Destination } from '../api/destinationsApi'
import { DestinationCard } from './DestinationCard'
import { AddDestinationModal } from './AddDestinationModal'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface DestinationsTabProps {
  tripId: string
}

export function DestinationsTab({ tripId }: DestinationsTabProps) {
  const { data: destinations = [], isLoading } = useTripDestinations(tripId)
  const { mutate: deleteDestination } = useDeleteDestination(tripId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Destination | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')

  const pinnedDestinations = destinations.filter((d) => d.latitude && d.longitude)

  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (d: Destination) => { setEditTarget(d); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    deleteDestination(deleteConfirmId, { onSuccess: () => setDeleteConfirmId(null) })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">
            {destinations.length} {destinations.length === 1 ? 'place' : 'places'}
          </span>
          {pinnedDestinations.length > 0 && (
            <span className="text-xs text-gray-400">· {pinnedDestinations.length} pinned</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          {pinnedDestinations.length > 0 && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  view === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                List
              </button>
              <button
                onClick={() => setView('map')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1',
                  view === 'map' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <Map className="w-3 h-3" />
                Map
              </button>
            </div>
          )}

          <Button size="sm" onClick={openAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add place
          </Button>
        </div>
      </div>

      {/* Map view */}
      {view === 'map' && pinnedDestinations.length > 0 && (
        <div className="mb-6 h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={[pinnedDestinations[0].latitude!, pinnedDestinations[0].longitude!]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {pinnedDestinations.map((d) => (
              <Marker key={d.id} position={[d.latitude!, d.longitude!]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-gray-500 text-xs">{d.country}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Empty state */}
      {destinations.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📍</div>
          <p className="text-sm font-medium text-gray-500 mb-1">No places added yet</p>
          <p className="text-xs text-gray-400 mb-6">Add the destinations you visited on this trip</p>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add your first place
          </Button>
        </div>
      ) : (
        /* Destination list */
        <div className="space-y-3">
          {destinations.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              onEdit={openEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <AddDestinationModal
          tripId={tripId}
          editTarget={editTarget}
          onClose={closeModal}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Remove this place?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will also remove any memories linked to this destination.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
