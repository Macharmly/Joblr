import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from 'lucide-react'

export default function Dashboard() {
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BriefcaseBusiness size={20} />}
          label="Total Applications"
          value="0"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Active"
          value="0"
        />

        <StatCard
          icon={<CalendarDays size={20} />}
          label="Interviews"
          value="0"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Offers"
          value="0"
        />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <BriefcaseBusiness className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />

        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No applications yet
        </h2>

        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Start tracking your applications and keep your entire job search
          organized.
        </p>
      </div>
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