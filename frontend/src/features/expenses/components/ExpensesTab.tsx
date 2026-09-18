import { useState, useRef, useEffect } from 'react'
import { Trash2, Plus, ChevronDown, ChevronUp, Target, Check } from 'lucide-react'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { useExpenses, useAddExpense, useDeleteExpense } from '../hooks/useExpenses'
import { useGetBudgets, useSaveBudgets } from '../hooks/useBudgets'
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
  OTHER:         { label: 'Other',        emoji: '📌', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
}

const COMMON_CURRENCIES = [
  'USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY',
  'INR','MXN','THB','SGD','KRW','BRL','NOK','SEK','DKK','NZD','HKD','AED',
]

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ── Budget progress bar ────────────────────────────────────────────────────────

function BudgetBar({ spent, budget, currency }: { spent: number; budget: number; currency: string }) {
  const pct = Math.min((spent / budget) * 100, 100)
  const over = spent > budget

  const barColor = over
    ? 'bg-red-500'
    : pct >= 80
    ? 'bg-amber-400'
    : 'bg-green-500'

  return (
    <div className="px-4 pb-2.5 pt-0.5">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={clsx('font-medium', over ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
          {over
            ? `${fmt(spent - budget, currency)} over budget`
            : `${fmt(budget - spent, currency)} remaining`}
        </span>
        <span className="text-gray-400 dark:text-gray-500">
          {fmt(spent, currency)} / {fmt(budget, currency)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ExpensesTab({ tripId }: { tripId: string }) {
  const { data: expenses = [], isLoading } = useExpenses(tripId)
  const { data: budgets = [] } = useGetBudgets(tripId)
  const { mutate: addExpense, isPending: isAdding } = useAddExpense(tripId)
  const { mutate: deleteExpense } = useDeleteExpense(tripId)
  const { mutate: saveBudgets, isPending: isSavingBudgets } = useSaveBudgets(tripId)

  // Derive trip currency from existing expenses or budgets; default USD
  const tripCurrency = expenses.length > 0
    ? expenses[0].currency
    : budgets.length > 0
    ? budgets[0].currency
    : 'USD'
  const [currency, setCurrency] = useState<string>(tripCurrency)

  // Sync currency selector when data first loads
  useEffect(() => {
    if (expenses.length > 0 || budgets.length > 0) {
      setCurrency(tripCurrency)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripCurrency])

  // ── Budget editor state ────────────────────────────────────────────────────
  const [showBudget, setShowBudget] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState<Record<ExpenseCategory, string>>(() => {
    const init = {} as Record<ExpenseCategory, string>
    CATEGORY_ORDER.forEach(cat => { init[cat] = '' })
    return init
  })
  const [budgetSaved, setBudgetSaved] = useState(false)

  function openBudgetPanel() {
    // Populate draft from current budgets
    const next = {} as Record<ExpenseCategory, string>
    CATEGORY_ORDER.forEach(cat => { next[cat] = '' })
    budgets.forEach(b => { next[b.category] = String(b.amount) })
    setBudgetDraft(next)
    setShowBudget(true)
  }

  function handleSaveBudgets() {
    const entries = CATEGORY_ORDER
      .filter(cat => budgetDraft[cat] && parseFloat(budgetDraft[cat]) > 0)
      .map(cat => ({
        category: cat,
        amount: parseFloat(budgetDraft[cat]),
        currency,
      }))
    saveBudgets({ budgets: entries }, {
      onSuccess: () => {
        setShowBudget(false)
        setBudgetSaved(true)
        setTimeout(() => setBudgetSaved(false), 2000)
      },
    })
  }

  // Build budget map for quick lookup
  const budgetMap: Record<string, number> = {}
  budgets.forEach(b => { budgetMap[b.category] = b.amount })

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
      { amount, currency, category: formCategory, description: formDescription.trim() || undefined, expenseDate: formDate },
      { onSuccess: () => { setFormAmount(''); setFormDescription(''); setFormCategory('OTHER'); setFormDate(dayjs().format('YYYY-MM-DD')); setShowForm(false) } }
    )
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = CATEGORY_ORDER.reduce<Record<ExpenseCategory, typeof expenses>>((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat)
    return acc
  }, {} as Record<ExpenseCategory, typeof expenses>)

  const [collapsedCategories, setCollapsedCategories] = useState<Set<ExpenseCategory>>(new Set())

  function toggleCategory(cat: ExpenseCategory) {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
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

  const totalBudget = CATEGORY_ORDER.reduce((sum, cat) => sum + (budgetMap[cat] ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total spent</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(total, currency)}</p>
            {totalBudget > 0 && (
              <span className={clsx(
                'text-xs font-medium',
                total > totalBudget ? 'text-red-500' : 'text-green-600 dark:text-green-400'
              )}>
                / {fmt(totalBudget, currency)} budget
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 cursor-pointer"
          >
            {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Budget toggle */}
          <button
            onClick={showBudget ? () => setShowBudget(false) : openBudgetPanel}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
              showBudget
                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                : budgets.length > 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {budgetSaved
              ? <><Check className="w-4 h-4 text-green-500" /> Saved</>
              : <><Target className="w-4 h-4" /> {budgets.length > 0 ? 'Edit budget' : 'Set budget'}</>
            }
          </button>

          {/* Add expense */}
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
            Add expense
          </button>
        </div>
      </div>

      {/* Budget editor panel */}
      {showBudget && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-600" />
              Budget targets
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Leave blank to remove a category's budget</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORY_ORDER.map(cat => {
              const meta = CATEGORY_META[cat]
              return (
                <div key={cat}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    {meta.emoji} {meta.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetDraft[cat]}
                      onChange={e => setBudgetDraft(prev => ({ ...prev, [cat]: e.target.value }))}
                      placeholder="No limit"
                      className="w-full pl-3 pr-12 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-medium pointer-events-none">
                      {currency}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowBudget(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBudgets}
              disabled={isSavingBudgets}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {isSavingBudgets ? 'Saving…' : 'Save budgets'}
            </button>
          </div>
        </div>
      )}

      {/* Add expense form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount ({currency}) *</label>
              <input
                type="number" step="0.01" min="0.01"
                value={formAmount} onChange={e => setFormAmount(e.target.value)}
                placeholder="0.00" required
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label>
              <input
                type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={formCategory} onChange={e => setFormCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              >
                {CATEGORY_ORDER.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <input
                type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)}
                placeholder="e.g. Hotel check-in" maxLength={200}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-transparent dark:focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={isAdding || !formAmount} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isAdding ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {expenses.length === 0 && !showForm && !showBudget && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-3">💸</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No expenses yet</p>
          <p className="text-xs mt-1">Track what you spend during your trip.</p>
        </div>
      )}

      {/* Category groups */}
      {expenses.length > 0 && (
        <div className="space-y-3">
          {CATEGORY_ORDER.filter(cat => byCategory[cat].length > 0).map(cat => {
            const items = byCategory[cat]
            const meta = CATEGORY_META[cat]
            const catTotal = items.reduce((sum, e) => sum + e.amount, 0)
            const catBudget = budgetMap[cat]
            const isCollapsed = collapsedCategories.has(cat)

            return (
              <div key={cat} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', meta.color)}>
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'text-sm font-semibold',
                      catBudget && catTotal > catBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-100'
                    )}>
                      {fmt(catTotal, currency)}
                      {catBudget && <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">/ {fmt(catBudget, currency)}</span>}
                    </span>
                    {isCollapsed
                      ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    }
                  </div>
                </button>

                {/* Budget progress bar (always visible if budget is set) */}
                {catBudget && catBudget > 0 && (
                  <BudgetBar spent={catTotal} budget={catBudget} currency={currency} />
                )}

                {/* Expense rows */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {items.map(expense => (
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
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{fmt(expense.amount, currency)}</span>
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
          <div className="flex items-center justify-between px-4 py-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl">
            <div>
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">Total</span>
              {totalBudget > 0 && (
                <span className="text-xs text-brand-500 dark:text-brand-400 ml-2">
                  ({Math.round((total / totalBudget) * 100)}% of {fmt(totalBudget, currency)} budget)
                </span>
              )}
            </div>
            <span className={clsx(
              'text-base font-bold',
              totalBudget > 0 && total > totalBudget
                ? 'text-red-600 dark:text-red-400'
                : 'text-brand-800 dark:text-brand-200'
            )}>
              {fmt(total, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
