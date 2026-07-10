import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, MapPin, Star } from 'lucide-react'
import { destinationSchema, DestinationFormValues } from '../schemas/destinationSchema'
import { Destination, DestinationType } from '../api/destinationsApi'
import { useAddDestination, useUpdateDestination } from '../hooks/useDestinations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Fix Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DESTINATION_TYPES: { value: DestinationType; label: string; emoji: string }[] = [
  { value: 'CITY', label: 'City', emoji: '🏙️' },
  { value: 'COUNTRY', label: 'Country', emoji: '🌍' },
  { value: 'NATIONAL_PARK', label: 'National Park', emoji: '🌲' },
  { value: 'LANDMARK', label: 'Landmark', emoji: '🗿' },
  { value: 'BEACH', label: 'Beach', emoji: '🏖️' },
  { value: 'MOUNTAIN', label: 'Mountain', emoji: '⛰️' },
  { value: 'OTHER', label: 'Other', emoji: '📍' },
]

interface MapClickHandlerProps {
  onPick: (lat: number, lng: number) => void
}

function MapClickHandler({ onPick }: MapClickHandlerProps) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

interface AddDestinationModalProps {
  tripId: string
  editTarget?: Destination | null
  onClose: () => void
}

export function AddDestinationModal({ tripId, editTarget, onClose }: AddDestinationModalProps) {
  const isEditing = !!editTarget
  const { mutate: add, isPending: isAdding } = useAddDestination(tripId)
  const { mutate: update, isPending: isUpdating } = useUpdateDestination(tripId)
  const isPending = isAdding || isUpdating

  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    editTarget?.latitude && editTarget?.longitude
      ? { lat: editTarget.latitude, lng: editTarget.longitude }
      : null
  )
  const [hoverRating, setHoverRating] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: editTarget?.name ?? '',
      country: editTarget?.country ?? '',
      stateProvince: editTarget?.stateProvince ?? '',
      city: editTarget?.city ?? '',
      type: editTarget?.type ?? 'CITY',
      arrivalDate: editTarget?.arrivalDate ?? '',
      departureDate: editTarget?.departureDate ?? '',
      notes: editTarget?.notes ?? '',
      rating: editTarget?.rating ?? null,
      latitude: editTarget?.latitude ?? null,
      longitude: editTarget?.longitude ?? null,
    },
  })

  const currentRating = watch('rating')

  // Sync pin → form fields
  const handleMapClick = (lat: number, lng: number) => {
    const rounded = { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
    setPin(rounded)
    setValue('latitude', rounded.lat, { shouldValidate: true })
    setValue('longitude', rounded.lng, { shouldValidate: true })
  }

  const clearPin = () => {
    setPin(null)
    setValue('latitude', null)
    setValue('longitude', null)
  }

  const onSubmit = (values: DestinationFormValues) => {
    const payload = {
      ...values,
      stateProvince: values.stateProvince || undefined,
      city: values.city || undefined,
      notes: values.notes || undefined,
      arrivalDate: values.arrivalDate || null,
      departureDate: values.departureDate || null,
    }

    if (isEditing) {
      update({ id: editTarget!.id, payload }, { onSuccess: onClose })
    } else {
      add(payload, { onSuccess: onClose })
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit destination' : 'Add destination'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* Type picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {DESTINATION_TYPES.map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1.5 ${
                          field.value === value
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700'
                        }`}
                      >
                        <span>{emoji}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Name & Country */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name *" placeholder="Eiffel Tower" error={errors.name?.message} {...register('name')} />
              <Input label="Country *" placeholder="France" error={errors.country?.message} {...register('country')} />
            </div>

            {/* State & City */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="State / Province" placeholder="Île-de-France" {...register('stateProvince')} />
              <Input label="City" placeholder="Paris" {...register('city')} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Arrival date" type="date" error={errors.arrivalDate?.message} {...register('arrivalDate')} />
              <Input label="Departure date" type="date" error={errors.departureDate?.message} {...register('departureDate')} />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div
                    className="flex gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => field.onChange(field.value === star ? null : star)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className="w-6 h-6 transition-colors"
                          fill={(hoverRating || (field.value ?? 0)) >= star ? '#f59e0b' : 'none'}
                          stroke={(hoverRating || (field.value ?? 0)) >= star ? '#f59e0b' : '#d1d5db'}
                        />
                      </button>
                    ))}
                    {currentRating && (
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Map pin picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  Pin on map
                  <span className="text-xs text-gray-400 font-normal">(click to place)</span>
                </label>
                {pin && (
                  <button
                    type="button"
                    onClick={clearPin}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear pin
                  </button>
                )}
              </div>
              <div className="h-52 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                  center={pin ? [pin.lat, pin.lng] : [20, 0]}
                  zoom={pin ? 10 : 2}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapClickHandler onPick={handleMapClick} />
                  {pin && <Marker position={[pin.lat, pin.lng]} />}
                </MapContainer>
              </div>
              {pin && (
                <p className="text-xs text-gray-400 mt-1">
                  {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="What made this place special?"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {isEditing ? 'Save changes' : 'Add destination'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
