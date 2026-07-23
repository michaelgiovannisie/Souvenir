import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
})

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
