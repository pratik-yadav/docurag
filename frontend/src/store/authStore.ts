import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: (user, token) => {
        set({ user, token, isLoggedIn: true })
      },

      logout: () => {
        localStorage.removeItem('session_id')
        set({ user: null, token: null, isLoggedIn: false })
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
)