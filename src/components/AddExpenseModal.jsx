import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createExpense } from '../api'
import { CATEGORY_EMOJIS } from '../utils/helpers'

const CATEGORIES = [
  { value: 'food', label: '🍔 Food & Drink' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'other', label: '📝 Other' },
]

export default function AddExpenseModal({ group, onClose, onAdded }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(group.members[0]?.name || '')
  const [category, setCategory] = useState('other')
  const [splitType, setSplitType] = useState('equal')
  const [splitAmong, setSplitAmong] = useState(group.members.map((m) => m.name))
  const [customSplits, setCustomSplits] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize custom splits when amount changes
  useEffect(() => {
    if (splitType === 'unequal') {
      const share = splitAmong.length > 0 ? (parseFloat(amount) || 0) / splitAmong.length : 0
      const init = {}
      splitAmong.forEach((m) => { init[m] = share.toFixed(2) })
      setCustomSplits(init)
    }
  }, [splitType, amount, splitAmong])

  const toggleSplitMember = (name) => {
    setSplitAmong((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    )
  }

  const getCustomTotal = () => {
    return Object.values(customSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return toast.error('Description is required')
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount')
    if (!paidBy) return toast.error('Select who paid')
    if (splitAmong.length === 0) return toast.error('Select at least one member to split')

    let splits
    if (splitType === 'equal') {
      const share = parseFloat(amount) / splitAmong.length
      splits = splitAmong.map((m) => ({ memberName: m, amount: Math.round(share * 100) / 100 }))
    } else {
      const total = getCustomTotal()
      if (Math.abs(total - parseFloat(amount)) > 0.05)
        return toast.error(`Split total (₹${total.toFixed(2)}) doesn't match expense amount (₹${parseFloat(amount).toFixed(2)})`)
      splits = splitAmong.map((m) => ({ memberName: m, amount: parseFloat(customSplits[m]) || 0 }))
    }

    setLoading(true)
    try {
      const res = await createExpense({
        groupId: group._id,
        description,
        amount: parseFloat(amount),
        paidBy,
        splitType,
        splits,
        date,
        category,
        notes,
      })
      toast.success('Expense added!')
      onAdded(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const equalShare = splitAmong.length > 0 ? (parseFloat(amount) || 0) / splitAmong.length : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Expense</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Description *</label>
                <input
                  className="form-input"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Paid By *</label>
                <select
                  className="form-select"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  className="form-input"
                  placeholder="Optional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Split Section */}
            <div className="form-group">
              <label className="form-label">Split Type</label>
              <div className="split-toggle">
                <button
                  type="button"
                  className={splitType === 'equal' ? 'active' : ''}
                  onClick={() => setSplitType('equal')}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  className={splitType === 'unequal' ? 'active' : ''}
                  onClick={() => setSplitType('unequal')}
                >
                  Unequal Split
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Split Among</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.members.map((m) => {
                  const checked = splitAmong.includes(m.name)
                  return (
                    <div
                      key={m._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
                        background: checked ? 'var(--primary-light)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => toggleSplitMember(m.name)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                        {m.name === paidBy && (
                          <span className="badge badge-green" style={{ fontSize: 10 }}>paid</span>
                        )}
                      </div>
                      {checked && (
                        <div style={{ textAlign: 'right' }}>
                          {splitType === 'equal' ? (
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
                              ₹{equalShare.toFixed(2)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={customSplits[m.name] || ''}
                              onChange={(e) =>
                                setCustomSplits((prev) => ({ ...prev, [m.name]: e.target.value }))
                              }
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: 90,
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1.5px solid var(--border)',
                                fontSize: 14,
                                fontWeight: 600,
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {splitType === 'unequal' && amount && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: Math.abs(getCustomTotal() - parseFloat(amount)) > 0.05
                      ? 'var(--danger-light)'
                      : 'var(--success-light)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: Math.abs(getCustomTotal() - parseFloat(amount)) > 0.05
                      ? 'var(--danger)'
                      : 'var(--success)',
                  }}
                >
                  Total split: ₹{getCustomTotal().toFixed(2)} / ₹{parseFloat(amount).toFixed(2)}
                  {Math.abs(getCustomTotal() - parseFloat(amount)) > 0.05
                    ? ` — Remaining: ₹${(parseFloat(amount) - getCustomTotal()).toFixed(2)}`
                    : ' ✓ Balanced'}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
