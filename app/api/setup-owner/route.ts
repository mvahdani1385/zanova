import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"
import { User } from "../../../src/entities/User"
import * as bcrypt from "bcrypt"

export async function GET() {
    try {
        console.log("🔄 شروع فرآیند ایجاد کاربر مالک...")

        // اتصال به دیتابیس
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
            console.log("✅ دیتابیس متصل شد")
        }

        const userRepo = AppDataSource.getRepository(User)

        // چک کردن وجود مالک
        const existingOwner = await userRepo.findOneBy({ role: "owner" })
        
        if (existingOwner) {
            console.log("⚠️ کاربر مالک قبلاً وجود دارد")
            return NextResponse.json({
                success: false,
                message: "کاربر مالک قبلاً ایجاد شده است",
                owner: {
                    name: `${existingOwner.firstName} ${existingOwner.lastName}`,
                    phone: existingOwner.phone
                }
            })
        }

        // هش کردن رمز عبور
        const hashedPassword = await bcrypt.hash("123456", 10)

        // ایجاد کاربر مالک
        const owner = userRepo.create({
            firstName: "محمد",
            lastName: "وحدانی",
            phone: "09932169402",
            password: hashedPassword,
            role: "owner",
            job: "",
            address: "",
            description: ""
        })

        await userRepo.save(owner)

        console.log("✅ کاربر مالک ایجاد شد")

        return NextResponse.json({
            success: true,
            message: "کاربر مالک با موفقیت ایجاد شد",
            owner: {
                id: owner.id,
                name: `${owner.firstName} ${owner.lastName}`,
                phone: owner.phone,
                role: owner.role
            }
        })

    } catch (error) {
        console.error("❌ خطا:", error)
        return NextResponse.json(
            { 
                error: "خطا در ایجاد کاربر مالک",
                details: error.message 
            }, 
            { status: 500 }
        )
    }
}