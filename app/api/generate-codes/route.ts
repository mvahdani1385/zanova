import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"
import { Code } from "../../../src/entities/Code"
import QRCode from "qrcode"
import { Like, Between } from "typeorm"

// تنظیمات دامنه (بعداً از دیتابیس می‌خونیم)
let currentDomain = "http://localhost:3000"

// تابع دریافت دامنه فعلی
async function getCurrentDomain() {
    // می‌تونی از یک فایل یا دیتابیس بخونی
    // فعلاً از متغیر محیطی یا فایل settings استفاده می‌کنیم
    return process.env.BASE_URL || "http://192.168.230.13:3000"
}

// تابع تولید QR Code
async function generateQRCode(code: string, domain: string): Promise<string> {
    const url = `${domain}/code/${code}`
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        return qrCodeDataUrl
    } catch (error) {
        console.error("خطا در تولید QR:", error)
        return ""
    }
}

// تابع تولید کد تصادفی (همون قبلی)
function generateRandomCode(length: number, type: string): string {
    let characters = ""
    switch (type) {
        case "numbers":
            characters = "0123456789"
            break
        case "letters":
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            break
        case "alphanumeric":
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            break
        case "mixed":
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
            break
        default:
            characters = "0123456789"
    }
    let result = ""
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

// تابع محاسبه ترکیبات ممکن (همون قبلی)
function calculatePossibleCombinations(length: number, type: string): number {
    let poolSize = 0
    switch (type) {
        case "numbers":
            poolSize = 10
            break
        case "letters":
            poolSize = 52
            break
        case "alphanumeric":
            poolSize = 62
            break
        case "mixed":
            poolSize = 70
            break
        default:
            poolSize = 10
    }
    return Math.pow(poolSize, length)
}

// POST: تولید کدها با QR
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { codeLength, codeType, numberOfCodes, batchName } = body

        // اعتبارسنجی
        if (!codeLength || !numberOfCodes || !codeType) {
            return NextResponse.json(
                { error: "تمام فیلدها اجباری هستند" },
                { status: 400 }
            )
        }

        if (codeLength < 5 || codeLength > 20) {
            return NextResponse.json(
                { error: "طول کد باید بین 5 تا 20 رقم باشد" },
                { status: 400 }
            )
        }

        if (numberOfCodes < 1 || numberOfCodes > 100000) {
            return NextResponse.json(
                { error: "تعداد کدها باید بین 1 تا 100,000 باشد" },
                { status: 400 }
            )
        }

        // محاسبه ترکیبات ممکن
        const maxCombinations = calculatePossibleCombinations(codeLength, codeType)
        
        if (numberOfCodes > maxCombinations) {
            return NextResponse.json(
                { 
                    error: `تعداد درخواستی بیشتر از ترکیبات ممکن است! حداکثر می‌توانید ${maxCombinations.toLocaleString()} کد تولید کنید.` 
                },
                { status: 400 }
            )
        }

        // اتصال به دیتابیس
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        const batchId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9)
        
        // دریافت دامنه فعلی
        const domain = await getCurrentDomain()
        
        // تولید کدهای یکتا با QR
        const generatedCodes = new Set<string>()
        const codes: Code[] = []

        // نمایش پیشرفت
        console.log(`شروع تولید ${numberOfCodes} کد...`)

        while (generatedCodes.size < numberOfCodes) {
            const newCode = generateRandomCode(codeLength, codeType)
            if (!generatedCodes.has(newCode)) {
                generatedCodes.add(newCode)
                
                // تولید QR Code
                const qrCodeDataUrl = await generateQRCode(newCode, domain)
                
                const code = codeRepo.create({
                    code: newCode,
                    length: codeLength,
                    type: codeType,
                    batchId: batchId,
                    isUsed: false,
                    qrCode: qrCodeDataUrl
                })
                codes.push(code)
                
                // نمایش پیشرفت هر 100 کد
                if (codes.length % 100 === 0) {
                    console.log(`${codes.length} کد تولید شد...`)
                }
            }
        }

        // ذخیره در دیتابیس
        await codeRepo.save(codes)

        // ساخت فایل XML با QR Codes
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xml += `<codes>\n`
        xml += `  <info>\n`
        xml += `    <batchName>${batchName || "کدهای تولید شده"}</batchName>\n`
        xml += `    <batchId>${batchId}</batchId>\n`
        xml += `    <totalCodes>${numberOfCodes}</totalCodes>\n`
        xml += `    <codeLength>${codeLength}</codeLength>\n`
        xml += `    <codeType>${codeType}</codeType>\n`
        xml += `    <domain>${domain}</domain>\n`
        xml += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`
        xml += `  </info>\n`
        xml += `  <codesList>\n`
        
        codes.forEach((code, index) => {
            xml += `    <code index="${index + 1}">\n`
            xml += `      <value>${code.code}</value>\n`
            xml += `      <url>${domain}/code/${code.code}</url>\n`
            xml += `      <qrCode>${code.qrCode}</qrCode>\n`
            xml += `    </code>\n`
        })
        
        xml += `  </codesList>\n`
        xml += `</codes>`

        return NextResponse.json({
            success: true,
            message: `${numberOfCodes} کد با موفقیت تولید شد`,
            batchId: batchId,
            totalCodes: numberOfCodes,
            xml: xml,
            domain: domain,
            downloadUrl: `/api/download-codes?batchId=${batchId}`
        })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json(
            { error: "خطای داخلی سرور" },
            { status: 500 }
        )
    }
}
// GET: دریافت کدها با فیلتر
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "50")
        const search = searchParams.get("search") || ""
        const isUsed = searchParams.get("isUsed")
        const batchId = searchParams.get("batchId")
        const fromDate = searchParams.get("fromDate")
        const toDate = searchParams.get("toDate")

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        
        // ساخت شرط‌های جستجو
        let where: any = {}
        
        if (search) {
            where.code = Like(`%${search}%`)
        }
        
        if (isUsed !== null && isUsed !== "") {
            where.isUsed = isUsed === "true"
        }
        
        if (batchId) {
            where.batchId = batchId
        }
        
        if (fromDate && toDate) {
            where.createdAt = Between(new Date(fromDate), new Date(toDate))
        }

        // دریافت کدها با pagination
        const [codes, total] = await codeRepo.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" }
        })

        // دریافت آمار کلی
        const totalCodes = await codeRepo.count()
        const usedCodes = await codeRepo.count({ where: { isUsed: true } })
        const unusedCodes = await codeRepo.count({ where: { isUsed: false } })

        return NextResponse.json({
            codes,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            stats: {
                total: totalCodes,
                used: usedCodes,
                unused: unusedCodes
            }
        })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json({ error: "خطا در دریافت کدها" }, { status: 500 })
    }
}

// PATCH: بروزرسانی وضعیت کد (استفاده شده/نشده)
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { codeId, isUsed, usedBy } = body

        if (!codeId) {
            return NextResponse.json({ error: "آیدی کد الزامی است" }, { status: 400 })
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        
        const updateData: any = { isUsed }
        if (usedBy) {
            updateData.usedBy = usedBy
        }

        await codeRepo.update(codeId, updateData)

        return NextResponse.json({
            success: true,
            message: "وضعیت کد بروزرسانی شد"
        })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json({ error: "خطا در بروزرسانی کد" }, { status: 500 })
    }
}

// DELETE: حذف دسته کدها یا همه کدها
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const codeId = searchParams.get("codeId")
        const batchId = searchParams.get("batchId")
        const deleteAll = searchParams.get("deleteAll")

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)

        // حذف همه کدها
        if (deleteAll === "true") {
            await codeRepo.clear()
            return NextResponse.json({ 
                success: true, 
                message: "همه کدها با موفقیت حذف شدند" 
            })
        }
        
        // حذف یک دسته خاص
        if (batchId) {
            const result = await codeRepo.delete({ batchId })
            return NextResponse.json({ 
                success: true, 
                message: `${result.affected} کد با موفقیت حذف شدند`,
                deletedCount: result.affected
            })
        }
        
        // حذف یک کد خاص
        if (codeId) {
            await codeRepo.delete(codeId)
            return NextResponse.json({ 
                success: true, 
                message: "کد با موفقیت حذف شد" 
            })
        }
        
        return NextResponse.json({ 
            error: "آیدی کد، batchId یا deleteAll الزامی است" 
        }, { status: 400 })

    } catch (error) {
        console.error("خطا:", error)
        return NextResponse.json({ error: "خطا در حذف کد" }, { status: 500 })
    }
}