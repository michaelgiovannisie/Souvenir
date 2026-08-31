import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, Camera, BookOpen, Clock, Globe, Plane } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useYearInReview } from '@/features/stats/hooks/useStats'

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MOOD_EMOJI: Record<string, string> = {
  HAPPY:        '😊',
  EXCITED:      '🤩',
  RELAXED:      '😌',
  ADVENTUROUS:  '🧗',
  ROMANTIC:     '❤️',
  NOSTALGIC:    '🥹',
  GRATEFUL:     '🙏',
  OVERWHELMED:  '😵',
  HOMESICK:     '🏡',
  TIRED:        '😴',
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED:   'bg-yellow-100 text-yellow-700',
  ONGOING:   'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount)}`
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label, icon: Icon, accent = false }: {
  value: string | number
  label: string
  icon: typeof Plane
  accent?: boolean
}) {
  return (
    <div className={clsx(
      'rounded-2xl p-5 flex flex-col gap-1',
      accent ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200'
    )}>
      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center mb-1',
        accent ? 'bg-white/20' : 'bg-brand-50'
      )}>
        <Icon className={clsx('w-4 h-4', accent ? 'text-white' : 'text-brand-600')} />
      </div>
      <p className={clsx('text-2xl font-bold', accent ? 'text-white' : 'text-gray-900')}>{value}</p>
      <p className={clsx('text-xs font-medium', accent ? 'text-white/70' : 'text-gray-500')}>{label}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function YearInReviewPage() {
  const currentYear = dayjs().year()
  const [year, setYear] = useState(currentYear)
  const { data, isLoading } = useYearInReview(year)

  const maxMonthActivity = data ? Math.max(...data.monthlyActivity, 1) : 1
  const totalMoods = data ? Object.values(data.moodBreakdown).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Year in Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your travel story, one year at a time.</p>
        </div>

        {/* Year stepper */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setYear(y => y - 1)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900 px-3 tabular-nums">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            disabled={year >= currentYear}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      )}

      {data && (
        <>
          {/* ── Hero banner ──────────────────────────────────────────────────── */}
          {data.tripsCount === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🗺️</p>
              <p className="text-lg font-semibold text-gray-500">No trips in {year}</p>
              <p className="text-sm mt-1">Add some trips with dates that fall in {year} and they'll appear here.</p>
            </div>
          ) : (
            <>
              {/* ── Stats grid ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard value={data.tripsCount}       label="Trips"        icon={Plane}    accent />
                <StatCard value={data.countriesCount}   label="Countries"    icon={Globe}         />
                <StatCard value={data.citiesCount}      label="Cities"       icon={MapPin}        />
                <StatCard value={data.daysAbroad}       label="Days abroad"  icon={Clock}         />
                <StatCard value={data.memoriesCount}    label="Memories"     icon={BookOpen}      />
                <StatCard value={data.photosCount}      label="Photos"       icon={Camera}        />
              </div>

              {/* ── Monthly activity ───────────────────────────────────────── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-5">Monthly activity</h2>
                <div className="grid grid-cols-12 gap-1.5">
                  {data.monthlyActivity.map((count, i) => {
                    const intensity = count === 0 ? 0 : Math.max(0.15, count / maxMonthActivity)
                    const isActive = count > 0
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-full rounded-lg transition-all"
                          style={{
                            height: '48px',
                            backgroundColor: isActive
                              ? `rgba(37, 99, 235, ${intensity})`
                              : '#f3f4f6',
                          }}
                          title={`${MONTH_FULL[i]}: ${count} trip${count !== 1 ? 's' : ''}`}
                        />
                        <span className="text-xs text-gray-400 font-medium">{MONTHS[i]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── Countries visited ──────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">Countries visited</h2>
                    {data.topCountry && (
                      <span className="text-xs text-gray-400">
                        🏆 Most visited: <span className="font-medium text-gray-600">{data.topCountry}</span>
                      </span>
                    )}
                  </div>
                  {data.countriesVisited.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No destinations logged.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.countriesVisited.map((c) => (
                        <span
                          key={c}
                          className={clsx(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            c === data.topCountry
                              ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Mood breakdown ─────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Memory moods</h2>
                  {Object.keys(data.moodBreakdown).length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No moods logged in memories this year.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(data.moodBreakdown).slice(0, 6).map(([mood, count]) => (
                        <div key={mood} className="flex items-center gap-3">
                          <span className="text-base w-6 text-center flex-shrink-0">
                            {MOOD_EMOJI[mood] ?? '💭'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-medium text-gray-600 capitalize">
                                {mood.charAt(0) + mood.slice(1).toLowerCase()}
                              </span>
                              <span className="text-xs text-gray-400">{count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-400 rounded-full transition-all"
                                style={{ width: `${(count / totalMoods) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Expenses ───────────────────────────────────────────────── */}
              {Object.keys(data.expenseTotals).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Total spent in {year}</h2>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(data.expenseTotals).map(([currency, total]) => (
                      <div key={currency} className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-3">
                        <p className="text-xl font-bold text-brand-800">{fmt(total, currency)}</p>
                        <p className="text-xs text-brand-500 mt-0.5">{currency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Trips of the year ──────────────────────────────────────── */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  {data.tripsCount} {data.tripsCount === 1 ? 'trip' : 'trips'} in {year}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.tripSummaries.map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    >
                      {/* Cover */}
                      <div className="h-36 bg-gradient-to-br from-brand-400 to-brand-600 relative overflow-hidden">
                        {trip.coverPhotoUrl ? (
                          <img
                            src={trip.coverPhotoUrl}
                            alt={trip.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-4xl opacity-60">🌍</div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_COLORS[trip.status])}>
                            {trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          {(trip.startDate || trip.endDate) && (
                            <span>
                              {trip.startDate ? dayjs(trip.startDate).format('MMM D') : '?'}
                              {trip.endDate ? ` – ${dayjs(trip.endDate).format('MMM D')}` : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {trip.destinationCount} {trip.destinationCount === 1 ? 'place' : 'places'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
