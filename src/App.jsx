import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import JoinGroup from './pages/JoinGroup'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="btn-spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Join — accessible without login */}
      <Route path="/join" element={<JoinGroup />} />
      <Route path="/join/:shareCode" element={<JoinGroup />} />

      {/* Protected main app */}
      <Route path="/*" element={
        <PrivateRoute>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/group/:id" element={<GroupDetail />} />
              </Routes>
            </div>
            <BottomNav />
          </div>
        </PrivateRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontSize: '14px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: '340px' },
            success: { iconTheme: { primary: '#1cc29f', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
