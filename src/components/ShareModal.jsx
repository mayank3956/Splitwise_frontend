import { useState } from 'react'
import { X, Copy, Check, RefreshCw, Link, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { regenerateShareCode } from '../api'

export default function ShareModal({ group, onClose, onCodeRegenerated }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const shareCode = group.shareCode
  const shareUrl = `${window.location.origin}/join/${shareCode}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode)
      setCodeCopied(true)
      toast.success('Code copied!')
      setTimeout(() => setCodeCopied(false), 2500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${group.name}" on Splitwise`,
          text: `Join my group "${group.name}" to split expenses! Use code: ${shareCode}`,
          url: shareUrl,
        })
      } catch {}
    } else {
      copyLink()
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('Regenerate invite code? The old link will stop working.')) return
    setLoading(true)
    try {
      const res = await regenerateShareCode(group._id)
      toast.success('New invite code generated!')
      onCodeRegenerated(res.data.shareCode)
    } catch {
      toast.error('Failed to regenerate code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Invite People</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Group info */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
              padding: '12px 14px', marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}
            >
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {group.members.length} members
              </div>
            </div>
          </div>

          {/* Invite Code */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">Invite Code</div>
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-light)',
                border: '2px dashed var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px 16px',
                marginBottom: 8, gap: 12,
              }}
            >
              {/* Code displayed as individual chars */}
              <div style={{ display: 'flex', gap: 6 }}>
                {shareCode.split('').map((ch, i) => (
                  <div
                    key={i}
                    style={{
                      width: 38, height: 48,
                      background: 'white',
                      border: '1.5px solid var(--primary)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'monospace',
                      fontSize: 20, fontWeight: 800,
                      color: 'var(--primary)',
                      boxShadow: '0 2px 6px rgba(28,194,159,0.15)',
                    }}
                  >
                    {ch}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={copyCode}
                title="Copy code"
                style={{ color: codeCopied ? 'var(--success)' : 'var(--primary)' }}
              >
                {codeCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Share this code — anyone can join at <strong>splitwise.app/join</strong>
            </p>
          </div>

          {/* Share Link */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label">Share Link</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1, padding: '11px 14px',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13, color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Link size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                {shareUrl}
              </div>
              <button
                className={`btn ${copied ? 'btn-outline' : 'btn-primary'} btn-sm`}
                onClick={copyLink}
                style={{ flexShrink: 0 }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
              How it works
            </div>
            {[
              '📤 Share the link or code with friends',
              '🔗 They open the link in their browser',
              '👀 They can view expenses & balances instantly',
              '💰 They can add expenses too — no login needed',
            ].map((step, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleRegenerate}
            disabled={loading}
            style={{ color: 'var(--danger)', fontSize: 13 }}
          >
            <RefreshCw size={13} />
            {loading ? 'Regenerating...' : 'Reset Code'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-primary btn-sm" onClick={handleShare}>
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
