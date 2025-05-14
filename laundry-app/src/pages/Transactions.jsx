"use client"

import { useState, useEffect } from "react"
import { getAll, create, update } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Trash2, X, Search, ShoppingBag, Edit } from "lucide-react"

const Transactions = () => {
  const { hasAccess } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [outlets, setOutlets] = useState([])
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [currentTransaction, setCurrentTransaction] = useState({
    customerId: "",
    outletId: "",
    items: [],
    total: 0,
    status: "processing",
    date: new Date().toISOString().split("T")[0],
  })

  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [filteredProducts, setFilteredProducts] = useState([])

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Add a function to handle status edit
  const handleStatusEdit = (transaction) => {
    setEditingTransaction({ ...transaction })
    setIsStatusModalOpen(true)
  }

  // Add a function to update status
  const updateStatus = (e) => {
    e.preventDefault()
    if (editingTransaction) {
      const updatedTransaction = { ...editingTransaction }
      update("transactions", updatedTransaction.id, updatedTransaction)
      loadTransactions()
      setIsStatusModalOpen(false)
    }
  }

  useEffect(() => {
    loadTransactions()
    loadCustomers()
    loadOutlets()
    loadProducts()
  }, [])

  useEffect(() => {
    if (currentTransaction.outletId) {
      const filtered = products.filter((product) => product.outletId === Number(currentTransaction.outletId))
      setFilteredProducts(filtered)
      setSelectedProduct("")
    } else {
      setFilteredProducts([])
    }
  }, [currentTransaction.outletId, products])

  const loadTransactions = () => {
    const data = getAll("transactions")
    setTransactions(data)
  }

  const loadCustomers = () => {
    const data = getAll("customers")
    setCustomers(data)
  }

  const loadOutlets = () => {
    const data = getAll("outlets")
    setOutlets(data)
  }

  const loadProducts = () => {
    const data = getAll("products")
    setProducts(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Convert string IDs to numbers for customerId and outletId
    if (name === "customerId" || name === "outletId") {
      setCurrentTransaction({ ...currentTransaction, [name]: Number(value) })
    } else {
      setCurrentTransaction({ ...currentTransaction, [name]: value })
    }
  }

  const addItem = () => {
    if (!selectedProduct || selectedQuantity < 1) return

    const product = products.find((p) => p.id === Number(selectedProduct))
    if (!product) return

    const existingItemIndex = currentTransaction.items.findIndex((item) => item.productId === Number(selectedProduct))

    let updatedItems
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...currentTransaction.items]
      updatedItems[existingItemIndex].qty += Number(selectedQuantity)
    } else {
      // Add new item
      updatedItems = [
        ...currentTransaction.items,
        {
          productId: Number(selectedProduct),
          qty: Number(selectedQuantity),
          price: product.price,
        },
      ]
    }

    const total = calculateTotal(updatedItems)

    setCurrentTransaction({
      ...currentTransaction,
      items: updatedItems,
      total,
    })

    setSelectedProduct("")
    setSelectedQuantity(1)
  }

  const removeItem = (index) => {
    const updatedItems = [...currentTransaction.items]
    updatedItems.splice(index, 1)

    const total = calculateTotal(updatedItems)

    setCurrentTransaction({
      ...currentTransaction,
      items: updatedItems,
      total,
    })
  }

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (currentTransaction.items.length === 0) {
      alert("Please add at least one item to the transaction")
      return
    }

    create("transactions", currentTransaction)
    loadTransactions()
    closeModal()
  }

  const openModal = () => {
    setIsModalOpen(true)
    setCurrentTransaction({
      customerId: customers.length > 0 ? Number(customers[0].id) : "",
      outletId: outlets.length > 0 ? Number(outlets[0].id) : "",
      items: [],
      total: 0,
      status: "processing",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer ? customer.name : "Unknown"
  }

  const getOutletName = (outletId) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet ? outlet.name : "Unknown"
  }

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : "Unknown"
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      getCustomerName(transaction.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOutletName(transaction.outletId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.date.includes(searchTerm),
  )

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
        <button
          onClick={openModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          New Transaction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outlet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getCustomerName(transaction.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getOutletName(transaction.outletId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {transaction.total.toLocaleString()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleStatusEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Update Status"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">New Transaction</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    name="customerId"
                    value={currentTransaction.customerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
                  <select
                    name="outletId"
                    value={currentTransaction.outletId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select an outlet</option>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={currentTransaction.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={currentTransaction.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-b py-4 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Add Items</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={!currentTransaction.outletId}
                    >
                      <option value="">Select a product</option>
                      {filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - Rp {product.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-blue-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                      disabled={!selectedProduct || !currentTransaction.outletId}
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Items in Transaction</h5>

                  {currentTransaction.items.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentTransaction.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {getProductName(item.productId)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                Rp {item.price.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                Rp {(item.price * item.qty).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md bg-gray-50">
                      <ShoppingBag size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No items added yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Total: Rp {currentTransaction.total.toLocaleString()}</div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Save Transaction
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Edit Modal */}
      {isStatusModalOpen && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Update Transaction Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updateStatus} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Transaction #{editingTransaction.id} - {getCustomerName(editingTransaction.customerId)}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingTransaction.status}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
