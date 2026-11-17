const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeUsername(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function validateUsername(username: string): string | null {
  if (!username) return 'Username is required'
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be 3-32 characters using only letters, numbers, dots, underscores, or hyphens'
  }
  return null
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (new TextEncoder().encode(password).length > 72) {
    return 'Password is too long (maximum 72 bytes)'
  }
  return null
}
