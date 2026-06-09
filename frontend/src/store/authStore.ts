// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../utils/api'

export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  is_active: boolean
  preferred_model: string
  preferred_provider: string
  total_messages: number
  total_tokens: number
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authAPI.login({ email, password })
          localStorage.setItem('auth_token', data.access_token)
          set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const { data: res } = await authAPI.register(data)
          localStorage.setItem('auth_token', res.access_token)
          set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        try {
          const { data } = await authAPI.me()
          set({ user: data, isAuthenticated: true, token })
        } catch {
          localStorage.removeItem('auth_token')
          set({ isAuthenticated: false, user: null, token: null })
        }
      },
    }),
    {
      name: 'ai-nexus-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
