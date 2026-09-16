import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Calendar, Star, Check } from 'lucide-react'
import dayjs from 'dayjs'
import { clsx } from 'clsx'
import { Destination, DestinationType } from '../api/destinationsApi'
import { useUpdateDestination } from '../hooks/useDestinations'

const TYPE_META: Record<DestinationType, { emoji: string; label: string; color: string }> = {
  CITY:         { emoji: '🏙️', label: 'City',          color: 'bg-blue-50 text-blue-700 border-blue-100' },
  COUNTRY:      { emoji: '🌍', label: 'Country',       color: 'bg-green-50 text-green-700 border-green-100' },
  NATIONAL_PARK:{ emoji: '🌲', label: 'National Park', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LANDMARK:     { emoji: '🗿', label: 'Landmark',      color: 'bg-amber-50 text-amber-700 border-amber-100' },
  BEACH:        { emoji: '🏖️', label: 'Beach',         color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  MOUNTAIN:     { emoji: '⛰️', label: 'Mountain',      color: 'bg-slate-50 text-slate-700 border-slate-100' },
  OTHER:        { emoji: '📍', label: 'Other',         color: 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-800' },
}

interface DestinationCardProps {
  destination: Destination
  tripId: string
  onEdit: (d: Destination) => void
  onDelete: (id: string) => void
}

export function DestinationCard({ destination: d, tripId, onEdit, onDelete }: DestinationCardProps) {
  const meta = TYPE_META[d.type]
  const { mutate: updateDestination } = useUpdateDestination(tripId)

  // ── Inline notes state ────────────────────────────────────────────────────────
  const [editingNotes, setEditingNotes] = useState(false)
  const [draftNotes, setDraftNotes] = useState(d.notes ?? '')
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep draft in sync if destination prop changes (e.g. after external edit)
  useEffect(() => {
    if (!editingNotes) setDraftNotes(d.notes ?? '')
  }, [d.notes, editingNotes])

  // Auto-resize textarea height to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draftNotes, editingNotes])

  function openNotes() {
    setDraftNotes(d.notes ?? '')
    setEditingNotes(true)
    setTimeout(() => {
      textareaRef.current?.focus()
      // Place cursor at end
      const len = textareaRef.current?.value.length ?? 0
      textareaRef.current?.setSelectionRange(len, len)
    }, 30)
  }

  function saveNotes() {
    setEditingNotes(false)
    const trimmed = draftNotes.trim()
    if (trimmed === (d.notes ?? '').trim()) return // no change
    updateDestination({
      id: d.id,
      payload: {
        name: d.name,
        country: d.country,
        stateProvince: d.stateProvince ?? undefined,
        city: d.city ?? undefined,
        latitude: d.latitude,
        longitude: d.longitude,
        type: d.type,
        arrivalDate: d.arrivalDate,
        departureDate: d.departureDate,
        notes: trimmed || undefined,
        rating: d.rating,
      },
    })
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      setDraftNotes(d.notes ?? '')
      setEditingNotes(false)
    }
  }

  // ── Date / duration helpers ───────────────────────────────────────────────────
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
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 dark:border-gray-600 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Type badge */}
        <div className={clsx('flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-2xl', meta.color)}>
          {meta.emoji}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{d.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {[d.city, d.stateProvince, d.country].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Actions — visible on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(d)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(d.id)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                {dateRange}
                {duration && (
                  <span className="text-gray-400 dark:text-gray-500">· {duration}d</span>
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
              <span className="text-xs text-gray-400 dark:text-gray-500">📍 pinned</span>
            )}

            {/* Saved flash */}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>

          {/* ── Notes section ─────────────────────────────────────────────────── */}
          <div className="mt-2.5">
            {editingNotes ? (
              <textarea
                ref={textareaRef}
                value={draftNotes}
                onChange={e => setDraftNotes(e.target.value)}
                onBlur={saveNotes}
                onKeyDown={handleKeyDown}
                placeholder="Notes about this place…"
                rows={2}
                className={clsx(
                  'w-full resize-none text-xs leading-relaxed rounded-xl px-3 py-2',
                  'border border-brand-400 ring-2 ring-brand-500/20',
                  'bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-300',
                  'placeholder-gray-400 dark:placeholder-gray-500 outline-none',
                  'transition-all overflow-hidden'
                )}
              />
            ) : d.notes ? (
              /* Notes exist — click the text to edit */
              <p
                onClick={openNotes}
                className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed cursor-text hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Click to edit notes"
              >
                {d.notes}
              </p>
            ) : (
              /* No notes — show subtle prompt on hover */
              <button
                onClick={openNotes}
                className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100 italic"
              >
                + Add notes…
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
