import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profileApi'
import { useAuthStore } from '@/store/authStore'

export const profileKeys = {
  me: ['profile', 'me'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: profileApi.getProfile,
  })
}

/** Syncs updated user back into the Zustand auth store so the navbar updates */
function useSyncUser() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)
  const refreshToken = useAuthStore((s) => s.refreshToken)

  return (user: { id: string; email: string; username: string; displayName: string; profilePhotoUrl: string | null }) => {
    if (accessToken && refreshToken) {
      setAuth(user, accessToken, refreshToken)
    }
  }
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const sync = useSyncUser()
  return useMutation({
    mutationFn: (payload: { displayName?: string; username?: string }) =>
      profileApi.updateProfile(payload),
    onSuccess: (updated) => {
      qc.setQueryData(profileKeys.me, updated)
      sync(updated)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(payload),
  })
}

export function useUploadProfilePhoto() {
  const qc = useQueryClient()
  const sync = useSyncUser()
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadPhoto(file),
    onSuccess: (updated) => {
      qc.setQueryData(profileKeys.me, updated)
      sync(updated)
    },
  })
}

export function useRemoveProfilePhoto() {
  const qc = useQueryClient()
  const sync = useSyncUser()
  return useMutation({
    mutationFn: profileApi.removePhoto,
    onSuccess: (updated) => {
      qc.setQueryData(profileKeys.me, updated)
      sync(updated)
    },
  })
}
