import { useState, useRef } from 'react'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useExpenses, useAddExpense, useDeleteExpense } from '../hooks/useExpenses'
import { ExpenseCategory } from '../api/expensesApi'

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: ExpenseCategory[] = [
  'ACCOMMODATION',
  'FOOD',
  'TRANSPORT',
  'ACTIVITIES',
  'SHOPPING',
  'OTHER',
]

const CATEGORY_META: Record<ExpenseCategory, { label: string; emoji: string; color: string }> = {
  ACCOMMODATION: { label: 'Accommodation', emoji: '🏨', color: 'bg-purple-100 text-purple-700' },
  FOOD:          { label: 'Food & Drink',  emoji: '🍽️', color: 'bg-orange-100 text-orange-700' },
  TRANSPORT:     { label: 'Transport',     emoji: '✈️', color: 'bg-sky-100    text-sky-700'    },
  ACTIVITIES:    { label: 'Activities',   emoji: '🎟️', color: 'bg-green-100  text-green-700'  },
  SHOPPING:      { label: 'Shopping',     emoji: '🛍️', color: 'bg-pink-100   text-pink-700'   },
  OTHER:         { label: 'Other',        emoji: '📌', color: 'bg-gray-100 dark:bg-gray-700   text-gray-600 dark:text-gray-300'   },
}

const COMMON_CURRENCIES = [
  'USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY',
  'INR','MXN','THB','SGD','KRW','BRL','NOK','SEK','DKK','NZD','HKD','AED',
]

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExpensesTab({ tripId }: { tripId: string }) {
  const { data: expenses = [], isLoading } = useExpenses(tripId)
  const { mutate: addExpense, isPending: isAdding } = useAddExpense(tripId)
  const { mutate: deleteExpense } = useDeleteExpense(tripId)

  // Derive trip currency from existing expenses; default USD
  const tripCurrency = expenses.length > 0 ? expenses[0].currency : 'USD'
  const [currency, setCurrency] = useState<string>(tripCurrency)

  // Sync currency selector when expenses first load
  const syncedRef = useRef(false)
  if (!syncedRef.current && expenses.length > 0) {
    syncedRef.current = true
    if (currency === 'USD' && expenses[0].currency !== 'USD') {
      setCurrency(expenses[0].currency)
    }
  }

  // ── Add form state ─────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('OTHER')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState(dayjs().format('YYYY-MM-DD'))

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(formAmount)
    if (isNaN(amount) || amount <= 0) return

    addExpense(
      {
        amount,
        currency,
        category: formCategory,
        description: formDescription.trim() || undefined,
        expenseDate: formDate,
      },
      {
        onSuccess: () => {
          setFormAmount('')
          setFormDescription('')
          setFormCategory('OTHER')
          setFormDate(dayjs().format('YYYY-MM-DD'))
          setShowForm(false)
        },
      }
    )
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = CATEGORY_ORDER.reduce<Record<ExpenseCategory, typeof expenses>>((acc, cat) => {
    acc[cat] = expenses.filter((e) => e.category === cat)
    return acc
  }, {} as Record<ExpenseCategory, typeof expenses>)

  const [collapsedCategories, setCollapsedCategories] = useState<Set<ExpenseCategory>>(new Set())

  function toggleCategory(cat: ExpenseCategory) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header row: total + currency selector + add button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {fmt(total, currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 cursor-pointer"
          >
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Add button */}
          <button
            onClick={() => setShowForm((v) => !v)}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
              showForm
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            )}
          >
            <Plus className="w-4 h-4" />
            Add expense
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Hotel check-in"
                maxLength={200}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !formAmount}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {expenses.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-3">💸</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No expenses yet</p>
          <p className="text-xs mt-1">Track what you spend during your trip.</p>
        </div>
      )}

      {/* Category groups */}
      {expenses.length > 0 && (
        <div className="space-y-3">
          {CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0).map((cat) => {
            const items = byCategory[cat]
            const meta = CATEGORY_META[cat]
            const catTotal = items.reduce((sum, e) => sum + e.amount, 0)
            const isCollapsed = collapsedCategories.has(cat)

            return (
              <div key={cat} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', meta.color)}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {fmt(catTotal, currency)}
                    </span>
                    {isCollapsed
                      ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    }
                  </div>
                </button>

                {/* Expense rows */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {items.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between px-4 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-100 truncate">
                            {expense.description || <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {dayjs(expense.expenseDate).format('MMM D, YYYY')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {fmt(expense.amount, currency)}
                          </span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Grand total footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl">
            <span className="text-sm font-medium text-brand-700">Total</span>
            <span className="text-base font-bold text-brand-800">{fmt(total, currency)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
