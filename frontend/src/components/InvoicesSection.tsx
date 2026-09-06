import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Receipt,
  Download,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react'

const customerInvoices = [
  {
    id: 'INV-0041',
    customer: 'Nimesh Pathak',
    items: 'Office Wooden Chairs × 10',
    amount: '₹ 18,900',
    date: '02 Sep 2026',
    status: 'Paid',
    statusColor: 'emerald',
  },
  {
    id: 'INV-0042',
    customer: 'Modern Interiors Pvt Ltd',
    items: 'Luxury Oak Sofa Suite × 2',
    amount: '₹ 52,400',
    date: '04 Sep 2026',
    status: 'Posted',
    statusColor: 'emerald',
  },
  {
    id: 'INV-0043',
    customer: 'Urban Tech Labs',
    items: 'Ergonomic Standing Desks × 6',
    amount: '₹ 84,000',
    date: '05 Sep 2026',
    status: 'Draft',
    statusColor: 'neutral',
  },
]

const vendorBills = [
  {
    id: 'BILL-0018',
    vendor: 'Azure Timber & Wood',
    po: 'PO-0029',
    amount: '₹ 34,500',
    date: '01 Sep 2026',
    status: 'Matched',
    statusColor: 'emerald',
  },
  {
    id: 'BILL-0019',
    vendor: 'Global Hardware & Steel',
    po: 'PO-0031',
    amount: '₹ 16,200',
    date: '03 Sep 2026',
    status: 'Approved',
    statusColor: 'emerald',
  },
  {
    id: 'BILL-0020',
    vendor: 'Premium Fabric Supplies',
    po: 'PO-0034',
    amount: '₹ 22,800',
    date: '05 Sep 2026',
    status: 'Scheduled',
    statusColor: 'emerald',
  },
]

export default function InvoicesSection() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'bills'>('invoices')

  return (
    <section className="relative py-28 px-4 sm:px-6 bg-[#040508] text-white overflow-hidden" id="invoices">
      {/* Subtle green ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <FileText size={13} className="text-emerald-400" />
            <span>Invoices & Billing Management</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            GST-Compliant Invoicing & Vendor Bills
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Generate customer invoices with one-click PDF generation, capture vendor bills with automated PO matching,
            and keep your double-entry ledger in continuous sync.
          </p>
        </div>

        {/* Tab Switcher & Quick Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Customer Invoices</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">
                {customerInvoices.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bills')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'bills'
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Receipt size={14} />
              <span>Vendor Bills</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">
                {vendorBills.length}
              </span>
            </button>
          </div>

          {/* Quick Action Button */}
          <Link to="/register">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Create New {activeTab === 'invoices' ? 'Invoice' : 'Bill'}</span>
              <ArrowRight size={12} className="ml-1" />
            </button>
          </Link>
        </div>

        {/* Interactive Invoices/Bills Card Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#090b10]/90 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/[0.06] bg-white/[0.02] p-4 text-center divide-x divide-white/[0.06]">
            <div>
              <div className="text-[11px] text-neutral-500 font-medium">Total Volume</div>
              <div className="text-lg sm:text-xl font-bold text-white mt-0.5">₹ 1,55,300</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500 font-medium">Cleared & Paid</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">₹ 1,02,900</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500 font-medium">Pending Review</div>
              <div className="text-lg sm:text-xl font-bold text-neutral-200 mt-0.5">₹ 52,400</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500 font-medium">Tax Collected (GST)</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">₹ 23,695</div>
            </div>
          </div>

          {/* List Content */}
          <div className="divide-y divide-white/[0.06]">
            {activeTab === 'invoices' ? (
              customerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">{inv.id}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : inv.status === 'Posted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/10 text-neutral-300 border border-white/15'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                        {inv.customer} · <span className="text-neutral-500">{inv.items}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-bold text-white text-base">{inv.amount}</div>
                      <div className="text-[11px] text-neutral-500">{inv.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to="/login">
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="View Invoice"
                        >
                          <Eye size={14} />
                        </button>
                      </Link>
                      <Link to="/login">
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              vendorBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">{bill.id}</span>
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {bill.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                        {bill.vendor} · <span className="text-emerald-400/80">Ref: {bill.po}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-bold text-white text-base">{bill.amount}</div>
                      <div className="text-[11px] text-neutral-500">{bill.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to="/login">
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
