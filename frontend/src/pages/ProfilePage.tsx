import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Check, Loader2, Lock, Trash2, User } from 'lucide-react'
import { clsx } from 'clsx'
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUploadProfilePhoto,
  useRemoveProfilePhoto,
} from '@/features/profile/hooks/useProfile'
import {
  updateProfileSchema,
  UpdateProfileValues,
  changePasswordSchema,
  ChangePasswordValues,
} from '@/features/profile/schemas/profileSchemas'
import { useStats } from '@/features/stats/hooks/useStats'
import { Input } from '@/components/ui/Input'

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  url,
  name,
  onUpload,
  onRemove,
  isUploading,
}: {
  url: string | null
  name: string
  onUpload: (f: File) => void
  onRemove: () => void
  isUploading: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center ring-4 ring-white shadow-md">
          {url ? (
            <img src={url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-brand-600">{initials}</span>
          )}
        </div>

        {/* Upload overlay */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
        >
          {isUploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white" />
          }
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload(f)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 transition-colors"
        >
          {isUploading ? 'Uploading…' : 'Change photo'}
        </button>
        {url && (
          <>
            <span className="text-gray-300 text-xs">·</span>
            <button
              onClick={onRemove}
              disabled={isUploading}
              className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Success flash ────────────────────────────────────────────────────────────
function SavedBadge() {
  return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <Check className="w-3.5 h-3.5" /> Saved
    </span>
  )
}

// ─── Profile info form ────────────────────────────────────────────────────────
function ProfileInfoForm({ displayName, username }: { displayName: string; username: string }) {
  const [saved, setSaved] = useState(false)
  const { mutate: updateProfile, isPending, isError, error } = useUpdateProfile()

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName, username },
  })

  function onSubmit(values: UpdateProfileValues) {
    updateProfile(values, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Display name"
        placeholder="Your full name"
        error={errors.displayName?.message}
        {...register('displayName')}
      />
      <Input
        label="Username"
        placeholder="your_username"
        error={errors.username?.message}
        {...register('username')}
      />

      {isError && (
        <p className="text-sm text-red-500">
          {(error as any)?.response?.data?.error?.message ?? 'Failed to save. Try again.'}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save changes
        </button>
        {saved && <SavedBadge />}
      </div>
    </form>
  )
}

// ─── Change password form ─────────────────────────────────────────────────────
function ChangePasswordForm() {
  const [saved, setSaved] = useState(false)
  const { mutate: changePassword, isPending, isError, error } = useChangePassword()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  function onSubmit(values: ChangePasswordValues) {
    changePassword(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          reset()
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {isError && (
        <p className="text-sm text-red-500">
          {(error as any)?.response?.data?.error?.message ?? 'Failed to change password.'}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Update password
        </button>
        {saved && <SavedBadge />}
      </div>
    </form>
  )
}

// ─── Quick stats row ──────────────────────────────────────────────────────────
function QuickStats() {
  const { data: stats } = useStats()
  if (!stats) return null

  const items = [
    { label: 'Trips',      value: stats.totalTrips },
    { label: 'Countries',  value: stats.uniqueCountries },
    { label: 'Memories',   value: stats.totalMemories },
    { label: 'Photos',     value: stats.totalPhotos },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(({ label, value }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadProfilePhoto()
  const { mutate: removePhoto } = useRemoveProfilePhoto()

  if (isLoading || !profile) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">{profile.email}</p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar
          url={profile.profilePhotoUrl}
          name={profile.displayName || profile.username}
          onUpload={uploadPhoto}
          onRemove={() => removePhoto()}
          isUploading={isUploading}
        />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
          <p className="text-gray-400 text-sm">@{profile.username}</p>
          <p className="text-gray-400 text-xs mt-1">{profile.email}</p>
        </div>
      </div>

      {/* Quick stats */}
      <QuickStats />

      {/* Profile info */}
      <Card title="Profile info" icon={<User className="w-4 h-4 text-brand-600" />}>
        <ProfileInfoForm displayName={profile.displayName} username={profile.username} />
      </Card>

      {/* Change password */}
      <Card title="Change password" icon={<Lock className="w-4 h-4 text-brand-600" />}>
        <ChangePasswordForm />
      </Card>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Danger zone</h3>
        <p className="text-xs text-red-500 mb-3">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Trash2 className="w-4 h-4" />
          Delete account
        </button>
      </div>
    </div>
  )
}
