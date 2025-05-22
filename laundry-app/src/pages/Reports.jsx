"use client"

import { useState, useEffect, useRef } from "react"
import { getAll } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Download, Calendar, Filter, ChevronLeft, ChevronRight, Printer } from "lucide-react"
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
  LineChart,
  Line,
} from "recharts"

const Reports = () => {
  const { hasAccess, currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [laundryItems, setLaundryItems] = useState([])
  const [outlets, setOutlets] = useState([])
  const [products, setProducts] = useState([])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedOutlet, setSelectedOutlet] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [timeFilter, setTimeFilter] = useState("monthly")
  const [pageSize, setPageSize] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    completedLaundry: 0,
    processingLaundry: 0,
    cancelledLaundry: 0,
  })
  const [chartData, setChartData] = useState({
    revenueByDay: [],
    revenueByOutlet: [],
    serviceDistribution: [],
  })

  const reportTableRef = useRef(null)

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
  }, [transactions, startDate, endDate, selectedOutlet, selectedStatus, timeFilter])

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const loadData = () => {
    const transactionsData = getAll("transactions")
    const laundryItemsData = getAll("laundryItems")
    const outletsData = getAll("outlets")
    const productsData = getAll("products")

    setTransactions(transactionsData)
    setLaundryItems(laundryItemsData)
    setOutlets(outletsData)
    setProducts(productsData)
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Apply time filter
    if (timeFilter === "daily") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        transactionDate.setHours(0, 0, 0, 0)
        return transactionDate.getTime() === today.getTime()
      })
    } else if (timeFilter === "monthly") {
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= firstDayOfMonth
      })
    } else if (timeFilter === "yearly") {
      const today = new Date()
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= firstDayOfYear
      })
    } else if (startDate && endDate) {
      // Custom date range
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
      filtered = filtered.filter((transaction) => {
        const laundryItem = laundryItems.find((item) => item.code === transaction.laundryCode)
        return laundryItem && laundryItem.outletId === Number(selectedOutlet)
      })
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((transaction) => {
        const laundryItem = laundryItems.find((item) => item.code === transaction.laundryCode)
        return laundryItem && laundryItem.processStatus === selectedStatus
      })
    }

    setFilteredTransactions(filtered)

    // Calculate summary
    // Menggunakan total transaksi untuk total keseluruhan
    const totalTransactionsCount = transactions.length
    const totalRevenueAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Untuk data yang difilter
    const filteredRevenue = filtered.reduce((sum, transaction) => sum + transaction.amount, 0)
    const averageTransaction = filtered.length > 0 ? filteredRevenue / filtered.length : 0

    // Count laundry items by status
    const completedLaundry = laundryItems.filter((item) => item.processStatus === "selesai").length
    const processingLaundry = laundryItems.filter((item) => item.processStatus === "proses").length
    const cancelledLaundry = laundryItems.filter((item) => item.processStatus === "batal").length

    setSummary({
      totalTransactions: totalTransactionsCount,
      totalRevenue: totalRevenueAmount,
      averageTransaction,
      completedLaundry,
      processingLaundry,
      cancelledLaundry,
    })

    // Prepare chart data
    prepareChartData(filtered)
  }

  const prepareChartData = (filteredTransactions) => {
    // Revenue by day (for the filtered period)
    const revenueByDay = prepareRevenueByDayData(filteredTransactions)

    // Revenue by outlet
    const revenueByOutlet = prepareRevenueByOutletData(filteredTransactions)

    // Service distribution
    const serviceDistribution = prepareServiceDistributionData(filteredTransactions)

    setChartData({
      revenueByDay,
      revenueByOutlet,
      serviceDistribution,
    })
  }

  const prepareRevenueByDayData = (transactions) => {
    // Group transactions by date
    const revenueByDate = {}

    transactions.forEach((transaction) => {
      const date = transaction.date
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0
      }
      revenueByDate[date] += transaction.amount
    })

    // Convert to array and sort by date
    return Object.keys(revenueByDate)
      .map((date) => ({ date, revenue: revenueByDate[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const prepareRevenueByOutletData = (transactions) => {
    // Group transactions by outlet
    const revenueByOutlet = {}

    transactions.forEach((transaction) => {
      const laundryItem = laundryItems.find((item) => item.code === transaction.laundryCode)
      if (laundryItem) {
        const outletId = laundryItem.outletId
        if (!revenueByOutlet[outletId]) {
          revenueByOutlet[outletId] = 0
        }
        revenueByOutlet[outletId] += transaction.amount
      }
    })

    // Convert to array with outlet names
    return Object.keys(revenueByOutlet).map((outletId) => {
      const outlet = outlets.find((o) => o.id === Number(outletId))
      return {
        name: outlet ? outlet.name : `Outlet ${outletId}`,
        revenue: revenueByOutlet[outletId],
      }
    })
  }

  const prepareServiceDistributionData = (transactions) => {
    // Group transactions by service
    const serviceCount = {}

    transactions.forEach((transaction) => {
      const serviceId = transaction.serviceId
      if (!serviceCount[serviceId]) {
        serviceCount[serviceId] = 0
      }
      serviceCount[serviceId]++
    })

    // Convert to array with service names
    return Object.keys(serviceCount).map((serviceId) => {
      const product = products.find((p) => p.id === Number(serviceId))
      return {
        name: product ? product.name : `Service ${serviceId}`,
        value: serviceCount[serviceId],
      }
    })
  }

  const getProductPrice = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.price : 0
  }

  const getProductName = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.name : "Unknown"
  }

  const getOutletName = (outletId) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet ? outlet.name : "Unknown"
  }

  const getLaundryOutlet = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? getOutletName(laundryItem.outletId) : "Unknown"
  }

  const getCustomerName = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? laundryItem.customerName : "Unknown"
  }

  const getLaundryItemQuantity = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? laundryItem.quantity : 1
  }

  const exportToCsv = () => {
    // Prepare CSV data
    const headers = [
      "ID",
      "Date",
      "Laundry Code",
      "Customer",
      "Service",
      "Unit Price",
      "Quantity",
      "Total Amount",
      "Outlet",
    ]

    const rows = filteredTransactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.laundryCode,
      getCustomerName(transaction.laundryCode),
      getProductName(transaction.serviceId),
      transaction.unitPrice || getProductPrice(transaction.serviceId),
      transaction.quantity || getLaundryItemQuantity(transaction.laundryCode),
      transaction.amount,
      getLaundryOutlet(transaction.laundryCode),
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

  const exportToPdf = () => {
    // Simpan tampilan halaman saat ini
    const originalContent = document.body.innerHTML

    // Buat tampilan cetak
    let printContent = `
      <html>
      <head>
        <title>Laundry Transactions Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #047857; margin-bottom: 10px; }
          h2 { color: #047857; margin-top: 20px; margin-bottom: 10px; }
          .header { margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
          .summary-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laundry Transactions Report</h1>
          <p>Period: ${startDate} to ${endDate}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Generated by: ${currentUser.name}</p>
        </div>
        
        <h2>Summary</h2>
        <div class="summary">
          <div class="summary-item">
            <p>Total Transactions</p>
            <h3>${summary.totalTransactions}</h3>
          </div>
          <div class="summary-item">
            <p>Total Revenue</p>
            <h3>Rp ${summary.totalRevenue.toLocaleString()}</h3>
          </div>
          <div class="summary-item">
            <p>Average Transaction</p>
            <h3>Rp ${Math.round(summary.averageTransaction).toLocaleString()}</h3>
          </div>
          <div class="summary-item">
            <p>Completed Laundry</p>
            <h3>${summary.completedLaundry}</h3>
          </div>
          <div class="summary-item">
            <p>Processing Laundry</p>
            <h3>${summary.processingLaundry}</h3>
          </div>
          <div class="summary-item">
            <p>Cancelled Laundry</p>
            <h3>${summary.cancelledLaundry}</h3>
          </div>
        </div>
        
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Laundry Code</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `

    // Tambahkan data transaksi ke tampilan cetak
    filteredTransactions.forEach((transaction) => {
      printContent += `
        <tr>
          <td>${transaction.id}</td>
          <td>${transaction.date}</td>
          <td>${transaction.laundryCode}</td>
          <td>${getCustomerName(transaction.laundryCode)}</td>
          <td>${getProductName(transaction.serviceId)}</td>
          <td>Rp ${(transaction.unitPrice || getProductPrice(transaction.serviceId)).toLocaleString()}</td>
          <td>${transaction.quantity || getLaundryItemQuantity(transaction.laundryCode)}</td>
          <td>Rp ${transaction.amount.toLocaleString()}</td>
        </tr>
      `
    })

    printContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Laundry App - All rights reserved</p>
        </div>
        
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #047857; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Print Report
        </button>
      </body>
      </html>
    `

    // Buka jendela baru untuk tampilan cetak
    const printWindow = window.open("", "_blank")
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()

    // Opsional: Cetak otomatis
    // printWindow.print();
  }

  // Get paginated data
  const getPaginatedData = (data) => {
    if (pageSize === "all") return data

    const size = Number.parseInt(pageSize)
    const startIndex = (currentPage - 1) * size
    return data.slice(startIndex, startIndex + size)
  }

  const paginatedTransactions = getPaginatedData(filteredTransactions)

  // Calculate total pages
  const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredTransactions.length / Number.parseInt(pageSize))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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
        <div className="flex space-x-2">
          <button
            onClick={exportToPdf}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Printer size={20} className="mr-2" />
            Print Report
          </button>
          <button
            onClick={exportToCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Download size={20} className="mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
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
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Show</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {timeFilter === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
          </div>
        )}
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
          <p className="text-3xl font-bold mt-2 text-green-600">{summary.completedLaundry}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Processing</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{summary.processingLaundry}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{summary.cancelledLaundry}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.revenueByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rp ${value.toLocaleString()}`, "Revenue"]} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Outlet Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Outlet</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.revenueByOutlet} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rp ${value.toLocaleString()}`, "Revenue"]} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Service Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Service Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.serviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Orders"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6" ref={reportTableRef}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Transaction List</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredTransactions.length} of {summary.totalTransactions} transactions based on current filters
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laundry Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outlet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.laundryCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCustomerName(transaction.laundryCode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getProductName(transaction.serviceId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {(transaction.unitPrice || getProductPrice(transaction.serviceId)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.quantity || getLaundryItemQuantity(transaction.laundryCode)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLaundryOutlet(transaction.laundryCode)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pageSize !== "all" && totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * Number.parseInt(pageSize) + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * Number.parseInt(pageSize), filteredTransactions.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredTransactions.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === i + 1
                          ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
