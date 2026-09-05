/**
 * Shared context object — kept in its own file so both the
 * Provider (component) and the hook can import it without
 * violating React Fast Refresh's "one file = one export type" rule.
 */
import { createContext, type RefObject } from 'react'
import type LocomotiveScroll from 'locomotive-scroll'

export interface LocomotiveCtx {
  scroll: LocomotiveScroll | null
  containerRef: RefObject<HTMLDivElement | null>
}

export const LocomotiveContext = createContext<LocomotiveCtx>({
  scroll: null,
  containerRef: { current: null },
})
