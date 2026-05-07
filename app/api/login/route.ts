import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"
import { User } from "../../../src/entities/User"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// راز امضای توکن (بعداً میتونی توی env بذاری)
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123456789"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // اعتبارسنجی
    if (!phone || !password) {
      return NextResponse.json(
        { error: "شماره تماس و رمز عبور الزامی است" },
        { status: 400 }
      )
    }

    // اتصال به دیتابیس
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)
    
    // پیدا کردن کاربر با شماره تماس
    const user = await userRepo.findOneBy({ phone })
    
    if (!user) {
      return NextResponse.json(
        { error: "شماره تماس یا رمز عبور اشتباه است" },
        { status: 401 }
      )
    }

    // بررسی رمز عبور
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "شماره تماس یا رمز عبور اشتباه است" },
        { status: 401 }
      )
    }

    // ایجاد توکن JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        phone: user.phone, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: "7d" } // توکن ۷ روز اعتبار داره
    )

    // حذف رمز عبور از خروجی
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "ورود با موفقیت انجام شد",
      user: userWithoutPassword,
      token: token
    })

  } catch (error) {
    console.error("خطا در لاگین:", error)
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    )
  }
}