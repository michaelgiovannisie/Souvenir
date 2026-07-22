import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Plane, MapPin, BookOpen, ListChecks, Loader2, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useSearch } from '../hooks/useSearch'
import { MOODS } from '@/features/memories/schemas/memorySchema'

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]))

const STATUS_COLORS = {
  PLANNED:   'bg-yellow-100 text-yellow-700',
  ONGOING:   'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}
const STATUS_LABELS = { PLANNED: 'Planned', ONGOING: 'Ongoing', COMPLETED: 'Completed' }

// ─── Types for flat result list ───────────────────────────────────────────────
type FlatResult =
  | { kind: 'trip';    id: string; label: string; sub: string; href: string; badge?: string; badgeColor?: string; coverUrl?: string | null }
  | { kind: 'dest';    id: string; label: string; sub: string; href: string; typeLabel?: string }
  | { kind: 'memory';  id: string; label: string; sub: string; href: string; mood?: string | null; date?: string | null }
  | { kind: 'bucket';  id: string; label: string; sub: string; href: string; done: boolean }

const KIND_ICONS = {
  trip:   Plane,
  dest:   MapPin,
  memory: BookOpen,
  bucket: ListChecks,
}

const KIND_LABELS = {
  trip:   'Trips',
  dest:   'Places',
  memory: 'Memories',
  bucket: 'Bucket list',
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Debounce the query by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data, isFetching } = useSearch(debouncedQuery)

  // Flatten results into a single navigable list
  const results: FlatResult[] = []

  data?.trips.forEach((t) => results.push({
    kind: 'trip',
    id: t.id,
    label: t.title,
    sub: STATUS_LABELS[t.status],
    href: `/trips/${t.id}`,
    badge: t.status,
    badgeColor: STATUS_COLORS[t.status],
    coverUrl: t.coverPhotoUrl,
  }))

  data?.destinations.forEach((d) => results.push({
    kind: 'dest',
    id: d.id,
    label: d.name,
    sub: `${d.country}${d.city ? ` · ${d.city}` : ''} — ${d.tripTitle}`,
    href: `/trips/${d.tripId}?tab=destinations`,
    typeLabel: d.type,
  }))

  data?.memories.forEach((m) => results.push({
    kind: 'memory',
    id: m.id,
    label: m.title,
    sub: m.tripTitle,
    href: `/trips/${m.tripId}?tab=memories`,
    mood: m.mood,
    date: m.memoryDate,
  }))

  data?.bucketList.forEach((b) => results.push({
    kind: 'bucket',
    id: b.id,
    label: b.destinationName,
    sub: b.country,
    href: '/bucket-list',
    done: b.completed,
  }))

  // Keep cursor in bounds when results change
  useEffect(() => setCursor(0), [debouncedQuery])

  const go = useCallback((href: string) => {
    navigate(href)
    onClose()
  }, [navigate, onClose])

  // Keyboard navigation
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && results[cursor]) {
      go(results[cursor].href)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Focus input on open, reset on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setDebouncedQuery('')
      setCursor(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Group results by kind for section headers
  const groups: { kind: FlatResult['kind']; items: FlatResult[] }[] = []
  let currentKind: FlatResult['kind'] | null = null
  results.forEach((r) => {
    if (r.kind !== currentKind) {
      groups.push({ kind: r.kind, items: [] })
      currentKind = r.kind
    }
    groups[groups.length - 1].items.push(r)
  })

  let resultIndex = -1 // global index tracker for cursor

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          {isFetching
            ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
            : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search trips, places, memories…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!debouncedQuery || debouncedQuery.length < 2 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 && !isFetching ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No results for <span className="font-medium text-gray-600">"{debouncedQuery}"</span>
            </div>
          ) : (
            <div className="py-2">
              {groups.map(({ kind, items }) => {
                const Icon = KIND_ICONS[kind]
                return (
                  <div key={kind}>
                    {/* Section header */}
                    <div className="flex items-center gap-2 px-4 py-1.5 mt-1">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {KIND_LABELS[kind]}
                      </span>
                    </div>

                    {/* Items */}
                    {items.map((result) => {
                      resultIndex++
                      const idx = resultIndex
                      const isActive = cursor === idx

                      return (
                        <button
                          key={result.id}
                          onClick={() => go(result.href)}
                          onMouseEnter={() => setCursor(idx)}
                          className={clsx(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            isActive ? 'bg-brand-50' : 'hover:bg-gray-50'
                          )}
                        >
                          {/* Left icon / thumbnail */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                            {result.kind === 'trip' && result.coverUrl ? (
                              <img src={result.coverUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Icon className={clsx('w-4 h-4', isActive ? 'text-brand-500' : 'text-gray-400')} />
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Mood emoji for memories */}
                              {result.kind === 'memory' && result.mood && MOOD_MAP[result.mood] && (
                                <span className="text-sm">{MOOD_MAP[result.mood].emoji}</span>
                              )}
                              <span className={clsx(
                                'text-sm font-medium truncate',
                                result.kind === 'bucket' && result.done ? 'line-through text-gray-400' : 'text-gray-900'
                              )}>
                                {result.label}
                              </span>
                              {/* Completed badge for bucket list */}
                              {result.kind === 'bucket' && result.done && (
                                <span className="text-xs text-brand-500 font-medium flex-shrink-0">✓ Visited</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{result.sub}</p>
                          </div>

                          {/* Right metadata */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {result.kind === 'trip' && result.badge && (
                              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', result.badgeColor)}>
                                {STATUS_LABELS[result.badge as keyof typeof STATUS_LABELS]}
                              </span>
                            )}
                            {result.kind === 'memory' && result.date && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {dayjs(result.date).format('MMM YYYY')}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">↵</kbd> open</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">Esc</kbd> close</span>
            <span className="ml-auto">{data?.totalResults} result{data?.totalResults !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  )
}
