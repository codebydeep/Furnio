import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BottomCardProps {
  title: string
  subtitle: string
  accent: string
  cta?: boolean
  style?: React.CSSProperties
  emoji?: string
  tag?: string
}

export default function BottomCard({ title, subtitle, accent, cta, style, emoji, tag }: BottomCardProps) {
  return (
    <div
      className="bottom-card"
      style={{ ...style, '--card-accent': accent } as React.CSSProperties}
    >
      {emoji && <span className="bottom-card-emoji">{emoji}</span>}
      <div className="bottom-card-body">
        {tag && (
          <Badge variant="secondary" className="bottom-card-tag mb-2">
            {tag}
          </Badge>
        )}
        <p className="bottom-card-title">{title}</p>
        {subtitle && <p className="bottom-card-sub">{subtitle}</p>}
      </div>
      {cta && (
        <Button
          size="sm"
          className="rounded-full bg-white/90 text-black hover:bg-white text-xs gap-1 w-fit mt-1"
        >
          Get Started <ArrowUpRight size={12} />
        </Button>
      )}
    </div>
  )
}
