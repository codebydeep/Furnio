import { Separator } from '@/components/ui/separator'

const stats = [
  { value: '5',    label: 'Master Data Modules' },
  { value: '3',    label: 'User Roles' },
  { value: '4',    label: 'Journal Types' },
  { value: '3',    label: 'Financial Reports' },
  { value: '100%', label: 'Double-Entry Accurate' },
]

export default function StatsStrip() {
  return (
    <div className="stats-strip">
      {stats.map(({ value, label }, i) => (
        <div key={label} className="stat-row">
          <div className="stat-item">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
          {i < stats.length - 1 && (
            <Separator orientation="vertical" className="stat-sep" />
          )}
        </div>
      ))}
    </div>
  )
}
