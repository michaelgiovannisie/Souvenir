import { z } from 'zod'

export const MOODS = [
  { value: 'HAPPY',       emoji: '😊', label: 'Happy' },
  { value: 'EXCITED',     emoji: '🤩', label: 'Excited' },
  { value: 'PEACEFUL',    emoji: '😌', label: 'Peaceful' },
  { value: 'ADVENTUROUS', emoji: '🌟', label: 'Adventurous' },
  { value: 'ROMANTIC',    emoji: '🥰', label: 'Romantic' },
  { value: 'FUNNY',       emoji: '😂', label: 'Funny' },
  { value: 'GRATEFUL',    emoji: '🙏', label: 'Grateful' },
  { value: 'NOSTALGIC',   emoji: '😢', label: 'Nostalgic' },
  { value: 'EMOTIONAL',   emoji: '🥺', label: 'Emotional' },
  { value: 'TIRED',       emoji: '😴', label: 'Tired' },
] as const

export type MoodValue = typeof MOODS[number]['value']

export const memorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  journalEntry: z.string().max(50000).optional(),
  memoryDate: z.string().optional().nullable(),
  destinationId: z.string().uuid().optional().nullable(),
  mood: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export type MemoryFormValues = z.infer<typeof memorySchema>
