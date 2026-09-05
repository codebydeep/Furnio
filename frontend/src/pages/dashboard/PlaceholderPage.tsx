import { useLocation, Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PlaceholderPage() {
  const { pathname } = useLocation()

  // Derive a nice title from the path
  const segments = pathname.split('/').filter(Boolean)
  const last     = segments[segments.length - 1] ?? ''
  const title    = last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="db-page">
      <div className="db-page-header">
        <h1 className="db-page-title">{title}</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <Construction size={26} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Coming Soon</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          The <strong>{title}</strong> module is under active development and will be available shortly.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="gap-1.5 mt-2">
            <ArrowLeft size={13} /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
