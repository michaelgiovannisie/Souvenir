import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp, MapPin, Camera, Tag } from 'lucide-react'
import dayjs from 'dayjs'
import { clsx } from 'clsx'
import { Memory } from '../api/memoriesApi'
import { MOODS } from '../schemas/memorySchema'

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]))

const PREVIEW_LENGTH = 220

interface MemoryCardProps {
  memory: Memory
  isLast: boolean
  onEdit: (m: Memory) => void
  onDelete: (id: string) => void
}

export function MemoryCard({ memory: m, isLast, onEdit, onDelete }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const isLong = (m.journalEntry?.length ?? 0) > PREVIEW_LENGTH
  const displayText = expanded || !isLong
    ? m.journalEntry
    : m.journalEntry?.slice(0, PREVIEW_LENGTH).trimEnd() + '…'

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        {/* Dot */}
        <div className="w-3 h-3 mt-1 rounded-full bg-brand-500 border-2 border-white ring-2 ring-brand-200 z-10 flex-shrink-0" />
        {/* Line down */}
        {!isLast && <div className="flex-1 w-px bg-gray-200 mt-1" />}
      </div>

      {/* Card */}
      <div className="group flex-1 pb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              {/* Date */}
              {m.memoryDate && (
                <p className="text-xs font-medium text-brand-600 mb-1">
                  {dayjs(m.memoryDate).format('dddd, MMMM D, YYYY')}
                </p>
              )}
              {/* Title + mood emoji */}
              <h3 className="font-semibold text-gray-900 leading-snug flex items-center gap-1.5">
                {m.mood && MOOD_MAP[m.mood] && (
                  <span title={MOOD_MAP[m.mood].label}>{MOOD_MAP[m.mood].emoji}</span>
                )}
                {m.title}
              </h3>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(m)}
                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(m.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Destination badge */}
          {m.destinationName && (
            <div className="flex items-center gap-1 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                {m.destinationName}
                {m.destinationCountry && (
                  <span className="text-amber-500">, {m.destinationCountry}</span>
                )}
              </span>
            </div>
          )}

          {/* Journal entry */}
          {m.journalEntry ? (
            <div>
              <p className={clsx(
                'text-sm text-gray-600 leading-relaxed whitespace-pre-wrap',
                !expanded && isLong && 'line-clamp-none'
              )}>
                {displayText}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  {expanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Read more</>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No journal entry written yet.</p>
          )}

          {/* Tags */}
          {m.tags && m.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {m.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 font-medium"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Photo count */}
          {m.photoCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
              <Camera className="w-3.5 h-3.5" />
              {m.photoCount} {m.photoCount === 1 ? 'photo' : 'photos'} attached
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
