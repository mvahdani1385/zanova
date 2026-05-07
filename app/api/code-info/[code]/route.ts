import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../../src/data-source"
import { Code } from "../../../../src/entities/Code"
import { Equal } from "typeorm"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }  // توجه: params از نوع Promise است
) {
    try {
        // ابتدا باید await کنیم تا به مقدار دسترسی پیدا کنیم
        const { code } = await params  // این خط مهمه
        
        console.log("🔍 GET - Searching for EXACT code:", code)
        console.log("🔍 GET - Code length:", code.length)
        console.log("🔍 GET - Code type:", typeof code)

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        
        // جستجوی دقیق
        const codeData = await codeRepo.findOne({
            where: { code: Equal(code) }
        })

        console.log("🔍 GET - Query result:", codeData ? codeData.code : "NOT FOUND")

        if (!codeData) {
            return NextResponse.json(
                { error: "کد نامعتبر است" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            code: {
                id: codeData.id,
                code: codeData.code,
                isUsed: codeData.isUsed,
                userFirstName: codeData.userFirstName,
                userLastName: codeData.userLastName,
                userPhone: codeData.userPhone,
                userDescription: codeData.userDescription
            }
        })

    } catch (error) {
        console.error("❌ GET Error:", error)
        return NextResponse.json(
            { error: "خطای داخلی سرور" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ code: string }> }  // توجه: params از نوع Promise است
) {
    try {
        // ابتدا باید await کنیم
        const { code } = await params  // این خط مهمه
        const body = await request.json()
        const { firstName, lastName, phone, description } = body

        console.log("✏️ PUT - Updating EXACT code:", code)
        console.log("✏️ PUT - Data:", { firstName, lastName, phone, description })

        if (!firstName || !lastName || !phone) {
            return NextResponse.json(
                { error: "نام، نام خانوادگی و شماره تماس الزامی است" },
                { status: 400 }
            )
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        
        // جستجوی دقیق
        const codeData = await codeRepo.findOne({
            where: { code: Equal(code) }
        })
        
        if (!codeData) {
            return NextResponse.json(
                { error: "کد نامعتبر است" },
                { status: 404 }
            )
        }

        // بروزرسانی اطلاعات
        codeData.userFirstName = firstName
        codeData.userLastName = lastName
        codeData.userPhone = phone
        codeData.userDescription = description || ""
        codeData.isUsed = true
        codeData.usedBy = phone

        await codeRepo.save(codeData)

        return NextResponse.json({
            success: true,
            message: "اطلاعات با موفقیت ثبت شد",
            code: {
                id: codeData.id,
                code: codeData.code,
                isUsed: codeData.isUsed,
                userFirstName: codeData.userFirstName,
                userLastName: codeData.userLastName,
                userPhone: codeData.userPhone,
                userDescription: codeData.userDescription
            }
        })

    } catch (error) {
        console.error("❌ PUT Error:", error)
        return NextResponse.json(
            { error: "خطای داخلی سرور" },
            { status: 500 }
        )
    }
}