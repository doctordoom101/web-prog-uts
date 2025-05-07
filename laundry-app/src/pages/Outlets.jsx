"use client"

import { useState, useEffect } from "react"
import { getAll, create, update, remove } from "../utils/mockData"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Edit, Trash2, X, Search } from "lucide-react"

const Outlets = () => {
  const { hasAccess } = useAuth()
  const [outlets, setOutlets] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentOutlet, setCurrentOutlet] = useState({ name: "", address: "", phone: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadOutlets()
  }, [])

  const loadOutlets = () => {
    const data = getAll("outlets")
    setOutlets(data)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentOutlet({ ...currentOutlet, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      update("outlets", currentOutlet.id, currentOutlet)
    } else {
      create("outlets", currentOutlet)
    }

    loadOutlets()
    closeModal()
  }

  const handleEdit = (outlet) => {
    setCurrentOutlet(outlet)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this outlet?")) {
      remove("outlets", id)
      loadOutlets()
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setIsEditing(false)
    setCurrentOutlet({ name: "", address: "", phone: "" })
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!hasAccess("outlets")) {
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
        <h1 className="text-2xl font-bold text-gray-800">Outlets</h1>
        <button
          onClick={openModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Outlet
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
              placeholder="Search outlets..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOutlets.length > 0 ? (
                filteredOutlets.map((outlet) => (
                  <tr key={outlet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outlet.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{outlet.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outlet.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{outlet.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(outlet)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(outlet.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No outlets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outlet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">{isEditing ? "Edit Outlet" : "Add New Outlet"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentOutlet.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={currentOutlet.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={currentOutlet.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end">
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
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Outlets
