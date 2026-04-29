import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { createSettlement } from '../api'
import { formatCurrency } from '../utils/helpers'

export default function SettleUpModal({ group, debts, onClose, onSettled }) {
  const [from, setFrom] = useState(debts[0]?.from || group.members[0]?.name || '')
  const [to, setTo] = useState(debts[0]?.to || group.members[1]?.name || '')
  const [amount, setAmount] = useState(debts[0]?.amount?.toFixed(2) || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const selectDebt = (debt) => {
    setFrom(debt.from)
    setTo(debt.to)
    setAmount(debt.amount.toFixed(2))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!from || !to || from === to) return toast.error('Select different from/to members')
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount')
    setLoading(true)
    try {
      const res = await createSettlement({
        groupId: group._id,
        from,
        to,
        amount: parseFloat(amount),
        date,
        notes,
      })
      toast.success('Settlement recorded!')
      onSettled(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Settle Up</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {debts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p className="form-label" style={{ marginBottom: 8 }}>Suggested Settlements</p>
              {debts.map((d, i) => (
                <div
                  key={i}
                  onClick={() => selectDebt(d)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${from === d.from && to === d.to ? 'var(--primary)' : 'var(--border)'}`,
                    background: from === d.from && to === d.to ? 'var(--primary-light)' : 'var(--bg)',
                    cursor: 'pointer',
                    marginBottom: 6,
                    fontSize: 14,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{d.from}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 600 }}>{d.to}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From (pays)</label>
                <select
                  className="form-select"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To (receives)</label>
                <select
                  className="form-select"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input
                className="form-input"
                placeholder="e.g. Cash payment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Record Settlement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
