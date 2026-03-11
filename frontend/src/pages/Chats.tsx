import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

interface ChatHistory {
  id: number
  question: string
  answer: string
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/chat`

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function historyToMessages(history: ChatHistory[]): Message[] {
  const messages: Message[] = []
  history.forEach((entry) => {
    messages.push({ id: `q-${entry.id}`, sender: 'user', text: entry.question, timestamp: '' })
    if (entry.answer) {
      messages.push({ id: `a-${entry.id}`, sender: 'assistant', text: entry.answer, timestamp: '' })
    }
  })
  return messages
}

function Chats() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuthStore()
  const sessionId = localStorage.getItem('session_id')

  const [messages, setMessages] = useState<Message[]>([])
  const [roomTitle, setRoomTitle] = useState<string>(`Chat #${id}`)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoggedIn || !id) { setInitialLoading(false); return }
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load chat history')
        const data = await res.json()
        setRoomTitle(data.room.title || `Chat #${id}`)
        setMessages(historyToMessages(data.chats || []))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchRoom()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const question = inputValue.trim()
    const roomId = isLoggedIn ? id : sessionId

    if (!roomId) {
      setError('No active session. Please upload a document first.')
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: formatTime(new Date()),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(
        `${BASE_URL}/ask/${roomId}?question=${encodeURIComponent(question)}`,
        { method: 'POST', headers }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to get response')
      }

      const data = await res.json()
      setMessages((prev) => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: formatTime(new Date()),
      }])
    } catch (err: any) {
      setError(err.message)
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate('//history/chats')} className="text-gray-500 hover:text-white transition text-sm flex-shrink-0">
            ← Back
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{roomTitle}</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {isLoggedIn ? 'Saved session' : 'Guest session — history will not be saved'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-500/10 border-b border-red-500/20 px-6 py-2 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">

          {initialLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl mb-4">
                💬
              </div>
              <p className="text-gray-400 font-medium">No messages yet</p>
              <p className="text-gray-600 text-sm mt-1">Ask anything about your document</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'assistant' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm mr-2 mt-1">
                    ⬡
                  </div>
                )}
                <div className={`max-w-lg rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  {message.timestamp && (
                    <p className={`text-xs mt-1.5 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm mr-2">
                ⬡
              </div>
              <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask something about your document..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="flex-shrink-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition flex items-center justify-center"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  )
}

export default Chats