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
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
