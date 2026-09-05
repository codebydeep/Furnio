import { useEffect, useState } from 'react'
import { CreditCard, Loader2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useJournalStore } from '@/store'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
}

export interface PayDialogProps {
  title: string
  amountDue: number
  dueDate?: string
  partnerLabel?: string
  partnerName?: string
  onClose: () => void
  onConfirm: (payload: { journalId: number; amount: number; date: string }) => Promise<void>
}

export default function PayDialog({
  title, amountDue, dueDate, partnerLabel, partnerName, onClose, onConfirm,
}: PayDialogProps) {
  const { journals, fetchJournals } = useJournalStore()
  const bankCash = journals.filter(j => j.type === 'BANK' || j.type === 'CASH')

  const [journalId, setJournalId] = useState(0)
  const [amount, setAmount] = useState(amountDue)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paying, setPaying] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { fetchJournals() }, []) // eslint-disable-line
  useEffect(() => {
    if (!journalId && bankCash.length) setJournalId(bankCash[0].id)
  }, [bankCash, journalId])

  async function handlePay() {
    if (!journalId) { setErr('Select a Bank or Cash journal.'); return }
    if (amount <= 0) { setErr('Amount must be positive.'); return }
    setPaying(true); setErr('')
    try {
      await onConfirm({ journalId, amount, date })
      onClose()
    } catch (e: any) {
      setErr(e.message ?? 'Payment failed.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="auth-error"><span>{err}</span></div>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {partnerName && (
              <div>
                <p className="text-[var(--text-muted)]">{partnerLabel ?? 'Partner'}</p>
                <p className="font-medium text-[var(--text)]">{partnerName}</p>
              </div>
            )}
            <div>
              <p className="text-[var(--text-muted)]">Amount Due</p>
              <p className="font-bold text-lg text-[var(--accent)]">{fmt(amountDue)}</p>
            </div>
            {dueDate && (
              <div>
                <p className="text-[var(--text-muted)]">Due Date</p>
                <p className="font-medium text-[var(--text)]">{dueDate}</p>
              </div>
            )}
          </div>
          <div className="auth-field">
            <label className="auth-label">Journal (Bank / Cash)</label>
            <select className="auth-input" value={journalId} onChange={e => setJournalId(+e.target.value)}>
              <option value={0}>— select —</option>
              {bankCash.map(j => (
                <option key={j.id} value={j.id}>{j.name} ({j.type})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="auth-field">
              <label className="auth-label">Amount</label>
              <input type="number" min="0.01" step="0.01" className="auth-input"
                value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Date</label>
              <input type="date" className="auth-input" value={date}
                onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={paying} onClick={handlePay}>
              {paying
                ? <><Loader2 size={13} className="animate-spin mr-1" />Processing…</>
                : <><CreditCard size={13} className="mr-1" />Confirm Payment</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const DOC_STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  CONFIRMED: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  DONE:      'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELLED: 'bg-red-500/10   text-red-400   border-red-500/20',
}

export const PAY_STATUS_STYLE: Record<string, string> = {
  UNPAID:  'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  unpaid:  'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  PARTIAL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  partial: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PAID:    'bg-green-500/10 text-green-400 border-green-500/20',
  paid:    'bg-green-500/10 text-green-400 border-green-500/20',
  done:    'bg-green-500/10 text-green-400 border-green-500/20',
}

export function docStatusStyle(status: string) {
  return DOC_STATUS_STYLE[status] ?? DOC_STATUS_STYLE[status?.toUpperCase()] ?? DOC_STATUS_STYLE.DRAFT
}

export function payStatusStyle(status: string) {
  return PAY_STATUS_STYLE[status] ?? PAY_STATUS_STYLE[status?.toLowerCase()] ?? PAY_STATUS_STYLE.UNPAID
}
