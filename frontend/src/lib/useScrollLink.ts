import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Returns a click handler that scrolls to a section by id.
 * Uses Locomotive's scrollTo when available (smooth), otherwise
 * falls back to native scrollIntoView.
 */
export function useScrollLink(sectionId: string) {
  const navigate = useNavigate()
  const location = useLocation()

  return (e: React.MouseEvent) => {
    e.preventDefault()

    const scroll = () => {
      const ls = (window as any).__locomotiveScroll
      if (ls) {
        // Locomotive smooth scroll to the section element
        const el = document.getElementById(sectionId)
        if (el) ls.scrollTo(el, { offset: -80, duration: 1.2 })
      } else {
        // Fallback: native smooth scroll
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(scroll, 300)
    } else {
      scroll()
    }
  }
}
