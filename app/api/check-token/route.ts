import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my_super_secret_key_123456789"
)

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ message: "No token in cookie" }, { status: 401 })
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return NextResponse.json({ 
      message: "Token is valid", 
      user: payload,
      tokenFromCookie: token.substring(0, 50) + "..."
    })
  } catch (error) {
    return NextResponse.json({ message: "Token invalid", error: String(error) }, { status: 401 })
  }
}