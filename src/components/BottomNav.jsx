import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Users, Plus } from 'lucide-react'
import CreateGroupModal from './CreateGroupModal'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showCreate, setShowCreate] = useState(false)

  const isHome = location.pathname === '/'
  const isGroup = location.pathname.startsWith('/group/')

  const handleCreated = (group) => {
    navigate(`/group/${group._id}`)
  }

  return (
    <>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            className={`bottom-nav-btn ${isHome ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <Home size={22} />
            Home
          </button>

          <button
            className="bottom-nav-fab"
            onClick={() => setShowCreate(true)}
            aria-label="Add Group"
          >
            <Plus size={26} />
          </button>

          <button
            className={`bottom-nav-btn ${isGroup ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <Users size={22} />
            Groups
          </button>
        </div>
      </nav>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
