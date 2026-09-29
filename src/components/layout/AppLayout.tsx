import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-gray-100 px-6 dark:border-gray-800">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Joblr
          </h1>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={location.pathname === '/'}
            onClick={() => navigate('/')}
          />

          <NavItem
            icon={<BriefcaseBusiness size={18} />}
            label="Applications"
            active={location.pathname === '/applications'}
            onClick={() => navigate('/applications')}
          />

          <NavItem
            icon={<CalendarDays size={18} />}
            label="Interviews"
            onClick={() => {}}
          />

          <NavItem
            icon={<CheckSquare size={18} />}
            label="Tasks"
            onClick={() => {}}
          />

          <NavItem
            icon={<Users size={18} />}
            label="Contacts"
            onClick={() => {}}
          />

          <NavItem
            icon={<FileText size={18} />}
            label="Documents"
            onClick={() => {}}
          />

          <NavItem
            icon={<BarChart3 size={18} />}
            label="Analytics"
            onClick={() => {}}
          />
        </nav>

        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {theme === 'dark' ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}

            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => {}}
          />

          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <LogOut size={18} />
            Sign out
          </button>

          <div className="mt-4 truncate px-3 text-xs text-gray-400 dark:text-gray-500">
            {user?.email}
          </div>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}