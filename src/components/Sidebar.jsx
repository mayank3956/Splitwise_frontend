import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Users, Plus, LogOut } from 'lucide-react'
import { getGroups } from '../api'
import { getGroupColor, GROUP_EMOJIS } from '../utils/helpers'
import CreateGroupModal from './CreateGroupModal'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [groups, setGroups] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const fetchGroups = async () => {
    try {
      const res = await getGroups()
      setGroups(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchGroups()
    // Refresh on navigation
  }, [location.pathname])

  const handleGroupCreated = (group) => {
    setGroups((prev) => [group, ...prev])
    navigate(`/group/${group._id}`)
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">Split<span>wise</span></span>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <Home size={17} />
            Dashboard
          </div>

          <div className="sidebar-section-label">My Groups</div>

          {groups.map((g) => (
            <div
              key={g._id}
              className={`sidebar-group-item ${location.pathname === `/group/${g._id}` ? 'active' : ''}`}
              onClick={() => navigate(`/group/${g._id}`)}
            >
              <div
                className="group-avatar-sm"
                style={{ background: getGroupColor(g.name) }}
              >
                {GROUP_EMOJIS[g.category] || '👥'}
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {g.name}
              </span>
            </div>
          ))}

          {groups.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 12px' }}>
              No groups yet
            </p>
          )}
        </nav>

        <div className="sidebar-add-group">
          <button
            className="btn btn-primary w-full"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            New Group
          </button>
        </div>

        {/* User profile + logout */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <button
              className="btn btn-ghost btn-icon sidebar-logout-btn"
              onClick={() => { logout(); navigate('/login') }}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </aside>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </>
  )
}
