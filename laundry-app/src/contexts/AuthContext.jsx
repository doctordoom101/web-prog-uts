"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getUserByCredentials } from "../utils/authService"

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem("currentUser"))
    if (user) {
      setCurrentUser(user)
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    const user = getUserByCredentials(username, password)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  const hasAccess = (feature) => {
    if (!currentUser) return false

    const accessMap = {
      login: ["admin", "kasir", "owner"],
      logout: ["admin", "kasir", "owner"],
      customers: ["admin", "kasir"],
      outlets: ["admin"],
      products: ["admin"],
      users: ["admin"],
      transactions: ["admin", "kasir"],
      reports: ["admin", "kasir", "owner"],
    }

    return accessMap[feature]?.includes(currentUser.role) || false
  }

  const value = {
    currentUser,
    login,
    logout,
    hasAccess,
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const ProtectedRoute = ({ children, requiredFeature }) => {
  const { currentUser, hasAccess } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { state: { from: location }, replace: true })
    } else if (requiredFeature && !hasAccess(requiredFeature)) {
      navigate("/dashboard", { replace: true })
    }
  }, [currentUser, hasAccess, location, navigate, requiredFeature])

  return children
}
