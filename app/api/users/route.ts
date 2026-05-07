import "reflect-metadata"
import { AppDataSource } from "../../../src/data-source"
import { User } from "../../../src/entities/User"
import { NextResponse } from "next/server"
import * as bcrypt from "bcrypt"

// POST: ایجاد کاربر جدید
export async function POST(request: Request) {

  try {
    const body = await request.json()
    const { firstName, lastName, phone, job, address, password, description, role } = body

    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json(
        { error: "نام، نام خانوادگی، شماره تماس و رمز عبور اجباری هستند" },
        { status: 400 }
      )
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }



    const userRepo = AppDataSource.getRepository(User)

    if (role === "owner") {
      const existingOwner = await userRepo.findOneBy({ role: "owner" })
      if (existingOwner) {
        return NextResponse.json(
          { error: "کاربر مالک قبلاً ایجاد شده است" },
          { status: 400 }
        )
      }
    }

    // چک کردن تکراری نبودن شماره
    const existingUser = await userRepo.findOneBy({ phone })
    if (existingUser) {
      return NextResponse.json(
        { error: "این شماره تماس قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = userRepo.create({
      firstName,
      lastName,
      phone,
      job: job || "",
      address: address || "",
      password: hashedPassword,
      description: description || "",
      role: role || "seller"
    })

    await userRepo.save(newUser)

    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت ساخته شد",
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

// GET: دریافت لیست همه کاربران
export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)
    const users = await userRepo.find({
      select: ["id", "firstName", "lastName", "phone", "job", "address", "role", "createdAt", "description"]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("خطا:", error)
    return NextResponse.json({ error: "خطا در دریافت کاربران" }, { status: 500 })
  }
}

// PUT: ویرایش کاربر
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, phone, job, address, description, role, password } = body

    if (!id) {
      return NextResponse.json({ error: "آیدی کاربر الزامی است" }, { status: 400 })
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)

    const user = await userRepo.findOneBy({ id })
    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    // جلوگیری از تغییر نقش مالک
    if (user.role === "owner" && role !== "owner") {
      return NextResponse.json({ error: "نقش کاربر مالک قابل تغییر نیست" }, { status: 403 })
    }

    // بروزرسانی اطلاعات
    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.job = job || user.job
    user.address = address || user.address
    user.description = description || user.description
    user.role = role || user.role

    if (phone && phone !== user.phone) {
      const existingUser = await userRepo.findOneBy({ phone })
      if (existingUser) {
        return NextResponse.json({ error: "این شماره تماس قبلاً ثبت شده است" }, { status: 400 })
      }
      user.phone = phone
    }

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10)
    }

    await userRepo.save(user)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت ویرایش شد",
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("خطا:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}

// DELETE: حذف کاربر
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "آیدی کاربر الزامی است" }, { status: 400 })
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const userRepo = AppDataSource.getRepository(User)

    // چک کردن اینکه کاربر مالک نباشه
    const user = await userRepo.findOneBy({ id: parseInt(id) })
    if (user && user.role === "owner") {
      return NextResponse.json({ error: "امکان حذف کاربر مالک وجود ندارد" }, { status: 403 })
    }

    const result = await userRepo.delete(parseInt(id))

    if (result.affected === 0) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت حذف شد"
    })

  } catch (error) {
    console.error("خطا:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}