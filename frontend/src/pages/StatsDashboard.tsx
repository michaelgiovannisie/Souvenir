import { Globe, Plane, Clock, MapPin, BookOpen, Camera, Trophy, Sunrise } from 'lucide-react'
import { clsx } from 'clsx'
import { useStats } from '@/features/stats/hooks/useStats'
import { getContinentsFromCountries, CONTINENT_COLORS, CONTINENT_EMOJI } from '@/features/stats/utils/continents'
import { useAuthStore } from '@/store/authStore'

// ─── Skeleton ───────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ─── Big stat card ───────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  gradient: string
  sub?: string
}

function StatCard({ label, value, icon, gradient, sub }: StatCardProps) {
  return (
    <div className={clsx('rounded-2xl p-5 text-white relative overflow-hidden', gradient)}>
      {/* Background icon */}
      <div className="absolute -right-3 -bottom-3 opacity-10 text-white">
        <div className="w-20 h-20">{icon}</div>
      </div>

      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
          {icon}
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-white/80 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Top countries bar chart ─────────────────────────────────────────────────
interface TopCountriesProps {
  topCountries: { country: string; count: number }[]
}

function TopCountries({ topCountries }: TopCountriesProps) {
  if (topCountries.length === 0) return null
  const max = topCountries[0].count

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Most visited countries</h3>
      <div className="space-y-3">
        {topCountries.map((item, i) => (
          <div key={item.country}>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="text-gray-400 text-xs w-4">{i + 1}</span>
                {item.country}
              </span>
              <span className="text-gray-400 text-xs">
                {item.count} {item.count === 1 ? 'place' : 'places'}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-700"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Continents breakdown ────────────────────────────────────────────────────
interface ContinentsProps {
  countries: string[]
}

function ContinentsBreakdown({ countries }: ContinentsProps) {
  const visited = getContinentsFromCountries(countries)
  const all = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Continents</h3>
        <span className="text-2xl font-bold text-brand-600">{visited.size}<span className="text-sm text-gray-400 font-normal"> / 6</span></span>
      </div>
      <div className="space-y-2">
        {all.map((continent) => {
          const isVisited = visited.has(continent)
          return (
            <div
              key={continent}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                isVisited ? 'bg-gray-50' : 'opacity-40'
              )}
            >
              <span className="text-lg">{CONTINENT_EMOJI[continent]}</span>
              <span className={clsx('text-sm font-medium flex-1', isVisited ? 'text-gray-800' : 'text-gray-400')}>
                {continent}
              </span>
              {isVisited && (
                <div className={clsx('w-2 h-2 rounded-full', CONTINENT_COLORS[continent])} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Milestone cards ─────────────────────────────────────────────────────────
interface MilestoneProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
}

function MilestoneCard({ icon, label, value, sub, color }: MilestoneProps) {
  return (
    <div className={clsx('rounded-2xl border p-4 flex items-start gap-3', color)}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className="font-bold text-gray-900 text-base leading-snug truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Countries visited list ───────────────────────────────────────────────────
function CountriesList({ countries }: { countries: string[] }) {
  if (countries.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-3">
        Countries visited
        <span className="ml-2 text-sm text-gray-400 font-normal">({countries.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <span
            key={c}
            className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export function StatsDashboard() {
  const { user } = useAuthStore()
  const { data: stats, isLoading, isError } = useStats()

  if (isLoading) return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your travel stats</h1>
      <StatSkeleton />
    </div>
  )

  if (isError || !stats) return (
    <div className="text-center py-24 text-gray-400">
      <p>Failed to load stats. Please try again.</p>
    </div>
  )

  const continentsVisited = getContinentsFromCountries(stats.countriesVisited)

  // Empty state — brand new user
  if (stats.totalTrips === 0) return (
    <div className="text-center py-32">
      <div className="text-6xl mb-4">✈️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No stats yet</h2>
      <p className="text-gray-500 text-sm">
        Create your first trip to start tracking your travel journey.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your travel stats</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {user?.displayName}'s journey so far
        </p>
      </div>

      {/* Hero stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Countries"
          value={stats.uniqueCountries}
          icon={<Globe className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-brand-500 to-brand-700"
          sub={`${continentsVisited.size} continent${continentsVisited.size !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Trips taken"
          value={stats.totalTrips}
          icon={<Plane className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-violet-500 to-purple-700"
          sub={`${stats.completedTrips} completed`}
        />
        <StatCard
          label="Days traveled"
          value={stats.totalDaysTraveled}
          icon={<Sunrise className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-amber-400 to-orange-600"
          sub={stats.longestTripDays > 0 ? `Longest: ${stats.longestTripDays}d` : undefined}
        />
        <StatCard
          label="Places visited"
          value={stats.totalDestinations}
          icon={<MapPin className="w-5 h-5 text-white" />}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          sub={`${stats.uniqueCities} unique cities`}
        />
      </div>

      {/* Second row: charts + continents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TopCountries topCountries={stats.topCountries} />
        </div>
        <ContinentsBreakdown countries={stats.countriesVisited} />
      </div>

      {/* Milestones row */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.mostVisitedCountry && (
            <MilestoneCard
              icon="🏆"
              label="Most visited country"
              value={stats.mostVisitedCountry}
              sub={`${stats.mostVisitedCountryCount} destination${stats.mostVisitedCountryCount !== 1 ? 's' : ''}`}
              color="border-amber-100 bg-amber-50"
            />
          )}
          {stats.longestTripTitle && (
            <MilestoneCard
              icon="🗓️"
              label="Longest trip"
              value={stats.longestTripTitle}
              sub={`${stats.longestTripDays} days`}
              color="border-blue-100 bg-blue-50"
            />
          )}
          <MilestoneCard
            icon="📖"
            label="Memories written"
            value={stats.totalMemories}
            color="border-purple-100 bg-purple-50"
          />
          <MilestoneCard
            icon="📷"
            label="Photos uploaded"
            value={stats.totalPhotos}
            color="border-rose-100 bg-rose-50"
          />
        </div>
      </div>

      {/* Trip status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Trip breakdown</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Completed', count: stats.completedTrips, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Ongoing',   count: stats.ongoingTrips,   color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Planned',   count: stats.plannedTrips,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={clsx('rounded-xl py-4', bg)}>
              <p className={clsx('text-2xl font-bold', color)}>{count}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Countries visited list */}
      {stats.countriesVisited.length > 0 && (
        <CountriesList countries={stats.countriesVisited} />
      )}
    </div>
  )
}
