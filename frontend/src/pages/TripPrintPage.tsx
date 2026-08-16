import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import dayjs from 'dayjs'
import { useTrip } from '@/features/trips/hooks/useTrips'
import { useTripDestinations } from '@/features/destinations/hooks/useDestinations'
import { useTripMemories } from '@/features/memories/hooks/useMemories'
import { MOODS } from '@/features/memories/schemas/memorySchema'

// ── Lookup maps ────────────────────────────────────────────────────────────────

const MOOD_LABEL = Object.fromEntries(MOODS.map((m) => [m.value, `${m.emoji} ${m.label}`]))

const TYPE_LABEL: Record<string, string> = {
  CITY: 'City',
  COUNTRY: 'Country',
  NATIONAL_PARK: 'National Park',
  LANDMARK: 'Landmark',
  BEACH: 'Beach',
  MOUNTAIN: 'Mountain',
  OTHER: 'Other',
}

const STATUS_LABEL: Record<string, string> = {
  PLANNED: 'Planned',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 tracking-tight">
      {'★'.repeat(rating)}
      <span className="text-gray-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-10 print:mb-8">
      <div className="flex items-baseline gap-2 mb-5 print:mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-400">({count})</span>
      </div>
      {children}
    </section>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function TripPrintPage() {
  const { id } = useParams<{ id: string }>()

  const { data: trip, isLoading: tripLoading } = useTrip(id!)
  const { data: destinations = [], isLoading: destLoading } = useTripDestinations(id!)
  const { data: memories = [], isLoading: memLoading } = useTripMemories(id!)

  const isLoading = tripLoading || destLoading || memLoading
  const didPrint = useRef(false)

  // Auto-trigger print once all data is ready
  useEffect(() => {
    if (!isLoading && trip && !didPrint.current) {
      didPrint.current = true
      setTimeout(() => window.print(), 400)
    }
  }, [isLoading, trip])

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 18mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Loading state */}
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center print:hidden">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">Preparing your journal…</p>
          </div>
        </div>
      )}

      {/* Main document (hidden until data is ready, always printed) */}
      {trip && (
        <div className={isLoading ? 'hidden' : ''}>

          {/* Screen-only toolbar */}
          <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <Link
              to={`/trips/${id}`}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to trip
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Save as PDF
            </button>
          </div>

          {/* Document body */}
          <div className="max-w-2xl mx-auto px-10 py-12 print:max-w-none print:p-0">

            {/* Accent stripe */}
            <div className="w-10 h-[3px] bg-brand-600 rounded-full mb-6" />

            {/* Trip title */}
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3 print:text-3xl">
              {trip.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-gray-500 mb-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                {STATUS_LABEL[trip.status]}
              </span>
              {(trip.startDate || trip.endDate) && (
                <span>
                  {trip.startDate ? dayjs(trip.startDate).format('MMM D, YYYY') : '?'}
                  {trip.endDate ? ` – ${dayjs(trip.endDate).format('MMM D, YYYY')}` : ''}
                </span>
              )}
              {trip.startDate && trip.endDate && (
                <span className="text-gray-400">
                  · {dayjs(trip.endDate).diff(dayjs(trip.startDate), 'day') + 1} days
                </span>
              )}
            </div>

            {/* Description */}
            {trip.description && (
              <p className="text-[15px] text-gray-600 leading-relaxed border-l-2 border-brand-200 pl-4 mb-8 print:mb-6">
                {trip.description}
              </p>
            )}

            {/* ── Places ── */}
            {destinations.length > 0 && (
              <>
                <hr className="border-gray-200 mb-8 print:mb-6" />
                <Section title="📍 Places" count={destinations.length}>
                  <div className="space-y-6 print:space-y-4">
                    {destinations.map((dest) => (
                      <div key={dest.id} className="pl-4 border-l-2 border-gray-200 print:break-inside-avoid">
                        <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{dest.name}</span>
                          <span className="text-sm text-gray-400">{dest.country}</span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {TYPE_LABEL[dest.type] ?? dest.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-1.5">
                          {dest.arrivalDate && (
                            <span>
                              {dayjs(dest.arrivalDate).format('MMM D')}
                              {dest.departureDate
                                ? ` – ${dayjs(dest.departureDate).format('MMM D, YYYY')}`
                                : ''}
                            </span>
                          )}
                          {dest.rating != null && <Stars rating={dest.rating} />}
                        </div>
                        {dest.notes && (
                          <p className="text-sm text-gray-600 leading-relaxed">{dest.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* ── Memories ── */}
            {memories.length > 0 && (
              <>
                <hr className="border-gray-200 mb-8 print:mb-6" />
                <Section title="✦ Memories" count={memories.length}>
                  <div className="space-y-8 print:space-y-6">
                    {memories.map((memory) => (
                      <div key={memory.id} className="print:break-inside-avoid">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-1.5">
                          {memory.memoryDate && (
                            <span>{dayjs(memory.memoryDate).format('MMMM D, YYYY')}</span>
                          )}
                          {memory.mood && (
                            <span className="text-brand-600 font-medium">
                              {MOOD_LABEL[memory.mood] ?? memory.mood}
                            </span>
                          )}
                          {memory.destinationName && (
                            <span>@ {memory.destinationName}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-[15px] mb-2">{memory.title}</h3>

                        {/* Journal */}
                        {memory.journalEntry && (
                          <p className="text-[13.5px] text-gray-700 leading-[1.8] mb-3 whitespace-pre-wrap">
                            {memory.journalEntry}
                          </p>
                        )}

                        {/* Tags */}
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {memory.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Dashed separator */}
                        <div className="mt-6 border-b border-dashed border-gray-200 print:mt-4" />
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* Footer */}
            <div className="mt-12 pt-5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-300 print:mt-8">
              <span>Souvenir · Your Travel Journal</span>
              <span>Generated {dayjs().format('MMMM D, YYYY')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
