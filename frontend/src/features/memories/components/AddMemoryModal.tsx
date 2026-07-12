import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, BookOpen } from 'lucide-react'
import { memorySchema, MemoryFormValues } from '../schemas/memorySchema'
import { Memory } from '../api/memoriesApi'
import { useCreateMemory, useUpdateMemory } from '../hooks/useMemories'
import { useTripDestinations } from '@/features/destinations/hooks/useDestinations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AddMemoryModalProps {
  tripId: string
  editTarget?: Memory | null
  onClose: () => void
}

export function AddMemoryModal({ tripId, editTarget, onClose }: AddMemoryModalProps) {
  const isEditing = !!editTarget
  const { mutate: create, isPending: isCreating } = useCreateMemory(tripId)
  const { mutate: update, isPending: isUpdating } = useUpdateMemory(tripId)
  const { data: destinations = [] } = useTripDestinations(tripId)
  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: editTarget?.title ?? '',
      journalEntry: editTarget?.journalEntry ?? '',
      memoryDate: editTarget?.memoryDate ?? '',
      destinationId: editTarget?.destinationId ?? null,
    },
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const onSubmit = (values: MemoryFormValues) => {
    const payload = {
      ...values,
      memoryDate: values.memoryDate || null,
      destinationId: values.destinationId || null,
      journalEntry: values.journalEntry || undefined,
    }

    if (isEditing) {
      update({ id: editTarget!.id, payload }, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit memory' : 'New memory'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* Title */}
            <Input
              label="Title *"
              placeholder="Sunset over the Seine…"
              error={errors.title?.message}
              {...register('title')}
            />

            {/* Date + Destination in a row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                {...register('memoryDate')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked place
                </label>
                <Controller
                  name="destinationId"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">No specific place</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}, {d.country}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {destinations.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Add places in the Places tab first</p>
                )}
              </div>
            </div>

            {/* Journal entry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Journal entry
              </label>
              <textarea
                {...register('journalEntry')}
                rows={12}
                placeholder="Write about what happened, how you felt, what you saw…"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-400 mt-1">No limit — write as much as you want.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {isEditing ? 'Save changes' : 'Save memory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
