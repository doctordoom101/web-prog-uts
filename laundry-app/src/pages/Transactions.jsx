"use client"

import { useState, useEffect } from "react"
import { getAll } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const Transactions = () => {
  const { hasAccess } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [laundryItems, setLaundryItems] = useState([])
  const [products, setProducts] = useState([])
  const [outlets, setOutlets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // Filtering and pagination state
  const [timeFilter, setTimeFilter] = useState("all")
  const [pageSize, setPageSize] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const transactionsData = getAll("transactions")
      const laundryItemsData = getAll("laundryItems")
      const productsData = getAll("products")
      const outletsData = getAll("outlets")

      setTransactions(transactionsData)
      setLaundryItems(laundryItemsData)
      setProducts(productsData)
      setOutlets(outletsData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const getCustomerName = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? laundryItem.customerName : "Unknown"
  }

  const getLaundryOutlet = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? getOutletName(laundryItem.outletId) : "Unknown"
  }

  const getOutletName = (outletId) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet ? outlet.name : "Unknown"
  }

  const getProductName = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.name : "Unknown"
  }

  const getProductPrice = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.price : 0
  }

  const getLaundryItemQuantity = (laundryCode) => {
    const laundryItem = laundryItems.find((item) => item.code === laundryCode)
    return laundryItem ? laundryItem.quantity : 1
  }

  // Filter transactions based on time period
  const getFilteredByTime = (data) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    switch (timeFilter) {
      case "daily":
        return data.filter((item) => {
          const itemDate = new Date(item.date)
          itemDate.setHours(0, 0, 0, 0)
          return itemDate.getTime() === today.getTime()
        })
      case "monthly":
        return data.filter((item) => {
          const itemDate = new Date(item.date)
          return itemDate >= firstDayOfMonth
        })
      case "yearly":
        return data.filter((item) => {
          const itemDate = new Date(item.date)
          return itemDate >= firstDayOfYear
        })
      case "custom":
        if (!customDateRange.startDate || !customDateRange.endDate) return data

        const startDate = new Date(customDateRange.startDate)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(customDateRange.endDate)
        endDate.setHours(23, 59, 59, 999)

        return data.filter((item) => {
          const itemDate = new Date(item.date)
          return itemDate >= startDate && itemDate <= endDate
        })
      default:
        return data
    }
  }

  // Apply all filters and search
  const getFilteredTransactions = () => {
    let filtered = [...transactions]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.laundryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getProductName(transaction.serviceId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerName(transaction.laundryCode).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply time filter
    filtered = getFilteredByTime(filtered)

    return filtered
  }

  // Get paginated data
  const getPaginatedData = (data) => {
    if (pageSize === "all") return data

    const size = Number.parseInt(pageSize)
    const startIndex = (currentPage - 1) * size
    return data.slice(startIndex, startIndex + size)
  }

  const filteredTransactions = getFilteredTransactions()
  const paginatedTransactions = getPaginatedData(filteredTransactions)

  // Calculate total pages
  const totalPages = pageSize === "all" ? 1 : Math.ceil(filteredTransactions.length / Number.parseInt(pageSize))

  if (!hasAccess("transactions")) {
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
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="text-sm text-gray-600">Showing paid laundry services only</div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by laundry code, customer, or service..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Period:</label>
                <select
                  value={timeFilter}
                  onChange={(e) => {
                    setTimeFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="daily">Today</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All</option>
                  <option value="10">10</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {timeFilter === "custom" && (
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Start Date:</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">End Date:</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
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
                    {transactions.length === 0 ? "No transactions found" : "No transactions match your search"}
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

      {transactions.length === 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No Transactions Yet</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Transactions are automatically created when laundry items are marked as "selesai" (completed) and
                  "sudah bayar" (paid).
                </p>
                <p className="mt-1">
                  Go to <strong>Laundry Items</strong> to manage laundry orders and update their status.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
