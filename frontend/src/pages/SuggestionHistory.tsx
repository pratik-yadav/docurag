import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { fetchWithTimeout } from '../utils/api'

interface SuggestionRoom {
  id: number
  title: string
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/suggestion`

function SuggestionHistory() {
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuthStore()
  const [rooms, setRooms] = useState<SuggestionRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      }, 30000)
      if (!res.ok) throw new Error('Failed to load suggestion history')
      const data = await res.json()
      setRooms(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }, 30000)
      if (!res.ok) throw new Error('Failed to delete')
      setRooms((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm transition">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Resume History</h1>
              <p className="text-gray-500 text-xs mt-0.5">Your past resume analyses</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/features')}
            className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            + New Analysis
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl mb-5">
              📄
            </div>
            <p className="text-white font-semibold text-lg">No analyses yet</p>
            <p className="text-gray-500 text-sm mt-1 mb-6">Upload your resume to get started</p>
            <button
              onClick={() => navigate('/features')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/suggestion/${room.id}`)}
                className="group flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/60"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-lg group-hover:border-indigo-500/40 transition">
                    📄
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition">
                      {room.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">Room #{room.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="text-gray-600 group-hover:text-indigo-400 transition text-sm">→</span>
                  <button
                    onClick={(e) => handleDelete(e, room.id)}
                    disabled={deletingId === room.id}
                    className="text-xs text-gray-600 hover:text-red-400 disabled:text-gray-700 transition"
                  >
                    {deletingId === room.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestionHistory