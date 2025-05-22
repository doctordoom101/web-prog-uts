"use client"

import { useState } from "react"
import { getByCode, getAll } from "../utils/mockData"
import { Search, ArrowLeft, Package } from "lucide-react"
import { Link } from "react-router-dom"

const CustomerTrack = () => {
  const [laundryCode, setLaundryCode] = useState("")
  const [laundryItem, setLaundryItem] = useState(null)
  const [error, setError] = useState("")
  const [products, setProducts] = useState(getAll("products"))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!laundryCode.trim()) {
      setError("Please enter a laundry code")
      return
    }

    const item = getByCode("laundryItems", laundryCode.trim())
    if (item) {
      setLaundryItem(item)
    } else {
      setError("Laundry item not found. Please check the code and try again.")
      setLaundryItem(null)
    }
  }

  const getProductName = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.name : "Unknown"
  }

  const getProductType = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.type : "Unknown"
  }

  const getProductPrice = (serviceId) => {
    const product = products.find((p) => p.id === serviceId)
    return product ? product.price : 0
  }

  const calculateTotalPrice = (serviceId, quantity) => {
    const unitPrice = getProductPrice(serviceId)
    return unitPrice * quantity
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "proses":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "selesai":
        return "bg-green-100 text-green-800 border-green-200"
      case "batal":
        return "bg-red-100 text-red-800 border-red-200"
      case "belum bayar":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sudah bayar":
        return "bg-green-100 text-green-800 border-green-200"
      case "refund":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Laundry</h1>
          <p className="text-gray-600">Enter your laundry code to check the status of your order</p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your laundry code (e.g., LD-001-2023)"
                    className="pl-10 pr-4 py-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={laundryCode}
                    onChange={(e) => setLaundryCode(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Track
              </button>
            </form>

            {error && (
              <div
                className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {laundryItem && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Laundry Details</h2>
                  <span className="text-sm text-gray-500">Code: {laundryItem.code}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Package size={32} className="text-emerald-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
                      <p className="text-lg font-medium">{laundryItem.customerName}</p>
                      <p className="text-sm text-gray-600">{laundryItem.customerPhone}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                      <p className="text-lg font-medium">{getProductName(laundryItem.serviceId)}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {laundryItem.quantity} {getProductType(laundryItem.serviceId) === "kiloan" ? "kg" : "pcs"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Unit Price</h3>
                      <p className="text-lg font-medium">
                        Rp {getProductPrice(laundryItem.serviceId).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Total Price</h3>
                      <p className="text-lg font-medium">
                        Rp {calculateTotalPrice(laundryItem.serviceId, laundryItem.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                      <p className="text-lg font-medium">{laundryItem.createdAt}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                      <p className="text-lg font-medium">{laundryItem.notes || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Process Status</h3>
                        <div
                          className={`px-4 py-3 rounded-lg border ${getStatusColor(
                            laundryItem.processStatus,
                          )} text-center`}
                        >
                          <p className="text-lg font-medium capitalize">{laundryItem.processStatus}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
                        <div
                          className={`px-4 py-3 rounded-lg border ${getStatusColor(
                            laundryItem.paymentStatus,
                          )} text-center`}
                        >
                          <p className="text-lg font-medium capitalize">{laundryItem.paymentStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerTrack
