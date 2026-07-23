import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Dashboard } from '@/pages/Dashboard'
import { MapPage } from '@/pages/MapPage'
import { TripDetail } from '@/pages/TripDetail'
import { StatsDashboard } from '@/pages/StatsDashboard'
import { BucketListPage } from '@/pages/BucketListPage'
import { MemoriesPage } from '@/pages/MemoriesPage'
import { ProfilePage } from '@/pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/bucket-list" element={<BucketListPage />} />
          <Route path="/stats" element={<StatsDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
