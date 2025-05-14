// Initialize mock data for the application

export const initializeData = () => {
  // Check if data already exists in localStorage
  if (!localStorage.getItem("users")) {
    // Create default admin user
    const users = [
      { id: 1, name: "Admin User", username: "admin", password: "admin123", role: "admin" },
      { id: 2, name: "Kasir User", username: "kasir", password: "kasir123", role: "kasir" },
      { id: 3, name: "Owner User", username: "owner", password: "owner123", role: "owner" },
    ]
    localStorage.setItem("users", JSON.stringify(users))
  }

  if (!localStorage.getItem("customers")) {
    const customers = [
      { id: 1, name: "John Doe", address: "Jl. Merdeka No. 123", phone: "08123456789" },
      { id: 2, name: "Jane Smith", address: "Jl. Pahlawan No. 456", phone: "08987654321" },
    ]
    localStorage.setItem("customers", JSON.stringify(customers))
  }

  if (!localStorage.getItem("outlets")) {
    const outlets = [
      { id: 1, name: "Laundry Central", address: "Jl. Sudirman No. 789", phone: "02112345678" },
      { id: 2, name: "Laundry Express", address: "Jl. Gatot Subroto No. 101", phone: "02187654321" },
    ]
    localStorage.setItem("outlets", JSON.stringify(outlets))
  }

  if (!localStorage.getItem("products")) {
    const products = [
      { id: 1, name: "Cuci Kering", price: 7000, outletId: 1 },
      { id: 2, name: "Cuci Setrika", price: 10000, outletId: 1 },
      { id: 3, name: "Setrika Saja", price: 5000, outletId: 1 },
      { id: 4, name: "Cuci Express", price: 15000, outletId: 2 },
    ]
    localStorage.setItem("products", JSON.stringify(products))
  }

  if (!localStorage.getItem("transactions")) {
    const transactions = [
      {
        id: 1,
        customerId: 1,
        outletId: 1,
        items: [
          { productId: 1, qty: 3, price: 7000 },
          { productId: 2, qty: 2, price: 10000 },
        ],
        total: 41000,
        status: "completed",
        date: "2023-05-15",
      },
      {
        id: 2,
        customerId: 2,
        outletId: 2,
        items: [{ productId: 4, qty: 1, price: 15000 }],
        total: 15000,
        status: "processing",
        date: "2023-05-16",
      },
    ]
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }
}

// Generic CRUD functions for localStorage
export const getAll = (entity) => {
  return JSON.parse(localStorage.getItem(entity)) || []
}

export const getById = (entity, id) => {
  const items = getAll(entity)
  return items.find((item) => item.id === id)
}

export const create = (entity, data) => {
  const items = getAll(entity)
  const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
  const newItem = { ...data, id: newId }

  localStorage.setItem(entity, JSON.stringify([...items, newItem]))
  return newItem
}

export const update = (entity, id, data) => {
  const items = getAll(entity)
  const updatedItems = items.map((item) => (item.id === id ? { ...item, ...data } : item))

  localStorage.setItem(entity, JSON.stringify(updatedItems))
  return getById(entity, id)
}

export const remove = (entity, id) => {
  const items = getAll(entity)
  const filteredItems = items.filter((item) => item.id !== id)

  localStorage.setItem(entity, JSON.stringify(filteredItems))
  return true
}
