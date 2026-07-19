import { useEffect, useState, KeyboardEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, BookOpen, Tag, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { memorySchema, MemoryFormValues, MOODS } from '../schemas/memorySchema'
import { Memory, MemoryMood } from '../api/memoriesApi'
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

  // Tag chip state (local — synced into form via setValue)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: editTarget?.title ?? '',
      journalEntry: editTarget?.journalEntry ?? '',
      memoryDate: editTarget?.memoryDate ?? '',
      destinationId: editTarget?.destinationId ?? null,
      mood: editTarget?.mood ?? null,
      tags: editTarget?.tags ?? [],
    },
  })

  const currentMood = watch('mood')
  const currentTags = watch('tags') ?? []

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler as any)
    return () => window.removeEventListener('keydown', handler as any)
  }, [onClose])

  // ── Tag helpers ──────────────────────────────────────────────────────────────
  function commitTag() {
    const raw = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!raw || currentTags.includes(raw) || currentTags.length >= 10) return
    setValue('tags', [...currentTags, raw])
    setTagInput('')
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTag()
    }
    if (e.key === 'Backspace' && tagInput === '' && currentTags.length > 0) {
      setValue('tags', currentTags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setValue('tags', currentTags.filter((t) => t !== tag))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = (values: MemoryFormValues) => {
    const payload = {
      ...values,
      memoryDate: values.memoryDate || null,
      destinationId: values.destinationId || null,
      journalEntry: values.journalEntry || undefined,
      mood: (values.mood as MemoryMood) || null,
      tags: values.tags ?? [],
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

            {/* Mood picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you feel?
                <span className="ml-1 text-xs text-gray-400 font-normal">optional</span>
              </label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(({ value, emoji, label }) => {
                      const isSelected = field.value === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(isSelected ? null : value)}
                          className={clsx(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                            isSelected
                              ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
                <span className="ml-1 text-xs text-gray-400 font-normal">optional · press Enter or comma to add</span>
              </label>
              <div
                className={clsx(
                  'flex flex-wrap gap-2 min-h-[42px] px-3 py-2 border rounded-xl transition-shadow',
                  'focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-gray-300'
                )}
              >
                {/* Existing chips */}
                {currentTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-medium text-brand-700"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-brand-400 hover:text-brand-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Input */}
                {currentTags.length < 10 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={commitTag}
                    placeholder={currentTags.length === 0 ? 'food, hiking, culture…' : ''}
                    className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  />
                )}
              </div>
              {currentTags.length >= 10 && (
                <p className="text-xs text-amber-500 mt-1">Maximum 10 tags reached</p>
              )}
            </div>

            {/* Journal entry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Journal entry
              </label>
              <textarea
                {...register('journalEntry')}
                rows={10}
                placeholder="Write about what happened, how you felt, what you saw…"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
              />
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
