import { useState } from 'react'
import { signIn, signUp } from './lib/auth'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Applications from './pages/Applications'
import Dashboard from './pages/Dashboard'

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName)

      if (error) {
        setError(error.message)
      } else {
        setMessage(
          'Account created. Check your email if confirmation is required.'
        )
      }
    } else {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Joblr
          </h1>

          <p className="mt-2 text-gray-500">
            Your job search, organized.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isSignUp
              ? 'Start organizing your job search.'
              : 'Sign in to continue to Joblr.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setError('')
              }}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading Joblr...</p>
      </main>
    )
  }

  if (user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }

  return <AuthScreen />
}

export default App