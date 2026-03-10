import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authstore'

const SUGGESTION_URL = `${import.meta.env.VITE_API_URL}/api/suggestion`
const CHAT_URL = `${import.meta.env.VITE_API_URL}/api/chat`

function Feature() {
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuthStore()

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<'resume' | 'documents' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0])
      setSelected('resume')
      setDocFile(null)
      setError(null)
    }
  }

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDocFile(e.target.files[0])
      setSelected('documents')
      setResumeFile(null)
      setError(null)
    }
  }

  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', resumeFile)
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${SUGGESTION_URL}/analyze`, { method: 'POST', headers, body: formData })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Failed to analyze resume') }
      const data = await res.json()

      if (data.saved) {
        navigate(`/suggestion/${data.room_id}`, { state: { suggestions: data.suggestions, questions: data.questions } })
      } else {
        navigate('/suggestion/guest', { state: { suggestions: data.suggestions, questions: data.questions } })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', docFile)
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${CHAT_URL}/upload`, { method: 'POST', headers, body: formData })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Failed to upload document') }
      const data = await res.json()

      if (data.saved) {
        navigate(`/chat/${data.room_id}`)
      } else {
        sessionStorage.setItem('session_id', data.session_id)
        localStorage.setItem('session_id', data.session_id)
        registerGuestCleanup(data.session_id)
        navigate(`/chat/${data.session_id}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const registerGuestCleanup = (sessionId: string) => {
    const cleanup = () => {
      navigator.sendBeacon(`${CHAT_URL}/guest/cleanup`, JSON.stringify({ session_id: sessionId }))
      localStorage.removeItem('session_id')
      sessionStorage.removeItem('session_id')
    }
    window.addEventListener('beforeunload', cleanup, { once: true })
  }

  const reset = () => {
    setSelected(null)
    setResumeFile(null)
    setDocFile(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden flex items-center justify-center px-4">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">

        {/* Page title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">What would you like to do?</h1>
          <p className="text-gray-500 text-sm mt-2">Choose one to get started</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Resume Upload ── */}
          <div className={`flex-1 bg-gray-900 border-2 rounded-2xl p-6 transition-all duration-200 ${
            selected === 'resume'
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
              : selected === 'documents'
              ? 'opacity-30 pointer-events-none border-gray-800'
              : 'border-gray-800 hover:border-indigo-500/50 cursor-pointer'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl mb-4">
              📄
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Resume Analysis</h3>
            <p className="text-sm text-gray-500 mb-5">Get AI suggestions + 10 interview Q&As tailored to your resume</p>

            <form onSubmit={handleResumeSubmit} className="space-y-4">
              <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition ${
                resumeFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
              }`}>
                <span className="text-gray-400 text-sm flex-1 truncate">
                  {resumeFile ? `📄 ${resumeFile.name}` : 'Click to select PDF / DOC / DOCX'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                  disabled={selected === 'documents' || loading}
                />
              </label>

              <button
                type="submit"
                disabled={!resumeFile || loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl text-sm transition"
              >
                {loading && selected === 'resume' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : 'Analyze Resume →'}
              </button>
            </form>
          </div>

          {/* ── Divider ── */}
          <div className="flex md:flex-col items-center justify-center gap-2 md:py-8">
            <div className="flex-1 h-px md:h-full md:w-px bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium px-1">OR</span>
            <div className="flex-1 h-px md:h-full md:w-px bg-gray-800" />
          </div>

          {/* ── Document Upload ── */}
          <div className={`flex-1 bg-gray-900 border-2 rounded-2xl p-6 transition-all duration-200 ${
            selected === 'documents'
              ? 'border-violet-500 shadow-lg shadow-violet-500/10'
              : selected === 'resume'
              ? 'opacity-30 pointer-events-none border-gray-800'
              : 'border-gray-800 hover:border-violet-500/50 cursor-pointer'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl mb-4">
              💬
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Document Chat</h3>
            <p className="text-sm text-gray-500 mb-5">Upload any document and have a full AI-powered conversation with it</p>

            <form onSubmit={handleDocSubmit} className="space-y-4">
              <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition ${
                docFile ? 'border-violet-500/50 bg-violet-500/5' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
              }`}>
                <span className="text-gray-400 text-sm flex-1 truncate">
                  {docFile ? `📄 ${docFile.name}` : 'Click to select PDF / DOC / DOCX / TXT'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleDocChange}
                  className="hidden"
                  disabled={selected === 'resume' || loading}
                />
              </label>

              {!isLoggedIn && selected === 'documents' && (
                <p className="text-xs text-amber-500/80 flex items-center gap-1.5">
                  <span>⚠</span> Guest mode — session deleted when you close the window
                </p>
              )}

              <button
                type="submit"
                disabled={!docFile || loading}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl text-sm transition"
              >
                {loading && selected === 'documents' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : 'Start Chatting →'}
              </button>
            </form>
          </div>
        </div>

        {/* Reset */}
        {selected && !loading && (
          <div className="mt-6 text-center">
            <button onClick={reset} className="text-xs text-gray-600 hover:text-gray-400 transition">
              ✕ Clear selection
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Feature