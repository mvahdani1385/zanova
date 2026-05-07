import "reflect-metadata"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { AppDataSource } from "../../../src/data-source"
import { User } from "../../../src/entities/User"

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123456789"

export async function GET(request: Request) {
  try {
    // دریافت توکن از هدر
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "توکن ارائه نشده است" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    //验证 توکن
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      )
    }

    // اتصال به دیتابیس
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOneBy({ id: decoded.id })

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("خطا:", error)
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    )
  }
}