import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Map, Plane, BookHeart, ListChecks, BarChart2, LogOut, User, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { clsx } from 'clsx'
import { SearchModal } from '@/features/search/components/SearchModal'

const navItems = [
  { to: '/dashboard', label: 'Trips', icon: Plane },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/memories', label: 'Memories', icon: BookHeart },
  { to: '/bucket-list', label: 'Bucket List', icon: ListChecks },
  { to: '/stats', label: 'Stats', icon: BarChart2 },
]

export function Navbar() {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-gray-50 hover:bg-white"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search…</span>
          <kbd className="text-xs text-gray-300 bg-white border border-gray-200 rounded px-1">⌘K</kbd>
        </button>

        {/* Mobile search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

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

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  )
}
