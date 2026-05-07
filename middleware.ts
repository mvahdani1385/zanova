import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my_super_secret_key_123456789"
)

// مسیرهایی که نیاز به لاگین ندارند
const publicPaths = ['/login', '/api/login', '/api/setup-owner', '/_next', '/favicon.ico']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // مسیرهای عمومی - اجازه بده بدون لاگین
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // همه مسیرهای دیگه نیاز به لاگین دارند
  // این شامل page.tsx (/) هم میشه
  
  // گرفتن توکن از Cookie
  let token = request.cookies.get('token')?.value
  
  // اگه تو کوکی نبود، از هدر Authorization بگیر
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  // بدون توکن -> برو لاگین
  if (!token) {
    console.log('🔒 No token for path:', pathname, '- redirect to login')
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
    }
    
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // اعتبارسنجی توکن
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string
    
    console.log('🔒 Token valid for:', payload.phone, 'Role:', userRole)

    // بررسی دسترسی برای مسیرهای ادمین
    if (pathname.startsWith('/admin') && userRole !== 'owner' && userRole !== 'admin') {
      console.log('🔒 Access denied - not admin')
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // بررسی دسترسی برای صفحه اصلی (اجازه به همه کاربران لاگین شده)
    // همه کاربران لاگین شده میتونن به صفحه اصلی برن
    
    // همه چی اوکی
    return NextResponse.next()
    
  } catch (error) {
    console.log('🔒 Invalid token:', error)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'جلسه نامعتبر است، دوباره وارد شوید' }, { status: 401 })
    }
    
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * مسیرهای زیر نیاز به لاگین دارند:
     * - همه صفحات (/) -> page.tsx
     * - مسیرهای admin
     * - مسیرهای dashboard
     * - API ها
     */
    '/',
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

// export const config = {
//   matcher: [],
// }