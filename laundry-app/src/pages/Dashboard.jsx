"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getAll } from "../utils/mockData"
import { Users, Store, Package, ShoppingBag, TrendingUp, Clock } from "lucide-react"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    customers: 0,
    outlets: 0,
    products: 0,
    transactions: 0,
    revenue: 0,
    pendingTransactions: 0,
  })

  useEffect(() => {
    const customers = getAll("customers")
    const outlets = getAll("outlets")
    const products = getAll("products")
    const transactions = getAll("transactions")

    const revenue = transactions.reduce((total, transaction) => total + transaction.total, 0)
    const pendingTransactions = transactions.filter((t) => t.status === "processing").length

    setStats({
      customers: customers.length,
      outlets: outlets.length,
      products: products.length,
      transactions: transactions.length,
      revenue,
      pendingTransactions,
    })
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.customers}
          icon={<Users size={24} className="text-blue-600" />}
          color="bg-blue-100"
        />

        {currentUser.role === "admin" && (
          <>
            <StatCard
              title="Total Outlets"
              value={stats.outlets}
              icon={<Store size={24} className="text-purple-600" />}
              color="bg-purple-100"
            />

            <StatCard
              title="Total Products"
              value={stats.products}
              icon={<Package size={24} className="text-yellow-600" />}
              color="bg-yellow-100"
            />
          </>
        )}

        {(currentUser.role === "admin" || currentUser.role === "kasir") && (
          <StatCard
            title="Total Transactions"
            value={stats.transactions}
            icon={<ShoppingBag size={24} className="text-green-600" />}
            color="bg-green-100"
          />
        )}

        <StatCard
          title="Total Revenue"
          value={`Rp ${stats.revenue.toLocaleString()}`}
          icon={<TrendingUp size={24} className="text-emerald-600" />}
          color="bg-emerald-100"
        />

        <StatCard
          title="Pending Orders"
          value={stats.pendingTransactions}
          icon={<Clock size={24} className="text-red-600" />}
          color="bg-red-100"
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentUser.role === "admin" || currentUser.role === "kasir" ? (
            <>
              <a href="/customers" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                <Users size={20} className="text-blue-600" />
                <span>Manage Customers</span>
              </a>

              <a href="/transactions" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                <ShoppingBag size={20} className="text-green-600" />
                <span>New Transaction</span>
              </a>
            </>
          ) : null}

          <a href="/reports" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
            <TrendingUp size={20} className="text-emerald-600" />
            <span>View Reports</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
