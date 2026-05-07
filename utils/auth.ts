import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my_super_secret_key_123456789"
)

// تابع برای گرفتن توکن
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// تابع برای گرفتن کاربر فعلی
export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

// تابع برای بروزرسانی کاربر در localStorage
export function updateCurrentUser(user: any, token?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
    if (token) {
      localStorage.setItem('token', token)
      // بروزرسانی کوکی
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }
  }
}

// تابع برای خروج
export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (error) {
      // خطا رو نادیده بگیر
    }
    
    window.location.href = '/login'
  }
}

// تابع برای ساخت هدر با توکن
export function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}