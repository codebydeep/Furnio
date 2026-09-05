/**
 * Component-only file — satisfies React Fast Refresh (no hook exports here).
 *
 * Key rules for correct Locomotive Scroll behaviour:
 * 1. data-scroll-container must be the ONLY scrolling element
 * 2. html + body must have overflow:hidden (set in CSS)
 * 3. Navbar is position:fixed z-index:1000 — outside any data-scroll-section
 * 4. ScrollTrigger proxy bridges Locomotive position to GSAP
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import LocomotiveScroll from 'locomotive-scroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LocomotiveContext } from './scrollContext'

gsap.registerPlugin(ScrollTrigger)

export default function LocomotiveProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = useState<LocomotiveScroll | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Small delay lets React finish painting all sections before
    // Locomotive measures their heights — prevents overlap/clipping
    const init = setTimeout(() => {
      const ls = new LocomotiveScroll({
        el,
        smooth: true,
        multiplier: 0.85,
        lerp: 0.08,
        smartphone: { smooth: false }, // native scroll on mobile for reliability
        tablet:     { smooth: true, breakpoint: 1024 },
        getDirection: true,
        getSpeed: true,
      })

      // ── Bridge Locomotive ↔ GSAP ScrollTrigger ──────────────
      ls.on('scroll', () => ScrollTrigger.update())

      ScrollTrigger.scrollerProxy(el, {
        scrollTop(value) {
          if (arguments.length && value !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(ls as any).scrollTo(value, { duration: 0, disableLerp: true })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (ls as any).scroll.instance.scroll.y as number
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        },
        // Locomotive uses CSS transforms — tell ScrollTrigger to match
        pinType: 'transform',
      })

      ScrollTrigger.addEventListener('refresh', () => ls.update())

      // Refresh after fonts / images load so heights are correct
      window.addEventListener('load', () => {
        ls.update()
        ScrollTrigger.refresh()
      })

      ScrollTrigger.refresh()
      setScroll(ls)

      // Store on window for Navbar scrollTo calls
      ;(window as any).__locomotiveScroll = ls
    }, 200)

    return () => {
      clearTimeout(init)
      ScrollTrigger.getAll().forEach(t => t.kill())
      if ((window as any).__locomotiveScroll) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).__locomotiveScroll.destroy()
        delete (window as any).__locomotiveScroll
      }
    }
  }, [])

  return (
    <LocomotiveContext.Provider value={{ scroll, containerRef }}>
      {/*
        data-scroll-container:
        - position:fixed + overflow:hidden set via CSS
        - Locomotive translates this div's children to simulate scroll
      */}
      <div ref={containerRef} data-scroll-container>
        {children}
      </div>
    </LocomotiveContext.Provider>
  )
}
