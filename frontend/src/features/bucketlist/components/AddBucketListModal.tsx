import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, MapPin, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { bucketListSchema, BucketListFormValues } from '../schemas/bucketListSchema'
import { useAddBucketListItem } from '../hooks/useBucketList'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AddBucketListModal({ isOpen, onClose }: Props) {
  const { mutate: addItem, isPending } = useAddBucketListItem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BucketListFormValues>({
    resolver: zodResolver(bucketListSchema),
  })

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  function onSubmit(values: BucketListFormValues) {
    addItem(
      {
        destinationName: values.destinationName,
        country: values.country,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add to bucket list</h2>
              <p className="text-xs text-gray-400">A place you dream of visiting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Destination name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Destination <span className="text-red-400">*</span>
            </label>
            <input
              {...register('destinationName')}
              type="text"
              placeholder="e.g. Kyoto, Santorini, Patagonia..."
              className={clsx(
                'w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow',
                errors.destinationName ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            />
            {errors.destinationName && (
              <p className="text-xs text-red-500 mt-1">{errors.destinationName.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Country <span className="text-red-400">*</span>
            </label>
            <input
              {...register('country')}
              type="text"
              placeholder="e.g. Japan, Greece, Chile..."
              className={clsx(
                'w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow',
                errors.country ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            />
            {errors.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
              <span className="ml-1 text-xs text-gray-400 font-normal">optional</span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Why do you want to go here? What do you want to do?"
              className={clsx(
                'w-full px-3.5 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow',
                errors.notes ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-brand-600 rounded-xl text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add to list
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
