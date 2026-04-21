import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuthStore()
  const [historyOpen, setHistoryOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleHistoryNav = (path: string) => {
    setHistoryOpen(false)
    navigate(path)
  }

  return (
    <nav className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span
              className="text-indigo-400 text-lg cursor-pointer hover:text-indigo-300 transition"
              onClick={() => navigate('/blank')}
            >⬡</span>
            <span
              className="text-white font-bold tracking-tight cursor-pointer hover:text-gray-300 transition"
              onClick={() => navigate('/')}
            >DocuRAG</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <span className="text-gray-400 text-sm hidden sm:block">{user?.name}</span>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setHistoryOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition"
                  >
                    History
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${historyOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {historyOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={() => handleHistoryNav('/history/suggestions')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition text-left"
                      >
                        <span>📄</span>
                        <div>
                          <p className="font-medium text-white">Resume History</p>
                          <p className="text-xs text-gray-500">Past analyses</p>
                        </div>
                      </button>
                      <div className="h-px bg-gray-800" />
                      <button
                        onClick={() => handleHistoryNav('/history/chats')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition text-left"
                      >
                        <span>💬</span>
                        <div>
                          <p className="font-medium text-white">Chat History</p>
                          <p className="text-xs text-gray-500">Past document chats</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}