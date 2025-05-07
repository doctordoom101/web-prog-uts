// Authentication service

export const getUserByCredentials = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || []
    return users.find((user) => user.username === username && user.password === password)
  }
  
  export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("currentUser"))
  }
  