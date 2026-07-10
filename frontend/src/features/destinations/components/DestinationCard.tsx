import { Pencil, Trash2, Calendar, Star } from 'lucide-react'
import dayjs from 'dayjs'
import { clsx } from 'clsx'
import { Destination, DestinationType } from '../api/destinationsApi'

const TYPE_META: Record<DestinationType, { emoji: string; label: string; color: string }> = {
  CITY:         { emoji: '🏙️', label: 'City',          color: 'bg-blue-50 text-blue-700 border-blue-100' },
  COUNTRY:      { emoji: '🌍', label: 'Country',       color: 'bg-green-50 text-green-700 border-green-100' },
  NATIONAL_PARK:{ emoji: '🌲', label: 'National Park', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LANDMARK:     { emoji: '🗿', label: 'Landmark',      color: 'bg-amber-50 text-amber-700 border-amber-100' },
  BEACH:        { emoji: '🏖️', label: 'Beach',         color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  MOUNTAIN:     { emoji: '⛰️', label: 'Mountain',      color: 'bg-slate-50 text-slate-700 border-slate-100' },
  OTHER:        { emoji: '📍', label: 'Other',         color: 'bg-gray-50 text-gray-700 border-gray-100' },
}

interface DestinationCardProps {
  destination: Destination
  onEdit: (d: Destination) => void
  onDelete: (id: string) => void
}

export function DestinationCard({ destination: d, onEdit, onDelete }: DestinationCardProps) {
  const meta = TYPE_META[d.type]

  const dateRange =
    d.arrivalDate && d.departureDate
      ? `${dayjs(d.arrivalDate).format('MMM D')} — ${dayjs(d.departureDate).format('MMM D, YYYY')}`
      : d.arrivalDate
      ? dayjs(d.arrivalDate).format('MMM D, YYYY')
      : null

  const duration =
    d.arrivalDate && d.departureDate
      ? dayjs(d.departureDate).diff(dayjs(d.arrivalDate), 'day') + 1
      : null

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Type badge */}
        <div className={clsx('flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-2xl', meta.color)}>
          {meta.emoji}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{d.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {[d.city, d.stateProvince, d.country].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Actions — visible on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(d)}
                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(d.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-3 mt-2">
            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium border', meta.color)}>
              {meta.label}
            </span>

            {dateRange && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {dateRange}
                {duration && (
                  <span className="text-gray-400">· {duration}d</span>
                )}
              </span>
            )}

            {d.rating && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3"
                    fill={i < d.rating! ? '#f59e0b' : 'none'}
                    stroke={i < d.rating! ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </span>
            )}

            {d.latitude && d.longitude && (
              <span className="text-xs text-gray-400">📍 pinned</span>
            )}
          </div>

          {/* Notes preview */}
          {d.notes && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">{d.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}
