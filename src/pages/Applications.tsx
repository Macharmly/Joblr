import {
  BriefcaseBusiness,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from '../lib/applications'

type Application = {
  id: string
  position: string
  status: string
  outcome: string | null
  location: string | null
  work_setup: string | null
  employment_type: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  source: string | null
  date_posted: string | null
  date_applied: string | null
  deadline: string | null
  priority: string
  notes: string | null
  created_at: string
  companies: {
    id: string
    name: string
    website: string | null
    industry: string | null
    location: string | null
  } | null
}

type ApplicationForm = {
  companyName: string
  position: string
  status: string
  jobUrl: string
  location: string
  workSetup: string
  employmentType: string
  salaryMin: string
  salaryMax: string
  source: string
  dateApplied: string
  deadline: string
  priority: string
  notes: string
}

const initialForm: ApplicationForm = {
  companyName: '',
  position: '',
  status: 'Saved',
  jobUrl: '',
  location: '',
  workSetup: '',
  employmentType: '',
  salaryMin: '',
  salaryMax: '',
  source: '',
  dateApplied: '',
  deadline: '',
  priority: 'Medium',
  notes: '',
}

export default function Applications() {
  const { user } = useAuth()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ApplicationForm>(initialForm)
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null)
  const [deletingApplication, setDeletingApplication] =
    useState<Application | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Active' | 'Closed'
  >('All')

  async function loadApplications() {
    setLoading(true)
    setError('')

    const { data, error } = await getApplications()

    if (error) {
      setError(error.message)
    } else {
      setApplications(
        (data ?? []).map((application) => ({
          ...application,
          companies: Array.isArray(application.companies)
            ? application.companies[0] ?? null
            : application.companies ?? null,
        })) as Application[],
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const filteredApplications = applications.filter(
    (application) => {
        const query = searchQuery.trim().toLowerCase()

        const matchesSearch =
        !query ||
        application.position.toLowerCase().includes(query) ||
        (application.companies?.name ?? '')
            .toLowerCase()
            .includes(query)

        const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Active' &&
            application.outcome === null) ||
        (activeFilter === 'Closed' &&
            application.outcome !== null)

        return matchesSearch && matchesFilter
    },
    )

  function updateForm(
    field: keyof ApplicationForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function openModal() {
    setEditingApplication(null)
    setForm(initialForm)
    setSaveError('')
    setShowModal(true)
  }

  function handleEditApplication(application: Application) {
    setEditingApplication(application)

    setForm({
      companyName: application.companies?.name ?? '',
      position: application.position,
      status: application.status,
      jobUrl: '',
      location: application.location ?? '',
      workSetup: application.work_setup ?? '',
      employmentType: application.employment_type ?? '',
      salaryMin:
        application.salary_min !== null &&
        application.salary_min !== undefined
          ? String(application.salary_min)
          : '',
      salaryMax:
        application.salary_max !== null &&
        application.salary_max !== undefined
          ? String(application.salary_max)
          : '',
      source: application.source ?? '',
      dateApplied: application.date_applied ?? '',
      deadline: application.deadline ?? '',
      priority: application.priority ?? 'Medium',
      notes: application.notes ?? '',
    })

    setSaveError('')
    setShowModal(true)
  }

  function handleDeleteApplication(application: Application) {
    setDeletingApplication(application)
    setDeleteError('')
  }

  function closeModal() {
    if (saving) return

    setShowModal(false)
    setEditingApplication(null)
    setSaveError('')
    setForm(initialForm)
  }

  function closeDeleteModal() {
    if (deleting) return

    setDeletingApplication(null)
    setDeleteError('')
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!user) {
      setSaveError('You must be signed in to save an application.')
      return
    }

    setSaving(true)
    setSaveError('')

    const result = editingApplication
      ? await updateApplication(editingApplication.id, form)
      : await createApplication(form, user.id)

    if (result.error) {
      setSaveError(result.error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setShowModal(false)
    setEditingApplication(null)
    setForm(initialForm)

    await loadApplications()
  }

  async function confirmDelete() {
    if (!deletingApplication) return

    setDeleting(true)
    setDeleteError('')

    const { error } = await deleteApplication(
      deletingApplication.id,
    )

    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      return
    }

    setDeleting(false)
    setDeletingApplication(null)

    await loadApplications()
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Applications
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your job applications.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <Plus size={18} />
          Add Application
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />

          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-600"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
            <FilterButton
                label="All"
                active={activeFilter === 'All'}
                onClick={() => setActiveFilter('All')}
            />

            <FilterButton
                label="Active"
                active={activeFilter === 'Active'}
                onClick={() => setActiveFilter('Active')}
            />

            <FilterButton
                label="Closed"
                active={activeFilter === 'Closed'}
                onClick={() => setActiveFilter('Closed')}
            />
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading applications...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <BriefcaseBusiness className="h-10 w-10 text-gray-300 dark:text-gray-600" />

            <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No applications yet
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Start tracking your job applications to keep your job search
              organized.
            </p>

            <button
              type="button"
              onClick={openModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <Plus size={18} />
              Add Application
            </button>
          </div>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <>
            {filteredApplications.length > 0 ? (
            <div className="space-y-3">
                {filteredApplications.map((application) => (
                <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                />
                ))}
            </div>
            ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
                <Search className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />

                <h2 className="mt-4 text-base font-medium text-gray-900 dark:text-white">
                No applications found
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try changing your search or filter.
                </p>
            </div>
            )}
        </>
        )}

      {showModal && (
        <ApplicationModal
          form={form}
          editing={Boolean(editingApplication)}
          saving={saving}
          error={saveError}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {deletingApplication && (
        <DeleteModal
          application={deletingApplication}
          deleting={deleting}
          error={deleteError}
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

function ApplicationModal({
  form,
  editing,
  saving,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  form: ApplicationForm
  editing: boolean
  saving: boolean
  error: string
  onChange: (
    field: keyof ApplicationForm,
    value: string,
  ) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editing ? 'Edit Application' : 'Add Application'}
            </h2>

            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {editing
                ? 'Update the details of this application.'
                : 'Add a job to your application tracker.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Company"
              required
              className="sm:col-span-2"
            >
              <input
                type="text"
                value={form.companyName}
                onChange={(event) =>
                  onChange('companyName', event.target.value)
                }
                required
                placeholder="e.g. Accenture"
                className={inputClass}
              />
            </FormField>

            <FormField label="Position" required>
              <input
                type="text"
                value={form.position}
                onChange={(event) =>
                  onChange('position', event.target.value)
                }
                required
                placeholder="e.g. Junior Developer"
                className={inputClass}
              />
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  onChange('status', event.target.value)
                }
                className={inputClass}
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Assessment">Assessment</option>
                <option value="Final Interview">
                  Final Interview
                </option>
                <option value="Offer">Offer</option>
              </select>
            </FormField>

            <FormField label="Job URL">
              <input
                type="url"
                value={form.jobUrl}
                onChange={(event) =>
                  onChange('jobUrl', event.target.value)
                }
                placeholder="https://..."
                className={inputClass}
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  onChange('location', event.target.value)
                }
                placeholder="e.g. Makati, Metro Manila"
                className={inputClass}
              />
            </FormField>

            <FormField label="Work Setup">
              <select
                value={form.workSetup}
                onChange={(event) =>
                  onChange('workSetup', event.target.value)
                }
                className={inputClass}
              >
                <option value="">Select work setup</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </FormField>

            <FormField label="Employment Type">
              <select
                value={form.employmentType}
                onChange={(event) =>
                  onChange('employmentType', event.target.value)
                }
                className={inputClass}
              >
                <option value="">Select employment type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </FormField>

            <FormField label="Minimum Salary">
              <input
                type="number"
                min="0"
                value={form.salaryMin}
                onChange={(event) =>
                  onChange('salaryMin', event.target.value)
                }
                placeholder="e.g. 25000"
                className={inputClass}
              />
            </FormField>

            <FormField label="Maximum Salary">
              <input
                type="number"
                min="0"
                value={form.salaryMax}
                onChange={(event) =>
                  onChange('salaryMax', event.target.value)
                }
                placeholder="e.g. 30000"
                className={inputClass}
              />
            </FormField>

            <FormField label="Source">
              <input
                type="text"
                value={form.source}
                onChange={(event) =>
                  onChange('source', event.target.value)
                }
                placeholder="e.g. LinkedIn, JobStreet"
                className={inputClass}
              />
            </FormField>

            <FormField label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  onChange('priority', event.target.value)
                }
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </FormField>

            <FormField label="Date Applied">
              <input
                type="date"
                value={form.dateApplied}
                onChange={(event) =>
                  onChange('dateApplied', event.target.value)
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  onChange('deadline', event.target.value)
                }
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Notes"
              className="sm:col-span-2"
            >
              <textarea
                value={form.notes}
                onChange={(event) =>
                  onChange('notes', event.target.value)
                }
                rows={4}
                placeholder="Add any notes about this application..."
                className={inputClass}
              />
            </FormField>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {saving
                ? 'Saving...'
                : editing
                  ? 'Save Changes'
                  : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({
  application,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  application: Application
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <Trash2 size={20} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          Delete application?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to delete your{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {application.position}
          </span>{' '}
          application at{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {application.companies?.name ?? 'this company'}
          </span>
          ? This action cannot be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Application'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  required = false,
  className = '',
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500'

function ApplicationCard({
  application,
  onEdit,
  onDelete,
}: {
  application: Application
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {application.position}
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {application.companies?.name ?? 'Company not specified'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={application.status}
            outcome={application.outcome}
          />

          <button
            type="button"
            onClick={() => onEdit(application)}
            aria-label={`Edit ${application.position}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(application)}
            aria-label={`Delete ${application.position}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
        {application.location && (
          <span>{application.location}</span>
        )}

        {application.work_setup && (
          <span>{application.work_setup}</span>
        )}

        {application.employment_type && (
          <span>{application.employment_type}</span>
        )}

        {application.priority && (
          <span>Priority: {application.priority}</span>
        )}
      </div>
    </div>
  )
}

function StatusBadge({
  status,
  outcome,
}: {
  status: string
  outcome: string | null
}) {
  const label = outcome ?? status

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      {label}
    </span>
  )
}

function FilterButton({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}