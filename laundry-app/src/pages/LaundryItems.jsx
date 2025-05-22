"use client"

import { useState, useEffect } from "react"
import { getAll, create, update, remove, generateLaundryCode } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Edit, Trash2, X, Search, Copy, Check } from "lucide-react"

const LaundryItems = () => {
  const { hasAccess } = useAuth()
  const [laundryItems, setLaundryItems] = useState([])
  const [products, setProducts] = useState([])
  const [outlets, setOutlets] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [currentLaundryItem, setCurrentLaundryItem] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    quantity: 1,
    outletId: "",
    processStatus: "proses",
    paymentStatus: "belum bayar",
    notes: "",
    createdAt: new Date().toISOString().split("T")[0],
  })
  const [editingLaundryItem, setEditingLaundryItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)
  const [newLaundryCode, setNewLaundryCode] = useState("")

  useEffect(() => {
    loadLaundryItems()
    loadProducts()
    loadOutlets()
  }, [])

  const loadLaundryItems = () => {
    const data = getAll("laundryItems")
    setLaundryItems(data)
  }

  const loadProducts = () => {
    const data = getAll("products")
    setProducts(data)
  }

  const loadOutlets = () => {
    const data = getAll("outlets")
    setOutlets(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Jika outlet berubah, filter produk dan reset serviceId
    if (name === "outletId") {
      const outletId = Number(value)
      const filteredProducts = products.filter((p) => p.outletId === outletId)
      setCurrentLaundryItem({
        ...currentLaundryItem,
        outletId: outletId,
        serviceId: filteredProducts.length > 0 ? filteredProducts[0].id : "",
      })
    } else {
      setCurrentLaundryItem({
        ...currentLaundryItem,
        [name]: name === "serviceId" || name === "outletId" || name === "quantity" ? Number(value) : value,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      update("laundryItems", currentLaundryItem.id, currentLaundryItem)
    } else {
      // Generate a unique laundry code
      const code = generateLaundryCode(currentLaundryItem.outletId)
      const newItem = create("laundryItems", { ...currentLaundryItem, code })
      setNewLaundryCode(code)
    }

    loadLaundryItems()
    if (!isEditing) {
      // Keep the modal open to show the code
      setIsEditing(true)
    } else {
      closeModal()
    }
  }

  const handleEdit = (laundryItem) => {
    setCurrentLaundryItem(laundryItem)
    setIsEditing(true)
    setIsModalOpen(true)
    setNewLaundryCode("")
  }

  const handleStatusEdit = (laundryItem) => {
    setEditingLaundryItem({ ...laundryItem })
    setIsStatusModalOpen(true)
  }

  const getProductPrice = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.price : 0
  }

  const calculateTotalPrice = (serviceId, quantity) => {
    const unitPrice = getProductPrice(serviceId)
    return unitPrice * quantity
  }

  const updateStatus = (e) => {
    e.preventDefault()
    if (editingLaundryItem) {
      // Jika status pembayaran sebelumnya sudah "sudah bayar", jangan izinkan perubahan
      const originalItem = laundryItems.find((item) => item.id === editingLaundryItem.id)
      if (originalItem.paymentStatus === "sudah bayar" && editingLaundryItem.paymentStatus !== "sudah bayar") {
        alert("Status pembayaran tidak dapat diubah setelah dibayar!")
        setEditingLaundryItem({ ...editingLaundryItem, paymentStatus: "sudah bayar" })
        return
      }

      update("laundryItems", editingLaundryItem.id, editingLaundryItem)

      // If status is completed and payment is done, create a transaction
      if (
        editingLaundryItem.processStatus === "selesai" &&
        editingLaundryItem.paymentStatus === "sudah bayar" &&
        !getTransactionByLaundryCode(editingLaundryItem.code)
      ) {
        createTransaction(editingLaundryItem)
      }

      loadLaundryItems()
      setIsStatusModalOpen(false)
    }
  }

  const getTransactionByLaundryCode = (code) => {
    const transactions = getAll("transactions")
    return transactions.find((t) => t.laundryCode === code)
  }

  const createTransaction = (laundryItem) => {
    const product = products.find((p) => p.id === laundryItem.serviceId)
    if (!product) return

    const unitPrice = product.price
    const amount = unitPrice * laundryItem.quantity

    create("transactions", {
      laundryCode: laundryItem.code,
      serviceId: laundryItem.serviceId,
      unitPrice: unitPrice,
      quantity: laundryItem.quantity,
      amount,
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this laundry item?")) {
      remove("laundryItems", id)
      loadLaundryItems()
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setIsEditing(false)
    setCurrentLaundryItem({
      customerName: "",
      customerPhone: "",
      serviceId: products.length > 0 ? products[0].id : "",
      quantity: 1,
      outletId: outlets.length > 0 ? outlets[0].id : "",
      processStatus: "proses",
      paymentStatus: "belum bayar",
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    })
    setNewLaundryCode("")
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const getProductName = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.name : "Unknown"
  }

  const getProductType = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.type : "Unknown"
  }

  const getOutletName = (outletId) => {
    const outlet = outlets.find((o) => o.id === outletId)
    return outlet ? outlet.name : "Unknown"
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }

  const filteredLaundryItems = laundryItems.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerPhone.includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(item.serviceId).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!hasAccess("laundryItems")) {
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
        <h1 className="text-2xl font-bold text-gray-800">Laundry Items</h1>
        <button
          onClick={openModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Laundry Item
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
              placeholder="Search by name, phone, code or service..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLaundryItems.length > 0 ? (
                filteredLaundryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-xs text-gray-500">{item.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <p>{getProductName(item.serviceId)}</p>
                        <p className="text-xs text-gray-500 capitalize">{getProductType(item.serviceId)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity} {getProductType(item.serviceId) === "kiloan" ? "kg" : "pcs"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {getProductPrice(item.serviceId).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {calculateTotalPrice(item.serviceId, item.quantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.processStatus === "selesai"
                            ? "bg-green-100 text-green-800"
                            : item.processStatus === "proses"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.processStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.paymentStatus === "sudah bayar"
                            ? "bg-green-100 text-green-800"
                            : item.paymentStatus === "belum bayar"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleStatusEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Update Status"
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No laundry items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Laundry Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? "Edit Laundry Item" : "Add New Laundry Item"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            {newLaundryCode && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-4 mx-6 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Laundry Code:</p>
                    <p className="text-lg font-bold text-emerald-800">{newLaundryCode}</p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Share this code with the customer to track their laundry status
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newLaundryCode)}
                    className="p-2 bg-white rounded-md border border-emerald-300 hover:bg-emerald-100"
                    title="Copy to clipboard"
                  >
                    {codeCopied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={currentLaundryItem.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={currentLaundryItem.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    name="serviceId"
                    value={currentLaundryItem.serviceId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select a service</option>
                    {products
                      .filter((product) => product.outletId === currentLaundryItem.outletId)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.type} - Rp {product.price.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="quantity"
                      value={currentLaundryItem.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      min="1"
                      step={
                        currentLaundryItem.serviceId && getProductType(currentLaundryItem.serviceId) === "kiloan"
                          ? "0.1"
                          : "1"
                      }
                    />
                    <span className="ml-2 text-gray-500">
                      {currentLaundryItem.serviceId && getProductType(currentLaundryItem.serviceId) === "kiloan"
                        ? "kg"
                        : "pcs"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
                  <select
                    name="outletId"
                    value={currentLaundryItem.outletId}
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="createdAt"
                    value={currentLaundryItem.createdAt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={currentLaundryItem.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  rows="3"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
                >
                  {newLaundryCode ? "Close" : "Cancel"}
                </button>
                {!newLaundryCode && (
                  <button
                    type="submit"
                    className="bg-emerald-600 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    {isEditing ? "Update" : "Save"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Edit Modal */}
      {isStatusModalOpen && editingLaundryItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Update Laundry Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updateStatus} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Laundry Code: <span className="font-medium">{editingLaundryItem.code}</span>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Customer: <span className="font-medium">{editingLaundryItem.customerName}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Process Status</label>
                    <select
                      value={editingLaundryItem.processStatus}
                      onChange={(e) => setEditingLaundryItem({ ...editingLaundryItem, processStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={editingLaundryItem.paymentStatus}
                      onChange={(e) => setEditingLaundryItem({ ...editingLaundryItem, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="belum bayar">Belum Bayar</option>
                      <option value="sudah bayar">Sudah Bayar</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>
                </div>
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

export default LaundryItems
