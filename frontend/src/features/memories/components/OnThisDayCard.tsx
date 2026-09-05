import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import dayjs from 'dayjs'
import { clsx } from 'clsx'
import { useOnThisDay } from '../hooks/useMemories'
import { MOODS } from '../schemas/memorySchema'

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m.emoji]))

const PREVIEW_COUNT = 3

export function OnThisDayCard() {
  const { data: memories = [], isLoading } = useOnThisDay()
  const [expanded, setExpanded] = useState(false)

  // Only render once we know there's something to show
  if (isLoading || memories.length === 0) return null

  const today = dayjs()
  const dateLabel = today.format('MMMM D')

  const visible = expanded ? memories : memories.slice(0, PREVIEW_COUNT)
  const hidden = memories.length - PREVIEW_COUNT

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <div>
            <h2 className="font-semibold text-amber-900 text-sm leading-tight">On this day</h2>
            <p className="text-xs text-amber-600">{dateLabel}</p>
          </div>
        </div>
        <Link
          to="/memories"
          className="text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 transition-colors"
        >
          All memories
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-amber-100 mx-5" />

      {/* Memory list */}
      <ul className="px-5 py-3 space-y-0.5">
        {visible.map((memory) => {
          const year = memory.memoryDate ? dayjs(memory.memoryDate).year() : null
          const yearsAgo = year ? today.year() - year : null
          const moodEmoji = memory.mood ? MOOD_MAP[memory.mood] : null

          return (
            <li key={memory.id}>
              <Link
                to={`/trips/${memory.tripId}`}
                className="flex items-start gap-3 py-2.5 group"
              >
                {/* Year pill */}
                <span
                  className={clsx(
                    'flex-shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full',
                    'bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors'
                  )}
                >
                  {year}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-amber-900 transition-colors">
                    {moodEmoji && <span className="mr-1">{moodEmoji}</span>}
                    {memory.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                    {memory.tripTitle}
                    {memory.destinationName && ` · ${memory.destinationName}`}
                  </p>
                </div>

                {/* Years ago */}
                {yearsAgo !== null && yearsAgo > 0 && (
                  <span className="flex-shrink-0 text-xs text-amber-500 mt-0.5 whitespace-nowrap">
                    {yearsAgo}y ago
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Expand / collapse */}
      {memories.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-amber-600 hover:text-amber-800 border-t border-amber-100 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              {hidden} more {hidden === 1 ? 'memory' : 'memories'}
            </>
          )}
        </button>
      )}
    </div>
  )
}
