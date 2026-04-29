import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users, TrendingUp, DollarSign, Trash2, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { getGroups, deleteGroup } from "../api"
import { getGroupColor, GROUP_EMOJIS } from "../utils/helpers"
import CreateGroupModal from "../components/CreateGroupModal"

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const fetchGroups = async () => {
    try {
      const res = await getGroups()
      setGroups(res.data)
    } catch {
      toast.error("Failed to fetch groups")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  const handleCreated = (group) => {
    setGroups((prev) => [group, ...prev])
    navigate(`/group/${group._id}`)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm("Delete this group and all its expenses?")) return
    try {
      await deleteGroup(id)
      setGroups((prev) => prev.filter((g) => g._id !== id))
      toast.success("Group deleted")
    } catch {
      toast.error("Failed to delete group")
    }
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Dashboard</span>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Group
        </button>
      </div>

      <div className="mobile-header">
        <div>
          <div className="mobile-header-title">Splitwise</div>
          <div className="mobile-header-sub">{groups.length} groups</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New
        </button>
      </div>

      <div className="page-body">
        <div className="hero-banner">
          <h2>Track Expenses Together</h2>
          <p>Split bills, settle debts, stay balanced</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Users size={20} /></div>
            <div>
              <div className="stat-label">Groups</div>
              <div className="stat-value neutral">{groups.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><TrendingUp size={20} /></div>
            <div>
              <div className="stat-label">Active</div>
              <div className="stat-value neutral">{groups.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><DollarSign size={20} /></div>
            <div>
              <div className="stat-label">Members</div>
              <div className="stat-value neutral">{groups.reduce((s, g) => s + g.members.length, 0)}</div>
            </div>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">My Groups</span>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <Users size={52} />
            <h3>No groups yet</h3>
            <p>Create a group to start splitting expenses!</p>
            <button className="btn btn-primary mt-3" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Create First Group
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.map((g) => (
              <div
                key={g._id}
                style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "all 0.15s", WebkitTapHighlightColor: "transparent" }}
                onClick={() => navigate(`/group/${g._id}`)}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: getGroupColor(g.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {GROUP_EMOJIS[g.category] || "👥"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    {g.members.length} members{g.description ? ` · ${g.description}` : ""}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {g.members.slice(0, 3).map((m) => (
                      <span key={m._id} className="member-chip">{m.name}</span>
                    ))}
                    {g.members.length > 3 && <span className="member-chip">+{g.members.length - 3}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button className="btn btn-ghost btn-icon" onClick={(e) => handleDelete(e, g._id)}>
                    <Trash2 size={15} style={{ color: "var(--danger)" }} />
                  </button>
                  <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </>
  )
}