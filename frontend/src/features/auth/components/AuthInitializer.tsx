import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '../api/authApi'

interface Props {
  children: React.ReactNode
}

/**
 * Runs once on app mount. If the user has a persisted refreshToken but no
 * active session (i.e. they refreshed the page), silently calls /auth/refresh
 * to restore isAuthenticated before any ProtectedRoute renders.
 */
export function AuthInitializer({ children }: Props) {
  const { refreshToken, isAuthenticated, setAuth, logout, setInitialized } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated || !refreshToken) {
      setInitialized(true)
      return
    }

    authApi
      .refresh(refreshToken)
      .then((data) => {
        setAuth(data.user, data.accessToken, data.refreshToken)
      })
      .catch(() => {
        // Refresh token expired or revoked — clear stale state
        logout()
      })
      .finally(() => {
        setInitialized(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
