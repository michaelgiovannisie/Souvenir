import { useState } from 'react'
import { Trash2, MapPin, Loader2, CheckCircle2, Circle } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { BucketListItem } from '../api/bucketListApi'
import { useToggleBucketListItem, useDeleteBucketListItem } from '../hooks/useBucketList'

interface Props {
  item: BucketListItem
}

export function BucketListItemCard({ item }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutate: toggle, isPending: toggling } = useToggleBucketListItem()
  const { mutate: remove, isPending: deleting } = useDeleteBucketListItem()

  function handleToggle() {
    toggle(item.id)
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    remove(item.id)
  }

  return (
    <div
      className={clsx(
        'group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200',
        item.completed
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : 'bg-white border-gray-200 hover:border-brand-200 hover:shadow-sm'
      )}
    >
      {/* Checkbox toggle */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-brand-500 transition-colors disabled:opacity-50"
        aria-label={item.completed ? 'Mark as pending' : 'Mark as completed'}
      >
        {toggling ? (
          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
        ) : item.completed ? (
          <CheckCircle2 className="w-5 h-5 text-brand-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={clsx(
                'font-semibold text-gray-900 truncate leading-snug',
                item.completed && 'line-through text-gray-400'
              )}
            >
              {item.destinationName}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{item.country}</span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={clsx(
              'flex-shrink-0 p-1.5 rounded-lg text-xs font-medium transition-all',
              confirmDelete
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100'
            )}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : confirmDelete ? (
              <span className="text-xs px-1">Confirm?</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{item.notes}</p>
        )}

        {/* Completed badge */}
        {item.completed && item.completedAt && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-brand-50 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-brand-500" />
            <span className="text-xs text-brand-600 font-medium">
              Visited {dayjs(item.completedAt).format('MMM YYYY')}
            </span>
          </div>
        )}

        {/* Added date */}
        {!item.completed && (
          <p className="text-xs text-gray-300 mt-2">
            Added {dayjs(item.createdAt).format('MMM D, YYYY')}
          </p>
        )}
      </div>
    </div>
  )
}
