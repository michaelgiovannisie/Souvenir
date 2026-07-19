import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookHeart, Search, ExternalLink, MapPin, Camera, ChevronDown, ChevronUp, Tag, X } from 'lucide-react'
import dayjs from 'dayjs'
import { clsx } from 'clsx'
import { useAllMemories } from '@/features/memories/hooks/useMemories'
import { Memory } from '@/features/memories/api/memoriesApi'
import { MOODS } from '@/features/memories/schemas/memorySchema'

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]))

// ─── Constants ────────────────────────────────────────────────────────────────
const PREVIEW_LENGTH = 240

// ─── Skeleton ────────────────────────────────────────────────────────────────
function MemoriesPageSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}

// ─── Single memory card (read-only, with trip link) ──────────────────────────
function GlobalMemoryCard({ memory: m, isLast }: { memory: Memory; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (m.journalEntry?.length ?? 0) > PREVIEW_LENGTH
  const displayText = expanded || !isLong
    ? m.journalEntry
    : m.journalEntry?.slice(0, PREVIEW_LENGTH).trimEnd() + '…'

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-3 h-3 mt-1 rounded-full bg-brand-500 border-2 border-white ring-2 ring-brand-200 z-10 flex-shrink-0" />
        {!isLast && <div className="flex-1 w-px bg-gray-200 mt-1" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              {m.memoryDate && (
                <p className="text-xs font-medium text-brand-600 mb-1">
                  {dayjs(m.memoryDate).format('dddd, MMMM D, YYYY')}
                </p>
              )}
              <h3 className="font-semibold text-gray-900 leading-snug flex items-center gap-1.5">
                {m.mood && MOOD_MAP[m.mood] && (
                  <span title={MOOD_MAP[m.mood].label}>{MOOD_MAP[m.mood].emoji}</span>
                )}
                {m.title}
              </h3>
            </div>

            {/* Trip link */}
            <Link
              to={`/trips/${m.tripId}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 text-xs text-gray-500 hover:text-brand-600 transition-colors"
              title={`Go to trip: ${m.tripTitle}`}
            >
              <span className="hidden sm:block truncate max-w-[120px]">{m.tripTitle}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </Link>
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
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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

// ─── Year divider ─────────────────────────────────────────────────────────────
function YearDivider({ year }: { year: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0 w-10 flex justify-center">
        <div className="w-px h-full bg-transparent" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{year}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">No memories match your search.</p>
      </div>
    )
  }
  return (
    <div className="text-center py-32">
      <div className="text-6xl mb-4">📖</div>
      <h3 className="font-semibold text-gray-900 mb-2">No memories yet</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Open a trip and start adding memories to your journal.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        Go to trips
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function MemoriesPage() {
  const [search, setSearch]         = useState('')
  const [tripFilter, setTripFilter] = useState<string>('all')
  const [moodFilter, setMoodFilter] = useState<string>('all')
  const [tagFilter, setTagFilter]   = useState<string>('')

  const { data: memories = [], isLoading, isError } = useAllMemories()

  // Unique trips for the filter dropdown
  const trips = useMemo(() => {
    const seen = new Map<string, string>()
    memories.forEach((m) => {
      if (!seen.has(m.tripId)) seen.set(m.tripId, m.tripTitle)
    })
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }))
  }, [memories])

  // All unique tags across memories
  const allTags = useMemo(() => {
    const set = new Set<string>()
    memories.forEach((m) => m.tags?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [memories])

  // Filtered + searched memories
  const filtered = useMemo(() => {
    let base = memories
    if (tripFilter !== 'all') base = base.filter((m) => m.tripId === tripFilter)
    if (moodFilter !== 'all') base = base.filter((m) => m.mood === moodFilter)
    if (tagFilter)            base = base.filter((m) => m.tags?.includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.journalEntry?.toLowerCase().includes(q) ||
          m.destinationName?.toLowerCase().includes(q) ||
          m.tripTitle.toLowerCase().includes(q)
      )
    }
    return base
  }, [memories, tripFilter, moodFilter, tagFilter, search])

  const hasActiveFilter = tripFilter !== 'all' || moodFilter !== 'all' || tagFilter || search

  // Group by year for timeline dividers
  const grouped = useMemo(() => {
    const result: Array<{ type: 'year'; year: string } | { type: 'memory'; memory: Memory; isLast: boolean }> = []
    let lastYear = ''

    filtered.forEach((memory, idx) => {
      const year = memory.memoryDate
        ? dayjs(memory.memoryDate).format('YYYY')
        : dayjs(memory.createdAt).format('YYYY')

      if (year !== lastYear) {
        result.push({ type: 'year', year })
        lastYear = year
      }
      result.push({ type: 'memory', memory, isLast: idx === filtered.length - 1 })
    })

    return result
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookHeart className="w-6 h-6 text-brand-500" />
          Memories
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {memories.length === 0
            ? 'Your travel journal'
            : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} across ${trips.length} ${trips.length === 1 ? 'trip' : 'trips'}`}
        </p>
      </div>

      {/* Filters */}
      {memories.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {/* Trip filter */}
            {trips.length > 1 && (
              <select
                value={tripFilter}
                onChange={(e) => setTripFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              >
                <option value="all">All trips</option>
                {trips.map(({ id, title }) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </select>
            )}

            {/* Mood filter */}
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            >
              <option value="all">All moods</option>
              {MOODS.map(({ value, emoji, label }) => (
                <option key={value} value={value}>{emoji} {label}</option>
              ))}
            </select>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              >
                <option value="">All tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            )}

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search memories..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilter && (
              <button
                onClick={() => { setSearch(''); setTripFilter('all'); setMoodFilter('all'); setTagFilter('') }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilter && (
            <p className="text-sm text-gray-400">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <MemoriesPageSkeleton />
      ) : isError ? (
        <div className="text-center py-24 text-gray-400">
          <p>Failed to load memories. Please try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={!!hasActiveFilter} />
      ) : (
        <div>
          {grouped.map((item, i) => {
            if (item.type === 'year') {
              return <YearDivider key={`year-${item.year}-${i}`} year={item.year} />
            }
            return (
              <GlobalMemoryCard
                key={item.memory.id}
                memory={item.memory}
                isLast={item.isLast}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
