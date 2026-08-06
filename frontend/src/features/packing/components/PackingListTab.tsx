import { useRef, useState, KeyboardEvent } from 'react'
import { Trash2, Loader2, Package } from 'lucide-react'
import { clsx } from 'clsx'
import {
  usePacking,
  useAddPackingItem,
  useUpdatePackingItem,
  useDeletePackingItem,
} from '../hooks/usePacking'
import type { PackingCategory, PackingItem } from '../api/packingApi'

// ── Category metadata ──────────────────────────────────────────────────────────

const CATEGORY_ORDER: (PackingCategory | null)[] = [
  'CLOTHES',
  'TOILETRIES',
  'ELECTRONICS',
  'DOCUMENTS',
  'HEALTH',
  'ACCESSORIES',
  'MISC',
  null, // uncategorised goes last
]

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  CLOTHES:     { emoji: '👕', label: 'Clothes' },
  TOILETRIES:  { emoji: '🧴', label: 'Toiletries' },
  ELECTRONICS: { emoji: '💻', label: 'Electronics' },
  DOCUMENTS:   { emoji: '📄', label: 'Documents' },
  HEALTH:      { emoji: '💊', label: 'Health' },
  ACCESSORIES: { emoji: '🎒', label: 'Accessories' },
  MISC:        { emoji: '📦', label: 'Misc' },
  __NONE__:    { emoji: '📦', label: 'Other' },
}

const CATEGORY_OPTIONS: { value: PackingCategory | ''; label: string }[] = [
  { value: '',            label: 'No category' },
  { value: 'CLOTHES',     label: '👕 Clothes' },
  { value: 'TOILETRIES',  label: '🧴 Toiletries' },
  { value: 'ELECTRONICS', label: '💻 Electronics' },
  { value: 'DOCUMENTS',   label: '📄 Documents' },
  { value: 'HEALTH',      label: '💊 Health' },
  { value: 'ACCESSORIES', label: '🎒 Accessories' },
  { value: 'MISC',        label: '📦 Misc' },
]

// ── Quick-add form ─────────────────────────────────────────────────────────────

function AddItemForm({ tripId }: { tripId: string }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PackingCategory | ''>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: add, isPending } = useAddPackingItem(tripId)

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    add(
      { name: trimmed, category: category || undefined },
      {
        onSuccess: () => {
          setName('')
          inputRef.current?.focus()
        },
      }
    )
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={onKey}
        placeholder="Add an item…"
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white placeholder:text-gray-400"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as PackingCategory | '')}
        className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-700"
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={submit}
        disabled={isPending || !name.trim()}
        className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '+'}
        <span className="hidden sm:inline">Add</span>
      </button>
    </div>
  )
}

// ── Single item row ────────────────────────────────────────────────────────────

function PackingItemRow({
  item,
  tripId,
}: {
  item: PackingItem
  tripId: string
}) {
  const { mutate: update, isPending: isUpdating } = useUpdatePackingItem(tripId)
  const { mutate: remove, isPending: isDeleting } = useDeletePackingItem(tripId)

  function togglePacked() {
    update({ itemId: item.id, payload: { packed: !item.packed } })
  }

  return (
    <div
      className={clsx(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
        item.packed ? 'bg-gray-50' : 'hover:bg-gray-50'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={togglePacked}
        disabled={isUpdating}
        className={clsx(
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          item.packed
            ? 'bg-brand-500 border-brand-500'
            : 'border-gray-300 hover:border-brand-400'
        )}
      >
        {isUpdating ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin text-white" />
        ) : item.packed ? (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </button>

      {/* Name */}
      <span
        className={clsx(
          'flex-1 text-sm transition-colors',
          item.packed ? 'line-through text-gray-400' : 'text-gray-800'
        )}
      >
        {item.name}
      </span>

      {/* Quantity badge (only if > 1) */}
      {item.quantity > 1 && (
        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
          ×{item.quantity}
        </span>
      )}

      {/* Delete (hover) */}
      <button
        onClick={() => remove(item.id)}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
        title="Remove item"
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}

// ── Main tab ───────────────────────────────────────────────────────────────────

export function PackingListTab({ tripId }: { tripId: string }) {
  const { data: items = [], isLoading } = usePacking(tripId)

  const total = items.length
  const packed = items.filter((i) => i.packed).length
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100)
  const allDone = total > 0 && packed === total

  // Group by category in defined order
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: items.filter((i) => (i.category ?? null) === cat),
  })).filter((g) => g.items.length > 0)

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded-xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {packed} / {total} packed
            </span>
            {allDone ? (
              <span className="text-green-600 font-medium">All packed! 🎉</span>
            ) : (
              <span className="font-semibold text-brand-700">{pct}%</span>
            )}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                allDone
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-brand-400 to-brand-600'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick-add */}
      <AddItemForm tripId={tripId} />

      {/* Empty state */}
      {total === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No items yet — start adding things to pack</p>
        </div>
      )}

      {/* Category groups */}
      {groups.map(({ cat, items: groupItems }) => {
        const key = cat ?? '__NONE__'
        const meta = CATEGORY_META[key]

        // Within each group: unpacked first, then packed
        const unpacked = groupItems.filter((i) => !i.packed)
        const packedInGroup = groupItems.filter((i) => i.packed)

        return (
          <div key={key}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-700">
                {meta.emoji} {meta.label}
              </span>
              <span className="text-xs text-gray-400">
                {groupItems.filter((i) => i.packed).length}/{groupItems.length}
              </span>
            </div>

            {/* Unpacked items */}
            <div>
              {unpacked.map((item) => (
                <PackingItemRow key={item.id} item={item} tripId={tripId} />
              ))}
              {packedInGroup.map((item) => (
                <PackingItemRow key={item.id} item={item} tripId={tripId} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
