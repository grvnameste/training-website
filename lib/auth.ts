export interface User {
  name: string
  email: string
  password: string
  role: 'admin' | 'teacher' | 'student'
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('lms_current_user')
  return user ? JSON.parse(user) : null
}

export function logout() {
  localStorage.removeItem('lms_current_user')
}

// Initialize demo users
export function initializeDemoUsers() {
  const existingUsers = localStorage.getItem('lms_users')
  if (!existingUsers) {
    const demoUsers = [
      {
        name: 'Demo Teacher',
        email: 'teacher@demo.com',
        password: 'pass123',
        role: 'teacher',
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'pass123',
        role: 'admin',
      },
    ]
    localStorage.setItem('lms_users', JSON.stringify(demoUsers))
  }
}
