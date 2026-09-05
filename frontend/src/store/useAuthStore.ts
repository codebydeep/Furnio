import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, type ApiError } from '@/lib/api'

export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'USER'

export interface AuthUser {
  id:        number
  name:      string
  loginId:   string
  email:     string
  role:      UserRole
  contactId: number | null
  createdAt: string
  updatedAt: string
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

  login:      (loginId: string, password: string) => Promise<boolean>
  register:   (name: string, loginId: string, email: string, password: string) => Promise<boolean>
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

      login: async (loginId, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/auth/login', { loginId, password })
          localStorage.setItem('ub_token', data.token)
          const user = { ...data.user, role: data.user.role?.toUpperCase() as UserRole }
          set({ user, token: data.token, loading: false })
          return true
        } catch (err) {
          const e = err as ApiError
          set({ error: e.message, loading: false })
          return false
        }
      },

      register: async (name, loginId, email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/auth/register', {
            name, loginId, email, password,
          })
          localStorage.setItem('ub_token', data.token)
          const user = { ...data.user, role: data.user.role?.toUpperCase() as UserRole }
          set({ user, token: data.token, loading: false })
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

export const selectUser     = (s: AuthState) => s.user
export const selectRole     = (s: AuthState) => s.user?.role ?? null
export const selectIsAdmin  = (s: AuthState) => s.user?.role === 'ADMIN'
export const selectLoggedIn = (s: AuthState) => !!s.token
