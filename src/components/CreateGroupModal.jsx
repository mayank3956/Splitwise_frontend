import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createGroup } from '../api'

const CATEGORIES = [
  { value: 'home', label: '🏠 Home' },
  { value: 'trip', label: '✈️ Trip' },
  { value: 'couple', label: '💑 Couple' },
  { value: 'friends', label: '👫 Friends' },
  { value: 'other', label: '👥 Other' },
]

export default function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [members, setMembers] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  const addMember = () => {
    const val = memberInput.trim()
    if (!val) return
    if (members.some((m) => m.toLowerCase() === val.toLowerCase())) {
      toast.error('Member already added')
      return
    }
    setMembers((prev) => [...prev, val])
    setMemberInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addMember()
    }
    if (e.key === 'Backspace' && !memberInput && members.length > 0) {
      setMembers((prev) => prev.slice(0, -1))
    }
  }

  const removeMember = (name) => {
    setMembers((prev) => prev.filter((m) => m !== name))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Group name is required')
    if (members.length < 2) return toast.error('Add at least 2 members')
    setLoading(true)
    try {
      const res = await createGroup({ name, description, category, members })
      toast.success('Group created!')
      onCreated(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create New Group</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Group Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Goa Trip, Flat Expenses..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  placeholder="Optional"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Members * (min 2)</label>
              <div
                className="tags-input-container"
                onClick={() => inputRef.current?.focus()}
              >
                {members.map((m) => (
                  <span key={m} className="tag">
                    {m}
                    <span className="tag-remove" onClick={() => removeMember(m)}>×</span>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  className="tags-input"
                  placeholder={members.length === 0 ? 'Type name & press Enter...' : 'Add more...'}
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={addMember}
                />
              </div>
              <p className="text-xs text-muted mt-1">Press Enter or comma to add each member</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
