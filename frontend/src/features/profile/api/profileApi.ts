import { api } from '@/lib/axios'

export interface UserProfile {
  id: string
  email: string
  username: string
  displayName: string
  profilePhotoUrl: string | null
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get('/users/me')
    return data.data
  },

  updateProfile: async (payload: { displayName?: string; username?: string }): Promise<UserProfile> => {
    const { data } = await api.patch('/users/me', payload)
    return data.data
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.patch('/users/me/password', payload)
  },

  uploadPhoto: async (file: File): Promise<UserProfile> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/users/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  removePhoto: async (): Promise<UserProfile> => {
    const { data } = await api.delete('/users/me/photo')
    return data.data
  },
}
