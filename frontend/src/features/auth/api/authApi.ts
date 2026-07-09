import { api } from '@/lib/axios'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: {
    id: string
    email: string
    username: string
    displayName: string
    profilePhotoUrl: string | null
  }
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data.data
  },

  register: async (payload: {
    email: string
    username: string
    displayName: string
    password: string
  }): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', payload)
    return data.data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken })
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data.data
  },
}
