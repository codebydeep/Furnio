/**
 * Hook-only file — satisfies React Fast Refresh (no component exports here).
 */
import { useContext } from 'react'
import { LocomotiveContext } from './scrollContext'

export function useLocomotiveScroll() {
  return useContext(LocomotiveContext)
}
