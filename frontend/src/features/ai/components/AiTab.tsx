import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sparkles, Map, Package, Calendar, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { aiApiClient } from '../api/aiApi'

interface Props {
  tripId: string
  tripTitle: string
  destinations?: string[]
  startDate?: string | null
  endDate?: string | null
}

type Panel = 'suggestions' | 'packing' | 'itinerary'

export function AiTab({ tripTitle, destinations = [], startDate, endDate }: Props) {
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const [destination, setDestination] = useState(destinations[0] || '')
  const [customDestination, setCustomDestination] = useState('')
  const [interests, setInterests] = useState('')
  const [tripType, setTripType] = useState('leisure')
  const [travelStyle, setTravelStyle] = useState('balanced')

  const effectiveDestination = customDestination.trim() || destination || tripTitle

  const suggestions = useMutation({
    mutationFn: () =>
      aiApiClient.getSuggestions({
        destination: effectiveDestination,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        interests: interests ? interests.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      }),
  })

  const packingList = useMutation({
    mutationFn: () =>
      aiApiClient.getPackingList({
        destination: effectiveDestination,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        tripType,
      }),
  })

  const itinerary = useMutation({
    mutationFn: () =>
      aiApiClient.getItinerary({
        destination: effectiveDestination,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        style: travelStyle,
      }),
  })

  function togglePanel(panel: Panel) {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const panels = [
    {
      key: 'suggestions' as Panel,
      label: 'Travel Suggestions',
      icon: Map,
      description: 'Top attractions, local tips, food recommendations',
      mutation: suggestions,
      color: 'brand',
    },
    {
      key: 'packing' as Panel,
      label: 'Packing List',
      icon: Package,
      description: 'Smart packing checklist for your destination',
      mutation: packingList,
      color: 'green',
    },
    {
      key: 'itinerary' as Panel,
      label: 'Day-by-Day Itinerary',
      icon: Calendar,
      description: 'A complete day-by-day travel plan',
      mutation: itinerary,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI Travel Assistant</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Groq · llama-3.3-70b</p>
          </div>
        </div>
      </div>

      {/* Destination input */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination</p>

        {destinations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {destinations.map((d) => (
              <button
                key={d}
                onClick={() => { setDestination(d); setCustomDestination('') }}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  destination === d && !customDestination
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-brand-300'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder={destinations.length > 0 ? 'Or type a custom destination…' : 'Enter destination (e.g. Tokyo, Japan)'}
          value={customDestination}
          onChange={(e) => setCustomDestination(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Panels */}
      <div className="space-y-3">
        {panels.map(({ key, label, icon: Icon, description, mutation }) => {
          const isOpen = activePanel === key
          const isPending = mutation.isPending
          const data = mutation.data?.data?.data
          const error = mutation.error

          return (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Panel header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
                onClick={() => togglePanel(key)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Panel body */}
              {isOpen && (
                <div className="px-4 pb-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  {/* Panel-specific options */}
                  {key === 'suggestions' && (
                    <div className="pt-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Interests (optional, comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. food, history, hiking"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {key === 'packing' && (
                    <div className="pt-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trip type</label>
                      <select
                        value={tripType}
                        onChange={(e) => setTripType(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="leisure">Leisure / Holiday</option>
                        <option value="business">Business</option>
                        <option value="adventure">Adventure / Outdoors</option>
                        <option value="beach">Beach</option>
                        <option value="backpacking">Backpacking</option>
                      </select>
                    </div>
                  )}

                  {key === 'itinerary' && (
                    <div className="pt-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Travel style</label>
                      <select
                        value={travelStyle}
                        onChange={(e) => setTravelStyle(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="balanced">Balanced (mix of must-sees + leisure)</option>
                        <option value="packed">Packed (see as much as possible)</option>
                        <option value="relaxed">Relaxed (slow travel, deep immersion)</option>
                        <option value="budget">Budget-conscious</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                  )}

                  {/* Generate button */}
                  <button
                    onClick={() => mutation.mutate()}
                    disabled={isPending || !effectiveDestination}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isPending || !effectiveDestination
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate {label}
                      </>
                    )}
                  </button>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        {(error as any)?.response?.data?.message ||
                          (error as any)?.message ||
                          'Failed to generate. Check that the AI service is running and your Groq API key is set.'}
                      </span>
                    </div>
                  )}

                  {/* Results */}
                  {data && key === 'suggestions' && <SuggestionsResult data={data} />}
                  {data && key === 'packing' && <PackingResult data={data} />}
                  {data && key === 'itinerary' && <ItineraryResult data={data} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Result renderers ───────────────────────────────────────── */

function SuggestionsResult({ data }: { data: any }) {
  return (
    <div className="space-y-4 mt-2">
      {data.bestTimeToVisit && (
        <InfoCard label="Best time to visit" value={data.bestTimeToVisit} />
      )}

      {data.transportation && (
        <InfoCard label="Getting around" value={data.transportation} />
      )}

      {data.budgetEstimate && (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-600 p-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Daily budget estimate</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(['budget', 'midRange', 'luxury'] as const).map((tier) => (
              <div key={tier} className="bg-white dark:bg-gray-700 rounded-lg p-2">
                <p className="text-xs text-gray-400 capitalize">{tier === 'midRange' ? 'Mid-range' : tier}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{data.budgetEstimate[tier]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topAttractions?.length > 0 && (
        <Section label="Top Attractions">
          {data.topAttractions.map((a: any, i: number) => (
            <AttractionCard key={i} name={a.name} description={a.description} tag={a.category} />
          ))}
        </Section>
      )}

      {data.foodRecommendations?.length > 0 && (
        <Section label="Food & Drink">
          {data.foodRecommendations.map((f: any, i: number) => (
            <AttractionCard key={i} name={f.name} description={f.description} tag={f.type} />
          ))}
        </Section>
      )}

      {data.localTips?.length > 0 && (
        <Section label="Local Tips">
          <ul className="space-y-1.5">
            {data.localTips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-brand-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function PackingResult({ data }: { data: any }) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  function toggle(name: string) {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="space-y-3 mt-2">
      {data.categories?.map((cat: any) => (
        <div key={cat.name} className="rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => toggle(cat.name)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-750 text-left"
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
            <span className="text-xs text-gray-400">{cat.items?.length} items</span>
          </button>
          {openCategories[cat.name] && (
            <ul className="divide-y divide-gray-50 dark:divide-gray-700">
              {cat.items?.map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-3 px-3 py-2 bg-white dark:bg-gray-800">
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      item.essential ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-500'
                    )}
                  />
                  <div>
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {item.item}
                      {item.essential && (
                        <span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium">essential</span>
                      )}
                    </span>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {data.generalTips?.length > 0 && (
        <Section label="Packing Tips">
          <ul className="space-y-1.5">
            {data.generalTips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-brand-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function ItineraryResult({ data }: { data: any }) {
  const [openDay, setOpenDay] = useState<number | null>(0)

  return (
    <div className="space-y-2 mt-2">
      {data.days?.map((day: any, i: number) => (
        <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => setOpenDay(openDay === i ? null : i)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-750 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {day.day}
              </span>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{day.theme}</span>
                {day.date && <span className="text-xs text-gray-400 ml-2">{day.date}</span>}
              </div>
            </div>
            {openDay === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {openDay === i && (
            <div className="px-3 pb-3 pt-2 bg-white dark:bg-gray-800 space-y-2">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                const slot = day[period]
                if (!slot) return null
                return (
                  <div key={period} className="flex gap-2.5">
                    <div className="w-16 flex-shrink-0 text-xs font-medium text-gray-400 capitalize pt-0.5">{period}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{slot.activity}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{slot.description}</p>
                      {slot.duration && (
                        <p className="text-xs text-gray-400 mt-0.5">⏱ {slot.duration}</p>
                      )}
                    </div>
                  </div>
                )
              })}
              {day.tips && (
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                  💡 {day.tips}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {data.overallTips?.length > 0 && (
        <Section label="Overall Tips">
          <ul className="space-y-1.5">
            {data.overallTips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-brand-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

/* ── Small reusable sub-components ─────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-600 p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  )
}

function AttractionCard({ name, description, tag }: { name: string; description: string; tag?: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-600 p-3 mb-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
        {tag && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 text-xs">
            {tag}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  )
}
