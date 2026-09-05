/**
 * Axios instance — single source for all HTTP calls.
 *
 * Base URL: VITE_API_URL env var  →  fallback: http://localhost:3000/api
 * Backend routes are mounted at /api/users so callers use e.g. /users/login
 *
 * Interceptors:
 *  - Request:  attach JWT Bearer token from localStorage
 *  - Response: on 401 clear auth + redirect to /login
 *              normalise error shape to { message, status }
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // send cookies if any are set in future
})

/* ── Request: attach token ─────────────────────────────────── */
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

/* ── Response: handle 401 + normalise errors ───────────────── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ub_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const message =
      error.response?.data?.message ??
      error.response?.data?.detail  ??
      error.message                 ??
      'Unexpected error'
    return Promise.reject({ message, status: error.response?.status ?? 0 } as ApiError)
  }
)

/* ── Typed result helper ───────────────────────────────────── */
export interface ApiError {
  message: string
  status:  number
}

/**
 * Wraps an axios call and returns a discriminated tuple:
 *   [data, null]  on success
 *   [null, error] on failure
 *
 * Usage:
 *   const [data, err] = await request(() => api.get('/users'))
 */
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
