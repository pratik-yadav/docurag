import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithTimeout } from '../utils/api'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/user`

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      }, 30000)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      navigate('/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4">
      <div className="w-full max-w-sm px-8 py-10 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">

        <div className="text-center mb-8">
          <span className="text-indigo-400 text-3xl">⬡</span>
          <h2 className="text-xl font-bold text-white mt-2">Create account</h2>
          <p className="text-gray-500 text-sm mt-1">Join DocuRAG for free</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-lg text-sm transition"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 transition">
            Sign in
          </button>
        </p>

      </div>
    </div>
  )
}

export default Register