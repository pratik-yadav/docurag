import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Question {
  id?: number
  question: string
  answer: string
}

interface Suggestion {
  id?: number
  content: string
}

interface LocationState {
  suggestions: Suggestion[] | string[]
  questions: Question[]
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/suggestion`

function SuggestionPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuthStore()

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [roomTitle, setRoomTitle] = useState<string>('Resume Analysis')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'questions'>('suggestions')

  useEffect(() => {
    const state = location.state as LocationState | null
    if (state?.suggestions && state?.questions) {
      setSuggestions(state.suggestions.map((s) => (typeof s === 'string' ? s : s.content)))
      setQuestions(state.questions)
      return
    }
    if (!isLoggedIn || !id || id === 'guest') return
    const fetchRoom = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load suggestion room')
        const data = await res.json()
        setRoomTitle(data.room.title || 'Resume Analysis')
        setSuggestions(data.suggestions.map((s: Suggestion) => s.content))
        setQuestions(data.questions)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [id])

  const handleDelete = async () => {
    if (!isLoggedIn || !id || id === 'guest') { navigate('/features'); return }
    try {
      const res = await fetch(`${BASE_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete room')
      navigate('/history/suggestions')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
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
      <div className="absolute top-20 right-1/3 w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white text-sm transition flex-shrink-0">
              ← Back
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{roomTitle}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {id === 'guest' ? 'Guest session — not saved' : 'Saved analysis'}
              </p>
            </div>
          </div>
          {id !== 'guest' && isLoggedIn && (
            <button
              onClick={handleDelete}
              className="flex-shrink-0 text-xs text-gray-600 hover:text-red-400 transition ml-4"
            >
              Delete
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition ${
              activeTab === 'suggestions'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            💡 Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            🎯 Interview Q&A ({questions.length})
          </button>
        </div>

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-12">No suggestions available.</p>
            ) : (
              suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gray-900 border border-gray-800 rounded-xl px-4 py-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{suggestion}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            {questions.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-12">No questions available.</p>
            ) : (
              questions.map((q, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-800/60 transition"
                  >
                    <div className="flex gap-3 items-start min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-200 leading-relaxed">{q.question}</p>
                    </div>
                    <span className="flex-shrink-0 ml-4 text-gray-600 text-xs">
                      {expandedIndex === idx ? '▲' : '▼'}
                    </span>
                  </button>
                  {expandedIndex === idx && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-800 bg-green-500/5">
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap pl-9">
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestionPage