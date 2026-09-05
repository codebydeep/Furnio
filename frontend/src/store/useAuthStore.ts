import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, type ApiError } from '@/lib/api'

export type UserRole = 'admin' | 'accountant' | 'contact'

/* Matches backend sanitize() output */
export interface AuthUser {
  id:        string
  name:      string | null
  email:     string
  image:     string | null
  role:      UserRole
  createdAt: string
  updatedAt: string
}

/* Matches backend login + register response */
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
  register:   (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>
  logout:     () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      /* ── DEMO MODE default state ──────────────────────────────
         Pre-fill a demo user so the dashboard renders without login.
         Revert: remove these four lines and restore null defaults.
      ─────────────────────────────────────────────────────────── */
      user: {
        id: 'demo-001',
        name: 'Nimesh Pathak',
        email: 'nimesh@urbanfurniture.com',
        image: null,
        role: 'admin' as UserRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token:   'demo-token',
      /* ── end demo defaults ──────────────────────────────────── */
      loading: false,
      error:   null,

      /* ── POST /api/users/login ─────────────────────────────── */
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/users/login', { email, password })
          localStorage.setItem('ub_token', data.token)
          set({ user: data.user, token: data.token, loading: false })
          return true
        } catch (err) {
          const e = err as ApiError
          set({ error: e.message, loading: false })
          return false
        }
      },

      /* ── POST /api/users/register ──────────────────────────── */
      register: async (name, email, password, role = 'accountant') => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResponse>('/users/register', {
            name, email, password, role,
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
      name:        'ub_auth',
      partialize:  (s) => ({ user: s.user, token: s.token }),
    }
  )
)

/* ── Selectors ─────────────────────────────────────────────── */
export const selectUser      = (s: AuthState) => s.user
export const selectRole      = (s: AuthState) => s.user?.role ?? null
export const selectIsAdmin   = (s: AuthState) => s.user?.role === 'admin'
export const selectLoggedIn  = (s: AuthState) => !!s.token
