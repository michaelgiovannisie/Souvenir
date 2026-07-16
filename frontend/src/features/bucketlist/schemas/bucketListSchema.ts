import { z } from 'zod'

export const bucketListSchema = z.object({
  destinationName: z.string().min(1, 'Destination name is required').max(120),
  country: z.string().min(1, 'Country is required').max(80),
  notes: z.string().max(500).optional(),
})

export type BucketListFormValues = z.infer<typeof bucketListSchema>
