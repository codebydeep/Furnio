/**
 * Axios instance — single source for all HTTP calls.
 *
 * - Reads BASE_URL from VITE_API_URL env var (fallback: localhost:8069)
 * - Attaches JWT Bearer token from localStorage on every request
 * - On 401: clears auth state and redirects to /login
 * - Normalises error shape so stores always get { message, status }
 */
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8069/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Request interceptor: attach token ──────────────────────── */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ub_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor: handle 401 / normalise errors ───── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('ub_token')
      localStorage.removeItem('ub_user')
      // Redirect to login (works outside React tree)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    // Normalise error so every store can do:  error.message
    const message =
      error.response?.data?.message ??
      error.response?.data?.detail ??
      error.message ??
      'Unexpected error'
    return Promise.reject({ message, status: error.response?.status ?? 0 })
  }
)

/* ── Typed helper so stores don't repeat try/catch boilerplate ─ */
export interface ApiError {
  message: string
  status: number
}

export async function request<T>(
  fn: () => Promise<{ data: T }>
): Promise<[T, null] | [null, ApiError]> {
  try {
    const { data } = await fn()
    return [data, null]
  } catch (err) {
    return [null, err as ApiError]
  }
}
