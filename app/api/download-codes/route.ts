import "reflect-metadata"
import { NextResponse } from "next/server"
import { AppDataSource } from "../../../src/data-source"
import { Code } from "../../../src/entities/Code"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const batchId = searchParams.get("batchId")

        if (!batchId) {
            return NextResponse.json({ error: "batchId الزامی است" }, { status: 400 })
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
        }

        const codeRepo = AppDataSource.getRepository(Code)
        const codes = await codeRepo.find({ where: { batchId } })

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xml += `<codes>\n`
        xml += `  <info>\n`
        xml += `    <batchId>${batchId}</batchId>\n`
        xml += `    <totalCodes>${codes.length}</totalCodes>\n`
        xml += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`
        xml += `  </info>\n`
        xml += `  <codesList>\n`
        
        codes.forEach((code, index) => {
            xml += `    <code index="${index + 1}">${code.code}</code>\n`
        })
        
        xml += `  </codesList>\n`
        xml += `</codes>`

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml",
                "Content-Disposition": `attachment; filename=codes_${batchId}.xml`
            }
        })

    } catch (error) {
        return NextResponse.json({ error: "خطا در دانلود فایل" }, { status: 500 })
    }
}