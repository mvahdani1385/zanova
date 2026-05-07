import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../../src/data-source"
import { Code } from "../../../../src/entities/Code"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "my_super_secret_key_123456789"
)

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        
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

        // فقط فروشنده‌ها میتونن تایید کنن
        if (payload.role !== "seller") {
            return NextResponse.json({ error: "فقط فروشنده‌ها می‌توانند کد را تایید کنند" }, { status: 403 })
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        const codeData = await codeRepo.findOneBy({ code })

        if (!codeData) {
            return NextResponse.json({ error: "کد نامعتبر است" }, { status: 404 })
        }

        if (codeData.isUsed) {
            return NextResponse.json({ error: "این کد قبلاً استفاده شده است" }, { status: 400 })
        }

        // بروزرسانی کد به عنوان استفاده شده
        codeData.isUsed = true
        codeData.usedBy = codeData.userPhone || payload.phone
        codeData.confirmedBySellerId = payload.id
        codeData.confirmedBySellerName = `${payload.firstName} ${payload.lastName}`
        codeData.confirmedAt = new Date()

        await codeRepo.save(codeData)

        return NextResponse.json({
            success: true,
            message: "کد با موفقیت تایید شد",
            code: {
                id: codeData.id,
                code: codeData.code,
                isUsed: codeData.isUsed,
                userFirstName: codeData.userFirstName,
                userLastName: codeData.userLastName,
                userPhone: codeData.userPhone,
                confirmedBySellerName: codeData.confirmedBySellerName,
                confirmedAt: codeData.confirmedAt
            }
        })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        
        // دریافت توکن از هدر
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        
        let payload: any
        try {
            const result = await jwtVerify(token, JWT_SECRET)
            payload = result.payload
        } catch (error) {
            return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 })
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        const codeData = await codeRepo.findOneBy({ code })

        if (!codeData) {
            return NextResponse.json({ error: "کد نامعتبر است" }, { status: 404 })
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
                userDescription: codeData.userDescription,
                confirmedBySellerName: codeData.confirmedBySellerName,
                confirmedAt: codeData.confirmedAt
            }
        })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
    }
}