import { useState, useMemo } from 'react'
import { Plus, ListChecks, Search } from 'lucide-react'
import { clsx } from 'clsx'
import { useBucketList } from '@/features/bucketlist/hooks/useBucketList'
import { BucketListItemCard } from '@/features/bucketlist/components/BucketListItemCard'
import { AddBucketListModal } from '@/features/bucketlist/components/AddBucketListModal'

type Filter = 'all' | 'pending' | 'completed'

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

// ─── Skeleton ────────────────────────────────────────────────────────────────
function BucketListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ filter, onAdd }: { filter: Filter; onAdd: () => void }) {
  if (filter === 'completed') {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">🏅</div>
        <h3 className="font-semibold text-gray-900 mb-1">No completed destinations yet</h3>
        <p className="text-sm text-gray-400">Mark places as visited when you go there.</p>
      </div>
    )
  }
  if (filter === 'pending') {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-semibold text-gray-900 mb-1">You're all caught up!</h3>
        <p className="text-sm text-gray-400">All your bucket list items have been completed.</p>
      </div>
    )
  }
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🌏</div>
      <h3 className="font-semibold text-gray-900 mb-2">Your bucket list is empty</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
        Add places you dream of visiting. Check them off when you get there.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add first destination
      </button>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  completed: number
  total: number
}

function ProgressBar({ completed, total }: ProgressBarProps) {
  if (total === 0) return null
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {completed} of {total} destinations visited
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {total - completed} {total - completed === 1 ? 'place' : 'places'} still to explore
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-brand-600">{pct}%</span>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {completed === total && total > 0 && (
        <p className="text-xs text-brand-600 font-medium mt-2 text-center">
          🎉 You've visited every destination on your list!
        </p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function BucketListPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useBucketList()
  const items = data?.content ?? []

  const completed = items.filter((i) => i.completed)
  const pending   = items.filter((i) => !i.completed)

  const filtered = useMemo(() => {
    let base = items
    if (activeFilter === 'completed') base = completed
    if (activeFilter === 'pending')   base = pending

    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        (i) =>
          i.destinationName.toLowerCase().includes(q) ||
          i.country.toLowerCase().includes(q)
      )
    }
    return base
  }, [items, activeFilter, search, completed, pending])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-brand-500" />
            Bucket list
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {items.length === 0
              ? 'Places you dream of visiting'
              : `${pending.length} pending · ${completed.length} visited`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add place</span>
        </button>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <ProgressBar completed={completed.length} total={items.length} />
      )}

      {/* Filter tabs + search */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Filter pills */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeFilter === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {label}
                {value === 'all'       && <span className="ml-1.5 text-xs text-gray-400">{items.length}</span>}
                {value === 'pending'   && <span className="ml-1.5 text-xs text-gray-400">{pending.length}</span>}
                {value === 'completed' && <span className="ml-1.5 text-xs text-gray-400">{completed.length}</span>}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <BucketListSkeleton />
      ) : isError ? (
        <div className="text-center py-24 text-gray-400">
          <p>Failed to load bucket list. Please try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No results for "<span className="font-medium">{search}</span>"</p>
          </div>
        ) : (
          <EmptyState filter={activeFilter} onAdd={() => setModalOpen(true)} />
        )
      ) : (
        <div className="space-y-3">
          {/* Pending section */}
          {activeFilter === 'all' && pending.length > 0 && filtered.some((i) => !i.completed) && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Still to visit
            </p>
          )}
          {filtered
            .filter((i) => !i.completed)
            .map((item) => (
              <BucketListItemCard key={item.id} item={item} />
            ))}

          {/* Completed section */}
          {activeFilter === 'all' && filtered.some((i) => i.completed) && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-2">
                Visited ✓
              </p>
              {filtered
                .filter((i) => i.completed)
                .map((item) => (
                  <BucketListItemCard key={item.id} item={item} />
                ))}
            </>
          )}

          {/* Flat list for non-"all" filters */}
          {activeFilter !== 'all' &&
            filtered.map((item) => <BucketListItemCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Modal */}
      <AddBucketListModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
