import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ 
    success: true, 
    message: "با موفقیت خارج شدید" 
  })
  
  // پاک کردن کوکی
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // منقضی شدن فوری
    path: '/'
  })
  
  return response
}