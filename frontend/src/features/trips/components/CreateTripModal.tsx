import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateTrip } from '../hooks/useTrips'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().max(1000).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PLANNED', 'ONGOING', 'COMPLETED']).default('PLANNED'),
  })
  .refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { message: 'End date must be after start date', path: ['endDate'] }
  )

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export function CreateTripModal({ onClose }: Props) {
  const { mutate: createTrip, isPending, error } = useCreateTrip()

  const apiError =
    (error as any)?.response?.data?.error?.message ||
    (error as any)?.response?.data?.message ||
    ((error as any)?.response ? `Server error (${(error as any).response.status})` : null) ||
    ((error as any)?.message ? `Request failed: ${(error as any).message}` : null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'PLANNED' },
  })

  const onSubmit = (values: FormValues) => {
    createTrip(
      {
        title: values.title,
        description: values.description || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        status: values.status,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Trip</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Trip title"
            placeholder="e.g. Summer in Japan"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="What's this trip about?"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End date"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('status')}
            >
              <option value="PLANNED">🗓 Planned</option>
              <option value="ONGOING">✈️ Ongoing</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1" isLoading={isPending}>
              Create trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
