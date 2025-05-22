// Initialize mock data for the application

export const initializeData = () => {
  // Check if data already exists in localStorage
  if (!localStorage.getItem("users")) {
    // Create default admin user
    const users = [
      { id: 1, name: "Admin User", username: "admin", password: "admin123", role: "admin" },
      { id: 2, name: "Petugas Laundry", username: "petugas", password: "petugas123", role: "petugas" },
      { id: 3, name: "Owner User", username: "owner", password: "owner123", role: "owner" },
    ]
    localStorage.setItem("users", JSON.stringify(users))
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
      { id: 1, name: "Cuci Kering", price: 7000, outletId: 1, type: "kiloan" },
      { id: 2, name: "Cuci Setrika", price: 10000, outletId: 1, type: "kiloan" },
      { id: 3, name: "Setrika Saja", price: 5000, outletId: 1, type: "kiloan" },
      { id: 4, name: "Cuci Express", price: 15000, outletId: 2, type: "kiloan" },
      { id: 5, name: "Cuci Sepatu", price: 25000, outletId: 1, type: "satuan" },
      { id: 6, name: "Cuci Tas", price: 30000, outletId: 1, type: "satuan" },
    ]
    localStorage.setItem("products", JSON.stringify(products))
  }

  if (!localStorage.getItem("laundryItems")) {
    const laundryItems = [
      {
        id: 1,
        code: "LD-001-2023",
        customerName: "John Doe",
        customerPhone: "08123456789",
        serviceId: 1,
        quantity: 3,
        createdAt: "2023-05-15",
        processStatus: "selesai", // proses, batal, selesai
        paymentStatus: "sudah bayar", // belum bayar, sudah bayar, refund
        outletId: 1,
        notes: "Pakaian berwarna dipisah",
      },
      {
        id: 2,
        code: "LD-002-2023",
        customerName: "Jane Smith",
        customerPhone: "08987654321",
        serviceId: 4,
        quantity: 2,
        createdAt: "2023-05-16",
        processStatus: "proses",
        paymentStatus: "belum bayar",
        outletId: 2,
        notes: "",
      },
      {
        id: 3,
        code: "LD-003-2023",
        customerName: "Robert Johnson",
        customerPhone: "08567891234",
        serviceId: 5,
        quantity: 1,
        createdAt: "2023-05-17",
        processStatus: "proses",
        paymentStatus: "belum bayar",
        outletId: 1,
        notes: "Sepatu olahraga putih",
      },
    ]
    localStorage.setItem("laundryItems", JSON.stringify(laundryItems))
  }

  if (!localStorage.getItem("transactions")) {
    const transactions = [
      {
        id: 1,
        laundryCode: "LD-001-2023",
        serviceId: 1,
        amount: 21000,
        date: "2023-05-15",
      },
    ]
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }
}

// Generate unique laundry code
export const generateLaundryCode = (outletId) => {
  const laundryItems = getAll("laundryItems")
  const today = new Date()
  const year = today.getFullYear()

  // Count how many laundry items exist for this year
  const yearItems = laundryItems.filter((item) => item.code.includes(`-${year}`))
  const count = yearItems.length + 1

  // Format: LD-001-2023 (LD-[sequential number]-[year])
  return `LD-${count.toString().padStart(3, "0")}-${year}`
}

// Generic CRUD functions for localStorage
export const getAll = (entity) => {
  return JSON.parse(localStorage.getItem(entity)) || []
}

export const getById = (entity, id) => {
  const items = getAll(entity)
  return items.find((item) => item.id === id)
}

export const getByCode = (entity, code) => {
  const items = getAll(entity)
  return items.find((item) => item.code === code)
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
