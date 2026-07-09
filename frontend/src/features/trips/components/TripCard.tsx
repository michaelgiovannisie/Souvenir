import { Link } from 'react-router-dom'
import { MapPin, Camera, BookOpen, Calendar } from 'lucide-react'
import { Trip } from '../api/tripsApi'
import { clsx } from 'clsx'
import dayjs from 'dayjs'

interface TripCardProps {
  trip: Trip
}

const statusColors: Record<Trip['status'], string> = {
  PLANNED: 'bg-yellow-100 text-yellow-700',
  ONGOING: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<Trip['status'], string> = {
  PLANNED: 'Planned',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link to={`/trips/${trip.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
        {/* Cover image */}
        <div className="h-40 bg-gradient-to-br from-brand-400 to-brand-600 relative overflow-hidden">
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
            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', statusColors[trip.status])}>
              {statusLabels[trip.status]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-brand-600 transition-colors">
            {trip.title}
          </h3>

          {(trip.startDate || trip.endDate) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {trip.startDate ? dayjs(trip.startDate).format('MMM D, YYYY') : '?'}
                {trip.endDate ? ` — ${dayjs(trip.endDate).format('MMM D, YYYY')}` : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destinationCount} {trip.destinationCount === 1 ? 'place' : 'places'}
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              {trip.photoCount}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {trip.memoryCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
