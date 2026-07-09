import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Dashboard } from '@/pages/Dashboard'
import { MapPage } from '@/pages/MapPage'

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
          {/* Additional pages to be built */}
          <Route path="/trips/:id" element={<div className="p-4 text-gray-500">Trip detail — coming next</div>} />
          <Route path="/memories" element={<div className="p-4 text-gray-500">Memories — coming next</div>} />
          <Route path="/bucket-list" element={<div className="p-4 text-gray-500">Bucket list — coming next</div>} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
