import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuthStore } from '../store/authstore'

export default function Home() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16">

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Powered by RAG + Groq LLM
            </div>

            {isLoggedIn ? (
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  {user?.name}
                </span>
              </h1>
            ) : (
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
                Chat with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  your documents
                </span>
              </h1>
            )}

            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              {isLoggedIn
                ? 'Your analyses and chats are saved. Pick up where you left off or start something new.'
                : 'Upload any document. Ask anything. Get instant, accurate answers powered by retrieval-augmented generation.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/features')}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                {isLoggedIn ? 'Start New Analysis →' : 'Get Started →'}
              </button>
              {!isLoggedIn && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <div className="mb-20">
              <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-6">Quick Access</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => navigate('/history/suggestions')}
                  className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl px-5 py-4 transition-all duration-200 hover:bg-gray-800/60 text-left"
                >
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="font-semibold text-white group-hover:text-indigo-300 transition">Resume History</p>
                    <p className="text-xs text-gray-500 mt-0.5">View past analyses</p>
                  </div>
                  <span className="ml-auto text-gray-600 group-hover:text-indigo-400 transition">→</span>
                </button>
                <button
                  onClick={() => navigate('/history/chats')}
                  className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-xl px-5 py-4 transition-all duration-200 hover:bg-gray-800/60 text-left"
                >
                  <span className="text-3xl">💬</span>
                  <div>
                    <p className="font-semibold text-white group-hover:text-violet-300 transition">Chat History</p>
                    <p className="text-xs text-gray-500 mt-0.5">Continue past conversations</p>
                  </div>
                  <span className="ml-auto text-gray-600 group-hover:text-violet-400 transition">→</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-6">What you can do</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: '🎯',
                  title: 'Resume Analysis',
                  desc: 'Get AI-powered suggestions and 10 tailored interview Q&As from your resume.',
                  color: 'indigo',
                },
                {
                  icon: '💬',
                  title: 'Document Chat',
                  desc: 'Upload any PDF or DOCX and have a full conversation with its content.',
                  color: 'violet',
                },
                {
                  icon: '🔒',
                  title: 'Save & Revisit',
                  desc: 'Logged-in users get all sessions saved automatically for later access.',
                  color: 'sky',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200"
                >
                  <span className="text-3xl mb-4 block">{card.icon}</span>
                  <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {!isLoggedIn && (
            <div className="mt-16 text-center border border-dashed border-gray-800 rounded-2xl px-8 py-10">
              <p className="text-gray-400 text-sm mb-1">Want to save your analyses?</p>
              <p className="text-white font-semibold text-lg mb-4">Create a free account</p>
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
              >
                Register now →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}