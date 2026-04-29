import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, getCurrentUser } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sw_token') || null)
  const [loading, setLoading] = useState(true)

  // On mount, verify stored token
  useEffect(() => {
    if (token) {
      getCurrentUser()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('sw_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await loginUser(email, password)
    const { token: t, user: u } = res.data
    localStorage.setItem('sw_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password)
    const { token: t, user: u } = res.data
    localStorage.setItem('sw_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('sw_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
