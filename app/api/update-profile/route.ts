import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"
import { User } from "../../../src/entities/User"
import * as bcrypt from "bcrypt"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my_super_secret_key_123456789"
)

export async function PUT(request: Request) {
  try {
    // دریافت توکن از هدر
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    
    //验证 توکن
    let payload: any
    try {
      const result = await jwtVerify(token, JWT_SECRET)
      payload = result.payload
    } catch (error) {
      return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, job, address, description, password } = body

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: payload.id })

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    // بروزرسانی اطلاعات
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (job !== undefined) user.job = job
    if (address !== undefined) user.address = address
    if (description !== undefined) user.description = description
    
    // اگر رمز عبور جدید داده شده
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10)
    }

    await userRepo.save(user)

    // حذف رمز از خروجی
    const { password: _, ...userWithoutPassword } = user

    // ایجاد توکن جدید با اطلاعات جدید
    const newToken = await new SignJWT({ 
        id: user.id, 
        phone: user.phone, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    return NextResponse.json({
      success: true,
      message: "اطلاعات با موفقیت بروزرسانی شد",
      user: userWithoutPassword,
      token: newToken
    })

  } catch (error) {
    console.error("خطا:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}