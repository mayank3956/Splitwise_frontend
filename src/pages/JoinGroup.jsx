import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getGroupByShareCode } from '../api'
import { getGroupColor, GROUP_EMOJIS } from '../utils/helpers'

export default function JoinGroup() {
  const { shareCode } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [searching, setSearching] = useState(false)

  const lookupCode = async (code) => {
    if (!code?.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await getGroupByShareCode(code.trim())
      setGroup(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code')
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shareCode) {
      lookupCode(shareCode)
    } else {
      setLoading(false)
    }
  }, [shareCode])

  const handleManualSearch = (e) => {
    e.preventDefault()
    lookupCode(manualCode)
  }

  const handleOpenGroup = () => {
    navigate(`/group/${group._id}`)
    toast.success(`Joined "${group.name}"!`)
  }

  const color = group ? getGroupColor(group.name) : 'var(--primary)'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 60, height: 60,
              background: 'var(--primary)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 14px',
              boxShadow: '0 6px 20px rgba(28,194,159,0.35)',
            }}
          >
            💸
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Join a Group
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Enter an invite code to access a shared group
          </div>
        </div>

        {/* Manual code entry */}
        {!shareCode && (
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '20px',
              marginBottom: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <form onSubmit={handleManualSearch}>
              <label
                style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 8,
                }}
              >
                Invite Code
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="e.g. A3F9C2"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 4, textAlign: 'center' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={!manualCode.trim()}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              padding: '32px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Looking up invite code…</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: 'var(--danger-light)', borderRadius: 'var(--radius)',
              border: '1px solid var(--danger)', padding: '20px',
              textAlign: 'center', marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>Code Not Found</div>
            <div style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</div>
          </div>
        )}

        {/* Success — Group found */}
        {!loading && group && (
          <div
            style={{
              background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            {/* Color band */}
            <div style={{ height: 6, background: color }} />

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}
                >
                  {GROUP_EMOJIS[group.category] || '👥'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{group.name}</div>
                  {group.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {group.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Members */}
              <div
                style={{
                  background: 'var(--bg)', borderRadius: 10,
                  padding: '12px 14px', marginBottom: 18,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.members.length} Members
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {group.members.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'white',
                        borderRadius: 20, padding: '4px 10px',
                        fontSize: 13, fontWeight: 500,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: getGroupColor(m.name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 11, fontWeight: 700,
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--primary-light)', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 18,
                  fontSize: 13, color: 'var(--primary-dark)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
                <span>You'll be able to view and add expenses without any login. Just pick your name from the members list!</span>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 12 }}
                onClick={handleOpenGroup}
              >
                Open Group
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
