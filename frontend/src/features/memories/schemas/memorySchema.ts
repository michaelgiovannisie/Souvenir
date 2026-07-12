import { z } from 'zod'

export const memorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  journalEntry: z.string().max(50000).optional(),
  memoryDate: z.string().optional().nullable(),
  destinationId: z.string().uuid().optional().nullable(),
})

export type MemoryFormValues = z.infer<typeof memorySchema>
