import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { clsx } from 'clsx'
import { useTrips } from '@/features/trips/hooks/useTrips'
import type { Trip } from '@/features/trips/api/tripsApi'

// ── Constants ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_LANES = 3
const LANE_H = 24   // px per lane
const LANE_GAP = 3  // px gap between lanes

const STATUS_STYLE: Record<string, string> = {
  PLANNED:   'bg-amber-100 text-amber-800 border border-amber-200',
  ONGOING:   'bg-green-100  text-green-800  border border-green-200',
  COMPLETED: 'bg-brand-100 text-brand-800 border border-brand-200',
}

const STATUS_DOT: Record<string, string> = {
  PLANNED:   'bg-amber-400',
  ONGOING:   'bg-green-500',
  COMPLETED: 'bg-brand-500',
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CalDay {
  date: Dayjs
  inMonth: boolean
  isToday: boolean
}

interface Band {
  trip: Trip
  startCol: number       // 0–6 within this week
  endCol: number         // 0–6
  lane: number
  continuesLeft: boolean  // trip started before this week
  continuesRight: boolean // trip continues past this week
}

// ── Grid builder ───────────────────────────────────────────────────────────────

function buildGrid(year: number, month: number): CalDay[][] {
  const firstOfMonth = dayjs(new Date(year, month, 1))
  const today = dayjs()
  let cursor = firstOfMonth.startOf('week') // always Sunday
  const weeks: CalDay[][] = []

  for (let w = 0; w < 6; w++) {
    const week: CalDay[] = []
    for (let d = 0; d < 7; d++) {
      week.push({
        date: cursor,
        inMonth: cursor.month() === month,
        isToday: cursor.isSame(today, 'day'),
      })
      cursor = cursor.add(1, 'day')
    }
    weeks.push(week)
    // Stop once we've passed the month and landed back on Sunday
    if (cursor.month() !== month && cursor.day() === 0) break
  }
  return weeks
}

// ── Band calculator ────────────────────────────────────────────────────────────

function computeBands(week: CalDay[], trips: Trip[]): Band[] {
  const weekStart = week[0].date
  const weekEnd   = week[6].date

  type Raw = Omit<Band, 'lane'>
  const raw: Raw[] = []

  for (const trip of trips) {
    if (!trip.startDate && !trip.endDate) continue

    const ts = dayjs(trip.startDate ?? trip.endDate!)
    const te = dayjs(trip.endDate   ?? trip.startDate!)

    // Skip if no overlap with this week
    if (te.isBefore(weekStart, 'day') || ts.isAfter(weekEnd, 'day')) continue

    raw.push({
      trip,
      startCol:       Math.max(0, ts.diff(weekStart, 'day')),
      endCol:         Math.min(6, te.diff(weekStart, 'day')),
      continuesLeft:  ts.isBefore(weekStart, 'day'),
      continuesRight: te.isAfter(weekEnd, 'day'),
    })
  }

  // Sort by global start date for stable lane assignment across weeks
  raw.sort((a, b) => {
    const da = a.trip.startDate ?? a.trip.endDate ?? ''
    const db = b.trip.startDate ?? b.trip.endDate ?? ''
    return da < db ? -1 : da > db ? 1 : a.trip.title.localeCompare(b.trip.title)
  })

  // Greedy lane assignment
  const laneEnds: number[] = []
  return raw.map((r) => {
    let lane = laneEnds.findIndex((end) => end < r.startCol)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = r.endCol
    return { ...r, lane }
  })
}

// ── Week row ───────────────────────────────────────────────────────────────────

function WeekRow({ week, trips }: { week: CalDay[]; trips: Trip[] }) {
  const bands = useMemo(() => computeBands(week, trips), [week, trips])

  const visibleBands  = bands.filter((b) => b.lane < MAX_LANES)
  const hiddenBands   = bands.filter((b) => b.lane >= MAX_LANES)

  // Count hidden trips per column (for the "+N" indicators)
  const overflowByCol: Record<number, number> = {}
  hiddenBands.forEach((b) => {
    for (let c = b.startCol; c <= b.endCol; c++) {
      overflowByCol[c] = (overflowByCol[c] ?? 0) + 1
    }
  })

  const visibleLaneCount = visibleBands.length > 0
    ? Math.min(bands.reduce((m, b) => Math.max(m, b.lane), -1) + 1, MAX_LANES)
    : 0
  const hasOverflow = hiddenBands.length > 0
  const eventsHeight = visibleLaneCount * (LANE_H + LANE_GAP) + (hasOverflow ? 20 : 6)

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Day number cells */}
      <div className="grid grid-cols-7">
        {week.map((day) => (
          <div
            key={day.date.valueOf()}
            className={clsx(
              'px-1.5 pt-1.5 pb-0.5 border-r border-gray-100 last:border-0',
              !day.inMonth && 'opacity-30'
            )}
          >
            <span
              className={clsx(
                'inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium',
                day.isToday ? 'bg-brand-600 text-white' : 'text-gray-600'
              )}
            >
              {day.date.date()}
            </span>
          </div>
        ))}
      </div>

      {/* Event bands */}
      <div className="relative" style={{ height: eventsHeight }}>
        {visibleBands.map((band) => {
          const left  = `calc(${(band.startCol / 7) * 100}% + 2px)`
          const width = `calc(${((band.endCol - band.startCol + 1) / 7) * 100}% - 4px)`
          const top   = band.lane * (LANE_H + LANE_GAP) + 2

          return (
            <Link
              key={band.trip.id + band.startCol}
              to={`/trips/${band.trip.id}`}
              title={band.trip.title}
              className={clsx(
                'absolute flex items-center px-2 text-[11px] font-medium truncate leading-none transition-opacity hover:opacity-75',
                STATUS_STYLE[band.trip.status] ?? STATUS_STYLE.COMPLETED,
                !band.continuesLeft  && 'rounded-l-full',
                !band.continuesRight && 'rounded-r-full',
              )}
              style={{ left, width, top, height: LANE_H }}
            >
              {!band.continuesLeft && band.trip.title}
            </Link>
          )
        })}

        {/* Overflow "+N" indicators, one per starting column of hidden trips */}
        {hiddenBands
          .filter((b, i, arr) => arr.findIndex(x => x.startCol === b.startCol) === i)
          .map((b) => (
            <span
              key={`ov-${b.startCol}`}
              className="absolute text-[10px] text-gray-400 font-medium"
              style={{
                left: `calc(${(b.startCol / 7) * 100}% + 6px)`,
                top: MAX_LANES * (LANE_H + LANE_GAP) + 2,
              }}
            >
              +{overflowByCol[b.startCol]} more
            </span>
          ))}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const today = dayjs()
  const [year,  setYear]  = useState(today.year())
  const [month, setMonth] = useState(today.month()) // 0-indexed

  const { data } = useTrips({ size: 200 })
  const trips = data?.content ?? []

  const grid    = useMemo(() => buildGrid(year, month), [year, month])
  const undated = useMemo(() => trips.filter((t) => !t.startDate && !t.endDate), [trips])

  function prev() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  function next() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const monthLabel = dayjs(new Date(year, month, 1)).format('MMMM YYYY')

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          {/* Today button */}
          <button
            onClick={() => { setYear(today.year()); setMonth(today.month()) }}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          {/* Month navigation */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={prev}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-semibold text-gray-800 min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={next}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-5 mb-4">
        {(['PLANNED', 'ONGOING', 'COMPLETED'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={clsx('w-2.5 h-2.5 rounded-full', STATUS_DOT[s])} />
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-100 last:border-0"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {grid.map((week, wi) => (
          <WeekRow key={wi} week={week} trips={trips} />
        ))}
      </div>

      {/* Undated trips */}
      {undated.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Trips without dates
          </p>
          <div className="flex flex-wrap gap-2">
            {undated.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border hover:opacity-75 transition-opacity',
                  STATUS_STYLE[trip.status]
                )}
              >
                {trip.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
