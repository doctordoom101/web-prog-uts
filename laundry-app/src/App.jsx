"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import Outlets from "./pages/Outlets"
import Products from "./pages/Products"
import Users from "./pages/Users"
import Transactions from "./pages/Transactions"
import Reports from "./pages/Reports"
import NotFound from "./pages/NotFound"
import { initializeData } from "./utils/mockData"

function App() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize mock data in localStorage if not already present
    initializeData()
    setIsInitialized(true)
  }, [])

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="outlets" element={<Outlets />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
