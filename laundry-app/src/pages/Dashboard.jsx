"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getAll } from "../utils/mockData"
import { Store, Package, ShoppingBag, TrendingUp, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    laundryItems: 0,
    outlets: 0,
    products: 0,
    transactions: 0,
    revenue: 0,
    pendingLaundry: 0,
    unpaidLaundry: 0,
  })
  const [chartData, setChartData] = useState({
    revenueByMonth: [],
    laundryByStatus: [],
    serviceDistribution: [],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const laundryItems = getAll("laundryItems")
    const outlets = getAll("outlets")
    const products = getAll("products")
    const transactions = getAll("transactions")

    const revenue = transactions.reduce((total, transaction) => total + transaction.amount, 0)
    const pendingLaundry = laundryItems.filter((item) => item.processStatus === "proses").length
    const unpaidLaundry = laundryItems.filter((item) => item.paymentStatus === "belum bayar").length

    setStats({
      laundryItems: laundryItems.length,
      outlets: outlets.length,
      products: products.length,
      transactions: transactions.length,
      revenue,
      pendingLaundry,
      unpaidLaundry,
    })

    // Prepare chart data
    prepareChartData(laundryItems, transactions, products)
  }

  const prepareChartData = (laundryItems, transactions, products) => {
    // Revenue by month
    const revenueByMonth = prepareRevenueByMonthData(transactions)

    // Laundry by status
    const laundryByStatus = [
      { name: "Proses", value: laundryItems.filter((item) => item.processStatus === "proses").length },
      { name: "Selesai", value: laundryItems.filter((item) => item.processStatus === "selesai").length },
      { name: "Batal", value: laundryItems.filter((item) => item.processStatus === "batal").length },
    ]

    // Service distribution
    const serviceDistribution = prepareServiceDistributionData(laundryItems, products)

    setChartData({
      revenueByMonth,
      laundryByStatus,
      serviceDistribution,
    })
  }

  const prepareRevenueByMonthData = (transactions) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize data for all months with 0
    const monthlyData = months.map((month) => ({ name: month, revenue: 0 }))

    // Fill in actual data
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        monthlyData[monthIndex].revenue += transaction.amount
      }
    })

    return monthlyData
  }

  const prepareServiceDistributionData = (laundryItems, products) => {
    // Count occurrences of each service
    const serviceCounts = {}

    laundryItems.forEach((item) => {
      const serviceId = item.serviceId
      if (!serviceCounts[serviceId]) {
        serviceCounts[serviceId] = 0
      }
      serviceCounts[serviceId]++
    })

    // Convert to chart data format
    return Object.keys(serviceCounts)
      .map((serviceId) => {
        const product = products.find((p) => p.id === Number(serviceId))
        return {
          name: product ? product.name : `Service ${serviceId}`,
          value: serviceCounts[serviceId],
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 services
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Laundry Items"
          value={stats.laundryItems}
          icon={<Package size={24} className="text-blue-600" />}
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

        {(currentUser.role === "admin" || currentUser.role === "petugas") && (
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
          title="Pending Laundry"
          value={stats.pendingLaundry}
          icon={<Clock size={24} className="text-orange-600" />}
          color="bg-orange-100"
        />

        <StatCard
          title="Unpaid Laundry"
          value={stats.unpaidLaundry}
          icon={<ShoppingBag size={24} className="text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Month (This Year)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.revenueByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rp ${value.toLocaleString()}`, "Revenue"]} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Laundry Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Laundry Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.laundryByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.laundryByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Services Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Top 5 Services</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.serviceDistribution}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentUser.role === "admin" || currentUser.role === "petugas" ? (
            <>
              <Link to="/laundry-items" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                <Package size={20} className="text-blue-600" />
                <span>Manage Laundry Items</span>
              </Link>

              <Link to="/transactions" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                <ShoppingBag size={20} className="text-green-600" />
                <span>View Transactions</span>
              </Link>
            </>
          ) : null}

          <Link to="/reports" className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-3">
            <TrendingUp size={20} className="text-emerald-600" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
