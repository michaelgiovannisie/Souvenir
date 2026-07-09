import { Link, NavLink } from 'react-router-dom'
import { Map, Plane, BookHeart, ListChecks, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { clsx } from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Trips', icon: Plane },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/memories', label: 'Memories', icon: BookHeart },
  { to: '/bucket-list', label: 'Bucket List', icon: ListChecks },
]

export function Navbar() {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          🌍 <span>Souvenir</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-brand-600" />
              )}
            </div>
            <span className="hidden sm:block font-medium">{user?.displayName}</span>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
