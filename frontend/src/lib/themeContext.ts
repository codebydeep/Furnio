import { createContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

export const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  toggle: () => {},
})
