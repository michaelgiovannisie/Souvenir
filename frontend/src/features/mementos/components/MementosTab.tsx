import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, MapPin, User, Gift } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useMementos, useAddMemento, useUpdateMemento, useDeleteMemento } from '../hooks/useMementos'
import type { Memento, MementoType } from '../api/mementosApi'

// ── Metadata ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<MementoType, { label: string; emoji: string; icon: typeof User; color: string; bg: string; border: string }> = {
  PERSON: {
    label: 'Person',
    emoji: '👤',
    icon: User,
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/50',
  },
  SOUVENIR: {
    label: 'Souvenir',
    emoji: '🎁',
    icon: Gift,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-100 dark:border-rose-800/50',
  },
}

// ── Inline edit card ──────────────────────────────────────────────────────────

function MementoCard({
  memento,
  tripId,
  onDelete,
}: {
  memento: Memento
  tripId: string
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(memento.name)
  const [description, setDescription] = useState(memento.description ?? '')
  const [location, setLocation] = useState(memento.location ?? '')
  const [type, setType] = useState<MementoType>(memento.type)
  const { mutate: update, isPending } = useUpdateMemento(tripId)

  const meta = TYPE_META[memento.type]

  function save() {
    if (!name.trim()) return
    update(
      { id: memento.id, payload: { type, name: name.trim(), description: description.trim() || undefined, location: location.trim() || undefined } },
      { onSuccess: () => setEditing(false) }
    )
  }

  function cancel() {
    setName(memento.name)
    setDescription(memento.description ?? '')
    setLocation(memento.location ?? '')
    setType(memento.type)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 border-2 border-brand-300 dark:border-brand-700 rounded-2xl space-y-3">
        {/* Type toggle */}
        <div className="flex gap-2">
          {(Object.keys(TYPE_META) as MementoType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={clsx(
                'flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors border',
                type === t
                  ? `${TYPE_META[t].bg} ${TYPE_META[t].color} ${TYPE_META[t].border}`
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
              )}
            >
              {TYPE_META[t].emoji} {TYPE_META[t].label}
            </button>
          ))}
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name *"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          autoFocus
        />
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Where? (optional)"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={type === 'PERSON' ? 'How did you meet? Any notes…' : 'What is it? Where\'s it from?'}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={cancel} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={save}
            disabled={isPending || !name.trim()}
            className="p-1.5 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 disabled:opacity-40 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('group p-4 border rounded-2xl transition-shadow hover:shadow-sm', meta.bg, meta.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-lg leading-none mt-0.5 flex-shrink-0">{meta.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{memento.name}</p>
            {memento.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{memento.location}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {memento.description && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 ml-7 leading-relaxed line-clamp-3">
          {memento.description}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-7">
        {dayjs(memento.createdAt).format('MMM D, YYYY')}
      </p>
    </div>
  )
}

// ── Add form ──────────────────────────────────────────────────────────────────

function AddMementoForm({ tripId, onDone }: { tripId: string; onDone: () => void }) {
  const [type, setType] = useState<MementoType>('PERSON')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: add, isPending } = useAddMemento(tripId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    add(
      { type, name: name.trim(), description: description.trim() || undefined, location: location.trim() || undefined },
      {
        onSuccess: () => {
          setName(''); setLocation(''); setDescription(''); setType('PERSON')
          onDone()
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3"
    >
      {/* Type toggle */}
      <div className="flex gap-2">
        {(Object.keys(TYPE_META) as MementoType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border',
              type === t
                ? `${TYPE_META[t].bg} ${TYPE_META[t].color} ${TYPE_META[t].border}`
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            )}
          >
            {TYPE_META[t].emoji} {TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {type === 'PERSON' ? 'Their name' : 'What is it'} *
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={200}
            placeholder={type === 'PERSON' ? 'e.g. Maria' : 'e.g. Hand-painted vase'}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Where</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            maxLength={200}
            placeholder="e.g. Kyoto, Japan"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {type === 'PERSON' ? 'How you met / notes' : 'Description / story'}
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
          rows={2}
          placeholder={type === 'PERSON' ? 'We met at a hostel rooftop, they showed us the best ramen…' : 'Found at a tiny market stall — the artist spoke no English but…'}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MementosTab({ tripId }: { tripId: string }) {
  const { data: mementos = [], isLoading } = useMementos(tripId)
  const { mutate: deleteMemento } = useDeleteMemento(tripId)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<MementoType | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? mementos : mementos.filter(m => m.type === filter)
  const people = mementos.filter(m => m.type === 'PERSON')
  const souvenirs = mementos.filter(m => m.type === 'SOUVENIR')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Filter pills */}
          {(['ALL', 'PERSON', 'SOUVENIR'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {f === 'ALL'
                ? `All (${mementos.length})`
                : f === 'PERSON'
                ? `👤 People (${people.length})`
                : `🎁 Souvenirs (${souvenirs.length})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(v => !v)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
            showForm
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          )}
        >
          <Plus className="w-4 h-4" />
          Add memento
        </button>
      </div>

      {/* Add form */}
      {showForm && <AddMementoForm tripId={tripId} onDone={() => setShowForm(false)} />}

      {/* Empty state */}
      {mementos.length === 0 && !showForm && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-3">🎒</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No mementos yet</p>
          <p className="text-xs mt-1">Remember the people you met and things you collected.</p>
        </div>
      )}

      {/* Cards grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(m => (
            <MementoCard
              key={m.id}
              memento={m}
              tripId={tripId}
              onDelete={() => deleteMemento(m.id)}
            />
          ))}
        </div>
      )}

      {/* Filtered empty */}
      {mementos.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
          No {filter === 'PERSON' ? 'people' : 'souvenirs'} recorded yet.
        </p>
      )}
    </div>
  )
}
