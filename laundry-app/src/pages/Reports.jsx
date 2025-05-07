"use client"

import { useState, useEffect } from "react"
import { getAll } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Download, Calendar, Filter } from "lucide-react"

const Reports = () => {
  const { hasAccess } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [outlets, setOutlets] = useState([])
  const [products, setProducts] = useState([])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedOutlet, setSelectedOutlet] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    completedTransactions: 0,
    processingTransactions: 0,
    cancelledTransactions: 0,
  })

  useEffect(() => {
    loadData()

    // Set default date range to current month
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    setStartDate(formatDate(firstDay))
    setEndDate(formatDate(lastDay))
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, startDate, endDate, selectedOutlet, selectedStatus])

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const loadData = () => {
    const transactionsData = getAll("transactions")
    const customersData = getAll("customers")
    const outletsData = getAll("outlets")
    const productsData = getAll("products")

    setTransactions(transactionsData)
    setCustomers(customersData)
    setOutlets(outletsData)
    setProducts(productsData)
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59) // Include the end date fully

        return transactionDate >= start && transactionDate <= end
      })
    }

    // Filter by outlet
    if (selectedOutlet) {
      filtered = filtered.filter((transaction) => transaction.outletId === Number(selectedOutlet))
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((transaction) => transaction.status === selectedStatus)
    }

    setFilteredTransactions(filtered)

    // Calculate summary
    const totalRevenue = filtered.reduce((sum, transaction) => sum + transaction.total, 0)
    const averageTransaction = filtered.length > 0 ? totalRevenue / filtered.length : 0
    const completedTransactions = filtered.filter((t) => t.status === "completed").length
    const processingTransactions = filtered.filter((t) => t.status === "processing").length
    const cancelledTransactions = filtered.filter((t) => t.status === "cancelled").length

    setSummary({
      totalTransactions: filtered.length,
      totalRevenue,
      averageTransaction,
      completedTransactions,
      processingTransactions,
      cancelledTransactions,
    })
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer ? customer.name : "Unknown"
  }

  const getOutletName = (outletId) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet ? outlet.name : "Unknown"
  }

  const exportToCsv = () => {
    // Prepare CSV data
    const headers = ["ID", "Date", "Customer", "Outlet", "Status", "Items", "Total"]

    const rows = filteredTransactions.map((transaction) => [
      transaction.id,
      transaction.date,
      getCustomerName(transaction.customerId),
      getOutletName(transaction.outletId),
      transaction.status,
      transaction.items.length,
      transaction.total,
    ])

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `laundry_report_${startDate}_to_${endDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!hasAccess("reports")) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <button
          onClick={exportToCsv}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Download size={20} className="mr-2" />
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Outlets</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
          <p className="text-3xl font-bold mt-2">{summary.totalTransactions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">Rp {summary.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Transaction</h3>
          <p className="text-3xl font-bold mt-2">Rp {Math.round(summary.averageTransaction).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{summary.completedTransactions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Processing</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{summary.processingTransactions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{summary.cancelledTransactions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Transaction List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outlet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getCustomerName(transaction.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getOutletName(transaction.outletId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.items.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {transaction.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
