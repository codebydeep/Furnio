import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, type ApiError } from '@/lib/api'

// Backend Role enum values (uppercase)
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'CONTACT'

// Matches backend sanitize() output for new schema
export interface AuthUser {
  id:        string
  loginId:   string
  email:     string
  role:      UserRole
  contactId: string | null
  createdAt: string
}

interface AuthResponse {
  message: string
  token:   string
  user:    AuthUser
}

interface AuthState {
  user:    AuthUser | null
  token:   string   | null
  loading: boolean
  error:   string   | null

  login:      (email: string, password: string) => Promise<boolean>
  register:   (email: string, password: string, role: UserRole) => Promise<boolean>
  logout:     () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      loading: false,
      error:   null,

      // POST /api/auth/login
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
          localStorage.setItem('ub_token', data.token)
          set({ user: data.user, token: data.token, loading: false })
          return true
        } catch (err) {
          const e = err as ApiError
          set({ error: e.message, loading: false })
          return false
        }
      },

      // POST /api/auth/register
      register: async (email, password, role) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/auth/register', {
            email, password, role,
          })
          localStorage.setItem('ub_token', data.token)
          set({ user: data.user, token: data.token, loading: false })
          return true
        } catch (err) {
          const e = err as ApiError
          set({ error: e.message, loading: false })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('ub_token')
        set({ user: null, token: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name:       'ub_auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)

// Selectors
export const selectUser      = (s: AuthState) => s.user
export const selectRole      = (s: AuthState) => s.user?.role ?? null
export const selectIsAdmin   = (s: AuthState) => s.user?.role === 'ADMIN'
export const selectLoggedIn  = (s: AuthState) => !!s.token
