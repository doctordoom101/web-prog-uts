"use client"

import { Outlet, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"
import { Home, User, Package, Store, ShoppingBag, FileText, LogOut, Menu, X } from "lucide-react"

const Layout = () => {
  const { currentUser, logout, hasAccess } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!currentUser) {
    navigate("/login")
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} />, access: true },
    { name: "Laundry Items", path: "/laundry-items", icon: <Package size={20} />, access: hasAccess("laundryItems") },
    { name: "Outlets", path: "/outlets", icon: <Store size={20} />, access: hasAccess("outlets") },
    { name: "Products", path: "/products", icon: <Package size={20} />, access: hasAccess("products") },
    { name: "Users", path: "/users", icon: <User size={20} />, access: hasAccess("users") },
    { name: "Transactions", path: "/transactions", icon: <ShoppingBag size={20} />, access: hasAccess("transactions") },
    { name: "Reports", path: "/reports", icon: <FileText size={20} />, access: hasAccess("reports") },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button onClick={toggleSidebar} className="p-2 rounded-md bg-white shadow-md">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition duration-200 ease-in-out lg:relative lg:flex z-10`}
      >
        <div className="w-64 bg-white shadow-lg h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-emerald-600">Laundry App</h1>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-full">
                <User size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map(
                (item, index) =>
                  item.access && (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-600"
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ),
              )}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
