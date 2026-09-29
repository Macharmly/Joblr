import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getApplications } from '../lib/applications'

type DashboardStats = {
  total: number
  active: number
  interviews: number
  offers: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      const { data, error } = await getApplications()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const applications = data ?? []

      const active = applications.filter(
        (application) => application.outcome === null,
      ).length

      const interviews = applications.filter(
        (application) =>
          application.status === 'Interview' ||
          application.status === 'Final Interview',
      ).length

      const offers = applications.filter(
        (application) => application.status === 'Offer',
      ).length

      setStats({
        total: applications.length,
        active,
        interviews,
        offers,
      })

      setLoading(false)
    }

    loadDashboard()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Keep track of your job search from one place.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          label="Total Applications"
          value={loading ? '—' : String(stats.total)}
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Active"
          value={loading ? '—' : String(stats.active)}
        />

        <StatCard
          icon={<CalendarDays size={20} />}
          label="Interviews"
          value={loading ? '—' : String(stats.interviews)}
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Offers"
          value={loading ? '—' : String(stats.offers)}
        />
      </div>

      {!loading && stats.total === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />

          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No applications yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Start tracking your job applications and keep your entire job
            search organized.
          </p>
        </div>
      )}

      {!loading && stats.total > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Your job search
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You currently have {stats.total}{' '}
            {stats.total === 1 ? 'application' : 'applications'} being
            tracked.
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>

        <div className="text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      </div>

      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}