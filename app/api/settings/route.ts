import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"

// یک جدول ساده برای تنظیمات (می‌تونی بعداً یک Entity جدا بسازی)
let settings = {
    domain: "http://localhost:3000"
}

export async function GET() {
    return NextResponse.json(settings)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        if (body.domain) {
            settings.domain = body.domain
            return NextResponse.json({ success: true, domain: settings.domain })
        }
        return NextResponse.json({ error: "دامنه ارسال نشده" }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: "خطا" }, { status: 500 })
    }
}