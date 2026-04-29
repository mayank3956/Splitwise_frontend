import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Plus, ArrowLeft, UserPlus, CheckCircle, Trash2,
  ArrowRight, Receipt, Clock, BarChart2, Users, Share2
} from "lucide-react"
import toast from "react-hot-toast"
import {
  getGroup, getExpenses, getSettlements, getBalances,
  deleteExpense, deleteSettlement, addMember
} from "../api"
import {
  getGroupColor, GROUP_EMOJIS, CATEGORY_EMOJIS,
  formatCurrency, formatDate
} from "../utils/helpers"
import AddExpenseModal from "../components/AddExpenseModal"
import SettleUpModal from "../components/SettleUpModal"
import ShareModal from "../components/ShareModal"

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [balances, setBalances] = useState({ debts: [], summary: {} })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("expenses")
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [newMemberName, setNewMemberName] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [gRes, eRes, sRes, bRes] = await Promise.all([
        getGroup(id), getExpenses(id), getSettlements(id), getBalances(id),
      ])
      setGroup(gRes.data)
      setExpenses(eRes.data)
      setSettlements(sRes.data)
      setBalances(bRes.data)
    } catch {
      toast.error("Failed to load group")
      navigate("/")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleExpenseAdded = () => { fetchAll() }
  const handleSettled = () => { fetchAll() }

  const handleDeleteExpense = async (expId) => {
    if (!confirm("Delete this expense?")) return
    try {
      await deleteExpense(expId)
      fetchAll()
      toast.success("Expense deleted")
    } catch { toast.error("Failed to delete") }
  }

  const handleDeleteSettlement = async (sId) => {
    if (!confirm("Delete this settlement?")) return
    try {
      await deleteSettlement(sId)
      fetchAll()
      toast.success("Settlement deleted")
    } catch { toast.error("Failed to delete") }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberName.trim()) return
    try {
      const res = await addMember(id, newMemberName)
      setGroup(res.data)
      setNewMemberName("")
      setShowAddMember(false)
      toast.success("Member added!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member")
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    )
  }

  if (!group) return null

  const color = getGroupColor(group.name)

  return (
    <>
      {/* ===== DESKTOP TOPBAR ===== */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {GROUP_EMOJIS[group.category] || "👥"}
          </div>
          <div>
            <div className="topbar-title">{group.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{group.members.length} members · {expenses.length} expenses</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(!showAddMember)}>
            <UserPlus size={14} /> Add Member
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowSettle(true)} disabled={balances.debts.length === 0}>
            <CheckCircle size={14} /> Settle Up
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowShare(true)}>
            <Share2 size={14} /> Invite
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddExpense(true)}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* ===== MOBILE HEADER ===== */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-ghost btn-icon" style={{ padding: 6 }} onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {GROUP_EMOJIS[group.category] || "👥"}
          </div>
          <div>
            <div className="mobile-header-title">{group.name}</div>
            <div className="mobile-header-sub">{group.members.length} members</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-outline btn-sm" style={{ padding: "6px 10px" }} onClick={() => setShowShare(true)}>
            <Share2 size={14} />
          </button>
          <button className="btn btn-outline btn-sm" style={{ padding: "6px 10px" }} onClick={() => setShowSettle(true)} disabled={balances.debts.length === 0}>
            <CheckCircle size={14} />
          </button>
          <button className="btn btn-primary btn-sm" style={{ padding: "6px 10px" }} onClick={() => setShowAddExpense(true)}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="page-body">

        {/* Add Member Inline */}
        {showAddMember && (
          <div className="card mb-3" style={{ padding: "14px 16px" }}>
            <form onSubmit={handleAddMember} style={{ display: "flex", gap: 8 }}>
              <input className="form-input" placeholder="New member name..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} autoFocus />
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddMember(false)}>✕</button>
            </form>
          </div>
        )}

        {/* Mobile: Add member button row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }} className="mobile-only-flex">
          <button className="btn btn-outline btn-sm w-full" style={{ justifyContent: "center" }} onClick={() => setShowAddMember(!showAddMember)}>
            <UserPlus size={14} /> Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-icon blue"><Receipt size={18} /></div>
            <div>
              <div className="stat-label">Total</div>
              <div className="stat-value neutral" style={{ fontSize: 16 }}>{formatCurrency(totalExpenses)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><BarChart2 size={18} /></div>
            <div>
              <div className="stat-label">Expenses</div>
              <div className="stat-value neutral">{expenses.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><CheckCircle size={18} /></div>
            <div>
              <div className="stat-label">Debts</div>
              <div className="stat-value neutral">{balances.debts.length}</div>
            </div>
          </div>
        </div>

        {/* ===== WHO OWES WHOM (Mobile prominent) ===== */}
        {balances.debts.length > 0 && (
          <div className="card mb-3">
            <div className="card-header" style={{ paddingBottom: 12 }}>
              <span className="card-title">💸 Who Owes Whom</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSettle(true)}>
                Settle Up
              </button>
            </div>
            <div className="card-body">
              <div className="balance-list">
                {balances.debts.map((d, i) => (
                  <div key={i} className="balance-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: getGroupColor(d.from), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                        {d.from.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700 }}>{d.from}</span>
                      <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: getGroupColor(d.to), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                        {d.to.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700 }}>{d.to}</span>
                    </div>
                    <span className="amount">{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {balances.debts.length === 0 && expenses.length > 0 && (
          <div className="card mb-3" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>All settled up!</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No outstanding debts</div>
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="detail-grid">

          {/* LEFT — Expenses / Settlements */}
          <div>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === "expenses" ? "active" : ""}`} onClick={() => setActiveTab("expenses")}>
                <Receipt size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Expenses ({expenses.length})
              </button>
              <button className={`tab-btn ${activeTab === "settlements" ? "active" : ""}`} onClick={() => setActiveTab("settlements")}>
                <Clock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />Settlements ({settlements.length})
              </button>
            </div>

            {activeTab === "expenses" && (
              <div className="card">
                {expenses.length === 0 ? (
                  <div className="empty-state">
                    <Receipt size={36} />
                    <h3>No expenses yet</h3>
                    <p>Add the first expense for this group</p>
                    <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowAddExpense(true)}>
                      <Plus size={13} /> Add Expense
                    </button>
                  </div>
                ) : (
                  <div className="expense-list">
                    {expenses.map((exp) => (
                      <div key={exp._id} className="expense-item">
                        <div className="expense-icon">{CATEGORY_EMOJIS[exp.category] || "📝"}</div>
                        <div className="expense-info">
                          <div className="expense-desc">{exp.description}</div>
                          <div className="expense-meta">
                            Paid by <strong>{exp.paidBy}</strong> · {formatDate(exp.date)}
                          </div>
                          <div className="splits-row">
                            {exp.splits?.map((s) => (
                              <span key={s.memberName} className="split-pill">{s.memberName}: {formatCurrency(s.amount)}</span>
                            ))}
                          </div>
                        </div>
                        <div className="expense-amounts">
                          <div className="expense-total">{formatCurrency(exp.amount)}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>{exp.splitType}</div>
                        </div>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteExpense(exp._id)}>
                          <Trash2 size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settlements" && (
              <div className="card">
                {settlements.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle size={36} />
                    <h3>No settlements yet</h3>
                    <p>Settle up debts between members</p>
                  </div>
                ) : (
                  <div>
                    {settlements.map((s) => (
                      <div key={s._id} className="settlement-item">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: getGroupColor(s.from), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>{s.from.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{s.from}</span>
                          <ArrowRight size={13} style={{ color: "var(--text-muted)" }} />
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: getGroupColor(s.to), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>{s.to.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{s.to}</span>
                          {s.notes && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>· {s.notes}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 700, color: "var(--success)", fontSize: 14 }}>{formatCurrency(s.amount)}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(s.date)}</div>
                          </div>
                          <button className="btn btn-ghost btn-icon" onClick={() => handleDeleteSettlement(s._id)}>
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Summary & Members (desktop sidebar) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Member Summary */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Member Summary</span>
              </div>
              <div className="card-body">
                {group.members.map((m) => {
                  const net = balances.summary[m.name] || 0
                  return (
                    <div key={m._id} className="member-balance-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: getGroupColor(m.name), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 14, color: net > 0 ? "var(--success)" : net < 0 ? "var(--danger)" : "var(--text-muted)" }}>
                        {net > 0 ? "+" : ""}{formatCurrency(net)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Members */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Members</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge badge-gray">{group.members.length}</span>
                  <button className="btn btn-ghost btn-icon" title="Add member" onClick={() => setShowAddMember(true)}>
                    <UserPlus size={15} style={{ color: "var(--primary)" }} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                {group.members.map((m) => (
                  <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: getGroupColor(m.name), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal group={group} onClose={() => setShowAddExpense(false)} onAdded={handleExpenseAdded} />
      )}
      {showSettle && (
        <SettleUpModal group={group} debts={balances.debts} onClose={() => setShowSettle(false)} onSettled={handleSettled} />
      )}
      {showShare && (
        <ShareModal
          group={group}
          onClose={() => setShowShare(false)}
          onCodeRegenerated={(code) => setGroup((prev) => ({ ...prev, shareCode: code }))}
        />
      )}
    </>
  )
}