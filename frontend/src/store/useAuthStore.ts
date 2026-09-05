import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, type ApiError } from '@/lib/api'

export type UserRole = 'admin' | 'accountant' | 'contact'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null

  login:    (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>
  logout:   () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      loading: false,
      error:   null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<{ user: AuthUser; token: string }>(
            '/auth/login',
            { email, password }
          )
          localStorage.setItem('ub_token', data.token)
          set({ user: data.user, token: data.token, loading: false })
          return true
        } catch (err) {
          const e = err as ApiError
          set({ error: e.message, loading: false })
          return false
        }
      },

      register: async (name, email, password, role = 'accountant') => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<{ user: AuthUser; token: string }>(
            '/auth/register',
            { name, email, password, role }
          )
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
        localStorage.removeItem('ub_user')
        set({ user: null, token: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ub_auth',       // localStorage key
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)

/* Convenience selectors ---------------------------------------- */
export const selectUser     = (s: AuthState) => s.user
export const selectRole     = (s: AuthState) => s.user?.role ?? null
export const selectIsAdmin  = (s: AuthState) => s.user?.role === 'admin'
export const selectLoggedIn = (s: AuthState) => !!s.token
