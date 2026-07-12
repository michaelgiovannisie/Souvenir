import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTripMemories, useDeleteMemory } from '../hooks/useMemories'
import { Memory } from '../api/memoriesApi'
import { MemoryCard } from './MemoryCard'
import { AddMemoryModal } from './AddMemoryModal'
import { Button } from '@/components/ui/Button'

interface MemoriesTabProps {
  tripId: string
}

export function MemoriesTab({ tripId }: MemoriesTabProps) {
  const { data: memories = [], isLoading } = useTripMemories(tripId)
  const { mutate: deleteMemory } = useDeleteMemory(tripId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Memory | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (m: Memory) => { setEditTarget(m); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    deleteMemory(deleteConfirmId, { onSuccess: () => setDeleteConfirmId(null) })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center w-10">
              <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 w-px bg-gray-100 mt-1" />
            </div>
            <div className="flex-1 pb-6">
              <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-base font-semibold text-gray-900">
          {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
        </span>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          New memory
        </Button>
      </div>

      {/* Empty state */}
      {memories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📖</div>
          <p className="text-sm font-medium text-gray-500 mb-1">No memories yet</p>
          <p className="text-xs text-gray-400 mb-6">
            Write about the moments that made this trip special
          </p>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Write your first memory
          </Button>
        </div>
      ) : (
        /* Timeline */
        <div>
          {memories.map((memory, index) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              isLast={index === memories.length - 1}
              onEdit={openEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <AddMemoryModal
          tripId={tripId}
          editTarget={editTarget}
          onClose={closeModal}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this memory?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the journal entry. Photos attached to this memory will remain on the trip.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
