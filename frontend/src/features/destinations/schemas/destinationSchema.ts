import { z } from 'zod'

export const destinationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  country: z.string().min(1, 'Country is required').max(100),
  stateProvince: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  type: z.enum(['CITY', 'COUNTRY', 'NATIONAL_PARK', 'LANDMARK', 'BEACH', 'MOUNTAIN', 'OTHER']),
  arrivalDate: z.string().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  notes: z.string().max(5000).optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
})

export type DestinationFormValues = z.infer<typeof destinationSchema>
